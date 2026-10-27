import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  FileCheck,
  Power,
  ExternalLink,
  MapPin,
  Briefcase,
  Phone,
  Mail,
  User,
  Eye,
  Award,
  Wallet,
  Building,
  Check,
  Ban,
  X,
  FileX,
  History,
  Star,
  IndianRupee,
  ClipboardList,
  Percent,
} from 'lucide-react';
import { toast } from '../../utils/toast.js';
import { kycService } from '../../services/kyc.service.js';
import { cityAdminService } from '../../services/cityAdmin.service.js';

const API_ORIGIN = (() => {
  try {
    return new URL(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').origin;
  } catch {
    return 'http://localhost:5000';
  }
})();

const DOC_LIST = [
  { key: 'aadhaarFront', title: 'Aadhaar Card — Front', alt: 'aadhaarDoc' },
  { key: 'aadhaarBack', title: 'Aadhaar Card — Back' },
  { key: 'panDoc', title: 'PAN Card' },
  { key: 'passportPhoto', title: 'Passport Photo' },
  { key: 'bankPassbookDoc', title: 'Bank Passbook / Cancelled Cheque' },
  { key: 'drivingLicenseDoc', title: 'Driving Licence', optional: true },
];

const CHECKS = [
  { key: 'mobile', label: 'Mobile OTP' },
  { key: 'pan', label: 'PAN' },
  { key: 'aadhaar', label: 'Aadhaar / DigiLocker' },
  { key: 'drivingLicense', label: 'Driving licence' },
  { key: 'bankAccount', label: 'Bank account' },
  { key: 'faceMatch', label: 'Face match' },
  { key: 'faceLiveness', label: 'Face liveness' },
];

const card = { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)' };
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');
const fmtDateTime = (d) => (d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—');
const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
const initials = (name = '') => name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || 'P';
const docUrl = (u) => {
  if (!u || u === '[DOCUMENT_ATTACHED]') return null;
  if (/^(https?:|data:)/.test(u)) return u;
  return `${API_ORIGIN}${u.startsWith('/') ? '' : '/'}${u}`;
};

const Field = ({ label, children }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', padding: '10px 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.85rem' }}>
    <span style={{ color: '#64748b', fontWeight: 600, flexShrink: 0 }}>{label}</span>
    <span style={{ color: '#0f172a', fontWeight: 700, textAlign: 'right', minWidth: 0, overflowWrap: 'anywhere' }}>{children || <span style={{ color: '#94a3b8', fontWeight: 600 }}>Not provided</span>}</span>
  </div>
);

const Panel = ({ icon: Icon, color = '#2563eb', title, children, right }) => (
  <div style={{ ...card, padding: '20px', minWidth: 0 }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
      <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Icon size={18} color={color} /> {title}
      </h4>
      {right}
    </div>
    {children}
  </div>
);

const Pill = ({ bg, color, children }) => (
  <span style={{ padding: '3px 10px', borderRadius: '9999px', background: bg, color, fontSize: '0.7rem', fontWeight: 800, whiteSpace: 'nowrap' }}>{children}</span>
);

const Stat = ({ icon: Icon, color, bg, label, value, sub }) => (
  <div style={{ ...card, padding: '16px', display: 'flex', gap: '12px', alignItems: 'center', minWidth: 0 }}>
    <div style={{ width: '40px', height: '40px', borderRadius: '11px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={19} color={color} />
    </div>
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{label}</div>
      <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.2 }}>{value}</div>
      {sub && <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{sub}</div>}
    </div>
  </div>
);

const btn = (bg, color, border) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '9px 16px',
  borderRadius: '10px',
  border: border ? `1px solid ${border}` : 'none',
  background: bg,
  color,
  fontSize: '0.84rem',
  fontWeight: 800,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
});

const Modal = ({ title, tone = '#0f172a', onClose, children }) => (
  <div className="modal-overlay" onClick={onClose} style={{ zIndex: 4100 }}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '24px', maxWidth: '460px', width: '92%', borderRadius: '18px' }}>
      <h3 style={{ margin: '0 0 14px', fontSize: '1.08rem', fontWeight: 800, color: tone }}>{title}</h3>
      {children}
    </div>
  </div>
);

