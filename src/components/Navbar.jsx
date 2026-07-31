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
  ShoppingBag
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
      {/* Brand & 4-Way Portal Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: portalMode === 'customer' ? 'linear-gradient(135deg, #2563eb, #7c3aed)' : portalMode === 'partner' ? 'linear-gradient(135deg, #7c3aed, #ec4899)' : portalMode === 'cityAdmin' ? 'linear-gradient(135deg, #2563eb, #06b6d4)' : 'var(--gradient-brand)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
            color: '#ffffff'
          }}>
            {portalMode === 'customer' ? <Smartphone size={24} /> : portalMode === 'partner' ? <Briefcase size={24} /> : portalMode === 'cityAdmin' ? <Building2 size={24} /> : <ShieldCheck size={24} />}
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0, letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              NOROZZ <span className="gradient-text">{portalMode === 'customer' ? 'APP' : portalMode === 'partner' ? 'PARTNER' : portalMode === 'cityAdmin' ? 'CITY ADMIN' : 'SERVICES'}</span>
            </h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span className="dot-pulse dot-pulse-active"></span> {portalMode === 'customer' ? 'Urban Company Style Customer App' : portalMode === 'partner' ? 'CleanPro Services • Partner Portal' : portalMode === 'cityAdmin' ? `${selectedCity} Operations Portal` : 'Multi-Service SaaS Super Admin'}
            </span>
          </div>
        </div>

        {/* 4-Way Portal Switcher Pills */}
        <div style={{
          display: 'flex',
          gap: '4px',
          background: '#f1f5f9',
          padding: '4px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-light)'
        }}>
          <button
            onClick={() => setPortalMode('superAdmin')}
            className={`btn btn-sm ${portalMode === 'superAdmin' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ border: 'none', padding: '5px 8px', fontSize: '0.72rem' }}
          >
            <Crown size={12} /> Super Admin
          </button>
          <button
            onClick={() => setPortalMode('cityAdmin')}
            className={`btn btn-sm ${portalMode === 'cityAdmin' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ border: 'none', padding: '5px 8px', fontSize: '0.72rem' }}
          >
            <Building2 size={12} /> City Admin
          </button>
          <button
            onClick={() => setPortalMode('partner')}
            className={`btn btn-sm ${portalMode === 'partner' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ border: 'none', padding: '5px 8px', fontSize: '0.72rem' }}
          >
            <Briefcase size={12} /> Partner Portal
          </button>
          <button
            onClick={() => setPortalMode('customer')}
            className={`btn btn-sm ${portalMode === 'customer' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ border: 'none', padding: '5px 8px', fontSize: '0.72rem' }}
          >
            <Smartphone size={12} /> Customer App
          </button>
        </div>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        
        {/* City Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <MapPin size={15} color="#2563eb" />
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="form-select"
            style={{
              padding: '6px 10px',
              fontSize: '0.82rem',
              fontWeight: '700',
              background: '#f1f5f9',
              border: 'none',
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

        {/* Cart / Notifications */}
        <button
          className="btn btn-secondary btn-sm"
          style={{ position: 'relative', padding: '9px', borderRadius: '50%' }}
          title={portalMode === 'customer' ? 'My Cart' : 'Notifications'}
        >
          {portalMode === 'customer' ? <ShoppingBag size={18} color="#2563eb" /> : <Bell size={18} color="var(--text-secondary)" />}
          <span style={{
            position: 'absolute',
            top: '2px',
            right: '2px',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#ef4444'
          }}></span>
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
            background: portalMode === 'customer' ? 'linear-gradient(135deg, #2563eb, #7c3aed)' : portalMode === 'partner' ? 'linear-gradient(135deg, #7c3aed, #ec4899)' : portalMode === 'cityAdmin' ? 'linear-gradient(135deg, #06b6d4, #2563eb)' : 'var(--gradient-brand)',
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
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)' }}>
              {portalMode === 'customer' ? 'Ananya Deshmukh' : portalMode === 'partner' ? 'CleanPro Partner' : currentUser?.name || 'Super Admin'}
            </span>
            <span style={{ fontSize: '0.68rem', color: portalMode === 'customer' ? '#2563eb' : portalMode === 'partner' ? '#7c3aed' : portalMode === 'cityAdmin' ? '#06b6d4' : 'var(--accent-purple)', fontWeight: '700' }}>
              {portalMode === 'customer' ? 'CUSTOMER APP' : portalMode === 'partner' ? 'BUSINESS AGENCY' : portalMode === 'cityAdmin' ? `${selectedCity.toUpperCase()} ADMIN` : 'SUPER ADMIN'}
            </span>
          </div>
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

export default Navbar;
