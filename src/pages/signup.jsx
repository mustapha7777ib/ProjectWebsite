import React from "react";
import { Link } from "react-router-dom";
function generateSteps(totalSteps) {
    let steps = [];
    for (let i = 1; i <= totalSteps; i++) {
      steps.push(i);
    }
    return steps;
  }
  
function SignUp(props) {
    const currentStep = props.currentStep || 1;
    const totalSteps = props.totalSteps || 4;
    const steps = generateSteps(totalSteps);
    return (
        <div className="signupjsx">    
            <div className="step-container">
            {steps.map(function (step, index) {
                return (
                <React.Fragment key={step}>
                    <div className={"step-circle " + (step === currentStep ? "active" : "")}>
                    {step}
                    </div>
                    {index < steps.length - 1 && <div className="step-line" />}
                </React.Fragment>
                );
            })}
            </div>
            <div >
                <h2>Create an Account</h2>
                <div>
                    <div className="inputer">
                        <p>Email</p>
                        <input className="inputerchild" placeholder="Enter your Email"/>
                    </div>
                    <div className="inputer">
                        <p>First Name</p>
                        <input className="inputerchild" placeholder="Enter your Password"/>
                    </div>
                    <div className="inputer">
                        <p>Last Name</p>
                        <input className="inputerchild" placeholder="Enter your Password"/>
                    </div>
                    <button>Next</button>
                    <p className="have">
                    Already have an account? 
                        <span>
                            <Link to="/signin" className="signin">
                            Sign in
                            </Link>
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
}
export default SignUp;

