import React, { useState } from 'react';
import SuperAdminLoginPage from './pages/SuperAdminLoginPage';
import CityAdminLoginPage from './pages/CityAdminLoginPage';
import PartnerAuthPage from './pages/PartnerAuthPage';
import CustomerAuthPage from './pages/CustomerAuthPage';
import SuperAdminPanel from './pages/SuperAdminPanel';
import CityAdminPanel from './pages/CityAdminPanel';
import DedicatedPartnerPanel from './pages/DedicatedPartnerPanel';
import DedicatedCustomerPanel from './pages/DedicatedCustomerPanel';
import { useAuthContext } from './contexts/AuthContext.jsx';
import { ProtectedRoute } from './components/ProtectedRoutes.jsx';

function App() {
  const { currentUser, logout, loading, role } = useAuthContext();
  const [authView, setAuthView] = useState('customer'); // 'customer' | 'partner' | 'cityAdmin' | 'superAdmin'

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-secondary)'
      }}>
        Connecting NOROZZ Platform...
      </div>
    );
  }

  // If user is authenticated, route into Protected Role View
  if (currentUser) {
    const userRole = role || currentUser.role;

    if (userRole === 'superadmin') {
      return (
        <ProtectedRoute allowedRoles={['superadmin']}>
          <SuperAdminPanel currentUser={currentUser} onLogout={logout} />
        </ProtectedRoute>
      );
    }
    if (userRole === 'admin' || userRole === 'cityAdmin') {
      return (
        <ProtectedRoute allowedRoles={['admin', 'cityAdmin']}>
          <CityAdminPanel currentUser={currentUser} onLogout={logout} />
        </ProtectedRoute>
      );
    }
    if (userRole === 'partner') {
      return (
        <ProtectedRoute allowedRoles={['partner']}>
          <DedicatedPartnerPanel currentUser={currentUser} onLogout={logout} />
        </ProtectedRoute>
      );
    }
    return (
      <ProtectedRoute allowedRoles={['customer']}>
        <DedicatedCustomerPanel currentUser={currentUser} onLogout={logout} />
      </ProtectedRoute>
    );
  }

  // If not authenticated, render Login Page with portal switcher header
  return (
    <>
      <div className="bg-glow-1"></div>
      <div className="bg-glow-2"></div>

      <div style={{ position: 'fixed', top: '16px', right: '16px', zIndex: 1000, display: 'flex', gap: '6px' }}>
        <button
          onClick={() => setAuthView('customer')}
          className={`btn btn-sm ${authView === 'customer' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Customer App Login
        </button>
        <button
          onClick={() => setAuthView('partner')}
          className={`btn btn-sm ${authView === 'partner' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Partner Portal Login
        </button>
        <button
          onClick={() => setAuthView('cityAdmin')}
          className={`btn btn-sm ${authView === 'cityAdmin' ? 'btn-primary' : 'btn-secondary'}`}
        >
          City Admin Login
        </button>
        <button
          onClick={() => setAuthView('superAdmin')}
          className={`btn btn-sm ${authView === 'superAdmin' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Super Admin Login
        </button>
      </div>

      {authView === 'customer' ? (
        <CustomerAuthPage />
      ) : authView === 'partner' ? (
        <PartnerAuthPage />
      ) : authView === 'cityAdmin' ? (
        <CityAdminLoginPage />
      ) : (
        <SuperAdminLoginPage />
      )}
    </>
  );
}

export default App;
