import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

function Review() {
  const { artisanId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [dealId, setDealId] = useState("");
  const [deals, setDeals] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/signin");
      return;
    }
    const fetchDeals = async () => {
      try {
        const response = await fetch(`http://localhost:8080/artisan/${artisanId}`, {
          credentials: "include",
        });
        if (!response.ok) throw new Error("Failed to fetch artisan deals");
        const data = await response.json();
        const userDeals = data.deals.filter((deal) => deal.user_id === user.id);
        setDeals(userDeals);
      } catch (err) {
        console.error("Error fetching deals:", err);
        setError("Failed to load deals.");
      }
    };
    fetchDeals();
  }, [user, artisanId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating || !comment || !dealId) {
      setError("Please provide a rating, comment, and select a deal.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          artisanId: parseInt(artisanId),
          rating,
          comment,
          dealId: parseInt(dealId),
          userId: user.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit review");
      }

      setSuccess("Review submitted successfully!");
      setTimeout(() => navigate("/conversations"), 2000);
    } catch (err) {
      console.error("Error submitting review:", err);
      setError(err.message);
    }
  };

  if (!user) return <p>Please log in to submit a review.</p>;

  return (
    <div className="review-container">
      <h2>Review Artisan</h2>
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}
      <form onSubmit={handleSubmit}>
        <label>
          Select Deal: <span className="aesterik">*</span>
          <select
            value={dealId}
            onChange={(e) => setDealId(e.target.value)}
            required
          >
            <option value="">Select a deal</option>
            {deals.map((deal) => (
              <option key={deal.id} value={deal.id}>
                Deal with {deal.first_name} {deal.last_name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Rating (1-5): <span className="aesterik">*</span>
          <input
            type="number"
            min="1"
            max="5"
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            required
          />
        </label>
        <label>
          Comment: <span className="aesterik">*</span>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
          />
        </label>
        <button type="submit" className="submitbutton">
          Submit Review
        </button>
      </form>
    </div>
  );
}

export default Review;