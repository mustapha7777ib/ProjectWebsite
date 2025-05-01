import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../pages/header.css';
import App from '../pages/App.jsx';
import { AuthProvider } from './AuthContext.jsx'; 
import React from 'react';

const root = createRoot(document.getElementById('root'));

root.render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);

