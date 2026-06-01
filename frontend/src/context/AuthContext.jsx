import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken') || null);
  const [loading, setLoading] = useState(true);

  // Initialize user details on mount if token exists
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('authUser');
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        
        // Optionally verify token / fetch fresh profile from API
        try {
          const response = await api.get('/auth/profile');
          setUser(response.data);
          localStorage.setItem('authUser', JSON.stringify(response.data));
        } catch (error) {
          console.error('Failed to sync profile on load:', error);
          // If token was invalid, logout
          if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            logout();
          }
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (loginIdentifier, MatKhau) => {
    try {
      const response = await api.post('/auth/login', { loginIdentifier, MatKhau });
      const { token: receivedToken, user: receivedUser } = response.data;
      
      localStorage.setItem('authToken', receivedToken);
      localStorage.setItem('authUser', JSON.stringify(receivedUser));
      
      setToken(receivedToken);
      setUser(receivedUser);
      
      return { success: true, user: receivedUser };
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại.';
      return { success: false, message: errMsg };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return { success: true, message: response.data.message };
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Đăng ký tài khoản thất bại.';
      return { success: false, message: errMsg };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      const updatedUser = response.data.user;
      
      localStorage.setItem('authUser', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return { success: true, message: response.data.message };
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Cập nhật hồ sơ thất bại.';
      return { success: false, message: errMsg };
    }
  };

  const isAdmin = user && user.VaiTro === 'Admin';

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateProfile, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
