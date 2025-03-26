const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const port = 3001; // Port where the server will run
const host = '0.0.0.0';  // Listen on all interfaces

// PostgreSQL connection configuration
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "FacultyAvailabilityDB",
  password: "admin123",
  port: 5432,
});

// Middleware to parse JSON request body
app.use(bodyParser.json());
app.use(cors()); // Enable CORS for all routes

app.post("/register-faculty", async (req, res) => {
  const { firstname, middle, lastname, email, password, rfid } = req.body;
  const fullName = `${firstname} ${middle} ${lastname}`.trim();

  if (!firstname || !lastname || !email || !password || !rfid) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const emailCheckQuery = `SELECT id FROM tbl_users WHERE email = $1`;
    const emailCheckResult = await pool.query(emailCheckQuery, [email]);

    if (emailCheckResult.rows.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const rfidCheckQuery = `SELECT id FROM tbl_faculty WHERE rfid = $1`;
    const rfidCheckResult = await pool.query(rfidCheckQuery, [rfid]);

    if (rfidCheckResult.rows.length > 0) {
      return res.status(400).json({ message: "RFID already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userQuery = `
      INSERT INTO tbl_users (name, email, password, role_id, status, created_at)
      VALUES ($1, $2, $3, 1, 1, NOW())
      RETURNING "id";
    `;
    const userValues = [fullName, email, hashedPassword];

    const userResult = await pool.query(userQuery, userValues);
    const userID = userResult.rows[0].id;

    const facultyQuery = `
      INSERT INTO tbl_faculty (user_id, firstname, lastname, availability, status, created_at, middle, rfid)
      VALUES ($1, $2, $3, 2, 1, NOW(), $4, $5)
      RETURNING *;
    `;
    const facultyValues = [userID, firstname, lastname, middle, rfid];

    const facultyResult = await pool.query(facultyQuery, facultyValues);
    const newFaculty = facultyResult.rows[0];

    const statusMessage = `Successfully created`;

    const notificationQuery = `
      INSERT INTO notifications (faculty_id, name, rfid, status, created_at)
      VALUES ($1, $2, $3, $4, NOW())
    `;
    await pool.query(notificationQuery, [newFaculty.id, fullName, newFaculty.rfid, statusMessage]);

    io.emit("new-faculty", {
      name: fullName,
      rfid: newFaculty.rfid,
      status: statusMessage,
      time: new Date().toLocaleString() // Use current date and time
    });

    res.json({ message: "Account created successfully", faculty: newFaculty });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error registering faculty" });
  }
});



// Faculty login endpoint
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log('Login request received:', { email, password });

  try {
    const result = await pool.query("SELECT * FROM tbl_users WHERE email = $1", [email]);
    const user = result.rows[0];
    console.log('User found:', user);

    if (!user) {
      console.log('User not found');
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('Invalid password');
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const facultyResult = await pool.query("SELECT * FROM tbl_faculty WHERE user_id = $1", [user.id]);
    const faculty = facultyResult.rows[0];
    console.log('Faculty info:', faculty);

    res.status(200).json({
      message: "Login successful",
      user_id: user.id,
      name: user.name,
      email: user.email,
      facultyInfo: faculty,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Error during login" });
  }
});

// Fetch all faculty members
app.get("/faculty", async (req, res) => {
  try {
    const facultyQuery = `  
      SELECT f.id, f.user_id, f.lastname, f.firstname, f.availability, f.status, f.created_at, f.rfid
      FROM tbl_faculty f;
    `;
    const facultyResult = await pool.query(facultyQuery);
    res.status(200).json(facultyResult.rows);
  } catch (error) {
    console.error("Error fetching faculty members:", error);
    res.status(500).json({ error: "Failed to fetch faculty members" });
  }
});

// Fetch faculty status counts
app.get("/faculty/status", async (req, res) => {
  try {
    const statusQuery = `
      SELECT 
        COUNT(*) FILTER (WHERE availability = 1) AS available,
        COUNT(*) FILTER (WHERE availability = 2) AS busy,
        COUNT(*) FILTER (WHERE availability = 0) AS offline
      FROM tbl_faculty;
    `;
    const statusResult = await pool.query(statusQuery);
    res.status(200).json(statusResult.rows[0]);
  } catch (error) {
    console.error("Error fetching faculty status counts:", error);
    res.status(500).json({ error: "Failed to fetch faculty status counts" });
  }
});

// Delete a faculty member
app.delete("/faculty/:id", async (req, res) => {
  const { id } = req.params;
  console.log(`Received request to delete user with id: ${id}`);

  try {
    // Delete related notifications first
    const deleteNotificationsQuery = `DELETE FROM notifications WHERE faculty_id = $1`;
    await pool.query(deleteNotificationsQuery, [id]);

    // Delete the faculty member
    const deleteFacultyQuery = `DELETE FROM tbl_faculty WHERE id = $1`;
    await pool.query(deleteFacultyQuery, [id]);

    // Delete the user
    const deleteUserQuery = `DELETE FROM tbl_users WHERE id = $1`;
    await pool.query(deleteUserQuery, [id]);

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// Fetch faculty data by user_id
app.get("/faculty/:user_id", async (req, res) => {
  const { user_id } = req.params;
  console.log(`Fetching faculty data for user_id: ${user_id}`);

  try {
    const facultyQuery = `
      SELECT * FROM tbl_faculty WHERE user_id = $1;
    `;
    const facultyResult = await pool.query(facultyQuery, [user_id]);

    if (facultyResult.rows.length === 0) {
      console.log(`No faculty found for user_id: ${user_id}`);
      return res.status(404).json({ message: "Faculty not found" });
    }

    const faculty = facultyResult.rows[0];
    res.status(200).json(faculty);
  } catch (error) {
    console.error("Error fetching faculty data:", error);
    res.status(500).json({ message: "Failed to fetch faculty data" });
  }
});

app.get('/get-ip', (req, res) => {
  console.log(req.ip); // Logs the IP of the device
  res.send({ ip: req.ip });
});



// Update faculty availability
app.put("/update-availability/:facultyId", async (req, res) => {
  const { facultyId } = req.params;
  const { availability } = req.body; // Availability value passed in the request body

  if (availability === undefined) {
    return res.status(400).json({ message: "Availability is required" });
  }

  try {
    // Update the availability in the tbl_faculty table
    const query = `
      UPDATE tbl_faculty
      SET availability = $1
      WHERE id = $2
      RETURNING *;
    `;
    const result = await pool.query(query, [availability, facultyId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Faculty not found" });
    }

    const updatedFaculty = result.rows[0];

    // Insert notification into the notifications table
    const statusText = availability === 1 ? "available" : availability === 2 ? "busy" : "offline";
    const notificationQuery = `
      INSERT INTO notifications (faculty_id, name, rfid, status, created_at)
      VALUES ($1, $2, $3, $4, NOW())
    `;
    await pool.query(notificationQuery, [updatedFaculty.id, `${updatedFaculty.firstname} ${updatedFaculty.lastname}`, updatedFaculty.rfid, statusText]);

    // Emit event for faculty status change
    io.emit("faculty-status-change", {
      name: `${updatedFaculty.firstname} ${updatedFaculty.lastname}`,
      rfid: updatedFaculty.rfid,
      status: statusText,
      updatedAt: new Date().toISOString() // Use current date and time
    });

    res.status(200).json({ message: "Availability updated successfully", faculty: updatedFaculty });
  } catch (error) {
    console.error("Error updating availability:", error);
    res.status(500).json({ message: "Error updating availability" });
  }
});

// Fetch notifications
app.get("/notifications", async (req, res) => {
  try {
    const notificationsQuery = `
      SELECT * FROM notifications
      ORDER BY created_at DESC
      LIMIT 10;
    `;
    const notificationsResult = await pool.query(notificationsQuery);
    res.status(200).json(notificationsResult.rows);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
});

//RFID TEMPORARY API SHIT 
app.post("/api/validate-rfid", async (req, res) => {
  const { rfidCode } = req.body;

  try {
    // Dummy users for demonstration
    const users = {
      "12345ABCDEF": { id: 1, name: "John Doe", status: "Active" },
      "67890GHIJKL": { id: 2, name: "Jane Smith", status: "Inactive" }
    };

    // Validate the RFID code
    if (users[rfidCode]) {
      res.json({ success: true, data: users[rfidCode] });
    } else {
      res.json({ success: false, message: "RFID not recognized" });
    }
  } catch (err) {
    console.error("Error validating RFID:", err);
    res.status(500).json({ message: "Error validating RFID" });
  }
});


// Start the server
server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});