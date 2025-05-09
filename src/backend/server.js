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
  password: "password", // Replace with your PostgreSQL password
  port: 5432,
});

if (!process.env.PAYSTACK_SECRET_KEY) {
  console.error("PAYSTACK_SECRET_KEY is not set in .env file");
  process.exit(1);
}

const paystack = Paystack(process.env.PAYSTACK_SECRET_KEY);

pool.on('error', (err) => {
  console.error('Database connection error:', err.stack);
});

// Test database connection on startup
pool.query('SELECT NOW()', (err, res) => {
  if (err) console.error('Test query failed:', err);
  else console.log('Database connected:', res.rows[0]);
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
  console.log('GET /api/messages/conversations-summary:', { userId, type: typeof userId });
  if (!userId || userId === 'undefined' || isNaN(userId)) {
    console.error('Invalid userId:', userId);
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
      [userId]
    );
    console.log('Conversations query result:', {
      rowCount: messages.rowCount,
      rows: messages.rows.map(row => ({
        sender_id: row.sender_id,
        receiver_id: row.receiver_id,
        first_name: row.first_name,
        last_name: row.last_name,
        content: row.content,
        artisan_id: row.artisan_id
      }))
    });
    // Filter out invalid conversations
    const validConversations = messages.rows.filter(row => {
      const otherUserId = row.sender_id === parseInt(userId) ? row.receiver_id : row.sender_id;
      if (!otherUserId || otherUserId === 'undefined') {
        console.warn('Skipping invalid conversation:', row);
        return false;
      }
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
  console.log('GET /api/messages/conversations:', { userId, otherUserId, userIdType: typeof userId, otherUserIdType: typeof otherUserId });
  if (!userId || !otherUserId || userId === 'undefined' || otherUserId === 'undefined') {
    console.error('Missing or invalid userId or otherUserId:', { userId, otherUserId });
    return res.status(400).json({ error: 'Missing or invalid userId or otherUserId' });
  }
  try {
    const messages = await pool.query(
      `SELECT * FROM messages
       WHERE (sender_id = $1 AND receiver_id = $2)
          OR (sender_id = $2 AND receiver_id = $1)
       ORDER BY timestamp ASC`,
      [userId, otherUserId]
    );
    console.log('Conversation query result:', { rowCount: messages.rowCount });
    res.json(messages.rows);
  } catch (err) {
    console.error('Error fetching conversation:', err.message, err.stack);
    res.status(500).json({ error: 'Server error' });
  }
});

messagesRouter.post('/', async (req, res) => {
  const { sender_id, receiver_id, content } = req.body;
  console.log('POST /api/messages received:', { sender_id, receiver_id, content });
  if (!sender_id || !receiver_id || !content || typeof content !== 'string' || content.trim() === '') {
    console.error('Invalid message payload:', { sender_id, receiver_id, content });
    return res.status(400).json({ error: 'Invalid message content or missing fields' });
  }

  try {
    // Check if sender is an artisan via users.artisanid
    const artisanCheck = await pool.query(
      `SELECT a.coins 
       FROM users u 
       LEFT JOIN artisans a ON a.id = u.artisanid 
       WHERE u.id = $1`,
      [sender_id]
    );

    if (artisanCheck.rows.length > 0 && artisanCheck.rows[0].coins !== null) {
      const coins = artisanCheck.rows[0].coins;
      const firstReplyCheck = await pool.query(
        `SELECT COUNT(*) FROM messages
         WHERE sender_id = $1 AND receiver_id = $2`,
        [sender_id, receiver_id]
      );

      if (parseInt(firstReplyCheck.rows[0].count) === 0) {
        if (coins < 25) {
          console.log('Insufficient coins for artisan:', { sender_id, coins });
          return res.status(403).json({ error: 'Insufficient coins. Please purchase more.' });
        }
        // Deduct coins from artisan
        const artisanIdResult = await pool.query(
          `SELECT artisanid FROM users WHERE id = $1`,
          [sender_id]
        );
        if (artisanIdResult.rows[0].artisanid) {
          const updateResult = await pool.query(
            `UPDATE artisans SET coins = coins - 25 WHERE id = $1 RETURNING coins`,
            [artisanIdResult.rows[0].artisanid]
          );
          console.log('Coins after deduction:', updateResult.rows[0].coins);
        }
      }
    }

    const newMessage = await pool.query(
      `INSERT INTO messages (sender_id, receiver_id, content, read)
       VALUES ($1, $2, $3, false)
       RETURNING *`,
      [sender_id, receiver_id, content]
    );
    console.log('Message sent successfully:', newMessage.rows[0]);
    res.json(newMessage.rows[0]);
  } catch (err) {
    console.error('Error sending message:', err.message, err.stack);
    res.status(500).json({ error: 'Server error' });
  }
});

messagesRouter.patch('/mark-as-read', async (req, res) => {
  const { sender_id, receiver_id } = req.body;
  console.log('PATCH /api/messages/mark-as-read received:', { sender_id, receiver_id });
  if (!sender_id || !receiver_id) {
    console.error('Invalid mark-as-read payload:', { sender_id, receiver_id });
    return res.status(400).json({ error: 'Missing sender_id or receiver_id' });
  }
  try {
    const result = await pool.query(
      `UPDATE messages
       SET read = true
       WHERE sender_id = $1 AND receiver_id = $2 AND read = false
       RETURNING *`,
      [sender_id, receiver_id]
    );
    console.log('Messages marked as read:', { updatedCount: result.rowCount });
    res.json({ message: 'Messages marked as read' });
  } catch (err) {
    console.error('Error marking messages as read:', err.message, err.stack);
    res.status(500).json({ error: 'Server error' });
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
    console.error("Database error:", err.message, err.stack);
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
    console.error("Sign-in error:", err.message, err.stack);
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
    console.error("Failed to link artisan to user:", err.message, err.stack);
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
       (id, firstname, lastname, phone, gender, dob, city, address, skill, experience, bio, profile_pic, certificate, reference, email, portfolio, coins)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 50)
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
        JSON.stringify(portfolio)
      ]
    );
    res.status(200).json({ message: "Registration successful", data: result.rows[0] });
  } catch (err) {
    console.error("Registration failed:", err.message, err.stack);
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
    console.error("Error fetching artisan:", err.message, err.stack);
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
    console.error("Error fetching artisans:", err.message, err.stack);
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
    console.error("Error fetching coins:", err.message, err.stack);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/artisan/:id/purchase-coins", async (req, res) => {
  const { id } = req.params;
  const { amount, email, coin_amount } = req.body;

  console.log('POST /artisan/:id/purchase-coins received:', { id, amount, email, coin_amount });

  if (!id || !amount || amount <= 0 || !coin_amount || coin_amount <= 0 || !email) {
    console.error('Invalid purchase payload:', { id, amount, email, coin_amount });
    return res.status(400).json({ error: "Invalid coin amount, email, or missing fields" });
  }

  try {
    // Verify artisan exists
    const artisanResult = await pool.query(
      `SELECT email FROM artisans WHERE id = $1`,
      [id]
    );
    if (artisanResult.rows.length === 0) {
      console.error('Artisan not found:', id);
      return res.status(404).json({ error: "Artisan not found" });
    }

    if (artisanResult.rows[0].email !== email) {
      console.error('Email mismatch:', { provided: email, expected: artisanResult.rows[0].email });
      return res.status(400).json({ error: "Email does not match artisan record" });
    }

    // Initialize Paystack transaction
    const transaction = await paystack.transaction.initialize({
      email,
      amount: amount * 100, // Convert NGN to kobo
      callback_url: `http://localhost:5173/purchase-coins/success`,
      metadata: { artisan_id: id, coin_amount },
    });

    console.log('Paystack transaction initialized:', {
      authorization_url: transaction.data.authorization_url,
      reference: transaction.data.reference
    });

    res.status(200).json({
      message: "Transaction initialized",
      authorization_url: transaction.data.authorization_url,
      reference: transaction.data.reference,
    });
  } catch (err) {
    console.error("Error initializing transaction:", {
      message: err.message,
      stack: err.stack,
      code: err.code,
      response: err.response ? err.response.data : null
    });
    res.status(500).json({ error: "Failed to initialize transaction: " + err.message });
  }
});

