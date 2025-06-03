// src/components/Sidebar.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';

function Sidebar({ isLoggedIn, userRole }) {
  return (
    <div className="sidebar">
      <Link to="/" className="sidebar__option">
        <i className="fas fa-home"></i>
        <span>Главная</span>
      </Link>
      
      <Link to="/search" className="sidebar__option">
        <i className="fas fa-search"></i>
        <span>Поиск</span>
      </Link>
      
      {isLoggedIn && (
        <>
          <div className="sidebar__divider"></div>
          <Link to="/my-tracks" className="sidebar__option">
            <i className="fas fa-music"></i>
            <span>Мои треки</span>
          </Link>
          <Link to="/upload" className="sidebar__option">
            <i className="fas fa-upload"></i>
            <span>Загрузить трек</span>
          </Link>
          
          {/* Отображаем только для администраторов */}
          {userRole === 'ADMIN' && (
            <Link to="/admin" className="sidebar__option admin-option">
              <i className="fas fa-shield-alt"></i>
              <span>Админ-панель</span>
            </Link>
          )}
        </>
      )}
    </div>
  );
}

export default Sidebar;
