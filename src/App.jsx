import React, { useState, lazy, Suspense } from 'react';
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

function AppContent() {
  const { currentUser, logout, loading, role, updateUser } = useAuthContext();
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

      // Check exact completion of all 6 onboarding steps: Location, Category, Skills, Service Area, Documents, Registration Fee
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

      // Dashboard navigation MUST occur ONLY when ALL 6 onboarding steps are DONE (isAllOnboardingCompleted === true)
      if (!isAllOnboardingCompleted && !skipOnboarding) {
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
            <DedicatedPartnerPanel currentUser={currentUser} onLogout={logout} onUpdateUser={updateUser} />
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

  // If not authenticated, render Login Page with industrial header
  return (
    <Suspense fallback={<PageFallback />}>
      <div className="bg-mesh-dark" style={{ minHeight: '100vh', position: 'relative' }}>
        <div className="bg-glow-1"></div>
        <div className="bg-glow-2"></div>

        {/* Industrial Grand Enterprise Navigation Header */}
        <header className="enterprise-auth-header">
          {/* Logo Branding */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                onClick={() => setAuthView('customer')}
                className={`enterprise-nav-btn ${authView === 'customer' ? 'active' : ''}`}
              >
                <Smartphone size={15} /> Customer App
              </button>
              <button
                onClick={() => setAuthView('partner')}
                className={`enterprise-nav-btn ${authView === 'partner' ? 'active' : ''}`}
              >
                <Briefcase size={15} /> Partner Portal
              </button>
              <button
                onClick={() => setAuthView('cityAdmin')}
                className={`enterprise-nav-btn ${authView === 'cityAdmin' ? 'active' : ''}`}
              >
                <Building2 size={15} /> City Admin
              </button>
              <button
                onClick={() => setAuthView('superAdmin')}
                className={`enterprise-nav-btn ${authView === 'superAdmin' ? 'active' : ''}`}
              >
                <Crown size={15} /> Super Admin
              </button>
            </nav>
            <LanguageSelector compact />
          </div>
        </header>

        {/* Dynamic Auth View Container */}
        <div style={{ paddingTop: '68px', minHeight: '100vh' }}>
          {authView === 'customer' ? (
            <CustomerAuthPage />
          ) : authView === 'partner' ? (
            <PartnerAuthPage />
          ) : authView === 'cityAdmin' ? (
            <CityAdminLoginPage />
          ) : (
            <SuperAdminLoginPage />
          )}
        </div>
      </div>
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
