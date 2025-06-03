import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './MyTrack.css';

function MyTracksPage() {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPlayingId, setCurrentPlayingId] = useState(null);

  useEffect(() => {
    const fetchMyTracks = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('You need to be logged in to view your tracks');
          setLoading(false);
          return;
        }
        
        const response = await axios.get('http://localhost:8080/api/tracks/my', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log('Tracks received:', response.data);
        setTracks(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching tracks:', err);
        setError('Failed to load your tracks. Please try again.');
        setLoading(false);
      }
    };
    
    fetchMyTracks();
    
    // Слушатель для обновления текущего играющего трека
    const handlePlayTrack = (event) => {
      setCurrentPlayingId(event.detail.id);
    };
    
    window.addEventListener('playTrack', handlePlayTrack);
    
    return () => {
      window.removeEventListener('playTrack', handlePlayTrack);
    };
  }, []);

  const handlePlay = (track) => {
    if (!track.fileUrl) {
      console.error('Track has no fileUrl:', track);
      return;
    }
    
    setCurrentPlayingId(track.id);
    const event = new CustomEvent('playTrack', { detail: track });
    window.dispatchEvent(event);
  };

  const refreshTracks = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/tracks/my', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setTracks(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to refresh tracks. Please try again.');
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading your tracks...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="my-tracks-page">
      <div className="my-tracks-header">
        <h1>My Tracks</h1>
        <div className="header-actions">
          <button onClick={refreshTracks} className="refresh-button">
            <i className="fas fa-sync-alt"></i> Refresh
          </button>
          <Link to="/upload" className="upload-button">
            <i className="fas fa-plus"></i> Upload
          </Link>
        </div>
      </div>
      
      {(!tracks || tracks.length === 0) ? (
        <div className="no-tracks-message">
          <i className="fas fa-music"></i>
          <p>You haven't uploaded any tracks yet</p>
          <Link to="/upload" className="upload-link-button">
            Upload Your First Track
          </Link>
        </div>
      ) : (
        <div className="tracks-container">
          {tracks.map(track => (
            <div key={track.id || 'no-id'} className={`track-card ${currentPlayingId === track.id ? 'now-playing' : ''}`}>
              <div className="track-cover">
                <img 
                  src={track.coverUrl ? `http://localhost:8080${track.coverUrl}` : 'https://via.placeholder.com/350?text=No+Cover'}
                  alt={track.title || 'No title'}
                />
                {track.status === 'APPROVED' && track.fileUrl && (
                  <button 
                    className="play-button" 
                    onClick={() => handlePlay(track)}
                    title="Play track"
                  >
                    <i className={`fas ${currentPlayingId === track.id ? 'fa-pause' : 'fa-play'}`}></i>
                  </button>
                )}
              </div>
              
              <div className="track-details">
                <h3 className="track-title">{track.title || 'Untitled Track'}</h3>
                <p className="track-artist">{track.artist || 'Unknown Artist'}</p>
                <p className="track-genre">{track.genre || 'No Genre'}</p>
                
                <div className="track-status">
                  <span className={`status-badge status-${(track.status || 'pending').toLowerCase()}`}>
                    {track.status || 'PENDING'}
                  </span>
                </div>
                
                {track.status === 'REJECTED' && track.rejectionReason && (
                  <div className="rejection-info">
                    <p className="rejection-reason">
                      <i className="fas fa-exclamation-circle"></i> 
                      <span>Reason: {track.rejectionReason}</span>
                    </p>
                  </div>
                )}
              </div>
              
              {track.status === 'PENDING' && (
                <div className="track-action-info">
                  <p><i className="fas fa-hourglass-half"></i> Awaiting moderation</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyTracksPage;