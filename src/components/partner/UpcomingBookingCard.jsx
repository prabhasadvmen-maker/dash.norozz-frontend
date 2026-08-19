import React, { useState } from 'react';
import { Navigation, Play, CheckCircle2, MapPin, Clock } from 'lucide-react';
import { useBookings } from '../../hooks/useBookings.js';
import { toast } from '../../utils/toast.js';

const UpcomingBookingCard = ({ booking, onViewAllClick, onOpenFulfillment }) => {
  const { updateBookingStatus, completeBooking } = useBookings();
  const [jobStarted, setJobStarted] = useState(false);

  // Fallback demo data matching the reference image layout if no live booking
  const activeBooking = booking
    ? {
        rawId: booking._id,
        id: booking.bookingId || booking.bookingNumber || `UC-${booking._id?.toString().slice(-5).toUpperCase()}`,
        serviceTitle: booking.packageName || booking.service?.name || booking.serviceTitle || 'AC Service & Gas Charge',
        slotTime: booking.timeSlot || booking.bookingTimeSlot || '10:30 AM',
        customerName: booking.customer?.name || 'Customer',
        customerPhone: booking.customer?.phone || '',
        address: typeof booking.address === 'object'
          ? `${booking.address?.addressLine ? booking.address.addressLine + ', ' : ''}${booking.address?.city || booking.city || 'Delhi NCR'}`
          : (booking.address || booking.city || 'HSR Layout Sector 2, Bengaluru'),
        status: booking.status || 'Accepted',
        completionOtp: booking.completionOtp || '2847',
      }
    : {
        rawId: 'demo-1',
        id: 'NZP-B-8902',
        serviceTitle: 'AC Service & Gas Charge',
        slotTime: '10:30 AM',
        customerName: 'Rohan Deshmukh',
        customerPhone: '+91 98765 43210',
        address: 'Flat 402, Building 3B, HSR Layout Sector 2, Bengaluru',
        status: 'Accepted',
        completionOtp: '2847',
      };

  const handleNavigate = () => {
    if (onOpenFulfillment) {
      onOpenFulfillment(booking || activeBooking);
    } else {
      toast.info(`Opening Google Maps Navigation for ${activeBooking.customerName}...`);
      window.open(`https://maps.google.com/?q=${encodeURIComponent(activeBooking.address)}`, '_blank');
    }
  };

  const handleNextAction = async () => {
    if (onOpenFulfillment) {
      onOpenFulfillment(booking || activeBooking);
      return;
    }
    if (!booking) {
      if (!jobStarted) {
        setJobStarted(true);
        toast.success(`Status updated to ON THE WAY for ${activeBooking.customerName}!`);
      } else {
        toast.success(`Job Completed! Earnings added to your wallet.`);
        setJobStarted(false);
      }
      return;
    }

    if (activeBooking.status === 'Accepted' || activeBooking.status === 'Assigned') {
      await updateBookingStatus({ id: activeBooking.rawId, status: 'On The Way' });
      toast.success('Updated status to ON THE WAY');
    } else if (activeBooking.status === 'On The Way') {
      await updateBookingStatus({ id: activeBooking.rawId, status: 'Started' });
      toast.success('Service STARTED! Verification timer active.');
    } else if (activeBooking.status === 'Started') {
      await completeBooking(activeBooking.rawId);
      toast.success('Service COMPLETED! Earnings added to your wallet.');
    }
  };

  return (
    <div style={{ marginBottom: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
          Upcoming Booking
        </h3>
        <button
          type="button"
          onClick={onViewAllClick}
          style={{
            background: 'none',
            border: 'none',
            color: '#16a34a',
            fontSize: '0.85rem',
            fontWeight: '700',
            cursor: 'pointer'
          }}
        >
          View All
        </button>
      </div>

      {/* Card Content */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          padding: '22px',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        {/* Top Badges */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span
            style={{
              padding: '6px 12px',
              borderRadius: '9999px',
              background: '#ecfdf5',
              color: '#059669',
              fontSize: '0.78rem',
              fontWeight: '700',
              border: '1px solid #a7f3d0'
            }}
          >
            {activeBooking.serviceTitle}
          </span>
          <span
            style={{
              fontSize: '0.82rem',
              fontWeight: '700',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Clock size={14} /> {activeBooking.slotTime}
          </span>
        </div>

        {/* Customer Details */}
        <div>
          <h4 style={{ fontSize: '1.1rem', fontWeight: '800', margin: '0 0 4px 0', color: 'var(--text-primary)' }}>
            {activeBooking.customerName}
          </h4>
          <p
            style={{
              fontSize: '0.84rem',
              color: 'var(--text-muted)',
              margin: 0,
              display: 'flex',
              alignItems: 'flex-start',
              gap: '6px',
              lineHeight: '1.4'
            }}
          >
            <MapPin size={14} color="#64748b" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{activeBooking.address}</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '4px' }}>
          <button
            type="button"
            onClick={handleNavigate}
            className="btn"
            style={{
              padding: '11px',
              borderRadius: '12px',
              background: '#f8fafc',
              border: '1px solid var(--border-light)',
              color: 'var(--text-primary)',
              fontSize: '0.88rem',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <Navigation size={16} color="#0284c7" /> Navigate
          </button>

          <button
            type="button"
            onClick={handleNextAction}
            className="btn"
            style={{
              padding: '11px',
              borderRadius: '12px',
              background: activeBooking.status === 'On The Way' ? '#7c3aed' : activeBooking.status === 'Started' ? '#2563eb' : '#16a34a',
              border: 'none',
              color: '#ffffff',
              fontSize: '0.88rem',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(22, 163, 74, 0.3)'
            }}
          >
            {activeBooking.status === 'Accepted' || activeBooking.status === 'Assigned' ? (
              <>
                <Navigation size={16} /> On The Way
              </>
            ) : activeBooking.status === 'On The Way' ? (
              <>
                <Play size={16} fill="#ffffff" /> Start Service
              </>
            ) : (
              <>
                <CheckCircle2 size={16} /> Complete Job
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpcomingBookingCard;
