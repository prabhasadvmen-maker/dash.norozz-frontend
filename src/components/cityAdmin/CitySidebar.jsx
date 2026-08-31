import React from 'react';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  CalendarCheck,
  CreditCard,
  Headphones,
  Bell,
  BarChart3,
  User,
  LogOut,
  MapPin,
  Sparkles
} from 'lucide-react';

const CitySidebar = ({ activeTab, setActiveTab, onLogout, selectedCity }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: 'Live' },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'partners', label: 'Partners', icon: Briefcase },
    { id: 'bookings', label: 'Bookings', icon: CalendarCheck, badge: 'Orders' },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'support', label: 'Support', icon: Headphones },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <aside style={{
      width: '250px',
      background: '#ffffff',
      borderRight: '1px solid var(--border-light)',
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      minHeight: '100vh',
      flexShrink: 0,
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div>
        {/* City Info Badge Header */}
        <div style={{
          padding: '12px 14px',
          background: 'var(--gradient-card-blue)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid #bfdbfe',
          marginBottom: '20px'
        }}>
          <div style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--accent-blue)', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MapPin size={12} /> CITY OPERATIONS
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '2px' }}>
            {selectedCity || 'Delhi NCR'}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            City Manager Operations Portal
          </div>
        </div>

        {/* 10 Navigation Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="btn"
                style={{
                  justifyContent: 'flex-start',
                  padding: '11px 14px',
                  fontSize: '0.88rem',
                  borderRadius: 'var(--radius-md)',
                  background: isActive ? 'linear-gradient(135deg, rgba(37,99,235,0.08) 0%, rgba(124,58,237,0.1) 100%)' : 'transparent',
                  color: isActive ? 'var(--accent-blue)' : 'var(--text-secondary)',
                  border: isActive ? '1px solid #bfdbfe' : '1px solid transparent',
                  fontWeight: isActive ? '700' : '500',
                  boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
                  transition: 'all 0.2s ease',
                  width: '100%'
                }}
              >
                <Icon size={18} color={isActive ? '#2563eb' : '#64748b'} />
                <span style={{ flex: 1, textAlign: 'left' }}>
                  {item.label}
                </span>
                {item.badge && (
                  <span className={`badge ${isActive ? 'badge-blue' : 'badge-purple'}`} style={{ fontSize: '0.62rem', padding: '2px 6px' }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Logout */}
      <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border-light)', marginTop: '20px' }}>
        <button
          onClick={onLogout}
          className="btn btn-danger"
          style={{ width: '100%', justifyContent: 'flex-start', padding: '11px 14px' }}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default CitySidebar;
