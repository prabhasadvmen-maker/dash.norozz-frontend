import React, { useState, useEffect } from 'react';
import { RefreshCw, LogOut, ShieldCheck, Lock, Menu, Briefcase, MapPin, ChevronDown } from 'lucide-react';
import LanguageSelector from '../common/LanguageSelector.jsx';

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
    const handleOutsideClick = () => setDropdownOpen(false);
    if (dropdownOpen) {
      window.addEventListener('click', handleOutsideClick);
    }
    return () => window.removeEventListener('click', handleOutsideClick);
  }, [dropdownOpen]);

  const partnerName = currentUser?.name || currentUser?.agencyName || 'Service Partner';
  const partnerEmail = currentUser?.email || currentUser?.phone || 'partner@norozz.com';
  const displayCategory = categoryNames || 'Service Technician';
  const initialLetter = (partnerName[0] || 'P').toUpperCase();

  return (
    <header className="card card-glow" style={{
      margin: 0,
      borderRadius: '0 0 24px 24px',
      padding: '14px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(255, 255, 255, 0.96)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid #e2e8f0',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)'
    }}>
      {/* Left Title & Mobile Menu Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {setCollapsed && (
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="btn btn-ghost"
            style={{ padding: '8px', borderRadius: '12px' }}
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
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', marginTop: '1px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
              <Briefcase size={12} color="#10b981" /> {partnerName} ({displayCategory})
            </span>
            <span style={{ color: '#cbd5e1' }}>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
              <MapPin size={12} color="#2563eb" /> {cityName || 'Delhi NCR'}
            </span>
          </div>
        </div>
      </div>

      {/* Right Controls: KYC Status, Online Toggle, Language Selector, Refresh & User Dropdown */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span className={`badge ${isApproved ? 'badge-success' : 'badge-warning'}`} style={{ padding: '6px 14px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '800' }}>
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
              fontWeight: '800',
              background: isOnline ? '#ecfdf5' : '#fef2f2',
              color: isOnline ? '#047857' : '#dc2626',
              border: `1px solid ${isOnline ? '#a7f3d0' : '#fecaca'}`,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isOnline ? '#10b981' : '#ef4444' }} />
            <span>{isOnline ? 'Online' : 'Offline'}</span>
          </button>
        )}

        {/* Sarvam AI Language Selector */}
        <LanguageSelector compact />

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
                {partnerName}
              </span>
              <span style={{ fontSize: '0.68rem', color: '#059669', fontWeight: '700', whiteSpace: 'nowrap' }}>
                {displayCategory}
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
