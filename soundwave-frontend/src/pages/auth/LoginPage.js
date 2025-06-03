import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../widgets/Auth/Auth.css';

const LoginPage = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/api/login', {
        username,
        password,
      });
  
      const token = response.data.token;
      localStorage.setItem('token', token);
  
      const userProfileResponse = await axios.get('http://localhost:8080/api/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
  
      console.log(userProfileResponse.data); // Отладка
      onLoginSuccess(userProfileResponse.data);
      navigate('/');
    } catch (error) {
      console.error('Ошибка входа:', error);
      alert('Ошибка входа. Проверьте логин и пароль.');
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Войти</h2>
        <input
          type="text"
          placeholder="Имя пользователя"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Войти</button>
      </form>
    </div>
  );
};

export default LoginPage;
