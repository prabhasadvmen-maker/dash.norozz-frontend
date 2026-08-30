import React from 'react';
import {
  TrendingUp,
  BarChart2,
  Award,
  Sparkles,
  ShieldCheck,
  Users
} from 'lucide-react';

const AnalyticsCharts = () => {
  const topServices = [
    { rank: 1, name: 'AC Deep Cleaning & Service', bookings: '3,420', revenue: '₹41,04,000', rating: '4.9 ⭐', color: '#10b981' },
    { rank: 2, name: 'Full Home Deep Cleaning', bookings: '2,890', revenue: '₹34,68,000', rating: '4.8 ⭐', color: '#059669' },
    { rank: 3, name: 'Salon for Women - Facial & Spa', bookings: '2,150', revenue: '₹25,80,000', rating: '4.9 ⭐', color: '#0284c7' },
    { rank: 4, name: 'Plumbing Repair & Leak Fixing', bookings: '1,840', revenue: '₹14,72,000', rating: '4.7 ⭐', color: '#06b6d4' },
    { rank: 5, name: 'Washing Machine Repair', bookings: '1,210', revenue: '₹9,68,000', rating: '4.8 ⭐', color: '#d97706' },
  ];

  const topPartners = [
    { name: 'Rajesh Kumar', profession: 'AC Technician Master', rating: 4.95, completed: 840, earnings: '₹1,84,000', city: 'Delhi NCR' },
    { name: 'Priya Sharma', profession: 'Senior Beauty Therapist', rating: 4.92, completed: 720, earnings: '₹1,62,000', city: 'Mumbai' },
    { name: 'Amitabh Verma', profession: 'Master Plumber', rating: 4.88, completed: 690, earnings: '₹1,45,000', city: 'Bengaluru' },
    { name: 'Sunil Malhotra', profession: 'Electrical Expert', rating: 4.85, completed: 610, earnings: '₹1,28,000', city: 'Hyderabad' },
  ];

  const userRegistrations = [
    { month: 'Mar', count: 120 },
    { month: 'Apr', count: 240 },
    { month: 'May', count: 380 },
    { month: 'Jun', count: 510 },
    { month: 'Jul', count: 720 },
    { month: 'Aug', count: 950 },
  ];

  const financialTrends = [
    { month: 'Mar', revenue: 4.2, expenses: 1.1 },
    { month: 'Apr', revenue: 4.8, expenses: 1.3 },
    { month: 'May', revenue: 5.4, expenses: 1.4 },
    { month: 'Jun', revenue: 5.1, expenses: 1.2 },
    { month: 'Jul', revenue: 5.8, expenses: 1.5 },
    { month: 'Aug', revenue: 6.0, expenses: 1.6 },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '24px', marginBottom: '28px' }}>
      
      {/* 1. User Registrations Chart Card (Image 2 style) */}
      <div style={{
        background: '#ffffff',
        borderRadius: '20px',
        padding: '26px',
        border: '1px solid #f0f0f0',
        boxShadow: '0 8px 26px rgba(0, 0, 0, 0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={20} color="#10b981" /> User Registrations
            </h3>
            <p style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '3px' }}>
              USER REGISTRATIONS (LAST 6 MONTHS)
            </p>
          </div>
          <span style={{
            fontSize: '0.75rem',
            fontWeight: '700',
            padding: '4px 12px',
            borderRadius: '9999px',
            background: '#e6f4ea',
            color: '#047857',
            border: '1px solid #a7f3d0'
          }}>
            Monthly
          </span>
        </div>

        {/* Visual Bar Chart */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '170px', paddingTop: '20px', borderBottom: '1px solid #f1f5f9' }}>
          {userRegistrations.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
              <div style={{
                width: '24px',
                height: `${(item.count / 1000) * 100}%`,
                background: 'linear-gradient(180deg, #10b981 0%, #059669 100%)',
                borderRadius: '6px 6px 0 0',
                transition: 'all 0.3s ease'
              }} title={`${item.count} Registrations`} />
              <span style={{ fontSize: '0.76rem', fontWeight: '700', color: '#64748b' }}>{item.month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Monthly Financial Trends (Income vs Expenses) (Image 2 style) */}
      <div style={{
        background: '#ffffff',
        borderRadius: '20px',
        padding: '26px',
        border: '1px solid #f0f0f0',
        boxShadow: '0 8px 26px rgba(0, 0, 0, 0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={20} color="#047857" /> Monthly Financial Trends (Income vs Expenses)
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '6px', fontSize: '0.75rem', fontWeight: '700' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#047857' }}>
                <span style={{ width: '8px', height: '8px', background: '#047857', borderRadius: '50%' }}></span> Revenue
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444' }}>
                <span style={{ width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%' }}></span> Expenses
              </div>
            </div>
          </div>
          <span style={{
            fontSize: '0.75rem',
            fontWeight: '700',
            padding: '4px 12px',
            borderRadius: '9999px',
            background: '#ffe4e6',
            color: '#be123c',
            border: '1px solid #fecdd3'
          }}>
            Live Trend
          </span>
        </div>

        {/* Visual Dual Bar Chart */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '170px', paddingTop: '20px', borderBottom: '1px solid #f1f5f9' }}>
          {financialTrends.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '130px' }}>
                {/* Revenue Bar */}
                <div style={{
                  width: '16px',
                  height: `${(item.revenue / 7) * 100}%`,
                  background: '#047857',
                  borderRadius: '4px 4px 0 0',
                  transition: 'all 0.3s ease'
                }} title={`Revenue: ₹${item.revenue}L`} />
                {/* Expenses Bar */}
                <div style={{
                  width: '10px',
                  height: `${(item.expenses / 7) * 100}%`,
                  background: '#f87171',
                  borderRadius: '4px 4px 0 0',
                  transition: 'all 0.3s ease'
                }} title={`Expenses: ₹${item.expenses}L`} />
              </div>
              <span style={{ fontSize: '0.76rem', fontWeight: '700', color: '#64748b' }}>{item.month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Top Services Ranking */}
      <div style={{
        background: '#ffffff',
        borderRadius: '20px',
        padding: '26px',
        border: '1px solid #f0f0f0',
        boxShadow: '0 8px 26px rgba(0, 0, 0, 0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={20} color="#10b981" /> Top Services Ranking
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px', fontWeight: '500' }}>
              Highest booked service categories this month
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {topServices.map((item) => (
            <div key={item.rank} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              background: '#f8fafc',
              borderRadius: '14px',
              border: '1px solid #f1f5f9'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontWeight: '800', color: item.color, fontSize: '0.9rem', width: '20px' }}>#{item.rank}</span>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0f172a' }}>{item.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.bookings} Bookings • {item.rating}</div>
                </div>
              </div>
              <span style={{ fontWeight: '800', color: '#0f172a', fontSize: '0.9rem' }}>{item.revenue}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Top Partners (Verified Professionals) */}
      <div style={{
        background: '#ffffff',
        borderRadius: '20px',
        padding: '26px',
        border: '1px solid #f0f0f0',
        boxShadow: '0 8px 26px rgba(0, 0, 0, 0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={20} color="#d97706" /> Top Partners (Service Professionals)
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px', fontWeight: '500' }}>
              Highest rated verified service partners
            </p>
          </div>
          <span style={{
            fontSize: '0.7rem',
            fontWeight: '700',
            padding: '3px 10px',
            borderRadius: '9999px',
            background: '#e6f4ea',
            color: '#047857',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <ShieldCheck size={12} /> VERIFIED
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {topPartners.map((partner, idx) => (
            <div key={idx} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              background: '#f8fafc',
              borderRadius: '14px',
              border: '1px solid #f1f5f9'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '800',
                  fontSize: '0.85rem'
                }}>
                  {partner.name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0f172a' }}>{partner.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{partner.profession} • {partner.city}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.88rem', fontWeight: '800', color: '#10b981' }}>{partner.earnings}</div>
                <div style={{ fontSize: '0.75rem', color: '#d97706', fontWeight: '700' }}>⭐ {partner.rating} ({partner.completed} Jobs)</div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default AnalyticsCharts;

