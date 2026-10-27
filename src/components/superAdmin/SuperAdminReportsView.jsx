import { useMemo, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  IndianRupee,
  Wallet,
  Landmark,
  Receipt,
  Users,
  RotateCcw,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Download,
  MapPin,
  Briefcase,
  FileText,
  Percent,
} from 'lucide-react';
import { superAdminService } from '../../services/superAdmin.service.js';
import { toast } from '../../utils/toast.js';

const RANGES = [
  { id: 'today', label: 'Today' },
  { id: '7d', label: '7 Days' },
  { id: '30d', label: '30 Days' },
  { id: '90d', label: '90 Days' },
  { id: 'month', label: 'This Month' },
  { id: 'custom', label: 'Custom' },
];

const SECTIONS = [
  { id: 'cities', label: 'City Revenue Statement', icon: MapPin, file: 'cities' },
  { id: 'partners', label: 'Partner Payout Summary', icon: Briefcase, file: 'partners' },
  { id: 'gst', label: 'Platform GST Log', icon: FileText, file: 'gst' },
];

const card = { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)' };
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
const inputStyle = { padding: '7px 10px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '0.82rem', color: '#0f172a', background: '#ffffff' };
const headRow = { background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' };
const td = { padding: '11px 10px', fontSize: '0.82rem', color: '#334155', whiteSpace: 'nowrap' };

const todayIso = () => new Date().toISOString().slice(0, 10);
const fmtDay = (d) => new Date(`${d}T00:00:00`).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
const money2 = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const compact = (n) => {
  const v = Number(n) || 0;
  if (v >= 1e7) return `${(v / 1e7).toFixed(1)}Cr`;
  if (v >= 1e5) return `${(v / 1e5).toFixed(1)}L`;
  if (v >= 1e3) return `${(v / 1e3).toFixed(1)}k`;
  return String(Math.round(v));
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

const EmptyState = ({ children }) => (
  <div style={{ padding: '32px 16px', textAlign: 'center', color: '#64748b', fontSize: '0.88rem' }}>{children}</div>
);

const SectionTitle = ({ children, right }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', gap: '8px', flexWrap: 'wrap' }}>
    <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>{children}</h4>
    {right}
  </div>
);

const Th = ({ children, right }) => (
  <th style={{ padding: '11px 10px', fontWeight: 800, whiteSpace: 'nowrap', textAlign: right ? 'right' : 'left' }}>{children}</th>
);

// Daily GMV bars with the platform-revenue share overlaid (inline SVG, no chart library)
const RevenueChart = ({ data }) => {
  const [hover, setHover] = useState(null);
  const W = 720;
  const H = 230;
  const pad = { l: 46, r: 8, t: 10, b: 26 };
  const max = Math.max(1, ...data.map((d) => d.gmv));
  const slot = (W - pad.l - pad.r) / data.length;
  const bw = Math.max(2, Math.min(26, slot - 3));
  const y = (v) => pad.t + (1 - v / max) * (H - pad.t - pad.b);
  const labelEvery = Math.max(1, Math.ceil(data.length / 8));
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => max * f);
  const h = hover !== null ? data[hover] : null;

  return (
    <div style={{ position: 'relative' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }} onMouseLeave={() => setHover(null)} role="img" aria-label="Daily GMV and platform revenue">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="#e2e8f0" strokeDasharray="3 4" />
            <text x={pad.l - 6} y={y(t) + 4} fontSize="10" fill="#94a3b8" textAnchor="end">₹{compact(t)}</text>
          </g>
        ))}
        {data.map((d, i) => {
          const cx = pad.l + slot * i + slot / 2;
          const dim = hover === null || hover === i ? 1 : 0.45;
          return (
            <g key={d.date}>
              {d.gmv > 0 && <rect x={cx - bw / 2} y={y(d.gmv)} width={bw} height={H - pad.b - y(d.gmv)} fill="#2563eb" rx="2" opacity={dim} />}
              {d.platformRevenue > 0 && <rect x={cx - bw / 2} y={y(d.platformRevenue)} width={bw} height={H - pad.b - y(d.platformRevenue)} fill="#10b981" rx="2" opacity={dim} />}
              {i % labelEvery === 0 && <text x={cx} y={H - 8} fontSize="10" fill="#94a3b8" textAnchor="middle">{fmtDay(d.date)}</text>}
              <rect x={pad.l + slot * i} y={pad.t} width={slot} height={H - pad.t - pad.b} fill="transparent" onMouseEnter={() => setHover(i)} />
            </g>
          );
        })}
      </svg>
      {h && (
        <div style={{ position: 'absolute', top: 0, left: `${Math.min(70, Math.max(2, ((pad.l + slot * hover) / W) * 100 - 6))}%`, background: '#0f172a', color: '#fff', borderRadius: '10px', padding: '8px 12px', fontSize: '0.75rem', pointerEvents: 'none', boxShadow: '0 6px 18px rgba(0,0,0,0.2)', whiteSpace: 'nowrap' }}>
          <div style={{ fontWeight: 800, marginBottom: '3px' }}>{fmtDay(h.date)}</div>
          <div>GMV: <strong>{money(h.gmv)}</strong></div>
          <div>Platform revenue: <strong>{money(h.platformRevenue)}</strong></div>
          <div>Paid bookings: <strong>{h.bookings}</strong></div>
        </div>
      )}
      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', fontSize: '0.74rem', color: '#64748b', marginTop: '4px' }}>
        {[['#2563eb', 'GMV (customer paid)'], ['#10b981', 'Platform revenue']].map(([c, l]) => (
          <span key={l} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><i style={{ width: 10, height: 10, borderRadius: 2, background: c }} /> {l}</span>
        ))}
      </div>
    </div>
  );
};

