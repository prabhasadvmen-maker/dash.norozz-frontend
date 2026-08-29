import React, { useState, useEffect } from 'react';
import { Star, X, CheckCircle2, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { axiosInstance } from '../../api/axiosInstance.js';
import { toast } from '../../utils/toast.js';

const ReviewModal = ({
  isOpen,
  onClose,
  booking,
  onSuccess,
}) => {
  const [rating, setRating] = useState(5);
  const [selectedTags, setSelectedTags] = useState(['Professional', 'Clean Work']);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const availableTags = ['On Time', 'Professional', 'Thorough', 'Friendly', 'Clean Work'];

  useEffect(() => {
    if (booking?.rating) {
      setRating(booking.rating);
      setComment(booking.reviewComment || '');
    } else {
      setRating(5);
      setComment('');
      setSelectedTags(['Professional', 'Clean Work']);
    }
    setErrorMsg('');
  }, [booking, isOpen]);

  if (!isOpen || !booking) return null;

  const partnerObj = typeof booking.partner === 'object' ? booking.partner : null;
  const partnerName = partnerObj?.name || booking.partnerName || 'Krishna Kumar';
  const partnerRole = partnerObj?.agencyName || booking.serviceName || booking.packageName || 'Service Specialist';

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const getRatingLabel = (score) => {
    switch (score) {
      case 5:
        return 'Exceptional 5/5';
      case 4:
        return 'Great 4/5';
      case 3:
        return 'Good 3/5';
      case 2:
        return 'Average 2/5';
      case 1:
        return 'Poor 1/5';
      default:
        return 'Tap a star to rate';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      setErrorMsg('Please select a star rating (1 to 5 stars).');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      // Combine selected tags with optional comment text
      const tagsPrefix = selectedTags.length > 0 ? `[Likes: ${selectedTags.join(', ')}] ` : '';
      const finalReviewComment = `${tagsPrefix}${comment}`.trim();

      const bookingId = booking._id || booking.rawId;
      await axiosInstance.post(`/bookings/${bookingId}/rate`, {
        rating,
        reviewComment: finalReviewComment,
      });

      toast.success('🎉 Thank you for your valuable feedback!');
      setSubmitting(false);
      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      setSubmitting(false);
      const msg = err.response?.data?.message || err.message || 'Failed to submit review';
      setErrorMsg(msg);
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.88)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justify: 'center',
        zIndex: 2500,
        padding: '20px',
      }}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(180deg, #111827 0%, #0f172a 100%)',
          color: '#ffffff',
          borderRadius: '28px',
          padding: '28px',
          maxWidth: '460px',
          width: '100%',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          position: 'relative',
        }}
      >
        {/* CLOSE BUTTON */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            borderRadius: '50%',
            width: '34px',
            height: '34px',
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            color: '#94a3b8',
            cursor: 'pointer',
          }}
        >
          <X size={18} />
        </button>

        {/* TOP TITLE */}
        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0, color: '#ffffff' }}>
            Rate Your Experience
          </h3>

          {/* PARTNER AVATAR & NAME */}
          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                color: '#ffffff',
                fontSize: '1.8rem',
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                justify: 'center',
                boxShadow: '0 8px 20px rgba(37, 99, 235, 0.3)',
                marginBottom: '8px',
              }}
            >
              {partnerName.charAt(0).toUpperCase()}
            </div>
            <div style={{ fontWeight: '800', fontSize: '1.1rem', color: '#ffffff' }}>{partnerName}</div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: '600' }}>{partnerRole}</div>
          </div>
        </div>

        {/* 5-STAR RATING SELECTOR */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  transition: 'transform 0.15s ease',
                }}
                className="hover-scale"
              >
                <Star
                  size={32}
                  fill={star <= rating ? '#f59e0b' : 'none'}
                  color={star <= rating ? '#f59e0b' : '#475569'}
                  strokeWidth={star <= rating ? 0 : 1.5}
                />
              </button>
            ))}
          </div>

          <div style={{ fontSize: '0.88rem', fontWeight: '800', color: '#10b981' }}>
            {getRatingLabel(rating)}
          </div>
        </div>

        {errorMsg && (
          <div
            style={{
              padding: '10px 14px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '12px',
              color: '#fca5a5',
              fontSize: '0.82rem',
              fontWeight: '600',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* WHAT DID YOU LIKE THE MOST? (PILLS) */}
          <div>
            <div style={{ fontSize: '0.74rem', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '10px' }}>
              WHAT DID YOU LIKE THE MOST?
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {availableTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      border: isSelected ? '1.5px solid #10b981' : '1px solid rgba(255,255,255,0.15)',
                      background: isSelected ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.05)',
                      color: isSelected ? '#34d399' : '#cbd5e1',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ADDITIONAL COMMENTS */}
          <div>
            <div style={{ fontSize: '0.74rem', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '8px' }}>
              ADDITIONAL COMMENTS (OPTIONAL)
            </div>
            <textarea
              rows={3}
              maxLength={500}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Highly recommended! Very polite and completed the work cleanly..."
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '14px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                fontSize: '0.85rem',
                outline: 'none',
                resize: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: '14px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff',
              fontWeight: '800',
              fontSize: '1rem',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(16, 185, 129, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justify: 'center',
              gap: '8px',
              marginTop: '4px',
            }}
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="spin" /> Submitting...
              </>
            ) : (
              'Submit Feedback'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
