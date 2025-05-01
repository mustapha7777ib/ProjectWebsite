import React, { useState } from "react";
import { Link } from "react-router-dom";

function SignUp() {
  const [step, setStep] = useState(1); 
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState(""); 

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

    fetch("http://localhost:5050/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setMessage(data.error); 
        } else {
          setMessage("Account created successfully!");

        }
      })
      .catch((err) => setMessage("Error: " + err.message)); 
  }

  return (
    <div className="signupjsx">
      <h2>Create an Account</h2>

      {message && <p className="message">{message}</p>} 

      {step === 1 && (
        <>
          <div className="inputer">
            <p>Email</p>
            <input
              className="inputerchild"
              placeholder="Enter your Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div className="inputer">
            <p>First Name</p>
            <input
              className="inputerchild"
              placeholder="Enter your First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
            />
          </div>
          <div className="inputer">
            <p>Last Name</p>
            <input
              className="inputerchild"
              placeholder="Enter your Last Name"
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
            <p>Password</p>
            <div >
                <input
                    className="inputerchild"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your Password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                />
            </div>
          </div>

          <div className="inputer">
            <p>Confirm Password</p>
            <div >
              <input
              className="inputerchild"
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm your Password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>

          <button onClick={handleFinalSubmit}>Sign Up</button>
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
  );
}

export default SignUp;
