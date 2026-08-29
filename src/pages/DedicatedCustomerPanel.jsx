import React, { useState, useEffect, useRef } from 'react';
import DedicatedCustomerNavbar from '../components/customer/DedicatedCustomerNavbar';
import FourItemBottomNav from '../components/customer/FourItemBottomNav';
import HomeBannerSlider from '../components/customer/HomeBannerSlider';
import PopularCategories from '../components/customer/PopularCategories';
import CustomerHomeSections from '../components/customer/CustomerHomeSections';
import CustomerProfileView from '../components/customer/CustomerProfileView';
import CustomerWalletView from '../components/customer/CustomerWalletView';
import ServiceDetailsModal from '../components/customer/ServiceDetailsModal';
import CustomerBookingTrackingPage from './customer/CustomerBookingTrackingPage';
import BookingFlowPage from './customer/BookingFlowPage';
import CustomerServiceDetailPage from './customer/CustomerServiceDetailPage';
import { useCustomer } from '../hooks/useCustomer.js';
import { useBookings } from '../hooks/useBookings.js';
import { useAuth } from '../hooks/useAuth.js';
import { authService } from '../services/auth.service.js';
import { catalogService } from '../services/catalog.service.js';
import { socketService } from '../services/socket.service.js';
import { toast } from '../utils/toast.js';
import {
  Search,
  MapPin,
  SlidersHorizontal,
  Star,
  Plus,
  Loader2,
  Eye,
  Filter,
  ArrowLeft,
} from 'lucide-react';

