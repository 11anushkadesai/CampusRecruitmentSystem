const express = require("express");
const cors = require("cors");
const multer = require("multer");
const xlsx = require("xlsx");
const mysql = require("mysql2");
const { spawn } = require("child_process");
const bodyParser = require("body-parser");
const path = require("path");
const upload = multer({ dest: 'uploads/' });



const app = express();
const PORT = 5000; // Use only one port, e.g., 5000

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));



// ✅ MySQL Connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "TalentCorner_hr$",
    database: "campus_rec",
});

db.connect((err) => {
    if (err) {
        console.error("❌ MySQL Connection Error:", err);
        process.exit(1);
    } else {
        console.log("✅ Connected to MySQL Database");
    }
});


// ✅ Handle File Upload & Insert Data into MySQL
app.post("/upload", upload.single("file"), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const filePath = req.file.path;
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    

    if (sheetData.length === 0) return res.status(400).json({ error: "Empty file uploaded" });

    const insertQuery = "INSERT INTO new_table ( File,College_Name, State, District, Course,Anual_fees,Placement_fees,Ranking, Address, Phone ) VALUES ?"
    

    const values = sheetData.map((row) => [
        row["File"],
        row["College Name"],
        row["State"],
        row["District"],
        row["Course"],
        row["Anual_fees"],
        row["Placement_fees"],
        row["Ranking"],
        row["Address"],
        row["Phone"],
        
        
    ]);

    db.query(insertQuery, [values], (err, result) => {
        if (err) {
            console.error("❌ MySQL Insert Error:", err);
            return res.status(500).json({ error: "Database insert failed" });
        }
        res.json({ message: `✅ Uploaded ${result.affectedRows} records successfully` });
    });
});



// ✅ Unified Scraping Endpoint
app.post("/scrape", (req, res) => {
    const { state, city, stream } = req.body;

    // Input validation
    if (!state || !city) {
        return res.status(400).json({ error: "State and City are required." });
    }

    const isFullSearch = state && city && stream;
    const scriptToRun = isFullSearch
        ? "./Scripts/clgd_scrap.js"
        : "./Scripts/scrap.js";

    const scriptArgs = isFullSearch ? [state, city, stream] : [state, city];
    const scriptPath = path.resolve(__dirname, scriptToRun);

    console.log(`📡 Running script: ${scriptPath} with args: ${scriptArgs.join(", ")}`);

    const jsProcess = spawn("node", [scriptPath, ...scriptArgs]);

    let dataBuffer = "";
    let generatedFileName = null;

    jsProcess.stdout.on("data", (data) => {
        const output = data.toString();
        console.log(`📝 Output: ${output}`);
        dataBuffer += output;

        // Try to extract the filename if output mentions it
        const match = output.match(/Saving data to:\s*(.*\.xlsx)/);
        if (match && match[1]) {
            generatedFileName = match[1].trim();
            console.log(`✅ File detected: ${generatedFileName}`);
        }
    });

    jsProcess.stderr.on("data", (data) => {
        console.error(`❌ Error: ${data.toString()}`);
    });

    jsProcess.on("close", (code) => {
        console.log(`✅ Script exited with code ${code}`);
        res.status(200).json({
            message: "Scraping completed",
            data: dataBuffer.trim(),
            fileName: generatedFileName,
        });
    });

    jsProcess.on("error", (err) => {
        console.error(`❌ Failed to run script: ${err.message}`);
        res.status(500).json({ error: "Failed to execute script" });
    });
});


// New endpoint to stop the scraping process
app.post('/stop_scrape', (req, res) => {
    if (scrapingProcess && !scrapingProcess.killed) {
        console.log('Attempting to stop scraping process...');
        // Use process.kill() to send a signal to the child process
        // 'SIGINT' (Ctrl+C) is a common signal for graceful termination
        // 'SIGTERM' is another option. 'SIGKILL' is a forceful kill (not recommended for graceful shutdown).
        scrapingProcess.kill('SIGINT');
        res.json({ message: 'Scraping process termination signal sent.' });
    } else {
        res.status(400).json({ message: 'No active scraping process to stop.' });
    }
});


app.get('/open-file', async (req, res) => {
    const { fileName } = req.query;
  
    if (!fileName) {
      return res.status(400).json({ error: "Filename is required" });
    }
  
    const filePath = path.join(__dirname, 'Downloads', fileName); // Assuming files are in 'Downloads'
  
    try {
      await fs.access(filePath); // Check if the file exists
    } catch (err) {
      return res.status(404).json({ error: "File not found" });
    }
  
    try {
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
      res.json({ results: sheetData });
    } catch (err) {
      console.error("Error reading Excel file:", err);
      res.status(500).json({ error: "Failed to read Excel file", details: err.message });
    }
  });

