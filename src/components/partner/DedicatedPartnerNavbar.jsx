import { useState, useEffect } from 'react';
import { RefreshCw, LogOut, ShieldCheck, Lock, Menu, User, MapPin, Briefcase, ChevronDown } from 'lucide-react';

const DedicatedPartnerNavbar = ({
  currentUser,
  cityName,
  categoryNames,
  onLogout,
  onRefresh,
  refreshing,
  kycStatus = 'pending',
  isOnline = true,
  onToggleOnlineClick,
  collapsed,
  setCollapsed
}) => {
  const isApproved = kycStatus === 'approved';
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = () => setDropdownOpen(false);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const partnerName = currentUser?.name || 'Service Partner';
  const partnerEmail = currentUser?.email || 'partner@norozz.com';
  const displayCategory = categoryNames || 'Service Technician';
  const initialLetter = partnerName.charAt(0).toUpperCase();

  return (
    <header style={{
      background: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
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
      {/* Left Area: Toggle & Scope */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {setCollapsed && (
          <button
            type="button"
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
              color: '#1e293b',
              transition: 'all 0.2s ease'
            }}
          >
            <Menu size={20} color="#0f172a" />
          </button>
        )}

        <div>
          <h1 style={{
            fontSize: '1.2rem',
            fontWeight: '800',
            color: '#0f172a',
            margin: 0,
            letterSpacing: '-0.3px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            NOROZZ Technician Portal
          </h1>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', marginTop: '1px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Briefcase size={12} color="#10b981" /> {partnerName} ({displayCategory}) • <MapPin size={12} color="#2563eb" /> {cityName || 'Delhi NCR'}
          </div>
        </div>
      </div>

      {/* Right Controls: Online Toggle, Refresh, Clickable User Pill with Logout Dropdown */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>

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

        {/* Refresh Button */}
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
        >
          <RefreshCw size={14} style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none', color: '#059669' }} />
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
              padding: '6px 12px 6px 12px',
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
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '900',
              fontSize: '0.88rem',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
            }}>
              {initialLetter}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0f172a', lineHeight: '1.2' }}>
                {partnerEmail}
              </span>
              <span style={{ fontSize: '0.68rem', color: '#059669', fontWeight: '700', whiteSpace: 'nowrap' }}>
                {partnerName} • {displayCategory}
              </span>
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
              width: '250px',
              padding: '8px',
              zIndex: 200,
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <div style={{ padding: '10px 12px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0f172a' }}>
                  {partnerName}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748b', wordBreak: 'break-all', marginTop: '2px' }}>
                  {partnerEmail}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: '700', marginTop: '4px' }}>
                  {displayCategory} ({cityName || 'Delhi NCR'})
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setDropdownOpen(false);
                  onLogout && onLogout();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: 'none',
                  background: '#fef2f2',
                  color: '#ef4444',
                  fontWeight: '700',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease',
                  marginTop: '4px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#fee2e2'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#fef2f2'}
              >
                <LogOut size={16} color="#ef4444" /> Sign Out & Logout
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

export default DedicatedPartnerNavbar;
