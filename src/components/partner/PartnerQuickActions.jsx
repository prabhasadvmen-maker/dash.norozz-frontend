import { Calendar, CalendarDays, Wallet, Clock, HelpCircle, Star } from 'lucide-react';

const ACTIONS = [
  { id: 'bookings', title: 'My Bookings', hint: 'All assigned jobs', icon: Calendar, color: '#059669', bgColor: '#ecfdf5' },
  { id: 'calendar', title: 'Work Calendar', hint: 'Upcoming schedule', icon: CalendarDays, color: '#2563eb', bgColor: '#eff6ff' },
  { id: 'wallet', title: 'Wallet & Payouts', hint: 'Balance and withdrawals', icon: Wallet, color: '#7c3aed', bgColor: '#f5f3ff' },
  { id: 'availability', title: 'Availability', hint: 'Working hours', icon: Clock, color: '#0d9488', bgColor: '#f0fdfa' },
  { id: 'reviews', title: 'Ratings & Reviews', hint: 'Customer feedback', icon: Star, color: '#d97706', bgColor: '#fffbeb' },
  { id: 'support', title: 'Help & Support', hint: 'Contact operations', icon: HelpCircle, color: '#475569', bgColor: '#f1f5f9' },
];

const PartnerQuickActions = ({ onNavigateTab }) => (
  <section style={{ marginBottom: '28px' }}>
    <h3 style={{ fontSize: '1.05rem', fontWeight: '800', margin: '0 0 14px 0', color: '#0f172a' }}>Quick Actions</h3>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px' }}>
      {ACTIONS.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onNavigateTab?.(item.id)}
            style={{
              background: '#ffffff',
              borderRadius: '14px',
              padding: '14px 16px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              textAlign: 'left',
              cursor: 'pointer',
              width: '100%',
            }}
          >
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: item.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={19} color={item.color} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0f172a' }}>{item.title}</div>
              <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: '500', marginTop: '1px' }}>{item.hint}</div>
            </div>
          </button>
        );
      })}
    </div>
  </section>
);

export default PartnerQuickActions;
