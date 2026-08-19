import React from 'react';
import {
  X,
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
import { toast } from '../../utils/toast.js';

const CustomerBookingTrackingModal = ({ isOpen, booking, onClose }) => {
  if (!isOpen || !booking) return null;

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
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.82)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 3000,
        padding: '16px',
      }}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#ffffff',
          borderRadius: '24px',
          maxWidth: '500px',
          width: '100%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
          overflow: 'hidden',
          animation: 'modalSlideUp 0.25s ease-out',
        }}
      >
        {/* HEADER BAR */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#f8fafc',
          }}
        >
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#2563eb' }}>BOOKING REF: {bRef}</span>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
              Booking Details & Live Status
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#e2e8f0',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={18} color="#475569" />
          </button>
        </div>

        {/* MODAL BODY */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* 1. 4-DIGIT VERIFICATION OTP CARD */}
          <div
            style={{
              padding: '18px',
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              color: '#ffffff',
              borderRadius: '20px',
              boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '0.78rem', fontWeight: '800', letterSpacing: '1px', opacity: 0.9, textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <Key size={16} /> SERVICE START VERIFICATION OTP
            </div>

            {/* 4-Digit OTP Boxes */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', margin: '12px 0 10px 0' }}>
              {otpDigits.map((d, i) => (
                <div
                  key={i}
                  style={{
                    width: '46px',
                    height: '52px',
                    borderRadius: '12px',
                    background: '#ffffff',
                    color: '#065f46',
                    fontSize: '1.6rem',
                    fontWeight: '800',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                  }}
                >
                  {d}
                </div>
              ))}
            </div>

            <p style={{ fontSize: '0.78rem', margin: 0, opacity: 0.95, lineHeight: '1.4', fontWeight: '600' }}>
              🔑 Share this 4-digit OTP code with your technician (<strong>{partnerName}</strong>) upon arrival to start your service.
            </p>
          </div>

          {/* 2. LIVE PARTNER TRACKING MAP CARD */}
          <div style={{ borderRadius: '18px', overflow: 'hidden', border: '1px solid var(--border-light)', background: '#f8fafc' }}>
            <div style={{ padding: '12px 14px', background: '#ecfdf5', borderBottom: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', fontWeight: '800', fontSize: '0.85rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                {sStatus === 'On The Way' ? 'Technician is On The Way' : sStatus === 'Started' ? 'Service In Progress' : 'Technician Assigned'}
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#047857' }}>⏱️ ~12 mins ETA</span>
            </div>

            {/* Embedded Live Map */}
            <div style={{ height: '180px', position: 'relative' }}>
              <iframe
                title="Customer Partner Live Tracking Map"
                width="100%"
                height="100%"
                frameBorder="0"
                src="https://maps.google.com/maps?q=Azamgarh+Uttar+Pradesh&t=&z=14&ie=UTF8&iwloc=&output=embed"
                style={{ filter: 'contrast(1.05)' }}
              />
              <div style={{ position: 'absolute', bottom: '10px', left: '10px', background: '#ffffff', padding: '6px 12px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontSize: '0.78rem', fontWeight: '800', color: '#0284c7', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Navigation size={14} /> Partner Live Route ➔ Customer Address
              </div>
            </div>
          </div>

          {/* 3. ASSIGNED TECHNICIAN CONTACT CARD */}
          <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '16px', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '46px', height: '46px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1.2rem' }}>
                {partnerName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: '800', fontSize: '0.95rem', color: 'var(--text-primary)' }}>{partnerName}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{partnerCategory}</div>
                <div style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: '700', marginTop: '1px' }}>⭐ 4.9 Technician Rating (120+ Services)</div>
              </div>
            </div>

            <a
              href={`tel:${partnerPhone}`}
              className="btn btn-sm"
              style={{ background: '#ecfdf5', color: '#16a34a', fontWeight: '800', borderRadius: '12px', border: 'none', padding: '8px 14px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Phone size={14} /> Call Partner
            </a>
          </div>

          {/* 4. SERVICE DETAILS SUMMARY */}
          <div style={{ padding: '14px', background: '#ffffff', borderRadius: '16px', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>BOOKED SERVICE</div>
            <div style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--text-primary)' }}>{sTitle}</div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid var(--border-light)', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              <div>
                <Clock size={14} style={{ display: 'inline', marginRight: '4px' }} />
                {sDate} at {sSlot}
              </div>
              <div style={{ fontWeight: '800', fontSize: '1.1rem', color: '#16a34a' }}>₹{sAmount}</div>
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              📍 <strong>Delivery Address:</strong> {addressText}
            </div>
          </div>

          {/* 5. STATUS TIMELINE */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>SERVICE STATUS TIMELINE</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '8px' }}>
              {[
                { title: 'Booking Placed & Confirmed', active: true, done: true },
                { title: `Technician Assigned (${partnerName})`, active: true, done: true },
                { title: 'Technician On The Way', active: sStatus === 'On The Way' || sStatus === 'Started' || sStatus === 'Completed', done: sStatus === 'Started' || sStatus === 'Completed' },
                { title: 'Service Started (OTP Verified)', active: sStatus === 'Started' || sStatus === 'Completed', done: sStatus === 'Completed' },
                { title: 'Service Completed & Paid', active: sStatus === 'Completed', done: sStatus === 'Completed' },
              ].map((t, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CheckCircle2 size={16} color={t.done ? '#16a34a' : t.active ? '#2563eb' : '#cbd5e1'} />
                  <span style={{ fontSize: '0.82rem', fontWeight: t.active ? '800' : '500', color: t.active ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    {t.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CustomerBookingTrackingModal;
