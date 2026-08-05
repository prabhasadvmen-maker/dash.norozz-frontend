import React, { useState } from 'react';
import { Building2, Lock, Mail, ArrowRight, Loader2, AlertCircle, Sparkles, ShieldCheck, MapPin } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';

const CityAdminLoginPage = () => {
  const { cityAdminLogin, isLoggingIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      await cityAdminLogin({ email, password });
    } catch (err) {
      setError(err.message || 'Invalid City Admin credentials.');
    }
  };

  const handleQuickFill = () => {
    setEmail('delhi.admin@norozz.com');
    setPassword('CityAdminPass123!');
    setSuccessMessage('Delhi NCR City Admin credentials auto-filled!');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'var(--bg-primary)'
    }}>
      <div className="mui-card" style={{ width: '100%', maxWidth: '440px', padding: '36px', background: '#ffffff' }}>
        
        {/* Branding Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <img
            src="/logo.png"
            alt="NOROZZ Logo"
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              objectFit: 'cover',
              marginBottom: '14px',
              boxShadow: '0 6px 20px rgba(0, 180, 216, 0.35)',
              border: '2px solid rgba(118, 215, 41, 0.4)'
            }}
          />
          <h1 style={{ fontSize: '1.65rem', fontWeight: '800', letterSpacing: '-0.5px' }}>
            NOROZZ <span className="gradient-text">CITY ADMIN</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginTop: '4px' }}>
            City Operations Manager Control Portal
          </p>
        </div>

        {/* Security Badge */}
        <div style={{
          background: 'var(--accent-blue-light)',
          border: '1px solid #bfdbfe',
          padding: '10px 14px',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.78rem',
          color: 'var(--accent-blue)',
          fontWeight: '700',
          marginBottom: '22px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          justifyContent: 'center'
        }}>
          <ShieldCheck size={16} /> Super Admin Created Account Required
        </div>

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

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Mail size={14} /> Official City Admin Email
            </label>
            <input
              type="email"
              className="form-input"
              placeholder="delhi.admin@norozz.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
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

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoggingIn}
            style={{ width: '100%', padding: '13px', fontSize: '0.95rem', background: 'linear-gradient(135deg, #2563eb, #06b6d4)' }}
          >
            {isLoggingIn ? (
              <>
                <Loader2 size={16} className="spin" /> Authenticating City Admin...
              </>
            ) : (
              <>
                Sign In to City Dashboard <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* 1-Click Quick Auto-Fill Helper */}
        <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid var(--border-light)', textAlign: 'center' }}>
          <button
            type="button"
            onClick={handleQuickFill}
            className="btn btn-secondary btn-sm"
            style={{ width: '100%', fontSize: '0.82rem' }}
          >
            <MapPin size={14} color="#2563eb" /> Auto-Fill Delhi City Admin Credentials
          </button>
        </div>

      </div>
    </div>
  );
};

export default CityAdminLoginPage;
