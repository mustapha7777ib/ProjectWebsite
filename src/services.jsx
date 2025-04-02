import React from 'react';
function Services(){
    return(
        <>
            <div className='containerservices'>
                <div>
                    <div className='containerservices1'>
                        <h2>Carpenter</h2>
                        <p className='servicetext'>
                            We are currently available in Abuja,
                            we provide this woodwork services for 
                            residence of the city in certain areas, find more below
                        </p>
                        <button className='findmore1'>More</button>
                    </div>
                </div>
                <div>
                <div className='containerservices2'>
                <h2>Electrician</h2>
                        <p className='servicetext'>
                            Now serving Abuja!
                            We offer reliable electrical services
                            to residents in select areas of the city.
                            Learn more below!
                        </p>
                        <button className='findmore2'>More</button>
                </div>
                </div>
               
            </div>
            <p>More</p>
        </>
    )
}

export default Services