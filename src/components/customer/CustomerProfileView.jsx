import React, { useState } from 'react';
import {
  MapPin,
  Wallet,
  CalendarCheck,
  CreditCard,
  Headphones,
  Settings,
  LogOut,
  ChevronRight,
  Crown,
  Plus,
  Trash2,
} from 'lucide-react';
import { useCustomer } from '../../hooks/useCustomer.js';

const CustomerProfileView = ({ currentUser, onLogout }) => {
  const { profile, addresses, addAddress, deleteAddress } = useCustomer();
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('Delhi NCR');
  const [zipCode, setZipCode] = useState('110070');

  const userData = profile || currentUser;

  const handleAddAddress = async (e) => {
    e.preventDefault();
    await addAddress({
      street,
      city,
      state: 'Delhi',
      zipCode,
      country: 'India',
      isDefault: true,
    });
    setStreet('');
    setShowAddressModal(false);
  };

  const profileOptions = [
    { id: 'addresses', label: `Saved Addresses (${addresses.length})`, subtitle: 'Home, Office & Saved Locations', icon: MapPin, color: '#2563eb' },
    { id: 'wallet', label: 'NOROZZ Wallet & Cashbacks', subtitle: '₹450 Available Credits', icon: Wallet, color: '#7c3aed' },
    { id: 'bookings', label: 'My Bookings History', subtitle: 'Past & Ongoing Service Requests', icon: CalendarCheck, color: '#10b981' },
    { id: 'payments', label: 'Payment History & Invoices', subtitle: 'View Past Receipts & UPI', icon: CreditCard, color: '#06b6d4' },
    { id: 'support', label: 'Customer Help Center', subtitle: '24x7 Support & Dispute Desk', icon: Headphones, color: '#f59e0b' },
    { id: 'settings', label: 'App Settings & Preferences', subtitle: 'Notifications & Language', icon: Settings, color: '#64748b' },
  ];

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      
      {/* Customer Header Card */}
      <div className="mui-card" style={{ padding: '24px', marginBottom: '24px', background: 'var(--gradient-card-purple)', border: '1px solid #ddd6fe' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'var(--gradient-brand)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '800',
            fontSize: '1.6rem',
            boxShadow: '0 4px 15px rgba(124,58,237,0.3)'
          }}>
            {userData?.name ? userData.name.charAt(0).toUpperCase() : 'A'}
          </div>

          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
              {userData?.name || 'Ananya Deshmukh'}
            </h3>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              {userData?.email || 'ananya.test@norozz.com'}
            </div>
            <span className="badge badge-purple" style={{ marginTop: '6px' }}>
              <Crown size={10} fill="#7c3aed" /> NOROZZ PLUS MEMBER
            </span>
          </div>
        </div>
      </div>

      {/* SAVED ADDRESSES CRUD */}
      <div className="mui-card" style={{ padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={18} color="#2563eb" /> Saved Addresses ({addresses.length})
          </h4>
          <button onClick={() => setShowAddressModal(true)} className="btn btn-primary btn-sm">
            <Plus size={14} /> Add Address
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {addresses.length === 0 ? (
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No saved addresses. Click '+ Add Address' to save one.</div>
          ) : (
            addresses.map((addr) => (
              <div key={addr._id || addr.id} style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.88rem' }}>{addr.street || addr.address}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{addr.city}, {addr.state} - {addr.zipCode}</div>
                </div>
                {addr._id && (
                  <button onClick={() => deleteAddress(addr._id)} className="btn btn-danger btn-sm" title="Delete Address">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Profile Options List */}
      <div className="mui-card" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '24px' }}>
        {profileOptions.map((opt) => {
          const Icon = opt.icon;
          return (
            <div
              key={opt.id}
              style={{
                padding: '14px 16px',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: '#f1f5f9',
                  display: 'center',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Icon size={18} color={opt.color} />
                </div>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-primary)' }}>{opt.label}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{opt.subtitle}</div>
                </div>
              </div>
              <ChevronRight size={18} color="var(--text-muted)" />
            </div>
          );
        })}
      </div>

      {/* Logout Action */}
      <button
        onClick={onLogout}
        className="btn btn-danger"
        style={{ width: '100%', padding: '12px', fontSize: '0.92rem' }}
      >
        <LogOut size={18} /> Logout of Account
      </button>

      {/* ADD ADDRESS MODAL */}
      {showAddressModal && (
        <div className="modal-overlay" onClick={() => setShowAddressModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '28px', maxWidth: '440px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '16px' }}>Add Saved Address</h3>
            <form onSubmit={handleAddAddress}>
              <div className="form-group">
                <label className="form-label">Street / House Number / Locality</label>
                <input type="text" className="form-input" placeholder="e.g. Sector C, Pocket 2, Vasant Kunj" value={street} onChange={(e) => setStreet(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">City</label>
                <input type="text" className="form-input" value={city} onChange={(e) => setCity(e.target.value)} required />
              </div>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">Pin / Zip Code</label>
                <input type="text" className="form-input" value={zipCode} onChange={(e) => setZipCode(e.target.value)} required />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddressModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Address</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default CustomerProfileView;
