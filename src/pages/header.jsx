import React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

function Header() {
    const [show, setShow] = useState(true);

    const handleClick = () => {
        setShow(false);
    };

    const scrollToSection = (sectionId) => {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="header">
            <div className={`${show ? 'header1' : 'header11'}`}>
                <Link to="/" className="buttonss" onClick={() => scrollToSection('home')}>
                    Home
                </Link>
                <Link to="/" className="buttonss" onClick={() => scrollToSection('services')}>
                    Services
                </Link>
                <Link to="/" className="buttonss" onClick={() => scrollToSection('about')}>
                    About Us
                </Link>
                <Link to="/" className="buttonss" onClick={() => scrollToSection('contact')}>
                    Contact Us
                </Link>
            </div>
            <div onClick={handleClick} className="hamburger">
                ☰
            </div>
            <div className={`${show ? 'header2' : 'header21'}`}>
                <Link to="/signin" className="buttonss">
                    Log in
                </Link>
                <Link to="/signup" className="buttonss">
                    Sign Up
                </Link>
            </div>
        </div>
    );
}

export default Header;