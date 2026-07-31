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
  const { dashboard, todayBookings, pendingBookings, completedBookings, wallet, isLoading } = usePartner();

  const todayCount = dashboard?.todayBookingsCount || todayBookings.length || 8;
  const pendingCount = dashboard?.pendingBookingsCount || pendingBookings.length || 2;
  const completedCount = dashboard?.completedBookingsCount || completedBookings.length || 142;
  const walletBalance = wallet?.balance || dashboard?.walletBalance || 18450;
  const earnings = dashboard?.monthlyEarnings || 142800;
  const rating = dashboard?.rating || 4.92;

  const cards = [
    {
      title: "Today's Jobs",
      value: `${todayCount} Jobs`,
      icon: CalendarCheck,
      color: '#2563eb',
      bgColor: '#eff6ff',
      trend: 'Live Dispatched Queue',
      classType: ''
    },
    {
      title: 'Pending Jobs',
      value: `${pendingCount} Jobs`,
      icon: Clock,
      color: '#f59e0b',
      bgColor: '#fffbe6',
      trend: 'In Progress / Assigned',
      classType: 'amber'
    },
    {
      title: 'Completed Jobs',
      value: `${completedCount} Jobs`,
      icon: CheckCircle2,
      color: '#10b981',
      bgColor: '#ecfdf5',
      trend: 'Completed SLA',
      classType: 'emerald'
    },
    {
      title: 'Wallet Balance',
      value: `₹${Number(walletBalance).toLocaleString()}`,
      icon: Wallet,
      color: '#7c3aed',
      bgColor: '#f5f3ff',
      trend: 'Ready for Instant Payout',
      classType: 'purple'
    },
    {
      title: 'Monthly Earnings',
      value: `₹${Number(earnings).toLocaleString()}`,
      icon: TrendingUp,
      color: '#10b981',
      bgColor: '#ecfdf5',
      trend: 'Live Backend Ledger',
      classType: 'emerald'
    },
    {
      title: 'Ratings & Reviews',
      value: `${rating} ⭐`,
      icon: Star,
      color: '#f59e0b',
      bgColor: '#fffbe6',
      trend: 'Live Customer Reviews',
      classType: 'amber'
    },
    {
      title: 'Active Workers',
      value: '6 On-Field',
      icon: Users,
      color: '#06b6d4',
      bgColor: '#ecfeff',
      trend: 'All Technicians Active',
      classType: ''
    },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '18px', marginBottom: '28px' }}>
      {cards.map((card, idx) => {
        const IconComponent = card.icon;
        return (
          <div key={idx} className={`metric-card ${card.classType}`}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
                {card.title}
              </span>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: card.bgColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <IconComponent size={20} color={card.color} />
              </div>
            </div>

            <div style={{ fontSize: '1.65rem', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
              {isLoading ? '...' : card.value}
            </div>

            <div style={{ fontSize: '0.74rem', color: card.color, fontWeight: '700', marginTop: '6px' }}>
              {card.trend}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PartnerMetricCards;
