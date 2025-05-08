import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const Conversations = () => {
  const { user, artisanId } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    const id = artisanId || user.id;
    fetch(`http://localhost:8080/api/messages/conversations-summary/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch conversations');
        return res.json();
      })
      .then(data => setConversations(data))
      .catch(err => {
        console.error('Error fetching conversations:', err);
        setError('Could not load conversations');
      });
  }, [user, artisanId]);

  const goToChat = (participantId) => {
    navigate(`/chat/${participantId}`);
  };

  if (!user) {
    return <p>Please log in to view conversations.</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  return (
    <div className='conversations' style={{ padding: "20px" }}>
      <h2>Inbox</h2>
      {conversations.length === 0 ? (
        <p>No conversations yet.</p>
      ) : (
        conversations.map((msg, index) => {
          const otherUserId = msg.sender_id === (artisanId || user.id) ? msg.receiver_id : msg.sender_id;
          const name = `${msg.firstname} ${msg.lastname}`;
          return (
            <div
              key={index}
              onClick={() => goToChat(otherUserId)}
              style={{ cursor: 'pointer', borderBottom: '1px solid #ccc', padding: '10px' }}
            >
              <p><strong>{name}</strong> {msg.unread_count > 0 && `(${msg.unread_count} unread)`}</p>
              <p>{msg.content}</p>
              <small>{new Date(msg.timestamp).toLocaleString()}</small>
            </div>
          );
        })
      )}
    </div>
  );
};

export default Conversations;