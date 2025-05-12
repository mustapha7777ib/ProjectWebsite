import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const abujaData = {
  cities: [
    "Asokoro", "Maitama", "Wuse", "Garki", "Gwarimpa", "Lokogoma", "Jabi", "Utako", "Katampe Extension Hill",
    "Kuje", "Abaji", "Bwari", "Gwagwalada", "Kwali", "Abuja Municipal Area Council (AMAC)", "Dawaki", "Gwagwa",
    "Nyanya", "Kubwa", "Olu Awotesu Street", "Lugbe", "Guzape", "Apo Dutse", "Dakibiyu", "Duboyi", "Durumi",
    "Gaduwa", "Games Village", "Kaura", "Gudu", "Jahi", "Kado", "Kukwaba", "Mabushi", "Wuye", "Galadimawa",
    "Kabusa", "Karmo", "Life Camp", "Nbora"
  ]
};

function Profile() {
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

  const navigate = useNavigate();
  const [profilePic, setProfilePic] = useState(null);
  const [certificate, setCertificate] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [filteredCities, setFilteredCities] = useState(abujaData.cities);
  const [errorMessages, setErrorMessages] = useState({
    gender: "",
    phone: "",
    city: "",
    general: "",
  });
  const { setArtisanStatus, setArtisan, user } = useAuth();
  const phoneErrorRef = useRef(null);
  const today = new Date().toISOString().split("T")[0];

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCityClick = () => {
    setShowCityDropdown(!showCityDropdown);
  };

  const handleCitySelect = (city) => {
    setFormData((prev) => ({ ...prev, city }));
    setErrorMessages((prev) => ({ ...prev, city: "" }));
    setShowCityDropdown(false);
  };

  useEffect(() => {
    if (errorMessages.phone && phoneErrorRef.current) {
      phoneErrorRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [errorMessages.phone]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessages({ gender: "", phone: "", city: "", general: "" });

    let formErrors = {};
    const phoneRegex = /^0\d{10}$/;
    if (!formData.phone || !phoneRegex.test(formData.phone)) {
      formErrors.phone = "Enter a valid Nigerian phone number (e.g., 08012345678)";
    }

    if (!formData.gender) {
      formErrors.gender = "Gender is required";
    }

    if (!formData.city) {
      formErrors.city = "City is required";
    }

    if (Object.keys(formErrors).length > 0) {
      setErrorMessages(formErrors);
      return;
    }

    const submission = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value) submission.append(key, value);
    });

    if (profilePic) submission.append("profilePic", profilePic);
    if (certificate) submission.append("certificate", certificate);
    portfolio.forEach((file, index) => {
      submission.append(`portfolio_${index}`, file);
    });

    try {
      console.log("Submitting artisan registration:", [...submission.entries()]);
      const response = await fetch("http://localhost:8080/register-artisan", {
        method: "POST",
        body: submission,
        credentials: "include",
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      if (data.message === "Registration successful") {
        setArtisanStatus(true);
        setArtisan(data.data.id);

        const linkResponse = await fetch("http://localhost:8080/link-artisan-to-user", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id, artisanId: data.data.id }),
          credentials: "include",
        });

        if (!linkResponse.ok) {
          const linkData = await linkResponse.json();
          throw new Error(linkData.error || "Failed to link artisan to user");
        }

        navigate("/artisan-profile");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setErrorMessages((prev) => ({ ...prev, general: err.message }));
    }
  };

  if (!user) {
    return <p>Please log in to register as an artisan.</p>;
  }

  return (
    <form onSubmit={handleSubmit} encType="multipart/form-data" className="artisan-registration-form">
      <h2>Artisan Registration</h2>
      {errorMessages.general && (
        <div className="error-message" style={{ color: "red", marginBottom: "1rem" }}>
          {errorMessages.general}
        </div>
      )}

      <label>
        First Name: <span className="aesterik">*</span>
        <input name="firstname" value={formData.firstname} onChange={handleChange} required />
      </label>

      <label>
        Last Name: <span className="aesterik">*</span>
        <input name="lastname" value={formData.lastname} onChange={handleChange} required />
      </label>

      <label>
        Phone Number: <span className="aesterik">*</span>
        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
        {errorMessages.phone && (
          <div
            ref={phoneErrorRef}
            className="error-message"
            style={{
              color: "red",
              fontStyle: "italic",
              fontWeight: "bold",
              fontSize: "0.8rem",
              marginTop: "4px",
            }}
          >
            {errorMessages.phone}
          </div>
        )}
      </label>

      <label>
        Email: <span className="aesterik">*</span>
        <input type="email" name="email" value={formData.email} onChange={handleChange} required />
      </label>

      <label>
        Gender: <span className="aesterik">*</span>
        <select name="gender" value={formData.gender} onChange={handleChange} required>
          <option value="">Select</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
        {errorMessages.gender && (
          <div className="error-message" style={{ color: "red", fontSize: "0.8rem", marginTop: "4px" }}>
            {errorMessages.gender}
          </div>
        )}
      </label>

      <label>
        Date of Birth: <span className="aesterik">*</span>
        <input
          type="date"
          name="dob"
          value={formData.dob}
          onChange={handleChange}
          required
          max={today}
        />
      </label>

      <label>
        City / Town: <span className="aesterik">*</span>
        <div className="city-dropdown-wrapper">
          <input
            type="text"
            name="city"
            value={formData.city}
            onClick={handleCityClick}
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
        {errorMessages.city && (
          <div className="error-message" style={{ color: "red", fontSize: "0.8rem", marginTop: "4px" }}>
            {errorMessages.city}
          </div>
        )}
      </label>

      <label>
        Full Address: <span className="aesterik">*</span>
        <textarea name="address" value={formData.address} onChange={handleChange} required />
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
          min="0"
          required
        />
      </label>

      <label>
        Brief Bio / About Me: <span className="aesterik">*</span>
        <textarea name="bio" value={formData.bio} onChange={handleChange} required />
      </label>

      <label>
        Reference (Optional):
        <input name="reference" value={formData.reference} onChange={handleChange} />
      </label>

      <label>
        Profile Picture (Optional):
        <input type="file" accept="image/*" onChange={(e) => setProfilePic(e.target.files[0])} />
      </label>

      <label>
        Certificate or Training Proof (Optional):
        <input type="file" accept=".pdf,image/*" onChange={(e) => setCertificate(e.target.files[0])} />
      </label>

      <label>
        Portfolio (photos/videos of past work, Optional):
        <input
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={(e) => setPortfolio(Array.from(e.target.files))}
        />
      </label>

      <button className="submitbutton" type="submit">
        Submit
      </button>
    </form>
  );
}

export default Profile;