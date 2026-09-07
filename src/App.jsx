import React, { useState, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuthContext } from './contexts/AuthContext.jsx';
import { ProtectedRoute } from './components/ProtectedRoutes.jsx';
import { LanguageProvider } from './context/LanguageContext.jsx';
import LanguageSelector from './components/common/LanguageSelector.jsx';
import { Crown, Building2, Briefcase, Smartphone, ShieldCheck, Sparkles } from 'lucide-react';

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
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0b0f19',
    color: '#94a3b8',
    gap: '12px'
  }}>
    <div className="spin" style={{ width: '32px', height: '32px', border: '3px solid rgba(16,185,129,0.2)', borderTopColor: '#10b981', borderRadius: '50%' }}></div>
    <span style={{ fontWeight: 600, fontSize: '0.9rem', letterSpacing: '0.5px' }}>Loading NOROZZ Enterprise Platform...</span>
  </div>
);

// Unauthenticated Shell Layout with Top Navigation Header
const PublicAuthLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const getActiveTab = () => {
    const p = location.pathname;
    if (p.startsWith('/super-admin')) return 'superAdmin';
    if (p.startsWith('/city-admin')) return 'cityAdmin';
    if (p.startsWith('/partner')) return 'partner';
    return 'customer';
  };

  const activeView = getActiveTab();

  return (
    <div className="bg-mesh-dark" style={{ minHeight: '100vh', position: 'relative' }}>
      <div className="bg-glow-1"></div>
      <div className="bg-glow-2"></div>

      {/* Industrial Grand Enterprise Navigation Header */}
      <header className="enterprise-auth-header">
        {/* Logo Branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <img
            src="/logo.png"
            alt="Norozz Logo"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              objectFit: 'contain',
              boxShadow: '0 4px 16px rgba(16, 185, 129, 0.35)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0, color: '#ffffff', letterSpacing: '-0.3px' }}>
                NOROZZ <span className="gradient-text">ENTERPRISE</span>
              </h1>
              <span className="badge badge-purple" style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
                v2.4 PRO
              </span>
            </div>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span className="dot-pulse dot-pulse-active"></span> Multi-Service On-Demand Operations Mesh
            </span>
          </div>
        </div>

        {/* Portal Switcher Nav Tabs & Language Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <nav className="enterprise-portal-nav">
            <button
              type="button"
              onClick={() => navigate('/')}
              className={`enterprise-nav-btn ${activeView === 'customer' ? 'active' : ''}`}
            >
              <Smartphone size={15} /> Customer App
            </button>
            <button
              type="button"
              onClick={() => navigate('/partner')}
              className={`enterprise-nav-btn ${activeView === 'partner' ? 'active' : ''}`}
            >
              <Briefcase size={15} /> Partner Portal
            </button>
            <button
              type="button"
              onClick={() => navigate('/city-admin')}
              className={`enterprise-nav-btn ${activeView === 'cityAdmin' ? 'active' : ''}`}
            >
              <Building2 size={15} /> City Admin
            </button>
            <button
              type="button"
              onClick={() => navigate('/super-admin')}
              className={`enterprise-nav-btn ${activeView === 'superAdmin' ? 'active' : ''}`}
            >
              <Crown size={15} /> Super Admin
            </button>
          </nav>
          <LanguageSelector compact />
        </div>
      </header>

      {/* Dynamic Auth View Container */}
      <div style={{ paddingTop: '68px', minHeight: '100vh' }}>
        {children}
      </div>
    </div>
  );
};

