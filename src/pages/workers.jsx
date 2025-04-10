import React from 'react';
import icon1 from "../images/icons8-search.svg"

function Workers() {
    return (
        <div className='Workers'>
            <div>
                <h1>Get Trusted <span className='Artisans'>Artisans</span><br/>
                for Your Home Needs</h1>
                <p>
                    Easily connect with experienced and verified professionals for cleaning,<br/>
                    electrical work, maintenance, and plumbing.<br/>
                    Simply post your task and receive a quote in no time.<br/>
                </p>
            </div>
            <div className='searchbar'>
                <p>What type of artisan do you want to hire?</p>
                <img className='icon' src={icon1}></img>
            </div>
            <div className='artisanss'>
                <div className='artisanss1'>
                    <p>Carpenter</p>
                </div>
                <div className='artisanss2'>
                    <p>Electrician</p>
                </div>
                <div className='artisanss3'>
                    <p>Plumber</p>
                </div>
                <div className='artisanss4'>
                    <p>Welder</p>
                </div>
                <div className='artisanss5'>
                    <p>Tiler</p>
                </div>
            </div>
        </div>
    );
}
export default Workers;