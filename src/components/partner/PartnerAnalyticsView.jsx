import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp,
  Star,
  RefreshCw,
  CheckCircle2,
  IndianRupee,
  Timer,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  AlertCircle,
  BarChart3,
} from 'lucide-react';
import { partnerService } from '../../services/partner.service.js';

const formatINR = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

const card = {
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '16px',
  boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
};

// Growth chip: green up, red down, neutral when flat or when there is nothing to compare against
const TrendChip = ({ pct, comparedTo }) => {
  if (pct == null) {
    return <span style={{ fontSize: '0.78rem', fontWeight: '600', color: '#94a3b8' }}>No data for {comparedTo}</span>;
  }
  const up = pct > 0;
  const down = pct < 0;
  const color = up ? '#15803d' : down ? '#b91c1c' : '#64748b';
  const bg = up ? '#f0fdf4' : down ? '#fef2f2' : '#f1f5f9';
  const Icon = up ? ArrowUpRight : down ? ArrowDownRight : Minus;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: '600', color: '#64748b' }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', padding: '2px 8px', borderRadius: '9999px', background: bg, color, fontWeight: '700' }}>
        <Icon size={13} /> {up ? '+' : ''}{pct}%
      </span>
      vs {comparedTo}
    </span>
  );
};

const KpiCard = ({ title, icon: Icon, iconColor, iconBg, value, footer, loading, muted }) => (
  <div style={{ ...card, padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{title}</span>
      <span style={{ width: '36px', height: '36px', borderRadius: '10px', background: iconBg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={18} color={iconColor} />
      </span>
    </div>
    {loading ? (
      <div style={{ height: '36px', width: '55%', borderRadius: '8px', background: '#f1f5f9' }} />
    ) : (
      <div style={{ fontSize: muted ? '1.2rem' : '1.9rem', fontWeight: '800', color: muted ? '#94a3b8' : '#0f172a', letterSpacing: '-0.5px', lineHeight: 1.2, minHeight: '36px', display: 'flex', alignItems: 'center' }}>
        {value}
      </div>
    )}
    <div style={{ minHeight: '22px', display: 'flex', alignItems: 'center' }}>{footer}</div>
  </div>
);

const PartnerAnalyticsView = () => {
  const [period, setPeriod] = useState('thisMonth'); // 'thisMonth' | 'lastMonth'
  const { data: response, isLoading, isFetching, error: queryError, refetch } = useQuery({
    queryKey: ['partner', 'analytics', period],
    queryFn: () => partnerService.getAnalytics(period),
    staleTime: 60 * 1000,
  });

  const data = response?.data || null;
  const loading = isLoading;
  const error = queryError ? (queryError.message || 'Could not load analytics.') : '';
  const load = () => refetch();

  const revenue = data?.totalRevenue ?? 0;
  const prevRevenue = data?.prevRevenue ?? 0;
  const maxRevenue = Math.max(revenue, prevRevenue, 1);
  const diff = revenue - prevRevenue;
  const categories = data?.categoryPerformance || [];
  const totalCategoryRevenue = categories.reduce((sum, c) => sum + (c.revenue || 0), 0);

  const periodLabel = data?.periodLabel || (period === 'thisMonth' ? 'This month' : 'Last month');
  const prevLabel = data?.prevPeriodLabel || 'previous month';
  const comparedTo = 'previous month';

  const hasRating = Number(data?.avgRating) > 0;

  const periodBtn = (id, label) => (
    <button
      type="button"
      onClick={() => setPeriod(id)}
      aria-pressed={period === id}
      style={{
        padding: '8px 18px',
        borderRadius: '8px',
        border: 'none',
        background: period === id ? '#ffffff' : 'transparent',
        color: period === id ? '#047857' : '#64748b',
        fontWeight: '700',
        fontSize: '0.84rem',
        cursor: 'pointer',
        boxShadow: period === id ? '0 1px 3px rgba(15,23,42,0.1)' : 'none',
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1100px' }}>
      {/* Header */}
      <div style={{ ...card, padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#ecfdf5', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={22} color="#059669" />
          </span>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Performance Analytics</h2>
            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '2px 0 0 0', fontWeight: '500' }}>
              Showing {periodLabel}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '10px', padding: '3px', border: '1px solid #e2e8f0' }}>
            {periodBtn('thisMonth', 'This Month')}
            {periodBtn('lastMonth', 'Last Month')}
          </div>
          <button
            type="button"
            onClick={load}
            disabled={isFetching}
            title="Refresh"
            aria-label="Refresh analytics"
            style={{ width: '38px', height: '38px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#ffffff', color: '#475569', cursor: isFetching ? 'default' : 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <RefreshCw size={16} className={isFetching ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {error && (
        <div role="alert" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', padding: '14px 18px', borderRadius: '12px', background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', fontSize: '0.86rem', fontWeight: '600' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} /> {error}
          </span>
          <button type="button" onClick={load} style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid #fca5a5', background: '#ffffff', color: '#b91c1c', fontWeight: '700', cursor: 'pointer' }}>
            Try again
          </button>
        </div>
      )}

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '16px' }}>
        <KpiCard
          title="Jobs Completed"
          icon={CheckCircle2}
          iconColor="#7c3aed"
          iconBg="#f5f3ff"
          loading={loading && !data}
          value={Number(data?.jobsCompleted ?? 0).toLocaleString('en-IN')}
          footer={<TrendChip pct={data?.jobsGrowthPct ?? null} comparedTo={comparedTo} />}
        />
        <KpiCard
          title="Total Revenue"
          icon={IndianRupee}
          iconColor="#059669"
          iconBg="#ecfdf5"
          loading={loading && !data}
          value={formatINR(revenue)}
          footer={<TrendChip pct={data?.revenueGrowthPct ?? null} comparedTo={comparedTo} />}
        />
        <KpiCard
          title="Average Rating"
          icon={Star}
          iconColor="#d97706"
          iconBg="#fffbeb"
          loading={loading && !data}
          muted={!hasRating}
          value={hasRating ? `${Number(data.avgRating).toFixed(1)} / 5` : 'No ratings yet'}
          footer={
            <span style={{ fontSize: '0.78rem', fontWeight: '600', color: '#64748b' }}>
              {hasRating ? `From ${data.totalRatings} customer review${data.totalRatings === 1 ? '' : 's'}` : 'Complete jobs to get rated'}
            </span>
          }
        />
        <KpiCard
          title="On-Time Arrival"
          icon={Timer}
          iconColor="#2563eb"
          iconBg="#eff6ff"
          loading={loading && !data}
          muted={!data?.onTimeArrivalRate || data.onTimeArrivalRate === 'N/A'}
          value={data?.onTimeArrivalRate && data.onTimeArrivalRate !== 'N/A' ? data.onTimeArrivalRate : 'Not tracked yet'}
          footer={<span style={{ fontSize: '0.78rem', fontWeight: '600', color: '#64748b' }}>Arrival tracking coming soon</span>}
        />
      </div>

      {/* Revenue comparison */}
      <div style={{ ...card, padding: '22px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '18px' }}>
          <h3 style={{ fontSize: '1.02rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Revenue Comparison</h3>
          <span style={{ fontSize: '0.8rem', fontWeight: '600', color: diff > 0 ? '#15803d' : diff < 0 ? '#b91c1c' : '#64748b' }}>
            {diff === 0 ? 'No change from the previous month' : `${diff > 0 ? '+' : '−'}${formatINR(Math.abs(diff))} vs the previous month`}
          </span>
        </div>

        {[
          { label: prevLabel, value: prevRevenue, color: '#94a3b8', strong: false },
          { label: periodLabel, value: revenue, color: '#059669', strong: true },
        ].map((row) => (
          <div key={row.label} style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.84rem', fontWeight: row.strong ? '700' : '600', color: row.strong ? '#0f172a' : '#64748b' }}>{row.label}</span>
              <span style={{ fontSize: '0.92rem', fontWeight: '800', color: row.strong ? '#047857' : '#334155' }}>{formatINR(row.value)}</span>
            </div>
            <div style={{ height: '12px', background: '#f1f5f9', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.round((row.value / maxRevenue) * 100)}%`, background: row.color, borderRadius: '6px', transition: 'width 0.4s ease' }} />
            </div>
          </div>
        ))}
      </div>

      {/* Category performance */}
      <div style={{ ...card, padding: '22px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.02rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Service-wise Performance</h3>
          <span style={{ fontSize: '0.76rem', fontWeight: '700', color: '#64748b', background: '#f1f5f9', padding: '4px 12px', borderRadius: '9999px' }}>
            {categories.length} service{categories.length === 1 ? '' : 's'}
          </span>
        </div>

        {categories.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 12px', color: '#64748b' }}>
            <BarChart3 size={30} color="#cbd5e1" style={{ display: 'block', margin: '0 auto 8px' }} />
            <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>No completed jobs in {periodLabel}</div>
            <div style={{ fontSize: '0.8rem', marginTop: '2px' }}>Your service-wise earnings will show up here.</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '520px' }}>
              <thead>
                <tr style={{ color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '800', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '8px 10px', textAlign: 'left', width: '48px' }}>Sr.</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left' }}>Service</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Jobs</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', width: '30%' }}>Share</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat, idx) => {
                  const share = totalCategoryRevenue > 0 ? Math.round((cat.revenue / totalCategoryRevenue) * 100) : 0;
                  return (
                    <tr key={cat.name} style={{ borderBottom: idx === categories.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 10px', color: '#64748b', fontWeight: '700', fontSize: '0.86rem' }}>{idx + 1}</td>
                      <td style={{ padding: '12px 10px', fontWeight: '700', color: '#0f172a', fontSize: '0.9rem' }}>{cat.name}</td>
                      <td style={{ padding: '12px 10px', textAlign: 'right', color: '#334155', fontWeight: '600', fontSize: '0.88rem' }}>{cat.jobs}</td>
                      <td style={{ padding: '12px 10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ flex: 1, height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${share}%`, background: '#059669', borderRadius: '4px' }} />
                          </div>
                          <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', minWidth: '34px', textAlign: 'right' }}>{share}%</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 10px', textAlign: 'right', fontWeight: '800', color: '#0f172a', fontSize: '0.92rem' }}>{formatINR(cat.revenue)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PartnerAnalyticsView;
