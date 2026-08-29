import {
  LayoutDashboard,
  Building2,
  MapPin,
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
  Crown,
  Sparkles,
  Star,
  Tag
} from 'lucide-react';

const SuperAdminSidebar = ({ activeTab, setActiveTab, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: 'ANALYTICS' },
    { id: 'cityAdmins', label: 'City Admins', icon: Building2, badge: 'ASSIGN' },
    { id: 'cities', label: 'City Management', icon: MapPin, badge: 'DYNAMIC' },
    { id: 'coupons', label: 'Coupons & Promos', icon: Tag, badge: 'OFFERS' },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'partners', label: 'Partners', icon: Briefcase },
    { id: 'categories', label: 'Categories', icon: Grid },
    { id: 'skills', label: 'Skill Management', icon: Sparkles, badge: 'ONBOARD' },
    { id: 'subCategories', label: 'Sub Categories', icon: Layers },
    { id: 'services', label: 'Services', icon: Wrench },
    { id: 'bookings', label: 'Bookings', icon: CalendarCheck },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'reviews', label: 'Reviews & Ratings', icon: Star, badge: 'MODERATION' },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <aside style={{
      width: '260px',
      background: '#0f172a',
      color: '#ffffff',
      borderRight: '2px solid #1e293b',
      padding: '20px 12px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      position: 'sticky',
      top: '74px',
      height: 'calc(100vh - 74px)',
      overflowY: 'auto',
      flexShrink: 0,
      boxShadow: '4px 0 20px rgba(0,0,0,0.15)'
    }}>
      <div>
        {/* Panel Badge */}
        <div style={{
          padding: '12px 14px',
          background: '#1e293b',
          border: '1px solid #334155',
          marginBottom: '20px',
          borderLeft: '4px solid #76d729'
        }}>
          <div style={{ fontSize: '0.68rem', fontWeight: '900', color: '#76d729', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Crown size={12} fill="#76d729" /> MASTER CONTROL
          </div>
          <div style={{ fontSize: '0.98rem', fontWeight: '800', color: '#ffffff', marginTop: '3px' }}>
            Super Admin Center
          </div>
        </div>

        {/* Navigation Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
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
                  fontSize: '0.85rem',
                  borderRadius: 0,
                  background: isActive ? '#1e293b' : 'transparent',
                  color: isActive ? '#ffffff' : '#94a3b8',
                  borderLeft: isActive ? '4px solid #76d729' : '4px solid transparent',
                  borderTop: 'none',
                  borderRight: 'none',
                  borderBottom: 'none',
                  fontWeight: isActive ? '800' : '600',
                  transition: 'all 0.15s ease',
                  width: '100%'
                }}
              >
                <Icon size={17} color={isActive ? '#76d729' : '#64748b'} />
                <span style={{ flex: 1, textAlign: 'left', letterSpacing: '0.2px' }}>
                  {item.label}
                </span>
                {item.badge && (
                  <span
                    style={{
                      fontSize: '0.58rem',
                      padding: '2px 6px',
                      background: isActive ? '#76d729' : '#334155',
                      color: isActive ? '#0f172a' : '#cbd5e1',
                      fontWeight: '800',
                      letterSpacing: '0.5px'
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Logout */}
      <div style={{ paddingTop: '16px', borderTop: '1px solid #1e293b', marginTop: '20px' }}>
        <button
          onClick={onLogout}
          className="btn btn-danger"
          style={{ width: '100%', justifyContent: 'flex-start', padding: '11px 14px', borderRadius: 0, background: '#ef4444', color: '#ffffff', border: 'none', fontWeight: '800' }}
        >
          <LogOut size={16} />
          <span>Exit System</span>
        </button>
      </div>
    </aside>
  );
};

export default SuperAdminSidebar;
