import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import menu from "../images/menu.svg";

function Header() {
  const [show, setShow] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout, artisanId, isArtisan, coins } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const handleClick = () =>{
    if (show === true) {
      setShow(false);
    } else if (show === false) {
      setShow(true);
  }
}
  const handleClick2 = () => setShow(true);
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
      <div onClick={handleClick2} className={show ? "header1" : "header11"}>
        <Link to="/" className="buttonss" onClick={() => scrollToSection("home")}>Home</Link>
        <Link to="/" className="buttonss" onClick={() => scrollToSection("services")}>Services</Link>
        <Link to="/" className="buttonss" onClick={() => scrollToSection("about")}>About Us</Link>
        <Link to="/" className="buttonss" onClick={() => scrollToSection("contact")}>Contact Us</Link>
        {user && <Link to="/conversations" className="buttonss">Messages</Link>}
      </div>

      <div onClick={handleClick} className="hamburger">
        <img src={menu} alt="Menu" className={show ? "hamburger-icon" : "hamburger-icon1"} />
      </div>

      <div className={show ? "header2" : "header21"}>
        {user ? (
          <div className="profile-container" ref={dropdownRef}>
            {isArtisan && coins !== null && (
              <Link
                to="/purchase-coins"
                onClick={() => scrollToSection("contact")}
                className="coin-balance"
                style={{ marginRight: "10px", textDecoration: "none", marginTop: "3px" }}
              >
                Coins: {coins}
              </Link>
            )}
            {user.role === "admin" && (
              <Link to="/admin" className="admin-btn" style={{ marginLeft: "10px" }}>
                Admin Dashboard
              </Link>
            )}
            <button onClick={toggleDropdown} className="profile-btn">Profile</button>
            {dropdownOpen && (
              <div className="dropdown">
                {artisanId && artisanId !== "null" ? (
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
            <Link to="/signin" className="buttonss buttonsss">Log in</Link>
            <Link to="/signup" className="buttonss buttonsss">Sign Up</Link>
          </>
        )}
      </div>
    </div>
  );
}

export default Header;