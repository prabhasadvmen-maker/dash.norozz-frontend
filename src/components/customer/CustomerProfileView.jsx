import React, { useState, useEffect } from 'react';
import {
  User,
  MapPin,
  Bell,
  Heart,
  Gift,
  ShoppingBag,
  Wallet,
  HelpCircle,
  Settings,
  LogOut,
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  Camera,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Lock,
  Loader2,
  Share2,
  Copy,
  MessageSquare,
  PhoneCall,
  Sparkles,
  Tag,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { useCustomer } from '../../hooks/useCustomer.js';
import { customerService } from '../../services/customer.service.js';
import { toast } from '../../utils/toast.js';
import { axiosInstance } from '../../api/axiosInstance.js';

const CustomerProfileView = ({ currentUser, onLogout, onNavigateTab }) => {
  const { profile, addresses: fetchedAddresses, deleteAddress, updateProfile, refetch } = useCustomer('profile');

  // Navigation View State: 'main' | 'edit_profile' | 'addresses' | 'add_address' | 'notifications' | 'favorites' | 'refer' | 'wallet' | 'help' | 'settings'
  const [viewMode, setViewMode] = useState('main');

  const userData = profile || currentUser;

  // Screen 2: Edit Profile Form State
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editDob, setEditDob] = useState('1998-09-14');
  const [editGender, setEditGender] = useState('Female');
  const [editAvatar, setEditAvatar] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Screen 3 & 4: Saved Addresses List & New Address Form State
  const [addressList, setAddressList] = useState([]);

  // Add Address Form State
  const [newAddrLabel, setNewAddrLabel] = useState('Home');
  const [newAddrFull, setNewAddrFull] = useState('');
  const [newAddrFlat, setNewAddrFlat] = useState('');
  const [newAddrLandmark, setNewAddrLandmark] = useState('');
  const [newAddrCity, setNewAddrCity] = useState('Mumbai');
  const [newAddrPincode, setNewAddrPincode] = useState('400053');
  const [savingAddress, setSavingAddress] = useState(false);

  // Live Referral Data State from Database
  const [referralData, setReferralData] = useState({
    referralCode: userData?.referralCode || '',
    rewardPerReferral: 200,
    stats: { invitedCount: 0, joinedCount: 0, earnedAmount: 0 },
    referralsList: []
  });

  useEffect(() => {
    if (viewMode === 'refer') {
      const fetchReferralInfo = async () => {
        try {
          const res = await customerService.getReferralData();
          if (res.data?.data) {
            setReferralData(res.data.data);
          }
        } catch (err) {
          console.warn('Referral data load error:', err);
        }
      };
      fetchReferralInfo();
    }
  }, [viewMode]);

  // Live Wallet Data State
  const [walletData, setWalletData] = useState(null);

  useEffect(() => {
    if (viewMode === 'wallet') {
      const fetchWalletInfo = async () => {
        try {
          const res = await customerService.getWallet();
          if (res.data?.data) {
            setWalletData(res.data.data);
          }
        } catch (err) {
          console.warn('Wallet data load error:', err);
        }
      };
      fetchWalletInfo();
    }
  }, [viewMode]);

  // Bookings State for embedded My Booking view
  const [bookingsList, setBookingsList] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [bookingFilterTab, setBookingFilterTab] = useState('pending');

  useEffect(() => {
    if (viewMode === 'bookings') {
      const fetchBookings = async () => {
        setLoadingBookings(true);
        try {
          const res = await customerService.getBookingHistory();
          const list = res.data?.data || res.data || [];
          setBookingsList(Array.isArray(list) ? list : []);
        } catch (err) {
          console.warn('Booking history load error:', err);
        } finally {
          setLoadingBookings(false);
        }
      };
      fetchBookings();
    }
  }, [viewMode]);

  // Notifications State (Figma Screen 5)
  const [notifications, setNotifications] = useState([
    {
      id: 'n1',
      category: 'TODAY',
      title: 'Booking Confirmed',
      message: 'Your deep cleaning service has been scheduled for tomorrow at 10:00 AM.',
      time: '2 min ago',
      unread: true,
      icon: Bell,
      color: '#10b981'
    },
    {
      id: 'n2',
      category: 'TODAY',
      title: 'Payment Received',
      message: 'We received payment of ₹1,499 for your AC maintenance request.',
      time: '1 hr ago',
      unread: true,
      icon: Wallet,
      color: '#06b6d4'
    },
    {
      id: 'n3',
      category: 'TODAY',
      title: 'Flat 20% Off!',
      message: 'Celebrate the festival season! Use code NOROZZ20 on any home repair service.',
      time: '4 hr ago',
      unread: true,
      icon: Sparkles,
      color: '#f59e0b'
    },
    {
      id: 'n4',
      category: 'YESTERDAY',
      title: 'Service Partner Assigned',
      message: 'Ramesh Kumar has been assigned to your Plumbing repair service.',
      time: '1 day ago',
      unread: false,
      icon: User,
      color: '#3b82f6'
    },
    {
      id: 'n5',
      category: 'YESTERDAY',
      title: 'New Features Launched',
      message: 'You can now track your assigned service partner live on the map!',
      time: '1 day ago',
      unread: false,
      icon: Tag,
      color: '#8b5cf6'
    }
  ]);

  // Sync user data on load
  useEffect(() => {
    if (userData) {
      setEditName(userData.name || 'Ananya Sharma');
      setEditEmail(userData.email || 'ananya@email.com');
      setEditPhone(userData.phone || '+91 98765 43210');
      setEditAvatar(userData.profileImage || '');
      if (userData.gender) setEditGender(userData.gender);
      if (userData.dob) setEditDob(userData.dob);
    }
  }, [userData]);

  // Sync addresses live from Backend API
  useEffect(() => {
    const loadLiveAddresses = async () => {
      try {
        const res = await customerService.getAddresses();
        const serverList = res.data?.data || res.data || [];
        if (Array.isArray(serverList) && serverList.length > 0) {
          const formatted = serverList.map((a, idx) => ({
            id: a._id || a.id || `addr_${idx}`,
            label: a.title || a.label || (idx === 0 ? 'Home' : 'Office'),
            isDefault: a.isDefault || idx === 0,
            addressLine: a.addressLine || a.street || a.address || '',
            flatNo: a.addressLine || '',
            landmark: a.landmark || '',
            city: a.city || 'Mumbai',
            pincode: a.pincode || a.zipCode || '400053'
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
          label: a.title || a.label || (idx === 0 ? 'Home' : 'Office'),
          isDefault: a.isDefault || idx === 0,
          addressLine: a.addressLine || a.street || a.address || '',
          flatNo: a.addressLine || '',
          landmark: a.landmark || '',
          city: a.city || 'Mumbai',
          pincode: a.pincode || a.zipCode || '400053'
        }));
        setAddressList(formatted);
      } else if (userData?.address) {
        setAddressList([{
          id: 'user_profile_addr',
          label: 'Home',
          isDefault: true,
          addressLine: userData.address,
          city: userData.city || 'Mumbai',
          pincode: '400053'
        }]);
      } else {
        setAddressList([]);
      }
    };

    loadLiveAddresses();
  }, [fetchedAddresses, userData]);

  // Handle Save Profile Changes
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      if (updateProfile) {
        await updateProfile({
          name: editName,
          email: editEmail,
          profileImage: editAvatar,
          gender: editGender,
          dob: editDob
        });
      }
      toast.success('🎉 Profile updated successfully!');
      setViewMode('main');
    } catch (err) {
      toast.error('Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle Add New Address
  const handleSaveNewAddress = async (e) => {
    e.preventDefault();
    if (!newAddrFull && !newAddrFlat) {
      toast.error('Please enter complete address details');
      return;
    }

    setSavingAddress(true);
    const fullLine = `${newAddrFlat ? newAddrFlat + ', ' : ''}${newAddrFull || 'Lokhandwala, Andheri West'}`;
    const payload = {
      title: newAddrLabel,
      addressLine: fullLine,
      city: newAddrCity || 'Mumbai',
      state: 'Maharashtra',
      pincode: newAddrPincode || '400053',
      isDefault: addressList.length === 0
    };

    try {
      const res = await customerService.addAddress(payload);
      toast.success('📍 New address saved successfully!');
      
      const serverAddrs = res.data?.data?.addresses || res.data?.addresses || [];
      if (serverAddrs.length > 0) {
        const formatted = serverAddrs.map((a, idx) => ({
          id: a._id || a.id || `addr_${idx}`,
          label: a.title || (idx === 0 ? 'Home' : 'Office'),
          isDefault: a.isDefault || idx === 0,
          addressLine: `${a.addressLine || a.street || ''}${a.city ? ', ' + a.city : ''}${a.pincode ? ' - ' + a.pincode : ''}`,
          flatNo: a.addressLine || '',
          landmark: a.landmark || '',
          city: a.city || 'Mumbai',
          pincode: a.pincode || '400053'
        }));
        setAddressList(formatted);
      } else {
        setAddressList((prev) => [{ id: `addr_${Date.now()}`, ...payload }, ...prev]);
      }

      if (refetch) refetch();
      setNewAddrFull('');
      setNewAddrFlat('');
      setNewAddrLandmark('');
      setViewMode('addresses');
    } catch (err) {
      console.error('Save address error:', err);
      toast.error(err.response?.data?.message || 'Failed to save address.');
    } finally {
      setSavingAddress(false);
    }
  };

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

  // Count unread notifications
  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', minHeight: '100vh', background: '#090d16', color: '#ffffff', paddingBottom: '80px', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.6)' }}>
      
      {/* HEADER NAVBAR IF NOT IN MAIN VIEW */}
      {viewMode !== 'main' && (
        <div style={{ padding: '16px 20px', background: '#0f172a', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
          <button
            type="button"
            onClick={() => setViewMode(viewMode === 'add_address' ? 'addresses' : 'main')}
            style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', cursor: 'pointer' }}
          >
            <ArrowLeft size={18} />
          </button>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '800', margin: 0, color: '#ffffff' }}>
            {viewMode === 'edit_profile' && 'Edit Profile'}
            {viewMode === 'addresses' && 'Saved Addresses'}
            {viewMode === 'add_address' && 'Add New Address'}
            {viewMode === 'notifications' && 'Notifications'}
            {viewMode === 'favorites' && 'Favorite Services'}
            {viewMode === 'refer' && 'Refer & Earn'}
            {viewMode === 'bookings' && 'My Bookings History'}
            {viewMode === 'wallet' && 'Norozz Wallet'}
            {viewMode === 'help' && 'Help Center'}
            {viewMode === 'settings' && 'App Settings'}
          </h3>
          <div style={{ width: '36px' }} />
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 1: FIGMA SCREEN-BODY (MAIN PROFILE OVERVIEW MENU) */}
      {/* ========================================================================= */}
      {viewMode === 'main' && (
        <div>
          {/* GREEN HEADER BANNER */}
          <div
            style={{
              padding: '36px 24px 28px 24px',
              background: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #10b981 100%)',
              textAlign: 'center',
              position: 'relative',
            }}
          >
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '12px' }}>
              <div
                style={{
                  width: '84px',
                  height: '84px',
                  borderRadius: '50%',
                  background: editAvatar ? `url(${editAvatar}) center/cover` : 'linear-gradient(135deg, #0f172a, #1e293b)',
                  color: '#ffffff',
                  fontSize: '2.4rem',
                  fontWeight: '800',
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'center',
                  margin: '0 auto',
                  border: '3.5px solid #ffffff',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
                  overflow: 'hidden'
                }}
              >
                {!editAvatar && (userData?.name ? userData.name.charAt(0).toUpperCase() : 'A')}
              </div>
              <button
                type="button"
                onClick={() => setViewMode('edit_profile')}
                style={{
                  position: 'absolute',
                  bottom: '2px',
                  right: '2px',
                  background: '#10b981',
                  color: '#ffffff',
                  borderRadius: '50%',
                  width: '26px',
                  height: '26px',
                  border: '2px solid #ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'center',
                  cursor: 'pointer'
                }}
              >
                <Camera size={13} />
              </button>
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0, color: '#ffffff' }}>
              {editName || userData?.name || 'Ananya Sharma'}
            </h2>
            <div style={{ fontSize: '0.84rem', color: '#a7f3d0', fontWeight: '600', marginTop: '3px' }}>
              {editPhone || userData?.phone || '+91 98765 XXXXX'}
            </div>
          </div>

          {/* MENU ITEMS LIST (EXACT FIGMA SCREEN 1 SCHEME) */}
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {[
              { id: 'edit_profile', label: 'Edit Profile', icon: User, action: () => setViewMode('edit_profile') },
              { id: 'addresses', label: 'Saved Addresses', icon: MapPin, action: () => setViewMode('addresses') },
              {
                id: 'notifications',
                label: 'Notifications',
                icon: Bell,
                badge: unreadCount > 0 ? `${unreadCount} New` : null,
                action: () => setViewMode('notifications')
              },
              { id: 'favorites', label: 'Favorites', icon: Heart, action: () => setViewMode('favorites') },
              { id: 'refer', label: 'Refer & Earn', icon: Gift, action: () => setViewMode('refer') },
              { id: 'bookings', label: 'My Booking', icon: ShoppingBag, action: () => onNavigateTab ? onNavigateTab('bookings') : setViewMode('bookings') },
              { id: 'wallet', label: 'Wallet', icon: Wallet, action: () => setViewMode('wallet') },
              { id: 'help', label: 'Help Center', icon: HelpCircle, action: () => setViewMode('help') },
              { id: 'settings', label: 'Settings', icon: Settings, action: () => setViewMode('settings') },
            ].map((item) => {
              const IconComp = item.icon;
              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  style={{
                    padding: '16px 18px',
                    borderRadius: '16px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  className="hover-card"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <IconComp size={20} color="#a7f3d0" />
                    <span style={{ fontSize: '0.95rem', fontWeight: '700', color: '#e2e8f0' }}>{item.label}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {item.badge && (
                      <span style={{ background: '#f59e0b', color: '#000000', padding: '3px 10px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: '800' }}>
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight size={18} color="#64748b" />
                  </div>
                </div>
              );
            })}

            {/* LOG OUT BUTTON */}
            <div
              onClick={onLogout}
              style={{
                padding: '16px 18px',
                borderRadius: '16px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                cursor: 'pointer',
                marginTop: '12px'
              }}
            >
              <LogOut size={20} color="#ef4444" />
              <span style={{ fontSize: '0.95rem', fontWeight: '800', color: '#ef4444' }}>Log Out</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 2: FIGMA EDIT PROFILE */}
      {/* ========================================================================= */}
      {viewMode === 'edit_profile' && (
        <div style={{ padding: '24px 20px' }}>
          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            {/* PROFILE PHOTO AVATAR */}
            <div style={{ textAlign: 'center', marginBottom: '8px' }}>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <div
                  style={{
                    width: '88px',
                    height: '88px',
                    borderRadius: '50%',
                    background: editAvatar ? `url(${editAvatar}) center/cover` : 'linear-gradient(135deg, #10b981, #059669)',
                    color: '#ffffff',
                    fontSize: '2.5rem',
                    fontWeight: '800',
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'center',
                    margin: '0 auto',
                    border: '3px solid #10b981',
                    overflow: 'hidden'
                  }}
                >
                  {!editAvatar && (editName ? editName.charAt(0).toUpperCase() : 'A')}
                </div>
                <label
                  style={{
                    position: 'absolute',
                    bottom: '2px',
                    right: '2px',
                    background: '#10b981',
                    color: '#ffffff',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    border: '2px solid #090d16',
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <Camera size={14} />
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = URL.createObjectURL(file);
                        setEditAvatar(url);
                        toast.success('Photo updated!');
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            {/* FULL NAME */}
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Full Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                style={{ width: '100%', padding: '14px 16px', borderRadius: '14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: '#ffffff', fontSize: '0.92rem', outline: 'none', boxSizing: 'border-box' }}
                required
              />
            </div>

            {/* EMAIL ADDRESS */}
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Email Address</label>
              <input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                style={{ width: '100%', padding: '14px 16px', borderRadius: '14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: '#ffffff', fontSize: '0.92rem', outline: 'none', boxSizing: 'border-box' }}
                required
              />
            </div>

            {/* PHONE NUMBER (LOCKED WITH VERIFIED BADGE) */}
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Phone Number</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={editPhone}
                  disabled
                  readOnly
                  style={{ width: '100%', padding: '14px 16px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontSize: '0.92rem', outline: 'none', cursor: 'not-allowed', boxSizing: 'border-box' }}
                />
                <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: '1px solid #10b981', padding: '3px 10px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={12} /> VERIFIED
                </span>
              </div>
            </div>

            {/* DATE OF BIRTH */}
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Date of Birth</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="date"
                  value={editDob}
                  onChange={(e) => setEditDob(e.target.value)}
                  style={{ width: '100%', padding: '14px 16px', borderRadius: '14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: '#ffffff', fontSize: '0.92rem', outline: 'none', boxSizing: 'border-box', colorScheme: 'dark' }}
                />
              </div>
            </div>

            {/* GENDER SELECTOR PILLS */}
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>Gender</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {['Male', 'Female', 'Other'].map((g) => {
                  const isSel = editGender === g;
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setEditGender(g)}
                      style={{
                        padding: '10px 24px',
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        fontWeight: '800',
                        border: isSel ? '2px solid #10b981' : '1px solid rgba(255,255,255,0.15)',
                        background: isSel ? '#10b981' : 'rgba(255,255,255,0.05)',
                        color: isSel ? '#ffffff' : '#cbd5e1',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        flex: 1
                      }}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SAVE CHANGES CTA BUTTON */}
            <button
              type="submit"
              disabled={savingProfile}
              style={{
                marginTop: '16px',
                padding: '16px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                fontWeight: '800',
                fontSize: '1rem',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(16, 185, 129, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justify: 'center',
                gap: '8px'
              }}
            >
              {savingProfile ? <Loader2 size={20} className="spin" /> : 'Save Changes'}
            </button>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 3: FIGMA SAVED ADDRESS */}
      {/* ========================================================================= */}
      {viewMode === 'addresses' && (
        <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* ADDRESS CARDS LIST */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {addressList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 20px', background: 'rgba(255,255,255,0.03)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                  <MapPin size={28} />
                </div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', fontWeight: '800', color: '#ffffff' }}>
                  No Saved Addresses Found
                </h4>
                <p style={{ margin: 0, fontSize: '0.84rem', color: '#94a3b8', lineHeight: 1.5 }}>
                  You have not added any addresses yet. Click "+ Add New Address" below to save your delivery location.
                </p>
              </div>
            ) : (
              addressList.map((addr) => (
                <div
                  key={addr.id}
                  style={{
                    padding: '18px',
                    borderRadius: '20px',
                    background: 'rgba(255,255,255,0.04)',
                    border: addr.isDefault ? '2px solid #10b981' : '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MapPin size={18} color="#10b981" />
                      <span style={{ fontWeight: '800', fontSize: '1rem', color: '#ffffff' }}>{addr.label}</span>
                      {addr.isDefault && (
                        <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: '1px solid #10b981', padding: '2px 8px', borderRadius: '8px', fontSize: '0.68rem', fontWeight: '800' }}>
                          DEFAULT
                        </span>
                      )}
                    </div>

                    <span style={{ width: '18px', height: '18px', borderRadius: '50%', border: addr.isDefault ? '5px solid #10b981' : '2px solid #64748b', background: '#090d16' }} />
                  </div>

                  <p style={{ fontSize: '0.86rem', color: '#cbd5e1', margin: 0, lineHeight: 1.5 }}>
                    {addr.addressLine}
                  </p>

                  <div style={{ display: 'flex', gap: '16px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setNewAddrLabel(addr.label);
                        setNewAddrFlat(addr.flatNo);
                        setNewAddrLandmark(addr.landmark);
                        setViewMode('add_address');
                      }}
                      style={{ background: 'none', border: 'none', color: '#34d399', fontSize: '0.82rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                    >
                      <Edit2 size={14} /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteAddr(addr.id)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.82rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ADD NEW ADDRESS BUTTON */}
          <button
            type="button"
            onClick={() => {
              setNewAddrLabel('Home');
              setNewAddrFull('');
              setNewAddrFlat('');
              setNewAddrLandmark('');
              setViewMode('add_address');
            }}
            style={{
              padding: '16px',
              borderRadius: '16px',
              background: 'transparent',
              border: '2px dashed #10b981',
              color: '#34d399',
              fontWeight: '800',
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justify: 'center',
              gap: '8px',
              marginTop: '10px'
            }}
          >
            <Plus size={18} /> + Add New Address
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 4: FIGMA ADD NEW ADDRESS */}
      {/* ========================================================================= */}
      {viewMode === 'add_address' && (
        <div style={{ padding: '24px 20px' }}>
          
          {/* INTERACTIVE LOCATION PIN HEADER MAP */}
          <div style={{ height: '140px', borderRadius: '18px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.15)', marginBottom: '20px', position: 'relative' }}>
            <iframe
              title="Add Address Pin Map"
              width="100%"
              height="100%"
              frameBorder="0"
              src="https://maps.google.com/maps?q=Mumbai+Maharashtra&t=&z=14&ie=UTF8&iwloc=&output=embed"
              style={{ filter: 'contrast(1.05)' }}
            />
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -100%)', background: '#10b981', color: '#fff', padding: '6px', borderRadius: '50%', boxShadow: '0 4px 14px rgba(0,0,0,0.4)' }}>
              <MapPin size={22} />
            </div>
          </div>

          <form onSubmit={handleSaveNewAddress} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* ADDRESS LABEL TOGGLE PILLS */}
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>Address Label</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {['Home', 'Office', 'Other'].map((lbl) => {
                  const isSel = newAddrLabel === lbl;
                  return (
                    <button
                      key={lbl}
                      type="button"
                      onClick={() => setNewAddrLabel(lbl)}
                      style={{
                        padding: '10px 20px',
                        borderRadius: '20px',
                        fontSize: '0.84rem',
                        fontWeight: '800',
                        border: isSel ? '2px solid #10b981' : '1px solid rgba(255,255,255,0.15)',
                        background: isSel ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255,255,255,0.05)',
                        color: isSel ? '#34d399' : '#cbd5e1',
                        cursor: 'pointer',
                        flex: 1
                      }}
                    >
                      {lbl}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* FULL ADDRESS / LOCATION */}
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Full Address / Area</label>
              <input
                type="text"
                placeholder="e.g. 91 Orchard St, New York, NY 10002"
                value={newAddrFull}
                onChange={(e) => setNewAddrFull(e.target.value)}
                style={{ width: '100%', padding: '14px 16px', borderRadius: '14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: '#ffffff', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {/* FLOOR / FLAT / BUILDING NO */}
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Floor / Flat / Building No.</label>
              <input
                type="text"
                placeholder="e.g. 4th Floor, Apt 4B"
                value={newAddrFlat}
                onChange={(e) => setNewAddrFlat(e.target.value)}
                style={{ width: '100%', padding: '14px 16px', borderRadius: '14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: '#ffffff', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                required
              />
            </div>

            {/* LANDMARK */}
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Landmark</label>
              <input
                type="text"
                placeholder="e.g. Next to Orchard Cafe"
                value={newAddrLandmark}
                onChange={(e) => setNewAddrLandmark(e.target.value)}
                style={{ width: '100%', padding: '14px 16px', borderRadius: '14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: '#ffffff', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {/* SAVE ADDRESS BUTTON */}
            <button
              type="submit"
              disabled={savingAddress}
              style={{
                marginTop: '12px',
                padding: '16px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                fontWeight: '800',
                fontSize: '1rem',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(16, 185, 129, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justify: 'center',
                gap: '8px'
              }}
            >
              {savingAddress ? <Loader2 size={20} className="spin" /> : 'Save Address'}
            </button>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 5: FIGMA NOTIFICATIONS */}
      {/* ========================================================================= */}
      {viewMode === 'notifications' && (
        <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {['TODAY', 'YESTERDAY'].map((cat) => {
            const list = notifications.filter((n) => n.category === cat);
            if (list.length === 0) return null;

            return (
              <div key={cat}>
                <div style={{ fontSize: '0.74rem', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.8px', marginBottom: '12px' }}>
                  {cat}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {list.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <div
                        key={item.id}
                        style={{
                          padding: '16px',
                          borderRadius: '18px',
                          background: item.unread ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
                          border: item.unread ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255,255,255,0.08)',
                          display: 'flex',
                          gap: '14px',
                          position: 'relative'
                        }}
                      >
                        <div
                          style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '14px',
                            background: 'rgba(255,255,255,0.08)',
                            display: 'flex',
                            alignItems: 'center',
                            justify: 'center',
                            flexShrink: 0
                          }}
                        >
                          <IconComponent size={20} color={item.color} />
                        </div>

                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <span style={{ fontWeight: '800', fontSize: '0.92rem', color: '#ffffff' }}>{item.title}</span>
                            <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '600' }}>{item.time}</span>
                          </div>
                          <p style={{ fontSize: '0.83rem', color: '#cbd5e1', margin: 0, lineHeight: 1.4 }}>
                            {item.message}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* OTHER SUB-VIEWS (BOOKINGS, FAVORITES, REFER, WALLET, HELP, SETTINGS) */}
      {/* ========================================================================= */}
      {viewMode === 'bookings' && (() => {
        const getCat = (b) => {
          const st = (b.status || '').toLowerCase();
          if (st.includes('completed') || st.includes('finished')) return 'completed';
          if (st.includes('cancel') || st.includes('refund') || st.includes('reject')) return 'canceled';
          if (st.includes('assign') || st.includes('way') || st.includes('start') || st.includes('work') || st.includes('progress') || st.includes('accept')) return 'working';
          return 'pending';
        };

        const pendingList = bookingsList.filter((b) => getCat(b) === 'pending');
        const workingList = bookingsList.filter((b) => getCat(b) === 'working');
        const completedList = bookingsList.filter((b) => getCat(b) === 'completed');
        const canceledList = bookingsList.filter((b) => getCat(b) === 'canceled');

        const activeList =
          bookingFilterTab === 'pending'
            ? pendingList
            : bookingFilterTab === 'working'
            ? workingList
            : bookingFilterTab === 'completed'
            ? completedList
            : canceledList;

        return (
          <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* 4 FILTER TABS BAR: PENDING | WORKING | COMPLETED | CANCELED */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {[
                { id: 'pending', label: 'Pending', icon: '⏳', count: pendingList.length, activeBg: 'rgba(245, 158, 11, 0.15)', activeText: '#fbbf24', activeBorder: '#f59e0b' },
                { id: 'working', label: 'Working', icon: '⚙️', count: workingList.length, activeBg: 'rgba(37, 99, 235, 0.15)', activeText: '#60a5fa', activeBorder: '#2563eb' },
                { id: 'completed', label: 'Completed', icon: '✅', count: completedList.length, activeBg: 'rgba(16, 185, 129, 0.15)', activeText: '#34d399', activeBorder: '#10b981' },
                { id: 'canceled', label: 'Canceled', icon: '❌', count: canceledList.length, activeBg: 'rgba(239, 68, 68, 0.15)', activeText: '#f87171', activeBorder: '#ef4444' },
              ].map((tab) => {
                const isSel = bookingFilterTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setBookingFilterTab(tab.id)}
                    style={{
                      padding: '10px 4px',
                      borderRadius: '14px',
                      border: isSel ? `2px solid ${tab.activeBorder}` : '1px solid rgba(255,255,255,0.08)',
                      background: isSel ? tab.activeBg : 'rgba(255,255,255,0.03)',
                      color: isSel ? tab.activeText : '#94a3b8',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      fontWeight: '800',
                      fontSize: '0.78rem',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <span>{tab.icon}</span>
                      <span>{tab.label}</span>
                    </div>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        padding: '2px 7px',
                        borderRadius: '8px',
                        background: isSel ? tab.activeBorder : 'rgba(255,255,255,0.08)',
                        color: isSel ? '#ffffff' : '#64748b',
                        fontWeight: '800',
                      }}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* LIST OR EMPTY STATE */}
            {loadingBookings ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <Loader2 size={32} className="spin" color="#10b981" />
                <div style={{ marginTop: '10px', fontSize: '0.85rem', color: '#94a3b8' }}>Loading your booking history...</div>
              </div>
            ) : activeList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 20px', background: 'rgba(255,255,255,0.03)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '2.2rem', marginBottom: '8px' }}>
                  {bookingFilterTab === 'pending' && '⏳'}
                  {bookingFilterTab === 'working' && '⚙️'}
                  {bookingFilterTab === 'completed' && '✅'}
                  {bookingFilterTab === 'canceled' && '❌'}
                </div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', fontWeight: '800', color: '#ffffff' }}>
                  No {bookingFilterTab.charAt(0).toUpperCase() + bookingFilterTab.slice(1)} Bookings
                </h4>
                <p style={{ margin: '0 0 16px 0', fontSize: '0.84rem', color: '#94a3b8' }}>
                  You currently have no {bookingFilterTab} service bookings in your account.
                </p>
                <button
                  type="button"
                  onClick={() => onNavigateTab ? onNavigateTab('services') : setViewMode('main')}
                  style={{ background: '#10b981', color: '#ffffff', border: 'none', borderRadius: '12px', padding: '10px 20px', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  Explore Home Services
                </button>
              </div>
            ) : (
              activeList.map((b) => {
                const bRef = b.bookingId || b.bookingNumber || `UC-${b._id?.toString().slice(-6).toUpperCase()}`;
                const sTitle = b.packageName || b.service?.name || b.serviceName || b.packageTitle || 'Home Service Package';
                const sAmount = b.amount || b.totalAmount || b.service?.finalPrice || 599;
                const sStatus = b.status || 'Pending';
                const sDate = b.bookingDate ? new Date(b.bookingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Today';

                return (
                  <div
                    key={b._id || b.id}
                    style={{
                      padding: '18px',
                      borderRadius: '20px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.76rem', fontWeight: '800', color: '#3b82f6', letterSpacing: '0.5px' }}>
                        BOOKING REF: {bRef}
                      </span>
                      <span
                        style={{
                          padding: '3px 10px',
                          borderRadius: '10px',
                          fontSize: '0.72rem',
                          fontWeight: '800',
                          background: sStatus === 'Completed' ? 'rgba(16, 185, 129, 0.2)' : sStatus === 'Cancelled' || sStatus === 'Canceled' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(37, 99, 235, 0.2)',
                          color: sStatus === 'Completed' ? '#34d399' : sStatus === 'Cancelled' || sStatus === 'Canceled' ? '#f87171' : '#60a5fa',
                          border: sStatus === 'Completed' ? '1px solid #10b981' : sStatus === 'Cancelled' || sStatus === 'Canceled' ? '1px solid #ef4444' : '1px solid #2563eb'
                        }}
                      >
                        {sStatus.toUpperCase()}
                      </span>
                    </div>

                    <div>
                      <div style={{ fontWeight: '800', fontSize: '1.05rem', color: '#ffffff' }}>{sTitle}</div>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
                        📅 {sDate} • ⌚ {b.timeSlot || '10:30 AM'}
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                      <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#34d399' }}>₹{sAmount}</div>
                      <button
                        type="button"
                        onClick={() => onNavigateTab ? onNavigateTab('bookings') : setViewMode('main')}
                        style={{ background: 'rgba(255,255,255,0.08)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', padding: '8px 14px', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer' }}
                      >
                        Track Service ➔
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        );
      })()}

      {viewMode === 'favorites' && (
        <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {[
            { name: 'AC Deep Clean & Foam Wash', category: 'AC Cleaning', price: 799, rating: 4.9 },
            { name: 'Full Home Deep Cleaning', category: 'Cleaning', price: 1499, rating: 4.8 },
            { name: 'Beard Trim & Hot Towel Shave', category: 'Men Salon', price: 276, rating: 4.9 },
          ].map((fav, i) => (
            <div key={i} style={{ padding: '16px', background: 'rgba(255,255,255,0.04)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#ffffff' }}>{fav.name}</div>
                <div style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: '700', marginTop: '2px' }}>₹{fav.price} • ⭐ {fav.rating}</div>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab ? onNavigateTab('services') : null}
                style={{ background: '#10b981', color: '#ffffff', border: 'none', borderRadius: '12px', padding: '8px 14px', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer' }}
              >
                Book Now
              </button>
            </div>
          ))}
        </div>
      )}

      {viewMode === 'refer' && (
        <div style={{ padding: '20px 20px 32px 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* TOP GIFT BOX ILLUSTRATION BANNER */}
          <div
            style={{
              padding: '28px 20px',
              background: 'linear-gradient(180deg, #fef3c7 0%, #fde68a 100%)',
              borderRadius: '24px',
              textAlign: 'center',
              boxShadow: '0 8px 24px rgba(245, 158, 11, 0.15)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Sparkles Floating Background */}
            <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: '#ffffff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 25px rgba(217, 119, 6, 0.25)', marginBottom: '4px' }}>
              <Gift size={44} color="#d97706" />
            </div>
            <div style={{ position: 'absolute', top: '12px', left: '16px', color: '#b45309', opacity: 0.6 }}>✨</div>
            <div style={{ position: 'absolute', top: '24px', right: '20px', color: '#b45309', opacity: 0.6 }}>✦</div>
            <div style={{ position: 'absolute', bottom: '12px', left: '30px', color: '#b45309', opacity: 0.5 }}>✦</div>
          </div>

          {/* TITLE & SUBTITLE */}
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.45rem', fontWeight: '800', margin: 0, color: '#ffffff' }}>
              Invite Friends, Earn Rewards
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8', margin: '6px 0 0 0', lineHeight: 1.5 }}>
              Get <span style={{ color: '#34d399', fontWeight: '800' }}>₹{referralData.rewardPerReferral || 200}</span> for every friend who books their first service.
            </p>
          </div>

          {/* YOUR REFERRAL CODE BOX */}
          <div
            style={{
              padding: '18px 20px',
              borderRadius: '20px',
              background: 'rgba(16, 185, 129, 0.05)',
              border: '2px dashed #10b981',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '8px' }}>
              YOUR REFERRAL CODE
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <span style={{ fontSize: '1.45rem', fontWeight: '800', letterSpacing: '1.5px', color: '#34d399' }}>
                {referralData.referralCode || 'ANANYA200'}
              </span>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(referralData.referralCode || 'ANANYA200');
                  toast.success('📋 Referral code copied to clipboard!');
                }}
                style={{
                  background: '#10b981',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '10px 18px',
                  fontSize: '0.86rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
                }}
              >
                <Copy size={16} /> Copy
              </button>
            </div>
          </div>

          {/* SHARE VIA SECTION */}
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#94a3b8', marginBottom: '10px' }}>
              Share via
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {/* WhatsApp Share Button */}
              <button
                type="button"
                onClick={() => {
                  const text = `Use my code *${referralData.referralCode || 'ANANYA200'}* to get ₹200 OFF on home service bookings on Norozz App! ${window.location.origin}`;
                  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
                }}
                style={{
                  padding: '14px',
                  borderRadius: '16px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  fontWeight: '800',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'center',
                  gap: '8px',
                }}
              >
                <span style={{ fontSize: '1.2rem', color: '#25d366' }}>💬</span> WhatsApp
              </button>

              {/* SMS Share Button */}
              <button
                type="button"
                onClick={() => {
                  const body = `Use my code ${referralData.referralCode || 'ANANYA200'} to get ₹200 OFF on home services on Norozz App!`;
                  window.open(`sms:?body=${encodeURIComponent(body)}`);
                }}
                style={{
                  padding: '14px',
                  borderRadius: '16px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  fontWeight: '800',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'center',
                  gap: '8px',
                }}
              >
                <span style={{ fontSize: '1.1rem', color: '#3b82f6' }}>✉️</span> SMS
              </button>
            </div>
          </div>

          {/* YOUR REFERRALS STATS SECTION */}
          <div>
            <div style={{ fontSize: '0.92rem', fontWeight: '800', color: '#ffffff', marginBottom: '12px' }}>
              Your Referrals
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: '10px', marginBottom: '16px' }}>
              <div style={{ padding: '14px 12px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#ffffff' }}>
                  {referralData.stats?.invitedCount ?? 0}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '600', marginTop: '2px' }}>Invited</div>
              </div>

              <div style={{ padding: '14px 12px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#34d399' }}>
                  {referralData.stats?.joinedCount ?? 0}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '600', marginTop: '2px' }}>Joined</div>
              </div>

              <div style={{ padding: '14px 12px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#f59e0b' }}>
                  ₹{referralData.stats?.earnedAmount ?? 0}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '600', marginTop: '2px' }}>Earned</div>
              </div>
            </div>

            {/* REFERRAL HISTORY LIST / EMPTY STATE */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(!referralData.referralsList || referralData.referralsList.length === 0) ? (
                <div style={{ textAlign: 'center', padding: '24px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '0.84rem', color: '#94a3b8' }}>
                    No referrals yet. Share your code via WhatsApp or SMS to start earning!
                  </div>
                </div>
              ) : (
                referralData.referralsList.map((refItem) => (
                  <div
                    key={refItem.id || refItem.name}
                    style={{
                      padding: '14px 16px',
                      borderRadius: '16px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '800', fontSize: '0.92rem', color: '#ffffff' }}>{refItem.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>{refItem.date}</div>
                    </div>

                    <span
                      style={{
                        background: refItem.status === 'Joined' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.06)',
                        color: refItem.status === 'Joined' ? '#34d399' : '#94a3b8',
                        border: refItem.status === 'Joined' ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.15)',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: '800',
                      }}
                    >
                      {refItem.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {viewMode === 'wallet' && (
        <div style={{ padding: '24px 20px' }}>
          <div style={{ padding: '20px', background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', borderRadius: '20px', color: '#ffffff', marginBottom: '20px', boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: '800', opacity: 0.9 }}>AVAILABLE WALLET BALANCE</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', margin: '4px 0' }}>
              ₹{(walletData?.balance ?? userData?.walletBalance ?? currentUser?.walletBalance ?? 0).toFixed(2)}
            </div>
            <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>100% usable on any home service booking</div>
          </div>

          <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '12px' }}>RECENT TRANSACTIONS</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {(walletData?.transactions && walletData.transactions.length > 0) ? (
              walletData.transactions.map((t, idx) => (
                <div key={idx} style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.04)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '0.88rem', color: '#ffffff' }}>{t.title || t.desc || 'Wallet Activity'}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>{t.date || 'Recent'}</div>
                  </div>
                  <span style={{ fontWeight: '800', color: t.type === 'Debit' ? '#ef4444' : '#34d399', fontSize: '0.95rem' }}>
                    {t.type === 'Debit' ? '-' : '+'}₹{t.amount}
                  </span>
                </div>
              ))
            ) : (
              <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '0.84rem' }}>
                No wallet transactions yet.
              </div>
            )}
          </div>
        </div>
      )}

      {viewMode === 'help' && (
        <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ padding: '18px', background: 'rgba(255,255,255,0.04)', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '0.95rem', fontWeight: '800', color: '#ffffff' }}>📞 24x7 Customer Helpline</h4>
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#cbd5e1' }}>Call us anytime toll-free at <strong>1800 200 9090</strong> for booking changes or emergency support.</p>
          </div>

          <div style={{ padding: '18px', background: 'rgba(255,255,255,0.04)', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '0.95rem', fontWeight: '800', color: '#ffffff' }}>💬 Live Chat Support</h4>
            <p style={{ margin: '0 0 12px 0', fontSize: '0.82rem', color: '#cbd5e1' }}>Connect instantly with our support team for quick resolution.</p>
            <button
              type="button"
              onClick={() => toast.info('Support agent connected! Type your query.')}
              style={{ background: '#10b981', color: '#ffffff', border: 'none', borderRadius: '12px', padding: '10px 18px', fontSize: '0.82rem', fontWeight: '800', cursor: 'pointer' }}
            >
              Start Live Support Chat
            </button>
          </div>
        </div>
      )}

      {viewMode === 'settings' && (
        <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { title: 'Push Notifications', desc: 'Receive booking updates & promo alerts', enabled: true },
            { title: 'SMS / WhatsApp Alerts', desc: 'Get technician arrival status via WhatsApp', enabled: true },
            { title: 'Dark Mode Theme', desc: 'Always use sleek dark mode interface', enabled: true }
          ].map((s, idx) => (
            <div key={idx} style={{ padding: '16px', background: 'rgba(255,255,255,0.04)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: '800', fontSize: '0.9rem', color: '#ffffff' }}>{s.title}</div>
                <div style={{ fontSize: '0.76rem', color: '#64748b' }}>{s.desc}</div>
              </div>
              <span style={{ width: '42px', height: '24px', background: '#10b981', borderRadius: '12px', display: 'inline-block', position: 'relative' }}>
                <span style={{ width: '18px', height: '18px', background: '#ffffff', borderRadius: '50%', position: 'absolute', top: '3px', right: '3px' }} />
              </span>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default CustomerProfileView;
