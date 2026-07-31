import React, { useState } from 'react';
import { User, Mail, Phone, Lock, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

const CustomerRegisterForm = ({ onSubmitSuccess, onOpenOtpModal }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    if (password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    setLoading(true);

    // Trigger OTP modal step
    setTimeout(() => {
      setLoading(false);
      onOpenOtpModal({
        name,
        email,
        phone,
        password,
        role: 'customer'
      });
    }, 600);
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div style={{
          background: 'var(--accent-rose-light)',
          color: 'var(--accent-rose)',
          border: '1px solid #fecaca',
          padding: '10px 14px',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.85rem',
          marginBottom: '16px'
        }}>
          {error}
        </div>
      )}

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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Lock size={14} /> Password
          </label>
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
        disabled={loading}
        style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}
      >
        {loading ? (
          <>
            <Loader2 size={16} className="spin" /> Processing...
          </>
        ) : (
          <>
            Verify OTP & Create Customer Account <ArrowRight size={16} />
          </>
        )}
      </button>
    </form>
  );
};

export default CustomerRegisterForm;
