import React from 'react';
import {
  TrendingUp,
  BarChart2,
  Award,
  Star,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { useSuperAdmin } from '../hooks/useSuperAdmin.js';

const AnalyticsCharts = () => {
  const { dashboard, bookings, partners } = useSuperAdmin();

  const overview = dashboard?.overview || {};
  const totalB = overview.totalBookings || bookings?.length || 0;
  const completedB = overview.completedBookings || bookings?.filter((b) => ['completed', 'Completed', 'confirmed', 'Confirmed'].includes(b.status)).length || 0;
  const pendingB = overview.pendingBookings || bookings?.filter((b) => ['pending', 'Pending', 'accepted', 'Accepted', 'In Progress'].includes(b.status)).length || 0;
  const cancelledB = overview.cancelledBookings || bookings?.filter((b) => ['cancelled', 'Cancelled', 'refunded', 'Refunded'].includes(b.status)).length || 0;

  const baseTotal = Math.max(1, completedB + pendingB + cancelledB || totalB || 1);
  const compPct = Math.round((completedB / baseTotal) * 100);
  const pendPct = Math.round((pendingB / baseTotal) * 100);
  const cancPct = Math.max(0, 100 - compPct - pendPct);

  // Dynamic Top Services derived from live bookings
  const topServicesMap = {};
  (bookings || []).forEach((b) => {
    const sName = b.serviceName || b.packageName || 'Home Service';
    if (!topServicesMap[sName]) {
      topServicesMap[sName] = { name: sName, bookings: 0, revenue: 0 };
    }
    topServicesMap[sName].bookings += 1;
    topServicesMap[sName].revenue += Number(b.totalAmount || b.amount || 0);
  });

  const dynamicServicesList = Object.values(topServicesMap)
    .sort((a, b) => b.bookings - a.bookings)
    .slice(0, 5)
    .map((s, idx) => ({
      rank: idx + 1,
      name: s.name,
      bookings: s.bookings.toLocaleString(),
      revenue: `₹${s.revenue.toLocaleString()}`,
      rating: '4.9 ⭐',
      color: ['#2563eb', '#7c3aed', '#ec4899', '#06b6d4', '#10b981'][idx % 5],
    }));

  const topServices = dynamicServicesList.length > 0 ? dynamicServicesList : [
    { rank: 1, name: 'AC Deep Cleaning & Service', bookings: '0', revenue: '₹0', rating: '4.9 ⭐', color: '#2563eb' },
    { rank: 2, name: 'Full Home Deep Cleaning', bookings: '0', revenue: '₹0', rating: '4.8 ⭐', color: '#7c3aed' },
  ];

  // Top Partners derived dynamically
  const dynamicPartners = (partners || []).slice(0, 4).map((p, idx) => ({
    name: p.name || 'Technician Partner',
    profession: p.category || 'Service Expert',
    rating: p.rating || 4.9,
    completed: p.totalJobs || 0,
    earnings: `₹${((p.walletBalance || 0)).toLocaleString()}`,
    city: p.assignedCity || p.city || 'Delhi NCR',
  }));

  const revenueData = [
    { month: 'Jan', revenue: 48, commission: 9.6 },
    { month: 'Feb', revenue: 54, commission: 10.8 },
    { month: 'Mar', revenue: 62, commission: 12.4 },
    { month: 'Apr', revenue: 58, commission: 11.6 },
    { month: 'May', revenue: 68, commission: 13.6 },
    { month: 'Jun', revenue: 75, commission: 15.0 },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '24px', marginBottom: '28px' }}>
      
      {/* 1. Revenue Analytics Chart */}
      <div className="mui-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={20} color="#2563eb" /> Revenue Analytics (₹ Lakhs)
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Monthly Gross Platform Revenue vs 20% Commission Share
            </p>
          </div>
          <span className="badge badge-blue">Monthly</span>
        </div>

        {/* Visual Bar Graph Simulation */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '180px', paddingTop: '20px', borderBottom: '1px solid var(--border-light)' }}>
          {revenueData.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '140px' }}>
                {/* Gross Revenue Bar */}
                <div
                  style={{
                    width: '18px',
                    height: `${(item.revenue / 80) * 100}%`,
                    background: 'var(--accent-blue)',
                    borderRadius: '4px 4px 0 0',
                    transition: 'all 0.3s ease'
                  }}
                  title={`Revenue: ₹${item.revenue} Lakhs`}
                ></div>
                {/* Commission Bar */}
                <div
                  style={{
                    width: '14px',
                    height: `${(item.commission / 80) * 100}%`,
                    background: 'var(--accent-purple)',
                    borderRadius: '4px 4px 0 0',
                    transition: 'all 0.3s ease'
                  }}
                  title={`Commission: ₹${item.commission} Lakhs`}
                ></div>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)' }}>{item.month}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', marginTop: '16px', fontSize: '0.8rem', fontWeight: '600' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', background: '#2563eb', borderRadius: '3px' }}></span> Gross Revenue
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', background: '#7c3aed', borderRadius: '3px' }}></span> Platform Commission
          </div>
        </div>
      </div>

      {/* 2. Booking Analytics Breakdown */}
      <div className="mui-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart2 size={20} color="#7c3aed" /> Booking Analytics & Fulfillment Rate
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Overall Service Request Status Distribution
            </p>
          </div>
          <span className="badge badge-purple">Live Distribution</span>
        </div>

        {/* Dynamic Progress Bar Distribution */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: '700', marginBottom: '8px' }}>
            <span>Completed ({compPct}%)</span>
            <span style={{ color: '#10b981' }}>{completedB} Bookings</span>
          </div>
          <div style={{ height: '10px', background: '#e2e8f0', borderRadius: 0, overflow: 'hidden' }}>
            <div style={{ width: `${compPct}%`, height: '100%', background: '#10b981', borderRadius: 0 }}></div>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: '700', marginBottom: '8px' }}>
            <span>Pending & In-Progress ({pendPct}%)</span>
            <span style={{ color: '#f59e0b' }}>{pendingB} Bookings</span>
          </div>
          <div style={{ height: '10px', background: '#e2e8f0', borderRadius: 0, overflow: 'hidden' }}>
            <div style={{ width: `${pendPct}%`, height: '100%', background: '#f59e0b', borderRadius: 0 }}></div>
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: '700', marginBottom: '8px' }}>
            <span>Cancelled ({cancPct}%)</span>
            <span style={{ color: '#ef4444' }}>{cancelledB} Bookings</span>
          </div>
          <div style={{ height: '10px', background: '#e2e8f0', borderRadius: 0, overflow: 'hidden' }}>
            <div style={{ width: `${cancPct}%`, height: '100%', background: '#ef4444', borderRadius: 0 }}></div>
          </div>
        </div>

      </div>

      {/* 3. Top Services Ranking */}
      <div className="mui-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={20} color="#06b6d4" /> Top Services Ranking
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Highest booked service categories this month
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {topServices.map((item) => (
            <div key={item.rank} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', borderRadius: 0, border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontWeight: '800', color: item.color, fontSize: '0.9rem', width: '20px' }}>#{item.rank}</span>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-primary)' }}>{item.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.bookings} Bookings • {item.rating}</div>
                </div>
              </div>
              <span style={{ fontWeight: '800', color: 'var(--text-primary)', fontSize: '0.9rem' }}>{item.revenue}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Top Partners (Verified Professionals) */}
      <div className="mui-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={20} color="#f59e0b" /> Top Partners (Service Professionals)
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Highest rated verified service partners
            </p>
          </div>
          <span className="badge badge-purple"><ShieldCheck size={10} /> VERIFIED</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {dynamicPartners.map((partner, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#f8fafc', borderRadius: 0, border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: 0, background: 'var(--gradient-brand)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.85rem' }}>
                  {partner.name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-primary)' }}>{partner.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{partner.profession} • {partner.city}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.88rem', fontWeight: '800', color: '#10b981' }}>{partner.earnings}</div>
                <div style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: '700' }}>⭐ {partner.rating} ({partner.completed} Jobs)</div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default AnalyticsCharts;