app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        console.log('Received file:', req.file.originalname);

        // Example: Insert into MySQL Database (modify based on your schema)
        const query = `INSERT INTO uploads (file_name, file_path) VALUES (?, ?)`;
        const values = [req.file.originalname, req.file.path];

        db.query(query, values, (err, result) => {
            if (err) {
                console.error('Database insert failed:', err);
                return res.status(500).json({ error: 'Database insert failed', details: err.message });
            }
            res.json({ message: 'File uploaded successfully!', file: req.file.originalname });
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

// ✅ Search API - Filters by college name, location, or both
app.get('/search', (req, res) => {
    const { college, location, course } = req.query;

    let query = "SELECT * FROM new_table WHERE 1=1";
    let values = [];

    if (college) {
        query += " AND College_Name LIKE ?";
        values.push(`%${college}%`);
    }

    if (location) {
        const locations = location.split(',');
        const placeholders = locations.map(() => "(State LIKE ? OR District LIKE ?)").join(' OR ');
        query += ` AND (${placeholders})`;
        locations.forEach(loc => {
            values.push(`%${loc}%`, `%${loc}%`);
        });
    }

    if (course) {
        const courses = course.split(',');
        const placeholders = courses.map(() => "( Course LIKE ?)").join(' OR ');
        query += ` AND (${placeholders})`;
        courses.forEach(c => {
            values.push(`%${c}%`, `%${c}%`);
        });
    }

    console.log("Executing query:", query);
    console.log("With values:", values);

    db.query(query, values, (err, results) => {
        if (err) {
            console.error("❌ MySQL Search Error:", err);
            return res.status(500).json({ error: err.message });
        }
        console.log("Results:", results);
        res.json(results);
    });
});

// Example of a backend PUT request to update college
// Correcting the PUT method for MySQL
app.put('/update/:id', async (req, res) => {
    const collegeId = Number(req.params.id);

    // Check if ID is a valid number
    if (isNaN(collegeId)) {
        return res.status(400).json({ error: "Invalid college ID. It must be a number." });
    }

    const updatedData = req.body;

    const updateQuery = `
    UPDATE new_table
    SET
        College_Name = ?, 
        State = ?, 
        District = ?, 
        Course = ?, 
        Anual_fees = ?, 
        Placement_fees = ?, 
        Address = ?, 
        Phone = ?, 
        update_timestamp = ?, 
        Director_name = ?, 
        Director_number = ?, 
        Director_email = ?, 
        Placement_coor_name = ?, 
        Placement_coor_contact = ?, 
        Placement_coor_email = ?, 
        Data_updated_by_name = ?, 
        Marketing_team_name = ?, 
        Hiring = ?, 
        Hiring_from_consultant = ?, 
        Final_outcome = ?, 
        Send_proposal = ?, 
        Spoke_for_placement = ?, 
        Resume_received = ?, 
        Interview_status = ?, 
        Total_num_candidates = ?, 
        Placed_candidates = ?, 
        Total_num_students = ?, 
        Hired_students = ?, 
        Hr_team_name = ?, 
        Total_payment = ?, 
        Payment_received = ?, 
        Replacement_period = ?, 
        Term = ?, 
        Ranking = ?, 
        Date_of_Contact = ?, 
        Date_of_Next_Contact = ?, 
        Placed_on_Year = ?, 
        Placed_on_Month = ?
    WHERE Clg_ID = ?`;

    const values = [
        updatedData.College_Name,
        updatedData.State,
        updatedData.District,
        updatedData.Course,
        updatedData.Anual_fees,
        updatedData.Placement_fees,
        updatedData.Address,
        updatedData.Phone,
        new Date().toISOString().slice(0, 19).replace('T', ' '), // update_timestamp
        updatedData.Director_name,
        updatedData.Director_number,
        updatedData.Director_email,
        updatedData.Placement_coor_name,
        updatedData.Placement_coor_contact,
        updatedData.Placement_coor_email,
        updatedData.Data_updated_by_name,
        updatedData.Marketing_team_name,
        updatedData.Hiring,
        updatedData.Hiring_from_consultant,
        updatedData.Final_outcome,
        updatedData.Send_proposal,
        updatedData.Spoke_for_placement,
        updatedData.Resume_received,
        updatedData.Interview_status,
        updatedData.Total_num_candidates,
        updatedData.Placed_candidates,         // ✅ Correct order
        updatedData.Total_num_students,
        updatedData.Hired_students,
        updatedData.Hr_team_name,
        updatedData.Total_payment,
        updatedData.Payment_received,
        updatedData.Replacement_period,
        updatedData.Term,
        updatedData.Ranking,
        updatedData.Date_of_Contact,
        updatedData.Date_of_Next_Contact,
        updatedData.Placed_on_Year,
        updatedData.Placed_on_Month,
        collegeId
    ];

    db.query(updateQuery, values, (err, result) => {
        if (err) {
            console.error("❌ MySQL Update Error:", err);
            return res.status(500).json({ error: "Database update failed" });
        }
        if (result.affectedRows > 0) {
            res.json({ message: "✅ Data updated successfully" });
        } else {
            res.status(400).json({ message: "No changes made or record not found" });
        }
    });
});



// Correcting the DELETE method for MySQL
app.delete('/delete/:id', async (req, res) => {
    const collegeId = req.params.id;

    const deleteQuery = `DELETE FROM new_table WHERE Clg_ID = ?`;

    db.query(deleteQuery, [collegeId], (err, result) => {
        if (err) {
            console.error("❌ MySQL Delete Error:", err);
            return res.status(500).json({ error: "Database delete failed" });
        }
        if (result.affectedRows > 0) {
            res.json({ message: "✅ Data deleted successfully" });
        } else {
            res.status(400).json({ message: "College not found or already deleted" });
        }
    });
});



// ------------------------------------------------------------ Reports --------------------------------------------------------------------



// ------------------------------------------------------------ College reports -----------------------------------------------------------

// total number of college 

app.get('/college-count', (req, res) => {
  const { year, month, state, district, course } = req.query;

  let query = 'SELECT COUNT(*) AS total FROM new_table WHERE 1=1';
  const params = [];

  if (year) {
    query += ' AND Placed_on_Year = ?';
    params.push(year);
  }
  if (month) {
    query += ' AND Placed_on_Month = ?';
    params.push(month);
  }
  if (state) {
    query += ' AND state = ?';
    params.push(state);
  }
  if (district) {
    query += ' AND district = ?';
    params.push(district);
  }
  if (course) {
    query += ' AND course = ?';
    params.push(course);
  }

  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results[0]); // { total: <number> }
  });
});


