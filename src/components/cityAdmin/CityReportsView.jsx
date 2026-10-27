import { useMemo, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  ClipboardList,
  CheckCircle2,
  XCircle,
  Timer,
  Star,
  Wrench,
  Radio,
  TrendingUp,
  TrendingDown,
  Download,
  Target,
  ShieldCheck,
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

const card = {
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '16px',
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
};
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

const todayIso = () => new Date().toISOString().slice(0, 10);
const fmtDay = (d) => new Date(`${d}T00:00:00`).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
const hourLabel = (h) => `${h % 12 === 0 ? 12 : h % 12}${h < 12 ? 'a' : 'p'}`;
const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
const mins = (n) => {
  if (n === null || n === undefined) return '—';
  if (n >= 60) return `${Math.floor(n / 60)}h ${Math.round(n % 60)}m`;
  return `${Math.round(n * 10) / 10}m`;
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
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', gap: '8px' }}>
    <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>{children}</h4>
    {right}
  </div>
);

// Grouped bars: placed / completed / cancelled per day (inline SVG, no chart library)
const BookingsChart = ({ data }) => {
  const [hover, setHover] = useState(null);
  const W = 720;
  const H = 220;
  const pad = { l: 34, r: 8, t: 10, b: 26 };
  const max = Math.max(4, ...data.map((d) => d.placed));
  const step = max <= 8 ? 1 : Math.ceil(max / 4);
  const top = Math.ceil(max / step) * step;
  const slot = (W - pad.l - pad.r) / data.length;
  const bw = Math.max(1.5, Math.min(14, (slot - 2) / 3));
  const y = (v) => pad.t + (1 - v / top) * (H - pad.t - pad.b);
  const labelEvery = Math.max(1, Math.ceil(data.length / 8));
  const ticks = [];
  for (let v = 0; v <= top; v += step) ticks.push(v);
  const h = hover !== null ? data[hover] : null;

  return (
    <div style={{ position: 'relative' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }} onMouseLeave={() => setHover(null)}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="#e2e8f0" strokeDasharray="3 4" />
            <text x={pad.l - 6} y={y(t) + 4} fontSize="10" fill="#94a3b8" textAnchor="end">{t}</text>
          </g>
        ))}
        {data.map((d, i) => {
          const cx = pad.l + slot * i + slot / 2;
          const bars = [
            { v: d.placed, c: '#2563eb' },
            { v: d.completed, c: '#10b981' },
            { v: d.cancelled, c: '#ef4444' },
          ];
          return (
            <g key={d.date}>
              {bars.map((b, k) =>
                b.v > 0 ? (
                  <rect key={k} x={cx - (bw * 3) / 2 + k * bw} y={y(b.v)} width={Math.max(1, bw - 1)} height={H - pad.b - y(b.v)} fill={b.c} rx="1.5" opacity={hover === null || hover === i ? 1 : 0.45} />
                ) : null
              )}
              {i % labelEvery === 0 && <text x={cx} y={H - 8} fontSize="10" fill="#94a3b8" textAnchor="middle">{fmtDay(d.date)}</text>}
              <rect x={pad.l + slot * i} y={pad.t} width={slot} height={H - pad.t - pad.b} fill="transparent" onMouseEnter={() => setHover(i)} />
            </g>
          );
        })}
      </svg>
      {h && (
        <div style={{ position: 'absolute', top: 0, left: `${Math.min(76, Math.max(2, ((pad.l + slot * hover) / W) * 100 - 6))}%`, background: '#0f172a', color: '#fff', borderRadius: '10px', padding: '8px 12px', fontSize: '0.75rem', pointerEvents: 'none', boxShadow: '0 6px 18px rgba(0,0,0,0.2)', whiteSpace: 'nowrap' }}>
          <div style={{ fontWeight: 800, marginBottom: '3px' }}>{fmtDay(h.date)}</div>
          <div>Placed: <strong>{h.placed}</strong></div>
          <div>Completed: <strong>{h.completed}</strong></div>
          <div>Cancelled: <strong>{h.cancelled}</strong></div>
        </div>
      )}
      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', fontSize: '0.74rem', color: '#64748b', marginTop: '4px' }}>
        {[['#2563eb', 'Placed'], ['#10b981', 'Completed'], ['#ef4444', 'Cancelled']].map(([c, l]) => (
          <span key={l} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><i style={{ width: 10, height: 10, borderRadius: 2, background: c }} /> {l}</span>
        ))}
      </div>
    </div>
  );
};

