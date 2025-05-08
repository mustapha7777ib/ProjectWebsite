import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

function Header() {
  const [show, setShow] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout, artisanId } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  console.log("Current user in header:", user);

  console.log("Is artisan in header:", artisanId);

  const handleClick = () => setShow(false);
  const toggleDropdown = () => setDropdownOpen((prev) => !prev);

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) section.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="header">
      <div className={`${show ? "header1" : "header11"}`}>
        <Link to="/" className="buttonss" onClick={() => scrollToSection("home")}>Home</Link>
        <Link to="/" className="buttonss" onClick={() => scrollToSection("services")}>Services</Link>
        <Link to="/" className="buttonss" onClick={() => scrollToSection("about")}>About Us</Link>
        <Link to="/" className="buttonss" onClick={() => scrollToSection("contact")}>Contact Us</Link>
        {user && <Link to="/conversations" className="buttonss">Messages</Link>}
      </div>

      <div onClick={handleClick} className="hamburger">☰</div>

      <div className={`${show ? "header2" : "header21"}`}>
      {user ? (
  <div className="profile-container" ref={dropdownRef}>
    <button onClick={toggleDropdown} className="profile-btn">Profile</button>
    {dropdownOpen && (
      <div className="dropdown">
        {artisanId && artisanId != "null" ? (
          <Link to="/artisan-profile" className="dropdown-item">Artisan Profile</Link>
        ) : (
          <Link to="/profile" className="dropdown-item">Become an Artisan</Link>
        )}
        <button
          onClick={() => {
            logout();
            navigate("/signin");
          }}
          className="dropdown-item"
        >
          Logout
        </button>
      </div>
    )}
  </div>
) : (
  <>
    <Link to="/signin" className="buttonss">Log in</Link>
    <Link to="/signup" className="buttonss">Sign Up</Link>
  </>
)}

      </div>
    </div>
  );
}

export default Header;
