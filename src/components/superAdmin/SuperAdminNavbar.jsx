import React from 'react';
import { Crown, Search, RefreshCw, LogOut, ShieldAlert } from 'lucide-react';

const SuperAdminNavbar = ({ currentUser, onLogout, onRefresh, refreshing }) => {
  return (
    <header style={{
      background: '#0f172a',
      color: '#ffffff',
      borderBottom: '2px solid #1e293b',
      padding: '14px 28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
    }}>
      {/* Brand Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '42px',
          height: '42px',
          background: 'linear-gradient(135deg, #76d729 0%, #00b4d8 100%)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: '900',
          fontSize: '1.3rem',
          border: '1px solid #76d729'
        }}>
          N
        </div>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, letterSpacing: '0.5px', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            NOROZZ <span style={{ background: 'linear-gradient(135deg, #76d729, #00b4d8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: '900' }}>MASTER CONTROL</span>
          </h2>
          <span style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
            <span className="dot-pulse dot-pulse-active" style={{ width: '8px', height: '8px' }}></span>
            Super Admin Jurisdiction • High Security Operational Center
          </span>
        </div>
      </div>

      {/* Global Search Bar */}
      <div style={{ position: 'relative', width: '380px' }}>
        <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
        <input
          type="text"
          className="form-input"
          placeholder="Search City Admins, Categories, Services, Cities..."
          style={{
            paddingLeft: '40px',
            paddingRight: '50px',
            background: '#1e293b',
            border: '1px solid #334155',
            color: '#ffffff',
            fontSize: '0.85rem',
            outline: 'none'
          }}
        />
        <span style={{
          position: 'absolute',
          right: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: '0.7rem',
          background: '#334155',
          padding: '2px 6px',
          color: '#cbd5e1',
          fontWeight: '700'
        }}>
          ⌘K
        </span>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        
        {/* Refresh Data */}
        <button
          onClick={onRefresh}
          className="btn btn-sm"
          disabled={refreshing}
          style={{
            background: '#1e293b',
            color: '#00b4d8',
            border: '1px solid #334155',
            fontWeight: '700'
          }}
          title="Refresh Data"
        >
          <RefreshCw size={14} style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none', color: '#00b4d8' }} />
          <span>Sync Data</span>
        </button>

        {/* Super Admin Profile Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '6px 14px',
          background: '#1e293b',
          border: '1px solid #334155'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            background: 'linear-gradient(135deg, #76d729 0%, #0052d4 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '900',
            fontSize: '0.85rem'
          }}>
            {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'S'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#ffffff' }}>
              {currentUser?.name || 'Super Admin'}
            </span>
            <span style={{ fontSize: '0.65rem', color: '#76d729', fontWeight: '800', letterSpacing: '0.5px' }}>
              ROOT ACCESS
            </span>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="btn btn-danger btn-sm"
          style={{ background: '#ef4444', color: '#ffffff', border: 'none', fontWeight: '700' }}
          title="Logout"
        >
          <LogOut size={15} /> Exit
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