const textareaStyle = { width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.86rem', resize: 'vertical', boxSizing: 'border-box' };

const PartnerKycDetailPage = ({ partner, assignedCity, onBack, onApprove, onReject, onToggleSuspend, onUpdateDocumentStatus }) => {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('documents');
  const [preview, setPreview] = useState(null);
  const [overlay, setOverlay] = useState({}); // optimistic per-document status while the request is in flight
  const [rejectDoc, setRejectDoc] = useState(null);
  const [docReason, setDocReason] = useState('');
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');
  const [showAllLocalities, setShowAllLocalities] = useState(false);
  const [busy, setBusy] = useState(false);

  const profileQuery = useQuery({
    queryKey: ['cityAdmin', 'partnerProfile', partner._id, partner.updatedAt],
    queryFn: async () => (await cityAdminService.getPartnerProfile(partner._id))?.data ?? null,
    retry: false,
  });
  const profile = profileQuery.data;

  const refreshProfile = () => queryClient.invalidateQueries({ queryKey: ['cityAdmin', 'partnerProfile', partner._id] });

  // header uses the list record immediately; everything else waits for the profile
  const name = profile?.name || partner.name;
  const status = (profile?.kycStatus || partner.kycStatus || 'pending').toLowerCase();
  const accountStatus = profile?.status || partner.status;
  const isSuspended = accountStatus === 'suspended' || accountStatus === 'blocked';
  const checks = profile?.kyc?.checks || {};
  const zoopVerified = profile?.kyc?.overallStatus === 'VERIFIED' || profile?.kyc?.manualOverride;
  const failedChecks = CHECKS.filter((c) => (checks[c.key] || 'PENDING') !== 'VERIFIED');
  const docs = profile?.documents || partner.documents || {};
  const docStatus = (key) => overlay[key]?.status || docs.statuses?.[key] || 'pending';
  const docReasonOf = (key) => overlay[key]?.reason ?? docs.rejectionReasons?.[key] ?? '';
  const prog = profile?.documentProgress;
  const stats = profile?.stats;

  const guard = async (fn) => {
    setBusy(true);
    try {
      await fn();
    } catch {
      // errors are already toasted by the mutation hooks
    } finally {
      setBusy(false);
    }
  };

  const setDoc = async (key, next, reason = '') => {
    setOverlay((o) => ({ ...o, [key]: { status: next, reason } }));
    try {
      await onUpdateDocumentStatus(partner._id, key, next, reason);
      await refreshProfile(); // fresh server data replaces the optimistic state
      setOverlay({});
    } catch {
      setOverlay((o) => Object.fromEntries(Object.entries(o).filter(([k]) => k !== key)));
    }
  };

  const handleApprove = () => {
    if (!zoopVerified) {
      setOverrideOpen(true);
      return;
    }
    guard(async () => {
      await onApprove(partner._id);
      onBack();
    });
  };

  const submitOverride = (e) => {
    e.preventDefault();
    guard(async () => {
      try {
        await kycService.approvePartnerAdmin(partner._id, { isManualOverride: true, overrideReason: overrideReason.trim() });
        toast.success('Partner approved via manual override');
        queryClient.invalidateQueries({ queryKey: ['cityAdmin', 'partners'] });
        onBack();
      } catch (err) {
        toast.error(err?.response?.data?.message || 'Manual override failed');
      }
    });
  };

  const submitReject = (e) => {
    e.preventDefault();
    guard(async () => {
      await onReject(partner._id, rejectReason.trim());
      setRejectOpen(false);
      onBack();
    });
  };

  const submitDocReject = (e) => {
    e.preventDefault();
    const key = rejectDoc;
    setRejectDoc(null);
    setDoc(key, 'rejected', docReason.trim());
  };

  const statusPill = { approved: ['#ecfdf5', '#047857', 'KYC Approved'], rejected: ['#fef2f2', '#b91c1c', 'KYC Rejected'], pending: ['#fffbeb', '#b45309', 'KYC Pending'] }[status] || ['#fffbeb', '#b45309', 'KYC Pending'];
  const visibleLocalities = showAllLocalities ? profile?.localities : profile?.localities?.slice(0, 12);

  const TABS = [
    { id: 'documents', label: 'Documents', icon: FileCheck },
    { id: 'profile', label: 'Profile & Identity', icon: User },
    { id: 'skills', label: 'Skills & Coverage', icon: Briefcase },
    { id: 'bank', label: 'Bank & Wallet', icon: Wallet },
    { id: 'activity', label: 'Activity', icon: History },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', minWidth: 0 }}>
      {/* Top bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <button type="button" onClick={onBack} style={btn('#ffffff', '#334155', '#e2e8f0')}>
          <ArrowLeft size={16} /> Back to partners
        </button>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          <button type="button" onClick={() => guard(() => onToggleSuspend(partner))} disabled={busy} style={isSuspended ? btn('#ecfdf5', '#047857', '#a7f3d0') : btn('#ffffff', '#475569', '#e2e8f0')}>
            <Power size={15} /> {isSuspended ? 'Activate account' : 'Suspend'}
          </button>
          {status !== 'rejected' && (
            <button type="button" onClick={() => setRejectOpen(true)} style={btn('#fef2f2', '#b91c1c', '#fecaca')}>
              <XCircle size={15} /> Reject application
            </button>
          )}
          {status !== 'approved' && (
            <button type="button" onClick={handleApprove} disabled={busy || !profile} style={{ ...btn('#059669', '#ffffff'), opacity: busy || !profile ? 0.6 : 1 }}>
              <CheckCircle2 size={15} /> Approve KYC
            </button>
          )}
        </div>
      </div>

      {/* Hero */}
      <div style={{ ...card, padding: '22px 24px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '18px' }}>
        <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg,#2563eb,#7c3aed)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', fontWeight: 800, overflow: 'hidden', flexShrink: 0 }}>
          {profile?.profileImage ? <img src={profile.profileImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials(name)}
        </div>
        <div style={{ flex: 1, minWidth: '240px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 900, color: '#0f172a' }}>{name}</h2>
            <Pill bg={statusPill[0]} color={statusPill[1]}>{statusPill[2]}</Pill>
            {isSuspended && <Pill bg="#fef2f2" color="#b91c1c">Suspended</Pill>}
            {profile?.isOnline && <Pill bg="#ecfdf5" color="#047857">Online</Pill>}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
            {profile?.userId || `ID …${String(partner._id).slice(-6)}`}
            {profile?.agencyName && profile.agencyName !== name ? ` · ${profile.agencyName}` : ''} · {profile?.city || assignedCity} · Joined {fmtDate(profile?.createdAt || partner.createdAt)}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 18px', marginTop: '10px', fontSize: '0.83rem', color: '#334155', fontWeight: 600 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Phone size={14} color="#16a34a" /> {profile?.phone || partner.phone || '—'}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Mail size={14} color="#2563eb" /> {profile?.email || partner.email || '—'}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Briefcase size={14} color="#7c3aed" /> {profile?.categories?.join(', ') || partner.category}</span>
          </div>
        </div>
      </div>

      {profileQuery.isError && (
        <div style={{ ...card, padding: '14px 18px', borderColor: '#fecaca', background: '#fef2f2', color: '#b91c1c', fontSize: '0.85rem', fontWeight: 600 }}>
          Could not load the full partner profile. Showing basic details only.
        </div>
      )}

      {/* Performance */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px' }}>
        <Stat icon={ClipboardList} color="#2563eb" bg="#eff6ff" label="Jobs handled" value={stats?.jobs ?? '—'} sub={stats ? `${stats.completed} completed · ${stats.active} active` : ''} />
        <Stat icon={Percent} color="#059669" bg="#ecfdf5" label="Completion rate" value={stats?.completionRate != null ? `${stats.completionRate}%` : '—'} sub={stats ? `${stats.cancelled} cancelled` : ''} />
        <Stat icon={Star} color="#d97706" bg="#fffbeb" label="Customer rating" value={stats?.avgRating ? `${stats.avgRating} ★` : '—'} sub={stats ? `${stats.ratingCount} rated jobs` : ''} />
        <Stat icon={IndianRupee} color="#7c3aed" bg="#f5f3ff" label="Net earnings" value={stats ? inr(stats.earnings) : '—'} sub={stats ? `Platform fee ${inr(stats.commission)}` : ''} />
      </div>

      {/* Verification summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        <Panel icon={FileCheck} title="Document review" color="#2563eb">
          {prog ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, margin: '6px 0 8px' }}>
                <span style={{ color: '#0f172a' }}>{prog.approved} of {prog.required} approved</span>
                <span style={{ color: '#64748b' }}>{prog.uploaded} uploaded{prog.rejected ? ` · ${prog.rejected} rejected` : ''}</span>
              </div>
              <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden', display: 'flex' }}>
                <div style={{ width: `${(prog.approved / prog.required) * 100}%`, background: '#10b981' }} />
                <div style={{ width: `${(prog.rejected / prog.required) * 100}%`, background: '#ef4444' }} />
              </div>
              {prog.uploaded < prog.required && (
                <div style={{ marginTop: '10px', fontSize: '0.78rem', color: '#b45309', fontWeight: 600 }}>
                  {prog.required - prog.uploaded} required document(s) not uploaded yet.
                </div>
              )}
            </>
          ) : <div style={{ color: '#94a3b8', fontSize: '0.85rem', padding: '10px 0' }}>Loading…</div>}
        </Panel>

        <Panel
          icon={zoopVerified ? ShieldCheck : ShieldAlert}
          color={zoopVerified ? '#059669' : '#d97706'}
          title="Automated identity checks"
          right={profile && <Pill bg={profile.kyc.overallStatus === 'VERIFIED' ? '#ecfdf5' : '#fffbeb'} color={profile.kyc.overallStatus === 'VERIFIED' ? '#047857' : '#b45309'}>{profile.kyc.overallStatus}</Pill>}
        >
          {profile ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '8px', marginTop: '6px' }}>
                {CHECKS.map((c) => {
                  const st = String(checks[c.key] || 'PENDING').toUpperCase();
                  const ok = st === 'VERIFIED';
                  const fail = st === 'FAILED';
                  return (
                    <div key={c.key} style={{ padding: '8px 10px', borderRadius: '10px', border: `1px solid ${ok ? '#bbf7d0' : fail ? '#fecdd3' : '#e2e8f0'}`, background: ok ? '#f0fdf4' : fail ? '#fef2f2' : '#f8fafc' }}>
                      <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b' }}>{c.label}</div>
                      <div style={{ fontSize: '0.76rem', fontWeight: 800, color: ok ? '#16a34a' : fail ? '#dc2626' : '#d97706' }}>{ok ? 'Verified' : fail ? 'Failed' : 'Pending'}</div>
                    </div>
                  );
                })}
              </div>
              {profile.kyc.manualOverride && (
                <div style={{ marginTop: '10px', padding: '9px 11px', borderRadius: '10px', background: '#fffbeb', border: '1px solid #fde68a', fontSize: '0.76rem', color: '#92400e' }}>
                  <strong>Approved by manual override</strong>{profile.kyc.overrideReason ? ` — “${profile.kyc.overrideReason}”` : ''}
                </div>
              )}
            </>
          ) : <div style={{ color: '#94a3b8', fontSize: '0.85rem', padding: '10px 0' }}>Loading…</div>}
        </Panel>
      </div>

      {/* Tabs */}
      <div style={{ ...card, padding: '0 14px', display: 'flex', gap: '4px', overflowX: 'auto' }}>
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button key={t.id} type="button" onClick={() => setTab(t.id)} style={{ padding: '14px 16px', background: 'none', border: 'none', borderBottom: `3px solid ${active ? '#2563eb' : 'transparent'}`, color: active ? '#2563eb' : '#64748b', fontSize: '0.86rem', fontWeight: active ? 800 : 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '7px', whiteSpace: 'nowrap' }}>
              <Icon size={16} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Documents */}
      {tab === 'documents' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '16px' }}>
          {DOC_LIST.map((d) => {
            const url = docUrl(docs[d.key] || (d.alt && docs[d.alt]) || (d.key === 'passportPhoto' ? profile?.profileImage : ''));
            const st = docStatus(d.key);
            const approved = st === 'approved';
            const rejected = st === 'rejected';
            const note = docReasonOf(d.key);
            return (
              <div key={d.key} style={{ ...card, overflow: 'hidden', borderColor: approved ? '#a7f3d0' : rejected ? '#fecaca' : '#e2e8f0' }}>
                <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>{d.title}</span>
                  {url ? (
                    <Pill bg={approved ? '#ecfdf5' : rejected ? '#fef2f2' : '#fffbeb'} color={approved ? '#047857' : rejected ? '#b91c1c' : '#b45309'}>{approved ? 'Approved' : rejected ? 'Rejected' : 'Pending'}</Pill>
                  ) : (
                    <Pill bg="#f1f5f9" color="#64748b">{d.optional ? 'Optional' : 'Missing'}</Pill>
                  )}
                </div>
                {url ? (
                  <button type="button" onClick={() => setPreview({ title: d.title, url })} style={{ display: 'block', width: '100%', height: '180px', padding: 0, border: 'none', background: '#0f172a', cursor: 'zoom-in', position: 'relative' }}>
                    <img src={url} alt={d.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                    <span style={{ position: 'absolute', right: '8px', bottom: '8px', background: 'rgba(15,23,42,.75)', color: '#fff', borderRadius: '8px', padding: '3px 9px', fontSize: '0.7rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Eye size={12} /> View</span>
                  </button>
                ) : (
                  <div style={{ height: '180px', background: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600 }}>
                    <FileX size={30} /> {d.optional ? 'Not required for this partner' : 'Not uploaded yet'}
                  </div>
                )}
                {rejected && note && <div style={{ padding: '9px 14px', background: '#fff1f2', borderTop: '1px solid #fecdd3', fontSize: '0.76rem', color: '#be123c', fontWeight: 700 }}>Reason: {note}</div>}
                <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', background: '#fafafa' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button type="button" disabled={!url || approved} onClick={() => setDoc(d.key, 'approved')} style={{ ...btn(approved ? '#16a34a' : '#e2e8f0', approved ? '#fff' : '#334155'), padding: '6px 11px', fontSize: '0.74rem', opacity: !url ? 0.45 : 1, cursor: !url || approved ? 'default' : 'pointer' }}>
                      <Check size={13} /> Approve
                    </button>
                    <button type="button" disabled={!url || rejected} onClick={() => { setRejectDoc(d.key); setDocReason(''); }} style={{ ...btn(rejected ? '#dc2626' : '#fee2e2', rejected ? '#fff' : '#991b1b'), padding: '6px 11px', fontSize: '0.74rem', opacity: !url ? 0.45 : 1, cursor: !url || rejected ? 'default' : 'pointer' }}>
                      <Ban size={13} /> Reject
                    </button>
                  </div>
                  {url && (
                    <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', fontSize: '0.74rem', fontWeight: 800, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      Open <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Profile & identity */}
      {tab === 'profile' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
          <Panel icon={User} title="Personal details">
            <Field label="Full name">{name}</Field>
            <Field label="Business name">{profile?.agencyName}</Field>
            <Field label="Gender">{profile?.gender}</Field>
            <Field label="Date of birth">{profile?.dob}</Field>
            <Field label="Phone">{profile?.phone || partner.phone}</Field>
            <Field label="Email">{profile?.email || partner.email}</Field>
            <Field label="Address">{[profile?.address?.addressLine, profile?.address?.city, profile?.address?.state, profile?.address?.pincode].filter(Boolean).join(', ')}</Field>
            <Field label="Last login">{profile?.lastLogin ? fmtDateTime(profile.lastLogin) : ''}</Field>
          </Panel>
          <Panel icon={ShieldCheck} color="#059669" title="Government identity">
            <Field label="Aadhaar number">{profile?.identity?.aadhaarMasked}</Field>
            <Field label="PAN number">{profile?.identity?.panMasked}</Field>
            <Field label="Admin review">{profile ? profile.kyc.approvalStatus.replace(/_/g, ' ') : ''}</Field>
            <Field label="Reviewed on">{profile?.kyc?.adminReviewedAt ? fmtDateTime(profile.kyc.adminReviewedAt) : ''}</Field>
            {profile?.kyc?.rejectionReason && <Field label="Rejection reason">{profile.kyc.rejectionReason}</Field>}
            <div style={{ marginTop: '10px', fontSize: '0.72rem', color: '#94a3b8' }}>Identity numbers are masked; only the last digits are shown for your protection.</div>
          </Panel>
        </div>
      )}

      {/* Skills & coverage */}
      {tab === 'skills' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
          <Panel icon={Briefcase} title="Skills & experience">
            <Field label="Category">{profile?.categories?.join(', ')}</Field>
            <Field label="Experience">{profile?.experience}</Field>
            <div style={{ padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ color: '#64748b', fontWeight: 600, fontSize: '0.85rem', marginBottom: '8px' }}>Services offered</div>
              {profile?.services?.length ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {profile.services.map((s) => <span key={s._id} style={{ background: '#eff6ff', color: '#1d4ed8', borderRadius: '8px', padding: '4px 10px', fontSize: '0.76rem', fontWeight: 700 }}>{s.name}</span>)}
                </div>
              ) : <span style={{ color: '#94a3b8', fontSize: '0.84rem' }}>No specific services selected (eligible for the whole category).</span>}
            </div>
            <div style={{ padding: '10px 0' }}>
              <div style={{ color: '#64748b', fontWeight: 600, fontSize: '0.85rem', marginBottom: '8px' }}>Certifications</div>
              {profile?.certifications?.length ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {profile.certifications.map((c, i) => {
                    const title = typeof c === 'object' ? c.title || c.name || 'Certificate' : c;
                    const img = typeof c === 'object' ? docUrl(c.image || c.url) : null;
                    return (
                      <button key={i} type="button" disabled={!img} onClick={() => img && setPreview({ title, url: img })} style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '4px 10px', fontSize: '0.76rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '5px', cursor: img ? 'pointer' : 'default' }}>
                        <Award size={13} color="#16a34a" /> {title}
                      </button>
                    );
                  })}
                </div>
              ) : <span style={{ color: '#94a3b8', fontSize: '0.84rem' }}>None uploaded.</span>}
            </div>
          </Panel>
          <Panel icon={MapPin} color="#059669" title="Coverage area">
            <Field label="Service radius">{profile?.workRadius ? `${profile.workRadius} km` : ''}</Field>
            <Field label="Base location">{[profile?.address?.city, profile?.address?.state].filter(Boolean).join(', ')}</Field>
            <div style={{ padding: '10px 0' }}>
              <div style={{ color: '#64748b', fontWeight: 600, fontSize: '0.85rem', marginBottom: '8px' }}>Localities ({profile?.localities?.length || 0})</div>
              {profile?.localities?.length ? (
                <>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {visibleLocalities.map((l, i) => <span key={`${l}-${i}`} style={{ background: '#f1f5f9', color: '#334155', borderRadius: '8px', padding: '4px 10px', fontSize: '0.74rem', fontWeight: 600 }}>{l}</span>)}
                  </div>
                  {profile.localities.length > 12 && (
                    <button type="button" onClick={() => setShowAllLocalities((v) => !v)} style={{ marginTop: '10px', background: 'none', border: 'none', color: '#2563eb', fontWeight: 800, fontSize: '0.78rem', cursor: 'pointer', padding: 0 }}>
                      {showAllLocalities ? 'Show fewer' : `Show all ${profile.localities.length}`}
                    </button>
                  )}
                </>
              ) : <span style={{ color: '#94a3b8', fontSize: '0.84rem' }}>No localities selected.</span>}
            </div>
          </Panel>
        </div>
      )}

      {/* Bank & wallet */}
      {tab === 'bank' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
          <Panel icon={Building} color="#7c3aed" title="Settlement bank account" right={profile && <Pill bg={profile.bank.isVerified ? '#ecfdf5' : '#fffbeb'} color={profile.bank.isVerified ? '#047857' : '#b45309'}>{profile.bank.isVerified ? 'Verified' : 'Not verified'}</Pill>}>
            <Field label="Account holder">{profile?.bank?.accountHolderName}</Field>
            <Field label="Bank">{profile?.bank?.bankName}</Field>
            <Field label="Account number">{profile?.bank?.accountMasked}</Field>
            <Field label="IFSC">{profile?.bank?.ifscCode}</Field>
            <Field label="UPI ID">{profile?.bank?.upiId}</Field>
            <div style={{ marginTop: '10px', fontSize: '0.72rem', color: '#94a3b8' }}>Account number is masked; only the last 4 digits are shown.</div>
          </Panel>
          <Panel icon={Wallet} color="#059669" title="Wallet & onboarding">
            <Field label="Wallet balance">{profile ? inr(profile.wallet.balance) : ''}</Field>
            <Field label="Available to withdraw">{profile ? inr(profile.wallet.withdrawable) : ''}</Field>
            <Field label="Held in escrow">{profile ? inr(profile.wallet.held) : ''}</Field>
            <Field label="Pending settlement">{profile ? inr(profile.wallet.pending) : ''}</Field>
            <Field label="Security deposit">{profile ? inr(profile.wallet.securityDeposit) : ''}</Field>
            <Field label="Onboarding fee">{profile ? (profile.onboarding.feePaid ? `${inr(profile.onboarding.feeAmount)} paid on ${fmtDate(profile.onboarding.paidAt)}` : `${inr(profile.onboarding.feeAmount)} — unpaid`) : ''}</Field>
          </Panel>
        </div>
      )}

      {/* Activity */}
      {tab === 'activity' && (
        <Panel icon={History} color="#475569" title="KYC activity log">
          {profile?.audit?.length ? (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {profile.audit.map((a, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', padding: '11px 0', borderBottom: i === profile.audit.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                  <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: /FAIL|REJECT/i.test(`${a.status}${a.action}`) ? '#ef4444' : '#10b981', marginTop: '6px', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a' }}>{String(a.action).replace(/_/g, ' ')}</div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{a.actorRole?.replace(/_/g, ' ')} · {a.status}{a.reason ? ` · ${a.reason}` : ''}</div>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>{fmtDateTime(a.at)}</div>
                </div>
              ))}
            </div>
          ) : <div style={{ padding: '24px 0', textAlign: 'center', color: '#94a3b8', fontSize: '0.86rem' }}>No KYC activity recorded yet.</div>}
        </Panel>
      )}

      {/* Lightbox */}
      {preview && (
        <div className="modal-overlay" onClick={() => setPreview(null)} style={{ zIndex: 4000, background: 'rgba(0,0,0,0.88)' }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '820px', width: '92%', padding: '18px', borderRadius: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 800 }}>{preview.title}</h4>
              <button type="button" onClick={() => setPreview(null)} aria-label="Close preview" style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer' }}><X size={16} /></button>
            </div>
            <div style={{ background: '#0f172a', borderRadius: '12px', padding: '10px', textAlign: 'center', overflow: 'auto', maxHeight: '72vh' }}>
              <img src={preview.url} alt={preview.title} style={{ maxWidth: '100%', maxHeight: '68vh', objectFit: 'contain' }} />
            </div>
            <div style={{ marginTop: '12px', textAlign: 'right' }}>
              <a href={preview.url} target="_blank" rel="noopener noreferrer" style={{ ...btn('#2563eb', '#fff'), textDecoration: 'none' }}><ExternalLink size={14} /> Open full size</a>
            </div>
          </div>
        </div>
      )}

      {/* Reject single document */}
      {rejectDoc && (
        <Modal title="Reject this document" tone="#b91c1c" onClose={() => setRejectDoc(null)}>
          <form onSubmit={submitDocReject}>
            <textarea rows={3} required minLength={5} maxLength={300} value={docReason} onChange={(e) => setDocReason(e.target.value)} placeholder="e.g. Photo is blurred or ID number is not readable" style={textareaStyle} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
              <button type="button" onClick={() => setRejectDoc(null)} style={btn('#ffffff', '#475569', '#e2e8f0')}>Cancel</button>
              <button type="submit" style={btn('#dc2626', '#fff')}>Reject document</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Reject whole application */}
      {rejectOpen && (
        <Modal title={`Reject KYC for ${name}`} tone="#b91c1c" onClose={() => setRejectOpen(false)}>
          <form onSubmit={submitReject}>
            <textarea rows={3} required minLength={5} maxLength={300} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Explain what the partner must fix before re-applying" style={textareaStyle} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
              <button type="button" onClick={() => setRejectOpen(false)} style={btn('#ffffff', '#475569', '#e2e8f0')}>Cancel</button>
              <button type="submit" disabled={busy} style={btn('#dc2626', '#fff')}>Confirm rejection</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Manual override approval */}
      {overrideOpen && (
        <Modal title="Approve with manual override" tone="#b45309" onClose={() => setOverrideOpen(false)}>
          <p style={{ margin: '0 0 10px', fontSize: '0.84rem', color: '#475569' }}>
            Automated checks are not all verified{failedChecks.length ? `: ${failedChecks.map((c) => c.label).join(', ')}` : ''}. You can still approve after verifying the documents yourself. This is recorded in the audit log under your name.
          </p>
          <form onSubmit={submitOverride}>
            <textarea rows={3} required minLength={10} maxLength={300} value={overrideReason} onChange={(e) => setOverrideReason(e.target.value)} placeholder="Why are you overriding? (min 10 characters)" style={textareaStyle} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
              <button type="button" onClick={() => setOverrideOpen(false)} style={btn('#ffffff', '#475569', '#e2e8f0')}>Cancel</button>
              <button type="submit" disabled={busy} style={btn('#059669', '#fff')}>Approve partner</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default PartnerKycDetailPage;
