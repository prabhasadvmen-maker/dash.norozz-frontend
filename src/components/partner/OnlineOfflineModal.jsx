import React from 'react';
import { Zap, Power, ShieldAlert, CheckCircle2 } from 'lucide-react';

const OnlineOfflineModal = ({ isOpen, targetStatus, onClose, onConfirm, loading }) => {
  if (!isOpen) return null;

  const isGoingOnline = targetStatus === true;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#ffffff',
          borderRadius: '24px',
          padding: '32px 28px',
          maxWidth: '420px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 20px 50px rgba(0,0,0,0.18)',
          border: '1px solid var(--border-light)',
          animation: 'modalSlideUp 0.25s ease-out'
        }}
      >
        {/* Circle Icon Badge */}
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: isGoingOnline ? '#ecfdf5' : '#fef2f2',
            color: isGoingOnline ? '#10b981' : '#ef4444',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
            border: `2px solid ${isGoingOnline ? '#a7f3d0' : '#fecaca'}`
          }}
        >
          {isGoingOnline ? <Zap size={36} fill="#10b981" /> : <Power size={36} />}
        </div>

        {/* Title */}
        <h3 style={{ fontSize: '1.4rem', fontWeight: '900', marginBottom: '10px', color: '#0f172a' }}>
          {isGoingOnline ? 'Go Online?' : 'Go Offline?'}
        </h3>

        {/* Description */}
        <p style={{ fontSize: '0.92rem', color: '#334155', marginBottom: '28px', lineHeight: '1.55', fontWeight: '600' }}>
          {isGoingOnline
            ? 'You will start receiving high-paying booking requests near your location instantly.'
            : 'You will pause receiving new customer booking requests. You can switch back online anytime.'}
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="btn"
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '14px',
              fontSize: '1rem',
              fontWeight: '800',
              background: isGoingOnline ? '#16a34a' : '#dc2626',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              boxShadow: isGoingOnline
                ? '0 6px 20px rgba(22, 163, 74, 0.35)'
                : '0 6px 20px rgba(220, 38, 38, 0.35)'
            }}
          >
            {loading ? 'Updating Status...' : isGoingOnline ? 'Go Online' : 'Go Offline'}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="btn"
            style={{
              width: '100%',
              padding: '13px',
              borderRadius: '14px',
              fontSize: '0.95rem',
              fontWeight: '700',
              background: '#f1f5f9',
              color: '#334155',
              border: '1px solid #cbd5e1',
              cursor: 'pointer'
            }}
          >
            {isGoingOnline ? 'Stay Offline' : 'Stay Online'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default OnlineOfflineModal;