app.post("/artisan/verify-payment", async (req, res) => {
  const { reference, artisan_id, coin_amount } = req.body;

  console.log('POST /artisan/verify-payment received:', { reference, artisan_id, coin_amount });

  if (!reference || !artisan_id || !coin_amount || coin_amount <= 0) {
    console.error('Invalid verify payload:', { reference, artisan_id, coin_amount });
    return res.status(400).json({ error: "Missing or invalid required fields" });
  }

  try {
    // Verify transaction with Paystack
    const verification = await paystack.transaction.verify({ reference });
    console.log('Paystack verification response:', {
      status: verification.data.status,
      amount: verification.data.amount,
      currency: verification.data.currency
    });

    if (verification.data.status !== "success") {
      console.error('Transaction not successful:', verification.data);
      return res.status(400).json({ error: "Transaction not successful" });
    }

    // Verify amount
    const expectedAmount = coin_amount * 10 * 100; // 1 coin = NGN 10, in kobo
    if (verification.data.amount !== expectedAmount) {
      console.error('Amount mismatch:', { expected: expectedAmount, received: verification.data.amount });
      return res.status(400).json({ error: "Transaction amount mismatch" });
    }

    // Verify artisan exists
    const artisanResult = await pool.query(
      `SELECT id FROM artisans WHERE id = $1`,
      [artisan_id]
    );
    if (artisanResult.rows.length === 0) {
      console.error('Artisan not found during verification:', artisan_id);
      return res.status(404).json({ error: "Artisan not found" });
    }

    // Update artisan's coins
    const updateResult = await pool.query(
      `UPDATE artisans SET coins = coins + $1 WHERE id = $2 RETURNING coins`,
      [coin_amount, artisan_id]
    );

    console.log('Coins updated successfully:', updateResult.rows[0].coins);
    res.status(200).json({
      message: "Coins purchased successfully",
      coins: updateResult.rows[0].coins,
    });
  } catch (err) {
    console.error("Error verifying transaction:", {
      message: err.message,
      stack: err.stack,
      code: err.code,
      response: err.response ? err.response.data : null
    });
    res.status(500).json({ error: "Failed to verify transaction: " + err.message });
  }
});

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "Server is running" });
});

app.listen(8080, () => console.log("Server running on http://localhost:8080"));