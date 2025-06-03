import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const EditProfile = ({ user, onUpdateUser }) => {
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Запрос на получение данных профиля пользователя
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8080/api/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setUsername(response.data.username);
      } catch (error) {
        console.error('Ошибка при загрузке профиля пользователя:', error);
      }
    };

    fetchUserProfile();
  }, []);

  const handleSaveChanges = async () => {
    console.log("Save Changes clicked");

    const formData = new FormData();
    formData.append('username', username);
    if (password) {
        formData.append('password', password);
    }
    if (avatar) {
        formData.append('avatar', avatar);
    }

    const token = localStorage.getItem('token');
    console.log('Token:', token);

    try {
        const response = await axios.put('http://localhost:8080/api/profile/edit', formData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            }
        });

        console.log('Profile updated successfully:', response.data);
        if (onUpdateUser) onUpdateUser(response.data);
        navigate('/profile');
    } catch (error) {
        console.error('Error updating profile:', error.response);
    }
  };

  return (
    <div>
      <h1>Edit Profile</h1>
      <input
        type="text"
        value={username}
        onChange={e => setUsername(e.target.value)}
      />
      <input
        type="file"
        onChange={e => setAvatar(e.target.files[0])}
      />
      <input
        type="password"
        placeholder="New Password"
        onChange={e => setPassword(e.target.value)}
      />
      <button onClick={handleSaveChanges}>Save Changes</button>
    </div>
  );
};

export default EditProfile;
