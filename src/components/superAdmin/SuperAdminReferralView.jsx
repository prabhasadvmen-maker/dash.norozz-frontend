import { useCallback, useEffect, useMemo, useState } from 'react';
import { Users, Wallet, CheckCircle2, Clock, Search, Save, RefreshCw, Loader2, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { superAdminService } from '../../services/superAdmin.service.js';
import { toast } from '../../utils/toast.js';

const PAGE_SIZE = 10;

const card = { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)' };
const inputStyle = { padding: '8px 11px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '0.84rem', color: '#0f172a', background: '#ffffff' };
const headRow = { background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' };
const td = { padding: '12px 10px', fontSize: '0.84rem', color: '#334155', verticalAlign: 'middle' };

const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');

const StatCard = ({ icon: Icon, color, bg, label, value, sub }) => (
  <div style={{ ...card, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={20} color={color} />
    </div>
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px', marginTop: '2px' }}>{label}</div>
      {sub && <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '1px' }}>{sub}</div>}
    </div>
  </div>
);

const Th = ({ children, w }) => <th style={{ padding: '11px 10px', fontWeight: 800, whiteSpace: 'nowrap', textAlign: 'left', width: w }}>{children}</th>;

const RewardPill = ({ credited }) => (
  <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '3px 10px', borderRadius: '9999px', whiteSpace: 'nowrap', background: credited ? '#ecfdf5' : '#fffbeb', color: credited ? '#047857' : '#b45309', border: `1px solid ${credited ? '#a7f3d0' : '#fde68a'}` }}>
    {credited ? '✓ Bonus credited' : 'Waiting for 1st booking'}
  </span>
);

const SuperAdminReferralView = () => {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedBonus, setSavedBonus] = useState(null);
  const [bonusInput, setBonusInput] = useState('');
  const [data, setData] = useState({ totalReferredCount: 0, totalBonusPaid: 0, referralList: [] });
  const [status, setStatus] = useState('all');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const res = await superAdminService.getAllReferrals();
      const d = res?.data?.data || res?.data || {};
      const amount = d.referralSettings?.referralBonusAmount;
      if (amount !== undefined) {
        setSavedBonus(Number(amount));
        setBonusInput(String(amount));
      }
      setData({
        totalReferredCount: d.totalReferredCount || 0,
        totalBonusPaid: d.totalBonusPaid || 0,
        referralList: Array.isArray(d.referralList) ? d.referralList : [],
      });
    } catch {
      setLoadError(true);
      toast.error('Failed to load referral data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput.trim().toLowerCase()); setPage(1); }, 250);
    return () => clearTimeout(t);
  }, [searchInput]);

  const bonusNum = Number(bonusInput);
  const bonusValid = bonusInput !== '' && Number.isFinite(bonusNum) && bonusNum >= 0;
  const bonusDirty = savedBonus !== null && bonusInput !== String(savedBonus);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!bonusValid) {
      toast.error('Enter a bonus amount of 0 or more');
      return;
    }
    setSaving(true);
    try {
      await superAdminService.updateSettings({ referralBonusAmount: bonusNum });
      setSavedBonus(bonusNum);
      setBonusInput(String(bonusNum));
      toast.success(`Referral bonus set to ${money(bonusNum)}`);
    } catch {
      toast.error('Failed to update the referral bonus');
    } finally {
      setSaving(false);
    }
  };

  const list = data.referralList;
  const credited = list.filter((i) => i.referralBonusStatus === 'credited').length;
  const pending = list.length - credited;

  const rows = useMemo(() => list.filter((i) => {
    const isCredited = i.referralBonusStatus === 'credited';
    if (status === 'credited' && !isCredited) return false;
    if (status === 'pending' && isCredited) return false;
    if (!search) return true;
    return [i.referredByPartner?.name, i.referredBy, i.name, i.phone, i.email].some((v) => String(v || '').toLowerCase().includes(search));
  }), [list, status, search]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const visible = rows.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const tabs = [['all', 'All', list.length], ['credited', 'Credited', credited], ['pending', 'Waiting', pending]];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
      {/* Reward setting */}
      <form onSubmit={handleSave} style={{ ...card, padding: '20px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 340px', minWidth: 0 }}>
          <h3 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 800, color: '#0f172a' }}>Referral bonus</h3>
          <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 }}>
            A partner earns this amount, credited to their wallet, when a technician they referred completes their first customer booking.
          </p>
          <p style={{ margin: '6px 0 0', fontSize: '0.76rem', color: '#94a3b8', display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
            <Info size={13} style={{ flexShrink: 0, marginTop: '2px' }} />
            A new amount applies to every bonus credited from now on, including referrals that are still waiting.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', border: `1px solid ${bonusInput !== '' && !bonusValid ? '#f87171' : '#cbd5e1'}`, borderRadius: '12px', background: '#f8fafc' }}>
            <span style={{ fontWeight: 900, color: '#a21caf', fontSize: '1.1rem' }}>₹</span>
            <input type="number" min="0" aria-label="Referral bonus amount in rupees" value={bonusInput} onChange={(e) => setBonusInput(e.target.value)} disabled={loading || savedBonus === null} style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '1.2rem', fontWeight: 900, color: '#0f172a', width: '110px' }} />
          </label>
          <button type="submit" disabled={!bonusDirty || !bonusValid || saving} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '12px', border: 'none', fontWeight: 800, fontSize: '0.86rem', color: '#fff', cursor: !bonusDirty || !bonusValid || saving ? 'not-allowed' : 'pointer', opacity: !bonusDirty || !bonusValid ? 0.5 : 1, background: 'linear-gradient(135deg, #a21caf 0%, #701a75 100%)' }}>
            {saving ? <Loader2 size={16} className="spin" /> : <Save size={16} />} {saving ? 'Saving…' : 'Save bonus'}
          </button>
        </div>
      </form>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px' }}>
        <StatCard icon={Users} color="#2563eb" bg="#eff6ff" label="People referred" value={data.totalReferredCount} />
        <StatCard icon={CheckCircle2} color="#059669" bg="#ecfdf5" label="Bonuses credited" value={credited} sub={`${money(data.totalBonusPaid)} paid out so far`} />
        <StatCard icon={Clock} color="#d97706" bg="#fffbeb" label="Waiting for 1st booking" value={pending} sub={pending && savedBonus !== null ? `≈ ${money(pending * savedBonus)} payable at ${money(savedBonus)} each` : undefined} />
        <StatCard icon={Wallet} color="#a21caf" bg="#fdf4ff" label="Current bonus" value={savedBonus === null ? '—' : money(savedBonus)} sub="per successful referral" />
      </div>

      {/* Log */}
      <div style={{ ...card, padding: '20px', minWidth: 0 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div role="tablist" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {tabs.map(([id, label, n]) => {
              const active = status === id;
              return (
                <button key={id} type="button" role="tab" aria-selected={active} onClick={() => { setStatus(id); setPage(1); }} style={{ padding: '6px 13px', borderRadius: '9999px', border: `1px solid ${active ? '#059669' : '#e2e8f0'}`, background: active ? '#059669' : '#ffffff', color: active ? '#ffffff' : '#475569', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  {label}<span style={{ opacity: 0.75, marginLeft: '6px' }}>{n}</span>
                </button>
              );
            })}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
            <label style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
              <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '10px' }} />
              <input type="search" placeholder="Search referrer or new member" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} style={{ ...inputStyle, paddingLeft: '30px', width: '230px' }} />
            </label>
            <button type="button" onClick={load} aria-label="Refresh referral log" title="Refresh" style={{ ...inputStyle, display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
              <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            </button>
          </div>
        </div>

        {loadError && (
          <div role="alert" style={{ padding: '12px 14px', marginBottom: '14px', borderRadius: '12px', background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: '0.85rem', fontWeight: 600 }}>
            Could not load the referral log. Check your connection and press Refresh.
          </div>
        )}

        <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px', opacity: loading ? 0.75 : 1 }}>
          <table style={{ width: '100%', minWidth: '820px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={headRow}><Th w="48px">#</Th><Th>Referred by</Th><Th>New member</Th><Th>Contact</Th><Th>Joined</Th><Th>Account</Th><Th>Reward</Th></tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: '40px 16px', textAlign: 'center', color: '#64748b', fontSize: '0.88rem' }}>
                  {loading ? 'Loading referral log…' : list.length ? 'No referrals match these filters.' : 'No referrals yet. They appear here when someone signs up with a partner referral code.'}
                </td></tr>
              ) : visible.map((item, i) => {
                const isPartner = item.role === 'partner';
                const code = item.referredBy || item.referredByPartner?.referralCode;
                const account = (item.kycStatus || item.status || 'active').toLowerCase();
                const okAccount = account === 'approved' || account === 'active';
                return (
                  <tr key={item._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ ...td, color: '#94a3b8', fontWeight: 700 }}>{(current - 1) * PAGE_SIZE + i + 1}</td>
                    <td style={td}>
                      <div style={{ fontWeight: 800, color: '#0f172a' }}>{item.referredByPartner?.name || 'Partner'}</div>
                      {code && <div style={{ fontSize: '0.72rem', color: '#a21caf', fontFamily: 'monospace', fontWeight: 700 }}>{code}</div>}
                    </td>
                    <td style={td}>
                      <div style={{ fontWeight: 800, color: '#0f172a' }}>{item.name || (isPartner ? 'Technician' : 'Customer')}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{isPartner ? 'Technician' : 'Customer'}</div>
                    </td>
                    <td style={{ ...td, whiteSpace: 'nowrap' }}>{item.phone || item.email || '—'}</td>
                    <td style={{ ...td, whiteSpace: 'nowrap', color: '#64748b' }}>{fmtDate(item.createdAt)}</td>
                    <td style={{ ...td, whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '3px 10px', borderRadius: '9999px', textTransform: 'capitalize', background: okAccount ? '#ecfdf5' : '#fffbeb', color: okAccount ? '#047857' : '#b45309', border: `1px solid ${okAccount ? '#a7f3d0' : '#fde68a'}` }}>{account}</span>
                    </td>
                    <td style={td}><RewardPill credited={item.referralBonusStatus === 'credited'} /></td>
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
    </div>
  );
};

export default SuperAdminReferralView;
