import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const abujaData = {
  cities: [
    "Asokoro", "Maitama", "Wuse", "Garki", "Gwarimpa", "Lokogoma", "Jabi", "Utako",
    "Katampe Extension Hill", "Kuje", "Abaji", "Bwari", "Gwagwalada", "Kwali",
    "Abuja Municipal Area Council (AMAC)", "Dawaki", "Gwagwa", "Nyanya", "Kubwa",
    "Olu Awotesu Street", "Lugbe", "Guzape", "Apo Dutse", "Dakibiyu", "Duboyi",
    "Durumi", "Gaduwa", "Games Village", "Kaura", "Gudu", "Jahi", "Kado", "Kukwaba",
    "Mabushi", "Wuye", "Galadimawa", "Kabusa", "Karmo", "Life Camp", "Nbora"
  ]
};

function EditProfile() {
  const { user, isArtisan, artisanId, logout } = useAuth();
  const navigate = useNavigate();
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
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [filteredCities, setFilteredCities] = useState(abujaData.cities);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !isArtisan || !artisanId) {
      navigate("/signin");
      return;
    }

    const fetchArtisan = async () => {
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
        setLoading(false);
      } catch (err) {
        console.error("Error fetching artisan:", err);
        setError("Failed to load profile data.");
        setLoading(false);
      }
    };

    fetchArtisan();
  }, [user, isArtisan, artisanId, navigate, logout]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCitySelect = (city) => {
    setFormData({ ...formData, city });
    setShowCityDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const submission = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      submission.append(key, value);
    });
    if (profilePic) submission.append("profile_pic", profilePic);
    if (certificate) submission.append("certificate", certificate);
    portfolio.forEach((file) => submission.append("portfolio", file));
    submission.append("existingPortfolio", JSON.stringify(existingPortfolio));

    try {
      console.log("Sending PUT request to update artisan:", { artisanId, userId: user.id });
      const response = await fetch(`http://localhost:8080/artisan/${artisanId}`, {
        method: "PUT",
        body: submission,
        credentials: "include",
      });

      const responseData = await response.json();
      console.log("PUT response:", { status: response.status, data: responseData });

      if (!response.ok) {
        if (response.status === 401) {
          logout();
          return;
        }
        throw new Error(responseData.error || `Failed to update profile: ${response.status}`);
      }

      navigate("/artisan-profile");
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.message);
    }
  };

  if (loading) return <p className="profile-loading">Loading profile...</p>;
  if (!user) return <p>Please log in to edit your profile.</p>;

  return (
    <form onSubmit={handleSubmit} encType="multipart/form-data" className="artisan-profile-container">
      <h2 className="profile-title">Edit Artisan Profile</h2>
      {error && <p className="error-message">{error}</p>}

      <label>
        First Name: <span className="aesterik">*</span>
        <input
          name="firstname"
          value={formData.firstname}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        Last Name: <span className="aesterik">*</span>
        <input
          name="lastname"
          value={formData.lastname}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        Phone Number: <span className="aesterik">*</span>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          pattern="\+?[0-9]{10,15}"
          title="Phone number should be 10-15 digits, optionally starting with +"
          required
        />
      </label>

      <label>
        Email: <span className="aesterik">*</span>
        <input
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        Gender: <span className="aesterik">*</span>
        <select name="gender" value={formData.gender} onChange={handleChange} required>
          <option value="">Select</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
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
          max={new Date().toISOString().split("T")[0]}
        />
      </label>

      <label>
        City / Town: <span className="aesterik">*</span>
        <div className="city-dropdown-wrapper">
          <input
            type="text"
            name="city"
            value={formData.city}
            onClick={() => setShowCityDropdown(!showCityDropdown)}
            placeholder="Select City"
            readOnly
            required
          />
          {showCityDropdown && (
            <ul className="city-dropdown">
              {filteredCities.map((city, index) => (
                <li key={index} onClick={() => handleCitySelect(city)}>
                  {city}
                </li>
              ))}
            </ul>
          )}
        </div>
      </label>

      <label>
        Full Address: <span className="aesterik">*</span>
        <textarea
          name="address"
          value={formData.address}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        Primary Skill / Trade: <span className="aesterik">*</span>
        <select name="skill" value={formData.skill} onChange={handleChange} required>
          <option value="">Select Skill</option>
          <option value="Carpenter">Carpenter</option>
          <option value="Electrician">Electrician</option>
          <option value="Plumber">Plumber</option>
          <option value="Welder">Welder</option>
          <option value="Tiler">Tiler</option>
          <option value="Cleaner">Cleaner</option>
          <option value="Painter">Painter</option>
          <option value="Gardener">Gardener</option>
          <option value="Technician">Technician</option>
        </select>
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
        Brief Bio / About Me: <span className="aesterik">*</span>
        <textarea
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        Reference:
        <input
          name="reference"
          value={formData.reference}
          onChange={handleChange}
        />
      </label>

      <label>
        Profile Picture:
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setProfilePic(e.target.files[0])}
        />
      </label>

      <label>
        Certificate or Training Proof:
        <input
          type="file"
          accept=".pdf,image/*"
          onChange={(e) => setCertificate(e.target.files[0])}
        />
      </label>

      <label>
        Portfolio (photos/videos of past work):
        <input
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={(e) => setPortfolio(Array.from(e.target.files))}
        />
      </label>

      {existingPortfolio.length > 0 && (
        <div className="profile-section">
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

      <button type="submit" className="submitbutton">
        Save Changes
      </button>
    </form>
  );
}

export default EditProfile;