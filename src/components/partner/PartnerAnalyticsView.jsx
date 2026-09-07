import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  BarChart2,
  Calendar,
  CheckCircle2,
  DollarSign,
  Star,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronRight,
  Award,
  Layers,
  Zap,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { partnerService } from '../../services/partner.service.js';

const PartnerAnalyticsView = ({ currentUser }) => {
  const [period, setPeriod] = useState('thisMonth'); // 'thisMonth' | 'lastMonth'
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadAnalyticsData = async (selectedPeriod) => {
    try {
      setLoading(true);
      const res = await partnerService.getAnalytics(selectedPeriod);
      const payload = res.data?.data || res.data;
      if (payload) {
        setAnalyticsData(payload);
      }
    } catch (err) {
      console.warn('Failed to load partner analytics:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadAnalyticsData(period);
  }, [period]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadAnalyticsData(period);
  };

  // Metrics Data (from Backend API response)
  const jobsCount = analyticsData?.jobsCompleted ?? 0;
  const jobsGrowthText = analyticsData?.jobsGrowthText ?? '0% vs last month';

  const revenue = analyticsData?.totalRevenue ?? 0;
  const prevRevenue = analyticsData?.prevRevenue ?? 0;
  const revenueGrowthText = analyticsData?.revenueGrowthText ?? '0% vs last month';

  const avgRating = analyticsData?.avgRating ?? 5.0;
  const ratingText = analyticsData?.ratingText ?? 'Stable';

  const onTimeRate = analyticsData?.onTimeArrivalRate ?? '100%';
  const onTimeArrivalText = analyticsData?.onTimeArrivalText ?? '0% vs last month';

  const categoryStats = analyticsData?.categoryPerformance || [];

  const maxRevenueCat = Math.max(...categoryStats.map((c) => c.revenue || 1), 1);

  const maxCompareRevenue = Math.max(revenue, prevRevenue, 1);
  const revenueProgressPct = Math.min(Math.round((revenue / maxCompareRevenue) * 100), 100);
  const lastRevenueProgressPct = Math.min(Math.round((prevRevenue / maxCompareRevenue) * 100), 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1100px', margin: '0 auto' }}>
      
      {/* Top Header Card with Period Switcher */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '24px',
          padding: '24px 28px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.03)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(16, 185, 129, 0.25)',
              color: '#ffffff',
            }}
          >
            <TrendingUp size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
              Performance Analytics
            </h2>
            <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '2px 0 0 0', fontWeight: '600' }}>
              Real-time job completion, revenue trends, and customer satisfaction metrics
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Period Toggle Pill */}
          <div
            style={{
              display: 'flex',
              background: '#f1f5f9',
              borderRadius: '14px',
              padding: '4px',
              border: '1px solid #e2e8f0',
            }}
          >
            <button
              type="button"
              onClick={() => setPeriod('thisMonth')}
              style={{
                padding: '8px 20px',
                borderRadius: '10px',
                border: 'none',
                background: period === 'thisMonth' ? '#ffffff' : 'transparent',
                color: period === 'thisMonth' ? '#16a34a' : '#64748b',
                fontWeight: '800',
                fontSize: '0.85rem',
                cursor: 'pointer',
                boxShadow: period === 'thisMonth' ? '0 4px 12px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              This Month
            </button>
            <button
              type="button"
              onClick={() => setPeriod('lastMonth')}
              style={{
                padding: '8px 20px',
                borderRadius: '10px',
                border: 'none',
                background: period === 'lastMonth' ? '#ffffff' : 'transparent',
                color: period === 'lastMonth' ? '#16a34a' : '#64748b',
                fontWeight: '800',
                fontSize: '0.85rem',
                cursor: 'pointer',
                boxShadow: period === 'lastMonth' ? '0 4px 12px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              Last Month
            </button>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            style={{
              padding: '10px 14px',
              borderRadius: '12px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#475569',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Refresh Performance Data"
          >
            <RefreshCw size={18} className={isRefreshing ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {/* 4 KPI Metrics Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
        }}
      >
        {/* KPI 1: Jobs Completed */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '20px',
            padding: '22px 24px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 8px 24px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            justify: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '0.84rem', fontWeight: '700', color: '#64748b', marginBottom: '8px' }}>
              Jobs Completed
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: '900', color: '#0f172a', lineHeight: '1' }}>
              {loading ? <Loader2 size={24} className="spin" /> : jobsCount}
            </div>
          </div>
          <div style={{ marginTop: '14px', fontSize: '0.78rem', fontWeight: '700', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ArrowUpRight size={14} />
            <span>{jobsGrowthText}</span>
          </div>
        </div>

        {/* KPI 2: Total Revenue */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '20px',
            padding: '22px 24px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 8px 24px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            justify: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '0.84rem', fontWeight: '700', color: '#64748b', marginBottom: '8px' }}>
              Total Revenue
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: '900', color: '#16a34a', lineHeight: '1' }}>
              {loading ? <Loader2 size={24} className="spin" /> : `₹${Number(revenue).toLocaleString()}`}
            </div>
          </div>
          <div style={{ marginTop: '14px', fontSize: '0.78rem', fontWeight: '700', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ArrowUpRight size={14} />
            <span>{revenueGrowthText}</span>
          </div>
        </div>

        {/* KPI 3: Avg Rating */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '20px',
            padding: '22px 24px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 8px 24px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            justify: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '0.84rem', fontWeight: '700', color: '#64748b', marginBottom: '8px' }}>
              Avg Rating
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: '900', color: '#0f172a', lineHeight: '1', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>{avgRating}</span>
              <Star size={24} color="#eab308" fill="#eab308" />
            </div>
          </div>
          <div style={{ marginTop: '14px', fontSize: '0.78rem', fontWeight: '700', color: '#64748b' }}>
            {ratingText}
          </div>
        </div>

        {/* KPI 4: On-Time Arrival */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '20px',
            padding: '22px 24px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 8px 24px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            justify: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '0.84rem', fontWeight: '700', color: '#64748b', marginBottom: '8px' }}>
              On-Time Arrival
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: '900', color: '#16a34a', lineHeight: '1' }}>
              {onTimeRate}
            </div>
          </div>
          <div style={{ marginTop: '14px', fontSize: '0.78rem', fontWeight: '700', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ArrowUpRight size={14} />
            <span>{onTimeArrivalText}</span>
          </div>
        </div>
      </div>

      {/* Revenue Comparison Card */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '24px',
          padding: '26px 28px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.03)',
        }}
      >
        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: '0 0 20px 0' }}>
          Revenue Comparison vs Last Period
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Last Period Row */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.86rem', fontWeight: '700', color: '#64748b' }}>Last Period</span>
              <span style={{ fontSize: '0.94rem', fontWeight: '800', color: '#334155' }}>
                ₹{Number(prevRevenue).toLocaleString()}
              </span>
            </div>
            <div style={{ height: '14px', width: '100%', background: '#f1f5f9', borderRadius: '8px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${lastRevenueProgressPct}%`,
                  background: '#94a3b8',
                  borderRadius: '8px',
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
          </div>

          {/* This Period Row */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.86rem', fontWeight: '700', color: '#0f172a' }}>This Period</span>
              <span style={{ fontSize: '1rem', fontWeight: '900', color: '#16a34a' }}>
                ₹{Number(revenue).toLocaleString()}
              </span>
            </div>
            <div style={{ height: '14px', width: '100%', background: '#f1f5f9', borderRadius: '8px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${revenueProgressPct}%`,
                  background: 'linear-gradient(90deg, #16a34a 0%, #059669 100%)',
                  borderRadius: '8px',
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Category Performance Breakdown Card */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '24px',
          padding: '26px 28px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
            Category Performance
          </h3>
          <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#64748b', background: '#f1f5f9', padding: '4px 12px', borderRadius: '12px' }}>
            Service Wise Revenue Breakdown
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {categoryStats.map((cat, idx) => {
            const barWidth = Math.min(Math.round((cat.revenue / maxRevenueCat) * 100), 100);

            return (
              <div
                key={idx}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #f1f5f9',
                  borderRadius: '16px',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ flex: 1, minWidth: '180px' }}>
                  <div style={{ fontSize: '0.98rem', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                    {cat.name}
                  </div>
                  <div style={{ fontSize: '0.78rem', fontWeight: '600', color: '#64748b' }}>
                    {cat.jobs} {cat.jobs === 1 ? 'Job' : 'Jobs'} Completed
                  </div>
                </div>

                <div style={{ flex: 1, minWidth: '160px', maxWidth: '300px' }}>
                  <div style={{ height: '8px', width: '100%', background: '#e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${barWidth}%`,
                        background: '#16a34a',
                        borderRadius: '6px',
                      }}
                    />
                  </div>
                </div>

                <div style={{ textAlign: 'right', minWidth: '100px' }}>
                  <span style={{ fontSize: '1.08rem', fontWeight: '900', color: '#0f172a' }}>
                    ₹{Number(cat.revenue).toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default PartnerAnalyticsView;