const HoursChart = ({ hours }) => {
  const max = Math.max(1, ...hours.map((h) => h.count));
  const peak = hours.reduce((a, b) => (b.count > a.count ? b : a), hours[0]);
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '110px' }}>
        {hours.map((h) => (
          <div key={h.hour} title={`${hourLabel(h.hour)}: ${h.count} bookings`} style={{ flex: 1, height: `${Math.max(2, (h.count / max) * 100)}%`, background: h.count && h.hour === peak.hour ? '#7c3aed' : h.count ? '#c4b5fd' : '#f1f5f9', borderRadius: '3px 3px 0 0' }} />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#94a3b8', marginTop: '4px' }}>
        {[0, 6, 12, 18, 23].map((h) => <span key={h}>{hourLabel(h)}</span>)}
      </div>
      <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '8px' }}>
        {peak.count ? <>Peak demand: <strong style={{ color: '#7c3aed' }}>{hourLabel(peak.hour)} – {hourLabel((peak.hour + 1) % 24)}</strong> ({peak.count} bookings)</> : 'No bookings in this period.'}
      </div>
    </div>
  );
};

const SlaRow = ({ label, actual, display, targetLabel, pass }) => {
  const known = actual !== null && actual !== undefined;
  const color = !known ? '#94a3b8' : pass ? '#059669' : '#dc2626';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 0', borderBottom: '1px solid #f1f5f9' }}>
      <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: !known ? '#f1f5f9' : pass ? '#ecfdf5' : '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {pass && known ? <ShieldCheck size={16} color={color} /> : <Target size={16} color={color} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>{label}</div>
        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Target {targetLabel}</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: '1rem', fontWeight: 900, color }}>{display}</div>
        <div style={{ fontSize: '0.68rem', fontWeight: 800, color, textTransform: 'uppercase' }}>{!known ? 'No data' : pass ? 'Meeting' : 'Breached'}</div>
      </div>
    </div>
  );
};

const ScoreBadge = ({ score }) => {
  const tone = score >= 85 ? ['#ecfdf5', '#047857', 'Excellent'] : score >= 65 ? ['#fffbeb', '#b45309', 'Good'] : ['#fef2f2', '#b91c1c', 'Needs attention'];
  return (
    <span style={{ padding: '3px 10px', borderRadius: '9999px', background: tone[0], color: tone[1], fontSize: '0.7rem', fontWeight: 800, whiteSpace: 'nowrap' }}>
      {score} · {tone[2]}
    </span>
  );
};

