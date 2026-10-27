import { useEffect, useMemo, useState } from 'react';
import { Users, UserCheck, UserPlus, UserX, Search, ChevronLeft, ChevronRight, X, Mail, Phone, MapPin, Wallet } from 'lucide-react';
import { resolveMediaUrl } from '../../utils/mediaUrl';

const PAGE_SIZE = 10;

const STATUS = {
  active: { label: 'Active', bg: '#ecfdf5', color: '#047857', border: '#a7f3d0' },
  blocked: { label: 'Blocked', bg: '#fef2f2', color: '#b91c1c', border: '#fecaca' },
  suspended: { label: 'Suspended', bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
  deleted: { label: 'Deleted', bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' },
};

const SORTS = [
  { id: 'newest', label: 'Newest first' },
  { id: 'bookings', label: 'Most bookings' },
  { id: 'spent', label: 'Highest spend' },
  { id: 'name', label: 'Name A–Z' },
];

const card = { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)' };
const inputStyle = { padding: '8px 11px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '0.84rem', color: '#0f172a', background: '#ffffff' };
const headRow = { background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' };
const td = { padding: '12px 10px', fontSize: '0.84rem', color: '#334155', verticalAlign: 'middle' };

const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');
const cityOf = (c) => (typeof c.city === 'string' && c.city) || (typeof c.assignedCity === 'string' && c.assignedCity) || c.assignedCity?.name || '—';
const statusOf = (c) => (STATUS[c.status] ? c.status : 'active');
// "2 completed · 3 cancelled · 1 open" — only the non-zero parts, so the numbers always add up to the total
const bookingBreakdown = (st) => {
  const parts = [[st.completed, 'completed'], [st.cancelled, 'cancelled'], [st.open, 'open']].filter(([n]) => n > 0).map(([n, l]) => `${n} ${l}`);
  return parts.length ? parts.join(' · ') : 'No bookings';
};
const initials = (name) => String(name || '?').trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || '?';

const Avatar = ({ c, size = 38 }) => (
  c.profileImage
    ? <img src={resolveMediaUrl(c.profileImage)} alt={c.name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '1px solid #e2e8f0' }} />
    : <div style={{ width: size, height: size, borderRadius: '50%', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: size * 0.36, flexShrink: 0 }}>{initials(c.name)}</div>
);

const StatusPill = ({ status }) => {
  const s = STATUS[status];
  return <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '3px 10px', borderRadius: '9999px', background: s.bg, color: s.color, border: `1px solid ${s.border}`, whiteSpace: 'nowrap' }}>● {s.label}</span>;
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

const CustomerModal = ({ c, onClose }) => {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  const st = c.bookingStats || {};
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" role="dialog" aria-modal="true" aria-label="Customer details" onClick={(e) => e.stopPropagation()} style={{ padding: '26px', maxWidth: '460px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
            <Avatar c={c} size={56} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 900, fontSize: '1.15rem', color: '#0f172a' }}>{c.name}</div>
              <div style={{ marginTop: '6px' }}><StatusPill status={statusOf(c)} /></div>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '50%', color: '#64748b', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}><X size={18} /></button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '8px' }}>
          {[['Bookings', st.bookings || 0], ['Completed', st.completed || 0], ['Cancelled', st.cancelled || 0], ['Total spent', money(st.totalSpent)]].map(([l, v]) => (
            <div key={l} style={{ padding: '12px', background: '#f8fafc', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a' }}>{v}</div>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>{l}</div>
            </div>
          ))}
        </div>

        <Detail icon={Mail} label="Email">{c.email || '—'}</Detail>
        <Detail icon={Phone} label="Phone">{c.phone || '—'}</Detail>
        <Detail icon={MapPin} label="City">{cityOf(c)}</Detail>
        <Detail icon={Wallet} label="Wallet balance">{money(c.walletBalance)}</Detail>
        <Detail icon={UserPlus} label="Joined">{fmtDate(c.createdAt)}</Detail>
        <Detail icon={UserCheck} label="Last booking">{fmtDate(st.lastBookingAt)}</Detail>
        <div style={{ marginTop: '12px', fontSize: '0.72rem', color: '#94a3b8' }}>ID <span style={{ fontFamily: 'monospace' }}>{c._id}</span></div>
      </div>
    </div>
  );
};

