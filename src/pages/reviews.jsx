import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

function Review() {
  const { artisanId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [deals, setDeals] = useState([]);
  const [reviewData, setReviewData] = useState({
    dealId: "",
    rating: 0,
    comment: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Review.jsx: Component mounted. User:", user, "Artisan ID:", artisanId);
    const fetchDeals = async () => {
      if (!user || !user?.id || !artisanId) {
        console.error("Review.jsx: Missing user, user.id, or artisanId", { user, artisanId });
        setError("You must be logged in to submit a review.");
        setLoading(false);
        return;
      }

      try {
        console.log("Review.jsx: Fetching artisan data for ID:", artisanId);
        const response = await fetch(`http://localhost:8080/artisan/${artisanId}`, {
          credentials: "include",
        });
        console.log("Review.jsx: Fetch response status:", response.status);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Review.jsx: Fetched artisan data:", data);

        // Filter deals for the current user with job postings
        const userDeals = (data.deals || []).filter(
          (deal) => Number(deal.user_id) === Number(user.id) && deal.job_posting
        );
        console.log("Review.jsx: Filtered user deals:", userDeals);
        setDeals(userDeals);
        if (userDeals.length === 0) {
          setError("No eligible deals found. You can only review deals with job postings.");
        }
        setLoading(false);
      } catch (err) {
        console.error("Review.jsx: Error fetching deals:", err.message);
        setError(`Failed to load deals: ${err.message}`);
        setLoading(false);
      }
    };

    fetchDeals();
  }, [user, artisanId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Review.jsx: Submitting review:", reviewData);
    if (!reviewData.dealId || !reviewData.rating || !reviewData.comment) {
      setError("Please provide a deal, rating, and comment.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          artisanId: parseInt(artisanId),
          rating: parseInt(reviewData.rating),
          comment: reviewData.comment,
          dealId: parseInt(reviewData.dealId),
          userId: parseInt(user.id),
        }),
      });
      console.log("Review.jsx: Submit response status:", response.status);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to submit review (Status: ${response.status})`);
      }

      setSuccess("Review submitted successfully!");
      setReviewData({ dealId: "", rating: 0, comment: "" });
      setTimeout(() => {
        navigate(`/artisan-profile/${artisanId}`);
      }, 2000);
    } catch (err) {
      console.error("Review.jsx: Error submitting review:", err.message);
      setError(`Error submitting review: ${err.message}`);
    }
  };

  console.log("Review.jsx: Rendering. Loading:", loading, "Error:", error, "Deals:", deals);

  if (!user || !user?.id) {
    console.log("Review.jsx: No user or user.id, showing login prompt");
    return (
      <div className="review-container">
        <p className="error-message">Please log in to submit a review.</p>
        <button
          onClick={() => navigate("/signin")}
          className="submitbutton"
        >
          Log In
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="review-container">
        <p>Loading deals...</p>
      </div>
    );
  }

  return (
    <div className="review-container">
      <h1>Submit a Review for Artisan {artisanId}</h1>
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}
      {deals.length === 0 ? (
        <p>No eligible deals found. You can only review deals with job postings.</p>
      ) : (
        <form onSubmit={handleSubmit} className="review-form">
          <label>
            Select Deal: <span className="aesterik">*</span>
            <select
              value={reviewData.dealId}
              onChange={(e) =>
                setReviewData({ ...reviewData, dealId: e.target.value })
              }
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
              value={reviewData.rating}
              onChange={(e) =>
                setReviewData({ ...reviewData, rating: Number(e.target.value) })
              }
              required
            />
          </label>
          <label>
            Comment: <span className="aesterik">*</span>
            <textarea
              value={reviewData.comment}
              onChange={(e) =>
                setReviewData({ ...reviewData, comment: e.target.value })
              }
              required
            />
          </label>
          <button type="submit" className="submitbutton">
            Submit Review
          </button>
        </form>
      )}
    </div>
  );
}

export default Review;