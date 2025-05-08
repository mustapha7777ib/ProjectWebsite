import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
    if (loading) return;
    if (!user) {
      navigate("/signin");
      return;
    }
    if (!recipientId || recipientId === "undefined") {
      setError("Please select a valid user to chat with");
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
          await fetch(`http://localhost:8080/api/messages/mark-as-read`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sender_id: recipientId, receiver_id: user.id }),
          });
        } else {
          setError(`Failed to fetch messages: ${response.status}`);
        }
      } catch (err) {
        console.error("Error fetching messages:", err);
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

      if (response.ok) {
        const newMsg = await response.json();
        setMessages([...messages, newMsg]);
        setNewMessage("");
        setError("");
        // Update coins if deducted (first reply)
        if (isArtisan) {
          const coinsResponse = await fetch(`http://localhost:8080/artisan/${artisanId}/coins`);
          if (coinsResponse.ok) {
            const { coins: updatedCoins } = await coinsResponse.json();
            updateCoins(updatedCoins);
          }
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || `Failed to send message: ${response.status}`);
      }
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Error sending message. Please try again.");
    }
  };

  const handlePurchaseCoins = async () => {
    try {
      const response = await fetch(`http://localhost:8080/artisan/${artisanId}/purchase-coins`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 50 }),
      });

      if (response.ok) {
        const { coins: newCoins } = await response.json();
        updateCoins(newCoins);
        setError("");
        alert("Coins purchased successfully!");
      } else {
        setError(`Failed to purchase coins: ${response.status}`);
      }
    } catch (err) {
      console.error("Error purchasing coins:", err);
      setError("Error purchasing coins. Please try again.");
    }
  };

  if (loading || fetchLoading) {
    return <div className="text-center text-gray-500">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Chat with {recipientId}
      </h2>
      {error && (
        <p className="text-red-500 bg-red-100 p-2 rounded mb-4">{error}</p>
      )}
      <div className="h-96 overflow-y-auto mb-4 p-4 border border-gray-200 rounded">
        {messages.length === 0 ? (
          <p className="text-gray-500">No messages yet.</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`mb-2 p-2 rounded max-w-xs ${
                msg.sender_id === user.id ? "bg-blue-100 ml-auto" : "bg-gray-100 mr-auto"
              }`}
            >
              <p className="text-sm">{msg.content}</p>
              <p className="text-xs text-gray-500">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </p>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      {isArtisan && coins < 25 && (
        <div className="mb-4 p-4 bg-yellow-100 rounded">
          <p className="text-yellow-800">
            You need more coins to send your first message to this user.
          </p>
          <button
            onClick={handlePurchaseCoins}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Purchase 50 Coins
          </button>
        </div>
      )}
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default Chat;