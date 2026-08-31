import React, { useState, useRef, useEffect } from 'react';
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
  Settings
} from 'lucide-react';

const DedicatedCustomerNavbar = ({
  currentUser,
  onLogout,
  selectedCity = 'Delhi NCR',
  onCitySelect,
  activeTab = 'home',
  onNavigateTab
}) => {
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const cities = ['Delhi NCR', 'Mumbai', 'Bengaluru', 'Hyderabad', 'Pune', 'Kolkata'];

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setAccountDropdownOpen(false);
        setCityDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTabClick = (tab, subTab) => {
    if (onNavigateTab) onNavigateTab(tab, subTab);
    setAccountDropdownOpen(false);
  };

  const notificationList = {
    today: [
      {
        id: 1,
        title: 'Booking Confirmed',
        time: '2 min ago',
        desc: 'Your deep cleaning service has been scheduled for tomorrow at 10:00 AM.',
        icon: Bell,
        color: '#22c55e'
      },
      {
        id: 2,
        title: 'Payment Received',
        time: '1 hr ago',
        desc: 'We received payment of ₹1,499 for your AC maintenance request.',
        icon: Wallet,
        color: '#00b4d8'
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
        color: '#3b82f6'
      },
      {
        id: 5,
        title: 'New Features Launched',
        time: '1 day ago',
        desc: 'You can now track your assigned service partner live on the map!',
        icon: Tag,
        color: '#a855f7'
      }
    ]
  };

  return (
    <header style={{
      background: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      padding: '12px 24px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
    }}>
      <div ref={dropdownRef} style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
        
        {/* Left: Brand Logo & City Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            onClick={() => handleTabClick('home')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
          >
            <span style={{ fontSize: '1.45rem', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.5px' }}>
              Norozz
            </span>
          </div>

          {/* City Selector Pill */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: '20px',
                fontSize: '0.82rem',
                fontWeight: '700',
                color: '#0f172a',
                cursor: 'pointer'
              }}
            >
              <MapPin size={14} color="#2563eb" />
              <span>{currentUser?.city || selectedCity}</span>
              <ChevronDown size={14} color="#64748b" />
            </button>

            {cityDropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '110%',
                left: 0,
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                padding: '8px 0',
                width: '160px',
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
                      color: '#334155',
                      cursor: 'pointer',
                      background: (currentUser?.city || selectedCity) === city ? '#f1f5f9' : 'transparent'
                    }}
                  >
                    {city}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center: Search Bar */}
        <div style={{ flex: 1, maxWidth: '460px', position: 'relative' }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search for AC repair, Deep Cleaning, Unic..."
            style={{
              width: '100%',
              paddingLeft: '42px',
              paddingRight: '16px',
              paddingTop: '9px',
              paddingBottom: '9px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '24px',
              fontSize: '0.85rem',
              outline: 'none',
              color: '#0f172a'
            }}
          />
        </div>

        {/* Right: Notifications & Account Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          
          {/* Notification Bell Button */}
          <button
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
            <Bell size={18} color="#0f172a" />
            <span style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#ef4444'
            }} />
          </button>

          {/* Interactive Account Dropdown Button */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '20px',
                cursor: 'pointer',
                fontWeight: '800',
                fontSize: '0.84rem',
                color: '#0f172a'
              }}
            >
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: '#2563eb',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: '900'
              }}>
                {(currentUser?.name || 'A').charAt(0).toUpperCase()}
              </div>
              <span>{currentUser?.name || 'My Account'}</span>
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
                boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
                width: '240px',
                padding: '8px 0',
                zIndex: 250
              }}>
                <div style={{ padding: '12px 16px 10px 16px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#0f172a' }}>
                    {currentUser?.name || 'Valued Customer'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                    {currentUser?.phone || currentUser?.email || 'Norozz Customer'}
                  </div>
                </div>

                <div style={{ padding: '4px 0' }}>
                  <div
                    onClick={() => handleTabClick('home')}
                    style={{
                      padding: '10px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontSize: '0.85rem',
                      fontWeight: '700',
                      color: activeTab === 'home' ? '#2563eb' : '#334155',
                      background: activeTab === 'home' ? '#eff6ff' : 'transparent',
                      cursor: 'pointer'
                    }}
                  >
                    <Home size={16} /> Home
                  </div>

                  <div
                    onClick={() => handleTabClick('bookings')}
                    style={{
                      padding: '10px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontSize: '0.85rem',
                      fontWeight: '700',
                      color: activeTab === 'bookings' ? '#2563eb' : '#334155',
                      background: activeTab === 'bookings' ? '#eff6ff' : 'transparent',
                      cursor: 'pointer'
                    }}
                  >
                    <CalendarCheck size={16} /> My Bookings
                  </div>

                  <div
                    onClick={() => handleTabClick('wallet')}
                    style={{
                      padding: '10px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontSize: '0.85rem',
                      fontWeight: '700',
                      color: activeTab === 'wallet' ? '#2563eb' : '#334155',
                      background: activeTab === 'wallet' ? '#eff6ff' : 'transparent',
                      cursor: 'pointer'
                    }}
                  >
                    <Wallet size={16} /> My Wallet
                  </div>

                  <div
                    onClick={() => handleTabClick('profile', 'support')}
                    style={{
                      padding: '10px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontSize: '0.85rem',
                      fontWeight: '700',
                      color: '#334155',
                      cursor: 'pointer'
                    }}
                  >
                    <Headphones size={16} color="#2563eb" /> Help Center & Support
                  </div>

                  <div
                    onClick={() => handleTabClick('profile', 'referral')}
                    style={{
                      padding: '10px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontSize: '0.85rem',
                      fontWeight: '700',
                      color: '#334155',
                      cursor: 'pointer'
                    }}
                  >
                    <Gift size={16} color="#c026d3" /> Refer & Earn
                  </div>

                  <div
                    onClick={() => handleTabClick('profile', 'editProfile')}
                    style={{
                      padding: '10px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontSize: '0.85rem',
                      fontWeight: '700',
                      color: '#334155',
                      cursor: 'pointer'
                    }}
                  >
                    <Settings size={16} color="#475569" /> Settings & Edit Profile
                  </div>

                  <div
                    onClick={() => handleTabClick('profile', 'overview')}
                    style={{
                      padding: '10px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontSize: '0.85rem',
                      fontWeight: '700',
                      color: activeTab === 'profile' ? '#2563eb' : '#334155',
                      background: activeTab === 'profile' ? '#eff6ff' : 'transparent',
                      cursor: 'pointer'
                    }}
                  >
                    <User size={16} /> Profile Overview
                  </div>
                </div>

                {onLogout && (
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '4px', marginTop: '4px' }}>
                    <div
                      onClick={() => {
                        setAccountDropdownOpen(false);
                        onLogout();
                      }}
                      style={{
                        padding: '10px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontSize: '0.85rem',
                        fontWeight: '800',
                        color: '#ef4444',
                        cursor: 'pointer'
                      }}
                    >
                      <LogOut size={16} /> Logout
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* ------------------------------------------------------------- */}
      {/* NOTIFICATIONS DARK OVERLAY MODAL (MATCHING MOCKUP IMAGE) */}
      {/* ------------------------------------------------------------- */}
      {notificationsOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.55)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justify: 'center',
          alignItems: 'center',
          zIndex: 3000
        }}>
          <div style={{
            background: '#0b132b',
            width: '100%',
            maxWidth: '460px',
            maxHeight: '85vh',
            borderRadius: '24px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            color: '#ffffff',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            
            {/* Header */}
            <div style={{
              background: '#0f172a',
              padding: '18px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <button
                onClick={() => setNotificationsOpen(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: 'none',
                  borderRadius: '10px',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  cursor: 'pointer'
                }}
              >
                <ArrowLeft size={18} />
              </button>

              <h2 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0, letterSpacing: '-0.3px', color: '#ffffff' }}>
                Notifications
              </h2>

              <div style={{ width: '36px' }} />
            </div>

            {/* Content List */}
            <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* TODAY */}
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px' }}>
                  TODAY
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {notificationList.today.map((item) => {
                    const IconComp = item.icon;
                    return (
                      <div
                        key={item.id}
                        style={{
                          background: '#131c35',
                          border: '1px solid rgba(255, 255, 255, 0.06)',
                          borderRadius: '16px',
                          padding: '16px',
                          display: 'flex',
                          gap: '14px',
                          alignItems: 'flex-start'
                        }}
                      >
                        <div style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '12px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <IconComp size={20} color={item.color} />
                        </div>

                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <div style={{ fontSize: '0.92rem', fontWeight: '800', color: '#ffffff' }}>
                              {item.title}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                              {item.time}
                            </div>
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.4 }}>
                            {item.desc}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* YESTERDAY */}
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px' }}>
                  YESTERDAY
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {notificationList.yesterday.map((item) => {
                    const IconComp = item.icon;
                    return (
                      <div
                        key={item.id}
                        style={{
                          background: '#131c35',
                          border: '1px solid rgba(255, 255, 255, 0.06)',
                          borderRadius: '16px',
                          padding: '16px',
                          display: 'flex',
                          gap: '14px',
                          alignItems: 'flex-start'
                        }}
                      >
                        <div style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '12px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <IconComp size={20} color={item.color} />
                        </div>

                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <div style={{ fontSize: '0.92rem', fontWeight: '800', color: '#ffffff' }}>
                              {item.title}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                              {item.time}
                            </div>
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.4 }}>
                            {item.desc}
                          </div>
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
