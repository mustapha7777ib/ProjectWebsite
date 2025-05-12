import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

function ArtisanProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const artisanId = user?.artisanId;
  const [artisan, setArtisan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({
    dealId: "",
    rating: 0,
    comment: "",
  });
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");
  const [reviews, setReviews] = useState([]);
  const [jobPostingData, setJobPostingData] = useState({
    dealId: "",
    description: "",
    image: null,
  });
  const [jobPostingError, setJobPostingError] = useState("");
  const [jobPostingSuccess, setJobPostingSuccess] = useState("");

  useEffect(() => {
    if (!user || !artisanId) {
      console.log("ArtisanProfile.jsx: No user or artisanId, redirecting to signin");
      navigate("/signin");
      return;
    }

    const fetchArtisan = async () => {
      try {
        console.log(`ArtisanProfile.jsx: Fetching artisan data for ID: ${artisanId}`);
        const response = await fetch(`http://localhost:8080/artisan/${artisanId}`, {
          credentials: "include",
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`Failed to fetch artisan: ${errorData.error || response.statusText}`);
        }
        const data = await response.json();
        console.log("ArtisanProfile.jsx: Artisan data fetched:", data);
        setArtisan(data);
        setLoading(false);
      } catch (err) {
        console.error("ArtisanProfile.jsx: Error fetching artisan:", err.message);
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      try {
        console.log(`ArtisanProfile.jsx: Fetching reviews for artisan ID: ${artisanId}`);
        const response = await fetch(`http://localhost:8080/artisan/${artisanId}/reviews`, {
          credentials: "include",
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`Failed to fetch reviews: ${errorData.error || response.statusText}`);
        }
        const data = await response.json();
        console.log("ArtisanProfile.jsx: Reviews fetched:", data);
        setReviews(data);
      } catch (err) {
        console.error("ArtisanProfile.jsx: Error fetching reviews:", err.message);
      }
    };

    fetchArtisan();
    fetchReviews();
  }, [artisanId, user, navigate]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewData.dealId || !reviewData.rating || !reviewData.comment) {
      setReviewError("Please provide a deal, rating, and comment.");
      return;
    }

    try {
      console.log("ArtisanProfile.jsx: Submitting review:", reviewData);
      const response = await fetch("http://localhost:8080/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          artisanId: artisanId,
          rating: reviewData.rating,
          comment: reviewData.comment,
          dealId: parseInt(reviewData.dealId),
          userId: user.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit review");
      }

      setReviewSuccess("Review submitted successfully!");
      setReviewData({ dealId: "", rating: 0, comment: "" });
      setTimeout(() => {
        setShowReviewModal(false);
        setReviewSuccess("");
        // Refresh reviews
        const fetchReviews = async () => {
          const response = await fetch(`http://localhost:8080/artisan/${artisanId}/reviews`, {
            credentials: "include",
          });
          if (response.ok) {
            const data = await response.json();
            setReviews(data);
          }
        };
        fetchReviews();
      }, 2000);
    } catch (err) {
      console.error("ArtisanProfile.jsx: Error submitting review:", err.message);
      setReviewError(err.message);
    }
  };

  const handleJobPostingSubmit = async (e) => {
    e.preventDefault();
    if (!jobPostingData.dealId || !jobPostingData.description || !jobPostingData.image) {
      setJobPostingError("Please provide a deal, description, and image.");
      return;
    }

    const formData = new FormData();
    formData.append("dealId", parseInt(jobPostingData.dealId));
    formData.append("description", jobPostingData.description);
    formData.append("image", jobPostingData.image);

    try {
      console.log(`ArtisanProfile.jsx: Submitting job posting for artisan ID: ${artisanId}`);
      const response = await fetch(`http://localhost:8080/artisan/${artisanId}/add-job-posting`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to add job posting: ${errorData.error || response.statusText}`);
      }

      const data = await response.json();
      console.log("ArtisanProfile.jsx: Job posting added:", data);
      setJobPostingSuccess("Job posting added successfully!");
      setJobPostingData({ dealId: "", description: "", image: null });
      setTimeout(() => {
        setJobPostingSuccess("");
        // Refresh artisan data
        const fetchArtisan = async () => {
          const response = await fetch(`http://localhost:8080/artisan/${artisanId}`, {
            credentials: "include",
          });
          if (response.ok) {
            const data = await response.json();
            setArtisan(data);
          }
        };
        fetchArtisan();
      }, 2000);
    } catch (err) {
      console.error("ArtisanProfile.jsx: Error adding job posting:", err.message);
      setJobPostingError(err.message);
    }
  };

  if (!user) {
    console.log("ArtisanProfile.jsx: No user, redirecting to signin");
    navigate("/signin");
    return null;
  }

  if (loading) return <p className="profile-loading">Loading profile...</p>;
  if (!artisan) return <p className="profile-error">No profile data found.</p>;

  return (
    <div className="artisan-profile-container">
      <h1 className="profile-title">Artisan Profile</h1>

      <div className="profile-header">
        <img
          src={artisan.profile_pic ? `http://localhost:8080/uploads/${artisan.profile_pic}` : "/default-profile.png"}
          alt="Profile"
          className="profile-image"
          onError={(e) => (e.target.src = "/default-profile.png")}
        />
        <div className="profile-info">
          <h2>{artisan.firstname} {artisan.lastname}</h2>
          <p className="profile-skill">{artisan.skill}</p>
        </div>
      </div>

      <div className="profile-details">
        <div className="details-column">
          <p><strong>Phone:</strong> {artisan.phone}</p>
          <p><strong>Email:</strong> {artisan.email || "Not provided"}</p>
          <p><strong>Gender:</strong> {artisan.gender}</p>
          <p><strong>Date of Birth:</strong> {new Date(artisan.dob).toLocaleDateString()}</p>
        </div>
        <div className="details-column">
          <p><strong>City:</strong> {artisan.city}</p>
          <p><strong>Address:</strong> {artisan.address}</p>
          <p><strong>Years of Experience:</strong> {artisan.experience}</p>
          <p><strong>Coins:</strong> {artisan.coins}</p>
        </div>
      </div>

      <div className="profile-section">
        <h3>Bio</h3>
        <p className="profile-bio">{artisan.bio}</p>
      </div>

      {artisan.certificate && (
        <div className="profile-section">
          <h3>Certificate</h3>
          <a
            href={`http://localhost:8080/uploads/${artisan.certificate}`}
            target="_blank"
            rel="noopener noreferrer"
            className="certificate-link"
          >
            View Certificate
          </a>
        </div>
      )}

      {artisan.reference && (
        <div className="profile-section">
          <h3>Reference</h3>
          <p>{artisan.reference}</p>
        </div>
      )}

      {artisan.portfolio && artisan.portfolio.length > 0 && (
        <div className="profile-section">
          <h3>Portfolio</h3>
          <div className="portfolio-grid">
            {artisan.portfolio.map((file, index) => (
              <div key={index} className="portfolio-item">
                {file.endsWith(".mp4") ? (
                  <video controls>
                    <source src={`http://localhost:8080/uploads/${file}`} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <img
                    src={`http://localhost:8080/uploads/${file}`}
                    alt={`Portfolio ${index + 1}`}
                    onError={(e) => (e.target.src = "/default-image.png")}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {user.artisanId === artisan.id && artisan.deals && artisan.deals.length > 0 && (
        <div className="profile-section">
          <h3>Add Job Posting</h3>
          {jobPostingError && <p className="error-message">{jobPostingError}</p>}
          {jobPostingSuccess && <p className="success-message">{jobPostingSuccess}</p>}
          <form onSubmit={handleJobPostingSubmit} encType="multipart/form-data">
            <label>
              Select Deal: <span className="aesterik">*</span>
              <select
                value={jobPostingData.dealId}
                onChange={(e) =>
                  setJobPostingData({ ...jobPostingData, dealId: e.target.value })
                }
                required
              >
                <option value="">Select a deal</option>
                {artisan.deals.map((deal) => (
                  <option key={deal.id} value={deal.id}>
                    Deal with User ID {deal.user_id}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Description: <span className="aesterik">*</span>
              <textarea
                value={jobPostingData.description}
                onChange={(e) =>
                  setJobPostingData({ ...jobPostingData, description: e.target.value })
                }
                required
              />
            </label>
            <label>
              Image: <span className="aesterik">*</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setJobPostingData({ ...jobPostingData, image: e.target.files[0] })
                }
                required
              />
            </label>
            <button type="submit" className="submitbutton">
              Add Job Posting
            </button>
          </form>
        </div>
      )}

      {artisan.job_postings && artisan.job_postings.length > 0 && (
        <div className="profile-section">
          <h3>Job Postings</h3>
          <div className="job-postings-grid">
            {artisan.job_postings.map((job) => (
              <div key={job.id} className="job-posting-item">
                <img
                  src={job.image ? `http://localhost:8080/uploads/${job.image}` : "/default-image.png"}
                  alt="Job Posting"
                  className="job-posting-image"
                  onError={(e) => (e.target.src = "/default-image.png")}
                />
                <p><strong>Description:</strong> {job.description}</p>
                <p><strong>Date:</strong> {new Date(job.created_at).toLocaleDateString()}</p>
                {artisan.deals.some(
                  (deal) => deal.id === job.deal_id && deal.user_id === user.id
                ) && (
                  <p className="review-eligible">
                    You can now leave a review for this job!
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {user &&
        artisan.deals &&
        artisan.deals.some(
          (deal) => deal.user_id === user.id && deal.job_posting
        ) && (
          <div className="profile-section">
            <button
              onClick={() => setShowReviewModal(true)}
              className="submitbutton"
            >
              Submit Review
            </button>
            {showReviewModal && (
              <div className="modal">
                <div className="modal-content">
                  <h3>Submit Review</h3>
                  {reviewError && <p className="error-message">{reviewError}</p>}
                  {reviewSuccess && (
                    <p className="success-message">{reviewSuccess}</p>
                  )}
                  <form onSubmit={handleReviewSubmit}>
                    <label>
                      Select Deal: <span className="aesterik">*</span>
                      <select
                        value={reviewData.dealId}
                        onChange={(e) =>
                          setReviewData({
                            ...reviewData,
                            dealId: e.target.value,
                          })
                        }
                        required
                      >
                        <option value="">Select a deal</option>
                        {artisan.deals
                          .filter(
                            (deal) => deal.user_id === user.id && deal.job_posting
                          )
                          .map((deal) => (
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
                          setReviewData({
                            ...reviewData,
                            rating: Number(e.target.value),
                          })
                        }
                        required
                      />
                    </label>
                    <label>
                      Comment: <span className="aesterik">*</span>
                      <textarea
                        value={reviewData.comment}
                        onChange={(e) =>
                          setReviewData({
                            ...reviewData,
                            comment: e.target.value,
                          })
                        }
                        required
                      />
                    </label>
                    <button type="submit" className="submitbutton">
                      Submit Review
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowReviewModal(false)}
                      className="cancel-button"
                    >
                      Cancel
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

      {reviews.length > 0 && (
        <div className="profile-section">
          <h3>Reviews</h3>
          <div className="reviews-grid">
            {reviews.map((review) => (
              <div key={review.id} className="review-item">
                <p><strong>Rating:</strong> {review.rating}/5</p>
                <p><strong>Comment:</strong> {review.comment}</p>
                <p>
                  <strong>By:</strong> {review.first_name} {review.last_name}
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(review.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="profile-edit-button-wrapper">
        <button
          onClick={() => navigate("/edit-profile")}
          className="edit-button"
        >
          Edit Profile
        </button>
      </div>
    </div>
  );
}

export default ArtisanProfile;