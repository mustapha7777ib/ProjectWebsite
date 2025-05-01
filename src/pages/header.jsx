import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

function Header() {
  const [show, setShow] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false); 
  const navigate = useNavigate();

  
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      setIsLoggedIn(true); 
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const handleClick = () => {
    setShow(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("user"); 
    setIsLoggedIn(false);
    navigate("/signin");
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="header">
      <div className={`${show ? "header1" : "header11"}`}>
        <Link to="/" className="buttonss" onClick={() => scrollToSection("home")}>
          Home
        </Link>
        <Link to="/" className="buttonss" onClick={() => scrollToSection("services")}>
          Services
        </Link>
        <Link to="/" className="buttonss" onClick={() => scrollToSection("about")}>
          About Us
        </Link>
        <Link to="/" className="buttonss" onClick={() => scrollToSection("contact")}>
          Contact Us
        </Link>
      </div>
      <div onClick={handleClick} className="hamburger">
        ☰
      </div>

      <div className={`${show ? "header2" : "header21"}`}>
        {isLoggedIn ? (
          <div className="profile-container">
            <button onClick={toggleDropdown} className="profile-btn">
              Profile
            </button>
            {dropdownOpen && (
              <div className="dropdown">
                <Link to="/profile" className="dropdown-item">
                  Become an artisan
                </Link>
                <button onClick={handleLogout} className="dropdown-item">
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link to="/signin" className="buttonss">
              Log in
            </Link>
            <Link to="/signup" className="buttonss">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default Header;
