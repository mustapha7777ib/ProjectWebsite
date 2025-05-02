import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext"; 

function SignIn() {
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setMessage("Please enter both email and password.");
      return;
    }

    fetch("http://localhost:5050/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setMessage(data.error);
        } else {
          setMessage("Login successful!");
          login(data.user);
          navigate("/");
        }
      })
      .catch((err) => setMessage("Error: " + err.message));
  }
  return (
    <div className="signinjsx">
      <p className="workuplogo">WORK<span>UP</span></p>
      <h2>Welcome Back!</h2>

      {message && <p className="message">{message}</p>}

      <div>
        <div className="inputer">
          <p>Email</p>
          <input
            className="inputerchild"
            name="email"
            placeholder="Enter your Email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>
        <div className="inputer">
          <p>Password</p>
          <input
            className="inputerchild"
            type="password"
            name="password"
            placeholder="Enter your Password"
            value={formData.password}
            onChange={handleChange}
          />
        </div>
        <p className="forgot">Forgot password?</p>
      </div>

      <button onClick={handleSubmit}>Login</button>

      <p className="donthave">
        Don't have an account?{" "}
        <span>
          <Link to="/signup" className="signup">
            Create account
          </Link>
        </span>
      </p>
    </div>
  );
}

export default SignIn;