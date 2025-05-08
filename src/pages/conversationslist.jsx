import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ConversationsList = ({ artisanId }) => {
  const [conversations, setConversations] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await fetch(`/api/messages/conversations/${artisanId}`);
        const data = await res.json();
        setConversations(data);
      } catch (err) {
        console.error('Failed to load conversations', err);
      }
    };

    fetchConversations();
  }, [artisanId]);

  return (
    <div>
      <h2>Your Conversations</h2>
      <ul>
        {conversations.map((conv) => (
          <li key={conv.user_id} onClick={() => navigate(`/chat/${conv.user_id}`)}>
            {conv.firstname} {conv.lastname} - Unread: {conv.unread_count}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ConversationsList;
