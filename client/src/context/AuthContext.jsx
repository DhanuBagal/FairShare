import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setStoredToken } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Load user session on mount
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const res = await api.getMe();
        if (res.success && res.user) {
          setUser(res.user);
        }
      } catch (err) {
        // User not logged in
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();

    // Listen for 401 unauthorized custom events
    const handleUnauthorized = () => {
      setUser(null);
      setAuthError('Session expired. Please sign in again.');
    };

    window.addEventListener('unauthorized', handleUnauthorized);
    return () => window.removeEventListener('unauthorized', handleUnauthorized);
  }, []);

  const login = async (email, password) => {
    setAuthError(null);
    try {
      const data = await api.login({ email, password });
      if (data.token) {
        setStoredToken(data.token);
      }
      setUser(data.user);
      return data;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  const register = async (name, email, password) => {
    setAuthError(null);
    try {
      const data = await api.register({ name, email, password });
      if (data.token) {
        setStoredToken(data.token);
      }
      setUser(data.user);
      return data;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.warn('Logout API error:', err.message);
    } finally {
      setStoredToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, authError, setAuthError, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
