// src/components/Callback.js
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Callback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { handleCallback } = useAuth();

  useEffect(() => {
    const code = new URLSearchParams(location.search).get('code');
    if (code) {
      handleCallback(code).then(() => {
        alert('Login successful');
        navigate('/dashboard');
      });
    }
  }, [location, handleCallback, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <h2 className="text-2xl">Processing login...</h2>
    </div>
  );
}