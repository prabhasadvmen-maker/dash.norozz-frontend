import { useMemo, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  IndianRupee,
  Receipt,
  TrendingUp,
  TrendingDown,
  Landmark,
  Hourglass,
  Undo2,
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  Wallet,
} from 'lucide-react';
import { cityAdminService } from '../../services/cityAdmin.service.js';
import { toast } from '../../utils/toast.js';

const RANGES = [
  { id: 'today', label: 'Today' },
  { id: '7d', label: '7 Days' },
  { id: '30d', label: '30 Days' },
  { id: '90d', label: '90 Days' },
  { id: 'month', label: 'This Month' },
  { id: 'custom', label: 'Custom' },
];

const STATUS_FILTERS = [
  { id: '', label: 'All' },
  { id: 'escrow', label: 'In Escrow' },
  { id: 'awaiting_payout', label: 'Awaiting Payout' },
  { id: 'settled', label: 'Settled' },
  { id: 'refunded', label: 'Refunded' },
  { id: 'cancelled', label: 'Cancelled' },
];

const SETTLEMENT_BADGE = {
  AMOUNT_HELD: { label: 'In Escrow', bg: '#eff6ff', color: '#1d4ed8' },
  SERVICE_IN_PROGRESS: { label: 'In Escrow', bg: '#eff6ff', color: '#1d4ed8' },
  SERVICE_COMPLETED: { label: 'Awaiting Payout', bg: '#fffbeb', color: '#b45309' },
  SETTLEMENT_PENDING: { label: 'Awaiting Payout', bg: '#fffbeb', color: '#b45309' },
  SETTLED: { label: 'Settled', bg: '#ecfdf5', color: '#047857' },
  REFUND_PENDING: { label: 'Refund Pending', bg: '#fef2f2', color: '#b91c1c' },
  REFUNDED: { label: 'Refunded', bg: '#fef2f2', color: '#b91c1c' },
  CANCELLED: { label: 'Cancelled', bg: '#f1f5f9', color: '#475569' },
  PAYMENT_PENDING: { label: 'Payment Pending', bg: '#f1f5f9', color: '#475569' },
};

const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
const compactInr = (n) => {
  const v = Number(n || 0);
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(1)}Cr`;
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  if (v >= 1000) return `₹${(v / 1000).toFixed(1)}K`;
  return `₹${Math.round(v)}`;
};
const fmtDate = (d) => new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
const fmtDay = (d) => new Date(`${d}T00:00:00`).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
const todayIso = () => new Date().toISOString().slice(0, 10);

const card = {
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '16px',
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
};

const Delta = ({ pct }) => {
  if (pct === undefined || pct === null) return null;
  const up = pct >= 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.72rem', fontWeight: 800, color: up ? '#059669' : '#dc2626' }}>
      <Icon size={13} /> {up ? '+' : ''}{pct}%
    </span>
  );
};

const KpiCard = ({ icon: Icon, color, bg, title, value, sub, delta }) => (
  <div style={{ ...card, padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px', minWidth: 0 }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
      <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={19} color={color} />
      </div>
      <Delta pct={delta} />
    </div>
    <div>
      <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</div>
      <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.2, marginTop: '2px' }}>{value}</div>
      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>{sub}</div>
    </div>
  </div>
);

// Lightweight inline SVG area chart (no chart library dependency)
const TrendChart = ({ data }) => {
  const [hover, setHover] = useState(null);
  const W = 720;
  const H = 220;
  const pad = { l: 46, r: 12, t: 12, b: 26 };
  const max = Math.max(1, ...data.map((d) => d.gmv));
  const niceMax = Math.ceil(max / 4 / 10 ** Math.max(0, String(Math.ceil(max)).length - 2)) * 4 * 10 ** Math.max(0, String(Math.ceil(max)).length - 2) || max;
  const x = (i) => pad.l + (data.length <= 1 ? 0 : (i / (data.length - 1)) * (W - pad.l - pad.r));
  const y = (v) => pad.t + (1 - v / niceMax) * (H - pad.t - pad.b);
  const line = (key) => data.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(d[key]).toFixed(1)}`).join(' ');
  const area = `${line('gmv')} L${x(data.length - 1).toFixed(1)},${H - pad.b} L${x(0).toFixed(1)},${H - pad.b} Z`;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => niceMax * t);
  const labelEvery = Math.max(1, Math.ceil(data.length / 7));
  const h = hover !== null ? data[hover] : null;

  return (
    <div style={{ position: 'relative' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }} onMouseLeave={() => setHover(null)}>
        <defs>
          <linearGradient id="gmvFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="#e2e8f0" strokeDasharray="3 4" />
            <text x={pad.l - 8} y={y(t) + 4} fontSize="10" fill="#94a3b8" textAnchor="end">{compactInr(t)}</text>
          </g>
        ))}
        <path d={area} fill="url(#gmvFill)" />
        <path d={line('gmv')} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinejoin="round" />
        <path d={line('platformRevenue')} fill="none" stroke="#7c3aed" strokeWidth="2" strokeDasharray="5 4" strokeLinejoin="round" />
        {data.map((d, i) => (
          <g key={d.date}>
            {i % labelEvery === 0 && (
              <text x={x(i)} y={H - 8} fontSize="10" fill="#94a3b8" textAnchor="middle">{fmtDay(d.date)}</text>
            )}
            <rect
              x={x(i) - (W - pad.l - pad.r) / data.length / 2}
              y={pad.t}
              width={(W - pad.l - pad.r) / data.length}
              height={H - pad.t - pad.b}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
            />
          </g>
        ))}
        {h && (
          <>
            <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={H - pad.b} stroke="#cbd5e1" />
            <circle cx={x(hover)} cy={y(h.gmv)} r="4.5" fill="#10b981" stroke="#fff" strokeWidth="2" />
          </>
        )}
      </svg>
      {h && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: `${Math.min(78, Math.max(2, (x(hover) / W) * 100 - 10))}%`,
            background: '#0f172a',
            color: '#fff',
            borderRadius: '10px',
            padding: '8px 12px',
            fontSize: '0.75rem',
            pointerEvents: 'none',
            boxShadow: '0 6px 18px rgba(0,0,0,0.2)',
            whiteSpace: 'nowrap',
          }}
        >
          <div style={{ fontWeight: 800, marginBottom: '3px' }}>{fmtDay(h.date)}</div>
          <div>GMV: <strong>{inr(h.gmv)}</strong></div>
          <div>Platform: <strong>{inr(h.platformRevenue)}</strong></div>
          <div>Bookings: <strong>{h.bookings}</strong></div>
        </div>
      )}
      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', fontSize: '0.74rem', color: '#64748b', marginTop: '4px' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><i style={{ width: 14, height: 3, background: '#10b981', borderRadius: 2 }} /> Gross GMV</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><i style={{ width: 14, height: 0, borderTop: '2px dashed #7c3aed' }} /> Platform revenue</span>
      </div>
    </div>
  );
};

