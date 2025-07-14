import React from 'react';

function Contact() {
    return (
        <div id="contact"className="contact">
            <h1>CONTACT US</h1>
            <div className="contact1">
                <div className="details">
                    <p>
                        For any inquiries, suggestions, or concerns about Work Up,<br />
                        please feel free to reach out to us at:<br />
                    </p>
                </div>
                <div className='details2'>
                    <p className="email">Email: workup@email.com</p><br />
                    <p className="phone">Phone: +234 905-617-1492</p><br />
                    <p className="address">Address: 123 Main St, Abuja, Nigeria, 900001</p>
                </div>
            </div>
        </div>
    );
}

export default Contact;