import React from 'react';
import { Link } from 'react-router-dom';

function Services() {
    return (
        <div id="services">
            <div className="containerservices">
                <div>
                    <div className="containerservices1">
                        <h2>Carpenter</h2>
                        <p className="servicetext">
                            We are currently available in Abuja, we provide this woodwork services for 
                            residence of the city in certain areas, find more below
                        </p>
                        <Link to="/workers" className="findmore1 anchortagfindmore">
                            More
                        </Link>
                        <button className="joinus1">Join Us</button>
                    </div>
                </div>
                <div>
                    <div className="containerservices2">
                        <h2>Electrician</h2>
                        <p className="servicetext">
                            Now serving Abuja! We offer reliable electrical services to residents in select areas of the city. Learn more below!
                        </p>
                        <Link to="/workers" className="findmore2 anchortagfindmore">
                            More
                        </Link>
                        <button className="joinus2">Join Us</button>
                    </div>
                </div>
            </div>
            <div className="containerservices">
                <div>
                    <div className="containerservices11">
                        <h2>Plumber</h2>
                        <p className="servicetext">
                            Providing expert plumbing services across Abuja! We serve residents in select areas of the city. Find out more below!
                        </p>
                        <Link to="/workers" className="findmore11 anchortagfindmore">
                            More
                        </Link>
                        <button className="joinus3">Join Us</button>

                    </div>
                </div>
                <div>
                    <div className="containerservices21">
                        <h2>Welder</h2>
                        <p className="servicetext">
                            Reliable welding services now available in Abuja! We cater to residents in specific areas of the city. Learn more below!
                        </p>
                        <Link to="/workers" className="findmore21">
                            More
                        </Link>
                        <button className="joinus4">Join Us</button>
                    </div>
                </div>
            </div>
            <Link to="/workers" className="seemore">
                See More
            </Link>
        </div>
    );
}

export default Services;