import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';

const SuperAdminLoginPage = () => {
  const { superAdminLogin, isLoggingIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await superAdminLogin({ email, password });
    } catch (err) {
      setError(err.message || 'Invalid Super Admin credentials.');
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 68px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 24px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        margin: '0 auto'
      }}>
        {/* Authentication Card */}
        <div className="glass-card" style={{ padding: '36px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <img
              src="/logo.png"
              alt="Norozz Logo"
              style={{
                width: '72px',
                height: '72px',
                margin: '0 auto 16px',
                borderRadius: '18px',
                objectFit: 'contain',
                display: 'block',
                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.25)',
                border: '2px solid rgba(16, 185, 129, 0.3)'
              }}
            />
            <h1 style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.5px', color: '#ffffff' }}>
              Master Panel Authentication
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.86rem', marginTop: '4px' }}>
              Sign in with your root credentials
            </p>
          </div>

          {/* Alert Error */}
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#f87171',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Super Admin Email</label>
              <div className="input-container">
                <Mail size={16} className="input-icon" />
                <input
                  type="email"
                  className="form-input has-icon"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">Password</label>
              <div className="input-container">
                <Lock size={16} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input has-icon has-icon-right"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="input-icon-right"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoggingIn}
              style={{ width: '100%', padding: '14px', fontSize: '0.95rem' }}
            >
              {isLoggingIn ? (
                <>
                  <Loader2 size={18} className="spin" /> Authenticating Super Admin...
                </>
              ) : (
                <>
                  Login to Master Panel <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>



        </div>

      </div>
    </div>
  );
};

export default SuperAdminLoginPage;
