import React, { useState, useEffect } from 'react';
import { Star, ShieldCheck, Users, ArrowRight, Sparkles, Zap, ChevronLeft, ChevronRight, Tag } from 'lucide-react';
import { customerService } from '../../services/customer.service.js';

const HomeBannerSlider = ({ banners: propBanners, onSelectCategory, onSelectService, onApplyCoupon }) => {
  const [liveBanners, setLiveBanners] = useState(propBanners || []);
  const [currentIndex, setCurrentIndex] = useState(0);

  const quickTags = [
    { label: '✨ AC Repair', category: 'AC & Appliance Repair' },
    { label: '🧹 Home Cleaning', category: 'Full Home Deep Cleaning' },
    { label: '💇 Salon & Spa', category: 'Salon for Women & Spa' },
    { label: '⚡ Electrician', category: 'Electrician & Home Wiring' },
    { label: '🔧 Plumbing', category: 'Plumbing & Leakage Repair' },
    { label: '✂️ Men Grooming', category: 'Salon for Men & Grooming' },
  ];

  // Fetch live banners from backend if not passed as prop
  useEffect(() => {
    if (propBanners && propBanners.length > 0) {
      setLiveBanners(propBanners);
      return;
    }

    customerService.getBanners()
      .then((res) => {
        const list = res.data?.data || res.data || [];
        if (Array.isArray(list) && list.length > 0) {
          setLiveBanners(list);
        }
      })
      .catch((err) => {
        console.warn('Live banners fetch warning:', err);
      });
  }, [propBanners]);

  // Auto Slider Timer
  useEffect(() => {
    if (!liveBanners || liveBanners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % liveBanners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [liveBanners]);

  const activeBanner = liveBanners.length > 0 ? liveBanners[currentIndex] : null;

  const handleBannerClick = (banner) => {
    if (!banner) return;

    if (banner.couponCode && onApplyCoupon) {
      onApplyCoupon(banner.couponCode);
    }

    if (banner.targetType === 'category' && banner.targetValue) {
      if (onSelectCategory) onSelectCategory(banner.targetValue);
    } else if (banner.targetType === 'service' && banner.targetValue) {
      if (onSelectService) {
        onSelectService({ name: banner.targetValue, title: banner.targetValue });
      } else if (onSelectCategory) {
        onSelectCategory(banner.targetValue);
      }
    } else if (onSelectCategory) {
      onSelectCategory('AC & Appliance Repair');
    }
  };

  const bgStyle = activeBanner?.imageUrl
    ? `url(${activeBanner.imageUrl}) center/cover no-repeat`
    : (activeBanner?.gradientBg || 'linear-gradient(135deg, #09331E 0%, #064e3b 50%, #0f172a 100%)');

  return (
    <div style={{
      background: bgStyle,
      borderRadius: '24px',
      padding: '36px 40px',
      color: '#ffffff',
      marginBottom: '36px',
      boxShadow: '0 20px 50px rgba(9, 51, 30, 0.25)',
      position: 'relative',
      overflow: 'hidden',
      border: '1px solid rgba(16, 185, 129, 0.25)',
      transition: 'background 0.5s ease-in-out'
    }}>
      {/* Overlay for Image banners to ensure contrast */}
      {activeBanner?.imageUrl && (
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(15, 23, 42, 0.92) 0%, rgba(15, 23, 42, 0.5) 100%)', zIndex: 0 }} />
      )}

      {/* Background Glow Orb */}
      <div style={{
        position: 'absolute',
        top: '-60px',
        right: '-60px',
        width: '280px',
        height: '280px',
        borderRadius: '50%',
        background: 'rgba(16, 185, 129, 0.12)',
        pointerEvents: 'none',
        filter: 'blur(40px)',
        zIndex: 0
      }} />

      {/* Slider Controls (Next/Prev Arrows) */}
      {liveBanners.length > 1 && (
        <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', gap: '8px', zIndex: 10 }}>
          <button
            type="button"
            onClick={() => setCurrentIndex((prev) => (prev - 1 + liveBanners.length) % liveBanners.length)}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(6px)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => setCurrentIndex((prev) => (prev + 1) % liveBanners.length)}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(6px)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', alignItems: 'center', position: 'relative', zIndex: 1 }}>
        
        {/* Left Column: Dynamic Banner Headline, Subtitle, CTA & Tags */}
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            borderRadius: '9999px',
            background: 'rgba(16, 185, 129, 0.2)',
            border: '1px solid rgba(52, 211, 153, 0.4)',
            color: '#34d399',
            fontSize: '0.74rem',
            fontWeight: '800',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            marginBottom: '16px'
          }}>
            <Sparkles size={13} color="#34d399" /> {activeBanner?.badgeText || 'NOROZZ GUARANTEED HOME SERVICES'}
          </div>

          <h1 style={{
            fontSize: '2.4rem',
            fontWeight: '900',
            lineHeight: 1.15,
            margin: '0 0 16px 0',
            letterSpacing: '-0.5px',
            color: '#ffffff'
          }}>
            {activeBanner?.title || 'Premium On-Demand Services'} <br />
            {!activeBanner && (
              <span style={{
                background: 'linear-gradient(135deg, #34d399 0%, #a7f3d0 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>at Your Doorstep</span>
            )}
          </h1>

          <p style={{
            fontSize: '0.92rem',
            color: '#a7f3d0',
            lineHeight: 1.6,
            marginBottom: '24px',
            maxWidth: '460px',
            fontWeight: '500'
          }}>
            {activeBanner?.subtitle || 'Book background-verified professionals for deep cleaning, AC repair, grooming, and plumbing. Upfront pricing with 100% satisfaction guarantee.'}
          </p>

          {/* CTA Button */}
          <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => handleBannerClick(activeBanner)}
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                border: '1px solid #34d399',
                borderRadius: '9999px',
                padding: '12px 28px',
                fontSize: '0.88rem',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)',
                transition: 'all 0.2s ease'
              }}
            >
              <span>{activeBanner?.couponCode ? `Claim ${activeBanner.couponCode} Offer` : 'Explore & Book Now'}</span>
              <ArrowRight size={16} />
            </button>

            {activeBanner?.couponCode && (
              <span style={{ fontSize: '0.8rem', background: 'rgba(254, 240, 138, 0.2)', border: '1px dashed #fef08a', color: '#fef08a', padding: '6px 14px', borderRadius: '14px', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Tag size={14} color="#fef08a" /> Code: {activeBanner.couponCode}
              </span>
            )}

            <span style={{ fontSize: '0.78rem', color: '#6ee7b7', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <Zap size={14} color="#fde047" /> 30-Min Instant Dispatch
            </span>
          </div>

          {/* Popular Services Pills */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: '800', color: '#6ee7b7', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '10px' }}>
              POPULAR SERVICE CATEGORIES
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {quickTags.map((tag, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSelectCategory && onSelectCategory(tag.category)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '16px',
                    padding: '6px 14px',
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    color: '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(16, 185, 129, 0.25)';
                    e.currentTarget.style.borderColor = '#34d399';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                  }}
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </div>

          {/* Trust Highlights */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '0.78rem', fontWeight: '700', color: '#ffffff', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255, 255, 255, 0.08)', padding: '4px 10px', borderRadius: '8px' }}>
              <Star size={14} fill="#f59e0b" color="#f59e0b" />
              <span>4.9 Star Rating</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255, 255, 255, 0.08)', padding: '4px 10px', borderRadius: '8px' }}>
              <ShieldCheck size={14} color="#34d399" />
              <span>Verified Experts</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255, 255, 255, 0.08)', padding: '4px 10px', borderRadius: '8px' }}>
              <Users size={14} color="#60a5fa" />
              <span>50k+ Happy Customers</span>
            </div>
          </div>
        </div>

        {/* Right Column: Bright, Vibrant 2x2 Photo Showcase */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          
          <div
            onClick={() => onSelectCategory && onSelectCategory('Salon for Women & Spa')}
            style={{
              height: '145px',
              borderRadius: '16px',
              overflow: 'hidden',
              border: '2.5px solid #ffffff',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
              position: 'relative',
              background: '#ffffff',
              cursor: 'pointer'
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=800&auto=format&fit=crop"
              alt="Salon & Spa"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div style={{
              position: 'absolute',
              bottom: '8px',
              left: '8px',
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(6px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              padding: '4px 10px',
              borderRadius: '8px',
              fontSize: '0.72rem',
              fontWeight: '800',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <span>💇 Salon & Spa</span>
            </div>
          </div>

          <div
            onClick={() => onSelectCategory && onSelectCategory('Full Home Deep Cleaning')}
            style={{
              height: '145px',
              borderRadius: '16px',
              overflow: 'hidden',
              border: '2.5px solid #ffffff',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
              position: 'relative',
              background: '#ffffff',
              cursor: 'pointer'
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop"
              alt="Deep Cleaning"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div style={{
              position: 'absolute',
              bottom: '8px',
              left: '8px',
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(6px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              padding: '4px 10px',
              borderRadius: '8px',
              fontSize: '0.72rem',
              fontWeight: '800',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <span>🧹 Deep Cleaning</span>
            </div>
          </div>

          <div
            onClick={() => onSelectCategory && onSelectCategory('AC & Appliance Repair')}
            style={{
              height: '145px',
              borderRadius: '16px',
              overflow: 'hidden',
              border: '2.5px solid #ffffff',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
              position: 'relative',
              background: '#ffffff',
              cursor: 'pointer'
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop"
              alt="AC & Repair"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div style={{
              position: 'absolute',
              bottom: '8px',
              left: '8px',
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(6px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              padding: '4px 10px',
              borderRadius: '8px',
              fontSize: '0.72rem',
              fontWeight: '800',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <span>⚡ AC & Repair</span>
            </div>
          </div>

          <div
            onClick={() => onSelectCategory && onSelectCategory('Plumbing & Leakage Repair')}
            style={{
              height: '145px',
              borderRadius: '16px',
              overflow: 'hidden',
              border: '2.5px solid #ffffff',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
              position: 'relative',
              background: '#ffffff',
              cursor: 'pointer'
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop"
              alt="Plumbing"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div style={{
              position: 'absolute',
              bottom: '8px',
              left: '8px',
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(6px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              padding: '4px 10px',
              borderRadius: '8px',
              fontSize: '0.72rem',
              fontWeight: '800',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <span>🔧 Plumbing</span>
            </div>
          </div>

        </div>

      </div>

      {/* Pagination Dots */}
      {liveBanners.length > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px', position: 'relative', zIndex: 10 }}>
          {liveBanners.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              style={{
                width: currentIndex === idx ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                background: currentIndex === idx ? '#34d399' : 'rgba(255, 255, 255, 0.3)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HomeBannerSlider;
