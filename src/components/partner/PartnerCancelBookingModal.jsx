import React, { useState } from 'react';
import { AlertTriangle, XCircle, Loader2, Info, CheckCircle2 } from 'lucide-react';
import { partnerService } from '../../services/partner.service.js';
import { toast } from '../../utils/toast.js';

const REASON_OPTIONS = [
  { id: 'unreachable', label: '📱 Customer Unreachable / Phone Off' },
  { id: 'breakdown', label: '🚲 Vehicle Breakdown / Unexpected Emergency' },
  { id: 'traffic_distance', label: '📍 Location Too Far / Severe Traffic Jam' },
  { id: 'parts_tools', label: '🛠️ Required Tools or Spare Parts Unavailable' },
  { id: 'customer_reschedule', label: '💬 Customer Requested Reschedule / Cancellation' },
  { id: 'other', label: '📝 Other Reason' },
];

const PartnerCancelBookingModal = ({ isOpen, booking, onClose, onSuccess }) => {
  const [selectedReason, setSelectedReason] = useState(REASON_OPTIONS[0].label);
  const [customNote, setCustomNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !booking) return null;

  const bookingRef = booking.bookingId || booking.bookingNumber || `UC-${booking._id?.toString().slice(-6).toUpperCase()}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReason) {
      toast.error('Please select a cancellation reason.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await partnerService.cancelAcceptedBooking(booking._id, {
        reason: selectedReason,
        note: customNote.trim(),
      });

      toast.success(res.data?.message || 'Booking cancelled and re-dispatched to other partners.');
      onSuccess && onSuccess(booking._id);
      onClose();
    } catch (err) {
      console.error('Cancel booking error:', err);
      toast.error(err.response?.data?.message || 'Failed to cancel booking.');
    } finally {
      setSubmitting(false);
    }
  };

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
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          padding: '28px',
          maxWidth: '520px',
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #f1f5f9',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '14px',
              background: '#fef2f2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#dc2626'
            }}>
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0f172a', margin: 0 }}>
                Cancel Accepted Job #{bookingRef}
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '3px 0 0 0', fontWeight: '600' }}>
                Select a reason for releasing this assignment.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b',
            }}
          >
            <XCircle size={18} />
          </button>
        </div>

        {/* Informational Alert Box */}
        <div style={{
          background: '#f0f9ff',
          border: '1.5px solid #bae6fd',
          borderRadius: '12px',
          padding: '12px 14px',
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
        }}>
          <Info size={18} color="#0284c7" style={{ marginTop: '2px', flexShrink: 0 }} />
          <div style={{ fontSize: '0.8rem', color: '#0369a1', fontWeight: '600', lineHeight: '1.45' }}>
            <strong>Automatic Re-Dispatch Notice:</strong> Once cancelled, this booking request will instantly pop up for other eligible online partners in your city so the customer gets quick service.
          </div>
        </div>

        {/* Penalty & Account Suspension Policy Notice */}
        <div style={{
          background: '#fff7ed',
          border: '1.5px solid #fed7aa',
          borderRadius: '12px',
          padding: '12px 14px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
        }}>
          <AlertTriangle size={18} color="#c2410c" style={{ marginTop: '2px', flexShrink: 0 }} />
          <div style={{ fontSize: '0.8rem', color: '#9a3412', fontWeight: '600', lineHeight: '1.45' }}>
            <strong>Cancellation Policy:</strong> A penalty fee is deducted from your wallet on <strong>every cancellation</strong>. Cancelling <strong>more than 3 bookings in 1 day</strong> will automatically suspend your partner account.
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Reason Selection */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: '800', color: '#1e293b', marginBottom: '10px' }}>
              Select Cancellation Reason <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto', paddingRight: '4px' }}>
              {REASON_OPTIONS.map((opt) => {
                const isSelected = selectedReason === opt.label;
                return (
                  <label
                    key={opt.id}
                    onClick={() => setSelectedReason(opt.label)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      border: isSelected ? '2px solid #dc2626' : '1px solid #e2e8f0',
                      background: isSelected ? '#fff5f5' : '#ffffff',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: isSelected ? '800' : '600',
                      color: isSelected ? '#991b1b' : '#334155',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <input
                      type="radio"
                      name="cancel_reason"
                      checked={isSelected}
                      onChange={() => setSelectedReason(opt.label)}
                      style={{ accentColor: '#dc2626', width: '16px', height: '16px' }}
                    />
                    <span>{opt.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Optional Custom Note */}
          <div style={{ marginBottom: '22px' }}>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '800', color: '#1e293b', marginBottom: '6px' }}>
              Additional Details / Custom Note (Optional)
            </label>
            <textarea
              className="form-input"
              rows={3}
              placeholder="e.g. Tried calling customer 3 times, no response..."
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '12px',
                border: '1px solid #cbd5e1',
                fontSize: '0.84rem',
                outline: 'none',
                resize: 'none',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              style={{
                padding: '10px 18px',
                borderRadius: '12px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#475569',
                fontSize: '0.86rem',
                fontWeight: '700',
                cursor: 'pointer',
              }}
            >
              Keep Booking
            </button>

            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '10px 20px',
                borderRadius: '12px',
                border: 'none',
                background: '#dc2626',
                color: '#ffffff',
                fontSize: '0.86rem',
                fontWeight: '800',
                cursor: submitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(220, 38, 38, 0.25)',
              }}
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="spin" /> Processing...
                </>
              ) : (
                <>
                  <XCircle size={16} /> Confirm Cancellation
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PartnerCancelBookingModal;
