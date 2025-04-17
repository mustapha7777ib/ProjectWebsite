import React from "react";
import { Link } from "react-router-dom";

function SignIn() {
  return (
    <div className="signinjsx">
        <p className="workuplogo">WORK<span>UP</span></p>
        <h2>Welcome Back!</h2>
        <div>
            <div className="inputer">
                <p>Email</p>
                <input className="inputerchild" placeholder="Enter your Email"/>
            </div>
            <div className="inputer">
                <p>Password</p>
                <input className="inputerchild" placeholder="Enter your Password"/>
            </div>
            <p className="forgot">Forgot password?</p>
        </div>
        <button>Login</button>
        <p className="donthave">
        Don't have an account? 
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
