import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

function Chat() {
  const { user, loading, error: authError } = useAuth();
  const { recipientId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    console.log("Chat.jsx: user:", user, "user.id:", user?.id, "recipientId:", recipientId, "URL:", window.location.href);
    if (loading) return;
    if (!user || !user.id) {
      console.log("User not logged in, redirecting to signin");
      navigate("/signin");
      return;
    }
    if (!recipientId || isNaN(recipientId)) {
      console.error("Invalid recipientId:", recipientId);
      setError("Invalid recipient ID");
      return;
    }

    const fetchMessages = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/api/messages/conversations/${user.id}/${recipientId}`
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch messages: ${response.status}`);
        }
        const data = await response.json();
        console.log("Messages fetched:", data);
        setMessages(data);
        setError("");
      } catch (err) {
        console.error("Error fetching messages:", err.message);
        setError("Failed to load messages. Please try again.");
      }
    };

    fetchMessages();
  }, [user, recipientId, loading, navigate]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) {
      setError("Message cannot be empty");
      return;
    }
    if (!user.id || !recipientId) {
      setError("Invalid user or recipient ID");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender_id: user.id,
          receiver_id: recipientId,
          content: newMessage,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to send message: ${response.status}`);
      }

      const sentMessage = await response.json();
      console.log("Message sent:", sentMessage);
      setMessages([...messages, sentMessage]);
      setNewMessage("");
      setError("");
    } catch (err) {
      console.error("Error sending message:", err.message);
      setError("Failed to send message. Please try again.");
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="chat-container">
      <h2 className="chat-title">Chat</h2>
      {authError && <p className="error-message">{authError}</p>}
      {error && <p className="error-message">{error}</p>}
      <div className="messages">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message ${msg.sender_id === user.id ? "sent" : "received"}`}
          >
            <div className="message-box">
              <p>{msg.content}</p>
              <span className="timestamp">{new Date(msg.timestamp).toLocaleTimeString()}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="message-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="form-input"
        />
        <button onClick={handleSendMessage} className="send-btn">
          Send
        </button>
      </div>
    </div>
  );
}

export default Chat;