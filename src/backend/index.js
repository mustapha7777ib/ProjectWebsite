const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const SALT_ROUNDS = 10;

const app = express();
const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "project",
  password: "password",
  port: 5432, 
});
app.use(cors({
  origin: "http://localhost:5173", 
  methods: ["GET", "POST", "PUT", "OPTIONS"],
  credentials: true,
}));

app.use(express.json());

app.options("/signup", cors());

app.post("/signup", async (req, res) => {
  const { email, firstName, lastName, password } = req.body;

  if (!password) {
    return res.status(400).json({ error: "Password is required" });
  }

  try {
    const existing = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: "Email already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const result = await pool.query(
      "INSERT INTO users (email, first_name, last_name, password) VALUES ($1, $2, $3, $4) RETURNING *",
      [email, firstName, lastName, hashedPassword]
    );

    res.json({ message: "User added", user: result.rows[0] });

  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.put("/link-artisan-to-user", async (req, res) => {
  try {
    const { userId, artisanId } = req.body;

    if (!userId || !artisanId) {
      return res.status(400).json({ error: "Missing userId or artisanId" });
    }

    const result = await pool.query(
      `UPDATE users SET artisanid = $1 WHERE id = $2 RETURNING *`,
      [artisanId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    console.log(result.rows[0]);

    res.status(200).json({
      message: "User linked to artisan successfully",
      user: result.rows[0],
    });
  } catch (err) {
    console.error("Failed to link artisan to user:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/signin", async (req, res) => {
    const { email, password } = req.body;
    try {
      const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  
      if (result.rows.length === 0) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
  
      const user = result.rows[0];
      const passwordMatch = await bcrypt.compare(password, user.password);
  
      if (!passwordMatch) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
  
      console.log(user);
      
      res.json({ message: "Login successful", user: { id: user.id, email: user.email, artisanId: user.artisanId } });
  
    } catch (err) {
      console.error("Sign-in error:", err);
      res.status(500).json({ error: "Server error" });
    }
  });

app.listen(5050, () => {
    console.log("Server running on http://localhost:5050");
  });