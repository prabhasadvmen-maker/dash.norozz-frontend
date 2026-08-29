import React, { useState, useEffect, useRef } from 'react';
import BottomNav from '../components/customer/BottomNav';
import HomeBannerSlider from '../components/customer/HomeBannerSlider';
import PopularCategories from '../components/customer/PopularCategories';
import FeaturedServices from '../components/customer/FeaturedServices';
import CustomerHomeSections from '../components/customer/CustomerHomeSections';
import CustomerProfileView from '../components/customer/CustomerProfileView';
import CustomerWalletView from '../components/customer/CustomerWalletView';
import { useAuth } from '../hooks/useAuth.js';
import { authService } from '../services/auth.service.js';
import { toast } from '../utils/toast.js';
import {
  Search,
  MapPin,
  SlidersHorizontal,
  CalendarCheck,
  Wallet,
  Bell,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  CreditCard,
  Loader2,
} from 'lucide-react';

const CustomerDashboard = ({ currentUser, onLogout, selectedCity }) => {
  const { updateUser } = useAuth();
  // 5 Bottom Nav Tabs: 'home' | 'bookings' | 'wallet' | 'notifications' | 'profile'
  const [activeTab, setActiveTab] = useState('home');
  const [detectingLocation, setDetectingLocation] = useState(false);
  const hasAttemptedAutoDetectRef = useRef(false);

  const handleDetectLocation = async (isManual = false) => {
    if (detectingLocation) return;
    setDetectingLocation(true);

    const updateProfileWithDetails = async (formattedAddress, city, state, country, sourceMessage) => {
      try {
        const tokenToUse = localStorage.getItem('norozz_token');
        await authService.updateCustomerProfile(
          {
            address: formattedAddress,
            city: city,
            state: state,
            country: country,
          },
          {
            headers: {
              Authorization: `Bearer ${tokenToUse}`,
            },
          }
        );

        updateUser({
          address: formattedAddress,
          city: city,
          state: state,
          country: country,
        });

        if (isManual) {
          toast.success(`📍 ${sourceMessage}: ${city}`);
        }
      } catch (err) {
        console.error('Location Profile Update Error:', err);
        if (isManual) {
          toast.error('Failed to update address details.');
        }
      }
    };

    const tryIpFallback = async () => {
      try {
        const ipRes = await fetch('https://ipapi.co/json/').then((r) => r.json());
        if (ipRes && (ipRes.city || ipRes.region || ipRes.latitude)) {
          const city = ipRes.city || ipRes.region || selectedCity || 'Delhi NCR';
          const state = ipRes.region || '';
          const country = ipRes.country_name || 'India';
          const formattedAddress = `${city}${state ? `, ${state}` : ''}, ${country}`;

          await updateProfileWithDetails(formattedAddress, city, state, country, 'Location estimated via IP');
          return true;
        }
      } catch (ipErr) {
        console.warn('IP Geolocation fallback failed:', ipErr);
      }
      return false;
    };

    if (!navigator.geolocation) {
      if (isManual) {
        toast.error('Geolocation is not supported by your browser.');
      } else {
        await tryIpFallback();
      }
      setDetectingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          // Reverse Geocoding via OpenStreetMap Nominatim API
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
          const data = await res.json();

          const formattedAddress = data?.display_name || `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
          const city = data?.address?.city || data?.address?.suburb || data?.address?.town || data?.address?.state_district || selectedCity || 'Delhi NCR';
          const state = data?.address?.state || '';
          const country = data?.address?.country || 'India';

          await updateProfileWithDetails(formattedAddress, city, state, country, 'Location saved to profile');
        } catch (err) {
          console.error('Location Reverse Geocoding Error:', err);
          const ipSuccess = await tryIpFallback();
          if (!ipSuccess && isManual) {
            toast.error('Failed to resolve address details.');
          }
        } finally {
          setDetectingLocation(false);
        }
      },
      async (err) => {
        console.warn('Geolocation Permission Error/Denied:', err);
        const ipSuccess = await tryIpFallback();
        if (!ipSuccess && isManual) {
          toast.error('Please allow location access to auto-detect your address.');
        }
        setDetectingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  useEffect(() => {
    if (activeTab === 'home' && !hasAttemptedAutoDetectRef.current && (!currentUser?.address || currentUser.address.includes('Vasant Kunj'))) {
      hasAttemptedAutoDetectRef.current = true;
      handleDetectLocation(false);
    }
  }, [activeTab]);

  return (
    <div style={{ minHeight: 'calc(100vh - 74px)', background: 'var(--bg-primary)', paddingBottom: '90px' }}>
      
      {/* Search Header for Home view */}
      {activeTab === 'home' && (
        <div style={{
          background: '#ffffff',
          borderBottom: '1px solid var(--border-light)',
          padding: '16px 32px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ maxWidth: '960px', margin: '0 auto' }}>
            {/* Address Selector */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                <MapPin size={18} color="#2563eb" style={{ flexShrink: 0 }} />
                <div style={{ overflow: 'hidden' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: '800', color: 'var(--text-primary)', display: 'block' }}>
                    {currentUser?.city || (detectingLocation ? 'Detecting Location...' : 'Current Location')}
                  </span>
                  <span style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: 'block',
                    maxWidth: '450px'
                  }}>
                    {currentUser?.address || 'Click DETECT LOCATION to fetch live address'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleDetectLocation(true)}
                disabled={detectingLocation}
                className="badge badge-purple"
                style={{
                  fontSize: '0.68rem',
                  cursor: 'pointer',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '5px 10px',
                  flexShrink: 0
                }}
              >
                {detectingLocation ? <Loader2 size={12} className="spin" /> : 'DETECT LOCATION'}
              </button>
            </div>

            {/* Big Search Input */}
            <div style={{ position: 'relative' }}>
              <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Search for AC Service, House Cleaning, Women Salon..."
                style={{
                  paddingLeft: '48px',
                  paddingRight: '48px',
                  paddingTop: '12px',
                  paddingBottom: '12px',
                  borderRadius: '9999px',
                  fontSize: '0.92rem',
                  boxShadow: 'var(--shadow-sm)'
                }}
              />
              <SlidersHorizontal size={18} color="var(--accent-blue)" style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }} />
            </div>
          </div>
        </div>
      )}

      {/* Main Screen Container */}
      <main style={{ maxWidth: '960px', margin: '0 auto', padding: '24px 20px' }}>
        
        {/* SCREEN 1: HOME */}
        {activeTab === 'home' && (
          <>
            {/* Promotional Banner Slider */}
            <HomeBannerSlider />

            {/* Popular Categories Grid */}
            <PopularCategories />

            {/* Featured Services */}
            <FeaturedServices />

            {/* Recommended Services, Offers, Recently Booked & NOROZZ PLUS Membership */}
            <CustomerHomeSections />
          </>
        )}

        {/* SCREEN 2: BOOKINGS */}
        {activeTab === 'bookings' && (
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '16px' }}>My Bookings History</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { id: 'UC-98214', title: 'AC Foam Jet Deep Cleaning & Master Service', date: 'Scheduled Today, 04:30 PM', status: 'In Progress', price: '₹1,499', partner: 'Rajesh Kumar' },
                { id: 'UC-98213', title: 'Full Home Deep Cleaning (3 BHK)', date: 'Completed 12 June 2026', status: 'Completed', price: '₹4,999', partner: 'CleanPro Services' }
              ].map((b) => (
                <div key={b.id} className="mui-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--accent-blue)' }}>BOOKING ID: {b.id}</div>
                    <div style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '2px' }}>{b.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>{b.date} • Assigned: {b.partner}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)' }}>{b.price}</div>
                    <span className={`badge ${b.status === 'Completed' ? 'badge-success' : 'badge-blue'}`} style={{ marginTop: '4px' }}>{b.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SCREEN 3: WALLET */}
        {activeTab === 'wallet' && (
          <CustomerWalletView currentUser={currentUser} />
        )}

        {/* SCREEN 4: NOTIFICATIONS */}
        {activeTab === 'notifications' && (
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '16px' }}>Notifications & Alerts</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { title: 'Technician Dispatched!', time: '10 mins ago', desc: 'Rajesh Kumar (AC Specialist) is on the way to your address.' },
                { title: '50% OFF Summer Voucher Added', time: '2 hours ago', desc: 'Use promo code SUMMERAC to get 50% discount.' },
                { title: 'Booking #UC-98213 Confirmed', time: 'Yesterday', desc: 'Your home cleaning service has been confirmed.' }
              ].map((n, i) => (
                <div key={i} className="mui-card" style={{ padding: '16px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <Bell size={20} color="#2563eb" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '0.9rem' }}>{n.title}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{n.desc}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>{n.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SCREEN 5: PROFILE */}
        {activeTab === 'profile' && (
          <CustomerProfileView
            currentUser={currentUser}
            onLogout={onLogout}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onBookService={(serviceToBook) => setActiveTab('bookings')}
          />
        )}

      </main>

      {/* 5-Item Bottom Navigation Bar */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

    </div>
  );
};

export default CustomerDashboard;
