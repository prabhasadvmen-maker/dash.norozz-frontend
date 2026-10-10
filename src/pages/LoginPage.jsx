import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, KeyRound, Sparkles, AlertCircle, ArrowRight, Loader2, UserPlus, CheckCircle2, Crown, Building2, Briefcase, Smartphone } from 'lucide-react';
import RoleSelector from '../components/auth/RoleSelector';
import CustomerRegisterForm from '../components/auth/CustomerRegisterForm';
import PartnerRegisterForm from '../components/auth/PartnerRegisterForm';
import PartnerStatusView from '../components/auth/PartnerStatusView';
import OtpVerificationModal from '../components/auth/OtpVerificationModal';
import { authService } from '../services/api';

const LoginPage = ({ onLoginSuccess }) => {
  // Modes: 'login' | 'register' | 'partnerStatus'
  const [authMode, setAuthMode] = useState('login');
  const [selectedRole, setSelectedRole] = useState('superadmin'); // 'superadmin' | 'admin' | 'partner' | 'customer'

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Modals & Partner State
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otpUserEmail, setOtpUserEmail] = useState('');
  const [otpMode, setOtpMode] = useState('register'); // 'register' | 'forgotPassword'
  const [submittedPartnerData, setSubmittedPartnerData] = useState(null);

  // Submit Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const data = await authService.login(email, password);
      if (data.token) {
        localStorage.setItem('norozz_token', data.token);
        localStorage.setItem('norozz_user', JSON.stringify(data.user));
        onLoginSuccess(data.user);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Quick Auto-Fill Demo Credentials
  const handleQuickDemoFill = async (role) => {
    setError('');
    setSelectedRole(role);
    // Removed hardcoded credentials - all auth must come from backend
  };

  // Open Forgot Password
  const handleOpenForgotPassword = () => {
    if (!email) {
      setError('Please enter your Email Address first to reset password');
      return;
    }
    setOtpUserEmail(email);
    setOtpMode('forgotPassword');
    setIsOtpModalOpen(true);
  };

  // Open Customer OTP
  const handleOpenCustomerOtp = (userData) => {
    setOtpUserEmail(userData.email);
    setOtpMode('register');
    setIsOtpModalOpen(true);
  };

  // Partner Registration Submitted
  const handlePartnerSubmitted = (partnerData) => {
    setSubmittedPartnerData(partnerData);
    setAuthMode('partnerStatus');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      zIndex: 1,
      background: 'var(--bg-primary)'
    }}>
      <div className="mui-card" style={{ width: '100%', maxWidth: '490px', padding: '36px', background: '#ffffff' }}>
        
        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <img
            src="/logo.png"
            alt="NOROZZ Logo"
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '18px',
              objectFit: 'cover',
              marginBottom: '14px',
              boxShadow: '0 4px 18px rgba(0, 180, 216, 0.35)',
              border: '2px solid rgba(118, 215, 41, 0.4)'
            }}
          />
          <h1 style={{ fontSize: '1.7rem', fontWeight: '800', letterSpacing: '-0.5px' }}>
            NOROZZ <span className="gradient-text">SERVICES</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '4px' }}>
            Multi-Service Marketplace Onboarding Portal
          </p>
        </div>

        {/* Role Selector Tabs */}
        {authMode !== 'partnerStatus' && (
          <RoleSelector selectedRole={selectedRole} onSelectRole={setSelectedRole} />
        )}

        {/* Alerts */}
        {error && (
          <div style={{
            background: 'var(--accent-rose-light)',
            color: 'var(--accent-rose)',
            border: '1px solid #fecaca',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div style={{
            background: 'var(--accent-emerald-light)',
            color: 'var(--accent-emerald)',
            border: '1px solid #a7f3d0',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Sparkles size={16} style={{ flexShrink: 0 }} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* MODE 1: LOGIN */}
        {authMode === 'login' && (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mail size={14} /> Email Address / Phone
              </label>
              <input
                type="email"
                className="form-input"
                placeholder={selectedRole === 'superadmin' ? 'superadmin@norozz.com' : 'user@domain.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '10px' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lock size={14} /> Password
              </label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Forgot Password Link */}
            <div style={{ textAlign: 'right', marginBottom: '22px' }}>
              <button
                type="button"
                onClick={handleOpenForgotPassword}
                style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer' }}
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="spin" /> Authenticating...
                </>
              ) : (
                <>
                  Sign In to Dashboard <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}

        {/* MODE 2: REGISTER (CUSTOMER vs PARTNER) */}
        {authMode === 'register' && (
          <>
            {selectedRole === 'partner' ? (
              <PartnerRegisterForm onPartnerSubmitted={handlePartnerSubmitted} />
            ) : (
              <CustomerRegisterForm
                onSubmitSuccess={() => setAuthMode('login')}
                onOpenOtpModal={handleOpenCustomerOtp}
              />
            )}
          </>
        )}

        {/* MODE 3: PARTNER APPROVAL STATUS */}
        {authMode === 'partnerStatus' && (
          <PartnerStatusView
            partnerData={submittedPartnerData}
            onProceedToLogin={() => setAuthMode('login')}
          />
        )}

        {/* Mode Toggle (Login ⇄ Register) */}
        {authMode !== 'partnerStatus' && (
          <div style={{ marginTop: '22px', paddingTop: '16px', borderTop: '1px solid var(--border-light)', textAlign: 'center', fontSize: '0.85rem' }}>
            {authMode === 'login' ? (
              <span>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setAuthMode('register'); setError(''); setSuccessMessage(''); }}
                  style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', fontWeight: '800', cursor: 'pointer' }}
                >
                  Register Now
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setError(''); setSuccessMessage(''); }}
                  style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', fontWeight: '800', cursor: 'pointer' }}
                >
                  Sign In
                </button>
              </span>
            )}
          </div>
        )}

        {/* 1-Click Quick Demo Auto-Fill Helpers — Dev Only */}
        {authMode === 'login' && import.meta.env.DEV && (
          <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border-light)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '8px' }}>
              DEV MODE: Use backend test credentials
            </div>
          </div>
        )}

      </div>

      {/* OTP Verification & Reset Password Modal */}
      <OtpVerificationModal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        userEmail={otpUserEmail}
        mode={otpMode}
        onVerified={(msg) => {
          setSuccessMessage(msg || 'Account verified successfully! Please sign in.');
          setAuthMode('login');
        }}
      />
    </div>
  );
};

export default LoginPage;
