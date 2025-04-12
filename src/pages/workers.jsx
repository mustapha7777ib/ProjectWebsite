import React, { useState } from 'react';
import icon1 from "../images/icons8-search.svg";
import Modal from 'react-modal';

Modal.setAppElement('#root');

function Workers() {
    const [city, setCity] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [selectedArtisan, setSelectedArtisan] = useState(0);
    const [isCityValid, setIsCityValid] = useState(true);
    const [email, setEmail] = useState('');
    const [showErrors, setShowErrors] = useState(false); 

    const abujaData = {
        cities: [
            "Asokoro", "Maitama", "Wuse", "Garki", "Gwarimpa", "Lokogoma", "Jabi", "Utako", "Katampe Extension Hill",
            "Kuje", "Abaji", "Bwari", "Gwagwalada", "Kwali", "Abuja Municipal Area Council (AMAC)", "Dawaki", "Gwagwa",
            "Nyanya", "Kubwa", "Olu Awotesu Street", "Lugbe", "Guzape", "Apo Dutse", "Dakibiyu", "Duboyi", "Durumi",
            "Gaduwa", "Games Village", "Kaura", "Gudu", "Jahi", "Kado", "Kukwaba", "Mabushi", "Wuye", "Galadimawa",
            "Kabusa", "Karmo", "Life Camp", "Nbora"
        ]
    };

    const jobs = [
        "Carpenter", "Electrician", "Plumber", "Welder",
        "Tiler", "Cleaner", "Painter", "Gardener", "Technician",
    ];

    const validateCity = () => {
        const cityFormatted = city.trim().toLowerCase();
        console.log('🔍 You entered:', cityFormatted);
        const isValid = cityFormatted ? abujaData.cities.some(c => c.toLowerCase() === cityFormatted) : false;
        setIsCityValid(isValid);
        console.log(isValid ? '✅ City accepted:' : '❌ City not found:', city);
    };

    const handleProceed = () => {
        setShowErrors(true);
        if (isCityValid && city && email && selectedArtisan !== 0) {
            console.log('Proceeding with:', { city, email, artisan: jobs[selectedArtisan - 1] });
            setIsOpen(false);
        } else {
            console.log('Cannot proceed: Invalid city, missing fields, or no artisan selected');
        }
    };

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        console.log('Email (onChange):', e.target.value);
    };

    return (
        <div className='Workers'>
            <div>
                <h1>
                    Get Trusted <span className='Artisans'>Artisans</span><br />
                    for Your Home Needs
                </h1>
                <p>
                    Easily connect with experienced and verified professionals for cleaning,<br />
                    electrical work, maintenance, and plumbing.<br />
                    Simply post your task and receive a quote in no time.<br />
                </p>
            </div>

            <div className='searchbar' onClick={() => setIsOpen(true)}>
                <p>What type of artisan do you want to hire?</p>
                <img className='icon' src={icon1} alt="search icon" />
            </div>

            <Modal
                isOpen={isOpen}
                onRequestClose={() => setIsOpen(false)}
                style={{
                    overlay: {
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    },
                    content: {
                        top: '50%',
                        left: '50%',
                        right: 'auto',
                        bottom: 'auto',
                        marginRight: '-50%',
                        transform: 'translate(-50%, -50%)',
                        padding: '30px',
                        borderRadius: '12px',
                        width: '400px',
                    }
                }}
            >
            <div className='modalclass'>
                <div>
                    <h2 className='modalh2'>What type of artisan do you want to hire?</h2>
                    <p>Select an artisan that you want to hire</p>
                    <div className='artisanssmodal'>
                        {jobs.map((j, i) => (
                            <div
                                key={i}
                                className={`artisansmodal ${selectedArtisan === i + 1 ? 'selected' : ''}`}
                                onClick={() => setSelectedArtisan(selectedArtisan === i + 1 ? 0 : i + 1)}
                            >
                                <p>{j}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <input
                    className='inputbox'
                    placeholder='Your Location in Abuja'
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    onBlur={validateCity}
                />
                {showErrors && !city && <p className='error'>Fill in the space</p>}
                {city && !isCityValid && <p className='notavailable'>Not Available</p>}
                <input
                    id='email'
                    placeholder='Email Address'
                    value={email}
                    onChange={handleEmailChange}
                />
                {showErrors && !email && <p className='error'>Fill in the space</p>}
                <button
                    className='proceed'
                    onClick={handleProceed}
                    disabled={city && !isCityValid} 
                >
                    Proceed
                </button>
                <button className='close' onClick={() => setIsOpen(false)}>Close</button>
            </div>
            <div>
                
            </div>
            </Modal>

            <div className='artisanss'>
                {jobs.slice(0, 5).map((j, i) => (
                    <div
                        key={i}
                        className={`artisan ${selectedArtisan === i + 1 ? 'selected' : ''}`}
                        onClick={() => setSelectedArtisan(selectedArtisan === i + 1 ? 0 : i + 1)}
                    >
                        <p>{j}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Workers;