import React from 'react';
import {
  TrendingUp,
  BarChart2,
  Award,
  Star,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Percent
} from 'lucide-react';

const AnalyticsCharts = () => {
  const topServices = [
    { rank: 1, name: 'AC Deep Cleaning & Service', bookings: '3,420', revenue: '₹41,04,000', rating: '4.9 ⭐', color: '#2563eb' },
    { rank: 2, name: 'Full Home Deep Cleaning', bookings: '2,890', revenue: '₹34,68,000', rating: '4.8 ⭐', color: '#7c3aed' },
    { rank: 3, name: 'Salon for Women - Facial & Spa', bookings: '2,150', revenue: '₹25,80,000', rating: '4.9 ⭐', color: '#ec4899' },
    { rank: 4, name: 'Plumbing Repair & Leak Fixing', bookings: '1,840', revenue: '₹14,72,000', rating: '4.7 ⭐', color: '#06b6d4' },
    { rank: 5, name: 'Washing Machine Repair', bookings: '1,210', revenue: '₹9,68,000', rating: '4.8 ⭐', color: '#10b981' },
  ];

  const topPartners = [
    { name: 'Rajesh Kumar', profession: 'AC Technician Master', rating: 4.95, completed: 840, earnings: '₹1,84,000', city: 'Delhi NCR' },
    { name: 'Priya Sharma', profession: 'Senior Beauty Therapist', rating: 4.92, completed: 720, earnings: '₹1,62,000', city: 'Mumbai' },
    { name: 'Amitabh Verma', profession: 'Master Plumber', rating: 4.88, completed: 690, earnings: '₹1,45,000', city: 'Bengaluru' },
    { name: 'Sunil Malhotra', profession: 'Electrical Expert', rating: 4.85, completed: 610, earnings: '₹1,28,000', city: 'Hyderabad' },
  ];

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

        {/* Progress Bar Distribution */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: '700', marginBottom: '8px' }}>
            <span>Completed (94.2%)</span>
            <span style={{ color: '#10b981' }}>12,940 Bookings</span>
          </div>
          <div style={{ height: '10px', background: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
            <div style={{ width: '94.2%', height: '100%', background: '#10b981', borderRadius: '9999px' }}></div>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: '700', marginBottom: '8px' }}>
            <span>Pending & In-Progress (4.6%)</span>
            <span style={{ color: '#f59e0b' }}>390 Bookings</span>
          </div>
          <div style={{ height: '10px', background: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
            <div style={{ width: '4.6%', height: '100%', background: '#f59e0b', borderRadius: '9999px' }}></div>
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: '700', marginBottom: '8px' }}>
            <span>Cancelled (1.2%)</span>
            <span style={{ color: '#ef4444' }}>180 Bookings</span>
          </div>
          <div style={{ height: '10px', background: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
            <div style={{ width: '1.2%', height: '100%', background: '#ef4444', borderRadius: '9999px' }}></div>
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
            <div key={item.rank} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
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
          {topPartners.map((partner, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--gradient-brand)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.85rem' }}>
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
