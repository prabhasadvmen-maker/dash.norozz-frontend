import React from 'react';
import {
  LayoutDashboard,
  Briefcase,
  ShieldCheck,
  CalendarCheck,
  CreditCard,
  BarChart3,
  Headphones,
  User,
  LogOut,
  MapPin
} from 'lucide-react';

const DedicatedCitySidebar = ({ activeTab, setActiveTab, onLogout, assignedCity = 'Delhi NCR' }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: 'Live' },
    { id: 'partners', label: 'Partners', icon: Briefcase, badge: '185' },
    { id: 'partnerKyc', label: 'Partner KYC', icon: ShieldCheck, badge: '3 Pending' },
    { id: 'bookings', label: 'Bookings', icon: CalendarCheck, badge: 'Dispatch' },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'support', label: 'Support', icon: Headphones },
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
        {/* Assigned City Scope Header */}
        <div style={{
          padding: '10px 14px',
          background: 'var(--gradient-card-blue)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid #bfdbfe',
          marginBottom: '20px'
        }}>
          <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MapPin size={12} color="#2563eb" /> ASSIGNED JURISDICTION
          </div>
          <div style={{ fontSize: '0.98rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '2px' }}>
            {assignedCity} Operations
          </div>
        </div>

        {/* 9 Navigation Items */}
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
                  background: isActive ? 'linear-gradient(135deg, rgba(37,99,235,0.12) 0%, rgba(6,182,212,0.08) 100%)' : 'transparent',
                  color: isActive ? '#2563eb' : 'var(--text-secondary)',
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

export default DedicatedCitySidebar;
