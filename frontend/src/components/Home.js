// src/components/Home.js
import React from 'react';
import { useAuth } from '../context/AuthContext';

export function Home() {
  const { login } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold mb-8">Casdoor React-FastAPI Example</h1>
      <div className="space-x-4">
        <button
          onClick={login}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
        >
          Sign In
        </button>
        <button
          onClick={login}
          className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}