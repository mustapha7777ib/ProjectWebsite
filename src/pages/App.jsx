import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
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
import EditProfile from './editprofile.jsx';
import PurchaseCoins from './PurchaseCoins.jsx';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Loading...</div>;
  return user ? children : <Navigate to="/signin" />;
}

function App() {
  const { loading } = useAuth();

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <>
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
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/artisan-profile"
          element={
            <ProtectedRoute>
              <ArtisanProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/matching-artisans"
          element={
            <ProtectedRoute>
              <MatchingArtisansPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/artisan-profile/:id"
          element={
            <ProtectedRoute>
              <PublicArtisanProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat/:recipientId"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/conversations"
          element={
            <ProtectedRoute>
              <Conversations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/conversationslist"
          element={
            <ProtectedRoute>
              <ConversationsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/purchase-coins"
          element={
            <ProtectedRoute>
              <PurchaseCoins />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-profile"
          element={
            <ProtectedRoute>
              <EditProfile />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<div className="not-found">404 - Page Not Found</div>} />
      </Routes>
    </>
  );
}

export default App;