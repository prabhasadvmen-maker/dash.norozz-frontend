import React, { useState, useRef, useEffect } from 'react';
import { catalogService } from '../../services/catalog.service.js';
import {
  Search,
  MapPin,
  ChevronDown,
  User,
  LogOut,
  CalendarCheck,
  Wallet,
  Home,
  Bell,
  Sparkles,
  Tag,
  ArrowLeft,
  X,
  Gift,
  Headphones,
  Settings,
  ShieldCheck,
  Loader2,
  Star
} from 'lucide-react';
import LanguageSelector from '../common/LanguageSelector.jsx';

const DedicatedCustomerNavbar = ({
  currentUser,
  onLogout,
  selectedCity = 'Bodeli',
  onCitySelect,
  activeTab = 'home',
  onNavigateTab,
  onSelectService,
  onBookService,
}) => {
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const cities = ['Bodeli', 'Delhi NCR', 'Mumbai', 'Bengaluru', 'Hyderabad', 'Pune', 'Kolkata'];

  // Search State & Live Query Handler
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchContainerRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setAccountDropdownOpen(false);
        setCityDropdownOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live API Search Debounce
  useEffect(() => {
    const query = searchQuery.trim();
    if (!query) {
      setSearchResults([]);
      setSearchOpen(false);
      return;
    }

    setIsSearching(true);
    setSearchOpen(true);

    const timer = setTimeout(() => {
      catalogService
        .getServices({ search: query })
        .then((res) => {
          const list = res.data?.data || res.data || [];
          setSearchResults(Array.isArray(list) ? list : []);
        })
        .catch((err) => {
          console.warn('Live search fetch error:', err);
          setSearchResults([]);
        })
        .finally(() => {
          setIsSearching(false);
        });
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleTabClick = (tab, subTab) => {
    if (onNavigateTab) onNavigateTab(tab, subTab);
    setAccountDropdownOpen(false);
  };

  // Format raw user names nicely
  const getFormattedName = () => {
    const raw = currentUser?.name || currentUser?.phone || currentUser?.email || 'Customer Account';
    if (raw.length > 15 && !raw.includes(' ') && !raw.includes('@')) {
      return 'Customer Account';
    }
    return raw;
  };

  const displayName = getFormattedName();
  const initialLetter = displayName.charAt(0).toUpperCase();

  const notificationList = {
    today: [
      {
        id: 1,
        title: 'Booking Confirmed',
        time: '2 min ago',
        desc: 'Your deep cleaning service has been scheduled for tomorrow at 10:00 AM.',
        icon: Bell,
        color: '#10b981'
      },
      {
        id: 2,
        title: 'Payment Received',
        time: '1 hr ago',
        desc: 'We received payment of ₹1,499 for your AC maintenance request.',
        icon: Wallet,
        color: '#059669'
      },
      {
        id: 3,
        title: 'Flat 20% Off!',
        time: '4 hr ago',
        desc: 'Celebrate the festival season! Use code NOROZZ20 on any home repair service.',
        icon: Sparkles,
        color: '#f59e0b'
      }
    ],
    yesterday: [
      {
        id: 4,
        title: 'Service Partner Assigned',
        time: '1 day ago',
        desc: 'Ramesh Kumar has been assigned to your Plumbing repair service.',
        icon: User,
        color: '#2563eb'
      }
    ]
  };

  return (
    <header style={{
      background: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      padding: '0 24px',
      height: '60px',
      boxSizing: 'border-box',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 2px 12px rgba(0, 0, 0, 0.03)',
      display: 'flex',
      alignItems: 'center'
    }}>
      <div ref={dropdownRef} style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
        
        {/* Left: Brand Logo & City Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            onClick={() => handleTabClick('home')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          >
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
            }}>
              <img
                src="/logo.png"
                alt="NOROZZ"
                onError={(e) => { e.target.style.display = 'none'; }}
                style={{ width: '22px', height: '22px', objectFit: 'contain' }}
              />
            </div>
            <span style={{ fontSize: '1.35rem', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.5px' }}>
              NOROZZ
            </span>
          </div>

          {/* City Selector Pill */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 12px',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '9999px',
                fontSize: '0.82rem',
                fontWeight: '700',
                color: '#0f172a',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <MapPin size={14} color="#10b981" />
              <span>{currentUser?.city || selectedCity || 'Bodeli'}</span>
              <ChevronDown size={13} color="#64748b" />
            </button>

            {cityDropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '110%',
                left: 0,
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.12)',
                padding: '6px 0',
                width: '170px',
                zIndex: 200
              }}>
                {cities.map((city) => (
                  <div
                    key={city}
                    onClick={() => {
                      if (onCitySelect) onCitySelect(city);
                      setCityDropdownOpen(false);
                    }}
                    style={{
                      padding: '8px 16px',
                      fontSize: '0.84rem',
                      fontWeight: '600',
                      color: (currentUser?.city || selectedCity) === city ? '#10b981' : '#334155',
                      cursor: 'pointer',
                      background: (currentUser?.city || selectedCity) === city ? '#ecfdf5' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <MapPin size={12} color={(currentUser?.city || selectedCity) === city ? '#10b981' : '#94a3b8'} />
                    <span>{city}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center: Search Bar with Live Floating Results Dropdown */}
        <div ref={searchContainerRef} style={{ flex: 1, maxWidth: '460px', position: 'relative' }}>
          <Search size={16} color={searchOpen ? '#2563eb' : '#94a3b8'} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', zIndex: 2 }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => { if (searchQuery.trim()) setSearchOpen(true); }}
            placeholder="Search for Driver, AC repair, Cleaning, Plumbing..."
            style={{
              width: '100%',
              paddingLeft: '42px',
              paddingRight: searchQuery ? '38px' : '16px',
              paddingTop: '9px',
              paddingBottom: '9px',
              background: '#f8fafc',
              border: searchOpen ? '1px solid #2563eb' : '1px solid #e2e8f0',
              borderRadius: '24px',
              fontSize: '0.86rem',
              fontWeight: '600',
              outline: 'none',
              color: '#0f172a',
              boxShadow: searchOpen ? '0 0 0 3px rgba(37, 99, 235, 0.15)' : 'none',
              transition: 'all 0.2s ease'
            }}
          />

          {searchQuery && (
            <button
              type="button"
              onClick={() => { setSearchQuery(''); setSearchOpen(false); }}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: '#cbd5e1',
                border: 'none',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#ffffff',
                zIndex: 2
              }}
            >
              <X size={12} />
            </button>
          )}

          {/* Floating Search Results Dropdown Popup */}
          {searchOpen && (
            <div style={{
              position: 'absolute',
              top: '115%',
              left: 0,
              right: 0,
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              boxShadow: '0 14px 40px rgba(0, 0, 0, 0.18)',
              maxHeight: '420px',
              overflowY: 'auto',
              zIndex: 1000,
              padding: '12px'
            }}>
              {isSearching ? (
                <div style={{ padding: '24px 16px', textAlign: 'center', color: '#64748b', fontSize: '0.84rem' }}>
                  <Loader2 size={22} className="spin" style={{ margin: '0 auto 8px auto', color: '#2563eb' }} />
                  <div style={{ fontWeight: '700' }}>Searching for "{searchQuery}"...</div>
                </div>
              ) : searchResults.length > 0 ? (
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px', paddingLeft: '4px' }}>
                    MATCHING SERVICES ({searchResults.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {searchResults.map((srv) => {
                      const title = srv.name || srv.title;
                      const price = srv.finalPrice ? `₹${srv.finalPrice}` : (srv.price ? `₹${srv.price}` : '₹499');
                      const catName = typeof srv.category === 'object' ? srv.category?.name : (srv.category || 'Service');
                      const imageSrc = srv.thumbnail || srv.image || null;

                      return (
                        <div
                          key={srv._id}
                          onClick={() => {
                            setSearchOpen(false);
                            setSearchQuery('');
                            if (onSelectService) onSelectService(srv);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 12px',
                            borderRadius: '12px',
                            background: '#f8fafc',
                            border: '1px solid #f1f5f9',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.borderColor = '#bfdbfe'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#f1f5f9'; }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                            <div style={{
                              width: '42px',
                              height: '42px',
                              borderRadius: '10px',
                              background: imageSrc ? `url(${imageSrc}) center/cover no-repeat` : 'linear-gradient(135deg, #2563eb, #7c3aed)',
                              flexShrink: 0
                            }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '0.88rem', fontWeight: '800', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {title}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                                <span className="badge badge-purple" style={{ fontSize: '0.62rem', padding: '1px 6px' }}>{catName}</span>
                                <span>• {srv.duration || '45 mins'}</span>
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0, marginLeft: '12px' }}>
                            <div style={{ textAlign: 'right' }}>
                              <span style={{ fontSize: '0.92rem', fontWeight: '900', color: '#0f172a' }}>{price}</span>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSearchOpen(false);
                                setSearchQuery('');
                                if (onBookService) onBookService(srv);
                                else if (onSelectService) onSelectService(srv);
                              }}
                              style={{
                                padding: '6px 12px',
                                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '0.78rem',
                                fontWeight: '800',
                                cursor: 'pointer'
                              }}
                            >
                              Book
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div style={{ padding: '20px 12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '6px' }}>🔍</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: '800', color: '#0f172a' }}>
                    No services found for "{searchQuery}"
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
                    Try searching for Driver, AC Service, Home Cleaning, Plumbing, or Salon
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Language Selector, Notifications & Account Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          
          {/* Sarvam AI Language Selector Dropdown */}
          <LanguageSelector compact />

          {/* Notification Bell Button */}
          <button
            type="button"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            style={{
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              cursor: 'pointer'
            }}
            title="Notifications"
          >
            <Bell size={17} color="#0f172a" />
            <span style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#10b981'
            }} />
          </button>

          {/* Interactive Account Dropdown Button */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 12px 4px 6px',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '9999px',
                cursor: 'pointer',
                fontWeight: '800',
                fontSize: '0.82rem',
                color: '#0f172a',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.85rem',
                fontWeight: '900',
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
              }}>
                {initialLetter}
              </div>
              <span>{displayName}</span>
              <ChevronDown size={14} color="#64748b" />
            </button>

            {/* Account Dropdown Menu */}
            {accountDropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '115%',
                right: 0,
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.12)',
                width: '230px',
                padding: '8px',
                zIndex: 200,
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                <div style={{ padding: '10px 12px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0f172a' }}>
                    {displayName}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', wordBreak: 'break-all', marginTop: '2px' }}>
                    {currentUser?.email || currentUser?.phone || 'Customer Account'}
                  </div>
                </div>

                {/* 1. My Bookings */}
                <button
                  type="button"
                  onClick={() => handleTabClick('bookings')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'transparent',
                    color: '#0f172a',
                    fontWeight: '600',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <CalendarCheck size={16} color="#10b981" /> My Bookings
                </button>

                {/* 2. My Wallet */}
                <button
                  type="button"
                  onClick={() => handleTabClick('wallet')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'transparent',
                    color: '#0f172a',
                    fontWeight: '600',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Wallet size={16} color="#059669" /> My Wallet & Rewards
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#059669', background: '#ecfdf5', padding: '1px 6px', borderRadius: '6px' }}>₹{currentUser?.walletBalance || 0}</span>
                </button>

                {/* 3. Customer Profile */}
                <button
                  type="button"
                  onClick={() => handleTabClick('profile', 'overview')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'transparent',
                    color: '#0f172a',
                    fontWeight: '600',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <User size={16} color="#2563eb" /> Customer Profile
                </button>

                {/* 4. Saved Addresses */}
                <button
                  type="button"
                  onClick={() => handleTabClick('profile', 'addresses')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'transparent',
                    color: '#0f172a',
                    fontWeight: '600',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <MapPin size={16} color="#ef4444" /> Saved Addresses
                </button>

                {/* 5. Refer & Earn */}
                <button
                  type="button"
                  onClick={() => handleTabClick('profile', 'referral')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'transparent',
                    color: '#0f172a',
                    fontWeight: '600',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Gift size={16} color="#c026d3" /> Refer & Earn
                  </div>
                  <span style={{ fontSize: '0.68rem', fontWeight: '800', color: '#c026d3', background: '#fdf4ff', padding: '1px 6px', borderRadius: '6px' }}>₹500</span>
                </button>

                {/* 6. Help & Support */}
                <button
                  type="button"
                  onClick={() => handleTabClick('profile', 'support')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'transparent',
                    color: '#0f172a',
                    fontWeight: '600',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <Headphones size={16} color="#0284c7" /> Help & Support
                </button>

                {/* 7. Settings */}
                <button
                  type="button"
                  onClick={() => handleTabClick('profile', 'settings')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'transparent',
                    color: '#0f172a',
                    fontWeight: '600',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <Settings size={16} color="#64748b" /> Settings
                </button>

                {/* 8. Sign Out & Logout */}
                <button
                  type="button"
                  onClick={() => {
                    setAccountDropdownOpen(false);
                    onLogout && onLogout();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '10px',
                    border: 'none',
                    background: '#fef2f2',
                    color: '#ef4444',
                    fontWeight: '700',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
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

      </div>

      {/* Notifications Drawer Modal */}
      {notificationsOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 3000
        }}>
          <div style={{
            background: '#ffffff',
            width: '100%',
            maxWidth: '460px',
            maxHeight: '85vh',
            borderRadius: '24px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.2)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            color: '#0f172a',
            border: '1px solid #e2e8f0'
          }}>
            {/* Header */}
            <div style={{
              background: '#f8fafc',
              padding: '16px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid #e2e8f0'
            }}>
              <button
                type="button"
                onClick={() => setNotificationsOpen(false)}
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  width: '34px',
                  height: '34px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0f172a',
                  cursor: 'pointer'
                }}
              >
                <ArrowLeft size={16} />
              </button>

              <h2 style={{ fontSize: '1.05rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>
                Notifications
              </h2>

              <div style={{ width: '34px' }} />
            </div>

            {/* Content List */}
            <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
                  TODAY
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {notificationList.today.map((item) => {
                    const IconComp = item.icon;
                    return (
                      <div key={item.id} style={{ display: 'flex', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <IconComp size={18} color={item.color} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0f172a' }}>{item.title}</div>
                          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>{item.desc}</div>
                          <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '4px' }}>{item.time}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </header>
  );
};

export default DedicatedCustomerNavbar;
