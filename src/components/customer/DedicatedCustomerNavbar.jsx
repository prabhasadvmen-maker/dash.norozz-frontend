import React from 'react';
import { Smartphone, MapPin, Search, ShoppingBag, LogOut } from 'lucide-react';

const DedicatedCustomerNavbar = ({ currentUser, onLogout }) => {
  return (
    <header style={{
      background: '#ffffff',
      borderBottom: '1px solid var(--border-light)',
      padding: '12px 24px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 12px rgba(37,99,235,0.3)'
          }}>
            <Smartphone size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0, letterSpacing: '-0.3px' }}>
              NOROZZ <span className="gradient-text">APP</span>
            </h2>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              On-Demand Services
            </span>
          </div>
        </div>

        {/* Right Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Cart */}
          <button className="btn btn-secondary btn-sm" style={{ padding: '8px', borderRadius: '50%' }} title="My Cart">
            <ShoppingBag size={18} color="#2563eb" />
          </button>

          {/* User Name */}
          <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)' }}>
            {currentUser?.name || 'Ananya Deshmukh'}
          </span>

          {/* Logout */}
          <button onClick={onLogout} className="btn btn-danger btn-sm" title="Logout">
            <LogOut size={16} /> Logout
          </button>
        </div>

      </div>
    </header>
  );
};

export default DedicatedCustomerNavbar;
