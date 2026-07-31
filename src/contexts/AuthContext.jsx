import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('norozz_token');
    const storedUser = localStorage.getItem('norozz_user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setCurrentUser(JSON.parse(storedUser));
      } catch (err) {
        localStorage.removeItem('norozz_token');
        localStorage.removeItem('norozz_user');
      }
    }
    setLoading(false);

    const handleAutoLogout = () => {
      logout();
    };

    window.addEventListener('norozz_logout', handleAutoLogout);
    return () => window.removeEventListener('norozz_logout', handleAutoLogout);
  }, []);

  const login = (userData, accessToken) => {
    setCurrentUser(userData);
    setToken(accessToken);
    if (accessToken) {
      localStorage.setItem('norozz_token', accessToken);
    }
    if (userData) {
      localStorage.setItem('norozz_user', JSON.stringify(userData));
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem('norozz_token');
    localStorage.removeItem('norozz_user');
  };

  const updateUser = (updatedData) => {
    setCurrentUser((prev) => {
      const newObj = { ...prev, ...updatedData };
      localStorage.setItem('norozz_user', JSON.stringify(newObj));
      return newObj;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        token,
        role: currentUser?.role || null,
        loading,
        login,
        logout,
        updateUser,
        isAuthenticated: !!currentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