const EmptyState = ({ children }) => (
  <div style={{ padding: '36px 16px', textAlign: 'center', color: '#64748b', fontSize: '0.88rem' }}>{children}</div>
);

const chipStyle = (active) => ({
  padding: '6px 13px',
  borderRadius: '9999px',
  border: `1px solid ${active ? '#059669' : '#e2e8f0'}`,
  background: active ? '#059669' : '#ffffff',
  color: active ? '#ffffff' : '#475569',
  fontSize: '0.78rem',
  fontWeight: 700,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
});

const inputStyle = {
  padding: '7px 10px',
  border: '1px solid #e2e8f0',
  borderRadius: '10px',
  fontSize: '0.82rem',
  color: '#0f172a',
  background: '#ffffff',
};

const CityPaymentsView = ({ assignedCity = 'Delhi NCR' }) => {
  const [range, setRange] = useState('30d');
  const [custom, setCustom] = useState({ from: '', to: todayIso() });
  const [status, setStatus] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);

  const customReady = range !== 'custom' || (custom.from && custom.to && custom.from <= custom.to);
  const rangeParams = useMemo(
    () => (range === 'custom' ? { range, from: custom.from, to: custom.to } : { range }),
    [range, custom.from, custom.to]
  );

  const overviewQuery = useQuery({
    queryKey: ['cityAdmin', 'payments', 'overview', assignedCity, rangeParams],
    queryFn: async () => (await cityAdminService.getPaymentsOverview(rangeParams))?.data ?? null,
    enabled: !!customReady,
    placeholderData: keepPreviousData,
    retry: false,
  });

  const txParams = { ...rangeParams, status, search, page, limit: 12 };
  const txQuery = useQuery({
    queryKey: ['cityAdmin', 'payments', 'transactions', assignedCity, txParams],
    queryFn: async () => (await cityAdminService.getPaymentTransactions(txParams))?.data ?? null,
    enabled: !!customReady,
    placeholderData: keepPreviousData,
    retry: false,
  });

  const overview = overviewQuery.data;
  const s = overview?.summary;
  const tx = txQuery.data;

  const applySearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await cityAdminService.exportPaymentTransactions({ ...rangeParams, status, search });
      const url = URL.createObjectURL(new Blob([res], { type: 'text/csv;charset=utf-8' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `payments-${assignedCity.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-${todayIso()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Could not export payments. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const methodTotal = (overview?.paymentMethods || []).reduce((sum, m) => sum + m.amount, 0) || 1;
  const topMax = Math.max(1, ...(overview?.topPartners || []).map((p) => p.earnings));
  const loadError = overviewQuery.isError || txQuery.isError;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
          {RANGES.map((r) => (
            <button key={r.id} type="button" style={chipStyle(range === r.id)} onClick={() => { setRange(r.id); setPage(1); }}>
              {r.label}
            </button>
          ))}
          {range === 'custom' && (
            <>
              <input type="date" style={inputStyle} value={custom.from} max={custom.to || todayIso()} onChange={(e) => { setCustom({ ...custom, from: e.target.value }); setPage(1); }} />
              <span style={{ color: '#94a3b8' }}>→</span>
              <input type="date" style={inputStyle} value={custom.to} min={custom.from} max={todayIso()} onChange={(e) => { setCustom({ ...custom, to: e.target.value }); setPage(1); }} />
            </>
          )}
        </div>
        <button
          type="button"
          onClick={handleExport}
          disabled={exporting || !customReady}
          style={{ ...chipStyle(false), display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#047857', borderColor: '#a7f3d0', background: '#ecfdf5' }}
        >
          <Download size={14} /> {exporting ? 'Exporting…' : 'Export CSV'}
        </button>
      </div>

      {loadError && (
        <div style={{ ...card, padding: '14px 18px', borderColor: '#fecaca', background: '#fef2f2', color: '#b91c1c', fontSize: '0.85rem', fontWeight: 600 }}>
          Could not load payment data. Check your connection and press Refresh.
        </div>
      )}

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', opacity: overviewQuery.isFetching ? 0.75 : 1, transition: 'opacity .15s' }}>
        <KpiCard icon={IndianRupee} color="#2563eb" bg="#eff6ff" title="Gross Collections" value={inr(s?.gmv)} sub={`${s?.transactions ?? 0} paid bookings`} delta={s?.gmvChangePct} />
        <KpiCard icon={Landmark} color="#7c3aed" bg="#f5f3ff" title="Platform Revenue" value={inr(s?.platformRevenue)} sub={`Avg order ${inr(s?.avgOrderValue)}`} delta={s?.platformRevenueChangePct} />
        <KpiCard icon={Wallet} color="#0891b2" bg="#ecfeff" title="Held in Escrow" value={inr(s?.escrowHeld)} sub={`${s?.escrowCount ?? 0} active jobs`} />
        <KpiCard icon={Hourglass} color="#d97706" bg="#fffbeb" title="Payout Pending" value={inr(s?.pendingPayout)} sub={`${s?.pendingPayoutCount ?? 0} jobs awaiting settlement`} />
        <KpiCard icon={Receipt} color="#059669" bg="#ecfdf5" title="Paid to Partners" value={inr(s?.settledPayout)} sub={`Earned ${inr(s?.partnerEarnings)}`} />
        <KpiCard icon={Undo2} color="#dc2626" bg="#fef2f2" title="Refunds" value={inr(s?.refunds)} sub={`${s?.refundCount ?? 0} refunded bookings`} />
      </div>

      {/* Trend + side panels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        <div style={{ ...card, padding: '20px', gridColumn: 'span 2', minWidth: 0 }}>
          <h4 style={{ margin: '0 0 12px', fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>Daily Collections</h4>
          {overview?.daily?.some((d) => d.gmv > 0) ? <TrendChart data={overview.daily} /> : <EmptyState>No paid bookings in this period.</EmptyState>}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0 }}>
          <div style={{ ...card, padding: '20px' }}>
            <h4 style={{ margin: '0 0 12px', fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>Payment Methods</h4>
            {overview?.paymentMethods?.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
                {overview.paymentMethods.map((m) => (
                  <div key={m.method}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 700, color: '#334155', textTransform: 'capitalize' }}>{m.method} <span style={{ color: '#94a3b8', fontWeight: 600 }}>· {m.count}</span></span>
                      <span style={{ fontWeight: 800, color: '#0f172a' }}>{inr(m.amount)}</span>
                    </div>
                    <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div style={{ width: `${(m.amount / methodTotal) * 100}%`, height: '100%', background: '#10b981', borderRadius: '9999px' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : <EmptyState>No data yet.</EmptyState>}
          </div>

          <div style={{ ...card, padding: '20px' }}>
            <h4 style={{ margin: '0 0 12px', fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>Top Earning Partners</h4>
            {overview?.topPartners?.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
                {overview.topPartners.map((p, i) => (
                  <div key={p.partnerId}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', fontSize: '0.8rem', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 700, color: '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{i + 1}. {p.name} <span style={{ color: '#94a3b8', fontWeight: 600 }}>· {p.jobs} jobs</span></span>
                      <span style={{ fontWeight: 800, color: '#0f172a', flexShrink: 0 }}>{inr(p.earnings)}</span>
                    </div>
                    <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div style={{ width: `${(p.earnings / topMax) * 100}%`, height: '100%', background: '#7c3aed', borderRadius: '9999px' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : <EmptyState>No completed jobs in this period.</EmptyState>}
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div style={{ ...card, padding: '20px', minWidth: 0 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>
            Transactions {tx ? <span style={{ color: '#94a3b8', fontWeight: 600 }}>({tx.total})</span> : null}
          </h4>
          <form onSubmit={applySearch} style={{ display: 'flex', gap: '8px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Booking ID or service"
                maxLength={60}
                style={{ ...inputStyle, paddingLeft: '30px', width: '210px' }}
              />
            </div>
            <button type="submit" style={chipStyle(false)}>Search</button>
            {search && (
              <button type="button" style={chipStyle(false)} onClick={() => { setSearch(''); setSearchInput(''); setPage(1); }}>Clear</button>
            )}
          </form>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
          {STATUS_FILTERS.map((f) => (
            <button key={f.id || 'all'} type="button" style={chipStyle(status === f.id)} onClick={() => { setStatus(f.id); setPage(1); }}>{f.label}</button>
          ))}
        </div>

        <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px', opacity: txQuery.isFetching ? 0.75 : 1, transition: 'opacity .15s' }}>
          <table style={{ width: '100%', minWidth: '900px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {['#', 'Date', 'Booking', 'Customer', 'Partner', 'Method', 'Amount', 'Platform', 'Partner Earns', 'Settlement'].map((h, i) => (
                  <th key={h} style={{ padding: '11px 10px', fontWeight: 800, whiteSpace: 'nowrap', textAlign: i >= 6 && i <= 8 ? 'right' : 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {txQuery.isLoading ? (
                <tr><td colSpan={10}><EmptyState>Loading transactions…</EmptyState></td></tr>
              ) : !tx?.items?.length ? (
                <tr><td colSpan={10}><EmptyState>No transactions match these filters.</EmptyState></td></tr>
              ) : (
                tx.items.map((t, idx) => {
                  const badge = SETTLEMENT_BADGE[t.financialStatus] || { label: t.financialStatus, bg: '#f1f5f9', color: '#475569' };
                  const cell = { padding: '11px 10px', fontSize: '0.82rem', color: '#334155', whiteSpace: 'nowrap' };
                  const clip = { ...cell, maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis' };
                  return (
                    <tr key={t._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ ...cell, color: '#94a3b8', fontWeight: 700 }}>{(tx.page - 1) * tx.limit + idx + 1}</td>
                      <td style={{ ...cell, color: '#64748b' }}>{fmtDate(t.txnDate)}</td>
                      <td style={cell}>
                        <div style={{ fontWeight: 800, color: '#2563eb' }}>{t.bookingId}</div>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8', maxWidth: '130px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.packageName}</div>
                      </td>
                      <td style={{ ...clip, fontWeight: 700, color: '#0f172a' }}>{t.customer || '—'}</td>
                      <td style={{ ...clip, color: t.partner ? '#059669' : '#94a3b8', fontWeight: 700 }}>{t.partner || 'Unassigned'}</td>
                      <td style={{ ...cell, textTransform: 'capitalize' }}>{t.paymentMethod}</td>
                      <td style={{ ...cell, textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>
                        {inr(t.amount)}
                        {t.refundAmount > 0 && <div style={{ fontSize: '0.7rem', color: '#dc2626', fontWeight: 700 }}>−{inr(t.refundAmount)} refunded</div>}
                      </td>
                      <td style={{ ...cell, textAlign: 'right', color: '#7c3aed', fontWeight: 700 }}>{inr(t.platformRevenue)}</td>
                      <td style={{ ...cell, textAlign: 'right', fontWeight: 700 }}>{inr(t.partnerEarning)}</td>
                      <td style={cell}>
                        <span style={{ padding: '3px 10px', borderRadius: '9999px', background: badge.bg, color: badge.color, fontSize: '0.7rem', fontWeight: 800 }}>{badge.label}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {tx && tx.totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '14px', fontSize: '0.8rem', color: '#64748b' }}>
            <span>Page {tx.page} of {tx.totalPages}</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" style={{ ...chipStyle(false), display: 'inline-flex', alignItems: 'center', opacity: page <= 1 ? 0.5 : 1 }} disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                <ChevronLeft size={14} /> Prev
              </button>
              <button type="button" style={{ ...chipStyle(false), display: 'inline-flex', alignItems: 'center', opacity: page >= tx.totalPages ? 0.5 : 1 }} disabled={page >= tx.totalPages} onClick={() => setPage((p) => p + 1)}>
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CityPaymentsView;
