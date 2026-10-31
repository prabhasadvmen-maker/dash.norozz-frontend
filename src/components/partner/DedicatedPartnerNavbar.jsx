import { useState, useEffect } from 'react';
import { RefreshCw, LogOut, ShieldCheck, Lock, Menu, MapPin, ChevronDown } from 'lucide-react';
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
    if (!dropdownOpen) return undefined;
    const close = () => setDropdownOpen(false);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [dropdownOpen]);

  const partnerName = currentUser?.name || currentUser?.agencyName || 'Service Partner';
  const partnerContact = currentUser?.email || currentUser?.phone || '';
  const displayCategory = categoryNames || 'Service Technician';
  const displayCity = cityName || '';
  const initialLetter = (partnerName[0] || 'P').toUpperCase();

  return (
    <header className="pnav">
      {/* Left: menu toggle + portal title */}
      <div className="pnav-left">
        {setCollapsed && (
          <button type="button" className="pnav-icon-btn" onClick={() => setCollapsed(!collapsed)} aria-label="Toggle sidebar">
            <Menu size={20} />
          </button>
        )}
        <div className="pnav-title-wrap">
          <h1 className="pnav-title">Technician Portal</h1>
          {displayCity && (
            <div className="pnav-sub">
              <MapPin size={12} color="#2563eb" />
              <span>{displayCity}</span>
            </div>
          )}
        </div>
      </div>

      {/* Right: status, controls, profile */}
      <div className="pnav-right">
        <span className={`pnav-kyc ${isApproved ? 'ok' : 'pending'}`}>
          {isApproved ? <ShieldCheck size={14} /> : <Lock size={14} />}
          <span className="pnav-hide-sm">{isApproved ? 'Verified' : 'KYC Pending'}</span>
        </span>

        {onToggleOnlineClick && (
          <button
            type="button"
            onClick={onToggleOnlineClick}
            className={`pnav-status ${isOnline ? 'online' : 'offline'}`}
            aria-pressed={isOnline}
          >
            <span className="pnav-dot" />
            {isOnline ? 'Online' : 'Offline'}
          </button>
        )}

        <div className="pnav-hide-sm">
          <LanguageSelector compact />
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          title="Refresh data"
          aria-label="Refresh data"
          className="pnav-icon-btn bordered"
        >
          <RefreshCw size={16} style={{ animation: refreshing ? 'pnav-spin 0.8s linear infinite' : 'none' }} />
        </button>

        <span className="pnav-divider" />

        {/* Profile chip & dropdown */}
        <div style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className={`pnav-profile ${dropdownOpen ? 'open' : ''}`}
            onClick={() => setDropdownOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={dropdownOpen}
          >
            <span className="pnav-avatar">{initialLetter}</span>
            <span className="pnav-profile-text pnav-hide-md">
              <span className="pnav-profile-name">{partnerName}</span>
              <span className="pnav-profile-role">{displayCategory}</span>
            </span>
            <ChevronDown size={16} color="#64748b" style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
          </button>

          {dropdownOpen && (
            <div className="pnav-menu" role="menu">
              <div className="pnav-menu-head">
                <div className="pnav-menu-name">{partnerName}</div>
                {partnerContact && <div className="pnav-menu-contact">{partnerContact}</div>}
                <div className="pnav-menu-role">
                  {displayCategory}{displayCity ? ` · ${displayCity}` : ''}
                </div>
              </div>
              <button
                type="button"
                role="menuitem"
                className="pnav-logout"
                onClick={() => {
                  setDropdownOpen(false);
                  onLogout?.();
                }}
              >
                <LogOut size={16} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .pnav { position: sticky; top: 0; z-index: 100; height: 68px; padding: 0 24px; display: flex; align-items: center; justify-content: space-between; gap: 16px; background: rgba(255,255,255,0.97); backdrop-filter: blur(12px); border-bottom: 1px solid #e2e8f0; }
        .pnav-left, .pnav-right { display: flex; align-items: center; gap: 12px; min-width: 0; }
        .pnav-title-wrap { min-width: 0; }
        .pnav-title { margin: 0; font-size: 1.1rem; font-weight: 800; color: #0f172a; letter-spacing: -0.2px; white-space: nowrap; }
        .pnav-sub { display: flex; align-items: center; gap: 4px; margin-top: 1px; font-size: 0.76rem; font-weight: 600; color: #64748b; white-space: nowrap; }
        .pnav-icon-btn { display: inline-flex; align-items: center; justify-content: center; width: 38px; height: 38px; border-radius: 10px; border: 1px solid transparent; background: transparent; color: #334155; cursor: pointer; transition: background 0.15s ease; }
        .pnav-icon-btn:hover { background: #f1f5f9; }
        .pnav-icon-btn.bordered { border-color: #e2e8f0; background: #ffffff; }
        .pnav-icon-btn:disabled { opacity: 0.6; cursor: default; }
        .pnav-kyc { display: inline-flex; align-items: center; gap: 6px; height: 34px; padding: 0 12px; border-radius: 9999px; font-size: 0.76rem; font-weight: 700; white-space: nowrap; }
        .pnav-kyc.ok { background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; }
        .pnav-kyc.pending { background: #fffbeb; color: #b45309; border: 1px solid #fde68a; }
        .pnav-status { display: inline-flex; align-items: center; gap: 8px; height: 34px; padding: 0 14px; border-radius: 9999px; font-size: 0.8rem; font-weight: 700; cursor: pointer; white-space: nowrap; }
        .pnav-status.online { background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; }
        .pnav-status.offline { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }
        .pnav-dot { width: 8px; height: 8px; border-radius: 50%; background: currentColor; }
        .pnav-status.online .pnav-dot { box-shadow: 0 0 0 3px rgba(16,185,129,0.2); }
        .pnav-divider { width: 1px; height: 28px; background: #e2e8f0; }
        .pnav-profile { display: inline-flex; align-items: center; gap: 10px; padding: 4px 10px 4px 4px; border-radius: 9999px; border: 1px solid #e2e8f0; background: #ffffff; cursor: pointer; text-align: left; }
        .pnav-profile:hover, .pnav-profile.open { background: #f8fafc; }
        .pnav-avatar { width: 34px; height: 34px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #10b981, #059669); color: #fff; font-weight: 800; font-size: 0.9rem; flex-shrink: 0; }
        .pnav-profile-text { display: flex; flex-direction: column; max-width: 150px; }
        .pnav-profile-name { font-size: 0.82rem; font-weight: 700; color: #0f172a; line-height: 1.25; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .pnav-profile-role { font-size: 0.7rem; font-weight: 600; color: #059669; line-height: 1.25; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .pnav-menu { position: absolute; right: 0; top: calc(100% + 8px); width: 250px; padding: 8px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; box-shadow: 0 12px 32px rgba(15,23,42,0.12); z-index: 200; }
        .pnav-menu-head { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; margin-bottom: 6px; }
        .pnav-menu-name { font-size: 0.86rem; font-weight: 700; color: #0f172a; }
        .pnav-menu-contact { font-size: 0.75rem; color: #64748b; margin-top: 2px; word-break: break-all; }
        .pnav-menu-role { font-size: 0.72rem; font-weight: 600; color: #059669; margin-top: 4px; }
        .pnav-logout { display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px 12px; border: none; border-radius: 10px; background: #fef2f2; color: #dc2626; font-size: 0.83rem; font-weight: 700; cursor: pointer; }
        .pnav-logout:hover { background: #fee2e2; }
        @keyframes pnav-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 1100px) { .pnav-hide-md { display: none !important; } .pnav-profile { padding-right: 8px; } }
        @media (max-width: 720px) { .pnav { padding: 0 14px; height: 60px; } .pnav-hide-sm { display: none !important; } .pnav-divider { display: none; } .pnav-right { gap: 8px; } }
      `}</style>
    </header>
  );
};

export default DedicatedPartnerNavbar;
