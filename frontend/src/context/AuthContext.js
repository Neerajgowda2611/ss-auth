// import React, { createContext, useContext, useState, useCallback } from 'react';

// const AuthContext = createContext(null);

// export function AuthProvider({ children }) {
//   const [token, setToken] = useState(localStorage.getItem('token'));

//   const casdoorConfig = {
//     endpoint: "http://22.0.0.179:8111",
//     clientId: "931cbff5298aef218fd0",
//     appName: "auth-test",
//     organizationName: "greet",
//   };

//   const login = useCallback(() => {
//     const redirectUri = encodeURIComponent("http://localhost:3000/callback");
//     const url = `${casdoorConfig.endpoint}/login/oauth/authorize?client_id=${casdoorConfig.clientId}&response_type=code&redirect_uri=${redirectUri}`;
//     window.location.href = url;
//   }, [casdoorConfig.clientId, casdoorConfig.endpoint]);

//   // const handleCallback = useCallback(async (code) => {
//   //   const response = await fetch(`http://localhost:8000/api/signin?code=${code}`);
//   //   const data = await response.json();
//   //   setToken(data.access_token);
//   //   localStorage.setItem('token', data.access_token);
//   // }, []);

//   const handleCallback = useCallback(async (code) => {
//     const response = await fetch('http://localhost:8000/api/signin', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ code: code })
//     });
//     const data = await response.json();
//     setToken(data.access_token);
//     localStorage.setItem('token', data.access_token);
//   }, []);

//   const getUserInfo = useCallback(async () => {
//     if (!token) return null;
//     const response = await fetch('http://localhost:8000/api/getUserInfo', {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });
//     return await response.json();
//   }, [token]);

//   const logout = useCallback(() => {
//     setToken(null);
//     localStorage.removeItem('token');
//     window.location.href = '/';
//   }, []);

//   return (
//     <AuthContext.Provider value={{ token, login, handleCallback, getUserInfo, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// }



////////////////////////////////////////////////////////////////////////////////////////


import React, { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'));

  const casdoorConfig = {
    endpoint: "http://22.0.0.179:8111",
    clientId: "931cbff5298aef218fd0",
    appName: "auth-test",
    organizationName: "greet",
  };

  const login = useCallback(() => {
    const redirectUri = encodeURIComponent("http://localhost:3000/callback");
    const url = `${casdoorConfig.endpoint}/login/oauth/authorize?client_id=${casdoorConfig.clientId}&response_type=code&redirect_uri=${redirectUri}`;
    window.location.href = url;
  }, [casdoorConfig.clientId, casdoorConfig.endpoint]);

  const handleCallback = useCallback(async (code) => {
    try {
      const response = await fetch('http://localhost:8000/api/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: code })
      });

      if (!response.ok) {
        throw new Error('Signin failed');
      }

      const data = await response.json();
      const accessToken = data.access_token;
      setToken(accessToken);
      localStorage.setItem('token', accessToken);
    } catch (error) {
      console.error('Signin error:', error);
      // Handle error appropriately
    }
  }, []);

  const getUserInfo = useCallback(async () => {
    if (!token) return null;
    try {
      const response = await fetch('http://localhost:8000/api/getUserInfo', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to get user info');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get user info error:', error);
      return null;
    }
  }, [token]);

  const logout = useCallback(() => {
    setToken(null);
    localStorage.removeItem('token');
    window.location.href = '/';
  }, []);

  return (
    <AuthContext.Provider value={{ token, login, handleCallback, getUserInfo, logout }}>
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