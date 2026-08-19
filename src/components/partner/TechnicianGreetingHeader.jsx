import React from 'react';
import { User, ShieldCheck } from 'lucide-react';

const TechnicianGreetingHeader = ({ currentUser, isOnline, onToggleOnlineClick }) => {
  const techName = currentUser?.name || 'Service Partner';
  const category = currentUser?.category || 'AC Technician';
  const partnerCode = currentUser?._id ? `NZP-${currentUser._id.slice(-4).toUpperCase()}` : 'NZP-9872';
  const profileImg = currentUser?.profileImage;

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        padding: '20px 24px',
        border: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '24px'
      }}
    >
      {/* Left: Avatar & Greeting */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ position: 'relative' }}>
          {profileImg ? (
            <img
              src={profileImg}
              alt={techName}
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid #2563eb'
              }}
            />
          ) : (
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '800',
                fontSize: '1.4rem'
              }}
            >
              {techName.charAt(0).toUpperCase()}
            </div>
          )}

          {/* Online Dot Overlay on Avatar */}
          <div
            style={{
              position: 'absolute',
              bottom: '2px',
              right: '2px',
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              background: isOnline ? '#10b981' : '#ef4444',
              border: '2px solid #ffffff'
            }}
          />
        </div>

        <div>
          <h2
            style={{
              fontSize: '1.35rem',
              fontWeight: '800',
              margin: 0,
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            Namaste, {techName} 🙏
          </h2>
          <p
            style={{
              fontSize: '0.84rem',
              color: 'var(--text-muted)',
              margin: '3px 0 0 0',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>{category}</span>
            <span>•</span>
            <span style={{ color: '#2563eb', fontFamily: 'monospace', fontWeight: '700' }}>{partnerCode}</span>
          </p>
        </div>
      </div>

      {/* Right: Live Online / Offline Toggle Pill */}
      <button
        type="button"
        onClick={onToggleOnlineClick}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 18px',
          borderRadius: '9999px',
          fontSize: '0.88rem',
          fontWeight: '700',
          background: isOnline ? '#ecfdf5' : '#fef2f2',
          color: isOnline ? '#059669' : '#dc2626',
          border: `1.5px solid ${isOnline ? '#a7f3d0' : '#fecaca'}`,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: isOnline
            ? '0 4px 12px rgba(16, 185, 129, 0.15)'
            : '0 4px 12px rgba(239, 68, 68, 0.15)'
        }}
      >
        <span
          style={{
            width: '9px',
            height: '9px',
            borderRadius: '50%',
            background: isOnline ? '#10b981' : '#ef4444',
            boxShadow: isOnline ? '0 0 8px #10b981' : 'none'
          }}
        />
        <span>{isOnline ? 'Online' : 'Offline'}</span>
      </button>
    </div>
  );
};

export default TechnicianGreetingHeader;