// total candidates
app.get('/total-candidates', (req, res) => {
  const { year, month, state, district, course } = req.query;

  let query = 'SELECT SUM(Total_num_candidates) AS total_candidates FROM new_table WHERE 1=1';
  const params = [];

  if (year) {
    query += ' AND Placed_on_Year = ?';
    params.push(year);
  }
  if (month) {
    query += ' AND Placed_on_Month = ?';
    params.push(month);
  }
  if (state) {
    query += ' AND state = ?';
    params.push(state);
  }
  if (district) {
    query += ' AND district = ?';
    params.push(district);
  }
  if (course) {
    query += ' AND course = ?';
    params.push(course);
  }

  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results[0]); // { total: <number> }
  });
});


//total candidates placed 

app.get('/placed-candidates', (req, res) => {
  const { year, month, state, district, course } = req.query;

  let query = 'SELECT SUM(Placed_candidates) AS total_candidates FROM new_table WHERE 1=1';
  const params = [];

  if (year) {
    query += ' AND Placed_on_Year = ?';
    params.push(year);
  }
  if (month) {
    query += ' AND Placed_on_Month = ?';
    params.push(month);
  }
  if (state) {
    query += ' AND state = ?';
    params.push(state);
  }
  if (district) {
    query += ' AND district = ?';
    params.push(district);
  }
  if (course) {
    query += ' AND course = ?';
    params.push(course);
  }

  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results[0]); // { total: <number> }
  });
});



// total payment
app.get('/payment-received', (req, res) => {
  const { year, month, state, district, course } = req.query;

  let query = 'SELECT SUM(CAST(Total_payment AS UNSIGNED)) AS total_payment FROM new_table WHERE Payment_received = "yes"';
  const params = [];

  if (year) {
    query += ' AND Placed_on_Year = ?';
    params.push(year);
  }
  if (month) {
    query += ' AND Placed_on_Month = ?';
    params.push(month);
  }
  if (state) {
    query += ' AND state = ?';
    params.push(state);
  }
  if (district) {
    query += ' AND district = ?';
    params.push(district);
  }
  if (course) {
    query += ' AND course = ?';
    params.push(course);
  }

  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results[0]); // { total_payment: <number> }
  });
});

