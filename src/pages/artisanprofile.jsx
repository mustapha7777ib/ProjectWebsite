import React, { useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";

function ArtisanProfile() {
  const [artisan, setArtisan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newWork, setNewWork] = useState({
    dealId: "",
    clientName: "",
    description: "",
    picture: null,
  });
  const { artisanId } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!artisanId) {
      navigate("/profile");
      return;
    }

    fetch(`http://localhost:8080/artisan/${artisanId}`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch artisan");
        return res.json();
      })
      .then((data) => {
        setArtisan(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load artisan profile:", err);
        setLoading(false);
      });
  }, [artisanId, navigate]);

  const handleWorkSubmit = async (e) => {
    e.preventDefault();
    if (!newWork.dealId || !newWork.clientName || !newWork.description || !newWork.picture) {
      alert("Please fill all fields and upload a picture.");
      return;
    }

    const formData = new FormData();
    formData.append("artisanId", artisanId);
    formData.append("dealId", newWork.dealId);
    formData.append("clientName", newWork.clientName);
    formData.append("description", newWork.description);
    formData.append("picture", newWork.picture);

    try {
      const response = await fetch("http://localhost:8080/add-work", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to add work");
      const data = await response.json();
      setArtisan((prev) => ({
        ...prev,
        works: [...(prev.works || []), data.work],
      }));
      setNewWork({ dealId: "", clientName: "", description: "", picture: null });
    } catch (err) {
      console.error("Error adding work:", err);
      alert("Failed to add work.");
    }
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

      {artisan.deals && artisan.deals.length > 0 && (
        <div className="profile-section">
          <h3>Add Work</h3>
          <form onSubmit={handleWorkSubmit} encType="multipart/form-data">
            <label>
              Select Deal:
              <select
                value={newWork.dealId}
                onChange={(e) => setNewWork({ ...newWork, dealId: e.target.value })}
              >
                <option value="">Select a deal</option>
                {artisan.deals.map((deal) => (
                  <option key={deal.id} value={deal.id}>
                    Deal with {deal.first_name} {deal.last_name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Client Name:
              <input
                type="text"
                value={newWork.clientName}
                onChange={(e) => setNewWork({ ...newWork, clientName: e.target.value })}
              />
            </label>
            <label>
              Description:
              <textarea
                value={newWork.description}
                onChange={(e) => setNewWork({ ...newWork, description: e.target.value })}
              />
            </label>
            <label>
              Work Picture:
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setNewWork({ ...newWork, picture: e.target.files[0] })}
              />
            </label>
            <button type="submit" className="submitbutton">
              Add Work
            </button>
          </form>
        </div>
      )}

      {artisan.works && artisan.works.length > 0 && (
        <div className="profile-section">
          <h3>Works</h3>
          <div className="works-grid">
            {artisan.works.map((work) => (
              <div key={work.id} className="work-item">
                <img
                  src={`http://localhost:8080/uploads/${work.picture}`}
                  alt="Work"
                  className="work-image"
                  onError={(e) => (e.target.src = "/default-image.png")}
                />
                <p><strong>Client:</strong> {work.client_name}</p>
                <p><strong>Description:</strong> {work.description}</p>
                <p><strong>Status:</strong> {work.verified ? "Verified" : "Pending"}</p>
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