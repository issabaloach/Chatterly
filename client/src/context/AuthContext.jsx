import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')));
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      // Optionally, fetch user info from backend
      setUser(JSON.parse(localStorage.getItem('user')));
    }
    setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    const res = await axios.post('/api/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setToken(res.data.token);
    setUser(res.data.user);
    navigate('/chat');
  };

  const register = async (username, email, password) => {
    await axios.post('/api/auth/register', { username, email, password });
    // After registration, redirect to login
    navigate('/login');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    navigate('/login');
  };

  // Fetch user profile from backend
  const refreshUser = async (overrideToken) => {
    try {
      const authToken = overrideToken || token;
      if (!authToken) return;
      const res = await axios.get('/api/auth/profile', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setUser(res.data);
    } catch (err) {
      setUser(null);
    }
  };  

  const value = { user, token, login, register, logout, loading, refreshUser, setToken, setUser };
  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
} 