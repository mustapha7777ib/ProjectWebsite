import React from 'react';
import { Link } from 'react-router-dom';
import Arrow from '../images/arrow.svg';

function Services() {
    return (
        <div id="services">
            <Link to="/workers" className="seemore">
                Get Services
            </Link>
            <img src={Arrow} className='arrow'></img>
        </div>
    );
}

export default Services;