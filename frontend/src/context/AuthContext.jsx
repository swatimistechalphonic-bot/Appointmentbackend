import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session from localStorage on initial render
    const savedUser = localStorage.getItem('careSync_user');
    const savedToken = localStorage.getItem('careSync_token');

    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      } catch (err) {
        console.error('Failed to parse cached user state:', err);
        logout();
      }
    }
    setLoading(false);
  }, []);

  const saveAuthSession = (userObj, authToken) => {
    setUser(userObj);
    setToken(authToken);
    localStorage.setItem('careSync_user', JSON.stringify(userObj));
    localStorage.setItem('careSync_token', authToken);
  };

  const login = async (email, password) => {
    const response = await authApi.login({ email, password });
    if (response.data?.success) {
      saveAuthSession(response.data.user, response.data.token);
      return response.data;
    }
    throw new Error(response.data?.message || 'Login failed');
  };

  const register = async (userData) => {
    const response = await authApi.register(userData);
    if (response.data?.success) {
      return response.data;
    }
    throw new Error(response.data?.message || 'Registration failed');
  };

  const sendOtp = async (phone) => {
    const response = await authApi.sendOtp(phone);
    if (response.data?.success) {
      return response.data;
    }
    throw new Error(response.data?.message || 'Failed to send OTP');
  };

  const verifyOtp = async (phone, otp) => {
    const response = await authApi.verifyOtp({ phone, otp });
    if (response.data?.success) {
      saveAuthSession(response.data.user, response.data.token);
      return response.data;
    }
    throw new Error(response.data?.message || 'OTP verification failed');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('careSync_user');
    localStorage.removeItem('careSync_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        sendOtp,
        verifyOtp,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
