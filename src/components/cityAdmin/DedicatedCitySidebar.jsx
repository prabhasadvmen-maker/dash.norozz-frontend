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
  Settings,
  HelpCircle
} from 'lucide-react';

const DedicatedCitySidebar = ({
  activeTab,
  setActiveTab,
  onLogout,
  collapsed,
  assignedCity = 'Delhi NCR',
  partnersCount = null,
  pendingKycCount = null
}) => {
  const mainMenuItems = [
    { id: 'dashboard', label: 'DASHBOARD', icon: LayoutDashboard, badge: 'Live' },
    { id: 'partners', label: 'PARTNERS', icon: Briefcase, badge: partnersCount !== null ? String(partnersCount) : '1' },
    { id: 'partnerKyc', label: 'PARTNER KYC', icon: ShieldCheck, badge: pendingKycCount !== null ? `${pendingKycCount} Pending` : '1 Pending' },
    { id: 'bookings', label: 'BOOKINGS', icon: CalendarCheck, badge: 'Dispatch' },
    { id: 'payments', label: 'PAYMENTS', icon: CreditCard },
    { id: 'reports', label: 'REPORTS', icon: BarChart3 },
  ];

  const bottomMenuItems = [
    { id: 'profile', label: 'PROFILE', icon: User },
    { id: 'settings', label: 'SETTINGS', icon: Settings },
    { id: 'support', label: 'HELP & SUPPORT', icon: HelpCircle },
  ];

  const sidebarWidth = collapsed ? '78px' : '260px';

  return (
    <aside style={{
      width: sidebarWidth,
      minWidth: sidebarWidth,
      background: 'linear-gradient(180deg, #09331E 0%, #062616 100%)',
      color: '#ffffff',
      height: '100vh',
      position: 'sticky',
      top: 0,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      borderRight: '1px solid rgba(255, 255, 255, 0.08)',
      boxShadow: '4px 0 24px rgba(0, 0, 0, 0.12)',
      zIndex: 40
    }}>
      {/* 1. Brand Header */}
      <div style={{ padding: collapsed ? '16px 10px 12px 10px' : '20px 16px 12px 16px', flexShrink: 0 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: collapsed ? '8px 4px' : '6px 10px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '14px',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
            flexShrink: 0
          }}>
            <img
              src="/logo.png"
              alt="NOROZZ"
              onError={(e) => { e.target.style.display = 'none'; }}
              style={{ width: '28px', height: '28px', objectFit: 'contain' }}
            />
          </div>

          {!collapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{
                fontSize: '1.05rem',
                fontWeight: '900',
                letterSpacing: '0.5px',
                color: '#ffffff',
                lineHeight: '1.1'
              }}>
                NOROZZ
              </div>
              <div style={{
                fontSize: '0.68rem',
                fontWeight: '700',
                color: '#34d399',
                letterSpacing: '0.5px',
                marginTop: '2px',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                overflow: 'hidden'
              }}>
                {assignedCity} Operations
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Main Menu Items Scrollable */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: collapsed ? '8px 8px' : '8px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        scrollbarWidth: 'none'
      }}>
        {mainMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: collapsed ? '12px 0' : '11px 14px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: '12px',
                background: isActive ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'transparent',
                color: isActive ? '#ffffff' : '#a7f3d0',
                border: isActive ? '1px solid #34d399' : '1px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontWeight: isActive ? '800' : '600',
                fontSize: '0.82rem',
                letterSpacing: '0.4px',
                boxShadow: isActive ? '0 4px 14px rgba(16, 185, 129, 0.35)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.color = '#ffffff';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#a7f3d0';
                }
              }}
            >
              <Icon size={18} color={isActive ? '#ffffff' : '#34d399'} style={{ flexShrink: 0 }} />

              {!collapsed && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  overflow: 'hidden'
                }}>
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.label}
                  </span>

                  {item.badge && (
                    <span style={{
                      fontSize: '0.65rem',
                      fontWeight: '800',
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      background: isActive ? 'rgba(255, 255, 255, 0.2)' : 'rgba(16, 185, 129, 0.15)',
                      color: isActive ? '#ffffff' : '#6ee7b7',
                      letterSpacing: '0.3px',
                      flexShrink: 0
                    }}>
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. Bottom Pinned Section: PROFILE, SETTINGS, HELP */}
      <div style={{
        flexShrink: 0,
        padding: collapsed ? '12px 8px 16px 8px' : '12px 12px 16px 12px',
        background: '#062616',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 -6px 16px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}>
        {!collapsed && (
          <div style={{ fontSize: '0.65rem', fontWeight: '800', color: '#6ee7b7', padding: '0 4px 4px 4px', letterSpacing: '0.6px', textTransform: 'uppercase' }}>
            SYSTEM MANAGEMENT
          </div>
        )}

        {bottomMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id || (item.id === 'support' && activeTab === 'help');
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: collapsed ? '10px 0' : '10px 14px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                background: isActive ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'transparent',
                color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.8)',
                transition: 'all 0.18s ease',
                fontWeight: isActive ? '800' : '600',
                fontSize: '0.8rem'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.color = '#ffffff';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                }
              }}
            >
              <Icon size={18} color={isActive ? '#ffffff' : '#34d399'} style={{ flexShrink: 0 }} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </div>
    </aside>
  );
};

export default DedicatedCitySidebar;
