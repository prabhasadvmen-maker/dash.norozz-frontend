import React from 'react';
import {
  CalendarCheck,
  Clock,
  CheckCircle2,
  Wallet,
  TrendingUp,
  Star,
  Users
} from 'lucide-react';
import { usePartner } from '../../hooks/usePartner.js';

const PartnerMetricCards = () => {
  const { dashboard, todayBookings, wallet, isLoading } = usePartner('dashboard');

  const todayEarnings = dashboard?.metrics?.todayEarnings ?? wallet?.todayEarnings ?? 0;
  const bookingsCount = dashboard?.metrics?.todayBookingsCount ?? dashboard?.todayBookingsCount ?? todayBookings?.length ?? 0;
  const rating = dashboard?.metrics?.rating ?? dashboard?.rating ?? 5.0;

  const cards = [
    {
      title: "Today's Earnings",
      value: `₹${Number(todayEarnings).toLocaleString()}`,
      subtitle: 'Real-time Earnings',
      icon: TrendingUp,
      color: '#10b981',
      bgColor: '#ecfdf5',
    },
    {
      title: 'Bookings',
      value: `${bookingsCount} Jobs`,
      subtitle: 'Dispatched Today',
      icon: CalendarCheck,
      color: '#2563eb',
      bgColor: '#eff6ff',
    },
    {
      title: 'Rating',
      value: `${rating} ⭐`,
      subtitle: 'Customer Ratings',
      icon: Star,
      color: '#f59e0b',
      bgColor: '#fffbe6',
    },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginBottom: '24px' }}>
      {cards.map((card, idx) => {
        const IconComponent = card.icon;
        return (
          <div
            key={idx}
            style={{
              background: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              padding: '20px 22px',
              border: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: '800', color: '#334155' }}>
                {card.title}
              </span>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: card.bgColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <IconComponent size={20} color={card.color} />
              </div>
            </div>

            <div style={{ fontSize: '1.75rem', fontWeight: '900', color: card.color, letterSpacing: '-0.5px' }}>
              {isLoading ? '...' : card.value}
            </div>

            <div style={{ fontSize: '0.78rem', color: '#475569', fontWeight: '700', marginTop: '6px' }}>
              {card.subtitle}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PartnerMetricCards;
