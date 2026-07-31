import React, { useState } from 'react';
import DedicatedCustomerNavbar from '../components/customer/DedicatedCustomerNavbar';
import FourItemBottomNav from '../components/customer/FourItemBottomNav';
import HomeBannerSlider from '../components/customer/HomeBannerSlider';
import PopularCategories from '../components/customer/PopularCategories';
import CustomerHomeSections from '../components/customer/CustomerHomeSections';
import CustomerProfileView from '../components/customer/CustomerProfileView';
import BookingModal from '../components/customer/BookingModal';
import { useCustomer } from '../hooks/useCustomer.js';
import { useBookings } from '../hooks/useBookings.js';
import {
  Search,
  MapPin,
  SlidersHorizontal,
  Star,
  Plus,
} from 'lucide-react';

const DedicatedCustomerPanel = ({ currentUser, onLogout }) => {
  const { dashboard } = useCustomer();
  const { myBookings } = useBookings();
  // 4 Bottom Nav Tabs: 'home' | 'bookings' | 'wallet' | 'profile'
  const [activeTab, setActiveTab] = useState('home');

  // Booking Modal State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedBookingService, setSelectedBookingService] = useState(null);

  const handleOpenBookingWizard = (service) => {
    setSelectedBookingService(service || { title: 'AC Foam Jet Deep Cleaning', price: '₹599', category: 'AC & Appliance Repair' });
    setIsBookingModalOpen(true);
  };

  const walletBalance = dashboard?.wallet?.balance || 450;

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
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={18} color="#2563eb" />
                <div>
                  <span style={{ fontSize: '0.88rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                    Home - Vasant Kunj
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '6px' }}>
                    Sector C, Pocket 2, Delhi NCR
                  </span>
                </div>
              </div>
              <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>CHANGE</span>
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

            {/* Popular Categories */}
            <PopularCategories />

            {/* Popular Services with "Book Now" trigger */}
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
                  Popular Services
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                {[
                  { title: 'AC Foam Jet Deep Cleaning', rating: '4.85 (14.2k)', price: '₹599', duration: '45 mins', category: 'AC & Appliance Repair' },
                  { title: 'Full Home Deep Cleaning 3BHK', rating: '4.80 (6.1k)', price: '₹4,499', duration: '4 hrs', category: 'Home Deep Cleaning' },
                  { title: 'Elegance Facial & Spa Salon', rating: '4.92 (8.4k)', price: '₹1,299', duration: '60 mins', category: 'Salon for Women & Spa' },
                  { title: 'Tap & Plumbing Leak Repair', rating: '4.78 (12k)', price: '₹299', duration: '30 mins', category: 'Plumbing & Leakage' }
                ].map((service, idx) => (
                  <div key={idx} className="mui-card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span className="badge badge-purple" style={{ fontSize: '0.62rem', padding: '2px 6px' }}>POPULAR</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '2px' }}>
                          <Star size={12} fill="#f59e0b" /> {service.rating}
                        </span>
                      </div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '4px' }}>
                        {service.title}
                      </h4>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                        {service.duration} • 30-Day Guarantee
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid var(--border-light)' }}>
                      <span style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-primary)' }}>{service.price}</span>
                      <button
                        onClick={() => handleOpenBookingWizard(service)}
                        className="btn btn-primary btn-sm"
                      >
                        <Plus size={14} /> Book Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Offers, Recently Booked & Membership */}
            <CustomerHomeSections />
          </>
        )}

        {/* TAB 2: BOOKINGS */}
        {activeTab === 'bookings' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0 }}>My Bookings ({myBookings.length})</h2>
              <button onClick={() => handleOpenBookingWizard()} className="btn btn-primary btn-sm">
                + Book New Service
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {myBookings.length === 0 ? (
                <div className="mui-card" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No bookings found. Click '+ Book New Service' to create your first order!
                </div>
              ) : (
                myBookings.map((b) => (
                  <div key={b._id} className="mui-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#2563eb' }}>
                        BOOKING REF: {b.bookingNumber || b._id.substring(0, 8).toUpperCase()}
                      </div>
                      <div style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '2px' }}>
                        {b.serviceName || b.packageTitle || 'AC Service Package'}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {b.bookingDate} at {b.bookingTimeSlot} • Status: {b.status}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                        ₹{b.totalAmount || b.finalPrice || 599}
                      </div>
                      <span className={`badge ${b.status === 'Completed' ? 'badge-success' : 'badge-blue'}`} style={{ marginTop: '4px' }}>
                        {b.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: WALLET */}
        {activeTab === 'wallet' && (
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '16px' }}>NOROZZ Wallet</h2>
            <div className="mui-card" style={{ padding: '28px', background: 'var(--gradient-brand)', color: '#fff', borderRadius: 'var(--radius-xl)', marginBottom: '24px' }}>
              <div style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: '6px' }}>Total Wallet Balance</div>
              <div style={{ fontSize: '2.4rem', fontWeight: '800' }}>₹{walletBalance}.00</div>
              <div style={{ fontSize: '0.78rem', opacity: 0.85, marginTop: '8px' }}>Automatically applied during checkout for extra discounts.</div>
            </div>
          </div>
        )}

        {/* TAB 4: PROFILE */}
        {activeTab === 'profile' && (
          <CustomerProfileView currentUser={currentUser} onLogout={onLogout} />
        )}

      </main>

      {/* 4-Item Bottom Nav */}
      <FourItemBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* 7-Step Interactive Booking Wizard Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        initialService={selectedBookingService}
      />

    </div>
  );
};

export default DedicatedCustomerPanel;
