import React, { useState, lazy, Suspense } from 'react';
import { useAuthContext } from './contexts/AuthContext.jsx';
import { ProtectedRoute } from './components/ProtectedRoutes.jsx';

const SuperAdminLoginPage = lazy(() => import('./pages/SuperAdminLoginPage'));
const CityAdminLoginPage = lazy(() => import('./pages/CityAdminLoginPage'));
const PartnerAuthPage = lazy(() => import('./pages/PartnerAuthPage'));
const PartnerOnboardingPage = lazy(() => import('./pages/PartnerOnboardingPage'));
const CustomerAuthPage = lazy(() => import('./pages/CustomerAuthPage'));
const SuperAdminPanel = lazy(() => import('./pages/SuperAdminPanel'));
const CityAdminPanel = lazy(() => import('./pages/CityAdminPanel'));
const DedicatedPartnerPanel = lazy(() => import('./pages/DedicatedPartnerPanel'));
const DedicatedCustomerPanel = lazy(() => import('./pages/DedicatedCustomerPanel'));

const PageFallback = () => (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-secondary)',
    fontWeight: 600
  }}>
    Loading NOROZZ...
  </div>
);

function App() {
  const { currentUser, logout, loading, role } = useAuthContext();
  const [authView, setAuthView] = useState('customer'); // 'customer' | 'partner' | 'cityAdmin' | 'superAdmin'
  const [skipOnboarding, setSkipOnboarding] = useState(false);

  if (loading) {
    return <PageFallback />;
  }

  // If user is authenticated, route into Protected Role View
  if (currentUser) {
    const userRole = role || currentUser.role;

    if (userRole === 'superadmin') {
      return (
        <ProtectedRoute allowedRoles={['superadmin']}>
          <Suspense fallback={<PageFallback />}>
            <SuperAdminPanel currentUser={currentUser} onLogout={logout} />
          </Suspense>
        </ProtectedRoute>
      );
    }
    if (userRole === 'admin' || userRole === 'cityAdmin') {
      return (
        <ProtectedRoute allowedRoles={['admin', 'cityAdmin']}>
          <Suspense fallback={<PageFallback />}>
            <CityAdminPanel currentUser={currentUser} onLogout={logout} />
          </Suspense>
        </ProtectedRoute>
      );
    }
    if (userRole === 'partner') {
      const hasCompletedProfile = Boolean(
        currentUser.name &&
        currentUser.name.trim() !== '' &&
        !currentUser.name.startsWith('Partner ') &&
        currentUser.email &&
        currentUser.email.trim() !== '' &&
        !currentUser.email.endsWith('@norozz.com')
      );

      if (!hasCompletedProfile) {
        return (
          <Suspense fallback={<PageFallback />}>
            <PartnerAuthPage initialStep="create-profile" />
          </Suspense>
        );
      }

      const isKycDone = Boolean(
        (currentUser.isKycSubmitted === true || currentUser.kycStatus === 'approved') &&
        (currentUser.isDocumentsUploaded === true || (currentUser.documents?.aadhaarFront && currentUser.documents?.aadhaarBack))
      );

      if (!isKycDone && !skipOnboarding) {
        return (
          <ProtectedRoute allowedRoles={['partner']}>
            <Suspense fallback={<PageFallback />}>
              <PartnerOnboardingPage
                currentUser={currentUser}
                onLogout={logout}
                onFinishOnboarding={() => setSkipOnboarding(true)}
              />
            </Suspense>
          </ProtectedRoute>
        );
      }

      return (
        <ProtectedRoute allowedRoles={['partner']}>
          <Suspense fallback={<PageFallback />}>
            <DedicatedPartnerPanel currentUser={currentUser} onLogout={logout} />
          </Suspense>
        </ProtectedRoute>
      );
    }
    return (
      <ProtectedRoute allowedRoles={['customer']}>
        <Suspense fallback={<PageFallback />}>
          <DedicatedCustomerPanel currentUser={currentUser} onLogout={logout} />
        </Suspense>
      </ProtectedRoute>
    );
  }

  // If not authenticated, render Login Page with portal switcher header
  return (
    <Suspense fallback={<PageFallback />}>
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
    </Suspense>
  );
}

export default App;
