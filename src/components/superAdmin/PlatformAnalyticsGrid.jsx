import React from 'react';
import { TrendingUp, Building2, Users, Briefcase, CalendarCheck, DollarSign } from 'lucide-react';
import { useSuperAdmin } from '../../hooks/useSuperAdmin.js';

const PlatformAnalyticsGrid = () => {
  const { dashboard, isLoading } = useSuperAdmin();

  const overview = dashboard?.overview || {};

  const gmv = overview.grossRevenue ?? dashboard?.grossPlatformGmv ?? 0;
  const commission = overview.platformCommission ?? dashboard?.platformCommission ?? 0;
  const citiesCount = overview.totalCities ?? overview.totalCityAdmins ?? dashboard?.operationalCities ?? 0;
  const customersCount = overview.totalCustomers ?? dashboard?.registeredCustomers ?? 0;
  const partnersCount = overview.totalPartners ?? dashboard?.verifiedPartners ?? 0;
  const bookingsCount = overview.totalBookings ?? dashboard?.totalBookings ?? 0;

  const cards = [
    { title: 'Gross Platform GMV', value: `₹${Number(gmv).toLocaleString()}`, icon: TrendingUp, color: '#2563eb', bg: '#eff6ff', trend: 'Live Gross Volume' },
    { title: 'Platform Commission (20%)', value: `₹${Number(commission).toLocaleString()}`, icon: DollarSign, color: '#7c3aed', bg: '#f5f3ff', trend: 'Net Platform Revenue' },
    { title: 'Operational Cities', value: `${citiesCount} Cities`, icon: Building2, color: '#06b6d4', bg: '#ecfeff', trend: `${citiesCount} Active Cities` },
    { title: 'Registered Customers', value: Number(customersCount).toLocaleString(), icon: Users, color: '#10b981', bg: '#ecfdf5', trend: 'Live Backend Count' },
    { title: 'Verified Partners', value: Number(partnersCount).toLocaleString(), icon: Briefcase, color: '#ec4899', bg: '#fdf2f8', trend: 'Live Backend Count' },
    { title: 'Total Service Bookings', value: Number(bookingsCount).toLocaleString(), icon: CalendarCheck, color: '#f59e0b', bg: '#fffbe6', trend: 'Live Backend Count' },
  ];

  return (
    <div style={{ marginBottom: '28px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-light)',
                borderLeft: `4px solid ${card.color}`,
                borderRadius: 0,
                padding: '18px 20px',
                boxShadow: 'var(--shadow-sm)',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--text-secondary)' }}>
                  {card.title}
                </span>
                <div style={{ width: '36px', height: '36px', borderRadius: 0, background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={18} color={card.color} />
                </div>
              </div>

              <div style={{ fontSize: '1.6rem', fontWeight: '900', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
                {isLoading ? '...' : card.value}
              </div>

              <div style={{ fontSize: '0.74rem', color: card.color, fontWeight: '800', marginTop: '6px' }}>
                {card.trend}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlatformAnalyticsGrid;
