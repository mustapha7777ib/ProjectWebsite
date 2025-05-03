const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { Pool } = require("pg");
const path = require("path");
const fs = require("fs");

const app = express();
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "artisans",
  password: "password",
  port: 5432,
});

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const uploadDir = path.join(__dirname, "Uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "Uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

app.post(
  "/register-artisan",
  upload.any(),
  async (req, res) => {
    try {
      const {
        phone,
        gender,
        dob,
        city,
        address,
        skill,
        experience,
        bio,
        reference,
      } = req.body;

      let profilePic = null;
      let certificate = null;
      const portfolio = [];

      req.files.forEach((file) => {
        if (file.fieldname === "profilePic") {
          profilePic = file.filename;
        } else if (file.fieldname === "certificate") {
          certificate = file.filename;
        } else if (file.fieldname.startsWith("portfolio_")) {
          portfolio.push(file.filename);
        }
      });

      const result = await pool.query(
        `INSERT INTO artisans 
         (phone, gender, dob, city, address, skill, experience, bio, profile_pic, certificate, reference, portfolio)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING *`,
        [
          phone,
          gender,
          dob,
          city,
          address,
          skill,
          experience,
          bio,
          profilePic,
          certificate,
          reference,
          portfolio,
        ]
      );

      res.status(200).json({ message: "Registration successful", data: result.rows[0] });
    } catch (err) {
      console.error("Registration failed:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

app.get("/artisan/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT * FROM artisans WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Artisan not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching artisan:", err);
    res.status(500).json({ error: "Server error" });
  }
});



app.post("/register-artisan", upload.single('profilePic'), async (req, res) => {
  const { phone, gender, dob, city, address, skill, experience, bio, certificate, reference, portfolio } = req.body;
  const profilePic = req.file ? req.file.filename : null;  // Ensure the filename is saved

  // Save data to database, including the profilePic filename
  const query = 'INSERT INTO artisans (phone, gender, dob, city, address, skill, experience, bio, profile_pic) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)';
  await db.query(query, [phone, gender, dob, city, address, skill, experience, bio, profilePic]);

  res.json({
    success: true,
    message: 'Registration successful',
    profilePic,  // Return the profile picture path in the response
  });
});


app.listen(8080, () => console.log("Server running on http://localhost:8080"));