const Th = ({ children, right }) => (
  <th style={{ padding: '11px 10px', fontWeight: 800, whiteSpace: 'nowrap', textAlign: right ? 'right' : 'left' }}>{children}</th>
);
const headRow = { background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' };
const td = { padding: '11px 10px', fontSize: '0.82rem', color: '#334155', whiteSpace: 'nowrap' };

const CityReportsView = ({ assignedCity = 'Delhi NCR' }) => {
  const [range, setRange] = useState('30d');
  const [custom, setCustom] = useState({ from: '', to: todayIso() });
  const [exporting, setExporting] = useState(false);

  const customReady = range !== 'custom' || (custom.from && custom.to && custom.from <= custom.to);
  const rangeParams = useMemo(() => (range === 'custom' ? { range, from: custom.from, to: custom.to } : { range }), [range, custom.from, custom.to]);

  const query = useQuery({
    queryKey: ['cityAdmin', 'reports', 'overview', assignedCity, rangeParams],
    queryFn: async () => (await cityAdminService.getReportsOverview(rangeParams))?.data ?? null,
    enabled: !!customReady,
    placeholderData: keepPreviousData,
    retry: false,
  });

  const r = query.data;
  const k = r?.kpis;
  const t = r?.targets;

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await cityAdminService.exportReportBookings(rangeParams);
      const url = URL.createObjectURL(new Blob([res], { type: 'text/csv;charset=utf-8' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `bookings-report-${assignedCity.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-${todayIso()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Could not export the report. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const actorLabel = { customer: 'Customer', partner: 'Partner', admin: 'City admin', system: 'System (auto)', unknown: 'Not recorded' };
  const cancelTotal = (r?.cancellations?.byActor || []).reduce((s, a) => s + a.count, 0) || 1;
  const reasonMax = Math.max(1, ...(r?.cancellations?.topReasons || []).map((x) => x.count));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
          {RANGES.map((x) => (
            <button key={x.id} type="button" style={chipStyle(range === x.id)} onClick={() => setRange(x.id)}>{x.label}</button>
          ))}
          {range === 'custom' && (
            <>
              <input type="date" style={inputStyle} value={custom.from} max={custom.to || todayIso()} onChange={(e) => setCustom({ ...custom, from: e.target.value })} />
              <span style={{ color: '#94a3b8' }}>→</span>
              <input type="date" style={inputStyle} value={custom.to} min={custom.from} max={todayIso()} onChange={(e) => setCustom({ ...custom, to: e.target.value })} />
            </>
          )}
        </div>
        <button type="button" onClick={handleExport} disabled={exporting || !customReady} style={{ ...chipStyle(false), display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#047857', borderColor: '#a7f3d0', background: '#ecfdf5' }}>
          <Download size={14} /> {exporting ? 'Exporting…' : 'Export Bookings CSV'}
        </button>
      </div>

      {query.isError && (
        <div style={{ ...card, padding: '14px 18px', borderColor: '#fecaca', background: '#fef2f2', color: '#b91c1c', fontSize: '0.85rem', fontWeight: 600 }}>
          Could not load the report. Check your connection and press Refresh.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', opacity: query.isFetching ? 0.75 : 1, transition: 'opacity .15s' }}>
        <KpiCard icon={ClipboardList} color="#2563eb" bg="#eff6ff" title="Bookings Placed" value={k?.placed ?? 0} sub={`${k?.active ?? 0} in progress · ${k?.unassigned ?? 0} unassigned`} delta={k?.placedChangePct} />
        <KpiCard icon={CheckCircle2} color="#059669" bg="#ecfdf5" title="Completed" value={k?.completed ?? 0} sub={`${k?.completionRate ?? 0}% completion rate`} delta={k?.completedChangePct} />
        <KpiCard icon={XCircle} color="#dc2626" bg="#fef2f2" title="Cancelled" value={k?.cancelled ?? 0} sub={`${k?.cancellationRate ?? 0}% of placed bookings`} />
        <KpiCard icon={Radio} color="#7c3aed" bg="#f5f3ff" title="Avg Dispatch Time" value={mins(k?.avgDispatchMinutes)} sub={`${k?.dispatchWithinSlaPct ?? 0}% within ${t?.dispatchMinutes ?? 15} min`} />
        <KpiCard icon={Wrench} color="#0891b2" bg="#ecfeff" title="Avg Service Time" value={mins(k?.avgServiceMinutes)} sub="Start to completion" />
        <KpiCard icon={Star} color="#d97706" bg="#fffbeb" title="Customer Rating" value={k?.avgRating ? `${k.avgRating} ★` : '—'} sub={`${k?.ratedBookings ?? 0} rated · ${k?.reassignedBookings ?? 0} reassigned`} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        <div style={{ ...card, padding: '20px', gridColumn: 'span 2', minWidth: 0 }}>
          <SectionTitle>Daily Booking Volume</SectionTitle>
          {r?.daily?.some((d) => d.placed > 0) ? <BookingsChart data={r.daily} /> : <EmptyState>No bookings in this period.</EmptyState>}
        </div>

        <div style={{ ...card, padding: '20px', minWidth: 0 }}>
          <SectionTitle>SLA Compliance</SectionTitle>
          {r ? (
            <>
              <SlaRow label="Dispatch within target" actual={k.avgDispatchMinutes === null ? null : k.dispatchWithinSlaPct} display={k.avgDispatchMinutes === null ? '—' : `${k.dispatchWithinSlaPct}%`} targetLabel={`≥ 90% in ${t.dispatchMinutes} min`} pass={k.dispatchWithinSlaPct >= 90} />
              <SlaRow label="Completion rate" actual={k.completed + k.cancelled > 0 ? k.completionRate : null} display={k.completed + k.cancelled > 0 ? `${k.completionRate}%` : '—'} targetLabel={`≥ ${t.completionRatePct}%`} pass={k.completionRate >= t.completionRatePct} />
              <SlaRow label="Cancellation rate" actual={k.placed > 0 ? k.cancellationRate : null} display={k.placed > 0 ? `${k.cancellationRate}%` : '—'} targetLabel={`≤ ${t.maxCancellationRatePct}%`} pass={k.cancellationRate <= t.maxCancellationRatePct} />
              <SlaRow label="Customer rating" actual={k.avgRating} display={k.avgRating ? `${k.avgRating} ★` : '—'} targetLabel={`≥ ${t.minRating} ★`} pass={(k.avgRating || 0) >= t.minRating} />
            </>
          ) : <EmptyState>Loading…</EmptyState>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        <div style={{ ...card, padding: '20px', minWidth: 0 }}>
          <SectionTitle>Peak Booking Hours (IST)</SectionTitle>
          {r ? <HoursChart hours={r.hours} /> : <EmptyState>Loading…</EmptyState>}
        </div>

        <div style={{ ...card, padding: '20px', minWidth: 0 }}>
          <SectionTitle right={<span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 700 }}>{r?.cancellations?.total ?? 0} total</span>}>Cancellation Analysis</SectionTitle>
          {r?.cancellations?.total ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>Cancelled by</div>
                <div style={{ display: 'flex', height: '10px', borderRadius: '9999px', overflow: 'hidden', background: '#f1f5f9' }}>
                  {r.cancellations.byActor.map((a, i) => (
                    <div key={a.actor} title={`${actorLabel[a.actor]}: ${a.count}`} style={{ width: `${(a.count / cancelTotal) * 100}%`, background: ['#ef4444', '#f59e0b', '#7c3aed', '#0891b2', '#94a3b8'][i % 5] }} />
                  ))}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 14px', marginTop: '8px', fontSize: '0.75rem', color: '#475569' }}>
                  {r.cancellations.byActor.map((a, i) => (
                    <span key={a.actor} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <i style={{ width: 8, height: 8, borderRadius: 2, background: ['#ef4444', '#f59e0b', '#7c3aed', '#0891b2', '#94a3b8'][i % 5] }} />
                      {actorLabel[a.actor]} <strong>{a.count}</strong>
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Top reasons</div>
                {r.cancellations.topReasons.map((x) => (
                  <div key={x.reason} style={{ marginBottom: '9px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', fontSize: '0.78rem', marginBottom: '3px' }}>
                      <span style={{ color: '#334155', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textTransform: 'capitalize' }}>{x.reason}</span>
                      <strong style={{ color: '#0f172a' }}>{x.count}</strong>
                    </div>
                    <div style={{ height: '5px', background: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div style={{ width: `${(x.count / reasonMax) * 100}%`, height: '100%', background: '#ef4444' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : <EmptyState>No cancellations in this period.</EmptyState>}
        </div>
      </div>

      <div style={{ ...card, padding: '20px', minWidth: 0 }}>
        <SectionTitle>Service Category Performance</SectionTitle>
        <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
          <table style={{ width: '100%', minWidth: '640px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={headRow}><Th>Category</Th><Th right>Placed</Th><Th right>Completed</Th><Th right>Cancelled</Th><Th right>Completion</Th><Th right>Rating</Th><Th right>Revenue</Th></tr>
            </thead>
            <tbody>
              {!r?.categories?.length ? (
                <tr><td colSpan={7}><EmptyState>No bookings in this period.</EmptyState></td></tr>
              ) : r.categories.map((c) => (
                <tr key={c.name} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ ...td, fontWeight: 800, color: '#0f172a' }}>{c.name}</td>
                  <td style={{ ...td, textAlign: 'right' }}>{c.placed}</td>
                  <td style={{ ...td, textAlign: 'right', color: '#059669', fontWeight: 700 }}>{c.completed}</td>
                  <td style={{ ...td, textAlign: 'right', color: c.cancelled ? '#dc2626' : '#94a3b8', fontWeight: 700 }}>{c.cancelled}</td>
                  <td style={{ ...td, textAlign: 'right' }}>{c.completed + c.cancelled ? `${c.completionRate}%` : '—'}</td>
                  <td style={{ ...td, textAlign: 'right' }}>{c.avgRating ? `${c.avgRating} ★` : '—'}</td>
                  <td style={{ ...td, textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>{money(c.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ ...card, padding: '20px', minWidth: 0 }}>
        <SectionTitle right={<span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Score = 50% completion · 30% rating · 20% job acceptance</span>}>Partner SLA Scorecard</SectionTitle>
        <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
          <table style={{ width: '100%', minWidth: '860px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={headRow}><Th>#</Th><Th>Partner</Th><Th right>Jobs</Th><Th right>Completed</Th><Th right>Cancelled</Th><Th right>Declined</Th><Th right>Completion</Th><Th right>Acceptance</Th><Th right>Rating</Th><Th right>Avg Service</Th><Th>Score</Th></tr>
            </thead>
            <tbody>
              {!r?.partners?.length ? (
                <tr><td colSpan={11}><EmptyState>No assigned jobs in this period.</EmptyState></td></tr>
              ) : r.partners.map((p, i) => (
                <tr key={p.partnerId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ ...td, color: '#94a3b8', fontWeight: 700 }}>{i + 1}</td>
                  <td style={{ ...td, fontWeight: 800, color: '#0f172a', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</td>
                  <td style={{ ...td, textAlign: 'right' }}>{p.jobs}</td>
                  <td style={{ ...td, textAlign: 'right', color: '#059669', fontWeight: 700 }}>{p.completed}</td>
                  <td style={{ ...td, textAlign: 'right', color: p.cancelled ? '#dc2626' : '#94a3b8', fontWeight: 700 }}>{p.cancelled}</td>
                  <td style={{ ...td, textAlign: 'right', color: p.rejections ? '#b45309' : '#94a3b8', fontWeight: 700 }}>{p.rejections}</td>
                  <td style={{ ...td, textAlign: 'right' }}>{p.completed + p.cancelled ? `${p.completionRate}%` : '—'}</td>
                  <td style={{ ...td, textAlign: 'right' }}>{p.acceptanceRate}%</td>
                  <td style={{ ...td, textAlign: 'right' }}>{p.avgRating ? `${p.avgRating} ★` : '—'}</td>
                  <td style={{ ...td, textAlign: 'right' }}><Timer size={12} style={{ verticalAlign: '-2px', marginRight: 4, color: '#94a3b8' }} />{mins(p.avgServiceMinutes)}</td>
                  <td style={td}><ScoreBadge score={p.score} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CityReportsView;