const DedicatedCustomerPanel = ({ currentUser, onLogout }) => {
  // Bottom Nav Tabs: 'home' | 'services' | 'bookings' | 'wallet' | 'profile'
  const [activeTab, setActiveTab] = useState('home');

  const { dashboard, popularServices, refetchCustomer } = useCustomer(activeTab);
  const { myBookings } = useBookings(activeTab === 'bookings');
  const { updateUser } = useAuth();

  // Filter & Service Details Modal state
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState(null);
  const [selectedDetailService, setSelectedDetailService] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Bookings 4 Filter Tabs State ('pending' | 'working' | 'completed' | 'canceled')
  const [bookingFilterTab, setBookingFilterTab] = useState('pending');

  // Live Category Services State
  const [categoryServices, setCategoryServices] = useState([]);
  const [isCategoryServicesLoading, setIsCategoryServicesLoading] = useState(false);

  // Live API Fetch on Every Category Click
  useEffect(() => {
    if (!selectedCategoryFilter) {
      setCategoryServices([]);
      return;
    }

    const catId = typeof selectedCategoryFilter === 'object' ? selectedCategoryFilter._id : null;
    const catName = typeof selectedCategoryFilter === 'object' ? selectedCategoryFilter.name : selectedCategoryFilter;

    setIsCategoryServicesLoading(true);

    // Call live API to get fresh updated services for clicked category
    const params = {};
    if (catId) {
      params.category = catId;
    } else if (catName) {
      params.search = catName;
    }

    catalogService
      .getServices(params)
      .then((res) => {
        const list = res.data?.data || res.data || [];
        setCategoryServices(Array.isArray(list) ? list : []);
      })
      .catch((err) => {
        console.warn('Live Category Services fetch warning:', err);
        setCategoryServices([]);
      })
      .finally(() => {
        setIsCategoryServicesLoading(false);
      });
  }, [selectedCategoryFilter]);

  // Dedicated Full-Page Customer Tracking State
  const [activeTrackingBooking, setActiveTrackingBooking] = useState(null);

  // Full Page Booking Flow State (No popup modal)
  const [isBookingFlowActive, setIsBookingFlowActive] = useState(false);
  const [selectedBookingService, setSelectedBookingService] = useState(null);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const hasAttemptedAutoDetectRef = useRef(false);

  const handleOpenServiceDetails = (service) => {
    setSelectedDetailService(service);
    setIsDetailModalOpen(true);
  };

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
          const city = ipRes.city || ipRes.region || 'Delhi NCR';
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
          const city = data?.address?.city || data?.address?.suburb || data?.address?.town || data?.address?.state_district || 'Delhi NCR';
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

  // Socket.io Connection & Background Live Chat Listener for Customer
  useEffect(() => {
    if (!currentUser?._id) return;

    const socket = socketService.connect();
    socketService.joinUser({ userId: currentUser._id });

    const handleIncomingChatMessage = (msgPayload) => {
      if (msgPayload && msgPayload.sender !== currentUser._id) {
        toast.info(`💬 Message from Service Partner (${msgPayload.senderName || 'Technician'}): "${msgPayload.message}"`, {
          duration: 6000,
        });
      }
    };

    socket.on('new_chat_message', handleIncomingChatMessage);
    socket.on('new_chat_notification', handleIncomingChatMessage);

    return () => {
      socket.off('new_chat_message', handleIncomingChatMessage);
      socket.off('new_chat_notification', handleIncomingChatMessage);
    };
  }, [currentUser?._id]);

  const handleOpenBookingWizard = (service) => {
    setSelectedBookingService(service || { name: 'Full Home Deep Cleaning', price: 1499, category: 'Home Deep Cleaning' });
    setIsBookingFlowActive(true);
  };

  if (selectedDetailService) {
    return (
      <CustomerServiceDetailPage
        service={selectedDetailService}
        currentUser={currentUser}
        onLogout={onLogout}
        onBack={() => setSelectedDetailService(null)}
        onBookNow={(serviceToBook) => {
          setSelectedDetailService(null);
          handleOpenBookingWizard(serviceToBook);
        }}
      />
    );
  }

  if (isBookingFlowActive) {
    return (
      <BookingFlowPage
        service={selectedBookingService}
        currentUser={currentUser}
        onBackToServices={() => setIsBookingFlowActive(false)}
        onNavigateToBookings={() => {
          setIsBookingFlowActive(false);
          setActiveTab('bookings');
        }}
      />
    );
  }

  if (activeTrackingBooking) {
    return (
      <CustomerBookingTrackingPage
        booking={activeTrackingBooking}
        currentUser={currentUser}
        onBack={() => setActiveTrackingBooking(null)}
      />
    );
  }

  const walletBalance = dashboard?.walletBalance ?? dashboard?.wallet?.balance ?? currentUser?.walletBalance ?? 0;

  return (
    <div style={{ minHeight: 'calc(100vh - 60px)', background: 'var(--bg-primary)', paddingBottom: '90px' }}>
      
      {/* Mobile-First Header */}
      <DedicatedCustomerNavbar currentUser={currentUser} onLogout={onLogout} />

      {/* Location & Search Header for Home tab */}
      {activeTab === 'home' && (
        <div style={{
          background: '#ffffff',
          borderBottom: '1px solid var(--border-light)',
          padding: '16px 24px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ maxWidth: '960px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
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
              <SlidersHorizontal size={18} color="#2563eb" style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }} />
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main style={{ maxWidth: '960px', margin: '0 auto', padding: '24px 20px' }}>
        
        {/* TAB 1: HOME */}
        {activeTab === 'home' && (
          <>
            {/* Banner Slider */}
            <HomeBannerSlider />

            {/* Popular Services Section (Renamed Heading) */}
            <PopularCategories
              selectedCategory={selectedCategoryFilter}
              onSelectCategory={(cat) => {
                setSelectedCategoryFilter(cat);
                setActiveTab('services');
              }}
            />

            {/* Recommended for You Section (Renamed Heading & Dynamic Real Data) */}
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
                  Recommended for You
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                {(popularServices && popularServices.length > 0 ? popularServices : [
                  { title: 'AC Foam Jet Deep Cleaning', rating: '4.85 (14.2k)', price: '₹599', originalPrice: '₹799', duration: '45 mins', category: 'AC & Appliance Repair' },
                  { title: 'Full Home Deep Cleaning 3BHK', rating: '4.80 (6.1k)', price: '₹4,499', originalPrice: '₹4,999', duration: '4 hrs', category: 'Home Deep Cleaning' },
                  { title: 'Elegance Facial & Spa Salon', rating: '4.92 (8.4k)', price: '₹1,299', originalPrice: '₹1,499', duration: '60 mins', category: 'Salon for Women & Spa' },
                  { title: 'Tap & Plumbing Leak Repair', rating: '4.78 (12k)', price: '₹299', originalPrice: '₹399', duration: '30 mins', category: 'Plumbing & Leakage' }
                ]).map((service, idx) => {
                  const title = service.name || service.title;
                  const price = service.finalPrice ? `₹${service.finalPrice}` : (service.price ? (typeof service.price === 'number' ? `₹${service.price}` : service.price) : '₹599');
                  const duration = service.duration || '45 mins';
                  const rating = service.rating ? `${service.rating} (${service.reviews || '10k+'})` : '4.85 (14.2k)';
                  const categoryName = typeof service.category === 'object' ? service.category?.name : (service.category || 'Popular Service');

                  return (
                    <div key={service._id || idx} className="mui-card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span className="badge badge-purple" style={{ fontSize: '0.62rem', padding: '2px 6px' }}>RECOMMENDED</span>
                          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '2px' }}>
                            <Star size={12} fill="#f59e0b" /> {rating}
                          </span>
                        </div>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '4px' }}>
                          {title}
                        </h4>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                          {duration} • 30-Day Guarantee
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid var(--border-light)' }}>
                        <span style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-primary)' }}>{price}</span>
                        <button
                          onClick={() => handleOpenBookingWizard({ ...service, title, price })}
                          className="btn btn-primary btn-sm"
                        >
                          <Plus size={14} /> Book Now
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Offers, Recently Booked & Membership */}
            <CustomerHomeSections />
          </>
        )}

        {/* TAB 2: SERVICES */}
        {activeTab === 'services' && (
          <div>
            {!selectedCategoryFilter ? (
              /* VIEW A: MAIN CATEGORIES DIRECTORY (NO BOTTOM PACKAGES SECTION) */
              <div>
                <div style={{ marginBottom: '20px' }}>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
                    All Service Categories
                  </h2>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                    Click any service category below to view all available packages
                  </p>
                </div>

                {/* Service Categories Grid */}
                <PopularCategories
                  selectedCategory={null}
                  onSelectCategory={(cat) => setSelectedCategoryFilter(cat)}
                />
              </div>
            ) : (
              /* VIEW B: CATEGORY SERVICES LISTING PAGE (NEW PAGE VIEW) */
              <div>
                {/* Back Button & Category Title Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '22px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedCategoryFilter(null)}
                    className="btn btn-secondary btn-sm"
                    style={{ fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px' }}
                  >
                    <ArrowLeft size={16} /> Back to Categories
                  </button>
                  <div>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
                      {typeof selectedCategoryFilter === 'object' ? selectedCategoryFilter.name : selectedCategoryFilter} Services
                    </h2>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                      Choose a service package below to view details and book
                    </p>
                  </div>
                </div>

                {/* Grid of Available Services under this Category */}
                {isCategoryServicesLoading ? (
                  <div className="mui-card" style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <Loader2 size={24} className="spin" style={{ margin: '0 auto 10px auto', color: '#2563eb' }} />
                    <div>Fetching latest services from backend for {typeof selectedCategoryFilter === 'object' ? selectedCategoryFilter.name : selectedCategoryFilter}...</div>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                    {(
                      categoryServices.length > 0
                        ? categoryServices
                        : (popularServices && popularServices.length > 0 ? popularServices : [
                            { title: 'AC Foam Jet Deep Cleaning Package', rating: '4.85 (14.2k)', price: '₹599', originalPrice: '₹799', duration: '45 mins', category: 'AC & Appliance Repair', description: 'Complete 2-in-1 foam jet wash for split & window ACs with 30-day warranty' },
                            { title: 'Full Home Deep Cleaning 3BHK', rating: '4.80 (6.1k)', price: '₹4,499', originalPrice: '₹4,999', duration: '4 hrs', category: 'Full Home Deep Cleaning', description: 'Complete 3BHK house sanitization, vacuuming, window & balcony deep cleaning' },
                            { title: 'Elegance Facial & Spa Salon', rating: '4.92 (8.4k)', price: '₹1,299', originalPrice: '₹1,499', duration: '60 mins', category: 'Salon for Women & Spa', description: 'Premium facial treatment, fruit glow scrub, threading & head massage' },
                            { title: 'Tap & Plumbing Leak Repair', rating: '4.78 (12k)', price: '₹299', originalPrice: '₹399', duration: '30 mins', category: 'Plumbing & Leakage Repair', description: 'Instant 30-min technician arrival for tap leaks, pipe fitting & drainage fix' }
                          ]).filter((srv) => {
                            const catName = typeof srv.category === 'object' ? srv.category?.name : srv.category;
                            const targetName = typeof selectedCategoryFilter === 'object' ? selectedCategoryFilter.name : selectedCategoryFilter;
                            if (!catName || !targetName) return true;
                            return catName.toLowerCase().includes(targetName.toLowerCase()) || targetName.toLowerCase().includes(catName.toLowerCase());
                          })
                    ).map((service, idx) => {
                      const title = service.name || service.title;
                      const price = service.finalPrice ? `₹${service.finalPrice}` : (service.price ? (typeof service.price === 'number' ? `₹${service.price}` : service.price) : '₹599');
                      const duration = service.duration || '45 mins';
                      const rating = service.rating ? `${service.rating} (${service.reviews || '10k+'})` : '4.85 (14.2k)';
                      const categoryName = typeof service.category === 'object' ? service.category?.name : (service.category || 'Popular Service');
                      const imageSrc = service.thumbnail || service.image || null;

                      return (
                        <div
                          key={service._id || idx}
                          className="mui-card"
                          style={{
                            padding: 0,
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            transition: 'transform 0.2s ease, boxShadow 0.2s ease'
                          }}
                        >
                          <div onClick={() => handleOpenServiceDetails({ ...service, title, price, categoryName, duration, rating })}>
                            {/* Service Banner Image Container */}
                            <div style={{
                              height: '140px',
                              background: imageSrc ? `url(${imageSrc}) center/cover no-repeat` : 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #7c3aed 100%)',
                              position: 'relative',
                              display: 'flex',
                              alignItems: 'flex-start',
                              justify: 'space-between',
                              padding: '12px'
                            }}>
                              {imageSrc && (
                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)' }} />
                              )}
                              <span className="badge badge-purple" style={{ fontSize: '0.68rem', padding: '3px 8px', position: 'relative', zIndex: 1 }}>
                                {categoryName}
                              </span>
                              <span style={{
                                fontSize: '0.75rem',
                                fontWeight: '800',
                                color: '#1e293b',
                                background: '#ffffff',
                                padding: '3px 8px',
                                borderRadius: '9999px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3px',
                                boxShadow: 'var(--shadow-sm)',
                                position: 'relative',
                                zIndex: 1
                              }}>
                                <Star size={12} fill="#f59e0b" color="#f59e0b" /> {rating}
                              </span>
                            </div>

                            {/* Card Content Area */}
                            <div style={{ padding: '16px 16px 8px 16px' }}>
                              <h4 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '6px', lineHeight: 1.3 }}>
                                {title}
                              </h4>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                                  ⏱️ {duration}
                                </span>
                                <span>•</span>
                                <span style={{ color: '#059669', fontWeight: '700' }}>30-Day Guarantee</span>
                              </div>

                              <div style={{ fontSize: '0.74rem', color: '#2563eb', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                                <Eye size={13} /> View Details & Inclusions
                              </div>
                            </div>
                          </div>

                          {/* Card Bottom Footer */}
                          <div style={{
                            padding: '12px 16px',
                            background: '#f8fafc',
                            borderTop: '1px solid var(--border-light)',
                            display: 'flex',
                            alignItems: 'center',
                            justify: 'space-between'
                          }}>
                            <div>
                              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Starting from</div>
                              <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)' }}>{price}</span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenBookingWizard({ ...service, title, price });
                              }}
                              className="btn btn-primary btn-sm"
                              style={{ fontWeight: '800' }}
                            >
                              <Plus size={14} /> Book Now
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: BOOKINGS */}
        {activeTab === 'bookings' && (() => {
          // Robust status categorization helper
          const getCat = (b) => {
            const st = (b.status || '').toLowerCase();
            if (st.includes('completed') || st.includes('finished')) return 'completed';
            if (st.includes('cancel') || st.includes('refund') || st.includes('reject')) return 'canceled';
            if (st.includes('assign') || st.includes('way') || st.includes('start') || st.includes('work') || st.includes('progress') || st.includes('accept')) return 'working';
            return 'pending';
          };

          const pendingList = myBookings.filter((b) => getCat(b) === 'pending');
          const workingList = myBookings.filter((b) => getCat(b) === 'working');
          const completedList = myBookings.filter((b) => getCat(b) === 'completed');
          const canceledList = myBookings.filter((b) => getCat(b) === 'canceled');

          const activeList =
            bookingFilterTab === 'pending'
              ? pendingList
              : bookingFilterTab === 'working'
              ? workingList
              : bookingFilterTab === 'completed'
              ? completedList
              : canceledList;

          return (
            <div>
              {/* HEADER TITLE & NEW BOOKING BUTTON */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
                  My Bookings ({activeList.length})
                </h2>
                <button onClick={() => handleOpenBookingWizard()} className="btn btn-primary btn-sm" style={{ fontWeight: '800' }}>
                  + Book New Service
                </button>
              </div>

              {/* 4 FILTER TABS BAR: PENDING | WORKING | COMPLETED | CANCELED */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '20px' }}>
                {[
                  { id: 'pending', label: 'Pending', icon: '⏳', count: pendingList.length, activeBg: '#fef3c7', activeText: '#b45309', activeBorder: '#f59e0b' },
                  { id: 'working', label: 'Working', icon: '⚙️', count: workingList.length, activeBg: '#dbeafe', activeText: '#1d4ed8', activeBorder: '#2563eb' },
                  { id: 'completed', label: 'Completed', icon: '✅', count: completedList.length, activeBg: '#d1fae5', activeText: '#047857', activeBorder: '#10b981' },
                  { id: 'canceled', label: 'Canceled', icon: '❌', count: canceledList.length, activeBg: '#fee2e2', activeText: '#b91c1c', activeBorder: '#ef4444' },
                ].map((tab) => {
                  const isSel = bookingFilterTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setBookingFilterTab(tab.id)}
                      style={{
                        padding: '12px 6px',
                        borderRadius: '16px',
                        border: isSel ? `2px solid ${tab.activeBorder}` : '1px solid var(--border-light)',
                        background: isSel ? tab.activeBg : '#ffffff',
                        color: isSel ? tab.activeText : 'var(--text-secondary)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                        fontWeight: '800',
                        fontSize: '0.82rem',
                        boxShadow: isSel ? '0 4px 14px rgba(0,0,0,0.08)' : 'none',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>{tab.icon}</span>
                        <span>{tab.label}</span>
                      </div>
                      <span
                        style={{
                          fontSize: '0.74rem',
                          padding: '2px 8px',
                          borderRadius: '10px',
                          background: isSel ? tab.activeBorder : '#f1f5f9',
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

              {/* BOOKINGS LIST FOR SELECTED TAB */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {activeList.length === 0 ? (
                  <div className="mui-card" style={{ padding: '36px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '2.2rem', marginBottom: '8px' }}>
                      {bookingFilterTab === 'pending' && '⏳'}
                      {bookingFilterTab === 'working' && '⚙️'}
                      {bookingFilterTab === 'completed' && '✅'}
                      {bookingFilterTab === 'canceled' && '❌'}
                    </div>
                    <div style={{ fontWeight: '800', fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
                      No {bookingFilterTab.charAt(0).toUpperCase() + bookingFilterTab.slice(1)} Bookings
                    </div>
                    <div style={{ fontSize: '0.84rem' }}>
                      You currently have no {bookingFilterTab} service orders in your account.
                    </div>
                  </div>
                ) : (
                  activeList.map((b) => {
                    const bRef = b.bookingId || b.bookingNumber || `UC-${b._id?.toString().slice(-6).toUpperCase()}`;
                    const sTitle = b.packageName || b.service?.name || b.serviceName || b.packageTitle || 'Home Service Package';
                    const sAmount = b.amount || b.totalAmount || b.service?.finalPrice || 599;
                    const sSlot = b.timeSlot || b.bookingTimeSlot || '10:30 AM';
                    const sDate = b.bookingDate ? new Date(b.bookingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Today';

                    return (
                      <div
                        key={b._id}
                        className="mui-card"
                        onClick={() => setActiveTrackingBooking(b)}
                        style={{
                          padding: '20px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          cursor: 'pointer',
                          transition: 'transform 0.15s ease, boxShadow 0.15s ease'
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#2563eb' }}>
                            BOOKING REF: {bRef}
                          </div>
                          <div style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '2px' }}>
                            {sTitle}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                            {sDate} • {sSlot} • Status: {b.status}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                            ₹{sAmount}
                          </div>
                          <span
                            className={`badge ${
                              b.status === 'Completed'
                                ? 'badge-success'
                                : b.status === 'Cancelled' || b.status === 'Canceled'
                                ? 'badge-red'
                                : 'badge-blue'
                            }`}
                            style={{ marginTop: '4px' }}
                          >
                            {b.status}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })()}

        {/* TAB 3: WALLET */}
        {activeTab === 'wallet' && (
          <CustomerWalletView currentUser={currentUser} onBalanceUpdate={() => refetchCustomer()} />
        )}

        {/* TAB 4: PROFILE */}
        {activeTab === 'profile' && (
          <CustomerProfileView
            currentUser={currentUser}
            onLogout={onLogout}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onBookService={(serviceToBook) => handleOpenBookingWizard(serviceToBook)}
          />
        )}

      </main>

      {/* 4-Item Bottom Nav */}
      <FourItemBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

    </div>
  );
};

export default DedicatedCustomerPanel;
