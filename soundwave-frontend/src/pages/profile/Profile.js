// src/components/Profile.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Profile = ({ onUpdateUser }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.get('http://localhost:8080/api/profile', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(response => {
        setUser(response.data);
        if (onUpdateUser) onUpdateUser(response.data);
      })
      .catch(() => {
        localStorage.removeItem('token');
        navigate('/login');
      });
    } else {
      navigate('/login');
    }
  }, [navigate, onUpdateUser]);

  return (
    <div>
      {user ? (
        <div>
          <h2>{user.username}'s Profile</h2>
          <img
            src={`http://localhost:8080${user.avatarUrl}` || 'https://via.placeholder.com/150'}
            alt="Avatar"
            style={{ width: '150px', height: '150px', borderRadius: '50%' }}
          />
          <div>
            <button onClick={() => navigate('/edit-profile')}>Edit Profile</button>
          </div>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default Profile;
