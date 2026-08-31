import {
  LayoutDashboard,
  CalendarCheck,
  Calendar,
  Clock,
  Wallet,
  Star,
  Headphones,
  User,
  UserCheck,
  FileText,
  Landmark,
  Gift,
  Settings,
  LogOut,
  Lock,
  ShieldCheck,
  Briefcase
} from 'lucide-react';
import { useState, useEffect } from 'react';

const DedicatedPartnerSidebar = ({
  activeTab,
  setActiveTab,
  onLogout,
  kycStatus = 'pending',
  currentUser,
  collapsed = false
}) => {
  const isApproved = kycStatus === 'approved';
  const [referralBonus, setReferralBonus] = useState(500);

  useEffect(() => {
    fetch('/api/partner/dashboard/referral', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.referralBonusAmount) {
          setReferralBonus(data.data.referralBonusAmount);
        }
      })
      .catch(() => {});
  }, []);

  const baseItems = [
    { id: 'dashboard', label: 'DASHBOARD', icon: LayoutDashboard },
    { id: 'profile', label: 'PROFILE OVERVIEW', icon: User },
    { id: 'editProfile', label: 'EDIT PROFILE', icon: UserCheck },
    { id: 'documents', label: 'MY DOCUMENTS', icon: FileText },
    { id: 'bankDetails', label: 'BANK DETAILS', icon: Landmark },
  ];

  const fullItems = [
    { id: 'dashboard', label: 'DASHBOARD', icon: LayoutDashboard },
    { id: 'bookings', label: 'BOOKINGS', icon: CalendarCheck, badge: 'Jobs' },
    { id: 'calendar', label: 'CALENDAR', icon: Calendar },
    { id: 'wallet', label: 'WALLET & PAYOUTS', icon: Wallet, badge: 'Payouts' },
    { id: 'profile', label: 'PROFILE OVERVIEW', icon: User },
    { id: 'editProfile', label: 'EDIT PROFILE', icon: UserCheck },
    { id: 'documents', label: 'MY DOCUMENTS', icon: FileText },
    { id: 'bankDetails', label: 'BANK DETAILS', icon: Landmark },
    { id: 'referral', label: 'REFERRAL PROGRAM', icon: Gift, badge: `₹${referralBonus}` },
    { id: 'reviews', label: 'REVIEWS', icon: Star },
    { id: 'availability', label: 'AVAILABILITY', icon: Clock },
  ];

  const mainMenuItems = isApproved ? fullItems : baseItems;

  const bottomMenuItems = [
    { id: 'settings', label: 'SETTINGS', icon: Settings },
    { id: 'support', label: 'HELP & SUPPORT', icon: Headphones },
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
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      flexShrink: 0,
      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      borderRight: '1px solid rgba(255, 255, 255, 0.08)',
      boxShadow: '4px 0 24px rgba(0, 0, 0, 0.12)',
      zIndex: 40
    }}>
      <div>
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
              width: '38px',
              height: '38px',
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
                style={{ width: '26px', height: '26px', objectFit: 'contain' }}
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
                  TECHNICIAN PORTAL
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 2. User Status Card */}
        {!collapsed && (
          <div style={{
            margin: '12px 12px 6px 12px',
            padding: '12px 14px',
            background: 'rgba(255, 255, 255, 0.06)',
            borderRadius: '14px',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Briefcase size={12} /> SERVICE TECHNICIAN
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#ffffff', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {currentUser?.name || 'Service Partner'}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#a7f3d0', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
              {isApproved ? (
                <span style={{ padding: '2px 8px', borderRadius: '9999px', background: 'rgba(16,185,129,0.2)', color: '#34d399', fontWeight: '800', fontSize: '0.65rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldCheck size={10} /> VERIFIED
                </span>
              ) : (
                <span style={{ padding: '2px 8px', borderRadius: '9999px', background: 'rgba(245,158,11,0.2)', color: '#fbbf24', fontWeight: '800', fontSize: '0.65rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Lock size={10} /> KYC PENDING
                </span>
              )}
            </div>
          </div>
        )}

        {/* 3. Main Navigation Items */}
        <div style={{
          padding: collapsed ? '8px 8px' : '8px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
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
      </div>

      {/* 4. Bottom Pinned Section */}
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
            SYSTEM & SUPPORT
          </div>
        )}

        {bottomMenuItems.map((item) => {
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

export default DedicatedPartnerSidebar;
