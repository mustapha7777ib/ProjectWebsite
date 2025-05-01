import React, { useState } from "react";

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

  const [profilePic, setProfilePic] = useState(null);
  const [certificate, setCertificate] = useState(null);
  const [reference, setReference] = useState("");
  const [portfolio, setPortfolio] = useState([]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submission = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      submission.append(key, value);
    });
    if (profilePic) submission.append("profilePic", profilePic);
    if (certificate) submission.append("certificate", certificate);
    if (reference) submission.append("reference", reference);
    portfolio.forEach((file, index) => submission.append(`portfolio_${index}`, file));

    // You can now POST this FormData to your server
    console.log("Form submitted:", formData);
  };

  return (
    <form onSubmit={handleSubmit} encType="multipart/form-data">
      <h2>Artisan Registration</h2>

      <label>Phone Number:
        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
      </label>

      <label>Gender:
        <select name="gender" value={formData.gender} onChange={handleChange}>
          <option value="">Select</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </label>

      <label>Date of Birth:
        <input type="date" name="dob" value={formData.dob} onChange={handleChange} required />
      </label>

      <label>Profile Picture:
        <input type="file" accept="image/*" onChange={(e) => setProfilePic(e.target.files[0])} />
      </label>

      <label>City / Town:
        <input type="text" name="city" value={formData.city} onChange={handleChange} required />
      </label>

      <label>Full Address:
        <textarea name="address" value={formData.address} onChange={handleChange} required />
      </label>

      <label>Primary Skill / Trade:
        <input type="text" name="skill" value={formData.skill} onChange={handleChange} required />
      </label>

      <label>Years of Experience:
        <input type="number" name="experience" value={formData.experience} onChange={handleChange} required />
      </label>

      <label>Brief Bio / About Me:
        <textarea name="bio" value={formData.bio} onChange={handleChange} required />
      </label>

      <label>Certificate or Training Proof:
        <input type="file" accept=".pdf,image/*" onChange={(e) => setCertificate(e.target.files[0])} />
      </label>

      <label>Portfolio (photos/videos of past work):
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
