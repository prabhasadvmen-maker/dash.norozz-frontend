import React, { useState } from 'react';
import { Clock, CheckCircle2, XCircle, ShieldCheck, FileCheck, Lock, Unlock, Sparkles, Upload, Loader2 } from 'lucide-react';
import { usePartner } from '../../hooks/usePartner.js';

const PartnerKycStatusView = ({ kycStatus, onSimulateStatusChange, partnerData }) => {
  const { uploadDocuments, updateProfile } = usePartner();
  const isPending = kycStatus === 'pending';
  const isApproved = kycStatus === 'approved';
  const isRejected = kycStatus === 'rejected';

  // KYC Form State
  const [agencyName, setAgencyName] = useState(partnerData?.agencyName || '');
  const [aadhaarNo, setAadhaarNo] = useState('');
  const [panNo, setPanNo] = useState('');
  const [gstNo, setGstNo] = useState('');
  const [bankAccountNo, setBankAccountNo] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleKycFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Update Profile Details
      await updateProfile({
        agencyName: agencyName || `${partnerData?.name || 'Partner'} Agency`,
        address: partnerData?.address || 'Delhi NCR',
      });

      // 2. Mock Multi-part form for document upload
      const formData = new FormData();
      if (agencyName) formData.append('agencyName', agencyName);
      
      await uploadDocuments(formData);
      setSubmitted(true);
    } catch (err) {
      // Global toast handles errors
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto' }}>
      
      {/* Top Banner */}
      <div className="mui-card" style={{ padding: '32px', textAlign: 'center', marginBottom: '24px' }}>
        
        {/* Icon Indicator */}
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: isApproved ? 'var(--accent-emerald-light)' : isRejected ? 'var(--accent-rose-light)' : 'var(--accent-amber-light)',
          color: isApproved ? 'var(--accent-emerald)' : isRejected ? 'var(--accent-rose)' : 'var(--accent-amber)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
          border: `3px solid ${isApproved ? '#a7f3d0' : isRejected ? '#fecaca' : '#fef08a'}`
        }}>
          {isApproved ? <CheckCircle2 size={40} /> : isRejected ? <XCircle size={40} /> : <Clock size={40} />}
        </div>

        <h2 style={{ fontSize: '1.45rem', fontWeight: '800', marginBottom: '8px' }}>
          {isApproved && 'KYC Verification Approved! 🎉'}
          {isPending && 'KYC Details & Document Verification Pending ⏳'}
          {isRejected && 'KYC Application Rejected ❌'}
        </h2>

        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.6' }}>
          {isApproved && 'Your technician documents have been verified by City Admin. Full access to Customer Bookings, Wallet, and Reviews is now UNLOCKED!'}
          {isPending && `Welcome ${partnerData?.name || 'Technician Partner'}! Please fill your profile details and upload identity documents below to submit your KYC for verification.`}
          {isRejected && 'Your ID documents could not be verified. Please re-upload valid documents below or contact City Support.'}
        </p>

        {/* Feature Restriction Warning */}
        <div style={{
          padding: '14px',
          borderRadius: 'var(--radius-md)',
          background: isApproved ? '#ecfdf5' : '#fffbe6',
          border: `1px solid ${isApproved ? '#a7f3d0' : '#fef08a'}`,
          color: isApproved ? '#065f46' : '#92400e',
          fontSize: '0.85rem',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          justifyContent: 'center'
        }}>
          {isApproved ? <Unlock size={18} /> : <Lock size={18} />}
          <span>
            {isApproved ? 'FULL PORTAL UNLOCKED: Bookings, Wallet & Calendar Enabled' : 'FEATURE RESTRICTION ACTIVE: Complete KYC below to unlock customer bookings'}
          </span>
        </div>

      </div>

      {/* KYC DETAILS & DOCUMENT UPLOAD FORM */}
      {!isApproved && (
        <div className="mui-card" style={{ padding: '28px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <ShieldCheck size={22} color="#7c3aed" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0 }}>
              Submit KYC Technician Details & Verification Documents
            </h3>
          </div>

          {submitted && (
            <div style={{ padding: '14px', background: '#ecfdf5', borderRadius: 'var(--radius-md)', border: '1px solid #a7f3d0', color: '#065f46', fontSize: '0.85rem', fontWeight: '700', marginBottom: '20px' }}>
              ✅ Your KYC Details & Documents have been submitted! City Admin is currently reviewing your application.
            </div>
          )}

          <form onSubmit={handleKycFormSubmit}>
            
            {/* 1. Business / Display Name */}
            <div className="form-group">
              <label className="form-label">Technician / Business Display Name (Optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Ramesh Sharma (AC Specialist)"
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
              />
            </div>

            {/* 2. Aadhaar & PAN in 2 columns */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Aadhaar Card Number</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="12-digit Aadhaar Number"
                  value={aadhaarNo}
                  onChange={(e) => setAadhaarNo(e.target.value)}
                  maxLength={12}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">PAN Card Number</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="10-digit PAN (ABCDE1234F)"
                  value={panNo}
                  onChange={(e) => setPanNo(e.target.value.toUpperCase())}
                  maxLength={10}
                  required
                />
              </div>
            </div>

            {/* 3. Bank Account & IFSC */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Bank Account Number</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="For payout settlements"
                  value={bankAccountNo}
                  onChange={(e) => setBankAccountNo(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Bank IFSC Code</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. HDFC0001234"
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                  required
                />
              </div>
            </div>

            {/* 4. GST Number */}
            <div className="form-group">
              <label className="form-label">GST / Trade License (Optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="GSTIN Number (optional)"
                value={gstNo}
                onChange={(e) => setGstNo(e.target.value.toUpperCase())}
              />
            </div>

            {/* 5. Document File Upload Inputs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Upload size={14} color="#7c3aed" /> Upload Aadhaar Card (Front/Back)
                </label>
                <input type="file" className="form-input" accept="image/*,application/pdf" />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Upload size={14} color="#2563eb" /> Upload PAN Card Image
                </label>
                <input type="file" className="form-input" accept="image/*,application/pdf" />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}
            >
              {loading ? <Loader2 size={16} className="spin" /> : <><FileCheck size={16} /> Submit KYC Application for Approval</>}
            </button>

          </form>
        </div>
      )}

    </div>
  );
};

export default PartnerKycStatusView;
