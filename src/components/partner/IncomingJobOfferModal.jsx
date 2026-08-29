import React, { useState, useEffect } from 'react';
import { Zap, Clock, MapPin, CheckCircle2, X, AlertCircle, Loader2 } from 'lucide-react';

const IncomingJobOfferModal = ({ offer, onAccept, onDecline, claiming }) => {
  const [timeLeft, setTimeLeft] = useState(45);

  useEffect(() => {
    if (!offer) return;
    setTimeLeft(offer.expirySeconds || 45);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onDecline && onDecline();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [offer]);

  if (!offer) return null;

  const progressPct = (timeLeft / 45) * 100;

  return (
    <div
      className="modal-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '20px',
      }}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#ffffff',
          borderRadius: '24px',
          padding: '28px',
          maxWidth: '460px',
          width: '100%',
          boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
          border: '2px solid #16a34a',
          position: 'relative',
          animation: 'jobPulseModal 0.3s ease-out',
        }}
      >
        {/* Top Header Badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div
            style={{
              padding: '6px 14px',
              borderRadius: '9999px',
              background: '#ecfdf5',
              color: '#059669',
              fontSize: '0.78rem',
              fontWeight: '800',
              border: '1px solid #a7f3d0',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Zap size={14} fill="#10b981" /> NEW REAL-TIME JOB REQUEST
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.85rem',
              fontWeight: '800',
              color: timeLeft < 10 ? '#dc2626' : '#2563eb',
            }}
          >
            <Clock size={16} /> {timeLeft}s remaining
          </div>
        </div>

        {/* Progress Timer Bar */}
        <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginBottom: '20px' }}>
          <div
            style={{
              width: `${progressPct}%`,
              height: '100%',
              background: timeLeft < 10 ? '#dc2626' : '#16a34a',
              transition: 'width 1s linear',
            }}
          />
        </div>

        {/* Booking Amount & Category */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              {offer.categoryName || 'AC & Appliance Repair'}
            </span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: '2px 0 0 0', color: 'var(--text-primary)' }}>
              {offer.serviceTitle || 'AC Foam Jet Cleaning'}
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#2563eb', fontFamily: 'monospace', fontWeight: '700' }}>
              {offer.bookingNumber || offer.bookingId}
            </span>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#16a34a' }}>
              ₹{offer.amount || 1499}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Customer Payment</div>
          </div>
        </div>

        {/* Booking Financial Breakdown Card for Partner Transparency */}
        {(() => {
          const serviceVal = offer.financialSnapshot?.servicePrice || offer.amount || 1000;
          const comm = offer.financialSnapshot?.partnerCommission || Math.round(serviceVal * 0.05);
          const netEarning = offer.financialSnapshot?.partnerNetEarning || (serviceVal - comm);

          return (
            <div style={{ padding: '14px 16px', background: '#f0fdf4', borderRadius: '16px', border: '1px solid #bbf7d0', marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#475569', marginBottom: '4px' }}>
                <span>Service Value</span>
                <span style={{ fontWeight: '700', color: '#0f172a' }}>₹{serviceVal.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#dc2626', marginBottom: '6px' }}>
                <span>Norozz Platform Commission</span>
                <span style={{ fontWeight: '700' }}>- ₹{comm.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #bbf7d0', paddingTop: '8px', marginTop: '4px' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: '900', color: '#166534', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Your Net Earning</span>
                <span style={{ fontSize: '1.45rem', fontWeight: '900', color: '#16a34a' }}>₹{netEarning.toLocaleString('en-IN')}</span>
              </div>
            </div>
          );
        })()}
        <div
          style={{
            padding: '14px',
            background: '#f8fafc',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-light)',
            marginBottom: '20px',
            fontSize: '0.85rem',
          }}
        >
          <div style={{ fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>
            👤 Customer: {offer.customerName || 'Local Resident'}
          </div>
          <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'flex-start', gap: '6px', lineHeight: '1.4' }}>
            <MapPin size={16} color="#0284c7" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{offer.address || `${offer.city || 'Delhi NCR'} Operational Zone`}</span>
          </div>
          <div style={{ marginTop: '8px', fontSize: '0.75rem', color: '#059669', fontWeight: '700' }}>
            📍 Within your Work Radius ({offer.city || 'Delhi NCR'})
          </div>
        </div>

        {/* First Come First Served Warning */}
        <div
          style={{
            fontSize: '0.75rem',
            color: '#b45309',
            background: '#fffbe6',
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid #fef08a',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontWeight: '600',
          }}
        >
          <AlertCircle size={14} color="#d97706" />
          <span>First-come, first-served! The first technician to click Accept gets assigned.</span>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="button"
            onClick={onDecline}
            disabled={claiming}
            className="btn"
            style={{
              padding: '12px',
              borderRadius: '12px',
              background: '#f1f5f9',
              color: 'var(--text-secondary)',
              fontWeight: '700',
              flex: 1,
              border: '1px solid var(--border-light)',
            }}
          >
            Decline / Pass
          </button>

          <button
            type="button"
            onClick={() => onAccept(offer)}
            disabled={claiming}
            className="btn"
            style={{
              padding: '12px',
              borderRadius: '12px',
              background: '#16a34a',
              color: '#ffffff',
              fontWeight: '800',
              flex: 2,
              border: 'none',
              fontSize: '0.95rem',
              boxShadow: '0 6px 20px rgba(22, 163, 74, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            {claiming ? (
              <>
                <Loader2 size={18} className="spin" /> Claiming Job...
              </>
            ) : (
              <>
                <CheckCircle2 size={18} /> Accept Job Request
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes jobPulseModal {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default IncomingJobOfferModal;
