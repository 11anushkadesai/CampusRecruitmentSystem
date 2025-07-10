const { Builder, By, until, Key } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Setup Chrome driver with options
async function setupDriver() {
    const options = new chrome.Options();
    options.addArguments('--disable-gpu');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--disable-blink-features=AutomationControlled');
    options.addArguments('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    return new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();
}

// Main scraping function
async function scrapeColleges() {
    // Check command line arguments
    if (process.argv.length !== 5) {
        console.log('Usage: node scrape.js <state_name> <CITY_NAME> <COURSE_NAME>');
        process.exit(1);
    }

    const STATE_NAME = process.argv[2];
    const CITY_NAME = process.argv[3];
    const COURSE_NAME = process.argv[4];
    
    console.log(`Scraping data for ${STATE_NAME}, ${CITY_NAME}, ${COURSE_NAME}`);

    const driver = await setupDriver();
    
    try {
        // Open CollegeDunia URL
        await driver.get('https://collegedunia.com/india-colleges');
        await driver.sleep(8000); // Increased wait time

        // Wait for page to fully load
        await driver.wait(until.elementLocated(By.xpath("//button[@data-filter-toggle='course_tag_id']")), 30000);

        // ---------- APPLY FILTERS FIRST ----------

        // 1. Filter by Course
        console.log(' Looking for Course filter...');
        const courseButton = await driver.findElement(By.xpath("//button[@data-filter-toggle='course_tag_id']"));
        await driver.executeScript("arguments[0].scrollIntoView(true);", courseButton);
        await driver.sleep(2000);
        await courseButton.click();
        console.log(' Clicked on "Course" filter.');
        
        await driver.sleep(3000);
        const courseInput = await driver.wait(until.elementLocated(By.xpath("//input[@placeholder='FIND COURSE']")), 20000);
        await courseInput.clear();
        await courseInput.sendKeys(COURSE_NAME);
        console.log(` Typed '${COURSE_NAME}' in course search.`);
        await driver.sleep(3000);
        
        // Wait for dropdown options to appear and try multiple selectors
        console.log(' Looking for course dropdown options...');
        let courseSelected = false;
        
        // Try different selectors for the dropdown options - prioritize exact matches
        const possibleSelectors = [
            `//li[normalize-space(text()) = '${COURSE_NAME}']`, // Exact match first
            `//li[starts-with(normalize-space(text()), '${COURSE_NAME} ')]`, // Starts with course name + space
            `//li[normalize-space(text()) = '${COURSE_NAME.toUpperCase()}']`, // Exact match uppercase
            `//li[normalize-space(text()) = '${COURSE_NAME.toLowerCase()}']`, // Exact match lowercase
            `//li[contains(text(), '${COURSE_NAME}')]`, // Contains (last resort)
            `//li[contains(., '${COURSE_NAME}')]`,
            `//div[contains(@class, 'dropdown')]//li[contains(text(), '${COURSE_NAME}')]`,
            `//ul//li[contains(text(), '${COURSE_NAME}')]`
        ];
        
        for (let selector of possibleSelectors) {
            try {
                const courseOptions = await driver.findElements(By.xpath(selector));
                console.log(` Found ${courseOptions.length} options with selector: ${selector}`);
                
                if (courseOptions.length > 0) {
                    // Log all found options to help debug
                    for (let i = 0; i < Math.min(courseOptions.length, 5); i++) {
                        try {
                            const optionText = await courseOptions[i].getText();
                            console.log(`   Option ${i}: "${optionText}"`);
                        } catch (e) {
                            console.log(`   Option ${i}: Could not get text`);
                        }
                    }
                    
                    // Click the first option (should be most relevant with exact match selectors first)
                    await driver.executeScript("arguments[0].scrollIntoView(true);", courseOptions[0]);
                    await driver.sleep(1000);
                    await courseOptions[0].click();
                    
                    const selectedText = await courseOptions[0].getText();
                    console.log(` Successfully clicked on: "${selectedText}"`);
                    courseSelected = true;
                    break;
                }
            } catch (e) {
                console.log(` Selector ${selector} failed: ${e.message}`);
                continue;
            }
        }
        
        if (!courseSelected) {
            // Try clicking using JavaScript with more specific matching
            console.log(' Trying JavaScript click with exact matching...');
            try {
                const jsClick = `
                    var elements = document.querySelectorAll('li');
                    var courseText = '${COURSE_NAME}';
                    
                    // First try exact match
                    for (var i = 0; i < elements.length; i++) {
                        var elementText = elements[i].textContent.trim();
                        if (elementText === courseText || elementText === courseText.toUpperCase() || elementText === courseText.toLowerCase()) {
                            console.log('Exact match found: ' + elementText);
                            elements[i].click();
                            return 'exact: ' + elementText;
                        }
                    }
                    
                    // Then try starts with
                    for (var i = 0; i < elements.length; i++) {
                        var elementText = elements[i].textContent.trim();
                        if (elementText.startsWith(courseText + ' ') || elementText.startsWith(courseText.toUpperCase() + ' ')) {
                            console.log('Starts with match found: ' + elementText);
                            elements[i].click();
                            return 'starts: ' + elementText;
                        }
                    }
                    
                    // Finally try contains (pick the shortest match to avoid specialized courses)
                    var shortestMatch = null;
                    var shortestElement = null;
                    for (var i = 0; i < elements.length; i++) {
                        var elementText = elements[i].textContent.trim();
                        if (elementText.includes(courseText)) {
                            if (!shortestMatch || elementText.length < shortestMatch.length) {
                                shortestMatch = elementText;
                                shortestElement = elements[i];
                            }
                        }
                    }
                    
                    if (shortestElement) {
                        console.log('Shortest contains match found: ' + shortestMatch);
                        shortestElement.click();
                        return 'contains: ' + shortestMatch;
                    }
                    
                    return false;
                `;
                const result = await driver.executeScript(jsClick);
                if (result) {
                    console.log(` Successfully clicked course option with JavaScript: ${result}`);
                    courseSelected = true;
                }
            } catch (e) {
                console.log(' JavaScript click failed:', e.message);
            }
        }
        
        if (!courseSelected) {
            console.log(' Could not select course. Continuing anyway...');
        }
        
        await driver.sleep(3000);

        // 2. Filter by State
        console.log(' Looking for State filter...');
        const stateButton = await driver.wait(until.elementLocated(By.xpath("//button[@data-filter-toggle='state']")), 20000);
        await driver.executeScript("arguments[0].scrollIntoView(true);", stateButton);
        await driver.sleep(2000);
        await stateButton.click();
        console.log(' Clicked on "State" filter.');
        
        await driver.sleep(3000);
        const stateInput = await driver.wait(until.elementLocated(By.xpath("//input[@placeholder='FIND STATE']")), 20000);
        await stateInput.clear();
        await stateInput.sendKeys(STATE_NAME);
        console.log(` Typed '${STATE_NAME}' in state search.`);
        await driver.sleep(3000);
        
        // Try multiple selectors for state selection
        let stateSelected = false;
        const stateSelectors = [
            `//li[contains(text(), '${STATE_NAME}')]`,
            `//li[contains(., '${STATE_NAME}')]`,
            `//div[contains(@class, 'dropdown')]//li[contains(text(), '${STATE_NAME}')]`,
            `//ul//li[contains(text(), '${STATE_NAME}')]`
        ];
        
        for (let selector of stateSelectors) {
            try {
                const stateOptions = await driver.findElements(By.xpath(selector));
                if (stateOptions.length > 0) {
                    await driver.executeScript("arguments[0].scrollIntoView(true);", stateOptions[0]);
                    await driver.sleep(1000);
                    await stateOptions[0].click();
                    console.log(` Selected '${STATE_NAME}'.`);
                    stateSelected = true;
                    break;
                }
            } catch (e) {
                continue;
            }
        }
        
        if (!stateSelected) {
            console.log(' Could not select state. Continuing anyway...');
        }
        
        await driver.sleep(3000);

        // 3. Filter by City
        console.log(' Looking for City filter...');
        const cityButton = await driver.wait(until.elementLocated(By.xpath("//button[@data-filter-toggle='city']")), 20000);
        await driver.executeScript("arguments[0].scrollIntoView(true);", cityButton);
        await driver.sleep(2000);
        await cityButton.click();
        console.log(' Clicked on "City" filter.');
        
        await driver.sleep(3000);
        const cityInput = await driver.wait(until.elementLocated(By.xpath("//input[@placeholder='FIND CITIES']")), 20000);
        await cityInput.clear();
        await cityInput.sendKeys(CITY_NAME);
        console.log(` Typed '${CITY_NAME}' in city search.`);
        await driver.sleep(3000);
        
        // Try multiple selectors for city selection
        let citySelected = false;
        const citySelectors = [
            `//li[contains(text(), '${CITY_NAME}')]`,
            `//li[contains(., '${CITY_NAME}')]`,
            `//div[contains(@class, 'dropdown')]//li[contains(text(), '${CITY_NAME}')]`,
            `//ul//li[contains(text(), '${CITY_NAME}')]`
        ];
        
        for (let selector of citySelectors) {
            try {
                const cityOptions = await driver.findElements(By.xpath(selector));
                if (cityOptions.length > 0) {
                    await driver.executeScript("arguments[0].scrollIntoView(true);", cityOptions[0]);
                    await driver.sleep(1000);
                    await cityOptions[0].click();
                    console.log(` Selected '${CITY_NAME}'.`);
                    citySelected = true;
                    break;
                }
            } catch (e) {
                continue;
            }
        }
        
        if (!citySelected) {
            console.log(' Could not select city. Continuing anyway...');
        }

        // ---------- SCROLL TO LOAD ALL COLLEGES ----------
        console.log(' Starting to scroll and load college data...');
        let prevCount = 0;
        let scrollAttempts = 0;
        const scrollLimit = 60;
        const stableCountIterations = 5;
        let stableCountCounter = 0;

        // Wait for the results table to appear
        try {
            await driver.wait(until.elementLocated(By.xpath("//table[contains(@class,'listing-table')]")), 15000);
            console.log(' Found results table.');
        } catch (e) {
            console.log(' No results table found. Checking for "no results" message...');
            const noResults = await driver.findElements(By.xpath("//*[contains(text(), 'No colleges found') or contains(text(), 'no results')]"));
            if (noResults.length > 0) {
                console.log(' No colleges found for the given criteria.');
                return;
            }
        }

        while (scrollAttempts < scrollLimit) {
            await driver.executeScript('window.scrollTo(0, document.body.scrollHeight);');
            await driver.sleep(4000);

            const validRows = await driver.findElements(By.xpath("//table[contains(@class,'listing-table')]/tbody/tr[.//h3]"));
            const currentCount = validRows.length;

            console.log(` Loaded ${currentCount} valid rows so far...`);

            if (currentCount === prevCount) {
                stableCountCounter++;
                if (stableCountCounter >= stableCountIterations) {
                    console.log(' Reached end of the list.');
                    break;
                }
            } else {
                stableCountCounter = 0;
            }

            prevCount = currentCount;
            scrollAttempts++;
        }

        if (scrollAttempts === scrollLimit) {
            console.log(' Scroll limit reached. Stopping to avoid infinite loop.');
        }

        // ---------- SCRAPE COLLEGE DATA ----------
        const collegeData = [];
        const downloadsPath = path.join(os.homedir(), 'Downloads');
        const safeStateName = STATE_NAME.replace(/\W+/g, '');
        const safeCityName = CITY_NAME.replace(/\W+/g, '');
        const safeCourseName = COURSE_NAME.replace(/\W+/g, '');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const excelFile = path.join(downloadsPath, `${safeStateName}_${safeCityName}_${safeCourseName}_${timestamp}.xlsx`);
        const fileName = path.basename(excelFile);

        const validRows = await driver.findElements(By.xpath("//table[contains(@class,'listing-table')]/tbody/tr[.//h3]"));

        for (let row of validRows) {
            try {
                const collegeName = await row.findElement(By.xpath(".//td[2]//h3")).getText();
                
                let courseFees = 'N/A';
                try {
                    courseFees = await row.findElement(By.xpath(".//td[3]//span[contains(@class,'text-green')]")).getText();
                } catch (e) {
                    // Try alternative xpath for fees
                    try {
                        courseFees = await row.findElement(By.xpath(".//td[3]")).getText();
                    } catch (e2) {
                        courseFees = 'N/A';
                    }
                }
                
                let placement = 'N/A';
                try {
                    const placementAvg = await row.findElement(By.xpath(".//td[4]//span[@title='Average Package']/preceding-sibling::span[1]")).getText();
                    const placementHighest = await row.findElement(By.xpath(".//td[4]//span[@title='Highest Package']/preceding-sibling::span[1]")).getText();
                    placement = `Average: ${placementAvg.trim()}, Highest: ${placementHighest.trim()}`;
                } catch (e) {
                    // Try alternative approach for placement
                    try {
                        placement = await row.findElement(By.xpath(".//td[4]")).getText();
                    } catch (e2) {
                        placement = 'N/A';
                    }
                }
                
                let ranking = 'N/A';
                try {
                    ranking = await row.findElement(By.xpath(".//td[6]//span[contains(@class,'rank-span')]")).getText();
                } catch (e) {
                    try {
                        ranking = await row.findElement(By.xpath(".//td[6]")).getText();
                    } catch (e2) {
                        ranking = 'N/A';
                    }
                }

                collegeData.push({
                    'File': fileName,
                    'College Name': collegeName.trim(),
                    'Anual_fees': courseFees.trim(),
                    'Placement_fees': placement,
                    'Ranking': ranking.trim(),
                    'Course': COURSE_NAME,
                    'State': STATE_NAME,
                    'District': CITY_NAME,
                    'Address': '',
                    'Phone': ''
                });

            } catch (error) {
                console.log(` Skipping a row due to error: ${error.message}`);
                continue;
            }
        }

        // ---------- SAVE TO EXCEL ----------
        const worksheet = XLSX.utils.json_to_sheet(collegeData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Colleges');
        XLSX.writeFile(workbook, excelFile);

        console.log(` Scraping completed! Total colleges: ${collegeData.length}`);
        console.log(` Data saved to: ${excelFile}`);

        // ---------- GET COLLEGE DETAILS FROM GOOGLE MAPS ----------
        async function getCollegeDetails(collegeName) {
            console.log(`Fetching details for: ${collegeName}...`);

            await driver.get('https://www.google.com/maps');
            
            try {
                const searchBox = await driver.wait(until.elementLocated(By.id('searchboxinput')), 10000);
                await searchBox.clear();
                await searchBox.sendKeys(collegeName);
                await searchBox.sendKeys(Key.RETURN);

                await driver.wait(until.elementLocated(By.xpath('//h1')), 10000);

                let address = 'N/A';
                let phone = 'N/A';

                try {
                    const addressElements = await driver.findElements(By.css("button[data-item-id='address']"));
                    if (addressElements.length > 0) {
                        const ariaLabel = await addressElements[0].getAttribute('aria-label');
                        address = ariaLabel.replace('Address: ', '').trim();
                    }
                } catch (e) {
                    // Address not found
                }

                try {
                    const phoneElements = await driver.findElements(By.css("button[data-item-id^='phone']"));
                    if (phoneElements.length > 0) {
                        const ariaLabel = await phoneElements[0].getAttribute('aria-label');
                        phone = ariaLabel.replace('Phone: ', '').trim();
                    }
                } catch (e) {
                    // Phone not found
                }

                return { address, phone };

            } catch (error) {
                return { address: 'N/A', phone: 'N/A' };
            }
        }

        // Update Excel with addresses and phone numbers
        for (let i = 0; i < collegeData.length; i++) {
            const details = await getCollegeDetails(collegeData[i]['College Name']);
            collegeData[i]['Address'] = details.address;
            collegeData[i]['Phone'] = details.phone;
            
            // Save after each update
            const updatedWorksheet = XLSX.utils.json_to_sheet(collegeData);
            const updatedWorkbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(updatedWorkbook, updatedWorksheet, 'Colleges');
            XLSX.writeFile(updatedWorkbook, excelFile);
        }

        console.log(`Final data updated in ${excelFile}`);

    } catch (error) {
        console.error('An error occurred:', error);
    } finally {
        await driver.quit();
    }
}

// Run the scraper
scrapeColleges().catch(console.error);