// src/components/Sidebar.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';

function Sidebar() {
  return (
    <div className="sidebar">
      <Link to="/" className="sidebar__option">Главная</Link>
      <Link to="/search" className="sidebar__option">Поиск</Link>
      <Link to="/library" className="sidebar__option">Моя библиотека</Link>
    </div>
  );
}

export default Sidebar;
