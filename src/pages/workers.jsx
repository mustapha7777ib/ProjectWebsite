import React, { useState } from 'react';
import icon1 from "../images/icons8-search.svg";
import Modal from 'react-modal';

Modal.setAppElement('#root');

function Workers() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className='Workers'>
            <div>
                <h1>
                    Get Trusted <span className='Artisans'>Artisans</span><br/>
                    for Your Home Needs
                </h1>
                <p>
                    Easily connect with experienced and verified professionals for cleaning,<br/>
                    electrical work, maintenance, and plumbing.<br/>
                    Simply post your task and receive a quote in no time.<br/>
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
                <div>
                    <h2>What type of artisan do you want to hire?</h2>
                    <p>Select an artisan that you want to hire</p>
                    <div className='artisanssmodal'>
                        <div className='artisanssmodal1'><p>Carpenter</p></div>
                        <div className='artisanssmodal2'><p>Electrician</p></div>
                        <div className='artisanssmodal3'><p>Plumber</p></div>
                        <div className='artisanssmodal4'><p>Welder</p></div>
                        <div className='artisanssmodal5'><p>Tiler</p></div>
                        <div className='artisanssmodal6'><p>Cleaner</p></div>
                        <div className='artisanssmodal7'><p>Painter</p></div>
                        <div className='artisanssmodal8'><p>Gardener</p></div>
                        <div className='artisanssmodal9'><p>Technician</p></div>
                    </div>
                </div>
                <input className='inputbox' placeholder='Your Location in Abuja'/>
                <button className='close' onClick={() => setIsOpen(false)}>Close</button>
            </Modal>

            <div className='artisanss'>
                <div className='artisanss1'><p>Carpenter</p></div>
                <div className='artisanss2'><p>Electrician</p></div>
                <div className='artisanss3'><p>Plumber</p></div>
                <div className='artisanss4'><p>Welder</p></div>
                <div className='artisanss5'><p>Tiler</p></div>
            </div>
        </div>
    );
}

export default Workers;
