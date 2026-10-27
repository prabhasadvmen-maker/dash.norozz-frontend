import React, { useCallback, useEffect, useState } from 'react';
import {
  UserPlus, Search, Loader2, X, FileText, CheckCircle2, XCircle, ExternalLink, ShieldCheck, ChevronLeft, ChevronRight
} from 'lucide-react';
import { superAdminService } from '../../services/superAdmin.service.js';
import { toast } from '../../utils/toast.js';
import './SuperAdminPartnerHiringView.css';

const CATEGORIES = ['Driver Care', 'Nanny Care', 'Baby Care', 'Personal Care'];
const STATUS_CLASS = { Pending: 'pending', 'Under Review': 'review', Approved: 'approved', Rejected: 'rejected' };

const STAT_CARDS = [
  { key: 'total', label: 'Total Applications', status: '' },
  { key: 'pending', label: 'Pending', status: 'Pending' },
  { key: 'underReview', label: 'Under Review', status: 'Under Review' },
  { key: 'approved', label: 'Approved', status: 'Approved' },
  { key: 'rejected', label: 'Rejected', status: 'Rejected' }
];

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');
const fmtDateTime = (d) => (d ? new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—');
const fmtAddress = (a) => (a ? `${a.house}, ${a.street}, ${a.city}, ${a.state} - ${a.pin}` : '—');
const isImage = (f) => f?.mimeType?.startsWith('image/');
const errMsg = (err, fallback) => err?.response?.data?.message || err?.message || fallback;

const StatusBadge = ({ status }) => <span className={`pha-badge ${STATUS_CLASS[status] || 'pending'}`}>{status}</span>;

const Doc = ({ label, file }) => {
  if (!file) return null;
  return (
    <a className="pha-doc" href={file.url} target="_blank" rel="noreferrer">
      <div className="pha-doc-thumb">{isImage(file) ? <img src={file.url} alt={label} /> : <FileText size={34} />}</div>
      <div className="pha-doc-meta"><span>{label}</span><ExternalLink size={14} /></div>
    </a>
  );
};

const KV = ({ label, children, full }) => (
  <div className={full ? 'full' : ''}><span>{label}</span><b>{children || '—'}</b></div>
);

const ApplicationDrawer = ({ id, onClose, onChanged }) => {
  const [app, setApp] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    superAdminService.getHiringApplication(id)
      .then((res) => {
        if (!alive) return;
        const data = res.data?.data || res.data;
        setApp(data);
        setRemarks(data.reviewRemarks || '');
      })
      .catch((err) => { toast.error(errMsg(err, 'Failed to load application')); onClose(); });
    return () => { alive = false; };
  }, [id, onClose]);

  const review = async (status) => {
    if (status === 'Rejected' && !remarks.trim()) {
      toast.error('Please add remarks before rejecting');
      return;
    }
    setBusy(true);
    try {
      const res = await superAdminService.reviewHiringApplication(id, { status, remarks });
      setApp(res.data?.data || res.data);
      toast.success(`Application marked as ${status}`);
      onChanged();
    } catch (err) {
      toast.error(errMsg(err, 'Failed to update application'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="pha-overlay" onClick={onClose}>
      <div className="pha-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="pha-drawer-head">
          <h2>Application Details</h2>
          <button type="button" className="pha-close" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>

        {!app ? (
          <div className="pha-empty"><Loader2 className="spin" size={26} /></div>
        ) : (
          <>
            <div className="pha-drawer-body">
              <div className="pha-hero">
                <img src={app.profilePhoto?.url} alt={app.fullName} />
                <div>
                  <h3>{app.fullName}</h3>
                  <StatusBadge status={app.reviewStatus} /> <span className="pha-badge approved">{app.serviceCategory}</span>
                </div>
              </div>

              <div className="pha-sec">
                <h4>Contact & Personal</h4>
                <div className="pha-kv">
                  <KV label="Mobile">+91 {app.mobile} {app.isMobileVerified && '✓ OTP verified'}</KV>
                  <KV label="Email">{app.email} {app.isEmailVerified && '✓ OTP verified'}</KV>
                  <KV label="Date of Birth">{fmtDate(app.dob)}</KV>
                  <KV label="Gender">{app.gender}</KV>
                </div>
              </div>

              <div className="pha-sec">
                <h4>Address</h4>
                <div className="pha-kv">
                  <KV label="Current Address" full>{fmtAddress(app.currentAddress)}</KV>
                  <KV label="Permanent Address" full>{app.permanentSameAsCurrent ? 'Same as current address' : fmtAddress(app.permanentAddress)}</KV>
                </div>
              </div>

              <div className="pha-sec">
                <h4>Service Details</h4>
                <div className="pha-kv">
                  <KV label="Experience">{app.experienceYears} year(s)</KV>
                  <KV label="Preferred Work Type">{app.preferredWorkType}</KV>
                  <KV label="Skills" full>{app.skills?.map((s) => <span className="pha-tag" key={s}>{s}</span>)}</KV>
                </div>
              </div>

              <div className="pha-sec">
                <h4>Documents · {app.identityProofType}</h4>
                <div className="pha-docs">
                  <Doc label="Identity Proof" file={app.identityProof} />
                  <Doc label="Address Proof" file={app.addressProof} />
                  <Doc label="Driving Licence" file={app.drivingLicence} />
                </div>
              </div>

              <div className="pha-sec">
                <h4>Payment & Consent</h4>
                <div className="pha-kv">
                  <KV label="Registration Fee">₹{app.registrationFee} · {app.paymentStatus}</KV>
                  <KV label="Payment Method">{app.paymentMethod}</KV>
                  <KV label="Receipt No.">{app.receiptNumber}</KV>
                  <KV label="Paid On">{fmtDateTime(app.paidAt)}</KV>
                  <KV label="Consent" full>
                    {app.consent?.termsAccepted && app.consent?.privacyAccepted && app.consent?.refundPolicyAccepted
                      ? `Terms, Privacy & Refund Policy accepted on ${fmtDateTime(app.consent.acceptedAt)}`
                      : 'Incomplete'}
                  </KV>
                </div>
              </div>
            </div>

            <div className="pha-review">
              <textarea
                placeholder="Verification remarks (required when rejecting)"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
              <div className="pha-actions">
                <button type="button" className="pha-btn" disabled={busy || app.reviewStatus === 'Under Review'} onClick={() => review('Under Review')}>
                  <ShieldCheck size={15} /> Mark Under Review
                </button>
                <button type="button" className="pha-btn success" disabled={busy || app.reviewStatus === 'Approved'} onClick={() => review('Approved')}>
                  <CheckCircle2 size={15} /> Approve
                </button>
                <button type="button" className="pha-btn danger" disabled={busy || app.reviewStatus === 'Rejected'} onClick={() => review('Rejected')}>
                  <XCircle size={15} /> Reject
                </button>
              </div>
              {app.reviewedAt && <span className="pha-muted">Last reviewed {fmtDateTime(app.reviewedAt)}</span>}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const SuperAdminPartnerHiringView = () => {
  const [stats, setStats] = useState({});
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState(null);

  const loadStats = useCallback(async () => {
    try {
      const res = await superAdminService.getHiringStats();
      setStats(res.data?.data || res.data || {});
    } catch { /* stats are non-critical */ }
  }, []);

  const loadList = useCallback(async () => {
    try {
      setLoading(true);
      const res = await superAdminService.getHiringApplications({
        status: status || undefined,
        category: category || undefined,
        search: query || undefined,
        page,
        limit: 15
      });
      const data = res.data?.data || res.data || {};
      setItems(data.items || []);
      setMeta({ page: data.page || 1, pages: data.pages || 1, total: data.total || 0 });
    } catch (err) {
      toast.error(errMsg(err, 'Failed to load applications'));
    } finally {
      setLoading(false);
    }
  }, [status, category, query, page]);

  useEffect(() => { loadStats(); }, [loadStats]);
  useEffect(() => { loadList(); }, [loadList]);

  const refresh = () => { loadStats(); loadList(); };
  const closeDrawer = useCallback(() => setSelectedId(null), []);

  const applySearch = (e) => { e.preventDefault(); setPage(1); setQuery(search.trim()); };
  const pickStatus = (s) => { setStatus(s); setPage(1); };

  return (
    <div className="pha">
      <div className="pha-head">
        <h1><UserPlus size={28} color="#2563eb" /> Partner Hiring</h1>
        <p>Review registrations submitted from the public hiring form, verify documents and approve or reject applicants.</p>
      </div>

      <div className="pha-stats">
        {STAT_CARDS.map((c) => (
          <button key={c.key} type="button" className={`pha-stat${status === c.status ? ' on' : ''}`} onClick={() => pickStatus(c.status)}>
            <small>{c.label}</small>
            <b>{stats[c.key] ?? 0}</b>
          </button>
        ))}
      </div>

      <div className="pha-bar">
        <form className="pha-search" onSubmit={applySearch}>
          <Search size={16} />
          <input className="pha-input" placeholder="Search name, mobile, email or receipt no." value={search} onChange={(e) => setSearch(e.target.value)} />
        </form>
        <select className="pha-select" value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="pha-table-wrap">
        <table className="pha-table">
          <thead>
            <tr>
              <th>Applicant</th><th>Category</th><th>Experience</th><th>Applied On</th><th>Status</th><th />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6}><div className="pha-empty"><Loader2 className="spin" size={24} /></div></td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={6}><div className="pha-empty">No applications found.</div></td></tr>
            ) : items.map((a) => (
              <tr key={a._id}>
                <td>
                  <div className="pha-person">
                    <img className="pha-avatar" src={a.profilePhoto?.url} alt="" />
                    <div><b>{a.fullName}</b><small>+91 {a.mobile} · {a.email}</small></div>
                  </div>
                </td>
                <td>{a.serviceCategory}<div className="pha-muted">{a.preferredWorkType}</div></td>
                <td>{a.experienceYears} yr</td>
                <td>{fmtDate(a.paidAt || a.createdAt)}</td>
                <td><StatusBadge status={a.reviewStatus} /></td>
                <td style={{ textAlign: 'right' }}>
                  <button type="button" className="pha-btn primary" onClick={() => setSelectedId(a._id)}>Review</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pha-pager">
        <span>{meta.total} application(s)</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button type="button" className="pha-btn" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft size={15} /></button>
          <span>Page {meta.page} of {meta.pages}</span>
          <button type="button" className="pha-btn" disabled={page >= meta.pages} onClick={() => setPage((p) => p + 1)}><ChevronRight size={15} /></button>
        </div>
      </div>

      {selectedId && <ApplicationDrawer id={selectedId} onClose={closeDrawer} onChanged={refresh} />}
    </div>
  );
};

export default SuperAdminPartnerHiringView;
