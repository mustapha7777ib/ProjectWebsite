import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const Chat = ({ currentUser }) => {
  const { artisanId } = useParams();
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [replyTo, setReplyTo] = useState(null);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/messages/${currentUser.id}/${artisanId}`);
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error('Failed to load messages', err);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // Poll every 3 sec
    return () => clearInterval(interval);
  }, [artisanId, currentUser]);

  const sendMessage = async () => {
    if (!content.trim()) return;

    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_id: currentUser.id,
          receiver_id: artisanId,
          content,
          reply_to: replyTo,
        }),
      });
      setContent('');
      setReplyTo(null);
      fetchMessages();
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  return (
    <div className="chat-container" style={{ padding: '1rem' }}>
      <h2>Chat with Artisan {artisanId}</h2>
      <div className="messages" style={{ border: '1px solid #ccc', padding: '1rem', maxHeight: '300px', overflowY: 'auto' }}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              textAlign: msg.sender_id === currentUser.id ? 'right' : 'left',
              margin: '0.5rem 0'
            }}
          >
            {msg.reply_to && (
              <div style={{ fontStyle: 'italic', fontSize: '0.9em' }}>
                Replying to message ID: {msg.reply_to}
              </div>
            )}
            <div style={{
              display: 'inline-block',
              padding: '0.5rem 1rem',
              borderRadius: '1rem',
              background: msg.sender_id === currentUser.id ? '#DCF8C6' : '#F1F0F0'
            }}>
              {msg.content}
            </div>
            <button onClick={() => setReplyTo(msg.id)}>Reply</button>
          </div>
        ))}
      </div>
      {replyTo && (
        <div style={{ marginTop: '1rem', fontStyle: 'italic' }}>
          Replying to message ID: {replyTo}
          <button onClick={() => setReplyTo(null)}>Cancel</button>
        </div>
      )}
      <div style={{ marginTop: '1rem' }}>
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type a message"
          style={{ width: '80%', padding: '0.5rem' }}
        />
        <button onClick={sendMessage} style={{ padding: '0.5rem 1rem' }}>Send</button>
      </div>
    </div>
  );
};

export default Chat;
