import { useEffect, useMemo, useState } from 'react';
import { Briefcase, BadgeCheck, Clock, ShieldX, Search, ChevronLeft, ChevronRight, X, Mail, Phone, MapPin, Wallet, Star, UserPlus, Wrench } from 'lucide-react';

const PAGE_SIZE = 10;

const KYC = {
  approved: { label: 'Approved', bg: '#ecfdf5', color: '#047857', border: '#a7f3d0' },
  pending: { label: 'Pending', bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
  rejected: { label: 'Rejected', bg: '#fef2f2', color: '#b91c1c', border: '#fecaca' },
};
const ACCOUNT = {
  active: null,
  blocked: { label: 'Blocked', bg: '#fef2f2', color: '#b91c1c' },
  suspended: { label: 'Suspended', bg: '#fffbeb', color: '#b45309' },
  deleted: { label: 'Deleted', bg: '#f1f5f9', color: '#475569' },
};

const SORTS = [
  { id: 'newest', label: 'Newest first' },
  { id: 'rating', label: 'Top rated' },
  { id: 'jobs', label: 'Most jobs' },
  { id: 'earnings', label: 'Highest earnings' },
  { id: 'name', label: 'Name A–Z' },
];

const card = { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)' };
const inputStyle = { padding: '8px 11px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '0.84rem', color: '#0f172a', background: '#ffffff' };
const headRow = { background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' };
const td = { padding: '12px 10px', fontSize: '0.84rem', color: '#334155', verticalAlign: 'middle' };

const OBJECT_ID = /^[0-9a-fA-F]{24}$/;
const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');
// A raw 24-hex value means the city record no longer exists, so never show it as a name
const cityOf = (p) => {
  const c = [p.city, p.assignedCity].find((v) => typeof v === 'string' && v && !OBJECT_ID.test(v));
  return c || p.assignedCity?.name || 'City not set';
};
const kycOf = (p) => (KYC[p.kycStatus] ? p.kycStatus : 'pending');
const categoryOf = (p) => (typeof p.category === 'string' && p.category && !OBJECT_ID.test(p.category) ? p.category : 'Not set');
const ratingOf = (p) => (p.totalRatings > 0 ? Number(p.averageRating) : null);
const initials = (name) => String(name || '?').trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || '?';
const jobBreakdown = (st = {}) => {
  const parts = [[st.completed, 'completed'], [st.cancelled, 'cancelled'], [st.open, 'open']].filter(([n]) => n > 0).map(([n, l]) => `${n} ${l}`);
  return parts.length ? parts.join(' · ') : 'No jobs yet';
};

const Avatar = ({ p, size = 38 }) => (
  p.profileImage
    ? <img src={p.profileImage} alt={p.name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '1px solid #e2e8f0' }} />
    : <div style={{ width: size, height: size, borderRadius: '50%', background: '#f5f3ff', color: '#6d28d9', border: '1px solid #ddd6fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: size * 0.36, flexShrink: 0 }}>{initials(p.name)}</div>
);

const KycPill = ({ status }) => {
  const s = KYC[status];
  return <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '3px 10px', borderRadius: '9999px', background: s.bg, color: s.color, border: `1px solid ${s.border}`, whiteSpace: 'nowrap' }}>● {s.label}</span>;
};

const AccountTag = ({ status }) => {
  const a = ACCOUNT[status];
  if (!a) return null;
  return <span style={{ marginLeft: '6px', fontSize: '0.66rem', fontWeight: 800, padding: '2px 8px', borderRadius: '6px', background: a.bg, color: a.color, textTransform: 'uppercase' }}>{a.label}</span>;
};

const Rating = ({ p }) => {
  const r = ratingOf(p);
  if (r === null) return <span style={{ color: '#94a3b8' }}>No ratings</span>;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 800, color: '#0f172a' }}>
      <Star size={13} color="#f59e0b" fill="#f59e0b" /> {r.toFixed(1)} <span style={{ fontWeight: 600, color: '#94a3b8', fontSize: '0.74rem' }}>({p.totalRatings})</span>
    </span>
  );
};

