import React, { useEffect, useState } from "react";

function ArtisanProfile() {
  const [artisan, setArtisan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Assuming the user ID is stored in localStorage (adjust if you use tokens or sessions)
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const userId = storedUser?.id;

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
  }, []);

  if (loading) return <p>Loading profile...</p>;
  if (!artisan) return <p>No profile data found.</p>;

  return (
    <div className="artisan-profile">
      <h1>Artisan Profile</h1>

      <img
        src={`http://localhost:8080/uploads/${artisan.profilePic}`}
        alt="Profile"
        className="profile-image"
        style={{ width: "150px", height: "150px", objectFit: "cover", borderRadius: "8px" }}
      />

      <p><strong>Full Name:</strong> {artisan.fullName}</p>
      <p><strong>Phone:</strong> {artisan.phone}</p>
      <p><strong>Gender:</strong> {artisan.gender}</p>
      <p><strong>Date of Birth:</strong> {artisan.dob}</p>
      <p><strong>City:</strong> {artisan.city}</p>
      <p><strong>Address:</strong> {artisan.address}</p>
      <p><strong>Skill:</strong> {artisan.skill}</p>
      <p><strong>Years of Experience:</strong> {artisan.experience}</p>
      <p><strong>Bio:</strong> {artisan.bio}</p>

      {artisan.certificate && (
        <div>
          <strong>Certificate:</strong>
          <a
            href={`http://localhost:8080/uploads/${artisan.certificate}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View Certificate
          </a>
        </div>
      )}

      {artisan.portfolio && artisan.portfolio.length > 0 && (
        <div>
          <strong>Portfolio:</strong>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {artisan.portfolio.map((file, index) => (
              <div key={index}>
                {file.endsWith(".mp4") ? (
                  <video width="200" controls>
                    <source src={`http://localhost:8080/uploads/${file}`} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <img
                    src={`http://localhost:8080/uploads/${file}`}
                    alt={`Portfolio ${index + 1}`}
                    style={{ width: "200px", height: "auto", borderRadius: "4px" }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ArtisanProfile;
