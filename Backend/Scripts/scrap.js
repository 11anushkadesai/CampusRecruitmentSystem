const fs = require('fs');
const path = require('path');
const os = require('os');
const { Builder, By, Key, until } = require('selenium-webdriver');
require('chromedriver');
const ExcelJS = require('exceljs');

let shouldStopScraping = false;
let driverInstance = null; // Declare driverInstance globally

process.on('SIGINT', async () => {
    console.log('Received SIGINT signal. Attempting to stop scraping gracefully...');
    shouldStopScraping = true;
    if (driverInstance) {
        try {
            // Attempt to quit the driver immediately
            await driverInstance.quit();
            console.log('Selenium driver quit on SIGINT.');
        } catch (e) {
            console.error('Error quitting driver on SIGINT:', e.message);
        }
    }
    // Exit the Node.js process after a short delay
    setTimeout(() => {
        console.log('Node.js process exiting after SIGINT.');
        process.exit(0);
    }, 500); // Give 500ms for quit() to potentially finish
});

// A small, interruptible sleep function
async function interruptibleSleep(ms) {
    let elapsed = 0;
    const interval = 100; // Check every 100ms
    while (elapsed < ms && !shouldStopScraping) {
        await new Promise(resolve => setTimeout(resolve, interval));
        elapsed += interval;
    }
    if (shouldStopScraping) {
        throw new Error("Scraping stopped by user during sleep.");
    }
}

