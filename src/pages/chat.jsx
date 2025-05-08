import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

function Chat({ currentUser }) {
  const { artisanId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const { isArtisan, artisanId: currentArtisanId, coins, updateCoins } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!currentUser) return;
    fetchMessages();
    if (currentUser.id !== artisanId) {
      markMessagesAsRead();
    }
  }, [currentUser, artisanId]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/messages/conversations/${currentUser.id}/${artisanId}`
      );
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const markMessagesAsRead = async () => {
    try {
      await fetch("http://localhost:8080/api/messages/mark-as-read", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender_id: artisanId, receiver_id: currentUser.id }),
      });
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const response = await fetch("http://localhost:8080/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender_id: currentUser.id,
          receiver_id: artisanId,
          content: newMessage,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessages([...messages, data]);
        setNewMessage("");
        if (isArtisan) {
          const coinsResponse = await fetch(`http://localhost:8080/artisan/${currentArtisanId}/coins`);
          if (coinsResponse.ok) {
            const { coins: newCoins } = await coinsResponse.json();
            updateCoins(newCoins);
          }
        }
      } else {
        if (data.error === "Insufficient coins. Please purchase more.") {
          alert("You have insufficient coins. Please purchase more to continue messaging.");
          navigate("/purchase-coins");
        } else {
          alert("Failed to send message: " + data.error);
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message.");
    }
  };

  const handlePurchaseCoins = async () => {
    try {
      const response = await fetch(`http://localhost:8080/artisan/${currentArtisanId}/purchase-coins`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 50 }),
      });
      if (response.ok) {
        const { coins: newCoins } = await response.json();
        updateCoins(newCoins);
        alert("Coins purchased successfully!");
        navigate(`/chat/${artisanId}`);
      } else {
        alert("Failed to purchase coins.");
      }
    } catch (error) {
      console.error("Error purchasing coins:", error);
      alert("Failed to purchase coins.");
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!currentUser) {
    return <p>Please log in to chat.</p>;
  }

  return (
    <div className="chat-container" style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h2>Chat</h2>
      {isArtisan && coins !== null && (
        <div style={{ marginBottom: "10px" }}>
          Coins: {coins}
          {coins < 25 && (
            <button
              onClick={handlePurchaseCoins}
              style={{ marginLeft: "10px", color: "red" }}
            >
              Purchase Coins
            </button>
          )}
        </div>
      )}
      <div
        className="messages"
        style={{
          border: "1px solid #ccc",
          padding: "10px",
          height: "400px",
          overflowY: "auto",
          marginBottom: "10px",
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              textAlign: msg.sender_id === currentUser.id ? "right" : "left",
              margin: "10px",
            }}
          >
            <p
              style={{
                display: "inline-block",
                padding: "8px",
                borderRadius: "8px",
                background: msg.sender_id === currentUser.id ? "#007bff" : "#f1f1f1",
                color: msg.sender_id === currentUser.id ? "white" : "black",
              }}
            >
              {msg.content}
            </p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="message-input" style={{ display: "flex" }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          style={{ flex: 1, padding: "8px" }}
        />
        <button
          onClick={handleSendMessage}
          style={{ padding: "8px 16px", marginLeft: "10px" }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default Chat;