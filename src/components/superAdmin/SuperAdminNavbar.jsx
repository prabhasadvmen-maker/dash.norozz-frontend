import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, Menu, LogOut, ChevronDown, User, ShieldCheck } from 'lucide-react';

const SuperAdminNavbar = ({
  currentUser,
  onLogout,
  onRefresh,
  refreshing,
  collapsed,
  setCollapsed,
  activeTitle = 'Overview'
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = () => setDropdownOpen(false);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <header style={{
      background: '#ffffff',
      borderBottom: '1px solid #e5e7eb',
      padding: '0 24px',
      height: '60px',
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 2px 12px rgba(0, 0, 0, 0.03)'
    }}>
      {/* Left Area: Toggle & Page Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          title="Toggle Sidebar"
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            width: '38px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#334155',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#e2e8f0'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafc'; }}
        >
          <Menu size={18} />
        </button>

        <h1 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0, color: '#0f172a', letterSpacing: '-0.3px' }}>
          {activeTitle}
        </h1>
      </div>

      {/* Right Controls: Refresh & User Profile Dropdown Pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        
        {/* Refresh Data */}
        <button
          onClick={onRefresh}
          disabled={refreshing}
          title="Refresh Platform Data"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: '9999px',
            color: '#047857',
            fontWeight: '700',
            fontSize: '0.8rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#d1fae5'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#ecfdf5'; }}
        >
          <RefreshCw size={14} style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none', color: '#10b981' }} />
          <span>Refresh</span>
        </button>

        {/* Clickable User Profile Pill & Dropdown */}
        <div style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
          <div
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '6px 12px 6px 14px',
              borderRadius: '9999px',
              background: dropdownOpen ? '#f1f5f9' : '#f8fafc',
              border: '1px solid #cbd5e1',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
            onMouseLeave={(e) => {
              if (!dropdownOpen) e.currentTarget.style.background = '#f8fafc';
            }}
          >
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0f172a', lineHeight: '1.2' }}>
                {currentUser?.email || 'superadmin@norozz.com'}
              </div>
              <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#10b981', marginTop: '1px' }}>
                Super Admin
              </div>
            </div>

            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '800',
              fontSize: '0.9rem',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)'
            }}>
              {currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : 'S'}
            </div>

            <ChevronDown size={15} color="#64748b" style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
          </div>

          {/* Profile Dropdown Menu */}
          {dropdownOpen && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '52px',
              width: '240px',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              boxShadow: '0 12px 32px rgba(0, 0, 0, 0.12)',
              padding: '8px',
              zIndex: 200,
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              {/* Profile summary header inside dropdown */}
              <div style={{ padding: '8px 10px 10px 10px', borderBottom: '1px solid #f1f5f9', marginBottom: '4px' }}>
                <div style={{ fontSize: '0.88rem', fontWeight: '800', color: '#0f172a' }}>
                  {currentUser?.name || 'Master Super Admin'}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', wordBreak: 'break-all', marginTop: '2px', fontWeight: '500' }}>
                  {currentUser?.email || 'superadmin@norozz.com'}
                </div>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.65rem',
                  fontWeight: '800',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  background: '#e6f4ea',
                  color: '#047857',
                  marginTop: '6px'
                }}>
                  <ShieldCheck size={12} color="#047857" /> MASTER CONTROL ROLE
                </span>
              </div>

              {/* Logout Option */}
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  if (onLogout) onLogout();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '10px 14px',
                  background: '#fef2f2',
                  color: '#dc2626',
                  border: '1px solid #fecaca',
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#fee2e2'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#fef2f2'}
              >
                <LogOut size={16} color="#dc2626" />
                <span>Logout Account</span>
              </button>
            </div>
          )}
        </div>

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
