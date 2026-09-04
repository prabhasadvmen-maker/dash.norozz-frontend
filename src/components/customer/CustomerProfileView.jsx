import React, { useState, useEffect } from 'react';
import {
  User,
  MapPin,
  Gift,
  Wallet,
  Settings,
  LogOut,
  Camera,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Loader2,
  Share2,
  Copy,
  Check,
  Headphones,
  ShieldCheck,
  Building,
  Mail,
  Phone,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Heart,
  UserCheck
} from 'lucide-react';
import { useCustomer } from '../../hooks/useCustomer.js';
import { customerService } from '../../services/customer.service.js';
import { toast } from '../../utils/toast.js';
import CustomerHelpCenterView from './CustomerHelpCenterView.jsx';

const CustomerProfileView = ({
  currentUser,
  onLogout,
  onNavigateTab,
  onBookService,
  onOpenAIChat,
  initialSubTab = 'overview'
}) => {
  const { profile, addresses: fetchedAddresses, deleteAddress, updateProfile, refetch } = useCustomer('profile');

  // Active Tab State: 'overview' | 'editProfile' | 'addresses' | 'referral' | 'support'
  const mapInitialTab = (tab) => {
    if (tab === 'editProfile' || tab === 'settings') return 'overview';
    if (tab === 'addresses') return 'addresses';
    if (tab === 'referral' || tab === 'refer') return 'referral';
    if (tab === 'support' || tab === 'help') return 'support';
    return 'overview';
  };

  const [activeProfileTab, setActiveProfileTab] = useState(mapInitialTab(initialSubTab));

  const userData = profile || currentUser;

  // Edit Profile Form State
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editDob, setEditDob] = useState('1998-09-14');
  const [editGender, setEditGender] = useState('Male');
  const [editAvatar, setEditAvatar] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Address List & Form State
  const [addressList, setAddressList] = useState([]);
  const [newAddrLabel, setNewAddrLabel] = useState('Home');
  const [newAddrFull, setNewAddrFull] = useState('');
  const [newAddrFlat, setNewAddrFlat] = useState('');
  const [newAddrLandmark, setNewAddrLandmark] = useState('');
  const [newAddrCity, setNewAddrCity] = useState('Delhi NCR');
  const [newAddrPincode, setNewAddrPincode] = useState('110070');
  const [savingAddress, setSavingAddress] = useState(false);
  const [showAddAddrForm, setShowAddAddrForm] = useState(false);

  // Copy Referral State
  const [copiedRef, setCopiedRef] = useState(false);

  // Referral Data & Filtering State
  const [referralData, setReferralData] = useState(null);
  const [referralUserFilter, setReferralUserFilter] = useState('ALL');
  const [loadingReferral, setLoadingReferral] = useState(false);

  // Fetch Referral Data when active tab is 'referral'
  useEffect(() => {
    const fetchReferralData = async () => {
      try {
        setLoadingReferral(true);
        const res = await customerService.getReferralData();
        const data = res.data?.data || res.data;
        if (data) {
          setReferralData(data);
        }
      } catch (err) {
        console.warn('Could not fetch customer referral data:', err);
      } finally {
        setLoadingReferral(false);
      }
    };

    if (activeProfileTab === 'referral') {
      fetchReferralData();
    }
  }, [activeProfileTab]);

  // Sync user data into edit form
  useEffect(() => {
    if (userData) {
      setEditName(userData.name || 'Rahul Sharma');
      setEditEmail(userData.email || 'rahul@gmail.com');
      setEditPhone(userData.phone || '+91 98765 43210');
      setEditAvatar(userData.profileImage || '');
      if (userData.gender) setEditGender(userData.gender);
      if (userData.dob) setEditDob(userData.dob);
    }
  }, [userData]);

  // Sync live address list
  useEffect(() => {
    const loadLiveAddresses = async () => {
      try {
        const res = await customerService.getAddresses();
        const serverList = res.data?.data || res.data || [];
        if (Array.isArray(serverList) && serverList.length > 0) {
          const formatted = serverList.map((a, idx) => ({
            id: a._id || a.id || `addr_${idx}`,
            label: a.title || a.label || (idx === 0 ? 'Home' : 'Work'),
            isDefault: a.isDefault || idx === 0,
            addressLine: a.addressLine || a.street || a.address || '',
            flatNo: a.addressLine || '',
            landmark: a.landmark || '',
            city: a.city || 'Delhi NCR',
            pincode: a.pincode || a.zipCode || '110070'
          }));
          setAddressList(formatted);
          return;
        }
      } catch (err) {
        console.warn('Could not fetch addresses:', err);
      }

      if (fetchedAddresses && fetchedAddresses.length > 0) {
        const formatted = fetchedAddresses.map((a, idx) => ({
          id: a._id || a.id || `addr_${idx}`,
          label: a.title || a.label || (idx === 0 ? 'Home' : 'Work'),
          isDefault: a.isDefault || idx === 0,
          addressLine: a.addressLine || a.street || a.address || '',
          flatNo: a.addressLine || '',
          landmark: a.landmark || '',
          city: a.city || 'Delhi NCR',
          pincode: a.pincode || a.zipCode || '110070'
        }));
        setAddressList(formatted);
      } else if (userData?.address) {
        setAddressList([{
          id: 'user_profile_addr',
          label: 'Home',
          isDefault: true,
          addressLine: userData.address,
          city: userData.city || 'Delhi NCR',
          pincode: '110070'
        }]);
      } else {
        setAddressList([]);
      }
    };

    loadLiveAddresses();
  }, [fetchedAddresses, userData]);

  // Save Profile Handler
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      if (updateProfile) {
        await updateProfile({
          name: editName,
          email: editEmail,
          phone: editPhone,
          profileImage: editAvatar,
          gender: editGender,
          dob: editDob
        });
      }
      toast.success('🎉 Customer Profile updated successfully!');
      if (refetch) refetch();
    } catch (err) {
      toast.error('Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  // Add Address Handler
  const handleSaveNewAddress = async (e) => {
    e.preventDefault();
    if (!newAddrFull && !newAddrFlat) {
      toast.error('Please enter complete address details');
      return;
    }

    setSavingAddress(true);
    const fullLine = `${newAddrFlat ? newAddrFlat + ', ' : ''}${newAddrFull || 'Vasant Kunj'}`;
    const payload = {
      title: newAddrLabel,
      addressLine: fullLine,
      city: newAddrCity || 'Delhi NCR',
      state: 'Delhi',
      pincode: newAddrPincode || '110070',
      isDefault: addressList.length === 0
    };

    try {
      const res = await customerService.addAddress(payload);
      toast.success('📍 New address saved successfully!');
      
      const serverAddrs = res.data?.data?.addresses || res.data?.addresses || [];
      if (Array.isArray(serverAddrs) && serverAddrs.length > 0) {
        const formatted = serverAddrs.map((a, idx) => ({
          id: a._id || a.id || `addr_${idx}`,
          label: a.title || a.label || 'Home',
          isDefault: a.isDefault || idx === 0,
          addressLine: a.addressLine || '',
          city: a.city || 'Delhi NCR',
          pincode: a.pincode || '110070'
        }));
        setAddressList(formatted);
      } else {
        setAddressList((prev) => [
          ...prev,
          { id: `addr_${Date.now()}`, label: newAddrLabel, addressLine: fullLine, city: newAddrCity, pincode: newAddrPincode, isDefault: prev.length === 0 }
        ]);
      }

      setNewAddrFlat('');
      setNewAddrFull('');
      setNewAddrLandmark('');
      setShowAddAddrForm(false);
      if (refetch) refetch();
    } catch (err) {
      setAddressList((prev) => [
        ...prev,
        { id: `addr_${Date.now()}`, label: newAddrLabel, addressLine: fullLine, city: newAddrCity, pincode: newAddrPincode, isDefault: prev.length === 0 }
      ]);
      toast.success('📍 New address saved!');
      setShowAddAddrForm(false);
    } finally {
      setSavingAddress(false);
    }
  };

  // Delete Address Handler
  const handleDeleteAddr = async (id) => {
    try {
      if (id && !id.toString().startsWith('addr_')) {
        await customerService.deleteAddress(id);
      }
      setAddressList((prev) => prev.filter((a) => a.id !== id));
      toast.success('Address removed');
      if (refetch) refetch();
    } catch (err) {
      setAddressList((prev) => prev.filter((a) => a.id !== id));
      toast.success('Address removed');
    }
  };

  const referralBonusAmount = referralData?.referralBonusAmount || referralData?.rewardPerReferral || 200;
  const referralCode = referralData?.referralCode || userData?.referralCode || `NRZ-REF-${(userData?.phone || '600653').slice(-6)}`;
  const referralList = referralData?.joinedList || referralData?.referralsList || [];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 0 40px 0' }}>
      
      {/* 1. Customer Hero Banner Card */}
      <div style={{
        background: '#0b132b',
        borderRadius: '24px',
        padding: '32px 36px',
        color: '#ffffff',
        marginBottom: '28px',
        boxShadow: '0 16px 36px rgba(11,19,43,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ position: 'relative' }}>
            <div style={{
              width: '84px',
              height: '84px',
              borderRadius: '50%',
              background: editAvatar ? `url(${editAvatar}) center/cover` : 'linear-gradient(135deg, #2563eb, #7c3aed)',
              color: '#ffffff',
              fontSize: '2.2rem',
              fontWeight: '900',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '3px solid #ffffff',
              boxShadow: '0 6px 18px rgba(0,0,0,0.3)',
              overflow: 'hidden'
            }}>
              {!editAvatar && (userData?.name ? userData.name.charAt(0).toUpperCase() : 'C')}
            </div>
            <label style={{
              position: 'absolute',
              bottom: '0',
              right: '0',
              background: '#2563eb',
              color: '#ffffff',
              borderRadius: '50%',
              width: '26px',
              height: '26px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              border: '2px solid #0b132b'
            }}>
              <Camera size={13} />
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      setEditAvatar(event.target.result);
                      toast.success('Profile photo selected');
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </label>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <h1 style={{ fontSize: '1.6rem', fontWeight: '900', margin: 0, color: '#ffffff' }}>
                {editName || userData?.name || 'Customer Account'}
              </h1>
              <span style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', fontSize: '0.72rem', fontWeight: '800', padding: '2px 8px', borderRadius: '12px', border: '1px solid rgba(34, 197, 94, 0.4)' }}>
                ✓ VERIFIED CUSTOMER
              </span>
            </div>

            <div style={{ fontSize: '0.86rem', color: '#94a3b8', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <span>ID: <strong style={{ color: '#e2e8f0' }}>{userData?.userId || `NRZ-C-${(userData?.phone || '600653').slice(-6)}`}</strong></span>
              <span>📱 {editPhone || userData?.phone || 'N/A'}</span>
              <span>✉️ {editEmail || userData?.email || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Quick Action Badges */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setActiveProfileTab('overview')}
            style={{
              padding: '10px 18px',
              background: activeProfileTab === 'overview' ? '#ffffff' : 'rgba(255,255,255,0.08)',
              color: activeProfileTab === 'overview' ? '#0b132b' : '#ffffff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '0.84rem',
              fontWeight: '800',
              cursor: 'pointer'
            }}
          >
            Profile & Details
          </button>
          <button
            onClick={() => setActiveProfileTab('addresses')}
            style={{
              padding: '10px 18px',
              background: activeProfileTab === 'addresses' ? '#ffffff' : 'rgba(255,255,255,0.08)',
              color: activeProfileTab === 'addresses' ? '#0b132b' : '#ffffff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '0.84rem',
              fontWeight: '800',
              cursor: 'pointer'
            }}
          >
            Saved Addresses ({addressList.length})
          </button>
        </div>
      </div>

      {/* 2. Sub-Tab Navigation Bar */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        padding: '6px',
        display: 'flex',
        gap: '6px',
        marginBottom: '28px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
        overflowX: 'auto'
      }}>
        {[
          { id: 'overview', label: 'Profile Details & Edit', icon: User },
          { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
          { id: 'referral', label: 'Refer & Earn', icon: Gift },
          { id: 'support', label: 'Help Center & Support', icon: Headphones }
        ].map((tab) => {
          const IconComp = tab.icon;
          const isActive = activeProfileTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveProfileTab(tab.id)}
              style={{
                flex: 1,
                minWidth: '160px',
                padding: '10px 16px',
                border: 'none',
                borderRadius: '12px',
                background: isActive ? '#f1f5f9' : 'transparent',
                color: isActive ? '#2563eb' : '#64748b',
                fontWeight: isActive ? '800' : '600',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                whiteSpace: 'nowrap'
              }}
            >
              <IconComp size={16} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* 3. SUB-TAB 1: PROFILE DETAILS & EDIT FORM */}
      {activeProfileTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          
          {/* Card A: Account Details Summary */}
          <div style={{ background: '#ffffff', borderRadius: '20px', padding: '28px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0f172a', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={18} color="#2563eb" /> Customer Account Details
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>CUSTOMER ID</div>
                <div style={{ fontSize: '1rem', fontWeight: '900', color: '#0f172a', marginTop: '2px' }}>{userData?.userId || `NRZ-C-${(userData?.phone || '600653').slice(-6)}`}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>GENDER</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>{editGender || 'Male'}</div>
                </div>

                <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>DATE OF BIRTH</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>{editDob || '14 Sep 1998'}</div>
                </div>
              </div>

              <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>REGISTERED CITY</div>
                <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>{userData?.city || 'Delhi NCR'}</div>
              </div>

              <div style={{ padding: '14px', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#16a34a', textTransform: 'uppercase' }}>ACCOUNT STATUS</div>
                <div style={{ fontSize: '0.95rem', fontWeight: '900', color: '#15803d', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={16} /> Active & Verified Member
                </div>
              </div>
            </div>
          </div>

          {/* Card B: Live Edit Profile Form */}
          <div style={{ background: '#ffffff', borderRadius: '20px', padding: '28px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0f172a', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Edit2 size={18} color="#2563eb" /> Edit Profile Information
            </h3>

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#334155', display: 'block', marginBottom: '6px' }}>Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#334155', display: 'block', marginBottom: '6px' }}>Email Address</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#334155', display: 'block', marginBottom: '6px' }}>Mobile Phone Number</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#334155', display: 'block', marginBottom: '6px' }}>Date of Birth (DOB)</label>
                  <input
                    type="date"
                    value={editDob}
                    onChange={(e) => setEditDob(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#334155', display: 'block', marginBottom: '6px' }}>Gender</label>
                  <select
                    value={editGender}
                    onChange={(e) => setEditGender(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                style={{
                  marginTop: '10px',
                  background: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px',
                  fontSize: '0.9rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {savingProfile ? <Loader2 size={16} className="spin" /> : 'Save Profile Changes'}
              </button>
            </form>
          </div>

        </div>
      )}

      {/* 4. SUB-TAB 2: SAVED ADDRESSES & ADD ADDRESS */}
      {activeProfileTab === 'addresses' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Action Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0f172a', margin: 0 }}>
              Your Saved Delivery Addresses
            </h3>

            <button
              onClick={() => setShowAddAddrForm(!showAddAddrForm)}
              style={{
                background: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '10px 18px',
                fontSize: '0.84rem',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Plus size={16} /> {showAddAddrForm ? 'Cancel Add' : 'Add New Address'}
            </button>
          </div>

          {/* Add Address Form Expansion */}
          {showAddAddrForm && (
            <div style={{ background: '#ffffff', borderRadius: '20px', padding: '24px', border: '2px solid #2563eb', boxShadow: '0 4px 16px rgba(37,99,235,0.1)' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: '900', color: '#0f172a', margin: '0 0 16px 0' }}>
                Add New Delivery Address
              </h4>

              <form onSubmit={handleSaveNewAddress} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '800', color: '#334155', display: 'block', marginBottom: '6px' }}>Address Label</label>
                  <select
                    value={newAddrLabel}
                    onChange={(e) => setNewAddrLabel(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  >
                    <option value="Home">Home</option>
                    <option value="Work">Work / Office</option>
                    <option value="Other">Other Location</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '800', color: '#334155', display: 'block', marginBottom: '6px' }}>Flat / Building / House No.</label>
                  <input
                    type="text"
                    placeholder="e.g. Flat 402, Building 3"
                    value={newAddrFlat}
                    onChange={(e) => setNewAddrFlat(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: '800', color: '#334155', display: 'block', marginBottom: '6px' }}>Full Street Address / Area</label>
                  <input
                    type="text"
                    placeholder="e.g. Pocket 2, Sector B, Vasant Kunj"
                    value={newAddrFull}
                    onChange={(e) => setNewAddrFull(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '800', color: '#334155', display: 'block', marginBottom: '6px' }}>City</label>
                  <input
                    type="text"
                    value={newAddrCity}
                    onChange={(e) => setNewAddrCity(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '800', color: '#334155', display: 'block', marginBottom: '6px' }}>Pincode</label>
                  <input
                    type="text"
                    value={newAddrPincode}
                    onChange={(e) => setNewAddrPincode(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <button
                    type="submit"
                    disabled={savingAddress}
                    style={{
                      background: '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '10px 20px',
                      fontWeight: '800',
                      cursor: 'pointer'
                    }}
                  >
                    {savingAddress ? <Loader2 size={16} className="spin" /> : 'Save Address'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowAddAddrForm(false)}
                    style={{
                      background: '#f1f5f9',
                      color: '#475569',
                      border: '1px solid #cbd5e1',
                      borderRadius: '10px',
                      padding: '10px 20px',
                      fontWeight: '800',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Address Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            {addressList.length > 0 ? (
              addressList.map((addr) => (
                <div
                  key={addr.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '18px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '12px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.88rem', fontWeight: '900', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MapPin size={16} color="#2563eb" /> {addr.label}
                      </span>
                      {addr.isDefault && (
                        <span style={{ background: '#dcfce7', color: '#16a34a', fontSize: '0.68rem', fontWeight: '800', padding: '2px 8px', borderRadius: '10px' }}>
                          DEFAULT
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.4, margin: 0 }}>
                      {addr.addressLine || addr.flatNo}
                    </p>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
                      {addr.city}{addr.pincode ? ` - ${addr.pincode}` : ''}
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => handleDeleteAddr(addr.id)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '32px', textAlign: 'center', background: '#ffffff', borderRadius: '18px', border: '1px solid #e2e8f0', gridColumn: '1 / -1' }}>
                <MapPin size={32} color="#94a3b8" style={{ marginBottom: '8px' }} />
                <div style={{ fontWeight: '800', color: '#0f172a' }}>No saved addresses yet</div>
                <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>Click 'Add New Address' above to save a delivery location.</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. SUB-TAB 3: REFER & EARN */}
      {activeProfileTab === 'referral' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Hero Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #701a75 0%, #a21caf 60%, #c026d3 100%)',
            borderRadius: '24px',
            padding: '32px',
            color: '#ffffff',
            boxShadow: '0 16px 36px rgba(162, 28, 175, 0.25)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ maxWidth: '600px' }}>
              <span style={{ background: 'rgba(255, 255, 255, 0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                🎁 NOROZZ CUSTOMER REFERRAL PROGRAM
              </span>
              <h2 style={{ fontSize: '1.8rem', fontWeight: '900', margin: '12px 0 8px 0', letterSpacing: '-0.5px' }}>
                Refer Friends & Earn ₹{referralBonusAmount} Cash!
              </h2>
              <p style={{ fontSize: '0.9rem', opacity: 0.9, lineHeight: 1.5 }}>
                Invite your friends and service technicians to join NOROZZ. You get ₹{referralBonusAmount} credited directly to your Norozz Wallet as soon as they complete their 1st booking!
              </p>
            </div>

            {/* Code Box */}
            <div style={{ marginTop: '24px', background: 'rgba(0, 0, 0, 0.25)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '16px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.6px', opacity: 0.8, fontWeight: '700' }}>Your Referral Code</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '900', letterSpacing: '1px', color: '#fef08a' }}>{referralCode}</div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(referralCode);
                    setCopiedRef(true);
                    toast.success('Referral code copied!');
                    setTimeout(() => setCopiedRef(false), 2000);
                  }}
                  style={{ padding: '10px 18px', background: '#ffffff', color: '#701a75', border: 'none', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  {copiedRef ? <Check size={16} color="#16a34a" /> : <Copy size={16} />} {copiedRef ? 'Copied!' : 'Copy Code'}
                </button>
                <button
                  onClick={() => {
                    const text = `Use my referral code ${referralCode} to sign up on NOROZZ and get flat discount on your 1st home service booking! Download/Book here: https://norozz.in`;
                    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
                  }}
                  style={{ padding: '10px 18px', background: '#25d366', color: '#ffffff', border: 'none', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Share2 size={16} /> WhatsApp Share
                </button>
              </div>
            </div>
          </div>

          {/* Referral Statistics Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{ background: '#ffffff', borderRadius: '18px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '700' }}>Total Referred Users</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#0f172a', marginTop: '4px' }}>
                {referralData?.joinedCount ?? referralData?.stats?.joinedCount ?? 0}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>Joined using your code</div>
            </div>

            <div style={{ background: '#ffffff', borderRadius: '18px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '700' }}>Joined Technicians</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#16a34a', marginTop: '4px' }}>
                {referralData?.joinedTechnicians ?? 0}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#16a34a', marginTop: '2px' }}>Service Partners</div>
            </div>

            <div style={{ background: '#ffffff', borderRadius: '18px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '700' }}>Joined Customers</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#2563eb', marginTop: '4px' }}>
                {referralData?.joinedCustomers ?? 0}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#2563eb', marginTop: '2px' }}>Customer App Users</div>
            </div>

            <div style={{ background: '#ffffff', borderRadius: '18px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '700' }}>Total Bonus Earned</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#c026d3', marginTop: '4px' }}>
                ₹{(referralData?.totalReferralBonusEarned ?? referralData?.stats?.earnedAmount ?? 0).toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#c026d3', marginTop: '2px' }}>Credited to Wallet</div>
            </div>

            <div style={{ background: '#ffffff', borderRadius: '18px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '700' }}>Pending Earnings</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#d97706', marginTop: '4px' }}>
                ₹{(referralData?.pendingEarnings ?? 0).toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#d97706', marginTop: '2px' }}>Pending 1st Booking</div>
            </div>
          </div>

          {/* How Referral Works */}
          <div style={{ background: '#ffffff', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: '0 0 16px 0' }}>How the Referral Bonus Works</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
              <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: '800', color: '#2563eb', fontSize: '0.9rem' }}>1. Share Your Code</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>Share code {referralCode} via WhatsApp or Social Media.</div>
              </div>
              <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: '800', color: '#2563eb', fontSize: '0.9rem' }}>2. Friend Registers</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>Your friend registers using your referral code.</div>
              </div>
              <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: '800', color: '#2563eb', fontSize: '0.9rem' }}>3. 1st Booking Done</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>Friend completes their 1st service booking.</div>
              </div>
              <div style={{ padding: '14px', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
                <div style={{ fontWeight: '800', color: '#16a34a', fontSize: '0.9rem' }}>4. Get ₹{referralBonusAmount} Cash!</div>
                <div style={{ fontSize: '0.8rem', color: '#15803d', marginTop: '4px' }}>Instant ₹{referralBonusAmount} credited directly to your NOROZZ Wallet.</div>
              </div>
            </div>
          </div>

          {/* Referred Users & Technicians Joined List */}
          <div style={{ background: '#ffffff', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserCheck size={20} color="#16a34a" /> Referred Users & Technicians ({referralList.length})
              </h3>

              {/* Filter Tabs */}
              <div style={{ display: 'flex', gap: '6px', background: '#f1f5f9', padding: '4px', borderRadius: '10px' }}>
                {['ALL', 'PARTNER', 'CUSTOMER'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setReferralUserFilter(f)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: '800',
                      border: 'none',
                      cursor: 'pointer',
                      background: referralUserFilter === f ? '#ffffff' : 'transparent',
                      color: referralUserFilter === f ? '#0f172a' : '#64748b',
                      boxShadow: referralUserFilter === f ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
                    }}
                  >
                    {f === 'ALL' ? 'All Users' : f === 'PARTNER' ? 'Technicians' : 'Customers'}
                  </button>
                ))}
              </div>
            </div>

            {referralList.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#334155' }}>No Users Joined Yet</div>
                <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>Share your code <strong>{referralCode}</strong> with friends & technicians to earn ₹{referralBonusAmount} per referral!</div>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '0.76rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      <th style={{ padding: '12px', borderRadius: '8px 0 0 8px' }}>USER / TECHNICIAN NAME</th>
                      <th style={{ padding: '12px' }}>USER ROLE</th>
                      <th style={{ padding: '12px' }}>PHONE / CONTACT</th>
                      <th style={{ padding: '12px' }}>JOIN DATE</th>
                      <th style={{ padding: '12px' }}>ACCOUNT STATUS</th>
                      <th style={{ padding: '12px', borderRadius: '0 8px 8px 0' }}>REFERRAL BONUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {referralList
                      .filter((u) => referralUserFilter === 'ALL' || (u.role || 'customer').toUpperCase() === referralUserFilter)
                      .map((u) => {
                        const joinDateStr = u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent';
                        const isCredited = u.referralBonusStatus === 'credited';
                        const isPartner = u.role === 'partner';
                        return (
                          <tr key={u._id || u.phone || Math.random()} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '12px' }}>
                              <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '0.9rem' }}>{u.name || (isPartner ? 'Service Partner' : 'Customer User')}</div>
                              {u.userId && <div style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'monospace' }}>{u.userId}</div>}
                            </td>
                            <td style={{ padding: '12px' }}>
                              <span style={{
                                padding: '3px 8px',
                                borderRadius: '6px',
                                fontSize: '0.7rem',
                                fontWeight: '800',
                                background: isPartner ? '#dcfce7' : '#f3e8ff',
                                color: isPartner ? '#15803d' : '#6b21a8'
                              }}>
                                {isPartner ? 'TECHNICIAN' : 'CUSTOMER'}
                              </span>
                            </td>
                            <td style={{ padding: '12px', fontSize: '0.85rem', color: '#475569', fontWeight: '600' }}>{u.phone || u.email || 'N/A'}</td>
                            <td style={{ padding: '12px', fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>{joinDateStr}</td>
                            <td style={{ padding: '12px' }}>
                              <span style={{
                                padding: '3px 8px',
                                borderRadius: '6px',
                                fontSize: '0.7rem',
                                fontWeight: '800',
                                background: u.kycStatus === 'approved' || u.status === 'active' ? '#dcfce7' : '#fef3c7',
                                color: u.kycStatus === 'approved' || u.status === 'active' ? '#15803d' : '#b45309'
                              }}>
                                {(u.kycStatus || u.status || 'ACTIVE').toUpperCase()}
                              </span>
                            </td>
                            <td style={{ padding: '12px' }}>
                              <span style={{
                                padding: '4px 10px',
                                borderRadius: '9999px',
                                fontSize: '0.78rem',
                                fontWeight: '800',
                                background: isCredited ? '#f0fdf4' : '#fffbeb',
                                color: isCredited ? '#16a34a' : '#d97706',
                                border: `1px solid ${isCredited ? '#bbf7d0' : '#fde68a'}`
                              }}>
                                {isCredited ? `✓ ₹${referralBonusAmount} Credited` : '⏳ Pending 1st Booking'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* 6. SUB-TAB 4: HELP CENTER & SUPPORT */}
      {activeProfileTab === 'support' && (
        <div style={{ background: '#ffffff', borderRadius: '24px', padding: '24px', border: '1px solid #e2e8f0' }}>
          <CustomerHelpCenterView onBack={() => setActiveProfileTab('overview')} onOpenAIChat={onOpenAIChat} />
        </div>
      )}

    </div>
  );
};

export default CustomerProfileView;
