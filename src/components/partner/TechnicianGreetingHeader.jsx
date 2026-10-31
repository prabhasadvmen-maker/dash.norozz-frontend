// TechnicianGreetingHeader.jsx
import { Power, ZapOff } from 'lucide-react';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

const TechnicianGreetingHeader = ({ currentUser, categoryNames, isOnline, onToggleOnlineClick }) => {
  const techName = currentUser?.name || 'Service Partner';
  const firstName = techName.split(' ')[0];
  const category = categoryNames || 'Service Technician';
  const partnerCode = currentUser?._id ? `NZP-${String(currentUser._id).slice(-4).toUpperCase()}` : '';
  const profileImg = currentUser?.profileImage;
  const accent = isOnline ? '#059669' : '#dc2626';

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
        marginBottom: '24px',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: 0 }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            {profileImg ? (
              <img src={profileImg} alt={techName} style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #e2e8f0' }} />
            ) : (
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, #059669, #0f766e)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1.35rem' }}>
                {techName.charAt(0).toUpperCase()}
              </div>
            )}
            <span
              aria-hidden="true"
              style={{ position: 'absolute', bottom: '1px', right: '1px', width: '14px', height: '14px', borderRadius: '50%', background: isOnline ? '#10b981' : '#ef4444', border: '2px solid #ffffff' }}
            />
          </div>

          <div style={{ minWidth: 0 }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '800', margin: 0, color: '#0f172a', letterSpacing: '-0.3px' }}>
              {getGreeting()}, {firstName}
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0 0', fontWeight: '600', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <span>{category}</span>
              {partnerCode && (
                <span style={{ fontFamily: 'monospace', fontWeight: '700', color: '#334155', background: '#f1f5f9', padding: '1px 8px', borderRadius: '6px', fontSize: '0.78rem' }}>
                  {partnerCode}
                </span>
              )}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onToggleOnlineClick}
          aria-pressed={isOnline}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: '10px',
            fontSize: '0.88rem',
            fontWeight: '700',
            background: isOnline ? '#ecfdf5' : '#16a34a',
            color: isOnline ? '#047857' : '#ffffff',
            border: isOnline ? '1px solid #a7f3d0' : '1px solid #16a34a',
            cursor: 'pointer',
          }}
        >
          <Power size={16} />
          {isOnline ? 'Online · Go Offline' : 'Go Online'}
        </button>
      </div>

      {!isOnline && (
        <div style={{ padding: '12px 24px', background: '#fef2f2', borderTop: '1px solid #fecaca', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.84rem', fontWeight: '600' }}>
          <ZapOff size={18} color={accent} style={{ flexShrink: 0 }} />
          <span>
            <strong>You are offline.</strong> Go online to start receiving booking requests near your area.
          </span>
        </div>
      )}
    </div>
  );
};

export default TechnicianGreetingHeader;
