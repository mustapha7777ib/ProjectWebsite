import React from 'react';
import Header from './header.jsx';
import Body from './body.jsx';
import Services from './services.jsx';
import About from './about.jsx';
import Workers from './workers.jsx';
import Contact from './contact.jsx';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
    return (
        <Router>
            <Header />
            <Routes>
                <Route 
                    path="/" 
                    element={
                        <>
                            <Body />
                            <Services />
                            <About />
                            <Contact />
                        </>
                    }
                />
                <Route path="/workers" element={<Workers />} />
                </Routes>
        </Router>
        
    );
}

export default App;