const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { Pool } = require("pg");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const Paystack = require("paystack-api");
const SALT_ROUNDS = 10;

require("dotenv").config();

const app = express();
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "artisans",
  password:"password", 
  port: 5432,
});

if (!process.env.PAYSTACK_SECRET_KEY) {
  console.error("PAYSTACK_SECRET_KEY is not set in .env file");
  process.exit(1);
}


const paystack = Paystack(process.env.PAYSTACK_SECRET_KEY);

// Test database connection on startup
pool.connect((err) => {
  if (err) {
    console.error("Failed to connect to PostgreSQL:", err.message);
    process.exit(1);
  }
  console.log("Connected to PostgreSQL database");
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

messagesRouter.get('/conversations-summary/:userId', async (req, res) => {
  const { userId } = req.params;
  console.log("server.js: GET /conversations-summary/", userId);
  if (!userId || userId === 'undefined' || isNaN(userId)) {
    console.error("server.js: Invalid userId:", userId);
    return res.status(400).json({ error: 'Invalid userId' });
  }
  try {
    const messages = await pool.query(
      `SELECT DISTINCT ON (
        LEAST(sender_id, receiver_id), 
        GREATEST(sender_id, receiver_id)
      ) m.*, 
        u.first_name, u.last_name,
        (SELECT COUNT(*) FROM messages m2 
         WHERE m2.receiver_id = $1 AND m2.sender_id = CASE 
           WHEN m.sender_id = $1 THEN m.receiver_id 
           ELSE m.sender_id 
         END AND m2.read = false) as unread_count,
        a.id as artisan_id
      FROM messages m
      JOIN users u ON u.id = CASE
        WHEN m.sender_id = $1 THEN m.receiver_id
        ELSE m.sender_id
      END
      LEFT JOIN users a_user ON a_user.id = CASE
        WHEN m.sender_id = $1 THEN m.receiver_id
        ELSE m.sender_id
      END
      LEFT JOIN artisans a ON a.id = a_user.artisanid
      WHERE m.sender_id = $1 OR m.receiver_id = $1
      ORDER BY 
        LEAST(sender_id, receiver_id), 
        GREATEST(sender_id, receiver_id), 
        m.timestamp DESC;`,
      [parseInt(userId)]
    );
    console.log("server.js: Conversations fetched for user", userId, ":", messages.rows.length);
    const validConversations = messages.rows.filter(row => {
      const otherUserId = row.sender_id === parseInt(userId) ? row.receiver_id : row.sender_id;
      if (!otherUserId || otherUserId === 'undefined') return false;
      return true;
    });
    res.json(validConversations);
  } catch (err) {
    console.error('Error fetching conversations:', err.message, err.stack);
    res.status(500).json({ error: 'Server error' });
  }
});

messagesRouter.get('/conversations/:userId/:otherUserId', async (req, res) => {
  const { userId, otherUserId } = req.params;
  console.log("server.js: GET /conversations/", userId, "/", otherUserId);
  if (!userId || !otherUserId || userId === 'undefined' || otherUserId === 'undefined') {
    console.error("server.js: Invalid userId or otherUserId:", userId, otherUserId);
    return res.status(400).json({ error: 'Missing or invalid userId or otherUserId' });
  }
  try {
    const messages = await pool.query(
      `SELECT * FROM messages
       WHERE (sender_id = $1 AND receiver_id = $2)
          OR (sender_id = $2 AND receiver_id = $1)
       ORDER BY timestamp ASC`,
      [parseInt(userId), parseInt(otherUserId)]
    );
    console.log("server.js: Messages fetched for", userId, otherUserId, ":", messages.rows.length);
    res.json(messages.rows);
  } catch (err) {
    console.error('Error fetching conversation:', err.message, err.stack);
    res.status(500).json({ error: 'Server error' });
  }
});

messagesRouter.post('/', async (req, res) => {
  const { sender_id, receiver_id, content } = req.body;
  console.log("server.js: POST /messages", { sender_id, receiver_id });
  if (!sender_id || !receiver_id || !content || typeof content !== 'string' || content.trim() === '') {
    console.error("server.js: Invalid message data:", { sender_id, receiver_id, content });
    return res.status(400).json({ error: 'Invalid message content or missing fields' });
  }
  try {
    const artisanCheck = await pool.query(
      `SELECT a.coins 
       FROM users u 
       LEFT JOIN artisans a ON a.id = u.artisanid 
       WHERE u.id = $1`,
      [parseInt(sender_id)]
    );
    console.log("server.js: Artisan coins check for sender", sender_id, ":", artisanCheck.rows);
    if (artisanCheck.rows.length > 0 && artisanCheck.rows[0].coins !== null) {
      const coins = artisanCheck.rows[0].coins;
      const firstReplyCheck = await pool.query(
        `SELECT COUNT(*) FROM messages
         WHERE sender_id = $1 AND receiver_id = $2`,
        [parseInt(sender_id), parseInt(receiver_id)]
      );
      console.log("server.js: First reply check:", firstReplyCheck.rows[0].count);
      if (parseInt(firstReplyCheck.rows[0].count) === 0) {
        if (coins < 25) {
          console.error("server.js: Insufficient coins for sender", sender_id, ":", coins);
          return res.status(403).json({ error: 'Insufficient coins. Please purchase more.' });
        }
        const artisanIdResult = await pool.query(
          `SELECT artisanid FROM users WHERE id = $1`,
          [parseInt(sender_id)]
        );
        console.log("server.js: Artisan ID for sender", sender_id, ":", artisanIdResult.rows);
        if (artisanIdResult.rows[0].artisanid) {
          const updateResult = await pool.query(
            `UPDATE artisans SET coins = coins - 25 WHERE id = $1 RETURNING coins`,
            [parseInt(artisanIdResult.rows[0].artisanid)]
          );
          console.log("server.js: Coins updated for artisan", artisanIdResult.rows[0].artisanid, ":", updateResult.rows[0].coins);
        }
      }
    }
    const newMessage = await pool.query(
      `INSERT INTO messages (sender_id, receiver_id, content, read)
       VALUES ($1, $2, $3, false)
       RETURNING *`,
      [parseInt(sender_id), parseInt(receiver_id), content]
    );
    console.log("server.js: Message sent:", newMessage.rows[0]);
    res.json(newMessage.rows[0]);
  } catch (err) {
    console.error('Error sending message:', err.message, err.stack);
    res.status(500).json({ error: 'Server error' });
  }
});

messagesRouter.patch('/mark-as-read', async (req, res) => {
  const { sender_id, receiver_id } = req.body;
  console.log("server.js: PATCH /mark-as-read", { sender_id, receiver_id });
  if (!sender_id || !receiver_id) {
    console.error("server.js: Missing sender_id or receiver_id:", { sender_id, receiver_id });
    return res.status(400).json({ error: 'Missing sender_id or receiver_id' });
  }
  try {
    const result = await pool.query(
      `UPDATE messages
       SET read = true
       WHERE sender_id = $1 AND receiver_id = $2 AND read = false
       RETURNING *`,
      [parseInt(sender_id), parseInt(receiver_id)]
    );
    console.log("server.js: Messages marked as read:", result.rows.length);
    res.json({ message: 'Messages marked as read', updated: result.rows });
  } catch (err) {
    console.error('Error marking messages as read:', err.message, err.stack);
    res.status(500).json({ error: 'Server error' });
  }
});

app.use('/api/messages', messagesRouter);

// User-related endpoints
app.post("/artisan/:id/add-job-posting", upload.single("image"), async (req, res) => {
  const { id } = req.params;
  const { dealId, description } = req.body;
  const image = req.file ? req.file.filename : null;
  console.log("server.js: POST /artisan/", id, "/add-job-posting", { dealId, description, image });
  if (!id || !dealId || !description || !image) {
    console.error("server.js: Missing required fields:", { id, dealId, description, image });
    return res.status(400).json({ error: "Missing required fields" });
  }
  try {
    const dealCheck = await pool.query(
      `SELECT id FROM deals WHERE id = $1 AND artisan_id = $2`,
      [parseInt(dealId), parseInt(id)]
    );
    console.log("server.js: Deal check for deal", dealId, "artisan", id, ":", dealCheck.rows);
    if (dealCheck.rows.length === 0) {
      console.error("server.js: Deal not found or does not belong to artisan:", dealId, id);
      return res.status(404).json({ error: "Deal not found or does not belong to artisan" });
    }
    const result = await pool.query(
      `INSERT INTO job_postings (artisan_id, deal_id, description, image, created_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
       RETURNING *`,
      [parseInt(id), parseInt(dealId), description, image]
    );
    console.log("server.js: Job posting added:", result.rows[0]);
    res.status(200).json({ message: "Job posting added successfully", jobPosting: result.rows[0] });
  } catch (err) {
    console.error('Error adding job posting:', err.message, err.stack);
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

app.post("/signup", async (req, res) => {
  const { email, firstName, lastName, password } = req.body;
  console.log("server.js: POST /signup", { email, firstName, lastName });
  if (!email || !firstName || !lastName || !password) {
    console.error("server.js: Missing required fields:", { email, firstName, lastName });
    return res.status(400).json({ error: "All fields are required" });
  }
  try {
    const existing = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    console.log("server.js: Email check:", existing.rows.length);
    if (existing.rows.length > 0) {
      console.error("server.js: Email already exists:", email);
      return res.status(400).json({ error: "Email already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const result = await pool.query(
      `INSERT INTO users (email, first_name, last_name, password)
       VALUES ($1, $2, $3, $4) RETURNING id, email, first_name, last_name, artisanid`,
      [email, firstName, lastName, hashedPassword]
    );
    console.log("server.js: User added:", result.rows[0]);
    res.json({ message: "User added", user: result.rows[0] });
  } catch (err) {
    console.error("Database error:", err.message, err.stack);
    res.status(500).json({ error: "Database error: " + err.message });
  }
});

app.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  console.log("server.js: POST /signin", { email });
  if (!email || !password) {
    console.error("server.js: Missing email or password");
    return res.status(400).json({ error: "Email and password are required" });
  }
  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    console.log("server.js: User check:", result.rows.length);
    if (result.rows.length === 0) {
      console.error("server.js: Invalid email:", email);
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      console.error("server.js: Invalid password for email:", email);
      return res.status(401).json({ error: "Invalid email or password" });
    }
    console.log("server.js: Login successful for user:", user.id);
    res.json({
      message: "Login successful",
      user: { id: user.id, email: user.email, artisanId: user.artisanid }
    });
  } catch (err) {
    console.error("Sign-in error:", err.message, err.stack);
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

app.get("/users/:id", async (req, res) => {
  const { id } = req.params;
  console.log("server.js: GET /users/", id);
  try {
    const result = await pool.query(
      `SELECT id, email, first_name, last_name, artisanid FROM users WHERE id = $1`,
      [parseInt(id)]
    );
    console.log("server.js: User fetch:", result.rows);
    if (result.rows.length === 0) {
      console.error("server.js: User not found:", id);
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching user:", err.message, err.stack);
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

app.get("/users/by-artisan/:artisanId", async (req, res) => {
  const { artisanId } = req.params;
  console.log("server.js: GET /users/by-artisan/", artisanId);
  try {
    const result = await pool.query(
      `SELECT id, first_name, last_name FROM users WHERE artisanid = $1`,
      [parseInt(artisanId)]
    );
    console.log("server.js: User by artisan fetch:", result.rows);
    if (result.rows.length === 0) {
      console.error("server.js: No user linked to artisan:", artisanId);
      return res.status(404).json({ error: "No user linked to this artisan" });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching user by artisan:", err.message, err.stack);
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

app.put("/link-artisan-to-user", async (req, res) => {
  const { userId, artisanId } = req.body;
  console.log("server.js: PUT /link-artisan-to-user", { userId, artisanId });
  if (!userId || !artisanId) {
    console.error("server.js: Missing userId or artisanId:", { userId, artisanId });
    return res.status(400).json({ error: "Missing userId or artisanId" });
  }
  try {
    const result = await pool.query(
      `UPDATE users SET artisanid = $1 WHERE id = $2 RETURNING *`,
      [parseInt(artisanId), parseInt(userId)]
    );
    console.log("server.js: User linked to artisan:", result.rows);
    if (result.rows.length === 0) {
      console.error("server.js: User not found:", userId);
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({
      message: "User linked to artisan successfully",
      user: result.rows[0],
    });
  } catch (err) {
    console.error("Failed to link artisan to user:", err.message, err.stack);
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

app.post("/register-artisan", upload.any(), async (req, res) => {
  const { firstname, lastname, phone, gender, dob, city, address, skill, experience, bio, reference, email, userId } = req.body;
  console.log("server.js: POST /register-artisan", { firstname, lastname, email, userId });
  try {
    let profilePic = null;
    let certificate = null;
    const portfolio = [];
    req.files.forEach((file) => {
      if (file.fieldname === "profilePic") profilePic = file.filename;
      else if (file.fieldname === "certificate") certificate = file.filename;
      else if (file.fieldname.startsWith("portfolio_")) portfolio.push(file.filename);
    });
    if (!firstname || !lastname || !phone || !email || !gender || !dob || !city || !address || !skill || !experience || !bio) {
      console.error("server.js: Missing required fields:", req.body);
      return res.status(400).json({ error: "Missing required fields" });
    }
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
        portfolio.length > 0 ? JSON.stringify(portfolio) : null
      ]
    );
    const artisan = result.rows[0];

    // Link artisan to user if userId is provided
    if (userId) {
      const userCheck = await pool.query(
        `SELECT id FROM users WHERE id = $1`,
        [parseInt(userId)]
      );
      if (userCheck.rows.length === 0) {
        console.error("server.js: User not found for ID:", userId);
        return res.status(404).json({ error: "User not found" });
      }
      await pool.query(
        `UPDATE users SET artisanid = $1 WHERE id = $2`,
        [artisan.id, parseInt(userId)]
      );
      console.log("server.js: Artisan linked to user:", userId);
    }

    console.log("server.js: Artisan registered:", artisan.id);
    res.status(200).json({ message: "Registration successful", data: artisan });
  } catch (err) {
    console.error("Registration failed:", err.message, err.stack);
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

app.get("/artisan/:id", async (req, res) => {
  const { id } = req.params;
  console.log("server.js: GET /artisan/", id);
  if (!id || isNaN(parseInt(id))) {
    console.error("server.js: Invalid artisan ID:", id);
    return res.status(400).json({ error: "Invalid artisan ID" });
  }
  try {
    const artisanResult = await pool.query("SELECT * FROM artisans WHERE id = $1", [parseInt(id)]);
    console.log("server.js: Artisan fetch for ID", id, ":", artisanResult.rows);
    if (artisanResult.rows.length === 0) {
      console.error("server.js: Artisan not found for ID:", id);
      return res.status(404).json({ error: "Artisan not found" });
    }
    const dealsResult = await pool.query(
      `SELECT d.*, u.first_name, u.last_name,
              EXISTS (
                SELECT 1 FROM job_postings jp WHERE jp.deal_id = d.id
              ) as job_posting
       FROM deals d
       JOIN users u ON u.id = d.user_id
       WHERE d.artisan_id = $1`,
      [parseInt(id)]
    );
    console.log("server.js: Deals for artisan", id, ":", dealsResult.rows);
    const jobPostingsResult = await pool.query(
      `SELECT jp.*, 
              COALESCE(
                (SELECT json_agg(
                  json_build_object(
                    'id', r.id,
                    'rating', r.rating,
                    'comment', r.comment,
                    'first_name', u.first_name,
                    'last_name', u.last_name,
                    'created_at', r.created_at
                  )
                )
                FROM reviews r
                JOIN users u ON u.id = r.user_id
                WHERE r.deal_id = jp.deal_id),
                '[]'::json
              ) as reviews
       FROM job_postings jp
       WHERE jp.artisan_id = $1
       ORDER BY jp.created_at DESC`,
      [parseInt(id)]
    );
    console.log("server.js: Job postings for artisan", id, ":", jobPostingsResult.rows);
    const artisan = {
      ...artisanResult.rows[0],
      deals: dealsResult.rows,
      job_postings: jobPostingsResult.rows,
    };
    res.json(artisan);
  } catch (err) {
    console.error("server.js: Error fetching artisan:", err.message, err.stack);
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

app.get("/artisan/:id/reviews", async (req, res) => {
  const { id } = req.params;
  console.log("server.js: GET /artisan/", id, "/reviews");
  if (!id || isNaN(parseInt(id))) {
    console.error("server.js: Invalid artisan ID for reviews:", id);
    return res.status(400).json({ error: "Invalid artisan ID" });
  }
  try {
    const result = await pool.query(
      `SELECT r.*, u.first_name, u.last_name
       FROM reviews r
       JOIN users u ON u.id = r.user_id
       WHERE r.artisan_id = $1
       ORDER BY r.created_at DESC`,
      [parseInt(id)]
    );
    console.log("server.js: Reviews for artisan", id, ":", result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error("server.js: Error fetching reviews:", err.message, err.stack);
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

app.put("/artisan/:id", upload.any(), async (req, res) => {
  const { id } = req.params;
  console.log("server.js: PUT /artisan/", id);
  try {
    const {
      firstname,
      lastname,
      phone,
      email,
      gender,
      dob,
      city,
      address,
      skill,
      experience,
      bio,
      reference,
      existingPortfolio,
    } = req.body;
    let profilePic = null;
    let certificate = null;
    const portfolio = existingPortfolio ? JSON.parse(existingPortfolio) : [];
    req.files.forEach((file) => {
      if (file.fieldname === "profile_pic") profilePic = file.filename;
      else if (file.fieldname === "certificate") certificate = file.filename;
      else if (file.fieldname === "portfolio") portfolio.push(file.filename);
    });
    if (!firstname || !lastname || !phone || !email || !gender || !dob || !city || !address || !skill || !experience || !bio) {
      console.error("server.js: Missing required fields:", req.body);
      return res.status(400).json({ error: "Missing required fields" });
    }
    const artisanCheck = await pool.query(
      `SELECT id FROM artisans WHERE id = $1`,
      [parseInt(id)]
    );
    console.log("server.js: Artisan check for ID", id, ":", artisanCheck.rows);
    if (artisanCheck.rows.length === 0) {
      console.error("server.js: Artisan not found:", id);
      return res.status(404).json({ error: "Artisan not found" });
    }
    const result = await pool.query(
      `UPDATE artisans 
       SET firstname = $1, lastname = $2, phone = $3, email = $4, gender = $5, dob = $6, 
           city = $7, address = $8, skill = $9, experience = $10, bio = $11, 
           profile_pic = COALESCE($12, profile_pic), certificate = COALESCE($13, certificate), 
           reference = $14, portfolio = $15
       WHERE id = $16
       RETURNING *`,
      [
        firstname,
        lastname,
        phone,
        email,
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
        portfolio.length > 0 ? JSON.stringify(portfolio) : null,
        parseInt(id),
      ]
    );
    console.log("server.js: Artisan updated:", result.rows[0]);
    res.status(200).json({ message: "Profile updated successfully", data: result.rows[0] });
  } catch (err) {
    console.error("Error updating artisan:", err.message, err.stack);
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

app.get("/artisans", async (req, res) => {
  const { artisan, city } = req.query;
  console.log("server.js: GET /artisans", { artisan, city });
  try {
    const result = await pool.query(
      `SELECT * FROM artisans WHERE LOWER(skill) = LOWER($1) AND LOWER(city) = LOWER($2)`,
      [artisan, city]
    );
    console.log("server.js: Artisans fetched:", result.rows.length);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching artisans:", err.message, err.stack);
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

app.get("/artisan/:id/coins", async (req, res) => {
  const { id } = req.params;
  console.log("server.js: GET /artisan/", id, "/coins");
  try {
    const result = await pool.query(
      `SELECT coins FROM artisans WHERE id = $1`,
      [parseInt(id)]
    );
    console.log("server.js: Coins fetch for artisan", id, ":", result.rows);
    if (result.rows.length === 0) {
      console.error("server.js: Artisan not found:", id);
      return res.status(404).json({ error: "Artisan not found" });
    }
    res.status(200).json({ coins: result.rows[0].coins });
  } catch (err) {
    console.error("Error fetching coins:", err.message, err.stack);
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

app.post("/artisan/:id/purchase-coins", async (req, res) => {
  const { id } = req.params;
  const { amount, email, coin_amount } = req.body;
  console.log("server.js: POST /artisan/", id, "/purchase-coins", { amount, email, coin_amount });
  if (!id || !amount || amount <= 0 || !coin_amount || coin_amount <= 0 || !email) {
    console.error("server.js: Invalid coin amount, email, or missing fields:", req.body);
    return res.status(400).json({ error: "Invalid coin amount, email, or missing fields" });
  }
  try {
    const artisanResult = await pool.query(
      `SELECT email FROM artisans WHERE id = $1`,
      [parseInt(id)]
    );
    console.log("server.js: Artisan email check for ID", id, ":", artisanResult.rows);
    if (artisanResult.rows.length === 0) {
      console.error("server.js: Artisan not found:", id);
      return res.status(404).json({ error: "Artisan not found" });
    }
    if (artisanResult.rows[0].email !== email) {
      console.error("server.js: Email mismatch for artisan", id, ":", email);
      return res.status(400).json({ error: "Email does not match artisan record" });
    }
    const transaction = await paystack.transaction.initialize({
      email,
      amount: amount * 100,
      callback_url: `http://localhost:5173/purchase-coins/success`,
      metadata: { artisan_id: parseInt(id), coin_amount },
    });
    console.log("server.js: Transaction initialized for artisan", id, ":", transaction.data.reference);
    res.status(200).json({
      message: "Transaction initialized",
      authorization_url: transaction.data.authorization_url,
      reference: transaction.data.reference,
    });
  } catch (err) {
    console.error("Error initializing transaction:", err.message, err.stack);
    res.status(500).json({ error: "Failed to initialize transaction: " + err.message });
  }
});

app.post("/artisan/verify-payment", async (req, res) => {
  const { reference, artisan_id, coin_amount } = req.body;
  console.log("server.js: POST /artisan/verify-payment", { reference, artisan_id, coin_amount });
  if (!reference || !artisan_id || !coin_amount || coin_amount <= 0) {
    console.error("server.js: Missing or invalid required fields:", req.body);
    return res.status(400).json({ error: "Missing or invalid required fields" });
  }
  try {
    const verification = await paystack.transaction.verify({ reference });
    console.log("server.js: Transaction verification:", verification.data.status);
    if (verification.data.status !== "success") {
      console.error("server.js: Transaction not successful:", reference);
      return res.status(400).json({ error: "Transaction not successful" });
    }
    const expectedAmount = coin_amount * 10 * 100;
    if (verification.data.amount !== expectedAmount) {
      console.error("server.js: Transaction amount mismatch:", verification.data.amount, expectedAmount);
      return res.status(400).json({ error: "Transaction amount mismatch" });
    }
    const artisanResult = await pool.query(
      `SELECT id FROM artisans WHERE id = $1`,
      [parseInt(artisan_id)]
    );
    console.log("server.js: Artisan check for ID", artisan_id, ":", artisanResult.rows);
    if (artisanResult.rows.length === 0) {
      console.error("server.js: Artisan not found:", artisan_id);
      return res.status(404).json({ error: "Artisan not found" });
    }
    const updateResult = await pool.query(
      `UPDATE artisans SET coins = coins + $1 WHERE id = $2 RETURNING coins`,
      [coin_amount, parseInt(artisan_id)]
    );
    console.log("server.js: Coins updated for artisan", artisan_id, ":", updateResult.rows[0].coins);
    res.status(200).json({
      message: "Coins purchased successfully",
      coins: updateResult.rows[0].coins,
    });
  } catch (err) {
    console.error("Error verifying transaction:", err.message, err.stack);
    res.status(500).json({ error: "Failed to verify transaction: " + err.message });
  }
});

// Deal-related endpoints
app.post("/confirm-deal", async (req, res) => {
  const { artisanId, userId } = req.body;
  console.log("server.js: POST /confirm-deal", { artisanId, userId });
  if (!artisanId || !userId) {
    console.error("server.js: Missing artisanId or userId:", { artisanId, userId });
    return res.status(400).json({ error: "Missing artisanId or userId" });
  }
  try {
    const artisanCheck = await pool.query(
      `SELECT id FROM artisans WHERE id = $1`,
      [parseInt(artisanId)]
    );
    console.log("server.js: Artisan check for ID", artisanId, ":", artisanCheck.rows);
    if (artisanCheck.rows.length === 0) {
      console.error("server.js: Artisan not found:", artisanId);
      return res.status(404).json({ error: "Artisan not found" });
    }
    const userCheck = await pool.query(
      `SELECT id FROM users WHERE id = $1`,
      [parseInt(userId)]
    );
    console.log("server.js: User check for ID", userId, ":", userCheck.rows);
    if (userCheck.rows.length === 0) {
      console.error("server.js: User not found:", userId);
      return res.status(404).json({ error: "User not found" });
    }
    const result = await pool.query(
      `INSERT INTO deals (user_id, artisan_id)
       VALUES ($1, $2)
       RETURNING *`,
      [parseInt(userId), parseInt(artisanId)]
    );
    console.log("server.js: Deal confirmed:", result.rows[0]);
    res.status(200).json({ message: "Deal confirmed successfully", deal: result.rows[0] });
  } catch (err) {
    console.error('Error confirming deal:', err.message, err.stack);
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

// Review-related endpoints
app.post("/reviews", async (req, res) => {
  const { artisanId, rating, comment, dealId, userId } = req.body;
  console.log("server.js: POST /reviews", { artisanId, rating, comment, dealId, userId });
  if (!artisanId || !rating || !comment || !dealId || !userId || rating < 1 || rating > 5) {
    console.error("server.js: Invalid review data:", { artisanId, rating, comment, dealId, userId });
    return res.status(400).json({ error: "Missing or invalid required fields" });
  }
  try {
    const dealCheck = await pool.query(
      `SELECT id, user_id FROM deals WHERE id = $1 AND artisan_id = $2`,
      [parseInt(dealId), parseInt(artisanId)]
    );
    console.log("server.js: Deal check for deal", dealId, "artisan", artisanId, ":", dealCheck.rows);
    if (dealCheck.rows.length === 0) {
      console.error("server.js: Deal not found for ID:", dealId, "Artisan:", artisanId);
      return res.status(404).json({ error: "Deal not found or does not belong to artisan" });
    }
    if (dealCheck.rows[0].user_id !== parseInt(userId)) {
      console.error("server.js: User not authorized for deal:", userId, dealId);
      return res.status(403).json({ error: "Not authorized to review this deal" });
    }
    const jobPostingCheck = await pool.query(
      `SELECT id FROM job_postings WHERE deal_id = $1 AND artisan_id = $2`,
      [parseInt(dealId), parseInt(artisanId)]
    );
    console.log("server.js: Job posting check for deal  deal", dealId, "artisan", artisanId, ":", jobPostingCheck.rows);
    if (jobPostingCheck.rows.length === 0) {
      console.error("server.js: No job posting for deal:", dealId, "Artisan:", artisanId);
      return res.status(403).json({ error: "Cannot review until artisan uploads job details" });
    }
    const result = await pool.query(
      `INSERT INTO reviews (artisan_id, user_id, deal_id, rating, comment, created_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
       RETURNING *`,
      [parseInt(artisanId), parseInt(userId), parseInt(dealId), rating, comment]
    );
    console.log("server.js: Review submitted for artisan", artisanId, ":", result.rows[0]);
    res.status(200).json({ message: "Review submitted successfully", review: result.rows[0] });
  } catch (err) {
    console.error('server.js: Error submitting review:', err.message, err.stack);
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

// Health check
app.get("/health", (req, res) => {
  console.log("server.js: GET /health");
  res.status(200).json({ status: "Server is running" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message, err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(8080, () => console.log("Server running on http://localhost:8080"));