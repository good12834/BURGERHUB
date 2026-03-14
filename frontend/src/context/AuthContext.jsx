// frontend/src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      delete axios.defaults.headers.common['Authorization'];
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data.data);
    } catch (error) {
      localStorage.removeItem('token');
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log('AuthContext login called with:', email, password);
      const response = await axios.post(`${API_BASE}/api/auth/login`, {
        email,
        password
      });
      console.log('AuthContext login response:', response);

      localStorage.setItem('token', response.data.data.token);
      setToken(response.data.data.token);
      setUser(response.data.data);
      toast.success('Logged in successfully!');
      return true;
    } catch (error) {
      console.error('AuthContext login error:', error);
      toast.error(error.response?.data?.message || 'Login failed');
      return false;
    }
  };
  const register = async (userData) => {
    try {
      const response = await axios.post(`${API_BASE}/api/auth/register`, userData);

      localStorage.setItem('token', response.data.data.token);
      setToken(response.data.data.token);
      setUser(response.data.data);
      toast.success('Registered successfully!');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully!');
  };

  const value = {
    user,
    loading,
    token,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};