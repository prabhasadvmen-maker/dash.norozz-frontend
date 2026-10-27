import { useMemo, useState } from 'react';
import { ShieldCheck, CheckCircle2, Power, Search, ChevronRight, ClipboardCheck } from 'lucide-react';
import { useCityAdmin } from '../../hooks/useCityAdmin.js';
import PartnerKycDetailPage from './PartnerKycDetailPage';

const REQUIRED_DOCS = ['aadhaarFront', 'aadhaarBack', 'panDoc', 'passportPhoto', 'bankPassbookDoc'];

const card = {
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '16px',
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
};

const KYC_BADGE = {
  approved: { label: 'Approved', bg: '#ecfdf5', color: '#047857' },
  pending: { label: 'Pending review', bg: '#fffbeb', color: '#b45309' },
  rejected: { label: 'Rejected', bg: '#fef2f2', color: '#b91c1c' },
};

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
];

const initials = (name = '') => name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || 'P';
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');

const docProgress = (p) => {
  const statuses = p.documents?.statuses || {};
  const uploaded = REQUIRED_DOCS.filter((k) => p.documents?.[k]).length;
  const approved = REQUIRED_DOCS.filter((k) => statuses[k] === 'approved').length;
  const rejected = REQUIRED_DOCS.filter((k) => statuses[k] === 'rejected').length;
  return { uploaded, approved, rejected, total: REQUIRED_DOCS.length };
};

const Th = ({ children, w }) => (
  <th style={{ padding: '12px 10px', fontWeight: 800, whiteSpace: 'nowrap', textAlign: 'left', width: w }}>{children}</th>
);

