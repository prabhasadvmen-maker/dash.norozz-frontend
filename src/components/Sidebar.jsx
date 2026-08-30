import React from 'react';
import {
  LayoutDashboard,
  Users,
  Grid,
  MapPin,
  CalendarCheck,
  Briefcase,
  CreditCard,
  Tag,
  Bell,
  Headphones,
  BarChart3,
  Settings,
  User,
  LogOut,
  Sparkles,
  ChevronRight
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: 'Overview' },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'categories', label: 'Category Management', icon: Grid },
    { id: 'locations', label: 'Location Management', icon: MapPin },
    { id: 'bookings', label: 'Bookings', icon: CalendarCheck, badge: 'Live' },
    { id: 'partners', label: 'Partner Management', icon: Briefcase },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'coupons', label: 'Coupons', icon: Tag },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'tickets', label: 'Support Tickets', icon: Headphones },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <aside style={{
      width: '260px',
      background: 'rgba(17, 24, 39, 0.95)',
      borderRight: '1px solid var(--border-light)',
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      minHeight: 'calc(100vh - 68px)',
      flexShrink: 0,
      boxShadow: 'var(--shadow-md)'
    }}>
      <div>
        {/* Section Header */}
        <div style={{
          padding: '0 12px 14px 12px',
          fontSize: '0.72rem',
          fontWeight: '800',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.8px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <Sparkles size={14} color="#10b981" /> PLATFORM NAVIGATION
        </div>

        {/* Navigation Links */}
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
                  fontSize: '0.86rem',
                  borderRadius: 'var(--radius-md)',
                  background: isActive ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.12) 100%)' : 'transparent',
                  color: isActive ? '#34d399' : 'var(--text-secondary)',
                  border: isActive ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid transparent',
                  fontWeight: isActive ? '700' : '500',
                  boxShadow: isActive ? '0 4px 12px rgba(16, 185, 129, 0.15)' : 'none',
                  transition: 'all 0.2s ease',
                  width: '100%'
                }}
              >
                <Icon size={18} color={isActive ? '#34d399' : '#64748b'} />
                <span style={{ flex: 1, textAlign: 'left' }}>
                  {item.label}
                </span>
                {item.badge && (
                  <span className={`badge ${isActive ? 'badge-success' : 'badge-purple'}`} style={{ fontSize: '0.62rem', padding: '2px 6px' }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Logout Action at Bottom */}
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

export default Sidebar;