const SuperAdminCustomersView = ({ customers = [] }) => {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('all');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput.trim().toLowerCase()); setPage(1); }, 250);
    return () => clearTimeout(t);
  }, [searchInput]);

  const cities = useMemo(() => [...new Set(customers.map(cityOf).filter((c) => c !== '—'))].sort(), [customers]);

  const summary = useMemo(() => {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    return {
      total: customers.length,
      active: customers.filter((c) => statusOf(c) === 'active').length,
      newThisMonth: customers.filter((c) => c.createdAt && new Date(c.createdAt) >= monthStart).length,
      restricted: customers.filter((c) => ['blocked', 'suspended'].includes(statusOf(c))).length,
    };
  }, [customers]);

  const rows = useMemo(() => {
    const list = customers.filter((c) => {
      if (city !== 'all' && cityOf(c) !== city) return false;
      if (status !== 'all' && statusOf(c) !== status) return false;
      if (!search) return true;
      return [c.name, c.email, c.phone].some((v) => String(v || '').toLowerCase().includes(search));
    });
    const by = {
      newest: (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
      bookings: (a, b) => (b.bookingStats?.bookings || 0) - (a.bookingStats?.bookings || 0),
      spent: (a, b) => (b.bookingStats?.totalSpent || 0) - (a.bookingStats?.totalSpent || 0),
      name: (a, b) => String(a.name || '').localeCompare(String(b.name || '')),
    };
    return [...list].sort(by[sort]);
  }, [customers, city, status, search, sort]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const visible = rows.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const selected = selectedId ? customers.find((c) => c._id === selectedId) : null;
  const filtered = search || city !== 'all' || status !== 'all';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        <StatCard icon={Users} color="#2563eb" bg="#eff6ff" label="Total customers" value={summary.total} />
        <StatCard icon={UserCheck} color="#059669" bg="#ecfdf5" label="Active" value={summary.active} />
        <StatCard icon={UserPlus} color="#7c3aed" bg="#f5f3ff" label="Joined this month" value={summary.newThisMonth} />
        <StatCard icon={UserX} color="#dc2626" bg="#fef2f2" label="Blocked / suspended" value={summary.restricted} />
      </div>

      <div style={{ ...card, padding: '20px', minWidth: 0 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
            Customers <span style={{ color: '#94a3b8', fontWeight: 600 }}>({filtered ? `${rows.length} of ${customers.length}` : customers.length})</span>
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <label style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
              <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '10px' }} />
              <input type="search" placeholder="Search name, email or phone" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} style={{ ...inputStyle, paddingLeft: '30px', width: '230px' }} />
            </label>
            <select aria-label="City filter" value={city} onChange={(e) => { setCity(e.target.value); setPage(1); }} style={inputStyle}>
              <option value="all">All cities</option>
              {cities.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select aria-label="Status filter" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} style={inputStyle}>
              <option value="all">All statuses</option>
              {Object.entries(STATUS).map(([id, s]) => <option key={id} value={id}>{s.label}</option>)}
            </select>
            <select aria-label="Sort customers" value={sort} onChange={(e) => setSort(e.target.value)} style={inputStyle}>
              {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
        </div>

        <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
          <table style={{ width: '100%', minWidth: '820px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={headRow}>
                <Th>#</Th><Th>Customer</Th><Th>Contact</Th><Th>City</Th><Th right>Bookings</Th><Th right>Total spent</Th><Th>Last booking</Th><Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: '36px 16px', textAlign: 'center', color: '#64748b', fontSize: '0.88rem' }}>{customers.length ? 'No customers match these filters.' : 'No customers registered yet.'}</td></tr>
              ) : visible.map((c, i) => {
                const st = c.bookingStats || {};
                return (
                  <tr key={c._id} onClick={() => setSelectedId(c._id)} tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setSelectedId(c._id)} style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                    <td style={{ ...td, width: '48px', color: '#94a3b8', fontWeight: 700 }}>{(current - 1) * PAGE_SIZE + i + 1}</td>
                    <td style={td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Avatar c={c} />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 800, color: '#0f172a' }}>{c.name}</div>
                          <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Joined {fmtDate(c.createdAt)}</div>
                        </div>
                      </div>
                    </td>
                    <td style={td}>
                      <div style={{ color: '#334155', fontWeight: 600 }}>{c.email || '—'}</div>
                      <div style={{ fontSize: '0.76rem', color: '#64748b' }}>{c.phone || 'No phone'}</div>
                    </td>
                    <td style={{ ...td, fontWeight: 700, color: '#2563eb', whiteSpace: 'nowrap' }}>{cityOf(c)}</td>
                    <td style={{ ...td, textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ fontWeight: 800, color: '#0f172a' }}>{st.bookings || 0}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{bookingBreakdown(st)}</div>
                    </td>
                    <td style={{ ...td, textAlign: 'right', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap' }}>{money(st.totalSpent)}</td>
                    <td style={{ ...td, whiteSpace: 'nowrap', color: '#64748b' }}>{fmtDate(st.lastBookingAt)}</td>
                    <td style={{ ...td, whiteSpace: 'nowrap' }}><StatusPill status={statusOf(c)} /></td>
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

      {selected && <CustomerModal c={selected} onClose={() => setSelectedId(null)} />}
    </div>
  );
};

export default SuperAdminCustomersView;
