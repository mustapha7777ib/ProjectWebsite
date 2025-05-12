import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

function Chat() {
  const { user } = useAuth();
  const { artisanId } = useParams();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const setErrorWithTimeout = (message) => {
    setError(message);
    setTimeout(() => setError(""), 5000);
  };

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }

    const fetchConversations = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/api/messages/conversations-summary/${user.id}`,
          { credentials: "include" }
        );
        if (!response.ok) throw new Error("Failed to fetch conversations");
        const data = await response.json();
        setConversations(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching conversations:", err);
        setErrorWithTimeout("Failed to load conversations.");
        setLoading(false);
      }
    };

    fetchConversations();
  }, [user, navigate]);

  useEffect(() => {
    if (artisanId && user) {
      const fetchArtisanUser = async () => {
        try {
          const artisanResponse = await fetch(`http://localhost:8080/artisan/${artisanId}`);
          if (!artisanResponse.ok) throw new Error("Invalid artisan");
          const artisan = await artisanResponse.json();
          const userResponse = await fetch(`http://localhost:8080/users/by-artisan/${artisanId}`);
          if (!userResponse.ok) throw new Error("No user linked to artisan");
          const userData = await userResponse.json();
          setSelectedConversation({
            receiver_id: userData.id,
            artisan_id: parseInt(artisanId),
            first_name: artisan.firstname,
            last_name: artisan.lastname,
          });
        } catch (err) {
          console.error("Error validating artisan:", err);
          setErrorWithTimeout("Invalid artisan selected.");
        }
      };
      fetchArtisanUser();
    }
  }, [artisanId, user]);

  useEffect(() => {
    if (selectedConversation) {
      const fetchMessages = async () => {
        try {
          const response = await fetch(
            `http://localhost:8080/api/messages/conversations/${user.id}/${selectedConversation.receiver_id}`,
            { credentials: "include" }
          );
          if (!response.ok) throw new Error("Failed to fetch messages");
          const data = await response.json();
          setMessages(data);

          await fetch(
            `http://localhost:8080/api/messages/mark-as-read`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                sender_id: selectedConversation.receiver_id,
                receiver_id: user.id,
              }),
              credentials: "include",
            }
          );
        } catch (err) {
          console.error("Error fetching messages:", err);
          setErrorWithTimeout("Failed to load messages.");
        }
      };

      fetchMessages();
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedConversation, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) {
      setErrorWithTimeout("Message cannot be empty.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender_id: user.id,
          receiver_id: selectedConversation.receiver_id,
          content: newMessage,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send message");
      }

      const sentMessage = await response.json();
      setMessages((prev) => [...prev, sentMessage]);
      setNewMessage("");
      setError("");
    } catch (err) {
      console.error("Error sending message:", err);
      setErrorWithTimeout(err.message);
    }
  };

  const handleConfirmDeal = async () => {
    try {
      const response = await fetch(`http://localhost:8080/confirm-deal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artisanId: parseInt(selectedConversation.artisan_id), userId: user.id }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to confirm deal");
      }

      const data = await response.json();
      alert(data.message);
      // Update user state or local storage to indicate a deal was confirmed
      const updatedUser = { ...user, hasConfirmedDeal: true, lastConfirmedArtisanId: selectedConversation.artisan_id };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      navigate(`/edit-profile`);
    } catch (err) {
      console.error("Error confirming deal:", err);
      setErrorWithTimeout(err.message);
    }
  };

  if (loading) return <p>Loading conversations...</p>;
  if (!user) return <p>Please log in to view chats.</p>;

  return (
    <div className="chat-container">
      <div className="sidebar">
        <h2>Conversations</h2>
        {error && <p className="error-message">{error}</p>}
        {conversations.length === 0 ? (
          <p>No conversations yet.</p>
        ) : (
          <ul>
            {conversations.map((conv) => (
              <li
                key={`${conv.sender_id}-${conv.receiver_id}`}
                onClick={() =>
                  setSelectedConversation({
                    receiver_id: conv.sender_id === user.id ? conv.receiver_id : conv.sender_id,
                    first_name: conv.first_name,
                    last_name: conv.last_name,
                    artisan_id: conv.artisan_id,
                  })
                }
                className={selectedConversation?.receiver_id === (conv.sender_id === user.id ? conv.receiver_id : conv.sender_id) ? "active" : ""}
              >
                {conv.first_name} {conv.last_name}
                {conv.unread_count > 0 && <span className="unread-count">{conv.unread_count}</span>}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="chat-main">
        {selectedConversation ? (
          <>
            <div className="chat-header">
              <h3>
                Chat with {selectedConversation.first_name} {selectedConversation.last_name}
              </h3>
              {user && !user.artisanId && selectedConversation.artisan_id && (
                <button onClick={handleConfirmDeal} className="confirm-deal-button">
                  Confirm Deal
                </button>
              )}
            </div>
            <div className="messages">
              {messages.length === 0 ? (
                <p>No messages yet.</p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`message ${msg.sender_id === user.id ? "sent" : "received"}`}
                  >
                    <p>{msg.content}</p>
                    <small>{new Date(msg.timestamp).toLocaleString()}</small>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="message-form">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
              />
              <button type="submit">Send</button>
            </form>
          </>
        ) : (
          <p>Select a conversation to start chatting.</p>
        )}
      </div>
    </div>
  );
}

export default Chat;