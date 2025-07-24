import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import Eye from "../images/eye.svg";
import ClosedEye from "../images/closedeye.svg";

function SignUp() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
    verificationCode: "", // New field for verification code
  });
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  function handleNextStep(e) {
    e.preventDefault();
    const { email, firstName, lastName } = formData;
    if (!email || !firstName || !lastName) {
      setMessage("Please fill in all fields.");
      return;
    }
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      setMessage("Please enter a valid email.");
      return;
    }
    setMessage("");
    setStep(2);
  }

  function handleFinalSubmit(e) {
    e.preventDefault();
    const { password, confirmPassword } = formData;
    if (!password || !confirmPassword) {
      setMessage("Please enter and confirm your password.");
      return;
    }
    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    // Send signup request to backend to get verification code
    fetch("http://localhost:8080/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formData, step: "verify" }), // Indicate verification step
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setMessage(data.error);
        } else {
          setMessage("A verification code has been sent to your email.");
          setStep(3); // Move to verification step
        }
      })
      .catch((err) => setMessage("Error: " + err.message));
  }

function handleVerifyCode(e) {
  e.preventDefault();
  const { verificationCode } = formData;

  if (!verificationCode) {
    setMessage("Please enter the verification code.");
    return;
  }

  // Verify the code with the backend
  fetch("http://localhost:8080/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: formData.email, verificationCode }),
    credentials: "include", // Add this to send the session cookie
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.error) {
        setMessage(data.error); // e.g., "Invalid verification code"
      } else {
        login(data.user); // Log in the user after successful verification
        navigate("/"); // Redirect to home page
      }
    })
    .catch((err) => setMessage("Error: " + err.message));
}

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  return (
    <div className="signupjsx">
      <div className="signupjsxchild">
        <p className="workuplogo">WORK<span>UP</span></p>
        <h2>Create an Account</h2>

        {message && <p className="message-email">{message}</p>}

        {step === 1 && (
          <>
            <div className="inputer">
              <input
                className="inputerchild"
                placeholder="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="inputer">
              <input
                className="inputerchild"
                placeholder="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>
            <div className="inputer">
              <input
                className="inputerchild"
                placeholder="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>
            <button onClick={handleNextStep}>Next</button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="inputer">
              <input
                className="inputerchild"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your Password"
                name="password"
                value={formData.password}
                onChange={handleChange}
              />
              <span
                className="eye-icon"
                onClick={togglePasswordVisibility}
                style={{ cursor: "pointer", marginLeft: "-30px", position: "relative", top: "5px" }}
              >
                <img
                  src={showPassword ? ClosedEye : Eye}
                  alt={showPassword ? "Hide password" : "Show password"}
                  className="eye"
                />
              </span>
            </div>

            <div className="inputer">
              <input
                className="inputerchild"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your Password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              <span
                className="eye-icon"
                onClick={toggleConfirmPasswordVisibility}
                style={{ cursor: "pointer", marginLeft: "-30px", position: "relative", top: "5px" }}
              >
                <img
                  src={showConfirmPassword ? ClosedEye : Eye}
                  alt={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  className="eye"
                />
              </span>
            </div>

            <button onClick={handleFinalSubmit}>Next</button>
          </>
        )}

        {step === 3 && (
          <>
            <div className="inputer">
              <input
                className="inputerchild"
                placeholder="Enter Verification Code"
                name="verificationCode"
                value={formData.verificationCode}
                onChange={handleChange}
              />
            </div>
            <button onClick={handleVerifyCode}>Verify</button>
          </>
        )}

        <p className="have">
          Already have an account?{" "}
          <span>
            <Link to="/signin" className="signin">
              Sign in
            </Link>
          </span>
        </p>
      </div>
    </div>
  );
}

export default SignUp;