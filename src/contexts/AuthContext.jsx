import React, { createContext, useContext, useState, useEffect } from 'react';
import { requestPermissionAndGetToken } from '../firebase.js';
import { axiosInstance } from '../api/axiosInstance.js';

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
    // 1. Check for single-instance impersonation handoff for new tab openings
    const impersonateDataStr = localStorage.getItem('norozz_impersonate_data');
    if (impersonateDataStr) {
      try {
        const imp = JSON.parse(impersonateDataStr);
        localStorage.removeItem('norozz_impersonate_data'); // Clear handoff key so original tab stays unchanged
        if (imp?.user && imp?.token) {
          sessionStorage.setItem('norozz_token', imp.token);
          sessionStorage.setItem('norozz_user', JSON.stringify(imp.user));
          setToken(imp.token);
          setCurrentUser(imp.user);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.warn('Impersonation parse error:', e);
      }
    }

    // 2. Read tab-isolated sessionStorage first, fallback to localStorage
    const storedToken = sessionStorage.getItem('norozz_token') || localStorage.getItem('norozz_token');
    const storedUser = sessionStorage.getItem('norozz_user') || localStorage.getItem('norozz_user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setCurrentUser(JSON.parse(storedUser));

        // Already logged in user ka FCM token register karo
        setTimeout(async () => {
          try {
            const { requestPermissionAndGetToken } = await import('../firebase.js');
            const fcmToken = await requestPermissionAndGetToken();
            await axiosInstance.post('/notifications/save-token', { token: fcmToken });
          } catch {
            // Silently ignore
          }
        }, 2000);

      } catch (err) {
        sessionStorage.removeItem('norozz_token');
        sessionStorage.removeItem('norozz_user');
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
        sessionStorage.setItem('norozz_token', accessToken);
        localStorage.setItem('norozz_token', accessToken);
      } catch (e) {}
    }
    if (userData) {
      safeSaveUserToStorage(userData);
      try {
        sessionStorage.setItem('norozz_user', JSON.stringify(sanitizeUserForStorage(userData)));
      } catch (e) {}
    }

    // Register FCM token silently after login
    setTimeout(async () => {
      try {
        const fcmToken = await requestPermissionAndGetToken();
        await axiosInstance.post('/notifications/save-token', { token: fcmToken });
      } catch {
        // Silently ignore — user may have denied notification permission
      }
    }, 2000);
  };

  const loginNewTab = (userData, accessToken) => {
    if (!userData || !accessToken) return;
    try {
      localStorage.setItem('norozz_impersonate_data', JSON.stringify({
        user: sanitizeUserForStorage(userData),
        token: accessToken
      }));
      window.open(window.location.origin, '_blank');
    } catch (e) {
      console.error('Failed to launch impersonated dashboard in new tab:', e);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setToken(null);
    try {
      sessionStorage.removeItem('norozz_token');
      sessionStorage.removeItem('norozz_user');
      localStorage.removeItem('norozz_token');
      localStorage.removeItem('norozz_user');
    } catch (e) {}
  };

  const updateUser = (updatedData) => {
    setCurrentUser((prev) => {
      const newObj = { ...prev, ...updatedData };
      safeSaveUserToStorage(newObj);
      try {
        sessionStorage.setItem('norozz_user', JSON.stringify(sanitizeUserForStorage(newObj)));
      } catch (e) {}
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
        loginNewTab,
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
