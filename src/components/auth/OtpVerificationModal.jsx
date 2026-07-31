import React, { useState, useEffect } from 'react';
import { X, KeyRound, Lock, ArrowRight, Loader2, CheckCircle2, ShieldCheck } from 'lucide-react';

const OtpVerificationModal = ({ isOpen, onClose, userEmail, mode, onVerified }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState('otp'); // 'otp' | 'resetPassword'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let interval;
    if (isOpen && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, timer]);

  if (!isOpen) return null;

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setError('');
    const fullOtp = otp.join('');
    if (fullOtp.length < 6) {
      return setError('Please enter 6-digit verification OTP');
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      if (mode === 'forgotPassword') {
        setStep('resetPassword');
      } else {
        onVerified();
        onClose();
      }
    }, 600);
  };

  const handleResetPasswordSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match');
    }
    if (newPassword.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      onVerified('Password reset successfully! Please sign in with your new password.');
      onClose();
    }, 600);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '28px' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {step === 'otp' ? <KeyRound size={20} color="#2563eb" /> : <Lock size={20} color="#7c3aed" />}
            {step === 'otp' ? 'OTP Security Verification' : 'Reset Your Password'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{ background: 'var(--accent-rose-light)', color: 'var(--accent-rose)', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        {/* STEP 1: OTP ENTER */}
        {step === 'otp' ? (
          <form onSubmit={handleVerifyOtp}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              We have sent a 6-digit verification code to <strong>{userEmail || 'your email/phone'}</strong>. Enter code below:
            </p>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '24px' }}>
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-input-${idx}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  style={{
                    width: '44px',
                    height: '52px',
                    textAlign: 'center',
                    fontSize: '1.2rem',
                    fontWeight: '800',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)',
                    background: '#f8fafc',
                    outline: 'none'
                  }}
                />
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
              <span>Didn't receive code?</span>
              <button
                type="button"
                disabled={timer > 0}
                onClick={() => setTimer(30)}
                style={{ background: 'none', border: 'none', color: timer > 0 ? 'var(--text-muted)' : 'var(--accent-blue)', fontWeight: '700', cursor: timer > 0 ? 'default' : 'pointer' }}
              >
                {timer > 0 ? `Resend OTP in ${timer}s` : 'Resend OTP Now'}
              </button>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '12px' }}>
              {loading ? <Loader2 size={16} className="spin" /> : 'Verify Code & Proceed'}
            </button>
          </form>
        ) : (
          /* STEP 2: RESET PASSWORD */
          <form onSubmit={handleResetPasswordSubmit}>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '12px' }}>
              {loading ? <Loader2 size={16} className="spin" /> : 'Update Password & Login'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};

export default OtpVerificationModal;
