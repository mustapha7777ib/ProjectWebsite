const express = require('express');
const router = express.Router();
const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "artisans",
  password: "messages",
  port: 5432,
});

// GET all messages between a user and artisan
router.get('/:userId/:artisanId', async (req, res) => {
  const { userId, artisanId } = req.params;

  try {
    const messages = await pool.query(`
      SELECT * FROM messages 
      WHERE (sender_id = $1 AND receiver_id = $2) 
         OR (sender_id = $2 AND receiver_id = $1)
      ORDER BY timestamp ASC
    `, [userId, artisanId]);

    res.json(messages.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to fetch messages');
  }
});

// Send a message
router.post('/', async (req, res) => {
  const { sender_id, receiver_id, content } = req.body;

  try {
    const newMsg = await pool.query(`
      INSERT INTO messages (sender_id, receiver_id, content)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [sender_id, receiver_id, content]);

    res.json(newMsg.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to send message');
  }
});

// Mark a message as read
router.patch('/:messageId/read', async (req, res) => {
  const { messageId } = req.params;

  try {
    await pool.query(`
      UPDATE messages
      SET is_read = TRUE
      WHERE id = $1
    `, [messageId]);

    res.json({ message: 'Message marked as read' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to mark as read');
  }
});

// GET recent conversations for a user (summary list)
router.get('/conversations/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(`
      SELECT DISTINCT ON (
        LEAST(sender_id, receiver_id), 
        GREATEST(sender_id, receiver_id)
      ) *
      FROM messages
      WHERE sender_id = $1 OR receiver_id = $1
      ORDER BY 
        LEAST(sender_id, receiver_id), 
        GREATEST(sender_id, receiver_id), 
        timestamp DESC
    `, [userId]);

    res.json(result.rows);
  } catch (err) {
    console.error("Failed to fetch conversations:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET conversation summary for artisan (like inbox)
router.get('/conversations-summary/:artisanId', async (req, res) => {
  const { artisanId } = req.params;
  try {
    const conversations = await pool.query(`
      SELECT 
        u.id AS user_id,
        u.firstname,
        u.lastname,
        MAX(m.timestamp) AS last_message_time,
        COUNT(*) FILTER (WHERE m.is_read = FALSE AND m.receiver_id = $1) AS unread_count
      FROM messages m
      JOIN users u ON u.id = m.sender_id
      WHERE m.receiver_id = $1
      GROUP BY u.id, u.firstname, u.lastname
      ORDER BY last_message_time DESC
    `, [artisanId]);

    res.json(conversations.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to fetch artisan inbox');
  }
});

module.exports = router;
