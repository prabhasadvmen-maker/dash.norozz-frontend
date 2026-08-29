import {
  LayoutDashboard,
  CalendarCheck,
  Calendar,
  Clock,
  Wallet,
  Receipt,
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

const DedicatedPartnerSidebar = ({ activeTab, setActiveTab, onLogout, kycStatus = 'pending', currentUser }) => {
  const isApproved = kycStatus === 'approved';

  // 1. Base Unlocked Items for Pending State
  const baseItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'profile', label: 'Profile Overview', icon: User },
    { id: 'editProfile', label: 'Edit Profile', icon: UserCheck },
    { id: 'documents', label: 'My Documents', icon: FileText },
    { id: 'bankDetails', label: 'Bank Details', icon: Landmark },
    { id: 'support', label: 'Support', icon: Headphones },
  ];

  // 2. Full Feature Set Unlocked after Approval
  const fullItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'bookings', label: 'Bookings', icon: CalendarCheck, badge: 'Jobs' },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'wallet', label: 'Wallet & Payouts', icon: Wallet, badge: 'Payouts' },
    { id: 'profile', label: 'Profile Overview', icon: User },
    { id: 'editProfile', label: 'Edit Profile', icon: UserCheck },
    { id: 'documents', label: 'My Documents', icon: FileText },
    { id: 'bankDetails', label: 'Bank Details', icon: Landmark },
    { id: 'referral', label: 'Referral Program', icon: Gift, badge: '₹500' },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'availability', label: 'Availability', icon: Clock },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'support', label: 'Support', icon: Headphones },
  ];

  const menuItems = isApproved ? fullItems : baseItems;

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
        {/* Service Partner Header */}
        <div style={{
          padding: '12px 14px',
          background: 'var(--gradient-card-purple)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid #ddd6fe',
          marginBottom: '20px'
        }}>
          <div style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--accent-purple)', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Briefcase size={12} /> SERVICE TECHNICIAN
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '2px' }}>
            {currentUser?.name || 'Service Partner'}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
            {isApproved ? (
              <span className="badge badge-success" style={{ fontSize: '0.62rem', padding: '1px 6px' }}><ShieldCheck size={10} /> VERIFIED TECHNICIAN</span>
            ) : (
              <span className="badge badge-warning" style={{ fontSize: '0.62rem', padding: '1px 6px' }}><Lock size={10} /> KYC PENDING</span>
            )}
          </div>
        </div>

        {/* Locked Warning Banner if Pending */}
        {!isApproved && (
          <div style={{
            padding: '10px 12px',
            background: '#fffbe6',
            borderRadius: 'var(--radius-md)',
            border: '1px solid #fef08a',
            fontSize: '0.74rem',
            color: '#92400e',
            fontWeight: '600',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Lock size={14} color="#d97706" style={{ flexShrink: 0 }} />
            <span>Bookings & Wallet features locked until KYC approval.</span>
          </div>
        )}

        {/* Dynamic Sidebar Items */}
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
                  background: isActive ? 'linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(236,72,153,0.08) 100%)' : 'transparent',
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

export default DedicatedPartnerSidebar;
