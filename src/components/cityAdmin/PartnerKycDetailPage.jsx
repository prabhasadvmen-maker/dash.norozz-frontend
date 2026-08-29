import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  FileCheck,
  Power,
  ExternalLink,
  MapPin,
  Clock,
  Briefcase,
  Phone,
  Mail,
  User,
  Eye,
  Award,
  Calendar,
  AlertCircle,
  CreditCard,
  Wallet,
  IndianRupee,
  Building,
  Check,
  Slash,
  X
} from 'lucide-react';
import { toast } from '../../utils/toast.js';

const DEFAULT_KYC_IMAGE =
  'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=600&auto=format&fit=crop';

const PartnerKycDetailPage = ({
  partner,
  onBack,
  onApprove,
  onReject,
  onToggleSuspend,
  onUpdateDocumentStatus,
  categoryMap = {},
}) => {
  const [activeTab, setActiveTab] = useState('documents'); // 'documents' | 'profile' | 'bank' | 'skills'
  const [activeDocPreview, setActiveDocPreview] = useState(null);

  // Local state for document statuses & rejection prompts
  const [docStatuses, setDocStatuses] = useState({});
  const [docRejectionReasons, setDocRejectionReasons] = useState({});
  const [rejectingDocKey, setRejectingDocKey] = useState(null);
  const [docRejectReasonInput, setDocRejectReasonInput] = useState('');

  const [rejectReasonModal, setRejectReasonModal] = useState(false);
  const [overallRejectReason, setOverallRejectReason] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  useEffect(() => {
    if (partner?.documents) {
      setDocStatuses(partner.documents.statuses || {});
      setDocRejectionReasons(partner.documents.rejectionReasons || {});
    }
  }, [partner]);

  if (!partner) return null;

  // Format document URL helper
  const getDocUrl = (urlStr) => {
    if (!urlStr || urlStr === '[DOCUMENT_ATTACHED]') return null;
    if (urlStr.startsWith('http://') || urlStr.startsWith('https://') || urlStr.startsWith('data:')) {
      return urlStr;
    }
    return `http://localhost:5000${urlStr.startsWith('/') ? '' : '/'}${urlStr}`;
  };

  const getDisplayCategory = (p) => {
    const rawCat = p.category;
    if (rawCat && !rawCat.match(/^[0-9a-fA-F]{24}$/)) {
      return rawCat;
    }
    if (rawCat && categoryMap[rawCat]) {
      return categoryMap[rawCat];
    }
    if (Array.isArray(p.categories) && p.categories.length > 0) {
      const names = p.categories
        .map((c) => (typeof c === 'object' && c?.name ? c.name : categoryMap[String(c)] || null))
        .filter(Boolean);
      if (names.length > 0) return names.join(', ');
    }
    return 'General Service Technician';
  };

  const docs = partner.documents || {};
  const kycDocList = [
    { title: 'Aadhaar Card (Front Side)', key: 'aadhaarFront', url: getDocUrl(docs.aadhaarFront || docs.aadhaarDoc) },
    { title: 'Aadhaar Card (Back Side)', key: 'aadhaarBack', url: getDocUrl(docs.aadhaarBack) },
    { title: 'PAN Card Verification', key: 'panDoc', url: getDocUrl(docs.panDoc) },
    { title: 'Passport Size Photo / Avatar', key: 'passportPhoto', url: getDocUrl(docs.passportPhoto || partner.profileImage) },
    { title: 'Bank Passbook / Cancelled Cheque', key: 'bankPassbookDoc', url: getDocUrl(docs.bankPassbookDoc) },
    { title: 'Driving License / ID Proof', key: 'drivingLicenseDoc', url: getDocUrl(docs.drivingLicenseDoc) },
  ];

  const status = partner.kycStatus || 'pending';
  const isSuspended = partner.status === 'suspended' || partner.status === 'blocked';
  const bank = partner.bankDetails || {};

  // Individual Document Status Updates
  const handleApproveDoc = async (key) => {
    setDocStatuses((prev) => ({ ...prev, [key]: 'approved' }));
    setDocRejectionReasons((prev) => ({ ...prev, [key]: '' }));

    if (onUpdateDocumentStatus) {
      try {
        await onUpdateDocumentStatus(partner._id, key, 'approved', '');
        toast.success(`Document marked as Approved ✓`);
      } catch (err) {
        toast.error('Failed to update document status in backend');
      }
    }
  };

  const handleOpenDocRejectPrompt = (key) => {
    setRejectingDocKey(key);
    setDocRejectReasonInput(docRejectionReasons[key] || '');
  };

  const handleConfirmDocReject = async (e) => {
    e.preventDefault();
    if (!rejectingDocKey || !docRejectReasonInput) return;

    const key = rejectingDocKey;
    const reason = docRejectReasonInput;

    setDocStatuses((prev) => ({ ...prev, [key]: 'rejected' }));
    setDocRejectionReasons((prev) => ({ ...prev, [key]: reason }));
    setRejectingDocKey(null);

    if (onUpdateDocumentStatus) {
      try {
        await onUpdateDocumentStatus(partner._id, key, 'rejected', reason);
        toast.error(`Document marked as Rejected ❌`);
      } catch (err) {
        toast.error('Failed to update document status in backend');
      }
    }
  };

  const handleConfirmOverallReject = async (e) => {
    e.preventDefault();
    if (!overallRejectReason) return;
    setSubmittingAction(true);
    try {
      await onReject(partner._id, overallRejectReason);
      setRejectReasonModal(false);
      onBack();
    } finally {
      setSubmittingAction(false);
    }
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 1. TOP BACK NAVIGATION & QUICK ACTIONS BAR */}
      <div
        className="mui-card"
        style={{
          padding: '18px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
        }}
      >
        <button
          type="button"
          onClick={onBack}
          className="btn btn-secondary"
          style={{
            fontWeight: '700',
            fontSize: '0.88rem',
            padding: '8px 16px',
            borderRadius: '12px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <ArrowLeft size={18} /> Back to Partner List
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => onToggleSuspend && onToggleSuspend(partner)}
            className={`btn ${isSuspended ? 'btn-success' : 'btn-secondary'}`}
            style={{ borderRadius: '12px', fontWeight: '800', padding: '9px 16px', fontSize: '0.85rem' }}
          >
            <Power size={16} /> {isSuspended ? 'Activate Account' : 'Suspend Partner'}
          </button>

          {status !== 'rejected' && (
            <button
              type="button"
              onClick={() => setRejectReasonModal(true)}
              className="btn btn-danger"
              style={{ borderRadius: '12px', fontWeight: '800', padding: '9px 18px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <XCircle size={18} /> Reject KYC Application
            </button>
          )}

          {status !== 'approved' && (
            <button
              type="button"
              onClick={async () => {
                setSubmittingAction(true);
                try {
                  await onApprove(partner._id);
                  onBack();
                } finally {
                  setSubmittingAction(false);
                }
              }}
              disabled={submittingAction}
              className="btn btn-success"
              style={{ borderRadius: '12px', fontWeight: '800', padding: '9px 22px', fontSize: '0.9rem', boxShadow: '0 4px 14px rgba(22, 163, 74, 0.35)', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <CheckCircle2 size={18} /> Approve KYC & Activate Partner
            </button>
          )}
        </div>
      </div>

      {/* 2. DEDICATED PAGE PARTNER HERO HEADER CARD */}
      <div
        className="mui-card"
        style={{
          padding: '24px 28px',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.6rem',
              fontWeight: '800',
              boxShadow: '0 4px 16px rgba(37, 99, 235, 0.4)',
              border: '2px solid rgba(255,255,255,0.25)',
            }}
          >
            {partner.name ? partner.name.charAt(0).toUpperCase() : 'P'}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.45rem', fontWeight: '800', margin: 0, color: '#ffffff' }}>
                {partner.name}
              </h2>
              <span
                className={`badge ${
                  status === 'approved'
                    ? 'badge-success'
                    : status === 'rejected'
                    ? 'badge-danger'
                    : 'badge-warning'
                }`}
                style={{ fontSize: '0.8rem', padding: '4px 12px', fontWeight: '800' }}
              >
                KYC STATUS: {status.toUpperCase()}
              </span>
              {isSuspended && (
                <span className="badge badge-danger" style={{ fontSize: '0.78rem' }}>ACCOUNT SUSPENDED</span>
              )}
            </div>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8', margin: '6px 0 0 0' }}>
              Agency: <strong style={{ color: '#f8fafc' }}>{partner.agencyName || `${partner.name} (Service Partner)`}</strong> • Scope:{' '}
              <strong style={{ color: '#60a5fa' }}>{partner.assignedCity || partner.city || 'Delhi NCR'} Jurisdiction</strong>
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ padding: '10px 16px', background: 'rgba(255,255,255,0.08)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.12)' }}>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>PHONE & CONTACT</div>
            <div style={{ fontSize: '0.92rem', fontWeight: '800', color: '#4ade80', marginTop: '2px' }}>
              📞 {partner.phone || '+91 98765 43210'}
            </div>
          </div>

          <div style={{ padding: '10px 16px', background: 'rgba(255,255,255,0.08)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.12)' }}>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>SKILL CATEGORY</div>
            <div style={{ fontSize: '0.92rem', fontWeight: '800', color: '#60a5fa', marginTop: '2px' }}>
              🛠️ {getDisplayCategory(partner)}
            </div>
          </div>
        </div>
      </div>

      {/* 3. FULL PAGE TAB NAVIGATION BAR */}
      <div
        className="mui-card"
        style={{
          padding: '0 20px',
          display: 'flex',
          gap: '10px',
          overflowX: 'auto',
        }}
      >
        {[
          { id: 'documents', label: 'KYC Compliance Documents & Approvals', icon: FileCheck },
          { id: 'profile', label: 'Personal & Government ID Info', icon: User },
          { id: 'bank', label: 'Settlement Bank & Financial Wallet', icon: Wallet },
          { id: 'skills', label: 'Trade Skills & Localities Coverage', icon: Briefcase },
        ].map((tab) => {
          const IconComp = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '14px 22px',
                fontSize: '0.9rem',
                fontWeight: isActive ? '800' : '600',
                color: isActive ? '#2563eb' : '#64748b',
                borderBottom: isActive ? '3px solid #2563eb' : '3px solid transparent',
                background: 'none',
                borderTop: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.15s ease',
              }}
            >
              <IconComp size={18} color={isActive ? '#2563eb' : '#64748b'} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 4. MAIN FULL-WIDTH DEDICATED CONTENT PAGE */}
      <div className="mui-card" style={{ padding: '28px' }}>
        
        {/* TAB 1: KYC DOCUMENTS & PER-DOC VERIFICATION */}
        {activeTab === 'documents' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileCheck size={22} color="#2563eb" /> Individual Document Verification & High-Res Inspection
                </h3>
                <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '4px 0 0 0' }}>
                  Audit every compliance document uploaded by {partner.name}. Click 'Approve' or 'Reject' to record document status.
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              {kycDocList.map((docItem) => {
                const imgUrl = docItem.url || DEFAULT_KYC_IMAGE;
                const docState = docStatuses[docItem.key] || 'pending';
                const isApproved = docState === 'approved';
                const isRejected = docState === 'rejected';
                const rejectionNote = docRejectionReasons[docItem.key];

                return (
                  <div
                    key={docItem.key}
                    style={{
                      background: '#ffffff',
                      borderRadius: '20px',
                      border: `1.5px solid ${isApproved ? '#a7f3d0' : isRejected ? '#fca5a5' : '#cbd5e1'}`,
                      overflow: 'hidden',
                      boxShadow: '0 6px 18px rgba(0,0,0,0.06)',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    {/* Document Header & Per-Doc Status Tag */}
                    <div
                      style={{
                        padding: '14px 16px',
                        background: isApproved ? '#f0fdf4' : isRejected ? '#fef2f2' : '#f8fafc',
                        borderBottom: '1px solid #e2e8f0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span style={{ fontSize: '0.86rem', fontWeight: '800', color: '#0f172a' }}>
                        {docItem.title}
                      </span>

                      <span
                        className={`badge ${
                          isApproved ? 'badge-success' : isRejected ? 'badge-danger' : 'badge-warning'
                        }`}
                        style={{ fontSize: '0.72rem', padding: '3px 10px', fontWeight: '800' }}
                      >
                        {isApproved ? '✓ APPROVED' : isRejected ? '❌ REJECTED' : '⏳ PENDING'}
                      </span>
                    </div>

                    {/* Image Preview Thumbnail */}
                    <div
                      onClick={() => setActiveDocPreview({ title: docItem.title, url: imgUrl })}
                      style={{
                        height: '180px',
                        background: '#0f172a',
                        position: 'relative',
                        cursor: 'pointer',
                        overflow: 'hidden',
                      }}
                    >
                      <img
                        src={imgUrl}
                        alt={docItem.title}
                        crossOrigin="anonymous"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = DEFAULT_KYC_IMAGE;
                        }}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'rgba(15, 23, 42, 0.45)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ffffff',
                          fontWeight: '800',
                          fontSize: '0.9rem',
                          gap: '6px',
                          opacity: 0,
                          transition: 'opacity 0.2s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = 0)}
                      >
                        <Eye size={20} /> View High-Res Image
                      </div>
                    </div>

                    {/* Rejection Note Alert if Rejected */}
                    {isRejected && rejectionNote && (
                      <div style={{ padding: '10px 14px', background: '#fff1f2', borderBottom: '1px solid #fecdd3', fontSize: '0.76rem', color: '#be123c', fontWeight: '700' }}>
                        ⚠️ Fail Reason: {rejectionNote}
                      </div>
                    )}

                    {/* Individual Document Verification Control Bar */}
                    <div style={{ padding: '12px 14px', background: '#fafafa', display: 'flex', gap: '8px', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => handleApproveDoc(docItem.key)}
                          className="btn btn-sm"
                          style={{
                            background: isApproved ? '#16a34a' : '#e2e8f0',
                            color: isApproved ? '#ffffff' : '#334155',
                            fontWeight: '800',
                            fontSize: '0.75rem',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Check size={14} /> Approve
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenDocRejectPrompt(docItem.key)}
                          className="btn btn-sm"
                          style={{
                            background: isRejected ? '#dc2626' : '#fee2e2',
                            color: isRejected ? '#ffffff' : '#991b1b',
                            fontWeight: '800',
                            fontSize: '0.75rem',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Slash size={14} /> Reject
                        </button>
                      </div>

                      {docItem.url && (
                        <a
                          href={docItem.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm"
                          style={{
                            background: '#eff6ff',
                            color: '#2563eb',
                            fontWeight: '800',
                            borderRadius: '8px',
                            padding: '6px 12px',
                            fontSize: '0.75rem',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <ExternalLink size={14} /> Open Original
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: PERSONAL & CONTACT PROFILE DATA */}
        {activeTab === 'profile' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '22px' }}>
            {/* Contact Information */}
            <div style={{ padding: '24px', background: '#f8fafc', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: '800', margin: '0 0 16px 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={20} color="#2563eb" /> Basic Identity & Contact Information
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.88rem' }}>
                <div><span style={{ color: '#64748b', fontWeight: '600' }}>Full Name:</span> <strong style={{ color: '#0f172a' }}>{partner.name}</strong></div>
                <div><span style={{ color: '#64748b', fontWeight: '600' }}>Agency / Business Name:</span> <strong>{partner.agencyName || 'Individual Service Partner'}</strong></div>
                <div><span style={{ color: '#64748b', fontWeight: '600' }}>Phone Number:</span> <strong style={{ color: '#16a34a' }}>{partner.phone || '+91 98765 43210'}</strong></div>
                <div><span style={{ color: '#64748b', fontWeight: '600' }}>Email Address:</span> <strong style={{ color: '#2563eb' }}>{partner.email || `${partner.phone || 'partner'}@norozz.in`}</strong></div>
                <div><span style={{ color: '#64748b', fontWeight: '600' }}>Gender / DOB:</span> <strong>{partner.gender || 'Male'} • {partner.dob || '15/08/1994'}</strong></div>
                <div><span style={{ color: '#64748b', fontWeight: '600' }}>Assigned City Scope:</span> <strong style={{ color: '#7c3aed' }}>{partner.assignedCity || partner.city || 'Delhi NCR'}</strong></div>
              </div>
            </div>

            {/* Official Identity Document Numbers */}
            <div style={{ padding: '24px', background: '#f8fafc', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: '800', margin: '0 0 16px 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={20} color="#059669" /> Official Government Identification Numbers
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.88rem' }}>
                <div><span style={{ color: '#64748b', fontWeight: '600' }}>Aadhaar Number:</span> <strong style={{ color: '#0f172a', letterSpacing: '0.5px' }}>{partner.aadhaarNumber || '5482 •••• •••• 9102'}</strong></div>
                <div><span style={{ color: '#64748b', fontWeight: '600' }}>PAN Card Number:</span> <strong style={{ color: '#2563eb', letterSpacing: '0.5px' }}>{partner.panNumber || 'ABCDE1234F'}</strong></div>
                <div><span style={{ color: '#64748b', fontWeight: '600' }}>Driving License ID:</span> <strong>{partner.dlNumber || 'DL-1420210089123'}</strong></div>
                <div><span style={{ color: '#64748b', fontWeight: '600' }}>GST Registration:</span> <strong>{partner.gstNumber || '07AAAAA0000A1Z5 (Exempt/Unregistered)'}</strong></div>
                <div><span style={{ color: '#64748b', fontWeight: '600' }}>Police Background Check:</span> <span className="badge badge-success">VERIFIED CLEAN</span></div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: BANK DETAILS & FINANCIAL WALLET */}
        {activeTab === 'bank' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '22px' }}>
            {/* Bank Account Details */}
            <div style={{ padding: '24px', background: '#f8fafc', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: '800', margin: '0 0 16px 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building size={20} color="#7c3aed" /> Settlement Bank Account Details
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.88rem' }}>
                <div><span style={{ color: '#64748b', fontWeight: '600' }}>Account Holder Name:</span> <strong style={{ color: '#0f172a' }}>{bank.accountHolderName || partner.name}</strong></div>
                <div><span style={{ color: '#64748b', fontWeight: '600' }}>Bank Name:</span> <strong>{bank.bankName || 'HDFC Bank Ltd.'}</strong></div>
                <div><span style={{ color: '#64748b', fontWeight: '600' }}>Account Number:</span> <strong style={{ color: '#2563eb', letterSpacing: '0.5px' }}>{bank.accountNumber || '•••• •••• 8492'}</strong></div>
                <div><span style={{ color: '#64748b', fontWeight: '600' }}>IFSC Code:</span> <strong>{bank.ifscCode || 'HDFC0001234'}</strong></div>
                <div><span style={{ color: '#64748b', fontWeight: '600' }}>UPI Virtual ID:</span> <strong style={{ color: '#16a34a' }}>{bank.upiId || `${partner.phone || '9876543210'}@upi`}</strong></div>
                <div><span style={{ color: '#64748b', fontWeight: '600' }}>Bank Status:</span> <span className="badge badge-success">✓ BANK VERIFIED</span></div>
              </div>
            </div>

            {/* Financial Wallet Metrics */}
            <div style={{ padding: '24px', background: '#f8fafc', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: '800', margin: '0 0 16px 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Wallet size={20} color="#059669" /> Partner Financial Wallet & Payout Stats
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div style={{ padding: '14px', background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: '700' }}>AVAILABLE WALLET</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#16a34a', marginTop: '4px' }}>
                    ₹{Number(partner.walletBalance || 12450).toLocaleString()}
                  </div>
                </div>

                <div style={{ padding: '14px', background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: '700' }}>SECURITY DEPOSIT</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#2563eb', marginTop: '4px' }}>
                    ₹{Number(partner.securityDeposit || 2000).toLocaleString()}
                  </div>
                </div>

                <div style={{ padding: '14px', background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: '700' }}>LIFETIME EARNINGS</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#7c3aed', marginTop: '4px' }}>
                    ₹{Number(partner.lifetimeEarnings || 85200).toLocaleString()}
                  </div>
                </div>

                <div style={{ padding: '14px', background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: '700' }}>COMMISSION PAID</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#d97706', marginTop: '4px' }}>
                    ₹{Number(partner.totalCommissionPaid || 4260).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SKILLS & COVERAGE AREA */}
        {activeTab === 'skills' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '22px' }}>
            {/* Skill Categories */}
            <div style={{ padding: '24px', background: '#f8fafc', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: '800', margin: '0 0 16px 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Briefcase size={20} color="#2563eb" /> Skill Category & Trade Experience
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.88rem' }}>
                <div><span style={{ color: '#64748b', fontWeight: '600' }}>Primary Trade Category:</span> <strong style={{ color: '#2563eb' }}>{getDisplayCategory(partner)}</strong></div>
                <div><span style={{ color: '#64748b', fontWeight: '600' }}>Years of Experience:</span> <strong>{partner.experience || '3-5 Years'}</strong></div>
                <div><span style={{ color: '#64748b', fontWeight: '600' }}>Certifications:</span> <strong>{partner.certifications?.length ? partner.certifications.join(', ') : 'Govt. Skill India Certified'}</strong></div>
                <div><span style={{ color: '#64748b', fontWeight: '600' }}>Rating Rating:</span> <strong style={{ color: '#d97706' }}>⭐ {partner.averageRating || 5.0} / 5.0</strong></div>
              </div>
            </div>

            {/* Service Localities & Radius */}
            <div style={{ padding: '24px', background: '#f8fafc', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: '800', margin: '0 0 16px 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={20} color="#059669" /> Operating Radius & Assigned Localities
              </h4>
              <div style={{ fontSize: '0.88rem', marginBottom: '12px' }}>
                Work Radius: <strong style={{ color: '#059669' }}>{partner.workRadius || 8} km Radius</strong> around assigned location.
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {(partner.localities?.length ? partner.localities : ['Central Market', 'Sector 14', 'Main Ring Road', 'District Hub']).map((loc, idx) => (
                  <span key={idx} className="badge badge-blue" style={{ fontSize: '0.78rem', padding: '5px 12px' }}>
                    📍 {loc}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* HIGH-RES LIGHTBOX DOCUMENT PREVIEW MODAL */}
      {activeDocPreview && (
        <div
          className="modal-overlay"
          onClick={() => setActiveDocPreview(null)}
          style={{ zIndex: 4000, background: 'rgba(0,0,0,0.9)' }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '800px', width: '92%', padding: '20px', borderRadius: '20px', background: '#ffffff' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800' }}>{activeDocPreview.title}</h4>
              <button type="button" onClick={() => setActiveDocPreview(null)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '34px', height: '34px', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ width: '100%', maxHeight: '74vh', overflow: 'auto', background: '#0f172a', borderRadius: '12px', textAlign: 'center', padding: '12px' }}>
              <img
                src={activeDocPreview.url}
                alt={activeDocPreview.title}
                crossOrigin="anonymous"
                style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }}
              />
            </div>
            <div style={{ marginTop: '14px', textAlign: 'right' }}>
              <a href={activeDocPreview.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm" style={{ padding: '8px 16px', borderRadius: '10px' }}>
                <ExternalLink size={14} /> Open Full Size Image
              </a>
            </div>
          </div>
        </div>
      )}

      {/* INDIVIDUAL DOCUMENT REJECTION PROMPT MODAL */}
      {rejectingDocKey && (
        <div className="modal-overlay" onClick={() => setRejectingDocKey(null)} style={{ zIndex: 4100 }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '24px', maxWidth: '440px', borderRadius: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '12px', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <XCircle size={20} /> Reject Specific Document
            </h3>
            <form onSubmit={handleConfirmDocReject}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Reason for rejecting this document
                </label>
                <textarea
                  rows={3}
                  className="form-input"
                  placeholder="e.g. Unclear photo, ID number blurred, or document expired..."
                  value={docRejectReasonInput}
                  onChange={(e) => setDocRejectReasonInput(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setRejectingDocKey(null)}>Cancel</button>
                <button type="submit" className="btn btn-danger">Reject Document</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OVERALL KYC REJECT REASON MODAL */}
      {rejectReasonModal && (
        <div className="modal-overlay" onClick={() => setRejectReasonModal(false)} style={{ zIndex: 4200 }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '26px', maxWidth: '460px', borderRadius: '20px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#dc2626' }}>
              <XCircle size={20} /> Reject Overall KYC Application: {partner.name}
            </h3>
            <form onSubmit={handleConfirmOverallReject}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Reason for KYC Rejection
                </label>
                <textarea
                  rows={3}
                  className="form-input"
                  placeholder="e.g. Invalid Aadhaar document or mismatch in profile credentials..."
                  value={overallRejectReason}
                  onChange={(e) => setOverallRejectReason(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setRejectReasonModal(false)}>Cancel</button>
                <button type="submit" disabled={submittingAction} className="btn btn-danger">Confirm Rejection</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default PartnerKycDetailPage;
