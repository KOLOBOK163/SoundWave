// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import Player from './components/Player';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import ProfilePage from './components/Profile';
import EditProfile from './components/EditProfile';
import './App.css';
import axios from 'axios';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.get('http://localhost:8080/api/profile', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(response => {
        setIsLoggedIn(true);
        setUser(response.data);
      })
      .catch(() => {
        setIsLoggedIn(false);
        setUser(null);
        localStorage.removeItem('token');
      });
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setIsLoggedIn(true);
    setUser(userData);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <Router>
      <Header isLoggedIn={isLoggedIn} user={user} onLogout={handleLogout} />
      <div className="app-body">
        <Sidebar />
        <MainContent>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profile" element={<ProfilePage onUpdateUser={setUser} />} />
            <Route path="/edit-profile" element={<EditProfile user={user} onUpdateUser={setUser} />} />
          </Routes>
        </MainContent>
      </div>
      <Player />
    </Router>
  );
}

export default App;
