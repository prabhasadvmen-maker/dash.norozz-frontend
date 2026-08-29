import React, { useState } from 'react';
import { AlertTriangle, X, Check, Loader2 } from 'lucide-react';
import { bookingService } from '../../services/booking.service.js';
import { toast } from '../../utils/toast.js';

const CancelBookingModal = ({ isOpen, booking, onClose, onSuccess }) => {
  const [selectedReason, setSelectedReason] = useState('Changed my mind');
  const [additionalComments, setAdditionalComments] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !booking) return null;

  const reasonsList = [
    'Changed my mind',
    'Schedule conflict',
    'Too expensive / found cheaper',
    'Other reasons',
  ];

  const refundAmount = booking.amount || booking.totalAmount || 366;

  const handleConfirmCancel = async () => {
    setLoading(true);
    try {
      const fullReason = `${selectedReason}${additionalComments.trim() ? ': ' + additionalComments.trim() : ''}`;
      await bookingService.cancelBooking(booking._id, fullReason);
      toast.success('Booking cancelled successfully. Refund initiated!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to cancel booking';
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1200,
        background: 'rgba(5, 10, 20, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justify: 'center',
        padding: '16px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '440px',
          width: '100%',
          background: '#090e17',
          color: '#ffffff',
          borderRadius: '28px',
          padding: '24px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        {/* HEADER BAR */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justify: 'center',
                color: '#ffffff',
                fontWeight: '800',
                fontSize: '1.1rem',
              }}
            >
              N
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: '#ffffff' }}>
              Cancel Booking
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justify: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* WARNING ALERT BANNER MATCHING FIGMA SCREEN 2 */}
        <div
          style={{
            padding: '16px',
            borderRadius: '18px',
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              background: 'rgba(245, 158, 11, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justify: 'center',
              color: '#f59e0b',
              flexShrink: 0,
            }}
          >
            <AlertTriangle size={18} />
          </div>

          <div>
            <div style={{ fontSize: '0.92rem', fontWeight: '800', color: '#ffffff' }}>
              Are you sure you want to cancel?
            </div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '3px', lineHeight: 1.4 }}>
              Free cancellation valid till 2 hours before the scheduled time slot.
            </div>
          </div>
        </div>

        {/* REASON SELECTION */}
        <div>
          <div style={{ fontSize: '0.88rem', fontWeight: '800', color: '#cbd5e1', marginBottom: '12px' }}>
            Please select a reason for cancellation
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {reasonsList.map((reason) => {
              const isSelected = selectedReason === reason;
              return (
                <div
                  key={reason}
                  onClick={() => setSelectedReason(reason)}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '16px',
                    background: isSelected ? 'rgba(16, 185, 129, 0.06)' : 'rgba(255, 255, 255, 0.03)',
                    border: isSelected ? '1.5px solid #10b981' : '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    justify: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{ fontSize: '0.9rem', fontWeight: isSelected ? '800' : '600', color: isSelected ? '#ffffff' : '#cbd5e1' }}>
                    {reason}
                  </span>

                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      border: isSelected ? '2px solid #10b981' : '2px solid #475569',
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'center',
                      background: isSelected ? '#10b981' : 'transparent',
                    }}
                  >
                    {isSelected && <Check size={12} strokeWidth={3} color="#ffffff" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ADDITIONAL COMMENTS INPUT */}
        <div>
          <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#34d399', display: 'block', marginBottom: '6px' }}>
            Write additional comments...
          </label>
          <textarea
            rows={3}
            value={additionalComments}
            onChange={(e) => setAdditionalComments(e.target.value)}
            placeholder="e.g. My cleaner of choice is not available during this time slot."
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#ffffff',
              fontSize: '0.85rem',
              outline: 'none',
              resize: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* REFUND AMOUNT BREAKDOWN BOX MATCHING FIGMA SCREEN 2 */}
        <div
          style={{
            padding: '16px 18px',
            borderRadius: '18px',
            background: 'rgba(16, 185, 129, 0.04)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.95rem', fontWeight: '800', color: '#ffffff' }}>Refund Amount</span>
            <span style={{ fontSize: '1.25rem', fontWeight: '900', color: '#34d399' }}>₹{refundAmount}</span>
          </div>

          <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '6px', lineHeight: 1.4 }}>
            *The refund will reflect back to your payment method within 2-3 business days.
          </div>
        </div>

        {/* ACTION BUTTONS: GO BACK & CONFIRM CANCEL */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '4px' }}>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            style={{
              padding: '14px',
              borderRadius: '16px',
              background: 'transparent',
              border: '1.5px solid #10b981',
              color: '#10b981',
              fontWeight: '800',
              fontSize: '0.95rem',
              cursor: 'pointer',
            }}
          >
            Go Back
          </button>

          <button
            type="button"
            onClick={handleConfirmCancel}
            disabled={loading}
            style={{
              padding: '14px',
              borderRadius: '16px',
              background: '#ef4444',
              border: 'none',
              color: '#ffffff',
              fontWeight: '800',
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justify: 'center',
              gap: '6px',
              boxShadow: '0 6px 20px rgba(239, 68, 68, 0.35)',
            }}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Confirm Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelBookingModal;
