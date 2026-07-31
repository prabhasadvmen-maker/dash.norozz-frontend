import React from 'react';
import { useAuthContext } from '../contexts/AuthContext.jsx';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser, role, loading, isAuthenticated } = useAuthContext();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-secondary)'
      }}>
        Authenticating session...
      </div>
    );
  }

  if (!isAuthenticated || !currentUser) {
    return null; // Will show Login Page via App.jsx
  }

  const userRole = role || currentUser.role;

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '12px',
        color: 'var(--accent-rose)'
      }}>
        <h2>Access Denied 🚫</h2>
        <p style={{ color: 'var(--text-secondary)' }}>You do not have permission to view this portal.</p>
      </div>
    );
  }

  return children;
};
