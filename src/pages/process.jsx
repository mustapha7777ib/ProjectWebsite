import React, { useState, useEffect } from "react";
import One from "../images/one.svg";
import Two from "../images/two.svg";
import Three from "../images/three.svg";
import Four from "../images/four.svg";

function Process() {

  
  return (
    <div className="containerbodyy crc ">
      <h1 className="process-title">How to Get an Artisan</h1>
      <div className="process-grid">
        <div className="process-box">
            <div style={{ display: 'flex'}}>
                <img src={One} alt="Step 1" className="process-icon" />   
                <p className="process-name">Sign Up</p>  
            </div>
          <p className="process-text">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do e            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
iusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        </div>
        <div className="process-box">
            <div style={{ display: 'flex'}}>
                <img src={Two} alt="Step 1" className="process-icon" />   
                <p className="process-name">Search</p>  
            </div>
          
          <p className="process-text">
            Ut enim ad minim veniam, quis nostrud eiusmod tempor incididunt ut labore et dolore magna aliqua.
xercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>
        </div>
        <div className="process-box">
            <div style={{ display: 'flex'}}>
                <img src={Three} alt="Step 1" className="process-icon" />   
                <p className="process-name">Message</p>  
            </div>
          <p className="process-text">
            Duis aute irure dolor in reprehenderiiusmod tempor incididunt ut labore et dolore magna aliqua.
t in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
          </p>
        </div>
        <div className="process-box">
            <div style={{ display: 'flex'}}>
                <img src={Four} alt="Step 1" className="process-icon" />   
                <p className="process-name">Close Deal</p>  
            </div>
          <p className="process-text">
            Excepteur sint occaeofficiacat cupiddeseruntofficiaatat noniusmod tempor incididunt ut labore et dolore magna aliqua.
 proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Process;