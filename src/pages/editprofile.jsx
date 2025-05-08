import React, { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";

function EditProfile() {
  const { artisanId } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    phone: "",
    gender: "",
    dob: "",
    city: "",
    address: "",
    skill: "",
    experience: "",
    bio: "",
    profile_pic: null,
    certificate: null,
    reference: "",
    portfolio: [],
  });
  const [newPortfolioFiles, setNewPortfolioFiles] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!artisanId) {
      navigate("/profile");
      return;
    }

    fetch(`http://localhost:8080/artisan/${artisanId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch artisan");
        return res.json();
      })
      .then((data) => {
        setFormData({
          firstname: data.firstname || "",
          lastname: data.lastname || "",
          phone: data.phone || "",
          gender: data.gender || "",
          dob: data.dob ? new Date(data.dob).toISOString().split("T")[0] : "",
          city: data.city || "",
          address: data.address || "",
          skill: data.skill || "",
          experience: data.experience || "",
          bio: data.bio || "",
          profile_pic: null,
          certificate: null,
          reference: data.reference || "",
          portfolio: data.portfolio || [],
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load artisan profile:", err);
        setError("Failed to load profile data");
        setLoading(false);
      });
  }, [artisanId, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (name === "portfolio") {
      setNewPortfolioFiles([...files]);
    } else {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === "portfolio") {
        // Send existing portfolio as JSON
        data.append("existingPortfolio", JSON.stringify(formData.portfolio));
      } else if (formData[key] && key !== "profile_pic" && key !== "certificate") {
        data.append(key, formData[key]);
      }
    });
    if (formData.profile_pic) {
      data.append("profile_pic", formData.profile_pic);
    }
    if (formData.certificate) {
      data.append("certificate", formData.certificate);
    }
    newPortfolioFiles.forEach((file) => {
      data.append("portfolio", file);
    });

    try {
      const response = await fetch(`http://localhost:8080/artisan/${artisanId}`, {
        method: "PUT",
        body: data,
      });

      if (response.ok) {
        navigate("/artisan-profile");
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to update profile");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Error updating profile");
    }
  };

  if (loading) return <p className="profile-loading">Loading profile...</p>;
  if (error && !formData.firstname) return <p className="profile-error">{error}</p>;

  return (
    <div className="artisan-profile-container">
      <h1 className="profile-title">Edit Artisan Profile</h1>
      <form onSubmit={handleSubmit}>
        <label>
          First Name
          <input
            type="text"
            name="firstname"
            value={formData.firstname}
            onChange={handleInputChange}
            required
          />
        </label>
        <label>
          Last Name
          <input
            type="text"
            name="lastname"
            value={formData.lastname}
            onChange={handleInputChange}
            required
          />
        </label>
        <label>
          Phone
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            required
          />
        </label>
        <label>
          Gender
          <select name="gender" value={formData.gender} onChange={handleInputChange} required>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </label>
        <label>
          Date of Birth
          <input
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleInputChange}
            required
          />
        </label>
        <label>
          City
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            required
          />
        </label>
        <label>
          Address
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            required
          />
        </label>
        <label>
          Skill
          <input
            type="text"
            name="skill"
            value={formData.skill}
            onChange={handleInputChange}
            required
          />
        </label>
        <label>
          Years of Experience
          <input
            type="number"
            name="experience"
            value={formData.experience}
            onChange={handleInputChange}
            required
          />
        </label>
        <label>
          Bio
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            required
          />
        </label>
        <label>
          Profile Picture
          <input
            type="file"
            name="profile_pic"
            accept="image/*"
            onChange={handleFileChange}
          />
        </label>
        <label>
          Certificate
          <input
            type="file"
            name="certificate"
            accept="image/*,application/pdf"
            onChange={handleFileChange}
          />
        </label>
        <label>
          Reference
          <input
            type="text"
            name="reference"
            value={formData.reference}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Add Portfolio Images/Videos
          <input
            type="file"
            name="portfolio"
            accept="image/*,video/mp4"
            multiple
            onChange={handleFileChange}
          />
        </label>
        {formData.portfolio.length > 0 && (
          <div className="profile-section">
            <h3>Current Portfolio</h3>
            <div className="portfolio-grid">
              {formData.portfolio.map((file, index) => (
                <div key={index} className="portfolio-item">
                  {file.endsWith(".mp4") ? (
                    <video controls width="200">
                      <source src={`http://localhost:8080/uploads/${file}`} type="video/mp4" />
                    </video>
                  ) : (
                    <img
                      src={`http://localhost:8080/uploads/${file}`}
                      alt={`Portfolio ${index + 1}`}
                      style={{ width: "200px" }}
                      onError={(e) => (e.target.src = "https://via.placeholder.com/200")}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {error && <p className="error">{error}</p>}
        <button type="submit" className="submitbutton">
          Save Changes
        </button>
      </form>
    </div>
  );
}

export default EditProfile;