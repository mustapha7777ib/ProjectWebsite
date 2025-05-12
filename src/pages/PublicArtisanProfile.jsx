import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

function PublicArtisanProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [artisan, setArtisan] = useState(null);
  const [canReview, setCanReview] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtisan = async () => {
      try {
        const response = await fetch(`http://localhost:8080/artisan/${id}`, {
          credentials: "include",
        });
        if (!response.ok) throw new Error("Failed to fetch artisan");
        const data = await response.json();
        setArtisan(data);

        if (user) {
          const eligibleDeal = data.deals.find(
            (deal) => deal.user_id === user.id && deal.job_posting
          );
          setCanReview(!!eligibleDeal);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching artisan:", err);
        setLoading(false);
      }
    };

    fetchArtisan();
  }, [id, user]);

  const handleViewOwnProfile = () => {
    if (user && user.artisanId === parseInt(id)) {
      navigate("/artisan-profile");
    } else {
      navigate(`/artisan-profile/${id}`);
    }
  };

  const handleChat = () => {
    if (!user) {
      navigate("/signin");
      return;
    }
    navigate(`/chat/${id}`);
  };

  if (loading) return <p className="profile-loading">Loading profile...</p>;
  if (!artisan) return <p className="profile-error">No profile data found.</p>;

  return (
    <div className="artisan-profile-container">
      <h1 className="profile-title">Artisan Profile</h1>

      <div className="profile-header">
        <img
          src={`http://localhost:8080/uploads/${artisan.profile_pic}`}
          alt="Profile"
          className="profile-image"
          onError={(e) => (e.target.src = "https://via.placeholder.com/150")}
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

      {artisan.job_postings && artisan.job_postings.length > 0 && (
        <div className="profile-section">
          <h3>Job Postings</h3>
          <div className="job-postings-grid">
            {artisan.job_postings.map((job) => (
              <div key={job.id} className="job-posting-item">
                <img
                  src={`http://localhost:8080/uploads/${job.image}`}
                  alt="Job Posting"
                  className="job-posting-image"
                  onError={(e) => (e.target.src = "/default-image.png")}
                />
                <p><strong>Description:</strong> {job.description}</p>
                <p><strong>Date:</strong> {new Date(job.created_at).toLocaleDateString()}</p>
                {job.reviews && job.reviews.length > 0 ? (
                  <div className="job-reviews">
                    <h4>Reviews</h4>
                    {job.reviews.map((review) => (
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
                ) : (
                  <p className="no-reviews">No reviews yet for this job.</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="profile-actions">
        <button
          onClick={handleChat}
          className="chat-button"
        >
          Chat with Artisan
        </button>
        {user && canReview ? (
          <button
            onClick={() => navigate(`/review/${id}`)}
            className="submitbutton"
          >
            Submit Review
          </button>
        ) : (
          user && (
            <p className="review-ineligible">
              You can only submit a review after confirming a deal and the artisan uploads job details.
            </p>
          )
        )}
      </div>
    </div>
  );
}

export default PublicArtisanProfile;