// Partner Role Guard Component to route onboarding vs dashboard
const PartnerPortalGuard = ({ currentUser, logout, updateUser }) => {
  const [skipOnboarding, setSkipOnboarding] = useState(false);

  const hasCompletedProfile = Boolean(
    currentUser.name &&
    currentUser.name.trim() !== '' &&
    !currentUser.name.startsWith('Partner ') &&
    currentUser.email &&
    currentUser.email.trim() !== '' &&
    !currentUser.email.endsWith('@norozz.com')
  );

  if (!hasCompletedProfile) {
    return <PartnerAuthPage initialStep="create-profile" />;
  }

  // Check exact completion of all 6 onboarding steps
  const isLocationSaved = Boolean(currentUser.isLocationSaved || (currentUser.locationCoordinates?.lat && currentUser.locationCoordinates?.lng));
  const isCategorySelected = Boolean(currentUser.isCategorySelected || (currentUser.offeredServices && currentUser.offeredServices.length > 0));
  const isSkillsUpdated = Boolean(currentUser.isSkillsUpdated || (currentUser.skills && currentUser.skills.length > 0));
  const isServiceAreaSet = Boolean(currentUser.isServiceAreaSet || (currentUser.localities && currentUser.localities.length > 0));
  const isDocumentsUploaded = Boolean(currentUser.isDocumentsUploaded);
  const isOnboardingFeePaid = Boolean(currentUser.isOnboardingFeePaid);

  const isAllOnboardingCompleted = Boolean(
    isLocationSaved &&
    isCategorySelected &&
    isSkillsUpdated &&
    isServiceAreaSet &&
    isDocumentsUploaded &&
    isOnboardingFeePaid
  );

  if (!isAllOnboardingCompleted && !skipOnboarding) {
    return (
      <PartnerOnboardingPage
        currentUser={currentUser}
        onLogout={logout}
        onFinishOnboarding={() => setSkipOnboarding(true)}
      />
    );
  }

  return <DedicatedPartnerPanel currentUser={currentUser} onLogout={logout} onUpdateUser={updateUser} />;
};

function AppContent() {
  const { currentUser, logout, loading, role, updateUser } = useAuthContext();

  if (loading) {
    return <PageFallback />;
  }

  const userRole = role || currentUser?.role;

  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        {/* ============================================================ */}
        {/* PUBLIC / UNAUTHENTICATED PORTAL ROUTES WITH URL SWITCHING */}
        {/* ============================================================ */}

        {/* 1. CUSTOMER PORTAL */}
        <Route
          path="/"
          element={
            currentUser ? (
              userRole === 'superadmin' ? (
                <Navigate to="/super-admin" replace />
              ) : userRole === 'admin' || userRole === 'cityAdmin' ? (
                <Navigate to="/city-admin" replace />
              ) : userRole === 'partner' ? (
                <Navigate to="/partner" replace />
              ) : (
                <ProtectedRoute allowedRoles={['customer']}>
                  <DedicatedCustomerPanel currentUser={currentUser} onLogout={logout} />
                </ProtectedRoute>
              )
            ) : (
              <PublicAuthLayout>
                <CustomerAuthPage />
              </PublicAuthLayout>
            )
          }
        />

        <Route
          path="/customer"
          element={<Navigate to="/" replace />}
        />

        {/* 2. PARTNER PORTAL */}
        <Route
          path="/partner/*"
          element={
            currentUser && userRole === 'partner' ? (
              <ProtectedRoute allowedRoles={['partner']}>
                <PartnerPortalGuard currentUser={currentUser} logout={logout} updateUser={updateUser} />
              </ProtectedRoute>
            ) : currentUser && userRole !== 'partner' ? (
              <Navigate to="/" replace />
            ) : (
              <PublicAuthLayout>
                <PartnerAuthPage />
              </PublicAuthLayout>
            )
          }
        />

        {/* 3. CITY ADMIN PORTAL */}
        <Route
          path="/city-admin/*"
          element={
            currentUser && (userRole === 'admin' || userRole === 'cityAdmin') ? (
              <ProtectedRoute allowedRoles={['admin', 'cityAdmin']}>
                <CityAdminPanel currentUser={currentUser} onLogout={logout} />
              </ProtectedRoute>
            ) : currentUser && userRole !== 'admin' && userRole !== 'cityAdmin' ? (
              <Navigate to="/" replace />
            ) : (
              <PublicAuthLayout>
                <CityAdminLoginPage />
              </PublicAuthLayout>
            )
          }
        />

        {/* 4. SUPER ADMIN PORTAL */}
        <Route
          path="/super-admin/*"
          element={
            currentUser && userRole === 'superadmin' ? (
              <ProtectedRoute allowedRoles={['superadmin']}>
                <SuperAdminPanel currentUser={currentUser} onLogout={logout} />
              </ProtectedRoute>
            ) : currentUser && userRole !== 'superadmin' ? (
              <Navigate to="/" replace />
            ) : (
              <PublicAuthLayout>
                <SuperAdminLoginPage />
              </PublicAuthLayout>
            )
          }
        />

        {/* Fallback redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;
