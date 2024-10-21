// src/components/Dashboard.js
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
  const { token, logout, getUserInfo } = useAuth();
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }

    getUserInfo().then(setUserInfo);
  }, [token, getUserInfo, navigate]);

  if (!userInfo) return <div>Loading...</div>;

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">User Information</h2>
      <table className="min-w-full bg-white border">
        <thead>
          <tr>
            <th className="border p-2">User ID</th>
            <th className="border p-2">Username</th>
            <th className="border p-2">Avatar</th>
            <th className="border p-2">Created Time</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border p-2">{userInfo.id}</td>
            <td className="border p-2">{userInfo.name}</td>
            <td className="border p-2">
              <img src={userInfo.avatar} alt="avatar" className="w-10 h-10 rounded-full" />
            </td>
            <td className="border p-2">{new Date(userInfo.createdTime).toLocaleString()}</td>
          </tr>
        </tbody>
      </table>
      <button
        onClick={logout}
        className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        Sign Out
      </button>
    </div>
  );
}