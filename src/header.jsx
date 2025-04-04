import React from 'react';
import { useState } from 'react';

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
                <p className="buttonss" onClick={() => scrollToSection('home')}>
                    Home
                </p>
                <p className="buttonss" onClick={() => scrollToSection('services')}>
                    Services
                </p>
                <p className="buttonss" onClick={() => scrollToSection('about')}>
                    About Us
                </p>
                <p className="buttonss" onClick={() => scrollToSection('contact')}>
                    Contact Us
                </p>
            </div>
            <div onClick={handleClick} className="hamburger">
                ☰
            </div>
            <div className={`${show ? 'header2' : 'header21'}`}>
                <p>Log in</p>
                <p>Sign Up</p>
            </div>
        </div>
    );
}

export default Header;