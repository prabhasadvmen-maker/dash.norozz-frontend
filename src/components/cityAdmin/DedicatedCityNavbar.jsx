import React from 'react';
import { Building2, Search, Bell, MapPin, RefreshCw, LogOut } from 'lucide-react';

const DedicatedCityNavbar = ({ currentUser, onLogout, onRefresh, refreshing, assignedCity = 'Delhi NCR' }) => {
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
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
          color: '#ffffff'
        }}>
          <Building2 size={24} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            NOROZZ <span className="gradient-text">{assignedCity.toUpperCase()} OPERATIONS</span>
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MapPin size={13} color="#2563eb" /> {assignedCity} Assigned Operational Jurisdiction
          </span>
        </div>
      </div>

      {/* City Search Bar */}
      <div style={{ position: 'relative', width: '360px' }}>
        <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
        <input
          type="text"
          className="form-input"
          placeholder={`Search ${assignedCity} partners, orders, KYC...`}
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
          <RefreshCw size={14} style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none', color: '#2563eb' }} />
          <span>Refresh</span>
        </button>

        {/* City Admin Profile Pill */}
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
            background: 'linear-gradient(135deg, #06b6d4, #2563eb)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '800',
            fontSize: '0.85rem'
          }}>
            C
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)' }}>
              City Operations Admin
            </span>
            <span style={{ fontSize: '0.68rem', color: '#2563eb', fontWeight: '700' }}>
              {assignedCity.toUpperCase()} MANAGER
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

export default DedicatedCityNavbar;
