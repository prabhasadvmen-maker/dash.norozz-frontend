import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, Menu, LogOut, ChevronDown, User, MapPin } from 'lucide-react';

const DedicatedCityNavbar = ({
  currentUser,
  onLogout,
  onRefresh,
  refreshing,
  collapsed,
  setCollapsed,
  assignedCity = 'Delhi NCR'
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = () => setDropdownOpen(false);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const adminEmail = currentUser?.email || `${assignedCity.toLowerCase().replace(/\s+/g, '.')}.admin@norozz.com`;
  const initialLetter = currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : (assignedCity ? assignedCity.charAt(0).toUpperCase() : 'C');

  return (
    <header style={{
      background: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      padding: '12px 28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 2px 12px rgba(0, 0, 0, 0.03)'
    }}>
      {/* Left Area: Toggle & Scope */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          type="button"
          onClick={() => setCollapsed && setCollapsed(!collapsed)}
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
            color: '#1e293b',
            transition: 'all 0.2s ease'
          }}
        >
          <Menu size={20} color="#0f172a" />
        </button>

        <div>
          <h1 style={{
            fontSize: '1.25rem',
            fontWeight: '800',
            color: '#0f172a',
            margin: 0,
            letterSpacing: '-0.3px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {assignedCity} Operations Directory
          </h1>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', marginTop: '1px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MapPin size={12} color="#10b981" /> Scoped to {assignedCity} Jurisdiction
          </div>
        </div>
      </div>

      {/* Right Controls: Refresh & User Profile Dropdown Pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        
        {/* Refresh Data */}
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          title="Refresh Data"
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
                {adminEmail}
              </div>
              <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#10b981', marginTop: '1px' }}>
                {assignedCity} City Admin
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
              fontSize: '0.95rem',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
            }}>
              {initialLetter}
            </div>

            <ChevronDown
              size={16}
              color="#64748b"
              style={{
                transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease'
              }}
            />
          </div>

          {/* User Dropdown Menu */}
          {dropdownOpen && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '48px',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.12)',
              width: '240px',
              padding: '8px',
              zIndex: 200,
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              animation: 'dropdownFadeIn 0.2s ease'
            }}>
              <div style={{ padding: '10px 12px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0f172a' }}>
                  {currentUser?.name || `${assignedCity} Admin`}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                  {adminEmail}
                </div>
              </div>

              <button
                type="button"
                onClick={onLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  background: '#fef2f2',
                  color: '#dc2626',
                  border: 'none',
                  fontWeight: '700',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  width: '100%',
                  marginTop: '4px'
                }}
              >
                <LogOut size={16} color="#dc2626" />
                <span>Logout from Panel</span>
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
        @keyframes dropdownFadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </header>
  );
};

export default DedicatedCityNavbar;
