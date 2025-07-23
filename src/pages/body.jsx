import React from 'react';
import { TypeAnimation } from 'react-type-animation';

function Body() {
    return (
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
    );
}

export default Body;