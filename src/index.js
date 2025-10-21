import { Link } from "react-router-dom";
// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// 👉 Router + routes ici (plus simple)
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Checkout from './pages/Checkout';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Accueil = ton App existante */}
        <Route path="/" element={<App />} />
        {/* Nouvelle page /checkout */}
        <Route path="/checkout" element={<Checkout />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);