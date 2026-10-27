import { useSuperAdmin } from '../hooks/useSuperAdmin.js';

const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const card = {
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '16px',
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
  padding: '22px',
  minWidth: 0,
};

const BarRow = ({ label, value, display, max, color }) => (
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '5px' }}>
      <span style={{ fontWeight: 700, color: '#334155' }}>{label}</span>
      <span style={{ fontWeight: 800, color: '#0f172a' }}>{display}</span>
    </div>
    <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden' }}>
      <div style={{ width: `${Math.max(0, Math.min(100, (value / max) * 100))}%`, height: '100%', background: color, borderRadius: '9999px' }} />
    </div>
  </div>
);

// Platform-wide booking and revenue breakdown, driven by the super-admin dashboard payload
const AnalyticsCharts = () => {
  const { dashboard, isLoading } = useSuperAdmin();
  const o = dashboard?.overview || {};
  const f = dashboard?.financialLedger || {};

  const statuses = [
    { label: 'Completed', value: o.completedBookings || 0, color: '#10b981' },
    { label: 'In progress / pending', value: o.pendingBookings || 0, color: '#f59e0b' },
    { label: 'Cancelled / refunded', value: o.cancelledBookings || 0, color: '#ef4444' },
  ];
  const statusMax = Math.max(1, ...statuses.map((s) => s.value));

  const money = [
    { label: 'Gross booking value', value: f.grossBookingValue || 0, color: '#2563eb' },
    { label: 'Customer platform fees', value: f.customerPlatformFees || 0, color: '#7c3aed' },
    { label: 'Partner commissions', value: f.partnerCommissions || 0, color: '#10b981' },
    { label: 'Refunds & adjustments', value: f.refundsAdjustments || 0, color: '#ef4444' },
    { label: 'Net platform revenue', value: f.netPlatformRevenue || 0, color: '#0891b2' },
  ];
  const moneyMax = Math.max(1, ...money.map((m) => Math.abs(m.value)));

  if (isLoading && !dashboard) {
    return <div style={{ ...card, color: '#64748b', textAlign: 'center' }}>Loading analytics…</div>;
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
      <div style={card}>
        <h4 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
          Booking Status <span style={{ color: '#94a3b8', fontWeight: 600 }}>({Number(o.totalBookings || 0).toLocaleString('en-IN')} total)</span>
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {statuses.map((s) => (
            <BarRow key={s.label} label={s.label} value={s.value} display={s.value.toLocaleString('en-IN')} max={statusMax} color={s.color} />
          ))}
        </div>
      </div>

      <div style={card}>
        <h4 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>Revenue Breakdown</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {money.map((m) => (
            <BarRow key={m.label} label={m.label} value={Math.abs(m.value)} display={inr(m.value)} max={moneyMax} color={m.color} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCharts;
