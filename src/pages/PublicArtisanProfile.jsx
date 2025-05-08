import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

function PublicArtisanProfile() {
  const { id } = useParams();
  const [artisan, setArtisan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChat = () => {
    if (artisan && artisan.id) {
      navigate(`/chat/${artisan.id}`);
    } else {
      console.error("Artisan ID is not available");
    }
  };

  useEffect(() => {
    const fetchArtisan = async () => {
      try {
        const res = await fetch(`http://localhost:8080/artisan/${id}`);
        if (!res.ok) throw new Error('Failed to fetch artisan');
        const data = await res.json();
        setArtisan(data);
      } catch (err) {
        setError('Could not load artisan profile');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchArtisan();
  }, [id]);

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!artisan) return <p>Artisan not found</p>;

  return (
    <div className="profile-container1">
      <div className="profile-card">
        <div className="profile-left">
          <img 
            src={`http://localhost:8080/uploads/${artisan.profile_pic || 'default.jpg'}`} 
            alt="Profile" 
            className="profile-image"
            onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }}
          />
        </div>
        <div className="profile-right1">
          <h2>{artisan.firstname} {artisan.lastname}</h2>
          <p><strong>Skill:</strong> {artisan.skill}</p>
          <p><strong>Email:</strong> {artisan.email}</p>
          <p><strong>Phone:</strong> {artisan.phone}</p>
          <p><strong>City:</strong> {artisan.city}</p>
          <p><strong>Bio:</strong> {artisan.bio || "No bio available"}</p>
          <button onClick={handleChat}>Chat</button>
        </div>
      </div>

      <div className="jobs-section">
        <h3>Previous Jobs</h3>
        {artisan.jobs && artisan.jobs.length > 0 ? (
          <ul>
            {artisan.jobs.map((job, i) => (
              <li key={i}>
                <strong>{job.title}</strong> – {job.description}
              </li>
            ))}
          </ul>
        ) : (
          <p>No previous jobs listed.</p>
        )}
      </div>
    </div>
  );
}

export default PublicArtisanProfile;
