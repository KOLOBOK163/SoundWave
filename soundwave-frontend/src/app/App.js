// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Header from '../widgets/Header/Header';
import Sidebar from '../widgets/SideBar/Sidebar';
import MainContent from '../features/audio-content/MainContent';
import Player from '../features/player/Player';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ProfilePage from '../pages/profile/Profile';
import EditProfile from '../pages/profile/EditProfile';
import UploadTrackPage from '../pages/track/UploadTrackPage';
import MyTracksPage from '../pages/track/MyTrackPage';
import SearchPage from '../pages/track/SearchPage';
import AdminPanel from '../pages/admin/AdminPanel';
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
        <Sidebar isLoggedIn={isLoggedIn} userRole={user?.role} />
        <MainContent>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profile" element={isLoggedIn ? <ProfilePage onUpdateUser={setUser} />: <LoginPage onLoginSuccess={handleLoginSuccess} />} />
            <Route path="/edit-profile" element={isLoggedIn ? <EditProfile user={user} onUpdateUser={setUser} /> : <LoginPage onLoginSuccess={handleLoginSuccess} />} />
            <Route path="/upload" element={isLoggedIn ? <UploadTrackPage /> : <LoginPage onLoginSuccess={handleLoginSuccess} />} />
            <Route path="/my-tracks" element={isLoggedIn ? <MyTracksPage /> : <LoginPage onLoginSuccess={handleLoginSuccess} />} />
            <Route path = "/search" element={<SearchPage />} />
            <Route path="/admin" element={isLoggedIn && user?.role === 'ADMIN' ? <AdminPanel /> : <Navigate to="/login" />} />
          </Routes>
        </MainContent>
      </div>
      <Player />
    </Router>
  );
}

export default App;
