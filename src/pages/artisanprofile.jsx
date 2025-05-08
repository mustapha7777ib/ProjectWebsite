import React, { useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";

function ArtisanProfile() {
  const [artisan, setArtisan] = useState(null);
  const [loading, setLoading] = useState(true);
  const { artisanId } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log(artisanId);
    
    const userId = artisanId;

    fetch(`http://localhost:8080/artisan/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setArtisan(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load artisan profile:", err);
        setLoading(false);
      });
  }, [artisanId, navigate]);

  if (loading) return <p className="profile-loading">Loading profile...</p>;
  if (!artisan) return <p className="profile-error">No profile data found.</p>;

  return (
    <div className="artisan-profile-container">
      <h1 className="profile-title">Artisan Profile</h1>

      <div className="profile-header">
        <img
          src={`http://localhost:8080/uploads/${artisan.profilePic}`}
          alt="Profile"
          className="profile-image"
          onError={(e) => (e.target.src = "/default-profile.png")}
        />
        <div className="profile-info">
          <h2>{artisan.firstName} {artisan.lastName}</h2>
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

      <div className="profile-edit-button-wrapper">
        <button onClick={() => navigate("/edit-profile")} className="edit-button">
          Edit Profile
        </button>
      </div>
    </div>
  );
}

export default ArtisanProfile;