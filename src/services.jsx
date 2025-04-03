import React from 'react';

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
                        <button className="findmore1">More</button>
                    </div>
                </div>
                <div>
                    <div className="containerservices2">
                        <h2>Electrician</h2>
                        <p className="servicetext">
                            Now serving Abuja! We offer reliable electrical services to residents in select areas of the city. Learn more below!
                        </p>
                        <button className="findmore2">More</button>
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
                        <button className="findmore11">More</button>
                    </div>
                </div>
                <div>
                    <div className="containerservices21">
                        <h2>Welder</h2>
                        <p className="servicetext">
                            Reliable welding services now available in Abuja! We cater to residents in specific areas of the city. Learn more below!
                        </p>
                        <button className="findmore21">More</button>
                    </div>
                </div>
            </div>
            <p className="seemore">See More</p>
        </div>
    );
}

export default Services;