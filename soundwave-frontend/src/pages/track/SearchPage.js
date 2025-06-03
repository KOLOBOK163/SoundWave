import React from 'react';
import SearchComponent from '../track/components/SearchTrackPage';
import './SearchPage.css';

function SearchPage() {
  return (
    <div className="search-page">
      <h1>Поиск треков</h1>
      <SearchComponent />
      
      <div className="search-suggestions">
        <h3>Популярные жанры</h3>
        <div className="genre-tags">
          <span className="genre-tag">Рок</span>
          <span className="genre-tag">Поп</span>
          <span className="genre-tag">Хип-хоп</span>
          <span className="genre-tag">Электронная</span>
          <span className="genre-tag">Джаз</span>
        </div>
      </div>
    </div>
  );
}

export default SearchPage;