const StatCard = ({ icon: Icon, color, bg, label, value }) => (
  <div style={{ ...card, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={20} color={color} />
    </div>
    <div>
      <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px', marginTop: '2px' }}>{label}</div>
    </div>
  </div>
);

const Th = ({ children, right }) => <th style={{ padding: '11px 10px', fontWeight: 800, whiteSpace: 'nowrap', textAlign: right ? 'right' : 'left' }}>{children}</th>;

const Detail = ({ icon: Icon, label, children }) => (
  <div style={{ display: 'flex', gap: '12px', padding: '11px 0', borderBottom: '1px solid #f1f5f9' }}>
    <Icon size={16} color="#94a3b8" style={{ flexShrink: 0, marginTop: '2px' }} />
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{label}</div>
      <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a', overflowWrap: 'anywhere' }}>{children}</div>
    </div>
  </div>
);

const PartnerModal = ({ p, onClose }) => {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  const st = p.jobStats || {};
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" role="dialog" aria-modal="true" aria-label="Partner details" onClick={(e) => e.stopPropagation()} style={{ padding: '26px', maxWidth: '480px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
            <Avatar p={p} size={56} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 900, fontSize: '1.15rem', color: '#0f172a' }}>{p.name}</div>
              {p.agencyName && <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{p.agencyName}</div>}
              <div style={{ marginTop: '6px' }}><KycPill status={kycOf(p)} /><AccountTag status={p.status} /></div>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '50%', color: '#64748b', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}><X size={18} /></button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '8px' }}>
          {[['Jobs', st.jobs || 0], ['Completed', st.completed || 0], ['Cancelled', st.cancelled || 0], ['Earned', money(st.earnings)]].map(([l, v]) => (
            <div key={l} style={{ padding: '12px 6px', background: '#f8fafc', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a' }}>{v}</div>
              <div style={{ fontSize: '0.66rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>{l}</div>
            </div>
          ))}
        </div>

        <Detail icon={Mail} label="Email">{p.email || '—'}</Detail>
        <Detail icon={Phone} label="Phone">{p.phone || '—'}</Detail>
        <Detail icon={MapPin} label="City">{cityOf(p)}</Detail>
        <Detail icon={Wrench} label="Skill category">{categoryOf(p)}{p.experience ? ` · ${p.experience} experience` : ''}</Detail>
        <Detail icon={Star} label="Customer rating"><Rating p={p} /></Detail>
        <Detail icon={Wallet} label="Wallet balance">{money(p.walletBalance)}</Detail>
        <Detail icon={UserPlus} label="Joined">{fmtDate(p.createdAt)}</Detail>
        <div style={{ marginTop: '12px', fontSize: '0.72rem', color: '#94a3b8' }}>ID <span style={{ fontFamily: 'monospace' }}>{p._id}</span></div>
      </div>
    </div>
  );
};

const SuperAdminPartnersView = ({ partners = [] }) => {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('all');
  const [kyc, setKyc] = useState('all');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput.trim().toLowerCase()); setPage(1); }, 250);
    return () => clearTimeout(t);
  }, [searchInput]);

  const cities = useMemo(() => [...new Set(partners.map(cityOf))].sort(), [partners]);
  const categories = useMemo(() => [...new Set(partners.map(categoryOf))].sort(), [partners]);

  const summary = useMemo(() => ({
    total: partners.length,
    approved: partners.filter((p) => kycOf(p) === 'approved').length,
    pending: partners.filter((p) => kycOf(p) === 'pending').length,
    rejected: partners.filter((p) => kycOf(p) === 'rejected').length,
  }), [partners]);

  const rows = useMemo(() => {
    const list = partners.filter((p) => {
      if (city !== 'all' && cityOf(p) !== city) return false;
      if (kyc !== 'all' && kycOf(p) !== kyc) return false;
      if (category !== 'all' && categoryOf(p) !== category) return false;
      if (!search) return true;
      return [p.name, p.agencyName, p.email, p.phone].some((v) => String(v || '').toLowerCase().includes(search));
    });
    const by = {
      newest: (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
      rating: (a, b) => (ratingOf(b) ?? -1) - (ratingOf(a) ?? -1),
      jobs: (a, b) => (b.jobStats?.jobs || 0) - (a.jobStats?.jobs || 0),
      earnings: (a, b) => (b.jobStats?.earnings || 0) - (a.jobStats?.earnings || 0),
      name: (a, b) => String(a.name || '').localeCompare(String(b.name || '')),
    };
    return [...list].sort(by[sort]);
  }, [partners, city, kyc, category, search, sort]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const visible = rows.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const selected = selectedId ? partners.find((p) => p._id === selectedId) : null;
  const filtered = search || city !== 'all' || kyc !== 'all' || category !== 'all';
  const pick = (setter) => (e) => { setter(e.target.value); setPage(1); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        <StatCard icon={Briefcase} color="#2563eb" bg="#eff6ff" label="Total partners" value={summary.total} />
        <StatCard icon={BadgeCheck} color="#059669" bg="#ecfdf5" label="KYC approved" value={summary.approved} />
        <StatCard icon={Clock} color="#d97706" bg="#fffbeb" label="KYC pending" value={summary.pending} />
        <StatCard icon={ShieldX} color="#dc2626" bg="#fef2f2" label="KYC rejected" value={summary.rejected} />
      </div>

      <div style={{ ...card, padding: '20px', minWidth: 0 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
            Partners <span style={{ color: '#94a3b8', fontWeight: 600 }}>({filtered ? `${rows.length} of ${partners.length}` : partners.length})</span>
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <label style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
              <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '10px' }} />
              <input type="search" placeholder="Search name, email or phone" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} style={{ ...inputStyle, paddingLeft: '30px', width: '220px' }} />
            </label>
            <select aria-label="KYC filter" value={kyc} onChange={pick(setKyc)} style={inputStyle}>
              <option value="all">All KYC</option>
              {Object.entries(KYC).map(([id, k]) => <option key={id} value={id}>{k.label}</option>)}
            </select>
            <select aria-label="City filter" value={city} onChange={pick(setCity)} style={inputStyle}>
              <option value="all">All cities</option>
              {cities.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select aria-label="Category filter" value={category} onChange={pick(setCategory)} style={inputStyle}>
              <option value="all">All categories</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select aria-label="Sort partners" value={sort} onChange={(e) => setSort(e.target.value)} style={inputStyle}>
              {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
        </div>

        <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
          <table style={{ width: '100%', minWidth: '900px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={headRow}>
                <Th>#</Th><Th>Partner</Th><Th>Contact</Th><Th>Category &amp; city</Th><Th right>Jobs</Th><Th>Rating</Th><Th right>Earned</Th><Th>KYC</Th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: '36px 16px', textAlign: 'center', color: '#64748b', fontSize: '0.88rem' }}>{partners.length ? 'No partners match these filters.' : 'No partners registered yet.'}</td></tr>
              ) : visible.map((p, i) => {
                const st = p.jobStats || {};
                return (
                  <tr key={p._id} onClick={() => setSelectedId(p._id)} tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setSelectedId(p._id)} style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                    <td style={{ ...td, width: '48px', color: '#94a3b8', fontWeight: 700 }}>{(current - 1) * PAGE_SIZE + i + 1}</td>
                    <td style={td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Avatar p={p} />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 800, color: '#0f172a' }}>{p.name}<AccountTag status={p.status} /></div>
                          <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Joined {fmtDate(p.createdAt)}</div>
                        </div>
                      </div>
                    </td>
                    <td style={td}>
                      <div style={{ fontWeight: 600 }}>{p.email || '—'}</div>
                      <div style={{ fontSize: '0.76rem', color: '#64748b' }}>{p.phone || 'No phone'}</div>
                    </td>
                    <td style={td}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{categoryOf(p)}</div>
                      <div style={{ fontSize: '0.76rem', color: cityOf(p) === 'City not set' ? '#b45309' : '#2563eb', fontWeight: 600 }}>{cityOf(p)}</div>
                    </td>
                    <td style={{ ...td, textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ fontWeight: 800, color: '#0f172a' }}>{st.jobs || 0}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{jobBreakdown(st)}</div>
                    </td>
                    <td style={{ ...td, whiteSpace: 'nowrap' }}><Rating p={p} /></td>
                    <td style={{ ...td, textAlign: 'right', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap' }}>{money(st.earnings)}</td>
                    <td style={{ ...td, whiteSpace: 'nowrap' }}><KycPill status={kycOf(p)} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {rows.length > PAGE_SIZE && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginTop: '14px', fontSize: '0.8rem', color: '#64748b', flexWrap: 'wrap' }}>
            <span>Showing {(current - 1) * PAGE_SIZE + 1}–{Math.min(current * PAGE_SIZE, rows.length)} of {rows.length}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Page {current} of {totalPages}</span>
              <button type="button" aria-label="Previous page" disabled={current <= 1} onClick={() => setPage(current - 1)} style={{ ...inputStyle, padding: '6px 8px', cursor: 'pointer', opacity: current <= 1 ? 0.5 : 1 }}><ChevronLeft size={14} /></button>
              <button type="button" aria-label="Next page" disabled={current >= totalPages} onClick={() => setPage(current + 1)} style={{ ...inputStyle, padding: '6px 8px', cursor: 'pointer', opacity: current >= totalPages ? 0.5 : 1 }}><ChevronRight size={14} /></button>
            </div>
          </div>
        )}
      </div>

      {selected && <PartnerModal p={selected} onClose={() => setSelectedId(null)} />}
    </div>
  );
};

export default SuperAdminPartnersView;
