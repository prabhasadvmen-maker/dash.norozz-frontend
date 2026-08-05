import React, { useState, useEffect } from 'react';
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
  Edit3,
  User,
  Lock,
  Mail,
  CheckCircle2,
  Camera,
  X,
} from 'lucide-react';
import { useCustomer } from '../../hooks/useCustomer.js';

const CustomerProfileView = ({ currentUser, onLogout }) => {
  const { profile, addresses, addAddress, deleteAddress, updateProfile } = useCustomer();
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);

  // Address Modal State
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('Delhi NCR');
  const [zipCode, setZipCode] = useState('110070');

  const userData = profile || currentUser;

  // Edit Profile Form State
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editProfileImage, setEditProfileImage] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editState, setEditState] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Sync state when modal opens or userData changes
  useEffect(() => {
    if (userData) {
      setEditName(userData.name || '');
      setEditEmail(userData.email || '');
      setEditPhone(userData.phone || '+91 98765 43210');
      setEditProfileImage(userData.profileImage || '');
      setEditCity(userData.city || 'Delhi NCR');
      setEditState(userData.state || 'Delhi');
      setEditAddress(userData.address || '');
    }
  }, [userData, showEditProfileModal]);

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

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await updateProfile({
        name: editName,
        email: editEmail,
        profileImage: editProfileImage,
        city: editCity,
        state: editState,
        address: editAddress,
      });
      setShowEditProfileModal(false);
    } catch (err) {
      console.error('Profile update failed:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const profileOptions = [
    { id: 'edit_profile', label: 'Edit Profile Details', subtitle: 'Update Name, Email, Avatar & Location', icon: Edit3, color: '#2563eb', action: () => setShowEditProfileModal(true) },
    { id: 'addresses', label: `Saved Addresses (${addresses.length})`, subtitle: 'Home, Office & Saved Locations', icon: MapPin, color: '#059669', action: () => setShowAddressModal(true) },
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              background: editProfileImage ? `url(${editProfileImage}) center/cover` : 'var(--gradient-brand)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '800',
              fontSize: '1.6rem',
              boxShadow: '0 4px 15px rgba(124,58,237,0.3)',
              overflow: 'hidden',
              flexShrink: 0,
            }}>
              {!userData?.profileImage && (userData?.name ? userData.name.charAt(0).toUpperCase() : 'C')}
            </div>

            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {userData?.name || 'Customer User'}
              </h3>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {userData?.email || 'customer@norozz.com'}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Lock size={12} color="#059669" /> Phone: <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{userData?.phone || editPhone}</span>
              </div>
              <div style={{ marginTop: '8px', display: 'flex', gap: '6px' }}>
                <span className="badge badge-purple" style={{ fontSize: '0.68rem' }}>
                  <Crown size={10} fill="#7c3aed" /> NOROZZ PLUS MEMBER
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowEditProfileModal(true)}
            className="btn btn-outline btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '20px', padding: '6px 14px' }}
          >
            <Edit3 size={14} /> Edit
          </button>
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
                  <div style={{ fontWeight: '700', fontSize: '0.88rem' }}>{addr.street || addr.addressLine || addr.address}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{addr.city}, {addr.state} - {addr.pincode || addr.zipCode}</div>
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
              onClick={opt.action}
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
                  display: 'flex',
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

      {/* EDIT PROFILE MODAL */}
      {showEditProfileModal && (
        <div className="modal-overlay" onClick={() => setShowEditProfileModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '28px', maxWidth: '500px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={20} color="#2563eb" /> Edit Customer Profile
              </h3>
              <button
                onClick={() => setShowEditProfileModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} color="var(--text-muted)" />
              </button>
            </div>

            <form onSubmit={handleUpdateProfile}>
              {/* Full Name */}
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter your full name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </div>

              {/* Email Address */}
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="e.g. customer@example.com"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  required
                />
              </div>

              {/* Mobile Number - STRICTLY LOCKED / READ-ONLY */}
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  Mobile Number
                  <span style={{ fontSize: '0.72rem', color: '#ef4444', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Lock size={11} /> Locked
                  </span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-input"
                    value={editPhone || 'Not Available'}
                    disabled
                    readOnly
                    style={{
                      background: '#f1f5f9',
                      color: '#64748b',
                      cursor: 'not-allowed',
                      borderColor: '#cbd5e1',
                      fontWeight: '600',
                      paddingRight: '40px'
                    }}
                  />
                  <Lock size={16} color="#94a3b8" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                  Mobile number is linked to OTP login & security verification and cannot be changed.
                </span>
              </div>

              {/* Profile Image URL */}
              <div className="form-group">
                <label className="form-label">Profile Image URL (Optional)</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={editProfileImage}
                  onChange={(e) => setEditProfileImage(e.target.value)}
                />
              </div>

              {/* City & State */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Delhi NCR"
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">State</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Delhi"
                    value={editState}
                    onChange={(e) => setEditState(e.target.value)}
                  />
                </div>
              </div>

              {/* Primary Address */}
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Primary Street Address</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Sector C, Pocket 2, Vasant Kunj"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                />
              </div>

              {/* Form Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowEditProfileModal(false)}
                  disabled={isUpdating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Saving Changes...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD ADDRESS MODAL */}
      {showAddressModal && (
        <div className="modal-overlay" onClick={() => setShowAddressModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '28px', maxWidth: '440px', borderRadius: '16px' }}>
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
