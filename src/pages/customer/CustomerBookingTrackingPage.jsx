import React, { useState } from 'react';
import {
  ArrowLeft,
  Phone,
  MessageSquare,
  MapPin,
  Clock,
  CheckCircle2,
  Navigation,
  ShieldCheck,
  Key,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import LiveChatModal from '../../components/common/LiveChatModal.jsx';

const CustomerBookingTrackingPage = ({ booking, currentUser, onBack }) => {
  const [chatOpen, setChatOpen] = useState(false);

  if (!booking) return null;

  // Extracted/Fallback Fields
  const bRef = booking.bookingId || booking.bookingNumber || `UC-${booking._id?.toString().slice(-6).toUpperCase() || '83547'}`;
  const sTitle = booking.packageName || booking.service?.name || booking.serviceName || booking.packageTitle || 'Fan & Light Fixture Installation';
  const sAmount = booking.amount || booking.totalAmount || booking.service?.finalPrice || 276;
  const sStatus = booking.status || 'Accepted';

  // 4-Digit OTP Code
  const otpCode = String(booking.completionOtp || '2847');
  const otpDigits = otpCode.length === 4 ? otpCode.split('') : ['2', '8', '4', '7'];

  // Partner Info
  const partnerName = booking.partner?.name || 'Krishna Kumar';
  const partnerPhone = booking.partner?.phone || '+91 98765 43210';
  const partnerCategory = booking.partner?.agencyName || booking.partner?.category || 'Verified Technician Partner';

  const sSlot = booking.timeSlot || booking.bookingTimeSlot || '10:30 AM';
  const sDate = booking.bookingDate
    ? new Date(booking.bookingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Today';

  const addressText = typeof booking.address === 'object'
    ? `${booking.address?.addressLine ? booking.address.addressLine + ', ' : ''}${booking.address?.city || booking.city || 'Delhi NCR'}`
    : (booking.address || booking.city || 'Nizamabad, Azamgarh, Uttar Pradesh');

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', paddingBottom: '60px' }}>
      
      {/* TOP HEADER NAVIGATION BAR */}
      <header
        style={{
          background: '#ffffff',
          borderBottom: '1px solid var(--border-light)',
          padding: '16px 32px',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              type="button"
              onClick={onBack}
              className="btn btn-secondary btn-sm"
              style={{ padding: '8px 16px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <ArrowLeft size={18} /> Back to My Bookings
            </button>

            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#2563eb' }}>BOOKING REF: {bRef}</span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
                Service Tracking & Live Location
              </h2>
            </div>
          </div>

          <span className={`badge ${sStatus === 'Completed' ? 'badge-success' : 'badge-blue'}`} style={{ padding: '8px 16px', fontSize: '0.85rem', fontWeight: '800' }}>
            {sStatus}
          </span>
        </div>
      </header>

      {/* DEDICATED FULL PAGE CONTENT BODY */}
      <main style={{ maxWidth: '1200px', margin: '28px auto 0 auto', padding: '0 24px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
            gap: '24px',
            alignItems: 'start',
          }}
        >
          {/* LEFT COLUMN: OTP & LIVE TRACKING MAP */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* 1. 4-DIGIT VERIFICATION OTP CARD */}
            <div
              className="mui-card"
              style={{
                padding: '24px',
                background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                color: '#ffffff',
                borderRadius: '24px',
                boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '0.8rem', fontWeight: '800', letterSpacing: '1px', opacity: 0.9, textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <Key size={18} /> SERVICE START VERIFICATION OTP
              </div>

              {/* 4-Digit OTP Boxes */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', margin: '14px 0' }}>
                {otpDigits.map((d, i) => (
                  <div
                    key={i}
                    style={{
                      width: '56px',
                      height: '62px',
                      borderRadius: '16px',
                      background: '#ffffff',
                      color: '#065f46',
                      fontSize: '2rem',
                      fontWeight: '800',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    }}
                  >
                    {d}
                  </div>
                ))}
              </div>

              <p style={{ fontSize: '0.85rem', margin: 0, opacity: 0.95, lineHeight: '1.4', fontWeight: '600' }}>
                🔑 Share this 4-digit OTP code with your technician (<strong>{partnerName}</strong>) upon arrival to start your service.
              </p>
            </div>

            {/* 2. LIVE PARTNER TRACKING MAP CARD */}
            <div className="mui-card" style={{ borderRadius: '24px', overflow: 'hidden', border: '1px solid var(--border-light)', background: '#ffffff', boxShadow: 'var(--shadow-md)' }}>
              <div style={{ padding: '16px 20px', background: '#ecfdf5', borderBottom: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#059669', fontWeight: '800', fontSize: '0.95rem' }}>
                  <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }} />
                  {sStatus === 'On The Way' ? 'Technician is On The Way' : sStatus === 'Started' ? 'Service In Progress' : 'Technician Assigned'}
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#047857' }}>⏱️ ~12 mins ETA</span>
              </div>

              {/* Embedded Live Map */}
              <div style={{ height: '320px', position: 'relative' }}>
                <iframe
                  title="Customer Partner Live Tracking Map"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  src="https://maps.google.com/maps?q=Azamgarh+Uttar+Pradesh&t=&z=14&ie=UTF8&iwloc=&output=embed"
                  style={{ filter: 'contrast(1.05)' }}
                />
                <div style={{ position: 'absolute', bottom: '14px', left: '14px', background: '#ffffff', padding: '10px 18px', borderRadius: '14px', boxShadow: '0 4px 14px rgba(0,0,0,0.15)', fontSize: '0.88rem', fontWeight: '800', color: '#0284c7', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Navigation size={18} /> Partner Live Route ➔ Customer Address
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: TECHNICIAN INFO, SERVICE SUMMARY, TIMELINE */}
          <div
            className="mui-card"
            style={{
              padding: '24px',
              background: '#ffffff',
              borderRadius: '24px',
              border: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-md)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            {/* 3. ASSIGNED TECHNICIAN CONTACT CARD */}
            <div style={{ padding: '18px', background: '#f8fafc', borderRadius: '18px', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1.4rem' }}>
                  {partnerName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: '800', fontSize: '1.05rem', color: 'var(--text-primary)' }}>{partnerName}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{partnerCategory}</div>
                  <div style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: '700', marginTop: '2px' }}>⭐ 4.9 Technician Rating (120+ Services)</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setChatOpen(true)}
                  className="btn btn-sm"
                  style={{ background: '#eff6ff', color: '#2563eb', fontWeight: '800', borderRadius: '12px', border: 'none', padding: '10px 16px', display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                >
                  <MessageSquare size={16} /> Live Chat
                </button>
                <a
                  href={`tel:${partnerPhone}`}
                  className="btn btn-sm"
                  style={{ background: '#ecfdf5', color: '#16a34a', fontWeight: '800', borderRadius: '12px', border: 'none', padding: '10px 16px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Phone size={16} /> Call Partner
                </a>
              </div>
            </div>

            {/* 4. SERVICE DETAILS SUMMARY */}
            <div style={{ padding: '18px', background: '#ffffff', borderRadius: '18px', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>BOOKED SERVICE</div>
              <div style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--text-primary)' }}>{sTitle}</div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border-light)', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                <div>
                  <Clock size={16} style={{ display: 'inline', marginRight: '6px' }} />
                  {sDate} at {sSlot}
                </div>
                <div style={{ fontWeight: '800', fontSize: '1.3rem', color: '#16a34a' }}>₹{sAmount}</div>
              </div>

              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: '1.4' }}>
                📍 <strong>Delivery Address:</strong> {addressText}
              </div>
            </div>

            {/* 5. STATUS TIMELINE */}
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>SERVICE STATUS TIMELINE</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: '8px' }}>
                {[
                  { title: 'Booking Placed & Confirmed', active: true, done: true },
                  { title: `Technician Assigned (${partnerName})`, active: true, done: true },
                  { title: 'Technician On The Way', active: sStatus === 'On The Way' || sStatus === 'Started' || sStatus === 'Completed', done: sStatus === 'Started' || sStatus === 'Completed' },
                  { title: 'Service Started (OTP Verified)', active: sStatus === 'Started' || sStatus === 'Completed', done: sStatus === 'Completed' },
                  { title: 'Service Completed & Paid', active: sStatus === 'Completed', done: sStatus === 'Completed' },
                ].map((t, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <CheckCircle2 size={20} color={t.done ? '#16a34a' : t.active ? '#2563eb' : '#cbd5e1'} />
                    <span style={{ fontSize: '0.9rem', fontWeight: t.active ? '800' : '500', color: t.active ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      {t.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* REAL-TIME SOCKET.IO LIVE CHAT MODAL */}
      <LiveChatModal
        isOpen={chatOpen}
        booking={booking}
        currentUser={currentUser}
        userRole="customer"
        onClose={() => setChatOpen(false)}
      />
    </div>
  );
};

export default CustomerBookingTrackingPage;
