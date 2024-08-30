import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Header.css';

const Header = ({ isLoggedIn, user, onLogout, onUpdateUser }) => {
  const [isAuth, setIsAuth] = useState(isLoggedIn);
  const [currentUser, setCurrentUser] = useState(user);
  const navigate = useNavigate();

  useEffect(() => {
    setIsAuth(isLoggedIn);
    setCurrentUser(user);
  }, [isLoggedIn, user]);

  useEffect(() => {
    if (onUpdateUser) {
      onUpdateUser(currentUser);
    }
  }, [currentUser, onUpdateUser]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuth(false);
    setCurrentUser(null);
    onLogout();
    navigate('/');
  };
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.get('http://localhost:8080/api/profile', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(response => {
        setIsAuth(true);
        setCurrentUser(response.data);
        if (onUpdateUser) onUpdateUser(response.data);
      })
      .catch(() => {
        setIsAuth(false);
        localStorage.removeItem('token');
      });
    }
  }, [onUpdateUser]);

  // Исправление: проверьте URL аватара перед отображением
  const avatarUrl = currentUser?.avatarUrl ? `http://localhost:8080${currentUser.avatarUrl}` : 'https://via.placeholder.com/40';
  
  return (
    <header className="header">
      <div className="header-container">
        <h1>SoundWave</h1>
        <nav className="header-nav">
          {isAuth ? (
            <div className="auth-section">
              <img
                src={avatarUrl}
                alt="Avatar"
                className="avatar"
                onClick={() => navigate('/profile')}
              />
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>
          ) : (
            <div className="auth-buttons">
              <button onClick={() => navigate('/login')} className="auth-button">Войти</button>
              <button onClick={() => navigate('/register')} className="auth-button">Зарегистрироваться</button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
