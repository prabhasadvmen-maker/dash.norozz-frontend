import React from 'react';
import { Home, CalendarCheck, Wallet, User } from 'lucide-react';

const FourItemBottomNav = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'bookings', label: 'Bookings', icon: CalendarCheck, badge: '2' },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: '#ffffff',
      borderTop: '1px solid var(--border-light)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      padding: '8px 12px 10px 12px',
      zIndex: 999,
      boxShadow: '0 -4px 20px rgba(0,0,0,0.06)'
    }}>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              color: isActive ? 'var(--accent-blue)' : 'var(--text-muted)',
              transition: 'all 0.2s ease',
              position: 'relative',
              flex: 1
            }}
          >
            <div style={{ position: 'relative' }}>
              <Icon size={22} color={isActive ? '#2563eb' : '#64748b'} />
              {item.badge && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-6px',
                  background: '#ef4444',
                  color: '#ffffff',
                  fontSize: '0.62rem',
                  fontWeight: '800',
                  padding: '1px 5px',
                  borderRadius: '9999px'
                }}>
                  {item.badge}
                </span>
              )}
            </div>
            <span style={{
              fontSize: '0.74rem',
              fontWeight: isActive ? '800' : '600'
            }}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default FourItemBottomNav;
