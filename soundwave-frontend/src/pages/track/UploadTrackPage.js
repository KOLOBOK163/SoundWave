import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './UploadTrack.css';

function UploadTrackPage() {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [genre, setGenre] = useState(''); // Добавлено поле жанра
  const [trackFile, setTrackFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0); // Для отображения прогресса загрузки
  const navigate = useNavigate();

  // Максимальный размер файла (90MB)
  const MAX_FILE_SIZE = 90 * 1024 * 1024;

  const handleTrackFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setError(`File is too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
        return;
      }
      setTrackFile(file);
      console.log(`Selected track file: ${file.name}, size: ${file.size} bytes`);
    }
  };

  const handleCoverFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverFile(file);
      console.log(`Selected cover file: ${file.name}, size: ${file.size} bytes`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!trackFile) {
      setError('Please select an audio file');
      return;
    }
    
    if (!genre) {
      setError('Please select a genre');
      return;
    }
    
    setLoading(true);
    setError(null);
    setUploadProgress(0);
    
    const formData = new FormData();
    formData.append('title', title);
    formData.append('artist', artist);
    formData.append('genre', genre); // Добавляем жанр в FormData
    formData.append('trackFile', trackFile); // Имя параметра должно соответствовать бэкенду
    
    if (coverFile) {
      formData.append('coverFile', coverFile); // Имя параметра должно соответствовать бэкенду
    }
    
    const token = localStorage.getItem('token');
    console.log('Using token for upload:', token ? 'Token exists' : 'No token');
    console.log('FormData contents:', 
      Array.from(formData.entries())
        .map(([key, value]) => `${key}: ${value instanceof File ? `File (${value.name}, ${value.size} bytes)` : value}`)
        .join(', ')
    );
    
    try {
      const response = await axios.post('http://localhost:8080/api/tracks/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Upload progress: ${percentCompleted}%`);
          setUploadProgress(percentCompleted);
        }
      });
      
      console.log('Upload successful:', response.data);
      navigate('/my-tracks');
    } catch (err) {
      console.error('Upload failed:', err);
      console.error('Error details:', err.response?.data || 'No response data');
      console.error('Error status:', err.response?.status);
      
      if (err.response?.status === 413) {
        setError('The file is too large. Please upload a smaller file (max 90MB).');
      } else {
        setError(err.response?.data || 'Failed to upload track. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Список жанров для выбора
  const genres = [
    'Pop', 'Rock', 'Hip-Hop', 'R&B', 'Electronic', 
    'Jazz', 'Classical', 'Country', 'Folk', 'Reggae',
    'Blues', 'Metal', 'Punk', 'Ambient', 'Other'
  ];

  return (
    <div className="upload-track-page">
      <h1>Upload New Track</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <form className="upload-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Track Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="artist">Artist Name</label>
          <input
            type="text"
            id="artist"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="genre">Genre</label>
          <select
            id="genre"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            required
          >
            <option value="">Select a genre</option>
            {genres.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="trackFile">Track File (MP3, WAV)</label>
          <input
            type="file"
            id="trackFile"
            accept=".mp3,.wav"
            onChange={handleTrackFileChange}
            required
          />
          <div className="file-info">
            {trackFile && (
              <span>Selected: {trackFile.name} ({Math.round(trackFile.size / 1024 / 1024 * 10) / 10} MB)</span>
            )}
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="coverFile">Cover Image</label>
          <input
            type="file"
            id="coverFile"
            accept="image/*"
            onChange={handleCoverFileChange}
          />
          <div className="file-info">
            {coverFile && (
              <span>Selected: {coverFile.name} ({Math.round(coverFile.size / 1024) / 10} KB)</span>
            )}
          </div>
        </div>
        
        {loading && uploadProgress > 0 && (
          <div className="upload-progress">
            <div className="progress-bar">
              <div 
                className="progress-bar-fill" 
                style={{width: `${uploadProgress}%`}}
              ></div>
            </div>
            <div className="progress-text">{uploadProgress}% Uploaded</div>
          </div>
        )}
        
        <button 
          type="submit" 
          className="submit-button" 
          disabled={loading}
        >
          {loading ? 'Uploading...' : 'Upload Track'}
        </button>
      </form>
    </div>
  );
}

export default UploadTrackPage;