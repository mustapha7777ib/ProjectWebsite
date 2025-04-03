import React from 'react';
import { TypeAnimation } from 'react-type-animation';

function Body() {
    return (
        <div id="home" className="containerbody">
            <p className="text">
                New to your area?<br /> Looking for<br />
                <TypeAnimation
                    sequence={["an electrician", 1000, "a carpenter", 1000, "a plumber", 1000]}
                    speed={50}
                    repeat={Infinity}
                    style={{ fontWeight: 900 }}
                /><br />
                lets <span className="spann">work it up</span> for you
            </p>
            <div className="right">
                <p className="work">WORK</p>
                <p className="up">UP</p>
            </div>
        </div>
    );
}

export default Body;