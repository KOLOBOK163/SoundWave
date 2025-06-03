import React, { useState } from "react";
import axios from 'axios';
import '../SearchPage.css';

function SearchComponent({ onSearch }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`http://localhost:8080/api/tracks/search?query=${encodeURIComponent(searchQuery)}`);
      setSearchResults(response.data);
      
      if (onSearch) {
        onSearch(response.data);
      }
    } catch (err) {
      console.error('Error searching tracks:', err);
      setError('Failed to search tracks. Please try again.');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="search-container">
      <div className="search-input-container">
        <input
          type="text"
          placeholder="Поиск по трекам и исполнителям..."
          value={searchQuery}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          className="search-input"
        />
        <button onClick={handleSearch} className="search-button">
          <i className="fas fa-search">Найти</i>
        </button>
      </div>
      
      {loading && <div className="search-loading">Поиск...</div>}
      
      {error && <div className="search-error">{error}</div>}
      
      {searchResults.length > 0 && (
        <div className="search-results">
          {searchResults.map(track => (
            <div key={track.id} className="search-result-item">
              <img 
                src={track.coverUrl ? `http://localhost:8080${track.coverUrl}` : 'https://via.placeholder.com/50'} 
                alt={track.title}
                className="result-cover"
              />
              <div className="result-info">
                <h3>{track.title}</h3>
                <p>{track.artist}</p>
              </div>
              <button 
                className="play-button"
                onClick={() => {
                  const event = new CustomEvent('playTrack', { detail: track });
                  window.dispatchEvent(event);
                }}
              >
                <i className="fas fa-play"></i>
              </button>
            </div>
          ))}
        </div>
      )}
      
      {searchResults.length === 0 && searchQuery.trim() !== '' && !loading && (
        <div className="no-results">Ничего не найдено</div>
      )}
    </div>
  );
}

export default SearchComponent;