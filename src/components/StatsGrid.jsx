import React from 'react';
import { Users, ShieldAlert, UserCheck, ShieldCheck, TrendingUp, Cpu } from 'lucide-react';

const StatsGrid = ({ stats }) => {
  const cards = [
    {
      title: 'Total System Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: '#6366f1',
      bgGlow: 'rgba(99, 102, 241, 0.18)',
      trend: '+100% active',
      description: 'Registered DB accounts'
    },
    {
      title: 'Admins & SuperAdmins',
      value: stats?.totalAdmins || 0,
      icon: ShieldCheck,
      color: '#a855f7',
      bgGlow: 'rgba(168, 85, 247, 0.18)',
      trend: `${stats?.totalSuperAdmins || 0} Super Admin`,
      description: 'System Controllers'
    },
    {
      title: 'Active Accounts',
      value: stats?.activeUsers || 0,
      icon: UserCheck,
      color: '#10b981',
      bgGlow: 'rgba(16, 185, 129, 0.18)',
      trend: 'Operational',
      description: 'Fully permitted users'
    },
    {
      title: 'Blocked Accounts',
      value: stats?.blockedUsers || 0,
      icon: ShieldAlert,
      color: '#f43f5e',
      bgGlow: 'rgba(244, 63, 94, 0.18)',
      trend: stats?.blockedUsers > 0 ? 'Action Needed' : '0 Restricted',
      description: 'Restricted from login'
    },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '22px', marginBottom: '32px' }}>
      {cards.map((card, idx) => {
        const IconComponent = card.icon;
        return (
          <div
            key={idx}
            className="stat-card"
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
                {card.title}
              </span>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '14px',
                background: card.bgGlow,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `1px solid ${card.color}33`,
                boxShadow: `0 0 15px ${card.color}22`
              }}>
                <IconComponent size={22} color={card.color} />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '2.2rem', fontWeight: '800', letterSpacing: '-0.8px', color: 'var(--text-primary)' }}>
                {card.value}
              </span>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: '700',
                padding: '3px 8px',
                borderRadius: '9999px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--glass-border)',
                color: card.color
              }}>
                {card.trend}
              </span>
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <TrendingUp size={12} color="var(--text-muted)" /> {card.description}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsGrid;
