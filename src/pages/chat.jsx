import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "./AuthContext";

function Chat() {
  const { user, artisanId, isArtisan, coins, loading, updateCoins } = useAuth();
  const { recipientId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState("");
  const [fetchLoading, setFetchLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Chat.jsx: user:", user, "user.id:", user?.id, "recipientId:", recipientId, "URL:", window.location.href);
    if (loading) return;
    if (!user || !user.id) {
      console.log("No user or user.id, redirecting to signin");
      navigate("/signin");
      return;
    }
    if (!recipientId || recipientId === "undefined") {
      console.error("Invalid recipientId:", recipientId);
      setError("Invalid recipient selected. Please choose a conversation.");
      return;
    }

    const fetchMessages = async () => {
      try {
        setFetchLoading(true);
        console.log(`Fetching messages for senderId: ${user.id}, recipientId: ${recipientId}`);
        const response = await fetch(
          `http://localhost:8080/api/messages/conversations/${user.id}/${recipientId}`
        );
        if (response.ok) {
          const data = await response.json();
          setMessages(data);
          setError("");
          // Mark messages as read
          const markReadResponse = await fetch(`http://localhost:8080/api/messages/mark-as-read`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sender_id: recipientId, receiver_id: user.id }),
          });
          if (!markReadResponse.ok) {
            console.error("Failed to mark messages as read:", markReadResponse.status, markReadResponse.statusText);
          }
        } else {
          console.error("Fetch messages failed:", response.status, response.statusText);
          setError(`Failed to fetch messages: ${response.status}`);
        }
      } catch (err) {
        console.error("Error fetching messages:", err.message, err.stack);
        setError("Error fetching messages. Please try again.");
      } finally {
        setFetchLoading(false);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [user, recipientId, navigate, loading]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) {
      setError("Message cannot be empty");
      return;
    }
    if (!user?.id) {
      setError("User not logged in");
      navigate("/signin");
      return;
    }
    if (!recipientId || recipientId === "undefined") {
      setError("No recipient selected");
      return;
    }

    const payload = {
      sender_id: user.id,
      receiver_id: recipientId,
      content: newMessage,
    };
    console.log("Sending message payload:", payload);

    try {
      const response = await fetch("http://localhost:8080/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const newMsg = await response.json();
        setMessages([...messages, newMsg]);
        setNewMessage("");
        setError("");
        // Update coins for artisans after first reply
        if (isArtisan && artisanId) {
          const coinsResponse = await fetch(`http://localhost:8080/artisan/${artisanId}/coins`);
          if (coinsResponse.ok) {
            const { coins: updatedCoins } = await coinsResponse.json();
            console.log("Updated coins:", updatedCoins);
            updateCoins(updatedCoins);
          } else {
            console.error("Failed to fetch coins:", coinsResponse.status, coinsResponse.statusText);
          }
        }
      } else {
        const errorData = await response.json();
        console.error("Send message failed:", errorData);
        setError(errorData.error || `Failed to send message: ${response.status}`);
      }
    } catch (err) {
      console.error("Error sending message:", err.message, err.stack);
      setError("Error sending message. Please try again.");
    }
  };

  if (loading || fetchLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (!recipientId || recipientId === "undefined") {
    return (
      <div className="chatbox chat-container">
        <h2 className="chat-title">Chat Error</h2>
        <p className="error-message">
          {error}
          <br />
          <Link to="/conversations" className="conversation-link">
            Go to Conversations
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="chatbox chat-container">
      <h2 className="chat-title">Chat with User {recipientId}</h2>
      {error && (
        <p className="error-message">
          {error}
          <br />
          <Link to="/conversations" className="conversation-link">
            Go to Conversations
          </Link>
        </p>
      )}
      <div className="message-area">
        {messages.length === 0 ? (
          <p className="no-messages">No messages yet.</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`message ${msg.sender_id === user.id ? "message-sent" : "message-received"}`}
            >
              <p className="message-content">{msg.content}</p>
              <p className="message-timestamp">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </p>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      {isArtisan && coins < 25 && (
        <div className="coin-warning">
          <p className="coin-warning-text">
            You need more coins to send your first message to this user.
          </p>
          <Link to="/purchase-coins" className="purchase-coins-btn">
            Purchase Coins
          </Link>
        </div>
      )}
      <form onSubmit={handleSendMessage} className="message-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="message-input"
        />
        <button
          type="submit"
          className="send-btn"
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default Chat;