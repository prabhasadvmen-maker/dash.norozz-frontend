import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  TOKEN_KEY, USER_KEY,
  LEGACY_TOKEN_KEY, LEGACY_USER_KEY,
  getTokenKey, getUserKey,
} from './authKeys.js';

export { getTokenKey, getUserKey };

const AuthContext = createContext(null);

// ─── Helpers ──────────────────────────────────────────────────────────────────
const sanitizeUser = (user) => {
  if (!user) return null;
  try {
    const copy = JSON.parse(JSON.stringify(user));
    if (copy.documents && typeof copy.documents === 'object') {
      Object.keys(copy.documents).forEach((k) => {
        const v = copy.documents[k];
        if (typeof v === 'string' && (v.startsWith('data:') || v.length > 500)) {
          copy.documents[k] = '[DOCUMENT_ATTACHED]';
        }
      });
    }
    return copy;
  } catch {
    return user;
  }
};

const saveToStorage = (tokenKey, userKey, token, user) => {
  try {
    if (token) localStorage.setItem(tokenKey, token);
    if (user)  localStorage.setItem(userKey, JSON.stringify(sanitizeUser(user)));
  } catch (e) {
    console.warn('Storage save failed:', e);
  }
};

const clearFromStorage = (tokenKey, userKey) => {
  try {
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(userKey);
    sessionStorage.removeItem(tokenKey);
    sessionStorage.removeItem(userKey);
  } catch (e) {}
};

const clearAllRoleStorage = () => {
  const allKeys = [
    ...Object.values(TOKEN_KEY),
    ...Object.values(USER_KEY),
    LEGACY_TOKEN_KEY,
    LEGACY_USER_KEY,
    'norozz_impersonation_tab',
  ];
  [...new Set(allKeys)].forEach((k) => {
    try { localStorage.removeItem(k); } catch {}
    try { sessionStorage.removeItem(k); } catch {}
  });
};

// ─── Provider ─────────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    // Impersonation handoff — new tab opened by SuperAdmin
    const impStr = localStorage.getItem('norozz_impersonate_data');
    if (impStr) {
      try {
        const imp = JSON.parse(impStr);
        localStorage.removeItem('norozz_impersonate_data');
        if (imp?.user && imp?.token) {
          const role = imp.user.role;
          sessionStorage.setItem('norozz_impersonation_tab', '1');
          sessionStorage.setItem(getTokenKey(role), imp.token);
          sessionStorage.setItem(getUserKey(role), JSON.stringify(sanitizeUser(imp.user)));
          setCurrentUser(imp.user);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.warn('Impersonation parse error:', e);
      }
    }

    // Migrate legacy norozz_token → role-based key (one-time)
    const legacyToken = localStorage.getItem(LEGACY_TOKEN_KEY);
    const legacyUser  = localStorage.getItem(LEGACY_USER_KEY);
    if (legacyToken && legacyUser) {
      try {
        const u = JSON.parse(legacyUser);
        if (u?.role) {
          saveToStorage(getTokenKey(u.role), getUserKey(u.role), legacyToken, u);
          clearFromStorage(LEGACY_TOKEN_KEY, LEGACY_USER_KEY);
        }
      } catch {}
    }

    // Restore session
    const isImpersonationTab = sessionStorage.getItem('norozz_impersonation_tab') === '1';
    const allUserKeys = [...new Set(Object.values(USER_KEY))];
    let restoredUser = null;

    for (const key of allUserKeys) {
      const raw = isImpersonationTab
        ? sessionStorage.getItem(key)
        : localStorage.getItem(key);
      if (raw) {
        try { restoredUser = JSON.parse(raw); break; } catch {}
      }
    }

    // Legacy fallback
    if (!restoredUser) {
      const raw = isImpersonationTab
        ? sessionStorage.getItem(LEGACY_USER_KEY)
        : localStorage.getItem(LEGACY_USER_KEY);
      if (raw) {
        try { restoredUser = JSON.parse(raw); } catch {}
      }
    }

    if (restoredUser) setCurrentUser(restoredUser);
    setLoading(false);

    const handleAutoLogout = () => logout();
    window.addEventListener('norozz_logout', handleAutoLogout);
    return () => window.removeEventListener('norozz_logout', handleAutoLogout);
  }, []);

  const login = (userData, accessToken) => {
    if (!userData) return;
    saveToStorage(getTokenKey(userData.role), getUserKey(userData.role), accessToken, userData);
    setCurrentUser(userData);
  };

  const loginNewTab = (userData, accessToken) => {
    if (!userData || !accessToken) {
      console.error('[loginNewTab] Missing userData or accessToken');
      return null;
    }
    try {
      localStorage.setItem('norozz_impersonate_data', JSON.stringify({
        user:  sanitizeUser(userData),
        token: accessToken,
      }));
      const role = userData.role;
      const targetPath = (role === 'cityAdmin' || role === 'admin')
        ? '/city-admin/dashboard'
        : (role === 'partner' ? '/partner/dashboard' : '/');
      const newTab = window.open(window.location.origin + targetPath, '_blank');
      return newTab;
    } catch (e) {
      console.error('[loginNewTab] Failed:', e);
      return null;
    }
  };

  const logout = () => {
    const role = currentUser?.role;
    if (role) clearFromStorage(getTokenKey(role), getUserKey(role));
    clearFromStorage(LEGACY_TOKEN_KEY, LEGACY_USER_KEY);
    setCurrentUser(null);
  };

  const updateUser = (updatedData) => {
    setCurrentUser((prev) => {
      const merged = { ...prev, ...updatedData };
      saveToStorage(getTokenKey(merged.role), getUserKey(merged.role), null, merged);
      return merged;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
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
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
};
