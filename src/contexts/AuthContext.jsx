import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const sanitizeUserForStorage = (user) => {
  if (!user) return null;
  try {
    const userCopy = JSON.parse(JSON.stringify(user));
    if (userCopy.documents && typeof userCopy.documents === 'object') {
      Object.keys(userCopy.documents).forEach((key) => {
        const val = userCopy.documents[key];
        if (typeof val === 'string' && (val.startsWith('data:') || val.length > 500)) {
          userCopy.documents[key] = '[DOCUMENT_ATTACHED]';
        }
      });
    }
    return userCopy;
  } catch (e) {
    return user;
  }
};

const safeSaveUserToStorage = (user) => {
  if (!user) return;
  try {
    const sanitized = sanitizeUserForStorage(user);
    localStorage.setItem('norozz_user', JSON.stringify(sanitized));
  } catch (err) {
    console.warn('Failed to save norozz_user to localStorage quota:', err);
  }
};

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
      try {
        localStorage.setItem('norozz_token', accessToken);
      } catch (e) {}
    }
    if (userData) {
      safeSaveUserToStorage(userData);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setToken(null);
    try {
      localStorage.removeItem('norozz_token');
      localStorage.removeItem('norozz_user');
    } catch (e) {}
  };

  const updateUser = (updatedData) => {
    setCurrentUser((prev) => {
      const newObj = { ...prev, ...updatedData };
      safeSaveUserToStorage(newObj);
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
