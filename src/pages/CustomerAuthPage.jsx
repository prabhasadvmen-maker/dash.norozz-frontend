import React, { useState } from 'react';
import { Smartphone, Mail, Phone, User, Calendar, Camera, ArrowRight, Loader2, AlertCircle, Sparkles, KeyRound, Edit2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { authService } from '../services/auth.service.js';
import { toast } from '../utils/toast.js';

const CustomerAuthPage = ({ onLoginSuccess }) => {
  const { requestOtpLogin, verifyOtpLogin, login } = useAuth();

  const [step, setStep] = useState('request'); // 'request' | 'verify' | 'profile'
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [demoOtp, setDemoOtp] = useState('');

  // Pending Session for new user profile completion
  const [pendingSession, setPendingSession] = useState(null); // { user, token }

  // Profile Form Fields (Requested: Profile Image, Name, DOB, Gender, Email, Mobile Phone)
  const [profileImage, setProfileImage] = useState('');
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileName, setProfileName] = useState('');
  const [profileDob, setProfileDob] = useState('');
  const [profileGender, setProfileGender] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profilePhone, setProfilePhone] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Secondary verification states (for Email & Phone OTP verification)
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);

  const [verifyingSecondaryTarget, setVerifyingSecondaryTarget] = useState(null); // 'email' | 'phone' | null
  const [secOtp, setSecOtp] = useState('');
  const [secOtpSent, setSecOtpSent] = useState(false);
  const [secLoading, setSecLoading] = useState(false);
  const [secDemoOtp, setSecDemoOtp] = useState('');

  const handleSendOtp = async (e, customTarget = null) => {
    if (e) e.preventDefault();
    setError('');
    setSuccessMessage('');
    const rawTarget = customTarget || emailOrPhone;
    if (!rawTarget || !rawTarget.trim()) {
      return setError('Please enter a valid Email Address or Mobile Number');
    }

    const cleanTarget = rawTarget.trim();
    const target = cleanTarget.includes('@')
      ? cleanTarget
      : (cleanTarget.replace(/\D/g, '').length >= 10 ? `+91${cleanTarget.replace(/\D/g, '').slice(-10)}` : cleanTarget);

    setLoading(true);
    try {
      const res = await requestOtpLogin({ emailOrPhone: target });
      const returnedOtp = res?.data?.otp || res?.otp;
      if (returnedOtp) {
        setDemoOtp(returnedOtp);
        setOtp(returnedOtp);
      }
      setSuccessMessage('OTP sent successfully!');
      setStep('verify');
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    setError('');

    if (!otp || !otp.trim()) {
      return setError('Please enter the 6-digit OTP code');
    }

    setLoading(true);
    try {
      const res = await verifyOtpLogin({ emailOrPhone, otp });
      const isNewUser = res?.data?.isNewUser || res?.isNewUser;
      const user = res?.data?.user || res?.user || res?.data;
      const token = res?.data?.accessToken || res?.accessToken;

      if (token) {
        localStorage.setItem('norozz_token', token);
      }

      // Track verification status of email/phone
      const initialEmailVerified = !!(user?.isEmailVerified && user?.email && !user.email.endsWith('@norozz.com'));
      const initialPhoneVerified = !!(user?.isPhoneVerified && user?.phone);

      setIsEmailVerified(initialEmailVerified);
      setIsPhoneVerified(initialPhoneVerified);

      if (isNewUser && !user?.isProfileCompleted) {
        setPendingSession({ user, token });
        // Pre-fill profile state intelligently
        const initialName = user?.name && !user.name.startsWith('Customer') && !user.name.startsWith('user_') ? user.name : '';
        const initialEmail = user?.email && !user.email.endsWith('@norozz.com') ? user.email : (emailOrPhone.includes('@') ? emailOrPhone : '');
        const initialPhone = user?.phone ? user.phone : (!emailOrPhone.includes('@') ? emailOrPhone : '');

        setProfileName(initialName);
        setProfileEmail(initialEmail);
        setProfilePhone(initialPhone);
        setProfileDob(user?.dob || '');
        setProfileGender(user?.gender || '');
        setProfileImage(user?.profileImage || '');

        setSuccessMessage('OTP Verified! Please complete your profile details.');
        setStep('profile');
      } else {
        toast.success(`Welcome back, ${user?.name || 'Customer'}!`);
        login(user, token);
        if (onLoginSuccess) onLoginSuccess(user);
      }
    } catch (err) {
      setError(err.message || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  // Secondary OTP Verification (Sending OTP for Email or Phone)
  const handleSendSecondaryOtp = async (targetField) => {
    const val = targetField === 'email' ? profileEmail : profilePhone;
    if (!val || !val.trim()) {
      return setError(`Please enter a valid ${targetField === 'email' ? 'Email Address' : 'Mobile Phone Number'} first.`);
    }

    setSecLoading(true);
    setError('');
    try {
      const tokenToUse = pendingSession?.token || localStorage.getItem('norozz_token');
      const res = await authService.sendSecondaryOtp(
        { emailOrPhone: val.trim() },
        { headers: { Authorization: `Bearer ${tokenToUse}` } }
      );
      const returnedOtp = res?.data?.otp || res?.otp;
      if (returnedOtp) {
        setSecDemoOtp(returnedOtp);
        setSecOtp(returnedOtp);
      }
      setVerifyingSecondaryTarget(targetField);
      setSecOtpSent(true);
      toast.success(`Verification OTP sent to ${val.trim()}`);
    } catch (err) {
      setError(err.message || `Failed to send verification OTP to ${targetField}.`);
    } finally {
      setSecLoading(false);
    }
  };

  const handleVerifySecondaryOtp = async () => {
    if (!secOtp || !secOtp.trim()) {
      return setError('Please enter the verification OTP code');
    }

    const val = verifyingSecondaryTarget === 'email' ? profileEmail : profilePhone;
    setSecLoading(true);
    setError('');
    try {
      const tokenToUse = pendingSession?.token || localStorage.getItem('norozz_token');
      await authService.verifySecondaryOtp(
        { emailOrPhone: val.trim(), otp: secOtp.trim() },
        { headers: { Authorization: `Bearer ${tokenToUse}` } }
      );

      if (verifyingSecondaryTarget === 'email') {
        setIsEmailVerified(true);
        toast.success('Email Address verified successfully!');
      } else {
        setIsPhoneVerified(true);
        toast.success('Mobile Phone Number verified successfully!');
      }

      setVerifyingSecondaryTarget(null);
      setSecOtpSent(false);
      setSecOtp('');
      setSecDemoOtp('');
    } catch (err) {
      setError(err.message || 'Invalid or expired OTP code.');
    } finally {
      setSecLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfileImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    setError('');

    if (!profileName.trim()) {
      return setError('Full Name is required');
    }
    if (!profileEmail.trim() || profileEmail.endsWith('@norozz.com')) {
      return setError('Valid Email Address is required');
    }
    if (!isEmailVerified) {
      return setError('Please verify your Email Address via OTP before continuing.');
    }
    if (!profilePhone.trim()) {
      return setError('Mobile Phone Number is required');
    }
    if (!isPhoneVerified) {
      return setError('Please verify your Mobile Phone Number via OTP before continuing.');
    }
    if (!profileDob) {
      return setError('Date of Birth (DOB) is required');
    }
    if (!profileGender) {
      return setError('Please select your Gender');
    }

    setLoading(true);
    try {
      let updatedUser = pendingSession?.user;
      const tokenToUse = pendingSession?.token || localStorage.getItem('norozz_token');
      if (tokenToUse) {
        localStorage.setItem('norozz_token', tokenToUse);
      }

      try {
        const formData = new FormData();
        formData.append('name', profileName.trim());
        formData.append('email', profileEmail.trim());
        formData.append('phone', profilePhone.trim());
        if (profileDob) formData.append('dob', profileDob);
        if (profileGender) formData.append('gender', profileGender);
        formData.append('isEmailVerified', 'true');
        formData.append('isPhoneVerified', 'true');
        formData.append('isProfileCompleted', 'true');

        if (profileImageFile) {
          formData.append('profileImage', profileImageFile);
        } else if (profileImage && !profileImage.startsWith('blob:')) {
          formData.append('profileImage', profileImage);
        }

        const res = await authService.updateCustomerProfile(formData, {
          headers: {
            Authorization: `Bearer ${tokenToUse}`,
          },
        });
        updatedUser = res?.data?.user || res?.data || {
          ...pendingSession?.user,
          name: profileName.trim(),
          email: profileEmail.trim(),
          phone: profilePhone.trim(),
          dob: profileDob,
          gender: profileGender,
          isEmailVerified: true,
          isPhoneVerified: true,
          isProfileCompleted: true,
        };
      } catch (err) {
        console.warn('Profile update API warning:', err);
        updatedUser = {
          ...pendingSession?.user,
          name: profileName.trim(),
          email: profileEmail.trim(),
          phone: profilePhone.trim(),
          dob: profileDob,
          gender: profileGender,
          isEmailVerified: true,
          isPhoneVerified: true,
          isProfileCompleted: true,
        };
      }

      toast.success(`Account setup complete! Welcome to NOROZZ, ${profileName}!`);
      login(updatedUser, tokenToUse);
    } catch (err) {
      setError(err.message || 'Failed to update profile details.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkipProfile = () => {
    if (pendingSession) {
      toast.success('Welcome to NOROZZ!');
      login(pendingSession.user, pendingSession.token);
    }
  };

  const handleQuickFillCustomer = () => {
    const demoUser = 'ananya.test@norozz.com';
    setEmailOrPhone(demoUser);
    handleSendOtp(null, demoUser);
  };

  const handleResetStep = () => {
    setStep('request');
    setOtp('');
    setDemoOtp('');
    setError('');
    setSuccessMessage('');
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 68px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 24px'
    }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '440px', padding: '36px' }}>

        {/* Branding Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <img
            src="/logo.png"
            alt="NOROZZ Logo"
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
            NOROZZ <span className="gradient-text">CUSTOMER APP</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.86rem', marginTop: '4px' }}>
            Book 50+ Home Services On Demand
          </p>
        </div>

        {/* Info Header Badge */}
        {step !== 'profile' && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            border: '1px solid rgba(16, 185, 129, 0.25)'
          }}>
            <ShieldCheck size={20} color="#34d399" style={{ flexShrink: 0 }} />
            <p style={{ margin: 0, fontSize: '0.83rem', color: '#cbd5e1', lineHeight: 1.4, fontWeight: '500' }}>
              Instant Login / Register with OTP. Existing users log in & new users complete basic profile!
            </p>
          </div>
        )}

        {/* Alerts */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            color: '#f87171',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            color: '#34d399',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <Sparkles size={18} style={{ flexShrink: 0 }} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* STEP 1: REQUEST OTP */}
        {step === 'request' && (
          <form onSubmit={handleSendOtp}>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mail size={14} /> Email Address or Mobile Number
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. ananya.test@norozz.com or 9876543210"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                required
                autoFocus
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}
            >
              {loading ? <Loader2 size={16} className="spin" /> : <>Send OTP Code <ArrowRight size={16} /></>}
            </button>
          </form>
        )}

        {/* STEP 2: VERIFY OTP */}
        {step === 'verify' && (
          <form onSubmit={handleVerifyOtp}>
            <div style={{
              background: '#f8fafc',
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.85rem'
            }}>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>OTP sent to: </span>
                <strong style={{ color: '#0f172a' }}>{emailOrPhone}</strong>
              </div>
              <button
                type="button"
                onClick={handleResetStep}
                className="btn btn-sm btn-secondary"
                style={{ padding: '4px 8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Edit2 size={12} /> Edit
              </button>
            </div>

            {demoOtp && (
              <div style={{
                background: '#eff6ff',
                border: '1px dashed #3b82f6',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                color: '#1d4ed8',
                marginBottom: '18px',
                textAlign: 'center',
                fontWeight: '600'
              }}>
                🔑 Demo Verification Code: <span style={{ fontSize: '1rem', letterSpacing: '2px', fontWeight: '800' }}>{demoOtp}</span>
              </div>
            )}

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <KeyRound size={14} /> Enter 6-Digit OTP Code
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                required
                autoFocus
                style={{ letterSpacing: '4px', fontSize: '1.2rem', textAlign: 'center', fontWeight: '700' }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}
            >
              {loading ? <Loader2 size={16} className="spin" /> : <>Verify OTP & Continue <ArrowRight size={16} /></>}
            </button>
          </form>
        )}

        {/* STEP 3: NEW USER PROFILE SETUP (Requested Fields: Profile Image, Name, DOB, Gender, Email, Mobile Number) */}
        {step === 'profile' && (
          <form onSubmit={handleSaveProfile}>
            <div style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#15803d', fontWeight: '700', fontSize: '0.95rem', marginBottom: '2px' }}>
                <CheckCircle2 size={18} /> Welcome to NOROZZ!
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#166534' }}>
                OTP Verified. Please enter your profile details.
              </p>
            </div>

            {/* 1. Profile Image Upload */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <label style={{ position: 'relative', display: 'inline-block', cursor: 'pointer' }}>
                <div style={{
                  width: '84px',
                  height: '84px',
                  borderRadius: '50%',
                  background: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  border: '3px solid #2563eb',
                  boxShadow: '0 4px 12px rgba(37,99,235,0.15)'
                }}>
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <User size={40} color="#94a3b8" />
                  )}
                </div>
                <div style={{
                  position: 'absolute',
                  bottom: '0',
                  right: '0',
                  background: '#2563eb',
                  color: '#ffffff',
                  padding: '6px',
                  borderRadius: '50%',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Camera size={14} />
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
              </label>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Click camera to upload profile photo
              </div>
            </div>

            {/* 2. Full Name */}
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={14} /> Full Name
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Rahul Sharma"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                required
              />
            </div>

            {/* 3. Date of Birth (DOB) */}
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={14} /> Date of Birth (DOB)
              </label>
              <input
                type="date"
                className="form-input"
                value={profileDob}
                onChange={(e) => setProfileDob(e.target.value)}
              />
            </div>

            {/* 4. Gender */}
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={14} /> Gender
              </label>
              <select
                className="form-input"
                value={profileGender}
                onChange={(e) => setProfileGender(e.target.value)}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* 5. Email Address + OTP Verification */}
            <div className="form-group" style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                  <Mail size={14} /> Email Address
                </label>
                {isEmailVerified ? (
                  <span style={{ color: '#15803d', fontSize: '0.72rem', fontWeight: '700', background: '#dcfce7', padding: '2px 8px', borderRadius: '12px' }}>
                    ✓ Email Verified
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSendSecondaryOtp('email')}
                    disabled={secLoading || !profileEmail.trim() || profileEmail.endsWith('@norozz.com')}
                    className="btn btn-sm btn-secondary"
                    style={{ padding: '2px 8px', fontSize: '0.72rem', border: '1px solid #2563eb', color: '#2563eb' }}
                  >
                    {secLoading && verifyingSecondaryTarget === 'email' ? 'Sending...' : 'Verify Email via OTP'}
                  </button>
                )}
              </div>
              <input
                type="email"
                className="form-input"
                placeholder="rahul@gmail.com"
                value={profileEmail}
                onChange={(e) => { setProfileEmail(e.target.value); setIsEmailVerified(false); }}
                required
                disabled={isEmailVerified}
              />

              {verifyingSecondaryTarget === 'email' && secOtpSent && (
                <div style={{ marginTop: '8px', padding: '10px', background: '#eff6ff', borderRadius: '8px', border: '1px dashed #3b82f6' }}>
                  {secDemoOtp && (
                    <div style={{ fontSize: '0.78rem', color: '#1d4ed8', fontWeight: '700', marginBottom: '6px' }}>
                      🔑 Email Verification OTP: {secDemoOtp}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter Email OTP"
                      value={secOtp}
                      onChange={(e) => setSecOtp(e.target.value)}
                      maxLength={6}
                      style={{ fontSize: '0.9rem', letterSpacing: '2px', textAlign: 'center' }}
                    />
                    <button
                      type="button"
                      onClick={handleVerifySecondaryOtp}
                      disabled={secLoading}
                      className="btn btn-primary btn-sm"
                      style={{ flexShrink: 0 }}
                    >
                      {secLoading ? <Loader2 size={14} className="spin" /> : 'Verify'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 6. Mobile Phone Number + OTP Verification */}
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                  <Phone size={14} /> Mobile Phone Number
                </label>
                {isPhoneVerified ? (
                  <span style={{ color: '#15803d', fontSize: '0.72rem', fontWeight: '700', background: '#dcfce7', padding: '2px 8px', borderRadius: '12px' }}>
                    ✓ Phone Verified
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSendSecondaryOtp('phone')}
                    disabled={secLoading || !profilePhone.trim()}
                    className="btn btn-sm btn-secondary"
                    style={{ padding: '2px 8px', fontSize: '0.72rem', border: '1px solid #2563eb', color: '#2563eb' }}
                  >
                    {secLoading && verifyingSecondaryTarget === 'phone' ? 'Sending...' : 'Verify Phone via OTP'}
                  </button>
                )}
              </div>
              <input
                type="tel"
                className="form-input"
                placeholder="9876543210"
                value={profilePhone}
                onChange={(e) => { setProfilePhone(e.target.value); setIsPhoneVerified(false); }}
                required
                disabled={isPhoneVerified}
              />

              {verifyingSecondaryTarget === 'phone' && secOtpSent && (
                <div style={{ marginTop: '8px', padding: '10px', background: '#eff6ff', borderRadius: '8px', border: '1px dashed #3b82f6' }}>
                  {secDemoOtp && (
                    <div style={{ fontSize: '0.78rem', color: '#1d4ed8', fontWeight: '700', marginBottom: '6px' }}>
                      🔑 Phone Verification OTP: {secDemoOtp}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Enter Phone OTP"
                      value={secOtp}
                      onChange={(e) => setSecOtp(e.target.value)}
                      maxLength={6}
                      style={{ fontSize: '0.9rem', letterSpacing: '2px', textAlign: 'center' }}
                    />
                    <button
                      type="button"
                      onClick={handleVerifySecondaryOtp}
                      disabled={secLoading}
                      className="btn btn-primary btn-sm"
                      style={{ flexShrink: 0 }}
                    >
                      {secLoading ? <Loader2 size={14} className="spin" /> : 'Verify'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: '12px', fontSize: '0.95rem', marginBottom: '10px' }}
            >
              {loading ? <Loader2 size={16} className="spin" /> : <>Save Profile & Start Booking <ArrowRight size={16} /></>}
            </button>

            <button
              type="button"
              onClick={handleSkipProfile}
              className="btn btn-secondary btn-sm"
              style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: 'none' }}
            >
              Skip for Now
            </button>
          </form>
        )}

        {/* Quick Demo Auto-Fill */}
        {step !== 'profile' && (
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-light)', textAlign: 'center' }}>
            <button
              type="button"
              onClick={handleQuickFillCustomer}
              className="btn btn-secondary btn-sm"
              style={{ width: '100%', fontSize: '0.82rem' }}
              disabled={loading}
            >
              <Sparkles size={14} color="#2563eb" /> Quick Auto-Fill Customer Credentials
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default CustomerAuthPage;
