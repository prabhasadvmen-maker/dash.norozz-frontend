import React from 'react';
import { Briefcase, Search, Bell, RefreshCw, LogOut, ShieldCheck, Lock, Unlock } from 'lucide-react';

const DedicatedPartnerNavbar = ({ currentUser, onLogout, onRefresh, refreshing, kycStatus = 'pending', isOnline = true, onToggleOnlineClick }) => {
  const isApproved = kycStatus === 'approved';

  return (
    <header style={{
      background: '#ffffff',
      borderBottom: '1px solid var(--border-light)',
      padding: '14px 28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: 'var(--shadow-sm)'
    }}>
      {/* Brand Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <img
          src="/logo.png"
          alt="NOROZZ Logo"
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            objectFit: 'cover',
            boxShadow: '0 4px 14px rgba(0, 180, 216, 0.35)',
            border: '1px solid rgba(118, 215, 41, 0.3)'
          }}
        />
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            NOROZZ <span className="gradient-text">TECHNICIAN PORTAL</span>
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            {currentUser?.agencyName || currentUser?.name || 'Service Partner'} • {currentUser?.assignedCity || currentUser?.city || 'Delhi NCR'}
          </span>
        </div>
      </div>

      {/* KYC Status & Online Toggle Pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span className={`badge ${isApproved ? 'badge-success' : 'badge-warning'}`} style={{ padding: '6px 14px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
          {isApproved ? <ShieldCheck size={14} /> : <Lock size={14} />}
          {isApproved ? 'VERIFIED TECHNICIAN' : 'KYC PENDING APPROVAL'}
        </span>

        {/* Online / Offline Toggle Pill */}
        {onToggleOnlineClick && (
          <button
            type="button"
            onClick={onToggleOnlineClick}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '9999px',
              fontSize: '0.78rem',
              fontWeight: '700',
              background: isOnline ? '#ecfdf5' : '#fef2f2',
              color: isOnline ? '#059669' : '#dc2626',
              border: `1px solid ${isOnline ? '#a7f3d0' : '#fecaca'}`,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isOnline ? '#10b981' : '#ef4444' }} />
            <span>{isOnline ? 'Online' : 'Offline'}</span>
          </button>
        )}
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        
        {/* Refresh Data */}
        <button
          onClick={onRefresh}
          className="btn btn-secondary btn-sm"
          disabled={refreshing}
          title="Refresh Data"
        >
          <RefreshCw size={14} style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none', color: '#0052d4' }} />
          <span>Refresh</span>
        </button>

        {/* User Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '4px 12px 4px 6px',
          background: '#f8fafc',
          borderRadius: '9999px',
          border: '1px solid var(--border-light)'
        }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            background: 'var(--gradient-brand)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '800',
            fontSize: '0.85rem'
          }}>
            {(currentUser?.name || 'P')[0].toUpperCase()}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)' }}>
              {currentUser?.name || 'Service Partner'}
            </span>
            <span style={{ fontSize: '0.68rem', color: '#0052d4', fontWeight: '700' }}>
              {currentUser?.category || 'SERVICE TECHNICIAN'}
            </span>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="btn btn-danger btn-sm"
          title="Logout"
        >
          <LogOut size={16} /> Logout
        </button>

      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </header>
  );
};

export default DedicatedPartnerNavbar;