const TableShell = ({ minWidth, head, children }) => (
  <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
    <table style={{ width: '100%', minWidth, borderCollapse: 'collapse', textAlign: 'left' }}>
      <thead><tr style={headRow}>{head}</tr></thead>
      <tbody>{children}</tbody>
    </table>
  </div>
);

const EmptyRow = ({ cols, children }) => <tr><td colSpan={cols}><EmptyState>{children}</EmptyState></td></tr>;

const SuperAdminReportsView = () => {
  const [range, setRange] = useState('30d');
  const [custom, setCustom] = useState({ from: '', to: todayIso() });
  const [city, setCity] = useState('all');
  const [section, setSection] = useState('cities');
  const [exporting, setExporting] = useState('');

  const customReady = range !== 'custom' || (custom.from && custom.to && custom.from <= custom.to);
  const params = useMemo(() => {
    const p = range === 'custom' ? { range, from: custom.from, to: custom.to } : { range };
    return city !== 'all' ? { ...p, city } : p;
  }, [range, custom.from, custom.to, city]);

  const query = useQuery({
    queryKey: ['superAdmin', 'reports', 'overview', params],
    queryFn: async () => (await superAdminService.getReportsOverview(params))?.data ?? null,
    enabled: !!customReady,
    placeholderData: keepPreviousData,
    retry: false,
  });

  const r = query.data;
  const k = r?.kpis;
  const rate = r?.gst?.rate ?? 18;

  const handleExport = async (type) => {
    setExporting(type);
    try {
      const res = await superAdminService.exportReport({ ...params, type });
      const url = URL.createObjectURL(new Blob([res], { type: 'text/csv;charset=utf-8' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `norozz-${type}-report-${todayIso()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Could not export the report. Please try again.');
    } finally {
      setExporting('');
    }
  };

  const exportBtn = (type, label) => (
    <button key={type} type="button" onClick={() => handleExport(type)} disabled={!!exporting || !customReady} style={{ ...chipStyle(false), display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#047857', borderColor: '#a7f3d0', background: '#ecfdf5', opacity: exporting && exporting !== type ? 0.6 : 1 }}>
      <Download size={14} /> {exporting === type ? 'Exporting…' : label}
    </button>
  );

  const gstDaily = (r?.daily || []).filter((d) => d.bookings > 0);
  const totalCities = (r?.cities || []).reduce((s, c) => ({ bookings: s.bookings + c.bookings, gmv: s.gmv + c.gmv, rev: s.rev + c.platformRevenue, earn: s.earn + c.partnerEarnings, refunds: s.refunds + c.refunds, gst: s.gst + c.gst }), { bookings: 0, gmv: 0, rev: 0, earn: 0, refunds: 0, gst: 0 });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
          {RANGES.map((x) => (
            <button key={x.id} type="button" style={chipStyle(range === x.id)} onClick={() => setRange(x.id)}>{x.label}</button>
          ))}
          {range === 'custom' && (
            <>
              <input type="date" aria-label="From date" style={inputStyle} value={custom.from} max={custom.to || todayIso()} onChange={(e) => setCustom({ ...custom, from: e.target.value })} />
              <span style={{ color: '#94a3b8' }}>→</span>
              <input type="date" aria-label="To date" style={inputStyle} value={custom.to} min={custom.from} max={todayIso()} onChange={(e) => setCustom({ ...custom, to: e.target.value })} />
            </>
          )}
        </div>
        <select aria-label="City filter" value={city} onChange={(e) => setCity(e.target.value)} style={{ ...inputStyle, fontWeight: 700, minWidth: '160px' }}>
          <option value="all">All cities</option>
          {(r?.availableCities || []).map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {query.isError && (
        <div role="alert" style={{ ...card, padding: '14px 18px', borderColor: '#fecaca', background: '#fef2f2', color: '#b91c1c', fontSize: '0.85rem', fontWeight: 600 }}>
          {query.error?.response?.data?.message || query.error?.message || 'Could not load the report. Check your connection and press Refresh.'}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px', opacity: query.isFetching ? 0.75 : 1, transition: 'opacity .15s' }}>
        <KpiCard icon={IndianRupee} color="#2563eb" bg="#eff6ff" title="Gross Merchandise Value" value={money(k?.gmv)} sub={`${k?.transactions ?? 0} paid bookings · AOV ${money(k?.avgOrderValue)}`} delta={k?.gmvChangePct} />
        <KpiCard icon={Landmark} color="#059669" bg="#ecfdf5" title="Platform Revenue" value={money(k?.platformRevenue)} sub={`${k?.takeRatePct ?? 0}% take rate (earned)`} delta={k?.revenueChangePct} />
        <KpiCard icon={Wallet} color="#7c3aed" bg="#f5f3ff" title="Partner Earnings" value={money(k?.partnerEarnings)} sub={`${money(k?.settledPayout)} settled`} delta={k?.payoutChangePct} />
        <KpiCard icon={Receipt} color="#d97706" bg="#fffbeb" title="Pending Payouts" value={money(k?.pendingPayout)} sub="Service done, awaiting settlement" />
        <KpiCard icon={ShieldCheck} color="#0891b2" bg="#ecfeff" title="Escrow Held" value={money(k?.escrowHeld)} sub="Paid, service not yet complete" />
        <KpiCard icon={Percent} color="#4f46e5" bg="#eef2ff" title={`GST Included (${rate}%)`} value={money(k?.gstCollected)} sub="On net receipts after refunds" />
        <KpiCard icon={RotateCcw} color="#dc2626" bg="#fef2f2" title="Refunds Issued" value={money(k?.refunds)} sub={`${money(k?.discounts)} discounts given`} />
        <KpiCard icon={Users} color="#0f766e" bg="#f0fdfa" title="Paying Customers" value={k?.activeCustomers ?? 0} sub={`${k?.completed ?? 0} completed · ${k?.cancelled ?? 0} cancelled`} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        <div style={{ ...card, padding: '20px', gridColumn: 'span 2', minWidth: 0 }}>
          <SectionTitle>Daily Revenue Trend</SectionTitle>
          {r?.daily?.some((d) => d.gmv > 0) ? <RevenueChart data={r.daily} /> : <EmptyState>{r ? 'No paid bookings in this period.' : 'Loading…'}</EmptyState>}
        </div>

        <div style={{ ...card, padding: '20px', minWidth: 0 }}>
          <SectionTitle>Payment Methods</SectionTitle>
          {r?.paymentMethods?.length ? (() => {
            const total = r.paymentMethods.reduce((s, m) => s + m.amount, 0) || 1;
            return r.paymentMethods.map((m) => (
              <div key={m.method} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', fontSize: '0.8rem', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 700, color: '#334155' }}>{m.method} <span style={{ color: '#94a3b8', fontWeight: 600 }}>· {m.count}</span></span>
                  <strong style={{ color: '#0f172a' }}>{money(m.amount)}</strong>
                </div>
                <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div style={{ width: `${(m.amount / total) * 100}%`, height: '100%', background: '#2563eb' }} />
                </div>
              </div>
            ));
          })() : <EmptyState>{r ? 'No payments in this period.' : 'Loading…'}</EmptyState>}
        </div>
      </div>

      <div style={{ ...card, padding: '20px', minWidth: 0 }}>
        <div role="tablist" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
          {SECTIONS.map((s) => (
            <button key={s.id} type="button" role="tab" aria-selected={section === s.id} onClick={() => setSection(s.id)} style={{ ...chipStyle(section === s.id), display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <s.icon size={14} /> {s.label}
            </button>
          ))}
        </div>

        {section === 'cities' && (
          <>
            <SectionTitle right={exportBtn("cities", "Export City Statement")}>City Revenue Statement</SectionTitle>
            <TableShell minWidth="820px" head={<><Th>City</Th><Th right>Paid Bookings</Th><Th right>Completed</Th><Th right>GMV</Th><Th right>Platform Revenue</Th><Th right>Partner Earnings</Th><Th right>Refunds</Th><Th right>GST Incl.</Th></>}>
              {!r?.cities?.length ? <EmptyRow cols={8}>{r ? 'No paid bookings in this period.' : 'Loading…'}</EmptyRow> : (
                <>
                  {r.cities.map((c) => (
                    <tr key={c.city} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ ...td, fontWeight: 800, color: '#0f172a' }}>{c.city}</td>
                      <td style={{ ...td, textAlign: 'right' }}>{c.bookings}</td>
                      <td style={{ ...td, textAlign: 'right', color: '#059669', fontWeight: 700 }}>{c.completed}</td>
                      <td style={{ ...td, textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>{money(c.gmv)}</td>
                      <td style={{ ...td, textAlign: 'right', color: '#047857', fontWeight: 700 }}>{money(c.platformRevenue)}</td>
                      <td style={{ ...td, textAlign: 'right' }}>{money(c.partnerEarnings)}</td>
                      <td style={{ ...td, textAlign: 'right', color: c.refunds ? '#dc2626' : '#94a3b8' }}>{money(c.refunds)}</td>
                      <td style={{ ...td, textAlign: 'right' }}>{money(c.gst)}</td>
                    </tr>
                  ))}
                  <tr style={{ background: '#f8fafc', fontWeight: 900 }}>
                    <td style={{ ...td, fontWeight: 900, color: '#0f172a' }}>Total</td>
                    <td style={{ ...td, textAlign: 'right', fontWeight: 900 }}>{totalCities.bookings}</td>
                    <td style={td} />
                    <td style={{ ...td, textAlign: 'right', fontWeight: 900 }}>{money(totalCities.gmv)}</td>
                    <td style={{ ...td, textAlign: 'right', fontWeight: 900 }}>{money(totalCities.rev)}</td>
                    <td style={{ ...td, textAlign: 'right', fontWeight: 900 }}>{money(totalCities.earn)}</td>
                    <td style={{ ...td, textAlign: 'right', fontWeight: 900 }}>{money(totalCities.refunds)}</td>
                    <td style={{ ...td, textAlign: 'right', fontWeight: 900 }}>{money(totalCities.gst)}</td>
                  </tr>
                </>
              )}
            </TableShell>
          </>
        )}

        {section === 'partners' && (
          <>
            <SectionTitle right={exportBtn("partners", "Export Payout Summary")}>Partner Payout Summary <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>· top 100 by earnings</span></SectionTitle>
            <TableShell minWidth="720px" head={<><Th>#</Th><Th>Partner</Th><Th right>Jobs</Th><Th right>Total Earnings</Th><Th right>Pending Payout</Th><Th right>Settled</Th></>}>
              {!r?.partners?.length ? <EmptyRow cols={6}>{r ? 'No partner earnings in this period.' : 'Loading…'}</EmptyRow> : r.partners.map((p, i) => (
                <tr key={p.partnerId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ ...td, color: '#94a3b8', fontWeight: 700 }}>{i + 1}</td>
                  <td style={{ ...td, fontWeight: 800, color: '#0f172a', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}{p.phone && <span style={{ color: '#94a3b8', fontWeight: 600 }}> · {p.phone}</span>}</td>
                  <td style={{ ...td, textAlign: 'right' }}>{p.jobs}</td>
                  <td style={{ ...td, textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>{money2(p.earnings)}</td>
                  <td style={{ ...td, textAlign: 'right', color: p.pending ? '#b45309' : '#94a3b8', fontWeight: 700 }}>{money2(p.pending)}</td>
                  <td style={{ ...td, textAlign: 'right', color: '#059669', fontWeight: 700 }}>{money2(p.settled)}</td>
                </tr>
              ))}
            </TableShell>
          </>
        )}

        {section === 'gst' && (
          <>
            <SectionTitle right={<div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>{exportBtn("gst", "Export GST Log")}{exportBtn("bookings", "Export All Transactions")}</div>}>
              Platform GST Log <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>· {rate}% GST included in customer prices</span>
            </SectionTitle>
            <TableShell minWidth="620px" head={<><Th>Date</Th><Th right>Paid Bookings</Th><Th right>Gross Receipts</Th><Th right>Taxable Value</Th><Th right>GST ({rate}%)</Th></>}>
              {!gstDaily.length ? <EmptyRow cols={5}>{r ? 'No paid bookings in this period.' : 'Loading…'}</EmptyRow> : (
                <>
                  {[...gstDaily].reverse().map((d) => (
                    <tr key={d.date} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ ...td, fontWeight: 700, color: '#0f172a' }}>{fmtDay(d.date)}</td>
                      <td style={{ ...td, textAlign: 'right' }}>{d.bookings}</td>
                      <td style={{ ...td, textAlign: 'right' }}>{money2(d.gmv)}</td>
                      <td style={{ ...td, textAlign: 'right' }}>{money2(d.gmv - d.gst)}</td>
                      <td style={{ ...td, textAlign: 'right', fontWeight: 800, color: '#4f46e5' }}>{money2(d.gst)}</td>
                    </tr>
                  ))}
                </>
              )}
            </TableShell>
            <p style={{ margin: '10px 2px 0', fontSize: '0.74rem', color: '#94a3b8' }}>
              Daily rows are on gross receipts; refunds are netted in the KPI and exports. Rate comes from the server <code>GST_RATE</code> setting — confirm filings with your CA.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default SuperAdminReportsView;
