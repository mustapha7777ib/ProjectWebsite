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
import ArtisanProfile from './artisanprofile.jsx';
import MatchingArtisansPage from './matching-artisans.jsx';
import PublicArtisanProfile from './PublicArtisanProfile.jsx';
import Chat from './chat.jsx';
import Conversations from './conversations.jsx';
import ConversationsList from './conversationslist.jsx';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuth } from './AuthContext';

function PurchaseCoins() {
  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>Purchase Coins</h2>
      <p>Please proceed to the payment gateway to purchase more coins.</p>
    </div>
  );
}

function App() {
  const { user } = useAuth();

  return (
    <Router>
      <Header />
      <Routes>
        <Route
          path="/"
          element={
            <div style={{ marginLeft: '150px' }}>
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
        <Route path="/matching-artisans" element={<MatchingArtisansPage />} />
        <Route path="/artisan-profile/:id" element={<PublicArtisanProfile />} />
        <Route path="/chat/:artisanId" element={<Chat currentUser={user} />} />
        <Route path="/conversations" element={<Conversations />} />
        <Route path="/conversationslist" element={<ConversationsList />} />
        <Route path="/purchase-coins" element={<PurchaseCoins />} />
      </Routes>
    </Router>
  );
}

export default App;