async function main() {
    if (process.argv.length !== 4) {
        console.log('Usage: node scraper.js <State> <District>');
        process.exit(1);
    }

    const STATE_NAME = process.argv[2];
    const DISTRICT_NAME = process.argv[3];
    const downloadsFolder = path.join(os.homedir(), 'Downloads');

    const safeState = STATE_NAME.replace(/\W+/g, '');
    const safeDistrict = DISTRICT_NAME.replace(/\W+/g, '');
    const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '');
    const excelFile = path.join(downloadsFolder, `${safeState}_${safeDistrict}_${timestamp}.xlsx`);

    console.log(`Scraping data for: ${STATE_NAME}, ${DISTRICT_NAME}`);
    console.log(`Saving to: ${excelFile}`);

    const workbook = new ExcelJS.Workbook();
    const worksheetName = 'Sheet1';
    let worksheet;

    if (fs.existsSync(excelFile)) {
        try {
            await workbook.xlsx.readFile(excelFile);
            worksheet = workbook.getWorksheet(worksheetName);
            if (!worksheet) {
                worksheet = workbook.addWorksheet(worksheetName);
                worksheet.columns = [
                    { header: 'File', key: 'file' }, { header: 'College Name', key: 'collegeName' },
                    { header: 'State', key: 'state' }, { header: 'District', key: 'district' },
                    { header: 'Course', key: 'course' }, { header: 'Annual Fees', key: 'annualFees' },
                    { header: 'Placement Fees', key: 'placementFees' }, { header: 'Address', key: 'address' },
                    { header: 'Phone', key: 'phone' },
                ];
            }
        } catch (error) {
            console.warn(`Could not read existing Excel file: ${error.message}. Creating a new one.`);
            worksheet = workbook.addWorksheet(worksheetName);
            worksheet.columns = [
                { header: 'File', key: 'file' }, { header: 'College Name', key: 'collegeName' },
                { header: 'State', key: 'state' }, { header: 'District', key: 'district' },
                { header: 'Course', key: 'course' }, { header: 'Annual Fees', key: 'annualFees' },
                { header: 'Placement Fees', key: 'placementFees' }, { header: 'Address', key: 'address' },
                { header: 'Phone', key: 'phone' },
            ];
        }
    } else {
        worksheet = workbook.addWorksheet(worksheetName);
        worksheet.columns = [
            { header: 'File', key: 'file' }, { header: 'College Name', key: 'collegeName' },
            { header: 'State', key: 'state' }, { header: 'District', key: 'district' },
            { header: 'Course', key: 'course' }, { header: 'Annual Fees', key: 'annualFees' },
            { header: 'Placement Fees', key: 'placementFees' }, { header: 'Address', key: 'address' },
            { header: 'Phone', key: 'phone' },
        ];
    }

    driverInstance = await new Builder().forBrowser('chrome').build();
    try {
        await driverInstance.get('https://dashboard.aishe.gov.in/hedirectory/#/institutionDirectory/universityDetails/C/ALL');
        
        // Use a shorter initial wait or poll more frequently for the body tag
        await driverInstance.wait(until.elementLocated(By.tagName('body')), 10000); // Shorter initial wait

        // Wait for loader to disappear with checks
        try {
            const loaderTimeout = 20000;
            const loaderStartTime = Date.now();
            while (Date.now() - loaderStartTime < loaderTimeout && !shouldStopScraping) {
                const loaders = await driverInstance.findElements(By.css('.loadermainbg'));
                if (loaders.length === 0 || !(await loaders[0].isDisplayed())) {
                    console.log('Loader disappeared.');
                    break;
                }
                await interruptibleSleep(500); // Check every 500ms
            }
            if (shouldStopScraping) throw new Error("Scraping stopped by user during loader wait.");
        } catch (e) {
            if (e.message.includes("Scraping stopped by user.")) throw e;
            console.log('Loader not found or did not disappear in time.');
        }

        await interruptibleSleep(1000); // Use interruptible sleep

        const clickWithJs = async el => {
            if (shouldStopScraping) throw new Error("Scraping stopped by user.");
            await driverInstance.executeScript('arguments[0].scrollIntoView();', el);
            await driverInstance.executeScript('arguments[0].click();', el);
        };

        // Select State
        try {
            const stateDropdown = await driverInstance.wait(until.elementLocated(By.id('mat-select-0')), 30000);
            await clickWithJs(stateDropdown);
            await interruptibleSleep(1000); // Use interruptible sleep
            const stateOption = await driverInstance.wait(until.elementLocated(By.xpath(`//span[contains(text(), '${STATE_NAME}')]`)), 30000);
            await clickWithJs(stateOption);
            await interruptibleSleep(2000); // Use interruptible sleep
        } catch (e) {
            if (e.message.includes("Scraping stopped by user.")) throw e;
            console.error('Error selecting State:', e);
            return; // No need for driver.quit() here, finally block handles it
        }

        // Select District
        try {
            await interruptibleSleep(5000); // Use interruptible sleep for this long wait
            const districtDropdown = await driverInstance.wait(until.elementLocated(By.id('mat-select-2')), 30000);
            await clickWithJs(districtDropdown);
            await interruptibleSleep(2000); // Use interruptible sleep
            const districtOption = await driverInstance.wait(until.elementLocated(By.xpath(`//span[contains(text(), '${DISTRICT_NAME}')]`)), 30000);
            await clickWithJs(districtOption);
            await interruptibleSleep(3000); // Use interruptible sleep
        } catch (e) {
            if (e.message.includes("Scraping stopped by user.")) throw e;
            console.error('Error selecting District:', e);
            return;
        }

        // Wait for the data table to appear
        const tableWaitStartTime = Date.now();
        const tableWaitTimeout = 30000;
        while (Date.now() - tableWaitStartTime < tableWaitTimeout && !shouldStopScraping) {
            try {
                await driverInstance.wait(until.elementLocated(By.css('mat-table')), 1000); // Shorter interval wait
                break;
            } catch (e) {
                // Ignore timeout errors, just keep waiting/checking
            }
            await interruptibleSleep(500); // Poll every 500ms
        }
        if (shouldStopScraping) throw new Error("Scraping stopped by user during table wait.");


        const uniqueEntries = new Set();
        if (worksheet.rowCount > 1) {
            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber > 1) {
                    const collegeName = row.getCell('collegeName').value;
                    if (collegeName) {
                        uniqueEntries.add(collegeName);
                    }
                }
            });
        }

        while (true) {
            if (shouldStopScraping) {
                console.log("Stopping scraping loop due to user request.");
                break;
            }
            try {
                let dataToAppend = [];
                // Use a short, responsive wait for rows to be present
                const rows = await driverInstance.findElements(By.css('mat-row'));

                if (rows.length === 0) {
                    console.log("No more rows found on the current page.");
                    break;
                }

                for (let row of rows) {
                    if (shouldStopScraping) break;
                    const cols = await row.findElements(By.css('mat-cell'));
                    if (cols.length >= 4) {
                        const collegeName = (await cols[1].getText()).trim();
                        const state = (await cols[2].getText()).trim();
                        const district = (await cols[3].getText()).trim();

                        if (!uniqueEntries.has(collegeName)) {
                            uniqueEntries.add(collegeName);
                            dataToAppend.push({
                                file: path.basename(excelFile), collegeName, state, district,
                                course: '', annualFees: '', placementFees: '', address: '', phone: '',
                            });
                        }
                    }
                }

                if (dataToAppend.length > 0) {
                    console.log(`${dataToAppend.length} new colleges scraped on this page.`);
                    dataToAppend.forEach(row => worksheet.addRow(row));
                    if (shouldStopScraping) break;
                    await workbook.xlsx.writeFile(excelFile);
                    console.log(`Data for ${dataToAppend.length} colleges saved to ${excelFile}`);
                } else {
                    console.log("No new colleges found on this page.");
                    break;
                }

                const nextButtons = await driverInstance.findElements(By.css('button.mat-mdc-paginator-navigation-next'));
                const hasNext = nextButtons.length &&
                                !(await nextButtons[0].getAttribute('class')).includes('mat-paginator-navigation-disabled');

                if (hasNext) {
                    await clickWithJs(nextButtons[0]);
                    console.log('Moving to the next page...');
                    await interruptibleSleep(3000); // Use interruptible sleep
                } else {
                    console.log('No more pages to navigate.');
                    break;
                }

            } catch (err) {
                if (err.message.includes("Scraping stopped by user.")) {
                    console.log("Scraping gracefully stopped.");
                    break;
                }
                if (err.name === 'StaleElementReferenceError') {
                    console.log('Stale element. Retrying current page...');
                    await interruptibleSleep(2000); // Use interruptible sleep
                    continue;
                }
                console.error('Unexpected error during scraping loop:', err);
                break;
            }
        }

        // --- Google Maps Details Enhancement ---
        console.log('\nStarting Google Maps details enhancement...');
        const getCollegeDetails = async collegeName => {
            if (shouldStopScraping) throw new Error("Scraping stopped by user.");
            console.log(`Getting details for: ${collegeName}`);
            try {
                // Navigate directly to Google Maps, not googleusercontent, it's safer
                await driverInstance.get('https://www.google.com/maps');
                if (shouldStopScraping) throw new Error("Scraping stopped by user.");
                
                // Wait for search box to appear in a more interruptible way
                const searchBoxWaitStartTime = Date.now();
                const searchBoxWaitTimeout = 15000;
                let searchBox;
                while (Date.now() - searchBoxWaitStartTime < searchBoxWaitTimeout && !shouldStopScraping) {
                    try {
                        searchBox = await driverInstance.wait(until.elementLocated(By.id('searchboxinput')), 1000); // Shorter interval wait
                        break;
                    } catch (e) {
                        // Ignore timeout errors
                    }
                    await interruptibleSleep(500);
                }
                if (shouldStopScraping || !searchBox) throw new Error("Scraping stopped by user or search box not found.");

                await searchBox.clear();
                await searchBox.sendKeys(collegeName, Key.RETURN);
                if (shouldStopScraping) throw new Error("Scraping stopped by user.");

                // Wait for the result page to load, looking for a common element like a title or address
                const placeUrlWaitStartTime = Date.now();
                const placeUrlWaitTimeout = 15000;
                while (Date.now() - placeUrlWaitStartTime < placeUrlWaitTimeout && !shouldStopScraping) {
                    const currentUrl = await driverInstance.getCurrentUrl();
                    if (currentUrl.includes('place')) break;
                    await interruptibleSleep(500);
                }
                if (shouldStopScraping) throw new Error("Scraping stopped by user during place URL wait.");
                
                await interruptibleSleep(2000); // Use interruptible sleep

                let address = 'N/A';
                let phone = 'N/A';

                try {
                    const addressElement = await driverInstance.wait(until.elementLocated(By.css("button[data-item-id='address'], div[data-item-id='address']")), 5000);
                    address = (await addressElement.getAttribute('aria-label') || await addressElement.getText()).replace('Address: ', '').trim();
                } catch (e) {
                    // console.warn(`Could not find address for ${collegeName}: ${e.message}`);
                }

                try {
                    const phoneElement = await driverInstance.wait(until.elementLocated(By.css("button[data-item-id^='phone'], div[data-item-id^='phone']")), 5000);
                    phone = (await phoneElement.getAttribute('aria-label') || await phoneElement.getText()).replace('Phone: ', '').trim();
                } catch (e) {
                    // console.warn(`Could not find phone for ${collegeName}: ${e.message}`);
                }

                return { address, phone };
            } catch (googleMapsError) {
                if (googleMapsError.message.includes("Scraping stopped by user.")) throw googleMapsError;
                console.error(`Error fetching Google Maps details for "${collegeName}": ${googleMapsError.message}`);
                return { address: 'N/A', phone: 'N/A' };
            }
        };

        console.log('Updating address and phone numbers...');

        for (let i = 2; i <= worksheet.rowCount; i++) {
            if (shouldStopScraping) {
                console.log("Stopping Google Maps enhancement due to user request.");
                break;
            }
            const row = worksheet.getRow(i);
            const collegeName = row.getCell('collegeName').value;
            if (collegeName) {
                const details = await getCollegeDetails(collegeName);
                row.getCell('address').value = details.address;
                row.getCell('phone').value = details.phone;
            }
        }

        if (!shouldStopScraping) {
            await workbook.xlsx.writeFile(excelFile);
            console.log(`Final data with addresses and phone numbers written to ${excelFile}`);
        } else {
            console.log("Skipping final Excel write as scraping was stopped.");
        }

    } catch (e) {
        if (e.message.includes("Scraping stopped by user.")) {
            console.log("Scraping process terminated gracefully by user.");
        } else if (driverInstance) { // Only log Selenium errors if driver is still active
            console.error('An unexpected error occurred in main scraping process:', e);
        } else { // Handle cases where driver might have already quit (e.g., if we returned early)
            console.error('An error occurred before driver could be fully initialized or after it quit:', e);
        }
    } finally {
        if (driverInstance) {
            try {
                await driverInstance.quit();
                console.log('Browser closed.');
            } catch (e) {
                console.error('Error closing browser in finally block:', e.message);
            }
        }
    }
}

main().catch(console.error);