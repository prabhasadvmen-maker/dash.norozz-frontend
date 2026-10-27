import { useEffect, useMemo, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Download, Search, ChevronLeft, ChevronRight, Info } from 'lucide-react';
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

const STATUS_TABS = [
  { id: '', label: 'All' },
  { id: 'escrow', label: 'Held in escrow' },
  { id: 'awaiting_payout', label: 'Payout pending' },
  { id: 'settled', label: 'Paid out' },
  { id: 'refunded', label: 'Refunded' },
  { id: 'cancelled', label: 'Cancelled' },
];

// Plain-language names for the internal financial states
const SETTLEMENT = {
  AMOUNT_HELD: { label: 'Held in escrow', bg: '#eff6ff', color: '#1d4ed8' },
  SERVICE_IN_PROGRESS: { label: 'Held in escrow', bg: '#eff6ff', color: '#1d4ed8' },
  SERVICE_COMPLETED: { label: 'Payout pending', bg: '#fffbeb', color: '#b45309' },
  SETTLEMENT_PENDING: { label: 'Payout pending', bg: '#fffbeb', color: '#b45309' },
  SETTLED: { label: 'Paid out', bg: '#ecfdf5', color: '#047857' },
  REFUND_PENDING: { label: 'Refund pending', bg: '#fef2f2', color: '#b91c1c' },
  REFUNDED: { label: 'Refunded', bg: '#fef2f2', color: '#b91c1c' },
  CANCELLED: { label: 'Cancelled', bg: '#f1f5f9', color: '#475569' },
};

const card = { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)' };
const chipStyle = (active) => ({ padding: '6px 13px', borderRadius: '9999px', border: `1px solid ${active ? '#059669' : '#e2e8f0'}`, background: active ? '#059669' : '#ffffff', color: active ? '#ffffff' : '#475569', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' });
const inputStyle = { padding: '7px 10px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '0.82rem', color: '#0f172a', background: '#ffffff' };
const headRow = { background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' };
const td = { padding: '11px 10px', fontSize: '0.82rem', color: '#334155', verticalAlign: 'top' };

const todayIso = () => new Date().toISOString().slice(0, 10);
const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
const money2 = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
const fmtTime = (d) => new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

const SectionHead = ({ title, hint, right }) => (
  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '14px' }}>
    <div>
      <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>{title}</h3>
      {hint && <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: '#64748b' }}>{hint}</p>}
    </div>
    {right}
  </div>
);

const Metric = ({ label, value, help, color = '#0f172a', accent = '#e2e8f0' }) => (
  <div style={{ ...card, padding: '16px 18px', borderTop: `3px solid ${accent}`, minWidth: 0 }}>
    <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{label}</div>
    <div style={{ fontSize: '1.55rem', fontWeight: 900, color, margin: '4px 0 2px', lineHeight: 1.2 }}>{value}</div>
    <div style={{ fontSize: '0.76rem', color: '#64748b', lineHeight: 1.4 }}>{help}</div>
  </div>
);

const LedgerLine = ({ label, note, value, tone = '#334155', strong, sign }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px', padding: strong ? '12px 0 0' : '9px 0', borderTop: strong ? '2px solid #cbd5e1' : '1px solid #f1f5f9', marginTop: strong ? '4px' : 0 }}>
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: strong ? '0.98rem' : '0.88rem', fontWeight: strong ? 800 : 600, color: strong ? '#0f172a' : tone }}>{label}</div>
      {note && <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '1px' }}>{note}</div>}
    </div>
    <div style={{ fontSize: strong ? '1.2rem' : '0.95rem', fontWeight: 800, color: strong ? '#059669' : tone, whiteSpace: 'nowrap' }}>{sign}{money(value)}</div>
  </div>
);

const SettlementBadge = ({ status }) => {
  const s = SETTLEMENT[status] || { label: status || '—', bg: '#f1f5f9', color: '#475569' };
  return <span style={{ padding: '3px 10px', borderRadius: '9999px', background: s.bg, color: s.color, fontSize: '0.7rem', fontWeight: 800, whiteSpace: 'nowrap' }}>{s.label}</span>;
};