const PartnerKycManagement = ({ assignedCity = 'Delhi NCR' }) => {
  const { partners, approvePartner, rejectPartner, updateDocumentStatus, suspendPartner, activatePartner } = useCityAdmin(assignedCity);
  const [selectedId, setSelectedId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState(null);

  // Always read the live record so approvals made in the detail page show up immediately
  const selectedPartner = useMemo(() => partners.find((p) => p._id === selectedId) || null, [partners, selectedId]);

  const counts = useMemo(() => {
    const c = { all: partners.length, pending: 0, approved: 0, rejected: 0 };
    partners.forEach((p) => {
      const k = (p.kycStatus || 'pending').toLowerCase();
      if (c[k] !== undefined) c[k] += 1;
    });
    return c;
  }, [partners]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const order = { pending: 0, rejected: 1, approved: 2 };
    return partners
      .filter((p) => filter === 'all' || (p.kycStatus || 'pending').toLowerCase() === filter)
      .filter((p) => !q || [p.name, p.email, p.phone, p.agencyName, p.category, p.userId].some((v) => String(v || '').toLowerCase().includes(q)))
      .sort((a, b) => (order[(a.kycStatus || 'pending').toLowerCase()] ?? 3) - (order[(b.kycStatus || 'pending').toLowerCase()] ?? 3) || new Date(b.createdAt) - new Date(a.createdAt));
  }, [partners, filter, search]);

  const run = async (id, fn) => {
    setBusyId(id);
    try {
      await fn();
    } catch {
      // the hook already surfaces the API error as a toast
    } finally {
      setBusyId(null);
    }
  };

  const handleApprove = (partnerId) => approvePartner(partnerId);
  const handleReject = (partnerId, reason) => rejectPartner({ id: partnerId, reason });

  const handleToggleSuspend = async (partner) => {
    const isSuspended = partner.status === 'suspended' || partner.status === 'blocked';
    const verb = isSuspended ? 'activate' : 'suspend';
    if (!window.confirm(`Are you sure you want to ${verb} ${partner.name}?`)) return;
    await (isSuspended ? activatePartner(partner._id) : suspendPartner(partner._id));
  };

  if (selectedPartner) {
    return (
      <PartnerKycDetailPage
        partner={selectedPartner}
        assignedCity={assignedCity}
        onBack={() => setSelectedId(null)}
        onApprove={handleApprove}
        onReject={handleReject}
        onToggleSuspend={handleToggleSuspend}
        onUpdateDocumentStatus={(id, docKey, status, rejectionReason) => updateDocumentStatus({ id, docKey, status, rejectionReason })}
      />
    );
  }

  return (
    <div style={{ ...card, padding: '20px', minWidth: 0 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={21} color="#2563eb" /> Partner KYC & Onboarding
          </h3>
          <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '3px 0 0' }}>
            Review identity documents and approve technicians for {assignedCity}.
          </p>
        </div>
        <div style={{ position: 'relative' }}>
          <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, phone, email…"
            maxLength={60}
            style={{ padding: '8px 12px 8px 32px', width: '250px', maxWidth: '100%', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '0.83rem', color: '#0f172a' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
        {FILTERS.map((f) => {
          const active = filter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              style={{ padding: '6px 14px', borderRadius: '9999px', border: `1px solid ${active ? '#2563eb' : '#e2e8f0'}`, background: active ? '#2563eb' : '#ffffff', color: active ? '#ffffff' : '#475569', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              {f.label}
              <span style={{ background: active ? 'rgba(255,255,255,0.22)' : '#f1f5f9', color: active ? '#fff' : '#64748b', borderRadius: '9999px', padding: '0 7px', fontSize: '0.7rem' }}>{counts[f.id]}</span>
            </button>
          );
        })}
      </div>

      <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
        <table style={{ width: '100%', minWidth: '760px', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <Th w="48px">#</Th>
              <Th>Partner</Th>
              <Th>Category</Th>
              <Th>Contact</Th>
              <Th w="120px">Documents</Th>
              <Th>KYC status</Th>
              <Th w="200px">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '40px 16px', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
                  {partners.length === 0 ? `No service partners registered in ${assignedCity} yet.` : 'No partners match your filters.'}
                </td>
              </tr>
            ) : (
              rows.map((p, idx) => {
                const status = (p.kycStatus || 'pending').toLowerCase();
                const badge = KYC_BADGE[status] || KYC_BADGE.pending;
                const isSuspended = p.status === 'suspended' || p.status === 'blocked';
                const prog = docProgress(p);
                const busy = busyId === p._id;
                const cell = { padding: '13px 10px', fontSize: '0.83rem', color: '#334155', verticalAlign: 'middle' };
                return (
                  <tr
                    key={p._id}
                    onClick={() => setSelectedId(p._id)}
                    style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer', transition: 'background-color .15s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ ...cell, color: '#94a3b8', fontWeight: 700 }}>{idx + 1}</td>
                    <td style={cell}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '11px', minWidth: '190px' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg,#2563eb,#7c3aed)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.82rem', flexShrink: 0, overflow: 'hidden' }}>
                          {p.profileImage ? <img src={p.profileImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials(p.name)}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 800, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '170px' }}>{p.name}</div>
                          <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>{p.userId || `ID …${String(p._id).slice(-6)}`} · {fmtDate(p.createdAt)}</div>
                        </div>
                      </div>
                    </td>
                    <td style={cell}>
                      <span style={{ display: 'inline-block', background: '#eff6ff', color: '#1d4ed8', borderRadius: '8px', padding: '3px 10px', fontSize: '0.72rem', fontWeight: 800, maxWidth: '170px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.category}
                      </span>
                    </td>
                    <td style={cell}>
                      <div style={{ fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}>{p.phone || '—'}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', maxWidth: '190px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.email || '—'}</div>
                    </td>
                    <td style={cell}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, marginBottom: '4px', whiteSpace: 'nowrap', color: prog.rejected ? '#b91c1c' : '#475569' }} title={`${prog.uploaded} of ${prog.total} uploaded`}>
                        {prog.approved}/{prog.total} approved
                      </div>
                      <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden', display: 'flex' }}>
                        <div style={{ width: `${(prog.approved / prog.total) * 100}%`, background: '#10b981' }} />
                        <div style={{ width: `${(prog.rejected / prog.total) * 100}%`, background: '#ef4444' }} />
                      </div>
                    </td>
                    <td style={cell}>
                      <span style={{ padding: '4px 11px', borderRadius: '9999px', background: badge.bg, color: badge.color, fontSize: '0.72rem', fontWeight: 800, whiteSpace: 'nowrap' }}>{badge.label}</span>
                      {isSuspended && <div style={{ fontSize: '0.68rem', color: '#dc2626', fontWeight: 800, marginTop: '4px' }}>ACCOUNT SUSPENDED</div>}
                    </td>
                    <td style={cell} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedId(p._id)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 11px', borderRadius: '8px', border: '1px solid #bfdbfe', background: '#eff6ff', color: '#1d4ed8', fontSize: '0.76rem', fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap' }}
                        >
                          <ClipboardCheck size={13} /> Review <ChevronRight size={12} />
                        </button>
                        {status !== 'approved' && (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => run(p._id, () => handleApprove(p._id))}
                            title="Approve KYC"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 10px', borderRadius: '8px', border: 'none', background: '#059669', color: '#fff', fontSize: '0.76rem', fontWeight: 800, cursor: busy ? 'wait' : 'pointer', opacity: busy ? 0.6 : 1 }}
                          >
                            <CheckCircle2 size={13} /> Approve
                          </button>
                        )}
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => run(p._id, () => handleToggleSuspend(p))}
                          title={isSuspended ? 'Activate partner' : 'Suspend partner'}
                          aria-label={isSuspended ? 'Activate partner' : 'Suspend partner'}
                          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', borderRadius: '8px', border: `1px solid ${isSuspended ? '#a7f3d0' : '#e2e8f0'}`, background: isSuspended ? '#ecfdf5' : '#ffffff', color: isSuspended ? '#047857' : '#64748b', cursor: 'pointer' }}
                        >
                          <Power size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PartnerKycManagement;
