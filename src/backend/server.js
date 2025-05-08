const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { Pool } = require("pg");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const SALT_ROUNDS = 10;

const app = express();
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "artisans",
  password: "password",
  port: 5432,
});

pool.on('error', (err) => {
  console.error('Database connection error:', err.stack);
});

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "PATCH", "OPTIONS"],
  credentials: true,
}));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "Uploads")));

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

// Messages Router
const messagesRouter = express.Router();

messagesRouter.get('/conversations-summary/:artisanId', async (req, res) => {
  const { artisanId } = req.params;
  try {
    const messages = await pool.query(
      `SELECT DISTINCT ON (
        LEAST(sender_id, receiver_id), 
        GREATEST(sender_id, receiver_id)
      ) m.*, 
        u.firstname, u.lastname,
        (SELECT COUNT(*) FROM messages m2 
         WHERE m2.receiver_id = $1 AND m2.sender_id = CASE 
           WHEN m.sender_id = $1 THEN m.receiver_id 
           ELSE m.sender_id 
         END AND m2.read = false) as unread_count
      FROM messages m
      JOIN users u ON u.id = CASE
        WHEN m.sender_id = $1 THEN m.receiver_id
        ELSE m.sender_id
      END
      WHERE m.sender_id = $1 OR m.receiver_id = $1
      ORDER BY 
        LEAST(sender_id, receiver_id), 
        GREATEST(sender_id, receiver_id), 
        m.timestamp DESC;`,
      [artisanId]
    );
    res.json(messages.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

messagesRouter.get('/conversations/:userId/:otherUserId', async (req, res) => {
  const { userId, otherUserId } = req.params;
  try {
    const messages = await pool.query(
      `SELECT * FROM messages
       WHERE (sender_id = $1 AND receiver_id = $2)
          OR (sender_id = $2 AND receiver_id = $1)
       ORDER BY timestamp ASC`,
      [userId, otherUserId]
    );
    res.json(messages.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

messagesRouter.post('/', async (req, res) => {
  const { sender_id, receiver_id, content } = req.body;
  if (!content || typeof content !== 'string' || content.trim() === '') {
    return res.status(400).json({ error: 'Invalid message content' });
  }

  try {
    const artisanCheck = await pool.query(
      `SELECT coins FROM artisans WHERE id = $1`,
      [sender_id]
    );

    if (artisanCheck.rows.length > 0) {
      const coins = artisanCheck.rows[0].coins;
      const firstReplyCheck = await pool.query(
        `SELECT COUNT(*) FROM messages
         WHERE sender_id = $1 AND receiver_id = $2`,
        [sender_id, receiver_id]
      );

      if (parseInt(firstReplyCheck.rows[0].count) === 0) {
        if (coins < 25) {
          return res.status(403).json({ error: 'Insufficient coins. Please purchase more.' });
        }
        await pool.query(
          `UPDATE artisans SET coins = coins - 25 WHERE id = $1`,
          [sender_id]
        );
      }
    }

    const newMessage = await pool.query(
      `INSERT INTO messages (sender_id, receiver_id, content, read)
       VALUES ($1, $2, $3, false)
       RETURNING *`,
      [sender_id, receiver_id, content]
    );
    res.json(newMessage.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

messagesRouter.patch('/mark-as-read', async (req, res) => {
  const { sender_id, receiver_id } = req.body;
  try {
    await pool.query(
      `UPDATE messages
       SET read = true
       WHERE sender_id = $1 AND receiver_id = $2 AND read = false`,
      [sender_id, receiver_id]
    );
    res.json({ message: 'Messages marked as read' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

app.use('/api/messages', messagesRouter);

// User-related endpoints
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
      `INSERT INTO users (email, first_name, last_name, password)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [email, firstName, lastName, hashedPassword]
    );
    res.json({ message: "User added", user: result.rows[0] });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Database error" });
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
    res.json({
      message: "Login successful",
      user: { id: user.id, email: user.email, artisanId: user.artisanid }
    });
  } catch (err) {
    console.error("Sign-in error:", err);
    res.status(500).json({ error: "Server error" });
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
    res.status(200).json({
      message: "User linked to artisan successfully",
      user: result.rows[0],
    });
  } catch (err) {
    console.error("Failed to link artisan to user:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Artisan-related endpoints
app.post("/register-artisan", upload.any(), async (req, res) => {
  try {
    const {
      firstname,
      lastname,
      phone,
      gender,
      dob,
      city,
      address,
      skill,
      experience,
      bio,
      reference,
      email
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
       (firstname, lastname, phone, gender, dob, city, address, skill, experience, bio, profile_pic, certificate, reference, email, portfolio, coins)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 50)
       RETURNING *`,
      [
        firstname,
        lastname,
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
        email,
        portfolio
      ]
    );
    res.status(200).json({ message: "Registration successful", data: result.rows[0] });
  } catch (err) {
    console.error("Registration failed:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/artisan/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT *, coins FROM artisans WHERE id = $1`,
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

app.get("/artisans", async (req, res) => {
  try {
    const { artisan, city } = req.query;
    const result = await pool.query(
      `SELECT * FROM artisans WHERE LOWER(skill) = LOWER($1) AND LOWER(city) = LOWER($2)`,
      [artisan, city]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching artisans:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/artisan/:id/coins", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT coins FROM artisans WHERE id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Artisan not found" });
    }
    res.status(200).json({ coins: result.rows[0].coins });
  } catch (err) {
    console.error("Error fetching coins:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/artisan/:id/purchase-coins", async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid coin amount" });
    }
    const result = await pool.query(
      `UPDATE artisans SET coins = coins + $1 WHERE id = $2 RETURNING coins`,
      [amount, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Artisan not found" });
    }
    res.status(200).json({ message: "Coins purchased successfully", coins: result.rows[0].coins });
  } catch (err) {
    console.error("Error purchasing coins:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(8080, () => console.log("Server running on http://localhost:8080"));