import React from "react";
import Youtube from "../images/youtube.svg"
import Instagram from "../images/instagram.svg"
import Linkedin from "../images/linkedin.svg";
import Discord from "../images/discord.svg"; 
function Footer() {
  return (
    <>
    <div id="footer" className="footer cdg">
      <div className="footer-1">
        <div className="footer-brand">
          <h3 className="footer-title">Work Up</h3>
        </div>
        <div className="footer-2">
        <div className="footer-contact">
          <h4 className="footer-subtitle">Contact Us</h4>
          <div className="footer-subtitlee">
          <p className="footer-item">
            <span className="footer-icon">info@workup.com</span>
          </p>
          <p className="footer-item">
            <span className="footer-icon">+234 905-617-1492</span> 
          </p>
          <p className="footer-item">
            <span className="footer-icon">123 Main St, Abuja, Nigeria</span>
          </p>
          </div>
        </div>
        </div>
        <div className="footer-nav">
          <h4 className="footer-subtitle explore">Explore</h4>
          <div className="nav-links">
            <a href="/" className="nav-link">Home</a>
            <a href="/signin" className="nav-link">Sign In</a>
            <a href="/wokers" className="nav-link">Get Services</a>
          </div>
          </div>
                  <div className="footer-social">
            <h4 className="footer-subtitle">Follow Us</h4>
            <div className="footer-social-links">
              <img src={Youtube} className="social-link"/>
              <img src = {Linkedin} className="social-link"/>
              <img src={Instagram} className="social-link"/>
              <img src={Discord} className="social-link"/>
            </div>
          </div>
        </div>

      <p className="footer-copyright">© 2025 Work Up. All rights reserved.</p>
            </div>
      </>
    
  );
}

export default Footer;