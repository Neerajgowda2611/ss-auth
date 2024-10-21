import React, { createContext, useContext, useState, useCallback } from 'react';
import { casdoorConfig } from '../config/casdoorConfig';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  const login = useCallback(() => {
    const redirectUri = encodeURIComponent(`${window.location.origin}/callback`);
    const state = Math.random().toString(36).substring(7);
    localStorage.setItem('oauth_state', state);
    const url = `${casdoorConfig.endpoint}/login/oauth/authorize?client_id=${casdoorConfig.clientId}&response_type=code&redirect_uri=${redirectUri}&state=${state}`;
    window.location.href = url;
  }, []);

  const handleCallback = useCallback(async (code, state) => {
    try {
      const savedState = localStorage.getItem('oauth_state');
      if (state !== savedState) {
        throw new Error('Invalid state parameter');
      }
      localStorage.removeItem('oauth_state');

      console.log("Sending signin request with code:", code);
      const response = await fetch('http://localhost:8000/api/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Signin error:", data);
        throw new Error(data.error_description || data.detail || `HTTP error! status: ${response.status}`);
      }

      console.log("Signin successful:", data);
      setUser(data.user);
      setError(null);
    } catch (err) {
      console.error('Callback error:', err);
      setError(err.message);
    }
  }, []);

  const getUserInfo = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8000/api/getUserInfo', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setUser(data);
      return data;
    } catch (err) {
      console.error('Error getting user info:', err);
      setError(err.message);
      return null;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch('http://localhost:8000/api/signout', {
        method: 'POST',
        credentials: 'include',
      });
      setUser(null);
      setError(null);
      window.location.href = '/';
    } catch (err) {
      console.error('Logout error:', err);
      setError('Failed to logout');
    }
  }, []);

  const contextValue = {
    user,
    login,
    handleCallback,
    getUserInfo,
    logout,
    error,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