const Th = ({ children, right }) => <th style={{ padding: '11px 10px', fontWeight: 800, whiteSpace: 'nowrap', textAlign: right ? 'right' : 'left' }}>{children}</th>;

const SuperAdminPaymentsView = () => {
  const [range, setRange] = useState('30d');
  const [custom, setCustom] = useState({ from: '', to: todayIso() });
  const [city, setCity] = useState('all');
  const [status, setStatus] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput.trim()); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const customReady = range !== 'custom' || (custom.from && custom.to && custom.from <= custom.to);
  const rangeParams = useMemo(() => {
    const p = range === 'custom' ? { range, from: custom.from, to: custom.to } : { range };
    return city !== 'all' ? { ...p, city } : p;
  }, [range, custom.from, custom.to, city]);
  const txParams = useMemo(() => ({ ...rangeParams, status: status || undefined, search: search || undefined, page, limit: 15 }), [rangeParams, status, search, page]);

  const period = useQuery({
    queryKey: ['superAdmin', 'payments', 'period', rangeParams],
    queryFn: async () => (await superAdminService.getReportsOverview(rangeParams))?.data ?? null,
    enabled: !!customReady,
    placeholderData: keepPreviousData,
    retry: false,
  });
  const ledger = useQuery({
    queryKey: ['superAdmin', 'payments', 'ledger'],
    queryFn: async () => (await superAdminService.getPaymentsLedger())?.data ?? null,
    retry: false,
  });
  const tx = useQuery({
    queryKey: ['superAdmin', 'payments', 'transactions', txParams],
    queryFn: async () => (await superAdminService.getPaymentTransactions(txParams))?.data ?? null,
    enabled: !!customReady,
    placeholderData: keepPreviousData,
    retry: false,
  });

  const k = period.data?.kpis;
  const L = ledger.data;
  const t = tx.data;
  const changeRange = (id) => { setRange(id); setPage(1); };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await superAdminService.exportReport({ ...rangeParams, type: 'bookings' });
      const url = URL.createObjectURL(new Blob([res], { type: 'text/csv;charset=utf-8' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `norozz-transactions-${todayIso()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Could not export transactions. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const failed = period.isError || ledger.isError || tx.isError;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', minWidth: 0 }}>
      {/* Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
          {RANGES.map((x) => <button key={x.id} type="button" style={chipStyle(range === x.id)} onClick={() => changeRange(x.id)}>{x.label}</button>)}
          {range === 'custom' && (
            <>
              <input type="date" aria-label="From date" style={inputStyle} value={custom.from} max={custom.to || todayIso()} onChange={(e) => setCustom({ ...custom, from: e.target.value })} />
              <span style={{ color: '#94a3b8' }}>→</span>
              <input type="date" aria-label="To date" style={inputStyle} value={custom.to} min={custom.from} max={todayIso()} onChange={(e) => setCustom({ ...custom, to: e.target.value })} />
            </>
          )}
        </div>
        <select aria-label="City filter" value={city} onChange={(e) => { setCity(e.target.value); setPage(1); }} style={{ ...inputStyle, fontWeight: 700, minWidth: '160px' }}>
          <option value="all">All cities</option>
          {(period.data?.availableCities || []).map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {failed && (
        <div role="alert" style={{ ...card, padding: '14px 18px', borderColor: '#fecaca', background: '#fef2f2', color: '#b91c1c', fontSize: '0.85rem', fontWeight: 600 }}>
          Some payment data could not be loaded. Check your connection and press Refresh.
        </div>
      )}

      {/* 1. Selected period */}
      <section>
        <SectionHead title="Money flow" hint="Payments received from customers in the selected period, and where that money stands." />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', opacity: period.isFetching ? 0.75 : 1, transition: 'opacity .15s' }}>
          <Metric label="Received from customers" value={money(k?.gmv)} help={`${k?.transactions ?? 0} paid bookings, including GST`} accent="#2563eb" />
          <Metric label="Norozz earnings" value={money(k?.platformRevenue)} help="Commission and fees on jobs already completed" accent="#059669" color="#047857" />
          <Metric label="Partners' earnings" value={money(k?.partnerEarnings)} help={`${money(k?.settledPayout)} already paid out`} accent="#7c3aed" />
          <Metric label="Payouts pending" value={money(k?.pendingPayout)} help="Job completed, partner not yet paid" accent="#d97706" color="#b45309" />
          <Metric label="Held in escrow" value={money(k?.escrowHeld)} help="Customer paid, service not completed yet" accent="#0891b2" />
          <Metric label="Refunded to customers" value={money(k?.refunds)} help={`${money(k?.discounts)} given as discounts`} accent="#dc2626" color="#b91c1c" />
        </div>
      </section>

      {/* 2. All-time ledger */}
      <section>
        <SectionHead title="Platform position" hint="All-time figures from the accounting ledger. Not affected by the date filter above." />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          <div style={{ ...card, padding: '20px' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '6px' }}>How Norozz earns</div>
            {L ? (
              <>
                <LedgerLine label="Customer service fees" note="Charged to customers on top of the service price" value={L.platform.customerFees} />
                <LedgerLine label="Partner commission" note="Share kept from partners' job earnings" value={L.platform.partnerCommissions} sign="+ " />
                <LedgerLine label="Total platform earnings" value={L.platform.grossRevenue} tone="#0f172a" />
                <LedgerLine label="Payment gateway charges" note="Razorpay / UPI processing fees" value={L.platform.gatewayFees} tone="#b45309" sign="− " />
                <LedgerLine label="Net profit" value={L.platform.netRevenue} strong />
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginTop: '14px', padding: '10px 12px', background: '#f8fafc', borderRadius: '10px', fontSize: '0.76rem', color: '#64748b', lineHeight: 1.45 }}>
                  <Info size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{money(L.platform.refunds)} has been refunded to customers so far. It is tracked separately and is not part of the calculation above.</span>
                </div>
              </>
            ) : <div style={{ padding: '24px 0', color: '#64748b', fontSize: '0.88rem' }}>{ledger.isError ? 'Ledger unavailable.' : 'Loading…'}</div>}
          </div>

          <div style={{ ...card, padding: '20px' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '6px' }}>What Norozz currently owes</div>
            {L ? (
              <>
                <LedgerLine label="Partner wallet balances" note="Earned by partners, available to withdraw" value={L.liabilities.partnerWallets} />
                <LedgerLine label="Partner withdrawals in progress" note="Withdrawal requested, not yet transferred" value={L.liabilities.pendingWithdrawals} />
                <LedgerLine label="Customer wallet balances" note="Prepaid money customers can still spend" value={L.liabilities.customerWallets} />
                <LedgerLine label="Customer money held for bookings" note="Locked until the service is completed" value={L.liabilities.customerHeld} />
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginTop: '14px', padding: '10px 12px', background: '#f8fafc', borderRadius: '10px', fontSize: '0.76rem', color: '#64748b', lineHeight: 1.45 }}>
                  <Info size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{L.ledgerEntries} ledger entries recorded · {L.settledBookings} bookings fully settled.</span>
                </div>
              </>
            ) : <div style={{ padding: '24px 0', color: '#64748b', fontSize: '0.88rem' }}>{ledger.isError ? 'Ledger unavailable.' : 'Loading…'}</div>}
          </div>
        </div>
      </section>

      {/* 3. Transactions */}
      <section style={{ ...card, padding: '20px', minWidth: 0 }}>
        <SectionHead
          title={<>Transactions {t ? <span style={{ color: '#94a3b8', fontWeight: 600 }}>({t.total})</span> : null}</>}
          hint="Every paid booking in the selected period."
          right={
            <button type="button" onClick={handleExport} disabled={exporting || !customReady} style={{ ...chipStyle(false), display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#047857', borderColor: '#a7f3d0', background: '#ecfdf5' }}>
              <Download size={14} /> {exporting ? 'Exporting…' : 'Export CSV'}
            </button>
          }
        />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div role="tablist" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {STATUS_TABS.map((s) => (
              <button key={s.id} type="button" role="tab" aria-selected={status === s.id} style={chipStyle(status === s.id)} onClick={() => { setStatus(s.id); setPage(1); }}>{s.label}</button>
            ))}
          </div>
          <label style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
            <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '10px' }} />
            <input type="search" placeholder="Search booking ID or service" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} style={{ ...inputStyle, paddingLeft: '30px', width: '240px' }} />
          </label>
        </div>

        <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px', opacity: tx.isFetching ? 0.75 : 1 }}>
          <table style={{ width: '100%', minWidth: '760px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={headRow}>
                <Th>#</Th><Th>Date &amp; time</Th><Th>Booking</Th><Th>Customer / Partner</Th>
                <Th right>Paid</Th><Th right>Norozz</Th><Th right>Partner</Th><Th>Payout status</Th>
              </tr>
            </thead>
            <tbody>
              {!t?.items?.length ? (
                <tr><td colSpan={8} style={{ padding: '32px 16px', textAlign: 'center', color: '#64748b', fontSize: '0.88rem' }}>{t ? 'No transactions match these filters.' : 'Loading…'}</td></tr>
              ) : t.items.map((r, i) => (
                <tr key={r._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ ...td, width: '48px', color: '#94a3b8', fontWeight: 700 }}>{(t.page - 1) * t.limit + i + 1}</td>
                  <td style={{ ...td, whiteSpace: 'nowrap' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{fmtDate(r.txnDate)}</div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{fmtTime(r.txnDate)}</div>
                  </td>
                  <td style={td}>
                    <div style={{ fontWeight: 800, color: '#2563eb' }}>{r.bookingId}</div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{[r.packageName, r.city].filter(Boolean).join(' · ') || '—'}</div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'capitalize' }}>Paid by {r.paymentMethod || '—'}</div>
                  </td>
                  <td style={td}>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{r.customer || '—'}</div>
                    <div style={{ fontSize: '0.76rem', color: '#64748b' }}>{r.partner ? `Partner: ${r.partner}` : 'Partner: not assigned'}</div>
                  </td>
                  <td style={{ ...td, textAlign: 'right', whiteSpace: 'nowrap', fontWeight: 800, color: '#0f172a' }}>
                    {money2(r.amount)}
                    {r.refundAmount > 0 && <div style={{ fontSize: '0.72rem', color: '#b91c1c', fontWeight: 700 }}>Refunded {money2(r.refundAmount)}</div>}
                  </td>
                  <td style={{ ...td, textAlign: 'right', whiteSpace: 'nowrap', color: '#047857', fontWeight: 700 }}>{money2(r.platformRevenue)}</td>
                  <td style={{ ...td, textAlign: 'right', whiteSpace: 'nowrap' }}>{money2(r.partnerEarning)}</td>
                  <td style={{ ...td, whiteSpace: 'nowrap' }}><SettlementBadge status={r.financialStatus} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {t && t.totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '14px', fontSize: '0.8rem', color: '#64748b' }}>
            <span>Page {t.page} of {t.totalPages}</span>
            <button type="button" aria-label="Previous page" disabled={t.page <= 1} onClick={() => setPage((p) => p - 1)} style={{ ...chipStyle(false), padding: '6px 8px', opacity: t.page <= 1 ? 0.5 : 1 }}><ChevronLeft size={14} /></button>
            <button type="button" aria-label="Next page" disabled={t.page >= t.totalPages} onClick={() => setPage((p) => p + 1)} style={{ ...chipStyle(false), padding: '6px 8px', opacity: t.page >= t.totalPages ? 0.5 : 1 }}><ChevronRight size={14} /></button>
          </div>
        )}
      </section>
    </div>
  );
};

export default SuperAdminPaymentsView;
