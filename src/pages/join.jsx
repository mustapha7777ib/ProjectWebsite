import React from "react";
import icon2 from "../images/Screenshot 2025-04-17 at 07.33.59.png";
import { Link } from "react-router-dom";

function Join() {
  return (
    <div className="join">
      <div className="join-container">
        <h1>Sign up</h1>
        <p className="already">
          Already have an account?
          <span>
            <Link to="/signin" className="signin">
              Sign in
            </Link>
          </span>
        </p>
        <Link to="/signup" className="signup-button">
          Sign Up
        </Link>
      </div>
      <div>
        <img className="icon2" src={icon2} alt="Join icon" />
      </div>
    </div>
  );
}

export default Join;