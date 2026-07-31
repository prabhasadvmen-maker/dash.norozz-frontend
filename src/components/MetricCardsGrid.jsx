import React from 'react';
import {
  Users,
  Briefcase,
  ShieldCheck,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  IndianRupee,
  TrendingUp,
  Percent,
  Grid,
  MapPin
} from 'lucide-react';

const MetricCardsGrid = ({ stats }) => {
  const cards = [
    {
      title: 'Total Customers',
      value: stats?.totalCustomers || '14,820',
      icon: Users,
      color: '#2563eb',
      bgColor: '#eff6ff',
      trend: '+12.5% this month',
      classType: ''
    },
    {
      title: 'Total Partners',
      value: stats?.totalPartners || '1,450',
      icon: Briefcase,
      color: '#7c3aed',
      bgColor: '#f5f3ff',
      trend: 'Verified Providers',
      classType: 'purple'
    },
    {
      title: 'Total Admins',
      value: stats?.totalAdmins || stats?.totalSuperAdmins || '3',
      icon: ShieldCheck,
      color: '#2563eb',
      bgColor: '#eff6ff',
      trend: 'Active Controllers',
      classType: ''
    },
    {
      title: "Today's Bookings",
      value: stats?.todayBookings || '342',
      icon: Calendar,
      color: '#06b6d4',
      bgColor: '#ecfeff',
      trend: 'Live Requests',
      classType: ''
    },
    {
      title: 'Pending Bookings',
      value: stats?.pendingBookings || '48',
      icon: Clock,
      color: '#f59e0b',
      bgColor: '#fffbe6',
      trend: 'Awaiting Partner',
      classType: 'amber'
    },
    {
      title: 'Completed Bookings',
      value: stats?.completedBookings || '12,940',
      icon: CheckCircle2,
      color: '#10b981',
      bgColor: '#ecfdf5',
      trend: '94.2% Success',
      classType: 'emerald'
    },
    {
      title: 'Cancelled Bookings',
      value: stats?.cancelledBookings || '180',
      icon: XCircle,
      color: '#ef4444',
      bgColor: '#fef2f2',
      trend: '1.2% Cancellation',
      classType: 'rose'
    },
    {
      title: "Today's Revenue",
      value: stats?.todayRevenue || '₹2,48,500',
      icon: IndianRupee,
      color: '#10b981',
      bgColor: '#ecfdf5',
      trend: '+18% vs yesterday',
      classType: 'emerald'
    },
    {
      title: 'Monthly Revenue',
      value: stats?.monthlyRevenue || '₹68,40,000',
      icon: TrendingUp,
      color: '#7c3aed',
      bgColor: '#f5f3ff',
      trend: 'Target Achieved',
      classType: 'purple'
    },
    {
      title: 'Platform Commission',
      value: stats?.platformCommission || '₹13,68,000',
      icon: Percent,
      color: '#2563eb',
      bgColor: '#eff6ff',
      trend: '20% Avg Share',
      classType: ''
    },
    {
      title: 'Total Services',
      value: stats?.totalServices || '84',
      icon: Grid,
      color: '#7c3aed',
      bgColor: '#f5f3ff',
      trend: '12 Categories',
      classType: 'purple'
    },
    {
      title: 'Total Cities',
      value: stats?.totalCities || '12',
      icon: MapPin,
      color: '#06b6d4',
      bgColor: '#ecfeff',
      trend: 'Operational Metro',
      classType: ''
    },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px', marginBottom: '28px' }}>
      {cards.map((card, idx) => {
        const IconComponent = card.icon;
        return (
          <div key={idx} className={`metric-card ${card.classType}`}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
                {card.title}
              </span>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: card.bgColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <IconComponent size={18} color={card.color} />
              </div>
            </div>

            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
              {card.value}
            </div>

            <div style={{ fontSize: '0.72rem', color: card.color, fontWeight: '700', marginTop: '6px' }}>
              {card.trend}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MetricCardsGrid;
