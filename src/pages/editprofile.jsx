import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

function EditProfile() {
  const { user, isArtisan, logout } = useAuth();
  const navigate = useNavigate();
  const artisanId = user.artisanId;
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    phone: "",
    email: "",
    gender: "",
    dob: "",
    city: "",
    address: "",
    skill: "",
    experience: "",
    bio: "",
    reference: "",
  });
  const [profilePic, setProfilePic] = useState(null);
  const [certificate, setCertificate] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [existingPortfolio, setExistingPortfolio] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [deals, setDeals] = useState([]);
  const [newJobPosting, setNewJobPosting] = useState({
    dealId: "",
    description: "",
    image: null,
  });

  useEffect(() => {
    const fetchArtisanAndDeals = async () => {
      try {
        const response = await fetch(`http://localhost:8080/artisan/${artisanId}`, {
          credentials: "include",
        });
        if (!response.ok) {
          if (response.status === 401) {
            logout();
            return;
          }
          throw new Error(`Failed to fetch artisan: ${response.status}`);
        }
        const data = await response.json();
        setFormData({
          firstname: data.firstname || "",
          lastname: data.lastname || "",
          phone: data.phone || "",
          email: data.email || "",
          gender: data.gender || "",
          dob: data.dob ? new Date(data.dob).toISOString().split("T")[0] : "",
          city: data.city || "",
          address: data.address || "",
          skill: data.skill || "",
          experience: data.experience || "",
          bio: data.bio || "",
          reference: data.reference || "",
        });
        setExistingPortfolio(data.portfolio || []);
        setDeals(data.deals || []);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching artisan:", err);
        setError("Failed to load profile data.");
        setLoading(false);
      }
    };

    if (!user || !isArtisan) {
      navigate("/profile");
    } else {
      fetchArtisanAndDeals();
    }
  }, [user, isArtisan, artisanId, navigate, logout]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (name === "profilePic") {
      setProfilePic(files[0]);
    } else if (name === "certificate") {
      setCertificate(files[0]);
    } else if (name === "portfolio") {
      setPortfolio(Array.from(files));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.firstname || !formData.lastname || !formData.phone) {
      setError("Please fill in all required fields.");
      return;
    }

    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      formDataToSend.append(key, value);
    });
    if (profilePic) formDataToSend.append("profilePic", profilePic);
    if (certificate) formDataToSend.append("certificate", certificate);
    portfolio.forEach((file) => formDataToSend.append("portfolio", file));

    try {
      const response = await fetch(`http://localhost:8080/artisan/${artisanId}`, {
        method: "PUT",
        body: formDataToSend,
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }

      setError("");
      alert("Profile updated successfully!");
      navigate("/artisan-profile");
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.message);
    }
  };

  const handleJobPostingSubmit = async (e) => {
    e.preventDefault();
    if (!newJobPosting.dealId || !newJobPosting.description || !newJobPosting.image) {
      setError("Please provide a deal, description, and image.");
      return;
    }

    const formData = new FormData();
    formData.append("dealId", newJobPosting.dealId);
    formData.append("description", newJobPosting.description);
    formData.append("image", newJobPosting.image);

    try {
      const response = await fetch(`http://localhost:8080/artisan/${artisanId}/add-job-posting`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add job posting");
      }
      setNewJobPosting({ dealId: "", description: "", image: null });
      setError("");
      alert("Job posting added successfully!");
    } catch (err) {
      console.error("Error adding job posting:", err);
      setError(err.message);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="edit-profile-container">
      <h2>Edit Artisan Profile</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <label>
          First Name: <span className="aesterik">*</span>
          <input
            type="text"
            name="firstname"
            value={formData.firstname}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Last Name: <span className="aesterik">*</span>
          <input
            type="text"
            name="lastname"
            value={formData.lastname}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Phone: <span className="aesterik">*</span>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Email:
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        </label>
        <label>
          Gender: <span className="aesterik">*</span>
          <select name="gender" value={formData.gender} onChange={handleChange} required>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </label>
        <label>
          Date of Birth: <span className="aesterik">*</span>
          <input
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          City: <span className="aesterik">*</span>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Address: <span className="aesterik">*</span>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Skill: <span className="aesterik">*</span>
          <input
            type="text"
            name="skill"
            value={formData.skill}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Years of Experience: <span className="aesterik">*</span>
          <input
            type="number"
            name="experience"
            value={formData.experience}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Bio:
          <textarea name="bio" value={formData.bio} onChange={handleChange} />
        </label>
        <label>
          Reference:
          <input
            type="text"
            name="reference"
            value={formData.reference}
            onChange={handleChange}
          />
        </label>
        <label>
          Profile Picture:
          <input
            type="file"
            name="profilePic"
            accept="image/*"
            onChange={handleFileChange}
          />
        </label>
        <label>
          Certificate (PDF):
          <input
            type="file"
            name="certificate"
            accept="application/pdf"
            onChange={handleFileChange}
          />
        </label>
        <label>
          Portfolio (Images/Videos):
          <input
            type="file"
            name="portfolio"
            accept="image/*,video/*"
            multiple
            onChange={handleFileChange}
          />
        </label>
        {existingPortfolio.length > 0 && (
          <div className="existing-portfolio">
            <h3>Existing Portfolio</h3>
            <div className="portfolio-grid">
              {existingPortfolio.map((file, index) => (
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
        <button type="submit" className="submit-button">
          Update Profile
        </button>
      </form>

      {deals.length > 0 && (
        <div className="profile-section">
          <h3>Add Job Posting</h3>
          {deals.some((deal) => !deal.job_posting) && (
            <p className="notification">You have confirmed deals. Please add job details below.</p>
          )}
          <form onSubmit={handleJobPostingSubmit} encType="multipart/form-data">
            <label>
              Select Deal: <span className="aesterik">*</span>
              <select
                value={newJobPosting.dealId}
                onChange={(e) => setNewJobPosting({ ...newJobPosting, dealId: e.target.value })}
                required
              >
                <option value="">Select a deal</option>
                {deals
                  .filter((deal) => !deal.job_posting)
                  .map((deal) => (
                    <option key={deal.id} value={deal.id}>
                      Deal with {deal.first_name} {deal.last_name}
                    </option>
                  ))}
              </select>
            </label>
            <label>
              Job Description: <span className="aesterik">*</span>
              <textarea
                value={newJobPosting.description}
                onChange={(e) => setNewJobPosting({ ...newJobPosting, description: e.target.value })}
                required
              />
            </label>
            <label>
              Job Image: <span className="aesterik">*</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setNewJobPosting({ ...newJobPosting, image: e.target.files[0] })}
                required
              />
            </label>
            <button type="submit" className="submitbutton">
              Add Job Posting
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default EditProfile;