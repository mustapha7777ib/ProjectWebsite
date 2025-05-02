import React from 'react';
import Header from './header.jsx';
import Body from './body.jsx';
import Services from './services.jsx';
import About from './about.jsx';
import Workers from './workers.jsx';
import Contact from './contact.jsx';
import Join from './join.jsx';
import SignIn from './signin.jsx';
import SignUp from './signup.jsx';
import Profile from './profile.jsx';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ArtisanProfile from './artisanprofile';

function App() {
    return (
        <Router>
            <Header />
            <Routes>
                <Route 
                    path="/" 
                    element={
                        <div style={{marginLeft: "150px"}}>
                            <Body />
                            <Services />
                            <About />
                            <Contact />
                        </div>
                    }
                />
                <Route path="/workers" element={<Workers />} />
                <Route path="/join" element={<Join />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/artisan-profile" element={<ArtisanProfile />} />
                </Routes>
        </Router>
        
    );
}

export default App;