//college chart
app.get('/chart-data', (req, res) => {
    const { year, month, state, district, course } = req.query;

    let query = "SELECT Course, SUM(Placed_candidates) AS total_placed FROM new_table WHERE 1=1";
    let values = [];

    // Filters
    if (year) {
        query += " AND Placed_on_Year = ?";
        values.push(year);
    }
    if (month) {
        query += " AND Placed_on_Month = ?";
        values.push(month);
    }
    if (state) {
        query += " AND State = ?";
        values.push(state);
    }
    if (district) {
        query += " AND District = ?";
        values.push(district);
    }
    if (course) {
        query += " AND Course = ?";
        values.push(course);
    }

    query += " GROUP BY Course";

    db.query(query, values, (err, results) => {
        if (err) {
            console.error("❌ MySQL Chart Data Error (Placed Students):", err);
            return res.status(500).json({ error: err.message });
        }

        const chartData = results.map(row => ({
            course: row.Course,
            total_placed: row.total_placed === null ? 0 : parseInt(row.total_placed, 10) // Handle potential nulls
        }));

        res.json({ chartData });
    });
});


// ---------------------------------------------------- Marketing team reports ------------------------------------------------------------


app.get('/total-clg', (req, res) => {
  const { team, proposal, state, district } = req.query;

  let query = 'SELECT COUNT(*) AS total FROM new_table WHERE 1=1';
  const params = [];

  if (team) {
    query += ' AND Marketing_team_name = ?';
    params.push(team);
  }
  if (proposal) {
    query += ' AND Send_proposal = ?';
    params.push(proposal);
  }
  if (state) {
    query += ' AND state = ?';
    params.push(state);
  }
  if (district) {
    query += ' AND district = ?';
    params.push(district);
  }
  

  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results[0]); // { total: <number> }
  });
});

// total payment
app.get('/total-payment', (req, res) => {
  const { team, proposal, state, district } = req.query;

  let query = 'SELECT SUM(CAST(Total_payment AS UNSIGNED)) AS total_payment FROM new_table WHERE Payment_received = "yes"';
  const params = [];

  if (team) {
    query += ' AND Marketing_team_name = ?';
    params.push(team);
  }
  if (proposal) {
    query += ' AND Send_proposal = ?';
    params.push(proposal);
  }
  if (state) {
    query += ' AND state = ?';
    params.push(state);
  }
  if (district) {
    query += ' AND district = ?';
    params.push(district);
  }
  

  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results[0]); // { total_payment: <number> }
  });
});


app.get('/marketing_chart', (req, res) => {
    const {  state, district, team,sendProposal } = req.query;

    let query = "SELECT Marketing_team_name, COUNT(College_name) AS total_college FROM new_table WHERE 1=1";
    let values = [];

    // Filters
   
    if (state) {
        query += " AND State = ?";
        values.push(state);
    }
    if (district) {
        query += " AND District = ?";
        values.push(district);
    }
    if (team) {
        query += " AND Marketing_team_name = ?";
        values.push(team);
    }
    if (sendProposal) {
        query += " AND Send_proposal = ?";
        values.push(sendProposal);
    }

    query += " GROUP BY Marketing_team_name";

    db.query(query, values, (err, results) => {
        if (err) {
            console.error("❌ MySQL Chart Data Error (Marketing Team):", err);
            return res.status(500).json({ error: err.message });
        }

        const chartData = results.map(row => ({
            team: row.Marketing_team_name,
            total_college: row.total_college === null ? 0 : parseInt(row.total_college, 10) // Handle potential nulls
        }));

        res.json({ chartData });
    });
});


app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});



// ---------------------------------------------------- Hr team reports ------------------------------------------------------------

app.get('/totalcollege', (req, res) => {
  const { team, state, district } = req.query;

  let query = 'SELECT COUNT(*) AS total FROM new_table WHERE 1=1';
  const params = [];

  if (team) {
    query += ' AND Hr_team_name = ?';
    params.push(team);
  }
  if (state) {
    query += ' AND state = ?';
    params.push(state);
  }
  if (district) {
    query += ' AND district = ?';
    params.push(district);
  }
  

  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results[0]); // { total: <number> }
  });
});


 //total hired 
app.get('/totalhired', (req, res) => {
  const { team, state, district } = req.query;

  let query = 'SELECT SUM(Hired_students) AS total_hired FROM new_table WHERE 1=1';
  const params = [];

  if (team) {
    query += ' AND Hr_team_name = ?';
    params.push(team);
  }
  if (state) {
    query += ' AND state = ?';
    params.push(state);
  }
  if (district) {
    query += ' AND district = ?';
    params.push(district);
  }

  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results[0]); // { total_hired: <number> }
  });
});

