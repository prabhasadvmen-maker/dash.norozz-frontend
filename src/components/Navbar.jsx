import React from 'react';
import {
  ShieldCheck,
  Search,
  Bell,
  MapPin,
  RefreshCw,
  Crown,
  Building2,
  Briefcase,
  Smartphone,
  ShoppingBag,
  LogOut
} from 'lucide-react';

const Navbar = ({
  currentUser,
  onLogout,
  onRefresh,
  refreshing,
  portalMode,
  setPortalMode,
  selectedCity,
  setSelectedCity
}) => {
  return (
    <header style={{
      background: 'rgba(17, 24, 39, 0.95)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-light)',
      padding: '12px 28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: 'var(--shadow-md)'
    }}>
      {/* Brand & 4-Way Portal Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '900',
            fontSize: '1.2rem',
            color: '#ffffff',
            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            N
          </div>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0, letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff' }}>
              NOROZZ <span className="gradient-text">{portalMode === 'customer' ? 'CUSTOMER' : portalMode === 'partner' ? 'PARTNER' : portalMode === 'cityAdmin' ? 'CITY ADMIN' : 'SUPER ADMIN'}</span>
            </h2>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span className="dot-pulse dot-pulse-active"></span> {portalMode === 'customer' ? 'Urban Services Customer App' : portalMode === 'partner' ? 'CleanPro Agency • Partner Portal' : portalMode === 'cityAdmin' ? `${selectedCity} Operations Node` : 'Enterprise Master Control Hub'}
            </span>
          </div>
        </div>

        {/* 4-Way Portal Switcher Pills */}
        <div style={{
          display: 'flex',
          gap: '4px',
          background: 'rgba(11, 15, 25, 0.8)',
          padding: '4px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-light)'
        }}>
          <button
            onClick={() => setPortalMode('superAdmin')}
            className={`enterprise-nav-btn ${portalMode === 'superAdmin' ? 'active' : ''}`}
            style={{ padding: '5px 10px', fontSize: '0.74rem' }}
          >
            <Crown size={13} /> Super Admin
          </button>
          <button
            onClick={() => setPortalMode('cityAdmin')}
            className={`enterprise-nav-btn ${portalMode === 'cityAdmin' ? 'active' : ''}`}
            style={{ padding: '5px 10px', fontSize: '0.74rem' }}
          >
            <Building2 size={13} /> City Admin
          </button>
          <button
            onClick={() => setPortalMode('partner')}
            className={`enterprise-nav-btn ${portalMode === 'partner' ? 'active' : ''}`}
            style={{ padding: '5px 10px', fontSize: '0.74rem' }}
          >
            <Briefcase size={13} /> Partner Portal
          </button>
          <button
            onClick={() => setPortalMode('customer')}
            className={`enterprise-nav-btn ${portalMode === 'customer' ? 'active' : ''}`}
            style={{ padding: '5px 10px', fontSize: '0.74rem' }}
          >
            <Smartphone size={13} /> Customer App
          </button>
        </div>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        
        {/* Refresh button if provided */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="btn btn-secondary btn-sm"
            disabled={refreshing}
            title="Refresh Data"
            style={{ padding: '8px' }}
          >
            <RefreshCw size={15} className={refreshing ? 'spin' : ''} color="#10b981" />
          </button>
        )}

        {/* City Switcher */}
        {selectedCity && setSelectedCity && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={15} color="#3b82f6" />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="form-select"
              style={{
                padding: '6px 10px',
                fontSize: '0.8rem',
                fontWeight: '700',
                background: 'rgba(11, 15, 25, 0.8)',
                color: '#f8fafc',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                width: '130px',
                cursor: 'pointer'
              }}
            >
              <option value="Delhi NCR">Delhi NCR</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Bengaluru">Bengaluru</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Chennai">Chennai</option>
              <option value="Kolkata">Kolkata</option>
              <option value="Pune">Pune</option>
            </select>
          </div>
        )}

        {/* Cart / Notifications */}
        <button
          className="btn btn-secondary btn-sm"
          style={{ position: 'relative', padding: '9px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }}
          title={portalMode === 'customer' ? 'My Cart' : 'Notifications'}
        >
          {portalMode === 'customer' ? <ShoppingBag size={16} color="#3b82f6" /> : <Bell size={16} color="#94a3b8" />}
          <span style={{
            position: 'absolute',
            top: '2px',
            right: '2px',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#ef4444',
            boxShadow: '0 0 6px #ef4444'
          }}></span>
        </button>

        {/* User Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '4px 12px 4px 6px',
          background: 'rgba(11, 15, 25, 0.8)',
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
            {portalMode === 'customer' ? 'A' : portalMode === 'partner' ? 'P' : currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'S'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#f8fafc' }}>
              {portalMode === 'customer' ? 'Ananya Deshmukh' : portalMode === 'partner' ? 'CleanPro Partner' : currentUser?.name || 'Super Admin'}
            </span>
            <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: '700', letterSpacing: '0.3px' }}>
              {portalMode === 'customer' ? 'CUSTOMER' : portalMode === 'partner' ? 'AGENCY PARTNER' : portalMode === 'cityAdmin' ? `${(selectedCity || 'DELHI').toUpperCase()} ADMIN` : 'SUPER ADMIN'}
            </span>
          </div>
        </div>

        {/* Logout Button if callback provided */}
        {onLogout && (
          <button
            onClick={onLogout}
            className="btn btn-secondary btn-sm"
            style={{ padding: '8px 12px', fontSize: '0.78rem', gap: '6px', color: '#f87171', borderColor: 'rgba(239,68,68,0.3)' }}
            title="Sign Out"
          >
            <LogOut size={14} /> Logout
          </button>
        )}

      </div>
    </header>
  );
};

export default Navbar;
