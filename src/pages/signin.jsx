import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext"; 

function SignIn() {
  const { login, setArtisan } = useAuth();
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

    fetch("http://localhost:8080/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setMessage(data.error);
        } else {
          setMessage("Login successful!");
          console.log("User data:", data.user);
          
          login(data.user);
          setArtisan(data.user.artisanId);
          navigate("/");
        }
      })
      .catch((err) => setMessage("Error: " + err.message));
  }
  return (
    <div className="signinjsx">
      <div className="signinjsxchild">
      <p className="workuplogo">WORK<span>UP</span></p>
      <h2>Sign In to your Account</h2>

      {message && <p className="message-email">{message}</p>}

      <div>
        <div className="inputer">
          <input
            className="inputerchild"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>
        <div className="inputer">
          <input
            className="inputerchild"
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
          />
        </div>
      </div>
      <p className="condition">
        By signing in, you are agreeing to Work Up's <span className="terms">Terms of Use</span> and <span  className="terms">Privacy Policy.</span>
      </p>

      <button className="issue" onClick={handleSubmit}>Login</button>

      <p className="donthave">
        Don't have an account?{" "}
        <span>
          <Link to="/signup" className="signup">
            Create account
          </Link>
        </span>
      </p>
      </div>
    </div>
  );
}

export default SignIn;