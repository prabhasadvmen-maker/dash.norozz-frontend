import React, { useState } from 'react';
import { Briefcase, Lock, Mail, Phone, User, MapPin, Grid, ArrowRight, Loader2, AlertCircle, Sparkles, Navigation } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';

const PartnerAuthPage = ({ onLoginSuccess }) => {
  const { partnerLogin, partnerSignup, isLoggingIn } = useAuth();
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  
  // Login Form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Simplified Partner Signup Form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('AC & Appliance Repair');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [detectingLocation, setDetectingLocation] = useState(false);

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Geolocation Permission & Auto-Fill Location Address
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setDetectingLocation(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // OpenStreetMap Nominatim reverse geocoding API
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          const detectedAddr = data.display_name || `${data.address?.suburb || data.address?.city || 'Connaught Place'}, Delhi NCR`;
          setAddress(detectedAddr);
          setSuccessMessage('Location detected & address auto-filled successfully! 📍');
        } catch (err) {
          setAddress(`GPS Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)} (Delhi NCR)`);
          setSuccessMessage('Location coordinates captured!');
        } finally {
          setDetectingLocation(false);
        }
      },
      (err) => {
        setDetectingLocation(false);
        setError('Location access denied. Please type your city address manually.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await partnerLogin({ email: loginEmail, password: loginPassword });
    } catch (err) {
      setError(err.message || 'Invalid Partner credentials.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await partnerSignup({
        name,
        agencyName: `${name} Services`,
        email,
        phone,
        password,
        category,
        assignedCity: address.includes('Mumbai') ? 'Mumbai' : address.includes('Bengaluru') ? 'Bengaluru' : 'Delhi NCR',
        address: address || 'Delhi NCR',
      });
    } catch (err) {
      setError(err.message || 'Failed to create partner account');
    }
  };

  const handleQuickFillPendingPartner = () => {
    setTab('login');
    setLoginEmail('suresh.partner@norozz.com');
    setLoginPassword('PartnerPass123!');
    setSuccessMessage('Suresh AC Services Agency credentials filled!');
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
      <div className="mui-card" style={{ width: '100%', maxWidth: '480px', padding: '32px', background: '#ffffff' }}>
        
        {/* Branding Header */}
        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '60px',
            height: '60px',
            borderRadius: '18px',
            background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
            marginBottom: '12px',
            boxShadow: '0 6px 20px rgba(124,58,237,0.35)',
            color: '#ffffff'
          }}>
            <Briefcase size={28} />
          </div>
          <h1 style={{ fontSize: '1.55rem', fontWeight: '800', letterSpacing: '-0.5px' }}>
            NOROZZ <span className="gradient-text">PARTNER PORTAL</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', marginTop: '3px' }}>
            Service Partner & Technician Fast Onboarding
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
          marginBottom: '20px'
        }}>
          <button
            type="button"
            onClick={() => { setTab('login'); setError(''); setSuccessMessage(''); }}
            className={`btn btn-sm ${tab === 'login' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ border: 'none', padding: '9px', fontWeight: '800' }}
          >
            Partner Login
          </button>
          <button
            type="button"
            onClick={() => { setTab('register'); setError(''); setSuccessMessage(''); }}
            className={`btn btn-sm ${tab === 'register' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ border: 'none', padding: '9px', fontWeight: '800' }}
          >
            Fast Signup
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
            fontSize: '0.84rem',
            marginBottom: '16px',
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
            fontSize: '0.84rem',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Sparkles size={16} style={{ flexShrink: 0 }} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* TAB 1: PARTNER LOGIN */}
        {tab === 'login' && (
          <form onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mail size={14} /> Registered Email
              </label>
              <input
                type="email"
                className="form-input"
                placeholder="suresh.partner@norozz.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '22px' }}>
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
              style={{ width: '100%', padding: '12px', fontSize: '0.92rem' }}
            >
              {isLoggingIn ? <Loader2 size={16} className="spin" /> : <>Sign In to Partner Portal <ArrowRight size={16} /></>}
            </button>
          </form>
        )}

        {/* TAB 2: MINIMAL FAST PARTNER SIGNUP */}
        {tab === 'register' && (
          <form onSubmit={handleRegisterSubmit}>
            
            {/* 1. Full Name */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={14} /> Full Name / Partner Name
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Ramesh Kumar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* 2. Email & Phone in 2 Columns */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Mail size={14} /> Email Address
                </label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="ramesh@norozz.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Phone size={14} /> Mobile Phone
                </label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="+91 98123 45678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* 3. Service Category Selection */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Grid size={14} /> Select Service Category
              </label>
              <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="AC & Appliance Repair">AC & Appliance Repair</option>
                <option value="Home Deep Cleaning">Home Deep Cleaning</option>
                <option value="Salon for Women">Salon for Women</option>
                <option value="Plumbing & Leakage">Plumbing & Leakage</option>
                <option value="Electrician & Electrical">Electrician & Electrical</option>
                <option value="Painting & Waterproofing">Painting & Waterproofing</option>
                <option value="Pest Control Services">Pest Control Services</option>
              </select>
            </div>

            {/* 4. Password */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lock size={14} /> Create Password
              </label>
              <input
                type="password"
                className="form-input"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            {/* 5. Auto-Fill Address via Location Permission */}
            <div className="form-group" style={{ marginBottom: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="form-label" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={14} color="#2563eb" /> Operational Address / City
                </label>
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={detectingLocation}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#2563eb',
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {detectingLocation ? <Loader2 size={12} className="spin" /> : <Navigation size={12} />}
                  {detectingLocation ? 'Detecting...' : 'Detect My Location 📍'}
                </button>
              </div>
              <input
                type="text"
                className="form-input"
                placeholder="Click 'Detect My Location' or type city address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoggingIn}
              style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}
            >
              {isLoggingIn ? <Loader2 size={16} className="spin" /> : <>Create Partner Account <ArrowRight size={16} /></>}
            </button>
          </form>
        )}

        {/* Quick Demo Helper */}
        {tab === 'login' && (
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-light)', textAlign: 'center' }}>
            <button
              type="button"
              onClick={handleQuickFillPendingPartner}
              className="btn btn-secondary btn-sm"
              style={{ width: '100%', fontSize: '0.82rem' }}
            >
              <Sparkles size={14} color="#7c3aed" /> Auto-Fill Partner Credentials
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default PartnerAuthPage;
