import React, { useState } from 'react';
import { Smartphone, Lock, Mail, Phone, User, ArrowRight, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';

const CustomerAuthPage = ({ onLoginSuccess }) => {
  const { customerLogin, customerSignup, isLoggingIn } = useAuth();
  const [tab, setTab] = useState('login'); // 'login' | 'register'

  // Login Form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await customerLogin({ email: loginEmail, password: loginPassword });
    } catch (err) {
      setError(err.message || 'Invalid customer credentials.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    try {
      await customerSignup({ name, email, phone, password });
    } catch (err) {
      setError(err.message || 'Failed to create customer account');
    }
  };

  const handleQuickFillCustomer = () => {
    setTab('login');
    setLoginEmail('ananya.test@norozz.com');
    setLoginPassword('NewCustomerPass123!');
    setSuccessMessage('Customer credentials auto-filled!');
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
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
            marginBottom: '14px',
            boxShadow: '0 6px 20px rgba(37,99,235,0.35)',
            color: '#ffffff'
          }}>
            <Smartphone size={32} />
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: '800', letterSpacing: '-0.5px' }}>
            NOROZZ <span className="gradient-text">CUSTOMER APP</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginTop: '4px' }}>
            Book 50+ Home Services On Demand
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '6px',
          background: '#f1f5f9',
          padding: '4px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '24px'
        }}>
          <button
            type="button"
            onClick={() => { setTab('login'); setError(''); setSuccessMessage(''); }}
            className={`btn btn-sm ${tab === 'login' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ border: 'none', padding: '9px', fontWeight: '800' }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setTab('register'); setError(''); setSuccessMessage(''); }}
            className={`btn btn-sm ${tab === 'register' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ border: 'none', padding: '9px', fontWeight: '800' }}
          >
            Create Account
          </button>
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

        {/* TAB 1: LOGIN */}
        {tab === 'login' && (
          <form onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mail size={14} /> Registered Email / Phone
              </label>
              <input
                type="email"
                className="form-input"
                placeholder="ananya.test@norozz.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
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
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoggingIn}
              style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}
            >
              {isLoggingIn ? <Loader2 size={16} className="spin" /> : <>Sign In & Start Booking <ArrowRight size={16} /></>}
            </button>
          </form>
        )}

        {/* TAB 2: SIGNUP */}
        {tab === 'register' && (
          <form onSubmit={handleRegisterSubmit}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={14} /> Full Name
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Ananya Deshmukh"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mail size={14} /> Email Address
              </label>
              <input
                type="email"
                className="form-input"
                placeholder="ananya@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Phone size={14} /> Mobile Phone Number
              </label>
              <input
                type="tel"
                className="form-input"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Confirm Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoggingIn}
              style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}
            >
              {isLoggingIn ? <Loader2 size={16} className="spin" /> : <>Create Account & Book <ArrowRight size={16} /></>}
            </button>
          </form>
        )}

        {/* Quick Demo Auto-Fill */}
        {tab === 'login' && (
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-light)', textAlign: 'center' }}>
            <button
              type="button"
              onClick={handleQuickFillCustomer}
              className="btn btn-secondary btn-sm"
              style={{ width: '100%', fontSize: '0.82rem' }}
            >
              <Sparkles size={14} color="#2563eb" /> Auto-Fill Customer Credentials
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default CustomerAuthPage;
