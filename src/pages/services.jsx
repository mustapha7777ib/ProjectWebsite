import React from 'react';
import { Link } from 'react-router-dom';
import Arrow from '../images/arrow.svg';

function Services() {
    return (
        <div className='ab'>
            <div id="services">
                <Link  to="/workers"  className='okk'>
                    <p className="seemore">Get Services</p>
                    <img src={Arrow} className='arrow'></img>
                </Link>
            </div>
        </div>
    );
}

export default Services;