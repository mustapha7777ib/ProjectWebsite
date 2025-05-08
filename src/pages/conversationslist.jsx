import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ConversationsList = () => {
  const { user, artisanId } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    const id = artisanId || user.id;
    const fetchConversations = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/messages/conversations-summary/${id}`);
        if (!res.ok) throw new Error('Failed to fetch conversations');
        const data = await res.json();
        setConversations(data.map(msg => ({
          user_id: msg.sender_id === id ? msg.receiver_id : msg.sender_id,
          firstname: msg.firstname,
          lastname: msg.lastname,
          unread_count: msg.unread_count,
        })));
      } catch (err) {
        console.error('Failed to load conversations', err);
        setError('Could not load conversations');
      }
    };

    fetchConversations();
  }, [user, artisanId]);

  if (!user) {
    return <p>Please log in to view conversations.</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Your Conversations</h2>
      {conversations.length === 0 ? (
        <p>No conversations yet.</p>
      ) : (
        <ul>
          {conversations.map((conv) => (
            <li
              key={conv.user_id}
              onClick={() => navigate(`/chat/${conv.user_id}`)}
              style={{ cursor: 'pointer', padding: '5px 0' }}
            >
              {conv.firstname} {conv.lastname} - Unread: {conv.unread_count}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ConversationsList;