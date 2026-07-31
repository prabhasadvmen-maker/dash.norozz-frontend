import React from 'react';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Calendar,
  Clock,
  Wallet,
  Receipt,
  Star,
  FileText,
  Headphones,
  User,
  LogOut,
  Briefcase,
  ShieldCheck
} from 'lucide-react';

const PartnerSidebar = ({ activeTab, setActiveTab, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: 'Overview' },
    { id: 'workers', label: 'Workers', icon: Users, badge: '6 Active' },
    { id: 'bookings', label: 'Bookings', icon: CalendarCheck, badge: 'Jobs' },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'availability', label: 'Availability', icon: Clock },
    { id: 'wallet', label: 'Wallet', icon: Wallet, badge: 'Payouts' },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'support', label: 'Support', icon: Headphones },
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
      minHeight: 'calc(100vh - 74px)',
      flexShrink: 0,
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div>
        {/* Partner Info Header */}
        <div style={{
          padding: '12px 14px',
          background: 'var(--gradient-card-purple)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid #ddd6fe',
          marginBottom: '20px'
        }}>
          <div style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--accent-purple)', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Briefcase size={12} /> BUSINESS PARTNER
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '2px' }}>
            CleanPro Services
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={12} color="#10b981" /> Verified Agency • Delhi NCR
          </div>
        </div>

        {/* 12 Navigation Items */}
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
                  background: isActive ? 'linear-gradient(135deg, rgba(124,58,237,0.1) 0%, rgba(37,99,235,0.08) 100%)' : 'transparent',
                  color: isActive ? 'var(--accent-purple)' : 'var(--text-secondary)',
                  border: isActive ? '1px solid #ddd6fe' : '1px solid transparent',
                  fontWeight: isActive ? '700' : '500',
                  boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
                  transition: 'all 0.2s ease',
                  width: '100%'
                }}
              >
                <Icon size={18} color={isActive ? '#7c3aed' : '#64748b'} />
                <span style={{ flex: 1, textAlign: 'left' }}>
                  {item.label}
                </span>
                {item.badge && (
                  <span className={`badge ${isActive ? 'badge-purple' : 'badge-blue'}`} style={{ fontSize: '0.62rem', padding: '2px 6px' }}>
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

export default PartnerSidebar;
