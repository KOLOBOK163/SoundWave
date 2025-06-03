import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TrackList from '../features/audio-content/TracksComponent/TrackList';
import './HomePage.css';

const HomePage = () => {
  const [featuredTracks, setFeaturedTracks] = useState([]);
  const [recentTracks, setRecentTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8080/api/tracks');

        setFeaturedTracks(response.data.slice(0, 6));
        setRecentTracks(response.data.slice(6, 12));
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching tracks', err);
        setError('Failed to load tracks. Please try again.');
        setLoading(false);
      }
    };
    
    fetchTracks();
  }, []);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="home-page">
      {/* <div className="hero-section">
        <h1>Добро пожаловать на SoundWave!</h1>
        <p>Откройте для себя новую музыку и делитесь своим творчеством</p>
      </div> */}
      
      <section className="tracks-section">
        <h2>Популярные треки</h2>
        <div className="tracks-grid">
          {featuredTracks.map(track => (
            <div key={track.id} className="track-card" onClick={() => {
              const event = new CustomEvent('playTrack', { detail: track });
              window.dispatchEvent(event);
            }}>
              <div className="track-image">
                <img 
                  src={track.coverUrl ? `http://localhost:8080${track.coverUrl}` : 'https://via.placeholder.com/200'} 
                  alt={track.title}
                />
                <div className="play-overlay">
                  <i className="fas fa-play"></i>
                </div>
              </div>
              <h3>{track.title}</h3>
              <p>{track.artist}</p>
            </div>
          ))}
        </div>
      </section>
      
      <section className="tracks-section">
        <h2>Недавно добавленные</h2>
        <div className="tracks-grid">
          {recentTracks.map(track => (
            <div key={track.id} className="track-card" onClick={() => {
              const event = new CustomEvent('playTrack', { detail: track });
              window.dispatchEvent(event);
            }}>
              <div className="track-image">
                <img 
                  src={track.coverUrl ? `http://localhost:8080${track.coverUrl}` : 'https://via.placeholder.com/200'} 
                  alt={track.title}
                />
                <div className="play-overlay">
                  <i className="fas fa-play"></i>
                </div>
              </div>
              <h3>{track.title}</h3>
              <p>{track.artist}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;