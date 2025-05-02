import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext"; // adjust path as needed


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
    phone: "",
    gender: "",
    dob: "",
    city: "",
    address: "",
    skill: "",
    experience: "",
    bio: "",
  });
  const navigate = useNavigate();
  const [profilePic, setProfilePic] = useState(null);
  const [certificate, setCertificate] = useState(null);
  const [reference, setReference] = useState("");
  const [portfolio, setPortfolio] = useState([]);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [filteredCities, setFilteredCities] = useState(abujaData.cities);
  const [selectedCity, setSelectedCity] = useState("");
  const [errorMessages, setErrorMessages] = useState({
    gender: "",
    phone: "",
    city: "",
  });
  const { setArtisanStatus } = useAuth();

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
    setSelectedCity(city);
    setErrorMessages((prev) => ({ ...prev, city: "" }));
    setShowCityDropdown(false);
  };

  useEffect(() => {
    if (errorMessages.phone && phoneErrorRef.current) {
      phoneErrorRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [errorMessages.phone]);

  const handleSubmit = (e) => {
    e.preventDefault();

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
      submission.append(key, value);
    });

    if (profilePic) submission.append("profilePic", profilePic);
    if (certificate) submission.append("certificate", certificate);
    if (reference) submission.append("reference", reference);
    portfolio.forEach((file, index) => {
      submission.append(`portfolio_${index}`, file);
    });

    fetch("http://localhost:8080/register-artisan", {
      method: "POST",
      body: submission,
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Response from server:", data);
        alert(data.message);

        if (data.success || data.message === "Registration successful") {
          setArtisanStatus("true"); 
          navigate("/artisan-profile"); 
        }
      })
      .catch((err) => {
        console.error("Error:", err);
        alert("Submission failed");
      });
  };

  return (
    <form onSubmit={handleSubmit} encType="multipart/form-data">
      <h2>Artisan Registration</h2>

      <label>
        Phone Number: <span className="aesterik">*</span>
        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
        {errorMessages.phone && (
          <div
            ref={phoneErrorRef}
            style={{
              color: "red",
              fontStyle: "italic",
              fontWeight: "bold",
              fontSize: "0.8rem",
              marginTop: "4px"
            }}
          >
            {errorMessages.phone}
          </div>
        )}
      </label>

      <label>
        Gender: <span className="aesterik">*</span>
        <select name="gender" value={formData.gender} onChange={handleChange} required>
          <option value="">Select</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
        {errorMessages.gender && <div style={{ color: "red" }} className="error-message">{errorMessages.gender}</div>}
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
        Profile Picture:
        <input type="file" accept="image/*" onChange={(e) => setProfilePic(e.target.files[0])} />
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
                <li key={index} onClick={() => handleCitySelect(city)}>{city}</li>
              ))}
            </ul>
          )}
        </div>
        {errorMessages.city && (
          <div
            className="error-message"
            style={{
              color: "red",
              fontStyle: "italic",
              fontWeight: "bold",
              fontSize: "0.8rem",
              marginTop: "4px"
            }}
          >
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
        <input type="number" name="experience" value={formData.experience} onChange={handleChange} required />
      </label>

      <label>
        Brief Bio / About Me: <span className="aesterik">*</span>
        <textarea name="bio" value={formData.bio} onChange={handleChange} required />
      </label>

      <label>
        Certificate or Training Proof:
        <input type="file" accept=".pdf,image/*" onChange={(e) => setCertificate(e.target.files[0])} />
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

      <button className="submitbutton" type="submit">Submit</button>
    </form>
  );
}

export default Profile;
