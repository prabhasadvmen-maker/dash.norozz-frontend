import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  ExternalLink,
  CreditCard,
  Building,
  UserCheck,
  Eye,
  Lock,
  Smartphone,
  FileText,
  Car,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { kycService } from '../../services/kyc.service.js';
import { usePartner } from '../../hooks/usePartner.js';
import { toast } from '../../utils/toast.js';

const PartnerZoopKycStepper = ({ partnerData, onKycUpdated }) => {
  const { updateProfile } = usePartner();

  const [kycData, setKycData] = useState(partnerData?.kyc || {});
  const [overallStatus, setOverallStatus] = useState(partnerData?.kyc?.overallStatus || 'PENDING');
  const [approvalStatus, setApprovalStatus] = useState(partnerData?.kyc?.approvalStatus || 'PENDING_ADMIN_REVIEW');

  // Document Number & File Inputs
  const [aadhaarInput, setAadhaarInput] = useState(partnerData?.documents?.aadhaarNo || '');
  const [aadhaarFrontFile, setAadhaarFrontFile] = useState(null);
  const [aadhaarBackFile, setAadhaarBackFile] = useState(null);

  const [panInput, setPanInput] = useState(partnerData?.kyc?.pan?.panNumber || '');
  const [panFile, setPanFile] = useState(null);

  const [dlInput, setDlInput] = useState('');
  const [dobInput, setDobInput] = useState(partnerData?.dob || '');
  const [dlFile, setDlFile] = useState(null);

  const [bankForm, setBankForm] = useState({
    accountNumber: partnerData?.bankDetails?.accountNumber || '',
    ifscCode: partnerData?.bankDetails?.ifscCode || '',
    accountHolderName: partnerData?.bankDetails?.accountHolderName || partnerData?.name || '',
    bankName: partnerData?.bankDetails?.bankName || 'HDFC Bank',
  });
  const [bankPassbookFile, setBankPassbookFile] = useState(null);

  const [selfieFile, setSelfieFile] = useState(null);

  // Loading states
  const [loadingStep, setLoadingStep] = useState(null);

  // Helper to convert File to Base64 Data URL
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      if (!file) return resolve('');
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const refreshStatus = async () => {
    try {
      const res = await kycService.getKycStatus(partnerData?._id);
      if (res.data?.data) {
        const d = res.data.data;
        setOverallStatus(d.overallStatus);
        setApprovalStatus(d.approvalStatus || 'PENDING_ADMIN_REVIEW');
        if (d.checks) setKycData(d.checks);
        if (onKycUpdated) onKycUpdated(d);
      }
    } catch (err) {
      console.warn('Failed to refresh KYC status:', err);
    }
  };

  useEffect(() => {
    refreshStatus();
  }, []);

  // 1. Mobile OTP
  const handleVerifyMobile = async () => {
    setLoadingStep('mobile');
    try {
      const res = await kycService.verifyMobileOtp(partnerData?.phone);
      toast.success(res.data?.message || 'Mobile number verified ✓');
      await refreshStatus();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Mobile verification failed');
    } finally {
      setLoadingStep(null);
    }
  };

  // 2. PAN Verification + Image Upload
  const handleVerifyPan = async (e) => {
    e.preventDefault();
    if (!panInput || panInput.length < 10) {
      return toast.error('Please enter a valid 10-character PAN (e.g. ABCDE1234F)');
    }
    setLoadingStep('pan');
    try {
      let panBase64 = '';
      if (panFile) {
        panBase64 = await fileToBase64(panFile);
        await updateProfile({ documents: { panDoc: panBase64 } });
      }

      const res = await kycService.verifyPan(panInput);
      toast.success(res.data?.message || 'PAN card image saved & verified ✓');
      await refreshStatus();
    } catch (err) {
      toast.error(err.response?.data?.message || 'PAN verification failed');
    } finally {
      setLoadingStep(null);
    }
  };

  // 3. Aadhaar Upload + DigiLocker
  const handleVerifyAadhaar = async (e) => {
    e.preventDefault();
    if (aadhaarInput && aadhaarInput.length < 12) {
      return toast.error('Aadhaar number must be 12 digits');
    }
    setLoadingStep('aadhaar');
    try {
      const docsObj = {};
      if (aadhaarFrontFile) docsObj.aadhaarFront = await fileToBase64(aadhaarFrontFile);
      if (aadhaarBackFile) docsObj.aadhaarBack = await fileToBase64(aadhaarBackFile);
      if (Object.keys(docsObj).length > 0) {
        await updateProfile({ documents: docsObj });
      }

      const res = await kycService.initDigiLocker({ docs: ['ADHAR', 'PANCR', 'DRVLC'] });
      const gwUrl = res.data?.data?.gatewayUrl;
      toast.success('Aadhaar documents uploaded & DigiLocker session initiated!');
      if (gwUrl) {
        window.open(gwUrl, 'DigiLockerGateway', 'width=600,height=700');
      }
      setTimeout(refreshStatus, 3000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initialize Aadhaar DigiLocker');
    } finally {
      setLoadingStep(null);
    }
  };

  // 4. Driving Licence Upload + Verification
  const handleVerifyDl = async (e) => {
    e.preventDefault();
    if (!dlInput) return toast.error('Please enter Driving Licence Number');
    setLoadingStep('dl');
    try {
      if (dlFile) {
        const dlBase64 = await fileToBase64(dlFile);
        await updateProfile({ documents: { drivingLicenseDoc: dlBase64 } });
      }

      const res = await kycService.verifyDrivingLicense(dlInput, dobInput);
      toast.success(res.data?.message || 'Driving licence image saved & verified ✓');
      await refreshStatus();
    } catch (err) {
      toast.error(err.response?.data?.message || 'DL verification failed');
    } finally {
      setLoadingStep(null);
    }
  };

  // 5. Bank Account & Passbook Upload + Verification
  const handleVerifyBank = async (e) => {
    e.preventDefault();
    if (!bankForm.accountNumber || !bankForm.ifscCode) {
      return toast.error('Account Number & IFSC Code are required');
    }
    setLoadingStep('bank');
    try {
      if (bankPassbookFile) {
        const passbookBase64 = await fileToBase64(bankPassbookFile);
        await updateProfile({ documents: { bankPassbookDoc: passbookBase64 } });
      }

      const res = await kycService.verifyBankAccount(bankForm);
      toast.success(res.data?.message || 'Bank passbook saved & account verified via penny drop ✓');
      await refreshStatus();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Bank verification failed');
    } finally {
      setLoadingStep(null);
    }
  };

  // 6. Face Match + Selfie Upload
  const handleVerifyFaceMatch = async () => {
    setLoadingStep('faceMatch');
    try {
      if (selfieFile) {
        const selfieBase64 = await fileToBase64(selfieFile);
        await updateProfile({ documents: { passportPhoto: selfieBase64 }, profileImage: selfieBase64 });
      }

      const res = await kycService.verifyFaceMatch();
      toast.success(res.data?.message || 'Selfie uploaded & face match verified ✓');
      await refreshStatus();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Face match failed');
    } finally {
      setLoadingStep(null);
    }
  };

  // 7. Face Liveness
  const handleVerifyFaceLiveness = async () => {
    setLoadingStep('faceLiveness');
    try {
      const res = await kycService.verifyFaceLiveness();
      toast.success(res.data?.message || 'Face liveness verified ✓');
      await refreshStatus();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Face liveness check failed');
    } finally {
      setLoadingStep(null);
    }
  };

  const checks = kycData || {};

  const renderStatusBadge = (statusStr) => {
    const s = String(statusStr || 'PENDING').toUpperCase();
    if (s === 'VERIFIED') return <span className="badge badge-success" style={{ fontWeight: '800' }}>✓ VERIFIED</span>;
    if (s === 'FAILED') return <span className="badge badge-danger" style={{ fontWeight: '800' }}>❌ FAILED</span>;
    if (s === 'VERIFYING') return <span className="badge badge-warning" style={{ fontWeight: '800' }}>⏳ VERIFYING...</span>;
    return <span className="badge badge-secondary" style={{ fontWeight: '800' }}>🔒 PENDING</span>;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>

      {/* OVERALL KYC & CITY ADMIN STATUS BANNER */}
      <div
        className="mui-card"
        style={{
          padding: '24px',
          background: overallStatus === 'VERIFIED'
            ? 'linear-gradient(135deg, #064e3b 0%, #047857 100%)'
            : overallStatus === 'FAILED'
            ? 'linear-gradient(135deg, #7f1d1d 0%, #b91c1c 100%)'
            : 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.9, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={20} /> ZOOP Automatic Document & Identity Verification
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: '900', marginTop: '6px', margin: 0, color: '#ffffff' }}>
              Overall Verification: {overallStatus}
            </h2>
            <p style={{ fontSize: '0.86rem', opacity: 0.9, marginTop: '6px', margin: 0 }}>
              {overallStatus === 'VERIFIED'
                ? '✓ All 7 mandatory ZOOP checks passed! Your application is now under City Admin final review.'
                : 'Enter your document numbers and upload clear document photos below for ZOOP auto-verification.'}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
            <span
              style={{
                padding: '8px 16px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.18)',
                backdropFilter: 'blur(8px)',
                fontWeight: '900',
                fontSize: '0.84rem',
                border: '1px solid rgba(255,255,255,0.3)',
              }}
            >
              CITY ADMIN: {approvalStatus.replace(/_/g, ' ')}
            </span>
            <button
              type="button"
              onClick={refreshStatus}
              style={{
                background: '#ffffff',
                color: '#0f172a',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '10px',
                fontSize: '0.78rem',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <RefreshCw size={14} /> Refresh Status
            </button>
          </div>
        </div>
      </div>

      {/* 7 ZOOP VERIFICATION CARDS GRID WITH INPUTS + FILE UPLOADS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>

        {/* 1. MOBILE OTP */}
        <div className="mui-card" style={{ padding: '20px', borderRadius: '18px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ fontSize: '0.94rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Smartphone size={18} color="#2563eb" /> 1. Mobile Number OTP
              </div>
              {renderStatusBadge(checks.mobile?.status)}
            </div>
            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 14px 0' }}>
              Registered Phone: <strong>{partnerData?.phone || '+91 98765 43210'}</strong>
            </p>
          </div>
          <div>
            {checks.mobile?.status !== 'VERIFIED' ? (
              <button
                type="button"
                onClick={handleVerifyMobile}
                disabled={loadingStep === 'mobile'}
                className="btn btn-primary btn-sm"
                style={{ width: '100%', borderRadius: '10px', fontWeight: '800' }}
              >
                {loadingStep === 'mobile' ? 'Verifying...' : 'Verify Mobile OTP'}
              </button>
            ) : (
              <div style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: '800' }}>✓ Verified via SMS Gateway</div>
            )}
          </div>
        </div>

        {/* 2. PAN CARD (NUMBER INPUT + FILE UPLOAD) */}
        <div className="mui-card" style={{ padding: '20px', borderRadius: '18px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ fontSize: '0.94rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CreditCard size={18} color="#059669" /> 2. PAN Card Upload & Verification
              </div>
              {renderStatusBadge(checks.pan?.status)}
            </div>

            <form onSubmit={handleVerifyPan} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>
                  PAN Card Number
                </label>
                <input
                  type="text"
                  placeholder="Enter 10-digit PAN (e.g. ABCDE1234F)"
                  maxLength={10}
                  value={panInput}
                  onChange={(e) => setPanInput(e.target.value.toUpperCase())}
                  className="form-input"
                  style={{ width: '100%', padding: '8px 12px', fontSize: '0.85rem', borderRadius: '10px', textTransform: 'uppercase' }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#334155', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                  <Upload size={14} color="#059669" /> Upload PAN Card Image File:
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setPanFile(e.target.files[0])}
                  style={{ fontSize: '0.8rem', width: '100%' }}
                />
              </div>

              <button
                type="submit"
                disabled={loadingStep === 'pan'}
                className="btn btn-success btn-sm"
                style={{ width: '100%', borderRadius: '10px', fontWeight: '800', marginTop: '6px' }}
              >
                {loadingStep === 'pan' ? 'Saving File & Verifying PAN...' : 'Upload File & Verify PAN'}
              </button>
            </form>
          </div>
        </div>

        {/* 3. AADHAAR CARD (NUMBER INPUT + FRONT & BACK FILE UPLOAD) */}
        <div className="mui-card" style={{ padding: '20px', borderRadius: '18px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ fontSize: '0.94rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} color="#7c3aed" /> 3. Aadhaar Card Upload & DigiLocker
              </div>
              {renderStatusBadge(checks.aadhaar?.status || checks.digilocker?.status)}
            </div>

            <form onSubmit={handleVerifyAadhaar} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Aadhaar Card Number (12 Digits)
                </label>
                <input
                  type="text"
                  placeholder="Enter 12-digit Aadhaar (e.g. 1234 5678 9012)"
                  maxLength={12}
                  value={aadhaarInput}
                  onChange={(e) => setAadhaarInput(e.target.value.replace(/\D/g, ''))}
                  className="form-input"
                  style={{ width: '100%', padding: '8px 12px', fontSize: '0.85rem', borderRadius: '10px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#334155', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                  <Upload size={14} color="#7c3aed" /> Upload Aadhaar Front Image:
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setAadhaarFrontFile(e.target.files[0])}
                  style={{ fontSize: '0.8rem', width: '100%' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#334155', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                  <Upload size={14} color="#7c3aed" /> Upload Aadhaar Back Image:
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setAadhaarBackFile(e.target.files[0])}
                  style={{ fontSize: '0.8rem', width: '100%' }}
                />
              </div>

              <button
                type="submit"
                disabled={loadingStep === 'digilocker'}
                className="btn btn-secondary btn-sm"
                style={{ width: '100%', borderRadius: '10px', fontWeight: '800', background: '#f5f3ff', color: '#7c3aed', border: '1px solid #ddd6fe', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '6px' }}
              >
                <ExternalLink size={14} /> {loadingStep === 'digilocker' ? 'Processing...' : 'Upload Files & Verify DigiLocker'}
              </button>
            </form>
          </div>
        </div>

        {/* 4. DRIVING LICENCE (NUMBER INPUT + DOB + FILE UPLOAD) */}
        <div className="mui-card" style={{ padding: '20px', borderRadius: '18px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ fontSize: '0.94rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Car size={18} color="#d97706" /> 4. Driving Licence Upload & Check
              </div>
              {renderStatusBadge(checks.drivingLicense?.status)}
            </div>

            <form onSubmit={handleVerifyDl} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Driving Licence Number
                </label>
                <input
                  type="text"
                  placeholder="Enter DL Number (e.g. DL-1420210089123)"
                  value={dlInput}
                  onChange={(e) => setDlInput(e.target.value.toUpperCase())}
                  className="form-input"
                  style={{ width: '100%', padding: '8px 12px', fontSize: '0.85rem', borderRadius: '10px' }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Date of Birth (DOB)
                </label>
                <input
                  type="date"
                  value={dobInput}
                  onChange={(e) => setDobInput(e.target.value)}
                  className="form-input"
                  style={{ width: '100%', padding: '8px 12px', fontSize: '0.85rem', borderRadius: '10px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#334155', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                  <Upload size={14} color="#d97706" /> Upload DL Photo / Document File:
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setDlFile(e.target.files[0])}
                  style={{ fontSize: '0.8rem', width: '100%' }}
                />
              </div>

              <button
                type="submit"
                disabled={loadingStep === 'dl'}
                className="btn btn-warning btn-sm"
                style={{ width: '100%', borderRadius: '10px', fontWeight: '800', color: '#ffffff', marginTop: '6px' }}
              >
                {loadingStep === 'dl' ? 'Saving File & Verifying DL...' : 'Upload File & Verify DL'}
              </button>
            </form>
          </div>
        </div>

        {/* 5. BANK ACCOUNT & PASSBOOK (ACC NO + IFSC + PASSBOOK FILE UPLOAD) */}
        <div className="mui-card" style={{ padding: '20px', borderRadius: '18px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ fontSize: '0.94rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building size={18} color="#0284c7" /> 5. Bank Passbook Upload & Verification
              </div>
              {renderStatusBadge(checks.bankAccount?.status)}
            </div>

            <form onSubmit={handleVerifyBank} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Bank Account Number
                </label>
                <input
                  type="text"
                  placeholder="Enter Account Number"
                  value={bankForm.accountNumber}
                  onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                  className="form-input"
                  style={{ width: '100%', padding: '8px 12px', fontSize: '0.85rem', borderRadius: '10px' }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>
                  IFSC Code
                </label>
                <input
                  type="text"
                  placeholder="Enter IFSC Code (e.g. HDFC0001234)"
                  value={bankForm.ifscCode}
                  onChange={(e) => setBankForm({ ...bankForm, ifscCode: e.target.value.toUpperCase() })}
                  className="form-input"
                  style={{ width: '100%', padding: '8px 12px', fontSize: '0.85rem', borderRadius: '10px', textTransform: 'uppercase' }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#334155', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                  <Upload size={14} color="#0284c7" /> Upload Passbook / Cheque Copy:
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setBankPassbookFile(e.target.files[0])}
                  style={{ fontSize: '0.8rem', width: '100%' }}
                />
              </div>

              <button
                type="submit"
                disabled={loadingStep === 'bank'}
                className="btn btn-primary btn-sm"
                style={{ width: '100%', borderRadius: '10px', fontWeight: '800', marginTop: '6px' }}
              >
                {loadingStep === 'bank' ? 'Saving Passbook & Running Penny Drop...' : 'Upload Passbook & Verify Bank'}
              </button>
            </form>
          </div>
        </div>

        {/* 6. FACE MATCH & SELFIE UPLOAD */}
        <div className="mui-card" style={{ padding: '20px', borderRadius: '18px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ fontSize: '0.94rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserCheck size={18} color="#c026d3" /> 6. Passport Selfie Photo & Face Match
              </div>
              {renderStatusBadge(checks.faceMatch?.status)}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#334155', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                  <Upload size={14} color="#c026d3" /> Upload Profile Passport / Selfie Image:
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelfieFile(e.target.files[0])}
                  style={{ fontSize: '0.8rem', width: '100%' }}
                />
              </div>

              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '4px 0' }}>
                Facial biometrics match score: <strong style={{ color: '#c026d3' }}>{checks.faceMatch?.score ? `${checks.faceMatch.score}%` : 'Pending Match'}</strong>
              </p>

              <button
                type="button"
                onClick={handleVerifyFaceMatch}
                disabled={loadingStep === 'faceMatch'}
                className="btn btn-sm"
                style={{ width: '100%', borderRadius: '10px', fontWeight: '800', background: '#fdf4ff', color: '#c026d3', border: '1px solid #f5d0fe' }}
              >
                {loadingStep === 'faceMatch' ? 'Saving Selfie & Matching Face...' : 'Upload Selfie & Run Face Match'}
              </button>
            </div>
          </div>
        </div>

        {/* 7. FACE LIVENESS */}
        <div className="mui-card" style={{ padding: '20px', borderRadius: '18px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ fontSize: '0.94rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Eye size={18} color="#e11d48" /> 7. Face Liveness Detection
              </div>
              {renderStatusBadge(checks.faceLiveness?.status)}
            </div>
            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 14px 0' }}>
              Anti-spoofing live person detection check.
            </p>
          </div>
          <div>
            <button
              type="button"
              onClick={handleVerifyFaceLiveness}
              disabled={loadingStep === 'faceLiveness'}
              className="btn btn-sm"
              style={{ width: '100%', borderRadius: '10px', fontWeight: '800', background: '#fff1f2', color: '#e11d48', border: '1px solid #fecdd3' }}
            >
              {loadingStep === 'faceLiveness' ? 'Checking Liveness...' : 'Run Face Liveness Check'}
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

export default PartnerZoopKycStepper;
