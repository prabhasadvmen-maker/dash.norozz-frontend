import React from 'react';
import { TrendingUp, Building2, Users, Briefcase, CalendarCheck, IndianRupee } from 'lucide-react';
import { useSuperAdmin } from '../../hooks/useSuperAdmin.js';

const PlatformAnalyticsGrid = () => {
  const { dashboard, customers, partners, bookings, cityAdmins, isLoading } = useSuperAdmin();

  const overview = dashboard?.overview || dashboard || {};

  const gmv = overview.grossRevenue ?? overview.grossPlatformGmv ?? 0;
  const commission = overview.platformCommission ?? 0;
  const citiesCount = overview.totalCities ?? overview.operationalCities ?? (cityAdmins?.length || 0);
  const customersCount = overview.totalCustomers ?? overview.registeredCustomers ?? (customers?.length || 0);
  const partnersCount = overview.totalPartners ?? overview.verifiedPartners ?? (partners?.length || 0);
  const bookingsCount = overview.totalBookings ?? (bookings?.length || 0);

  const cards = [
    {
      title: 'Gross Platform GMV',
      value: `₹${Number(gmv).toLocaleString('en-IN')}`,
      icon: TrendingUp,
      color: '#10b981',
      bg: '#e8f5e9',
      subtext: 'Live Backend Revenue'
    },
    {
      title: 'Platform Commission (20%)',
      value: `₹${Number(commission).toLocaleString('en-IN')}`,
      icon: IndianRupee,
      color: '#10b981',
      bg: '#e8f5e9',
      subtext: 'Net Platform Revenue'
    },
    {
      title: 'Operational Cities',
      value: `${citiesCount} Cities`,
      icon: Building2,
      color: '#06b6d4',
      bg: '#e0f2fe',
      subtext: `${citiesCount} Active Cities`
    },
    {
      title: 'Registered Customers',
      value: Number(customersCount).toLocaleString('en-IN'),
      icon: Users,
      color: '#10b981',
      bg: '#e8f5e9',
      subtext: 'Live Database Count'
    },
    {
      title: 'Verified Partners',
      value: Number(partnersCount).toLocaleString('en-IN'),
      icon: Briefcase,
      color: '#0284c7',
      bg: '#e0f2fe',
      subtext: 'Live Database Count'
    },
    {
      title: 'Total Service Bookings',
      value: Number(bookingsCount).toLocaleString('en-IN'),
      icon: CalendarCheck,
      color: '#d97706',
      bg: '#fef3c7',
      subtext: 'Live Database Count'
    },
  ];

  return (
    <div style={{ marginBottom: '28px' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
        gap: '20px'
      }}>
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              style={{
                background: '#ffffff',
                borderRadius: '20px',
                padding: '24px 22px',
                border: '1px solid #f0f0f0',
                boxShadow: '0 8px 26px rgba(0, 0, 0, 0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.22s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.07)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 26px rgba(0, 0, 0, 0.03)';
              }}
            >
              {/* Top Icon Box */}
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '14px',
                background: card.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                <Icon size={24} color={card.color} />
              </div>

              {/* Big Bold Number */}
              <div style={{
                fontSize: '1.9rem',
                fontWeight: '800',
                color: '#0f172a',
                letterSpacing: '-0.5px',
                lineHeight: '1.2',
                marginBottom: '10px'
              }}>
                {isLoading ? '...' : card.value}
              </div>

              {/* Title & Subtitle */}
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#1e293b', lineHeight: '1.3' }}>
                  {card.title}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px', fontWeight: '500' }}>
                  {card.subtext}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlatformAnalyticsGrid;

