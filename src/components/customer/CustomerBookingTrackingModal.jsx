import React, { useState } from 'react';
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
  AlertCircle,
  Star,
  Loader2
} from 'lucide-react';
import { toast } from '../../utils/toast.js';
import ReviewModal from '../common/ReviewModal.jsx';
import PartnerProfileModal from './PartnerProfileModal.jsx';

const CustomerBookingTrackingModal = ({ isOpen, booking, onClose }) => {
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [partnerProfileOpen, setPartnerProfileOpen] = useState(false);

  if (!isOpen || !booking) return null;

  // Extracted Fields & Partner Assignment Check
  const bRef = booking.bookingId || booking.bookingNumber || `UC-${booking._id?.toString().slice(-6).toUpperCase() || '83547'}`;
  const sTitle = booking.packageName || booking.service?.name || booking.serviceName || booking.packageTitle || 'Service Package';
  const sAmount = booking.amount || booking.totalAmount || booking.service?.finalPrice || 599;
  const rawStatus = booking.status || 'Pending';

  const isAssigned = Boolean(
    booking.partner &&
    (typeof booking.partner === 'object' ? booking.partner.name : booking.partner) &&
    rawStatus !== 'Pending'
  );

  const sStatus = isAssigned ? rawStatus : 'Pending';

  // 4-Digit OTP Code
  const otpCode = String(booking.completionOtp || '2847');
  const otpDigits = otpCode.length === 4 ? otpCode.split('') : ['2', '8', '4', '7'];

  // Partner Info
  const partnerObj = typeof booking.partner === 'object' ? booking.partner : null;
  const partnerName = isAssigned ? (partnerObj?.name || 'Assigned Technician') : null;
  const partnerPhone = isAssigned ? (partnerObj?.phone || '') : null;
  const partnerCategory = isAssigned
    ? (partnerObj?.agencyName || partnerObj?.category || 'Verified Technician Partner')
    : 'Awaiting Acceptance';

  const sSlot = booking.timeSlot || booking.bookingTimeSlot || '10:30 AM';
  const sDate = booking.bookingDate
    ? new Date(booking.bookingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Today';

  const addressText = typeof booking.address === 'object'
    ? `${booking.address?.addressLine ? booking.address.addressLine + ', ' : ''}${booking.address?.city || booking.city || 'Delhi NCR'}`
    : (booking.address || booking.city || 'Delhi NCR');

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
        justify: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '900px',
          maxHeight: '90vh',
          background: '#ffffff',
          borderRadius: '28px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        }}
      >
        {/* MODAL HEADER */}
        <div
          style={{
            padding: '20px 28px',
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justify: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span className={`badge ${sStatus === 'Completed' ? 'badge-success' : isAssigned ? 'badge-purple' : 'badge-warning'}`}>
              {isAssigned ? sStatus.toUpperCase() : 'PENDING'}
            </span>
            <div>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '800' }}>REF: {bRef}</span>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0, color: '#ffffff' }}>
                Service Live Tracking
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justify: 'center',
              color: '#ffffff',
              cursor: 'pointer',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* MODAL BODY */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* OTP CARD / SEARCHING RADAR CARD */}
          {isAssigned ? (
            <div
              style={{
                padding: '20px',
                background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                color: '#ffffff',
                borderRadius: '20px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '0.78rem', fontWeight: '800', opacity: 0.9, textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <Key size={16} /> SERVICE START VERIFICATION OTP
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', margin: '12px 0' }}>
                {otpDigits.map((d, i) => (
                  <div
                    key={i}
                    style={{
                      width: '48px',
                      height: '52px',
                      borderRadius: '12px',
                      background: '#ffffff',
                      color: '#065f46',
                      fontSize: '1.75rem',
                      fontWeight: '800',
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'center',
                    }}
                  >
                    {d}
                  </div>
                ))}
              </div>

              <p style={{ fontSize: '0.82rem', margin: 0, opacity: 0.95 }}>
                Share this OTP code with your technician (<strong>{partnerName}</strong>) upon arrival to start your service.
              </p>
            </div>
          ) : (
            <div
              style={{
                padding: '20px',
                background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
                color: '#ffffff',
                borderRadius: '20px',
                textAlign: 'center',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                <Loader2 size={24} className="spin" color="#ffffff" />
              </div>
              <div style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '4px' }}>
                🔍 Searching for Nearby Verified Technicians...
              </div>
              <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>
                Your request has been sent to verified partners in <strong>{booking.city || 'your city'}</strong>. Your Start OTP will unlock once accepted!
              </div>
            </div>
          )}

          {/* TECHNICIAN CONTACT & DETAILS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '16px', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div
                onClick={() => isAssigned && setPartnerProfileOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: isAssigned ? 'pointer' : 'default',
                }}
                title={isAssigned ? 'Click to view partner public profile' : ''}
              >
                <div style={{ width: '46px', height: '46px', borderRadius: '50%', background: isAssigned ? 'linear-gradient(135deg, #2563eb, #7c3aed)' : '#cbd5e1', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1.2rem' }}>
                  {isAssigned ? partnerName.charAt(0).toUpperCase() : '?'}
                </div>
                <div>
                  <div style={{ fontWeight: '800', fontSize: '0.95rem', color: isAssigned ? 'var(--text-primary)' : '#b45309', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {isAssigned ? partnerName : 'Searching for Partner...'}
                    {isAssigned && (
                      <span style={{ fontSize: '0.65rem', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', padding: '1px 6px', borderRadius: '8px', fontWeight: '800' }}>
                        Profile ➔
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{partnerCategory}</div>
                </div>
              </div>

              {isAssigned && partnerPhone && (
                <a
                  href={`tel:${partnerPhone}`}
                  className="btn btn-sm"
                  style={{ background: '#ecfdf5', color: '#16a34a', fontWeight: '800', borderRadius: '10px', padding: '8px 12px' }}
                >
                  <Phone size={14} /> Call
                </a>
              )}
            </div>

            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)' }}>BOOKED SERVICE</div>
              <div style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--text-primary)', margin: '2px 0' }}>{sTitle}</div>
              <div style={{ fontSize: '0.82rem', color: '#16a34a', fontWeight: '800' }}>₹{sAmount}</div>
            </div>
          </div>

          {/* STATUS TIMELINE */}
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px' }}>STATUS TIMELINE</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { title: 'Booking Placed & Confirmed', active: true, done: true },
                {
                  title: isAssigned ? `Technician Assigned (${partnerName})` : 'Searching & Assigning Nearby Technician',
                  active: true,
                  done: isAssigned
                },
                {
                  title: 'Technician On The Way',
                  active: sStatus === 'On The Way' || sStatus === 'Started' || sStatus === 'Completed',
                  done: sStatus === 'Started' || sStatus === 'Completed'
                },
                {
                  title: 'Service Started (OTP Verified)',
                  active: sStatus === 'Started' || sStatus === 'Completed',
                  done: sStatus === 'Completed'
                },
                {
                  title: 'Service Completed & Paid',
                  active: sStatus === 'Completed',
                  done: sStatus === 'Completed'
                },
              ].map((t, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <CheckCircle2 size={18} color={t.done ? '#16a34a' : t.active ? (isAssigned ? '#2563eb' : '#f59e0b') : '#cbd5e1'} />
                  <span style={{ fontSize: '0.85rem', fontWeight: t.active ? '800' : '500', color: t.active ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    {t.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* MODAL FOOTER */}
        <div style={{ padding: '16px 28px', borderTop: '1px solid var(--border-light)', background: '#ffffff', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn btn-secondary" style={{ fontWeight: '700' }}>
            Close View
          </button>
        </div>
      </div>

      {/* PARTNER PUBLIC PROFILE & VERIFIED METRICS MODAL */}
      <PartnerProfileModal
        isOpen={partnerProfileOpen}
        partner={booking.partner}
        partnerId={booking.partner?._id || booking.partner}
        onClose={() => setPartnerProfileOpen(false)}
      />
    </div>
  );
};

export default CustomerBookingTrackingModal;
