import React from 'react';
import Body from './body';
import { useState } from 'react';

function Header() {
    const [show, setshow] = useState(true);
    const handleclick = () => {
      setshow(false);
  };
    return (
      <>
      <div className='header'>
        <div className={`${show ? 'header1' : 'header11'}`}>
            <p className='buttonss' onClick={() => window.scrollTo({ top: 1000, behavior: "smooth" })}>Home</p>
            <p className='buttonss' onClick={() => window.scrollTo({ top: 1000, behavior: "smooth" })}>Services</p>
            <p className='buttonss' onClick={() => window.scrollTo({ top: 1000, behavior: "smooth" })}>About Us</p>
            <p className='buttonss' onClick={() => window.scrollTo({ top: 1000, behavior: "smooth" })}>Contact Us</p>
        </div>
        <div onClick={() => handleclick()} className='hamburger'>
            ☰
        </div>
        <div className={`${show ? 'header2' : 'header21'}`}>
            <p>Log in</p>
            <p>Sign Up</p>
        </div>
      </div>
      <Body/>
      </>
    )
  }
  
export default Header
