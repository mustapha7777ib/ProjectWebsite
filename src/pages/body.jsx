import React from "react";
import { TypeAnimation } from "react-type-animation";
import { Link, useNavigate, useLocation } from "react-router-dom";

function Body({ show, setShow }) {
  console.log("Body - show value:", show);
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  const handleLinkClick = () => {
    setShow(true);
  };

  return (
    <>
    {isHomePage &&(
      <div className="containerbody">
        <p className="text">
          New to your area? Looking for<br />
          <TypeAnimation
            sequence={["an electrician", 1000, "a carpenter", 1000, "a plumber", 1000]}
            speed={50}
            repeat={Infinity}
            style={{ fontWeight: 900 }}
          /><br />
        </p>
      </div>
)}
      {!show && (
        <>
          <div className="containerbody-1">
            <div className="log-1">
              <Link className="buttonssss-1" to="/signin" onClick={handleLinkClick}>
                <span className="text-scroll">Log in</span>
              </Link>
              <Link className="buttonsss-1" to="/signup" onClick={handleLinkClick}>
                <span className="text-scroll">Get Started</span>
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default Body;
