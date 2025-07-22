import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import Globe from "../images/globe.svg";
import DropDown from "../images/dropdown.svg";

function Header() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [language, setLanguage] = useState("en");
  const { user, logout, artisanId, isArtisan } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const langDropdownRef = useRef(null);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
        setShowLangDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle language change
  const changeLanguage = (lang) => {
    setLanguage(lang);
    setShowLangDropdown(false);

    if (lang === "ar") {
      document.body.classList.add("rtl");
      document.body.classList.remove("ltr");
      document.documentElement.lang = "ar";
      document.documentElement.dir = "rtl";
    } else {
      document.body.classList.add("ltr");
      document.body.classList.remove("rtl");
      document.documentElement.lang = "en";
      document.documentElement.dir = "ltr";
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate("/signin");
  };

  return (
    <div className="header">
      <div className="header1">
        <Link to="/" className="buttons">
          Work Up
        </Link>
        {user && (
          <Link to="/conversations" className="buttonss">
            Messages
          </Link>
        )}
      </div>

      <div className="header2">
        {/* Language Dropdown */}
        <div ref={langDropdownRef} className="dropdown-container" onClick={() => setShowLangDropdown(!showLangDropdown)}>
          <img
            src={Globe}
            style={{ width: "20px", height: "20px", marginRight: "5px" }}
            alt="Globe icon"
          />
          <button
            className="buttonss"
            
            aria-label="Select language"
            aria-expanded={showLangDropdown}
          >
            {language === "en" ? "EN" : "AR"}
          </button>
          <img
            src={DropDown}
            style={{ width: "20px", height: "20px", marginLeft: "-25px", marginRight: "0px", paddingRight:"0px" }}
            alt="Dropdown icon"
          />
        </div>

        {user ? (
          <div ref={dropdownRef} className="dropdown-container">
            <button
              className="buttonss"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              aria-label="User menu"
              aria-expanded={dropdownOpen}
            >
              {user.username || "Profile"}
            </button>
            {dropdownOpen && (
              <div className="dropdown-menu">
                {isArtisan && (
                  <Link
                    to={`/artisan/${artisanId}`}
                    className="dropdown-item buttonss"
                    onClick={() => setDropdownOpen(false)}
                  >
                    My Profile
                  </Link>
                )}
                <div
                  className="dropdown-item buttonss"
                  onClick={handleLogout}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && handleLogout()}
                >
                  Logout
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="log">
            <button className="buttonssss">
              <Link to="/signin" className="text-scroll">
                Log in
              </Link>
            </button>
            <button className="buttonsss">
              <Link to="/signup" className="text-scroll">
                Get Started
              </Link>
            </button>
          </div>
        )}
        {showLangDropdown && (
            <div className="dropdown-menu">
              <div
                className="dropdown-item buttonss"
                onClick={() => changeLanguage("en")}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && changeLanguage("en")}
              >
                EN
              </div>
              <div
                className="dropdown-item buttonss"
                onClick={() => changeLanguage("ar")}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && changeLanguage("ar")}
              >
                AR
              </div>
            </div>
          )}
      </div>
    </div>
  );
}

export default Header;