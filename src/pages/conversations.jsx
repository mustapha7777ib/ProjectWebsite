// Conversations.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';

const Conversations = () => {
  const { user } = useAuth();
  const [threads, setThreads] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await fetch(`/api/messages/conversations/${user.id}`);
        const data = await res.json();
        setThreads(data);
      } catch (err) {
        console.error('Failed to fetch conversations', err);
      }
    };

    fetchConversations();
  }, [user]);

  const getOtherParticipant = (msg) =>
    msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Your Conversations</h2>
      {threads.map((msg) => (
        <div key={msg.id} style={{ margin: '1rem 0', cursor: 'pointer' }}>
          <div
            onClick={() => navigate(`/chat/${getOtherParticipant(msg)}`)}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #ccc',
              borderRadius: '8px',
              background: '#f9f9f9',
            }}
          >
            <p><strong>With user:</strong> {getOtherParticipant(msg)}</p>
            <p>{msg.content}</p>
            <small>{new Date(msg.timestamp).toLocaleString()}</small>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Conversations;
