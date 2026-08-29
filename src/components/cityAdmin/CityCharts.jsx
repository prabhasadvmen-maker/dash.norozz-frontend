import React from 'react';
import { TrendingUp, BarChart2, Zap, Award, Star } from 'lucide-react';
import { useCityAdmin } from '../../hooks/useCityAdmin.js';

const CityCharts = ({ selectedCity }) => {
  const { dashboard, bookings } = useCityAdmin();

  const totalB = dashboard?.totalBookings || bookings?.length || 0;
  const completedB = dashboard?.completedBookings || bookings?.filter((b) => ['completed', 'Completed', 'confirmed', 'Confirmed'].includes(b.status)).length || 0;
  const pendingB = dashboard?.pendingBookings || bookings?.filter((b) => ['pending', 'Pending', 'assigned', 'Assigned'].includes(b.status)).length || 0;
  const cancelledB = dashboard?.cancelledBookings || bookings?.filter((b) => ['cancelled', 'Cancelled', 'refunded', 'Refunded'].includes(b.status)).length || 0;

  const baseTotal = Math.max(1, completedB + pendingB + cancelledB || totalB || 1);
  const compPct = Math.round((completedB / baseTotal) * 100);
  const pendPct = Math.round((pendingB / baseTotal) * 100);
  const cancPct = Math.max(0, 100 - compPct - pendPct);

  const cityRevenueTrend = [
    { day: 'Mon', revenue: 18, bookings: 98 },
    { day: 'Tue', revenue: 22, bookings: 112 },
    { day: 'Wed', revenue: 20, bookings: 105 },
    { day: 'Thu', revenue: 25, bookings: 128 },
    { day: 'Fri', revenue: 28, bookings: 135 },
    { day: 'Sat', revenue: 35, bookings: 165 },
    { day: 'Sun', revenue: 32, bookings: 142 },
  ];

  const cityServicePerformance = [
    { name: 'AC Service & Repair', orders: '48 Orders', rating: '4.9 ⭐', efficiency: '98%', color: '#2563eb' },
    { name: 'Home Deep Cleaning', orders: '34 Orders', rating: '4.8 ⭐', efficiency: '96%', color: '#7c3aed' },
    { name: 'Salon for Women', orders: '28 Orders', rating: '4.9 ⭐', efficiency: '97%', color: '#ec4899' },
    { name: 'Plumbing & Leak Fixing', orders: '18 Orders', rating: '4.7 ⭐', efficiency: '94%', color: '#06b6d4' },
    { name: 'Washing Machine Repair', orders: '14 Orders', rating: '4.8 ⭐', efficiency: '95%', color: '#10b981' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '22px', marginBottom: '28px' }}>
      
      {/* 1. Revenue Chart */}
      <div className="mui-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={20} color="#2563eb" /> {selectedCity || 'Delhi NCR'} Revenue Chart (₹ Thousands)
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Daily gross revenue trends over the past week
            </p>
          </div>
          <span className="badge badge-blue">7 Days</span>
        </div>

        {/* Visual Bar Chart */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '160px', paddingTop: '20px', borderBottom: '1px solid var(--border-light)' }}>
          {cityRevenueTrend.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flex: 1 }}>
              <div
                style={{
                  width: '24px',
                  height: `${(item.revenue / 40) * 100}%`,
                  background: 'var(--gradient-brand)',
                  borderRadius: '6px 6px 0 0',
                  transition: 'all 0.3s ease'
                }}
                title={`Revenue: ₹${item.revenue}k`}
              ></div>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)' }}>{item.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Bookings Chart */}
      <div className="mui-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart2 size={20} color="#7c3aed" /> Bookings & Order Fulfillment
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Real-time daily dispatch & delivery breakdown
            </p>
          </div>
          <span className="badge badge-purple">Live Today</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: '700', marginBottom: '6px' }}>
              <span>Completed Orders ({compPct}%)</span>
              <span style={{ color: '#10b981' }}>{completedB} Orders</span>
            </div>
            <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
              <div style={{ width: `${compPct}%`, height: '100%', background: '#10b981' }}></div>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: '700', marginBottom: '6px' }}>
              <span>Pending Dispatch ({pendPct}%)</span>
              <span style={{ color: '#f59e0b' }}>{pendingB} Orders</span>
            </div>
            <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
              <div style={{ width: `${pendPct}%`, height: '100%', background: '#f59e0b' }}></div>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: '700', marginBottom: '6px' }}>
              <span>Cancelled ({cancPct}%)</span>
              <span style={{ color: '#ef4444' }}>{cancelledB} Orders</span>
            </div>
            <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
              <div style={{ width: `${cancPct}%`, height: '100%', background: '#ef4444' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Service Performance Chart */}
      <div className="mui-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={20} color="#06b6d4" /> Service Performance Ranking
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Top performing service categories in {selectedCity || 'Delhi NCR'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {cityServicePerformance.map((service, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontWeight: '800', color: service.color, fontSize: '0.85rem' }}>#{idx + 1}</span>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)' }}>{service.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{service.orders} • {service.rating}</div>
                </div>
              </div>
              <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>{service.efficiency} SLA</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default CityCharts;
