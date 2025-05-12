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
  const [artisanIdInput, setArtisanIdInput] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const messagesEndRef = useRef(null);

  const setErrorWithTimeout = (message) => {
    setError(message);
    setTimeout(() => setError(""), 5000);
  };

  // Fetch conversations for the sidebar
  useEffect(() => {
    if (!user) {
      console.log("No user logged in, redirecting to /");
      navigate("/");
      return;
    }

    const fetchConversations = async () => {
      try {
        console.log(`Fetching conversations for user ID: ${user.id}`);
        const response = await fetch(
          `http://localhost:8080/api/messages/conversations-summary/${user.id}`,
          { credentials: "include" }
        );
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`Failed to fetch conversations: ${errorData.error || response.statusText}`);
        }
        const data = await response.json();
        console.log("Conversations fetched:", data);
        setConversations(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching conversations:", err.message, err.stack);
        setErrorWithTimeout("Failed to load conversations.");
        setLoading(false);
      }
    };

    fetchConversations();
  }, [user, navigate]);

  // Handle artisanId from URL
  useEffect(() => {
    if (!artisanId || !user) return;

    const fetchArtisanUser = async () => {
      try {
        console.log(`Fetching artisan data for ID: ${artisanId}`);
        const artisanResponse = await fetch(`http://localhost:8080/artisan/${artisanId}`, {
          credentials: "include",
        });
        if (!artisanResponse.ok) {
          const errorData = await artisanResponse.json().catch(() => ({}));
          throw new Error(`Invalid artisan: ${errorData.error || artisanResponse.statusText}`);
        }
        const artisan = await artisanResponse.json();
        console.log("Artisan data:", artisan);

        console.log(`Fetching user linked to artisan ID: ${artisanId}`);
        const userResponse = await fetch(`http://localhost:8080/users/by-artisan/${artisanId}`, {
          credentials: "include",
        });
        if (!userResponse.ok) {
          const errorData = await userResponse.json().catch(() => ({}));
          throw new Error(`No user linked to artisan: ${errorData.error || userResponse.statusText}`);
        }
        const userData = await userResponse.json();
        console.log("Linked user data:", userData);

        const conversation = {
          receiver_id: userData.id,
          artisan_id: parseInt(artisanId),
          first_name: artisan.firstname,
          last_name: artisan.lastname,
        };
        setSelectedConversation(conversation);
        console.log("Selected conversation set from URL:", conversation);

        // Update conversations to include this artisan if not present
        setConversations((prev) => {
          const exists = prev.some(
            (conv) =>
              (conv.sender_id === user.id && conv.receiver_id === userData.id) ||
              (conv.sender_id === userData.id && conv.receiver_id === user.id)
          );
          if (!exists) {
            return [
              ...prev,
              {
                sender_id: user.id,
                receiver_id: userData.id,
                first_name: artisan.firstname,
                last_name: artisan.lastname,
                artisan_id: parseInt(artisanId),
                content: "",
                unread_count: 0,
              },
            ];
          }
          return prev;
        });
      } catch (err) {
        console.error("Error validating artisan from URL:", err.message, err.stack);
        setErrorWithTimeout(err.message);
      }
    };

    fetchArtisanUser();
  }, [artisanId, user]);

  // Fetch messages for the selected conversation
  useEffect(() => {
    if (!selectedConversation || !user) return;

    const fetchMessages = async () => {
      try {
        console.log(`Fetching messages for user ${user.id} and receiver ${selectedConversation.receiver_id}`);
        const response = await fetch(
          `http://localhost:8080/api/messages/conversations/${user.id}/${selectedConversation.receiver_id}`,
          { credentials: "include" }
        );
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`Failed to fetch messages: ${errorData.error || response.statusText}`);
        }
        const data = await response.json();
        setMessages(data);
        console.log("Messages fetched:", data);

        console.log(`Marking messages as read from ${selectedConversation.receiver_id} to ${user.id}`);
        await fetch(`http://localhost:8080/api/messages/mark-as-read`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sender_id: selectedConversation.receiver_id,
            receiver_id: user.id,
          }),
          credentials: "include",
        });
      } catch (err) {
        console.error("Error fetching messages:", err.message, err.stack);
        setErrorWithTimeout("Failed to load messages.");
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [selectedConversation, user]);

  // Scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle sending a new message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) {
      setErrorWithTimeout("Message cannot be empty.");
      return;
    }

    try {
      console.log(`Sending message from ${user.id} to ${selectedConversation.receiver_id}: ${newMessage}`);
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
      console.log("Message sent:", sentMessage);

      // Update conversations to reflect new message
      setConversations((prev) =>
        prev.map((conv) =>
          (conv.sender_id === user.id && conv.receiver_id === selectedConversation.receiver_id) ||
          (conv.sender_id === selectedConversation.receiver_id && conv.receiver_id === user.id)
            ? { ...conv, content: newMessage, timestamp: sentMessage.timestamp }
            : conv
        )
      );

      setNewMessage("");
      setError("");
    } catch (err) {
      console.error("Error sending message:", err.message, err.stack);
      setErrorWithTimeout(err.message);
    }
  };

  // Handle confirming a deal
  const handleConfirmDeal = async () => {
    if (isConfirming) {
      console.log("[Confirm Deal] Already processing, ignoring click");
      return;
    }

    setIsConfirming(true);
    try {
      console.log(`[Confirm Deal] Starting for artisan ${selectedConversation.artisan_id} and user ${user.id}`);
      console.log(`[Confirm Deal] Calling /confirm-deal with payload:`, {
        artisanId: parseInt(selectedConversation.artisan_id),
        userId: user.id,
      });
      const confirmResponse = await fetch(`http://localhost:8080/confirm-deal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artisanId: parseInt(selectedConversation.artisan_id), userId: user.id }),
        credentials: "include",
      });

      if (!confirmResponse.ok) {
        const errorData = await confirmResponse.json();
        throw new Error(`Failed to confirm deal: ${errorData.error || confirmResponse.statusText}`);
      }

      const confirmData = await confirmResponse.json();
      console.log("[Confirm Deal] /confirm-deal response:", confirmData);

      console.log(`[Confirm Deal] Fetching artisan data for ID: ${selectedConversation.artisan_id}`);
      const artisanResponse = await fetch(`http://localhost:8080/artisan/${selectedConversation.artisan_id}`, {
        credentials: "include",
      });
      if (!artisanResponse.ok) throw new Error("Failed to fetch artisan data");
      const artisanData = await artisanResponse.json();
      const currentCoins = artisanData.coins || 0;
      console.log(`[Confirm Deal] Artisan coins before deduction: ${currentCoins}`);

      const newCoins = Math.max(0, currentCoins - 25);
      console.log(`[Confirm Deal] Calculated new coins: ${newCoins} (deducting 25 from ${currentCoins})`);

      console.log(`[Confirm Deal] Updating coins to ${newCoins} via /artisan/${selectedConversation.artisan_id}/update-coins`);
      const updateCoinsResponse = await fetch(`http://localhost:8080/artisan/${selectedConversation.artisan_id}/update-coins`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coins: newCoins }),
        credentials: "include",
      });

      if (!updateCoinsResponse.ok) {
        const errorData = await updateCoinsResponse.json();
        throw new Error(`Failed to update artisan coins: ${errorData.error || updateCoinsResponse.statusText}`);
      }

      console.log(`[Confirm Deal] Coins updated successfully. New balance: ${newCoins}`);
      alert(`${confirmData.message} 25 coins have been deducted from the artisan's balance.`);

      const updatedUser = { ...user, hasConfirmedDeal: true, lastConfirmedArtisanId: selectedConversation.artisan_id };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      console.log(`[Confirm Deal] Navigating to /review/${selectedConversation.artisan_id}`);
      navigate(`/review/${selectedConversation.artisan_id}`);
    } finally {
      setIsConfirming(false);
    }
  };

  // Handle artisan ID input submission
  const handleArtisanIdSubmit = async (e) => {
    e.preventDefault();
    if (!artisanIdInput.trim() || isNaN(parseInt(artisanIdInput))) {
      setErrorWithTimeout("Please enter a valid artisan ID.");
      return;
    }

    try {
      console.log(`Fetching artisan data for input ID: ${artisanIdInput}`);
      const artisanResponse = await fetch(`http://localhost:8080/artisan/${artisanIdInput}`, {
        credentials: "include",
      });
      if (!artisanResponse.ok) {
        const errorData = await artisanResponse.json().catch(() => ({}));
        throw new Error(`Invalid artisan: ${errorData.error || artisanResponse.statusText}`);
      }
      const artisan = await artisanResponse.json();
      console.log("Artisan data from input:", artisan);

      console.log(`Fetching user linked to artisan ID: ${artisanIdInput}`);
      const userResponse = await fetch(`http://localhost:8080/users/by-artisan/${artisanIdInput}`, {
        credentials: "include",
      });
      if (!userResponse.ok) {
        const errorData = await userResponse.json().catch(() => ({}));
        throw new Error(`No user linked to artisan: ${errorData.error || userResponse.statusText}`);
      }
      const userData = await userResponse.json();
      console.log("Linked user data from input:", userData);

      const conversation = {
        receiver_id: userData.id,
        artisan_id: parseInt(artisanIdInput),
        first_name: artisan.firstname,
        last_name: artisan.lastname,
      };
      setSelectedConversation(conversation);
      console.log("Selected conversation set from input:", conversation);

      // Update conversations to include this artisan if not present
      setConversations((prev) => {
        const exists = prev.some(
          (conv) =>
            (conv.sender_id === user.id && conv.receiver_id === userData.id) ||
            (conv.sender_id === userData.id && conv.receiver_id === user.id)
        );
        if (!exists) {
          return [
            ...prev,
            {
              sender_id: user.id,
              receiver_id: userData.id,
              first_name: artisan.firstname,
              last_name: artisan.lastname,
              artisan_id: parseInt(artisanIdInput),
              content: "",
              unread_count: 0,
            },
          ];
        }
        return prev;
      });

      setArtisanIdInput("");
      setError("");
    } catch (err) {
      console.error("Error starting chat with artisan ID input:", err.message, err.stack);
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
        <form onSubmit={handleArtisanIdSubmit} className="artisan-id-form">
          <input
            type="text"
            value={artisanIdInput}
            onChange={(e) => setArtisanIdInput(e.target.value)}
            placeholder="Enter Artisan ID"
          />
          <button type="submit">Start Chat</button>
        </form>
      </div>

      <div className="chat-main">
        {selectedConversation ? (
          <>
            <div className="chat-header">
              <h3>
                Chat with {selectedConversation.first_name} {selectedConversation.last_name}
              </h3>
              {user && !user.artisanId && selectedConversation.artisan_id && (
                <button
                  onClick={handleConfirmDeal}
                  className="confirm-deal-button"
                  disabled={isConfirming}
                >
                  Confirm Deal
                </button>
              )}
            </div>
            <div className="messages">
              {messages.length === 0 ? (
                <p>No messages yet. Start the conversation!</p>
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
          <p>Select a conversation or enter an artisan ID to start chatting, it is the last number in route.</p>
        )}
      </div>
    </div>
  );
}

export default Chat;