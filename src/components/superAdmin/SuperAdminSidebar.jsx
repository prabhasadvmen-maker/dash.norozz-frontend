import React from 'react';
import {
  LayoutDashboard,
  Building2,
  Users,
  Briefcase,
  Grid,
  Layers,
  Wrench,
  CalendarCheck,
  CreditCard,
  BarChart3,
  Bell,
  Settings,
  User,
  LogOut,
  Crown
} from 'lucide-react';

const SuperAdminSidebar = ({ activeTab, setActiveTab, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: 'Analytics' },
    { id: 'cityAdmins', label: 'City Admins', icon: Building2, badge: 'Assign' },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'partners', label: 'Partners', icon: Briefcase },
    { id: 'categories', label: 'Categories', icon: Grid },
    { id: 'subCategories', label: 'Sub Categories', icon: Layers },
    { id: 'services', label: 'Services', icon: Wrench },
    { id: 'bookings', label: 'Bookings', icon: CalendarCheck },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <aside style={{
      width: '255px',
      background: '#ffffff',
      borderRight: '1px solid var(--border-light)',
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      minHeight: 'calc(100vh - 74px)',
      flexShrink: 0,
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div>
        {/* Panel Badge */}
        <div style={{
          padding: '10px 14px',
          background: 'var(--gradient-card-purple)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid #ddd6fe',
          marginBottom: '20px'
        }}>
          <div style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--accent-purple)', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Crown size={12} fill="#7c3aed" /> MASTER CONTROL
          </div>
          <div style={{ fontSize: '0.98rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '2px' }}>
            Super Admin Panel
          </div>
        </div>

        {/* 13 Navigation Items */}
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
                  padding: '10px 14px',
                  fontSize: '0.86rem',
                  borderRadius: 'var(--radius-md)',
                  background: isActive ? 'linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(37,99,235,0.08) 100%)' : 'transparent',
                  color: isActive ? 'var(--accent-purple)' : 'var(--text-secondary)',
                  border: isActive ? '1px solid #ddd6fe' : '1px solid transparent',
                  fontWeight: isActive ? '700' : '500',
                  boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
                  transition: 'all 0.2s ease',
                  width: '100%'
                }}
              >
                <Icon size={17} color={isActive ? '#7c3aed' : '#64748b'} />
                <span style={{ flex: 1, textAlign: 'left' }}>
                  {item.label}
                </span>
                {item.badge && (
                  <span className={`badge ${isActive ? 'badge-purple' : 'badge-blue'}`} style={{ fontSize: '0.6rem', padding: '2px 6px' }}>
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

export default SuperAdminSidebar;