// total student

app.get('/totalstudents', (req, res) => {
  const { team, state, district } = req.query;

  let query = 'SELECT SUM(Total_num_students) AS total_students FROM new_table WHERE 1=1';
  const params = [];

  if (team) {
    query += ' AND Hr_team_name = ?';
    params.push(team);
  }
  if (state) {
    query += ' AND state = ?';
    params.push(state);
  }
  if (district) {
    query += ' AND district = ?';
    params.push(district);
  }

  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results[0]); // ✅ { total_students: <number> }
  });
});


// hr chart
app.get('/hr-chart', (req, res) => {
    const { state, district, team } = req.query;

    let query = `
        SELECT Hr_team_name, SUM(Hired_students) AS total_hired
        FROM new_table
        WHERE 1=1
    `;
    let values = [];

    // Apply filters
    if (state) {
        query += " AND State = ?";
        values.push(state);
    }
    if (district) {
        query += " AND District = ?";
        values.push(district);
    }
    if (team) {
        query += " AND Hr_team_name = ?";
        values.push(team);
    }

    query += " GROUP BY Hr_team_name";

    db.query(query, values, (err, results) => {
        if (err) {
            console.error("❌ MySQL Chart Data Error (HR Team):", err);
            return res.status(500).json({ error: err.message });
        }

        const chartData = results.map(row => ({
            team: row.Hr_team_name,
            total_hired: row.total_hired ? parseInt(row.total_hired, 10) : 0
        }));

        res.json({ chartData });
    });
});



app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});


// Total scraped file
app.get('/distinct', (req, res) => {
    const query = 'SELECT DISTINCT File FROM new_table'; 
    db.query(query, (err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.json(results);
    });
  });





// Total colleges  hiring
app.get('/hiring-clg', (req, res) => {
  const query = "SELECT COUNT(*) as hiring FROM new_table WHERE Hiring = 'yes'"; 
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ total: results[0].hiring });  // return as an object with total
  });
});

// Total colleges  hiring
app.get('/hiring-clg-consultant', (req, res) => {
  const query = "SELECT COUNT(*) as hiring FROM new_table WHERE Hiring_from_consultant = 'yes'"; 
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ total: results[0].hiring });  // return as an object with total
  });
});



// ---------------------------------------------------- Dashboard reports ------------------------------------------------------------

// total data scraped 
app.get('/total-scraped', (req, res) => {
  const query = "SELECT COUNT(Distinct File ) as total_scraped FROM new_table "; 
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ total: results[0].total_scraped });  // return as an object with tota
  });
});

// last 5 row 
app.get('/last-5-rows', (req, res) => {
  const query = "SELECT * FROM new_table ORDER BY Clg_ID DESC LIMIT 5";  // change 'id' to your unique/timestamp column
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});



// Marketing team chart 
app.get('/mteam-chart', (req, res) => {
  const query = `
    SELECT Marketing_team_name, COUNT(College_name) AS total_college
    FROM new_table
    GROUP BY Marketing_team_name
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// Hr team chart 
app.get('/hrteam-chart', (req, res) => {
  const query = `
    SELECT Hr_team_name, SUM(Hired_students) AS total_hired
    FROM new_table
    GROUP BY Hr_team_name
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// Course wise college  
app.get('/course-college', (req, res) => {
  const query = `
    SELECT Course, COUNT(College_Name) AS total_College
    FROM new_table
    GROUP BY Course
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('SQL query error:', err);
      return res.status(500).json({ error: 'Database query failed' });
    }
    res.json(results);
  });
});



app.post('/add-college', (req, res) => {
    const data = req.body;

    const insertQuery = `
        INSERT INTO new_table (
            College_Name, State, District, Course,
            Anual_fees, Placement_fees, Ranking,
            Address, Phone
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
        
        SELECT * FROM new_table WHERE Clg_ID = LAST_INSERT_ID();
    `;

    const values = [
        data.College_Name,
        data.State,
        data.District,
        data.Course,
        data.Anual_fees,
        data.Placement_fees,
        data.Ranking,
        data.Address,
        data.Phone
    ];

    db.query(insertQuery, values, (err, result) => {
        if (err) {
            console.error('❌ Insert Error:', err);
            return res.status(500).json({ error: 'Insert failed' });
        }
        
        // Return the inserted college data
        const insertedCollege = result[1][0];
        res.status(200).json(insertedCollege);
    });
});



// Start the server on port 5000
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
