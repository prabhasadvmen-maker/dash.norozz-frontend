import React from 'react';
import { Crown, Search, Bell, RefreshCw, LogOut, UserCheck } from 'lucide-react';

const SuperAdminNavbar = ({ currentUser, onLogout, onRefresh, refreshing }) => {
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
            NOROZZ <span className="gradient-text">SUPER ADMIN PANEL</span>
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span className="dot-pulse dot-pulse-active"></span> Isolated Master Control • Full System Rights
          </span>
        </div>
      </div>

      {/* Global Search Bar */}
      <div style={{ position: 'relative', width: '380px' }}>
        <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
        <input
          type="text"
          className="form-input"
          placeholder="Search City Admins, Categories, Services, Cities..."
          style={{
            paddingLeft: '40px',
            paddingRight: '50px',
            background: '#f8fafc',
            borderRadius: '9999px',
            fontSize: '0.88rem'
          }}
        />
        <span style={{
          position: 'absolute',
          right: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: '0.7rem',
          background: '#e2e8f0',
          padding: '2px 6px',
          borderRadius: '4px',
          color: 'var(--text-secondary)',
          fontWeight: '600'
        }}>
          ⌘K
        </span>
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
          <RefreshCw size={14} style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none', color: '#7c3aed' }} />
          <span>Refresh</span>
        </button>

        {/* Super Admin Profile Pill */}
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
            {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'S'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)' }}>
              {currentUser?.name || 'Super Admin'}
            </span>
            <span style={{ fontSize: '0.68rem', color: 'var(--accent-purple)', fontWeight: '700' }}>
              MASTER CONTROL
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

export default SuperAdminNavbar;
