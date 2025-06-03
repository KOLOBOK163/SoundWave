import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AdminPanel.css';

function AdminPanel() {
  const [pendingTracks, setPendingTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(''); // 'approve' или 'reject'
  const [actionSuccess, setActionSuccess] = useState(null);
  
  const navigate = useNavigate();
  
  useEffect(() => {
    // Проверка, является ли пользователь админом
    const checkAdminAccess = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        
        // Здесь можно добавить запрос для проверки роли, если нужно
        fetchPendingTracks();
      } catch (error) {
        console.error('Error checking admin access:', error);
        navigate('/');
      }
    };
    
    checkAdminAccess();
  }, [navigate]);
  
  const fetchPendingTracks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/tracks/pending', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('Pending tracks:', response.data);
      setPendingTracks(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching pending tracks:', err);
      setError('Failed to load pending tracks. Please try again.');
      setLoading(false);
    }
  };
  
  const handlePlay = (track) => {
    if (!track.fileUrl) {
      console.error('Track has no fileUrl:', track);
      return;
    }
    
    const event = new CustomEvent('playTrack', { detail: track });
    window.dispatchEvent(event);
  };
  
  const openApproveModal = (track) => {
    setSelectedTrack(track);
    setModalType('approve');
    setIsModalOpen(true);
  };
  
  const openRejectModal = (track) => {
    setSelectedTrack(track);
    setRejectReason('');
    setModalType('reject');
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTrack(null);
    setRejectReason('');
  };
  
  const handleApprove = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:8080/api/tracks/${selectedTrack.id}/moderate`, null, {
        params: { status: 'APPROVED' },
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Обновить список треков
      setPendingTracks(pendingTracks.filter(track => track.id !== selectedTrack.id));
      setActionSuccess(`Track "${selectedTrack.title}" has been approved.`);
      
      // Автоматически закрыть модальное окно
      setTimeout(() => {
        closeModal();
        setActionSuccess(null);
      }, 2000);
      
    } catch (err) {
      console.error('Error approving track:', err);
      setError('Failed to approve track. Please try again.');
    }
  };
  
  const handleReject = async () => {
    if (!rejectReason.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:8080/api/tracks/${selectedTrack.id}/moderate`, null, {
        params: { status: 'REJECTED', reason: rejectReason },
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Обновить список треков
      setPendingTracks(pendingTracks.filter(track => track.id !== selectedTrack.id));
      setActionSuccess(`Track "${selectedTrack.title}" has been rejected.`);
      
      // Автоматически закрыть модальное окно
      setTimeout(() => {
        closeModal();
        setActionSuccess(null);
      }, 2000);
      
    } catch (err) {
      console.error('Error rejecting track:', err);
      setError('Failed to reject track. Please try again.');
    }
  };

  if (loading) return <div className="loading">Loading pending tracks...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>Admin Panel - Track Moderation</h1>
        <button onClick={fetchPendingTracks} className="refresh-button">
          <i className="fas fa-sync-alt"></i> Refresh
        </button>
      </div>
      
      {actionSuccess && (
        <div className="success-message">{actionSuccess}</div>
      )}
      
      {pendingTracks.length === 0 ? (
        <div className="no-tracks-message">
          <i className="fas fa-check-circle"></i>
          <p>No tracks pending moderation</p>
        </div>
      ) : (
        <div className="tracks-container">
          {pendingTracks.map(track => (
            <div key={track.id} className="track-card">
              <div className="track-cover">
                <img 
                  src={track.coverUrl ? `http://localhost:8080${track.coverUrl}` : 'https://via.placeholder.com/150'}
                  alt={track.title || 'No title'} 
                />
                <button 
                  className="play-button"
                  onClick={() => handlePlay(track)}
                >
                  <i className="fas fa-play"></i>
                </button>
              </div>
              
              <div className="track-details">
                <h3 className="track-title">{track.title || 'Untitled Track'}</h3>
                <p className="track-artist">{track.artist || 'Unknown Artist'}</p>
                <p className="track-genre">{track.genre || 'No Genre'}</p>
                <p className="track-uploader">Uploaded by: {track.username || 'Unknown User'}</p>
              </div>
              
              <div className="track-actions">
                <button 
                  className="approve-button"
                  onClick={() => openApproveModal(track)}
                >
                  <i className="fas fa-check"></i> Approve
                </button>
                
                <button 
                  className="reject-button"
                  onClick={() => openRejectModal(track)}
                >
                  <i className="fas fa-times"></i> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Модальное окно для подтверждения действий */}
      {isModalOpen && selectedTrack && (
        <div className="modal-overlay">
          <div className="modal-content">
            {modalType === 'approve' ? (
              <>
                <h3>Approve Track</h3>
                <p>Are you sure you want to approve "{selectedTrack.title}"?</p>
                <p>This track will become visible to all users.</p>
                
                <div className="modal-actions">
                  <button className="approve-button" onClick={handleApprove}>
                    Approve
                  </button>
                  <button className="cancel-button" onClick={closeModal}>
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3>Reject Track</h3>
                <p>Please provide a reason for rejecting "{selectedTrack.title}"</p>
                
                <textarea
                  placeholder="Reason for rejection"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={4}
                  required
                ></textarea>
                
                <div className="modal-actions">
                  <button 
                    className="reject-button" 
                    onClick={handleReject}
                    disabled={!rejectReason.trim()}
                  >
                    Reject
                  </button>
                  <button className="cancel-button" onClick={closeModal}>
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;