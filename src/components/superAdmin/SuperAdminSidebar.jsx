import React from 'react';
import {
  LayoutDashboard,
  Building2,
  MapPin,
  Tag,
  Gift,
  Users,
  Briefcase,
  Grid,
  Sparkles,
  Layers,
  Wrench,
  CalendarCheck,
  CreditCard,
  BarChart3,
  Bell,
  Settings,
  User,
  Star,
  LogOut,
  ShieldCheck,
  Image
} from 'lucide-react';

const SuperAdminSidebar = ({ activeTab, setActiveTab, onLogout, collapsed }) => {
  const menuItems = [
    { id: 'dashboard', label: 'DASHBOARD', icon: LayoutDashboard, badge: 'Analytics' },
    { id: 'cityAdmins', label: 'CITY ADMINS', icon: Building2, badge: 'Assign' },
    { id: 'cities', label: 'CITY MANAGEMENT', icon: MapPin, badge: 'Dynamic' },
    { id: 'coupons', label: 'COUPONS & PROMOS', icon: Tag, badge: 'Offers' },
    { id: 'banners', label: 'PROMOTIONAL BANNERS', icon: Image, badge: 'Hero Banners' },
    { id: 'referral', label: 'REFERRAL PROGRAM', icon: Gift, badge: 'Rewards' },
    { id: 'customers', label: 'CUSTOMERS', icon: Users },
    { id: 'partners', label: 'PARTNERS', icon: Briefcase },
    { id: 'categories', label: 'CATEGORIES', icon: Grid },
    { id: 'subCategories', label: 'SUB CATEGORIES', icon: Layers },
    { id: 'services', label: 'SERVICES', icon: Wrench },
    { id: 'bookings', label: 'BOOKINGS', icon: CalendarCheck },
    { id: 'payments', label: 'PAYMENTS', icon: CreditCard },
    { id: 'reviews', label: 'REVIEWS & RATINGS', icon: Star, badge: 'Moderation' },
    { id: 'reports', label: 'REPORTS', icon: BarChart3 },
    { id: 'notifications', label: 'NOTIFICATIONS', icon: Bell },
  ];

  const bottomItems = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
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
      {/* 1. Brand Header - 60px height matching Navbar */}
      <div style={{
        height: '60px',
        padding: collapsed ? '0 10px' : '0 14px',
        display: 'flex',
        alignItems: 'center',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        boxSizing: 'border-box',
        flexShrink: 0
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          width: '100%',
          padding: collapsed ? '6px 4px' : '6px 10px',
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
                fontSize: '1.15rem',
                fontWeight: '800',
                letterSpacing: '0.5px',
                color: '#ffffff',
                lineHeight: '1.2'
              }}>
                NOROZZ
              </div>
              <div style={{
                fontSize: '0.7rem',
                fontWeight: '600',
                color: '#6ee7b7',
                letterSpacing: '0.3px',
                marginTop: '1px'
              }}>
                Super Admin Panel
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Primary Navigation Menu */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: collapsed ? '0 10px 12px 10px' : '0 16px 12px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '5px'
      }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={collapsed ? item.label : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: collapsed ? '12px 10px' : '10px 14px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                fontSize: '0.82rem',
                fontWeight: isActive ? '800' : '600',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                background: isActive
                  ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.22) 0%, rgba(5, 150, 105, 0.18) 100%)'
                  : 'transparent',
                color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.72)',
                boxShadow: isActive ? '0 4px 14px rgba(16, 185, 129, 0.2)' : 'none',
                borderLeft: isActive ? '3px solid #34d399' : '3px solid transparent',
                transition: 'all 0.18s ease',
                letterSpacing: '0.3px'
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
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.72)';
                }
              }}
            >
              <Icon size={18} color={isActive ? '#34d399' : 'rgba(255, 255, 255, 0.75)'} style={{ flexShrink: 0 }} />

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
                      fontSize: '0.62rem',
                      fontWeight: '800',
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      background: isActive ? 'rgba(52, 211, 153, 0.25)' : 'rgba(255, 255, 255, 0.1)',
                      color: isActive ? '#6ee7b7' : '#94a3b8',
                      letterSpacing: '0.2px',
                      marginLeft: '6px',
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

      {/* 3. Bottom Action Buttons */}
      <div style={{
        flexShrink: 0,
        padding: collapsed ? '12px 10px 16px 10px' : '12px 16px 16px 16px',
        background: '#062616',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 -6px 16px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}>
        {bottomItems.map((item) => {
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
                padding: collapsed ? '10px' : '10px 14px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                fontSize: '0.85rem',
                fontWeight: isActive ? '700' : '500',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                background: isActive ? 'rgba(255, 255, 255, 0.14)' : 'transparent',
                color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.72)',
                transition: 'all 0.18s ease'
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
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.72)';
                }
              }}
            >
              <Icon size={18} color={isActive ? '#34d399' : 'rgba(255, 255, 255, 0.75)'} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </div>
    </aside>
  );
};

export default SuperAdminSidebar;
