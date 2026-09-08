import React, { useState, useEffect } from 'react';
import { Sparkles, Clock, Calendar, ChevronDown, ChevronUp, CheckCircle2, ArrowRight, X, ShieldCheck, Tag, Zap } from 'lucide-react';
import { customerService } from '../../services/customer.service.js';
import { toast } from '../../utils/toast.js';

const StarterPackBanner = ({ onSelectStarterPack }) => {
  const [pack, setPack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    customerService
      .getStarterPack()
      .then((res) => {
        const data = res.data?.data || res.data;
        if (data && data.isActive !== false) {
          setPack(data);
        }
      })
      .catch((err) => console.warn('Starter Pack fetch warning:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !pack) return null;

  const handleClaimAndBook = async (e) => {
    if (e) e.stopPropagation();
    setClaiming(true);
    try {
      await customerService.claimStarterPack();
      toast.success(`🎉 Starter Pack Offer Claimed! ₹${pack.offerPrice || 139} for ${pack.visitCount || 2} Visits applied!`);
    } catch (err) {
      console.warn('Claim starter pack warning:', err);
    } finally {
      setClaiming(false);
      setIsModalOpen(false);
      onSelectStarterPack && onSelectStarterPack(pack);
    }
  };

  const targetName = pack.applicableService?.name || pack.applicableService?.title
    ? `Service: ${pack.applicableService?.name || pack.applicableService?.title}`
    : pack.applicableCategory?.name
    ? `Category: ${pack.applicableCategory?.name}`
    : 'All Platform Services';

  const defaultBenefits = [
    `${pack.visitCount || 2} × ${pack.visitDurationMinutes || 60} min Professional Doorstep Visits`,
    `Valid for ${pack.validityDays || 15} Days from activation date`,
    'Covers complete labor & technician inspection charges',
    '100% Satisfaction Guarantee or free re-visit'
  ];

  const benefitsList = pack.benefits && pack.benefits.length > 0 ? pack.benefits : defaultBenefits;

  return (
    <div style={{ marginBottom: '24px', width: '100%' }}>
      {/* Main Dark Banner Container */}
      <div
        onClick={() => setIsModalOpen(true)}
        style={{
          background: 'linear-gradient(180deg, #0f172a 0%, #0b0f19 100%)',
          borderRadius: '24px',
          padding: '20px',
          color: '#ffffff',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.25)',
          border: '1px solid rgba(236, 72, 153, 0.25)',
          position: 'relative',
          cursor: 'pointer',
          overflow: 'hidden',
          transition: 'transform 0.2s ease, boxShadow 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 16px 40px rgba(236, 72, 153, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.25)';
        }}
      >
        {/* Toggle Collapse Chevron */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setCollapsed(!collapsed);
          }}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            borderRadius: '50%',
            width: '30px',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            cursor: 'pointer',
            zIndex: 10
          }}
          title={collapsed ? 'Expand Offer' : 'Minimize Offer'}
        >
          {collapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
        </button>

        {/* Top Graphic Ticket Banner Box */}
        <div style={{
          background: 'linear-gradient(135deg, #111827 0%, #1e293d 100%)',
          borderRadius: '20px',
          padding: collapsed ? '16px 20px' : '24px 20px',
          position: 'relative',
          marginBottom: collapsed ? '0' : '16px',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          overflow: 'hidden'
        }}>
          {/* STARTER PACK BADGE */}
          <div style={{
            position: 'absolute',
            top: '14px',
            left: '14px',
            background: '#000000',
            color: '#ffffff',
            fontSize: '0.7rem',
            fontWeight: '900',
            letterSpacing: '1px',
            padding: '4px 12px',
            borderRadius: '9999px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
            zIndex: 2
          }}>
            {pack.badge || 'STARTER PACK'}
          </div>

          {/* Pink Tickets Graphic Representation */}
          {!collapsed && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: '16px',
              position: 'relative',
              height: '80px'
            }}>
              {/* Background Rotated Pink Tickets */}
              <div style={{
                position: 'absolute',
                width: '100px',
                height: '56px',
                background: '#be185d',
                borderRadius: '10px',
                transform: 'rotate(-15deg)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                opacity: 0.85
              }} />
              <div style={{
                position: 'absolute',
                width: '100px',
                height: '56px',
                background: '#9d174d',
                borderRadius: '10px',
                transform: 'rotate(15deg)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                opacity: 0.85
              }} />

              {/* Main Front Pink Ticket Box */}
              <div style={{
                position: 'relative',
                zIndex: 5,
                background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                borderRadius: '14px',
                padding: '8px 22px',
                boxShadow: '0 8px 24px rgba(236, 72, 153, 0.45)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                border: '1.5px dashed rgba(255, 255, 255, 0.4)'
              }}>
                <span style={{ fontSize: '1.15rem', textDecoration: 'line-through', opacity: 0.75, fontWeight: '700' }}>
                  ₹{pack.ticketOriginalPrice || 199}
                </span>
                <span style={{ fontSize: '1.6rem', fontWeight: '900', color: '#ffffff' }}>
                  ₹{pack.ticketOfferPrice || 70}
                </span>
              </div>
            </div>
          )}
        </div>

        {!collapsed && (
          <>
            {/* Sub-Header Tag */}
            <div style={{
              textAlign: 'center',
              fontSize: '0.75rem',
              fontWeight: '900',
              letterSpacing: '1px',
              color: '#ec4899',
              marginBottom: '8px'
            }}>
              {pack.subBadge || '✦ ONE TIME OFFER ✦'}
            </div>

            {/* Main Title & Strikethrough Pricing */}
            <div style={{ textAlign: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: '900', letterSpacing: '-0.3px', marginRight: '8px' }}>
                {pack.visitCount || 2} VISITS FOR
              </span>
              <span style={{ fontSize: '1.25rem', textDecoration: 'line-through', opacity: 0.5, fontWeight: '800', marginRight: '6px' }}>
                ₹{pack.originalPrice || 398}
              </span>
              <span style={{ fontSize: '1.5rem', fontWeight: '900', color: '#ffffff' }}>
                ₹{pack.offerPrice || 139}
              </span>
            </div>

            {/* Per Visit Rate Subtitle */}
            <div style={{ textAlign: 'center', fontSize: '0.85rem', color: '#94a3b8', fontWeight: '600', marginBottom: '16px' }}>
              {pack.perVisitPriceText || 'Only ₹70 per visit'}
            </div>

            {/* Two Info Chips (Visits & Validity) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '14px',
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                fontSize: '0.82rem',
                fontWeight: '700',
                color: '#ffffff'
              }}>
                <Clock size={15} color="#ec4899" />
                <span>{pack.visitCount || 2} × {pack.visitDurationMinutes || 60} min visits</span>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '14px',
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                fontSize: '0.82rem',
                fontWeight: '700',
                color: '#ffffff'
              }}>
                <Calendar size={15} color="#ec4899" />
                <span>Valid for {pack.validityDays || 15} days</span>
              </div>
            </div>

            <div style={{
              marginTop: '14px',
              textAlign: 'center',
              fontSize: '0.78rem',
              color: '#ec4899',
              fontWeight: '800',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px'
            }}>
              <span>Click to view offer details & claim</span>
              <ArrowRight size={14} />
            </div>
          </>
        )}
      </div>

      {/* Interactive Starter Pack Details Modal Popup */}
      {isModalOpen && (
        <div
          onClick={() => setIsModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#090d16',
              borderRadius: '28px',
              maxWidth: '480px',
              width: '100%',
              padding: '28px',
              color: '#ffffff',
              boxShadow: '0 25px 50px -12px rgba(236, 72, 153, 0.3)',
              border: '1.5px solid rgba(236, 72, 153, 0.3)',
              position: 'relative',
              animation: 'modalSlideUp 0.3s ease-out'
            }}
          >
            {/* Close Modal Button */}
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
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
                justifyContent: 'center',
                color: '#94a3b8',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>

            {/* Header Badge & Title */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                padding: '4px 14px',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: '900',
                letterSpacing: '1px',
                marginBottom: '10px'
              }}>
                <Sparkles size={14} /> {pack.badge || 'STARTER PACK'}
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '900', margin: 0, color: '#ffffff' }}>
                {pack.subBadge || '✦ SPECIAL WELCOME OFFER ✦'}
              </h3>
            </div>

            {/* Ticket Price Box */}
            <div style={{
              background: 'linear-gradient(135deg, #111827 0%, #1e293b 100%)',
              borderRadius: '20px',
              padding: '20px',
              border: '1px solid rgba(236, 72, 153, 0.2)',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '700', marginBottom: '4px' }}>
                OFFER PRICING & VISITS
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#ffffff' }}>
                {pack.visitCount || 2} VISITS FOR{' '}
                <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '1.4rem', marginRight: '6px' }}>
                  ₹{pack.originalPrice || 398}
                </span>
                <span style={{ color: '#ec4899' }}>₹{pack.offerPrice || 139}</span>
              </div>
              <div style={{ fontSize: '0.88rem', color: '#ec4899', fontWeight: '800', marginTop: '4px' }}>
                {pack.perVisitPriceText || 'Only ₹70 per visit'}
              </div>
            </div>

            {/* Applicable Scope Badge */}
            <div style={{
              background: 'rgba(236, 72, 153, 0.1)',
              border: '1px solid rgba(236, 72, 153, 0.25)',
              borderRadius: '14px',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '0.85rem',
              fontWeight: '700',
              color: '#ffffff',
              marginBottom: '20px'
            }}>
              <Tag size={18} color="#ec4899" />
              <span>Target Scope: <strong>{targetName}</strong></span>
            </div>

            {/* Included Benefits List */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: '900', color: '#94a3b8', letterSpacing: '0.5px', marginBottom: '12px' }}>
                WHAT'S INCLUDED IN THIS STARTER PACK:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {benefitsList.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', fontWeight: '600', color: '#e2e8f0' }}>
                    <CheckCircle2 size={18} color="#10b981" style={{ flexShrink: 0 }} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                type="button"
                onClick={handleClaimAndBook}
                disabled={claiming}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                  color: '#ffffff',
                  fontWeight: '900',
                  fontSize: '1rem',
                  border: 'none',
                  boxShadow: '0 8px 24px rgba(236, 72, 153, 0.4)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Zap size={20} />
                <span>Claim & Book Offer (₹{pack.offerPrice || 139})</span>
              </button>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  padding: '8px'
                }}
              >
                Close details
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default StarterPackBanner;
