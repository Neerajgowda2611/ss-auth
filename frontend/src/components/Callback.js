import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Callback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { handleCallback } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    async function processCallback() {
      try {
        const params = new URLSearchParams(location.search);
        const code = params.get('code');
        const state = params.get('state');
        const errorParam = params.get('error');

        if (errorParam) {
          throw new Error(`Authentication error: ${errorParam}`);
        }

        if (!code || !state) {
          throw new Error('No authorization code or state received');
        }

        console.log("Received code:", code);
        await handleCallback(code, state);
        navigate('/dashboard');
      } catch (err) {
        console.error('Callback processing error:', err);
        setError(err.message);
        setTimeout(() => navigate('/'), 5000);
      }
    }

    processCallback();
  }, [location, handleCallback, navigate]);

  if (error) {
    return <div>Error: {error}. Redirecting to home...</div>;
  }

  return <div>Processing callback...</div>;
}