import { useState, useEffect, useCallback } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Tag, ShieldCheck } from 'lucide-react';

const AUTOPLAY_MS = 5000;
const DEFAULT_GRADIENT = 'linear-gradient(135deg, #09331E 0%, #064e3b 50%, #0f172a 100%)';

const arrowStyle = {
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  width: '36px',
  height: '36px',
  borderRadius: '50%',
  background: 'rgba(15, 23, 42, 0.45)',
  backdropFilter: 'blur(6px)',
  border: '1px solid rgba(255, 255, 255, 0.35)',
  color: '#ffffff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  zIndex: 5,
};

const HomeBannerSlider = ({ banners = [], categories = [], onSelectCategory, onSelectService, onApplyCoupon }) => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [brokenImages, setBrokenImages] = useState({});

  const count = banners.length;
  const safeIndex = count > 0 ? Math.min(index, count - 1) : 0;
  const active = count > 0 ? banners[safeIndex] : null;

  const go = useCallback((next) => {
    if (count > 0) setIndex(((next % count) + count) % count);
  }, [count]);

  useEffect(() => {
    if (count <= 1 || paused) return undefined;
    const timer = setInterval(() => setIndex((prev) => (prev + 1) % count), AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [count, paused]);

  const handleBannerClick = (banner) => {
    if (!banner) {
      onSelectCategory?.(null);
      return;
    }
    if (banner.couponCode) onApplyCoupon?.(banner.couponCode);

    if (banner.targetType === 'service' && banner.targetValue) {
      if (onSelectService) onSelectService({ name: banner.targetValue, title: banner.targetValue });
      else onSelectCategory?.(banner.targetValue);
    } else if (banner.targetType === 'category' && banner.targetValue) {
      onSelectCategory?.(banner.targetValue);
    } else {
      onSelectCategory?.(null); // no specific target: open the full service directory
    }
  };

  const hasText = Boolean(active && (active.title || active.subtitle || active.badgeText));
  const showImage = Boolean(active?.imageUrl) && !brokenImages[active._id || active.imageUrl];

  const frame = {
    position: 'relative',
    borderRadius: '20px',
    overflow: 'hidden',
    marginBottom: '32px',
    boxShadow: '0 12px 32px rgba(15, 23, 42, 0.14)',
    border: '1px solid #e2e8f0',
    background: '#0f172a',
  };

  const controls = count > 1 && (
    <>
      <button type="button" aria-label="Previous banner" onClick={(e) => { e.stopPropagation(); go(safeIndex - 1); }} style={{ ...arrowStyle, left: '12px' }}>
        <ChevronLeft size={20} />
      </button>
      <button type="button" aria-label="Next banner" onClick={(e) => { e.stopPropagation(); go(safeIndex + 1); }} style={{ ...arrowStyle, right: '12px' }}>
        <ChevronRight size={20} />
      </button>
      <div style={{ position: 'absolute', bottom: '12px', left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: '6px', zIndex: 5 }}>
        {banners.map((b, i) => (
          <button
            key={b._id || i}
            type="button"
            aria-label={`Go to banner ${i + 1}`}
            aria-current={i === safeIndex}
            onClick={(e) => { e.stopPropagation(); go(i); }}
            style={{ width: i === safeIndex ? '22px' : '8px', height: '8px', borderRadius: '4px', border: 'none', background: i === safeIndex ? '#ffffff' : 'rgba(255,255,255,0.55)', boxShadow: '0 0 0 1px rgba(15,23,42,0.25)', cursor: 'pointer', transition: 'all 0.25s ease', padding: 0 }}
          />
        ))}
      </div>
    </>
  );

  const couponChip = active?.couponCode && (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(15,23,42,0.78)', color: '#fef08a', border: '1px dashed #fde047', padding: '5px 12px', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: '800' }}>
      <Tag size={13} /> Code: {active.couponCode}
    </span>
  );

  // 1. Image banner: the picture is the banner. It is shown whole (never cropped) at a fixed, sensible height;
  //    a blurred copy fills any side gutters so portrait / square artwork still looks intentional.
  if (active && showImage) {
    const imageKey = active._id || active.imageUrl;
    return (
      <div style={{ ...frame, height: 'clamp(190px, 30vw, 360px)', cursor: 'pointer' }} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onClick={() => handleBannerClick(active)}>
        <img
          src={active.imageUrl}
          alt=""
          aria-hidden="true"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(28px)', transform: 'scale(1.2)', opacity: 0.75 }}
        />
        <img
          src={active.imageUrl}
          alt={active.title || 'Offer banner'}
          onError={() => setBrokenImages((prev) => ({ ...prev, [imageKey]: true }))}
          style={{ position: 'relative', display: 'block', width: '100%', height: '100%', objectFit: 'contain' }}
        />

        {hasText && (
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '48px 24px 20px', background: 'linear-gradient(to top, rgba(15,23,42,0.85), rgba(15,23,42,0))', color: '#ffffff', pointerEvents: 'none' }}>
            {active.badgeText && <span style={{ display: 'inline-block', background: 'rgba(255,255,255,0.2)', padding: '3px 10px', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '6px' }}>{active.badgeText}</span>}
            {active.title && <div style={{ fontSize: '1.4rem', fontWeight: '800', lineHeight: 1.2 }}>{active.title}</div>}
            {active.subtitle && <div style={{ fontSize: '0.9rem', opacity: 0.92, marginTop: '4px' }}>{active.subtitle}</div>}
          </div>
        )}

        {couponChip && <div style={{ position: 'absolute', top: '14px', left: '14px', zIndex: 5 }}>{couponChip}</div>}

        <button
          type="button"
          style={{ position: 'absolute', right: '20px', bottom: '34px', zIndex: 5, background: '#ffffff', color: '#0f172a', border: 'none', borderRadius: '9999px', padding: '11px 24px', fontSize: '0.92rem', fontWeight: '800', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: '0 6px 18px rgba(15,23,42,0.3)' }}
        >
          Book Now <ArrowRight size={16} />
        </button>

        {controls}
      </div>
    );
  }

  // 2. Text banner (gradient background) configured by the admin
  if (active) {
    return (
      <div style={{ ...frame, background: active.gradientBg || DEFAULT_GRADIENT, color: '#ffffff', padding: '44px 56px 52px', minHeight: '220px', display: 'flex', alignItems: 'center' }} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        <div style={{ maxWidth: '560px', position: 'relative', zIndex: 1 }}>
          {active.badgeText && (
            <span style={{ display: 'inline-block', background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.35)', padding: '4px 12px', borderRadius: '9999px', fontSize: '0.74rem', fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '14px' }}>
              {active.badgeText}
            </span>
          )}
          {active.title && <h1 style={{ fontSize: '2.2rem', fontWeight: '800', lineHeight: 1.15, margin: '0 0 10px 0', letterSpacing: '-0.5px' }}>{active.title}</h1>}
          {active.subtitle && <p style={{ fontSize: '1rem', lineHeight: 1.55, margin: '0 0 22px 0', opacity: 0.92 }}>{active.subtitle}</p>}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => handleBannerClick(active)}
              style={{ background: '#ffffff', color: '#0f172a', border: 'none', borderRadius: '9999px', padding: '12px 26px', fontSize: '0.92rem', fontWeight: '800', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              {active.couponCode ? `Claim ${active.couponCode}` : 'Book Now'} <ArrowRight size={16} />
            </button>
            {couponChip}
          </div>
        </div>
        {controls}
      </div>
    );
  }

  // 3. Nothing configured by the admin: a plain brand hero with the real categories
  const quickCategories = (categories || []).slice(0, 6);
  return (
    <div style={{ ...frame, background: DEFAULT_GRADIENT, color: '#ffffff', padding: '44px 56px' }}>
      <div style={{ maxWidth: '620px' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(52,211,153,0.4)', color: '#6ee7b7', padding: '4px 12px', borderRadius: '9999px', fontSize: '0.74rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '14px' }}>
          <ShieldCheck size={13} /> Verified professionals
        </span>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '800', lineHeight: 1.15, margin: '0 0 10px 0', letterSpacing: '-0.5px' }}>Home services, at your doorstep</h1>
        <p style={{ fontSize: '1rem', lineHeight: 1.55, margin: '0 0 22px 0', color: '#a7f3d0' }}>
          Book background-verified professionals with upfront pricing.
        </p>
        <button
          type="button"
          onClick={() => handleBannerClick(null)}
          style={{ background: '#ffffff', color: '#0f172a', border: 'none', borderRadius: '9999px', padding: '12px 26px', fontSize: '0.92rem', fontWeight: '800', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          Explore services <ArrowRight size={16} />
        </button>

        {quickCategories.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '24px' }}>
            {quickCategories.map((cat) => (
              <button
                key={cat._id || cat.name}
                type="button"
                onClick={() => onSelectCategory?.(cat)}
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '9999px', padding: '6px 14px', fontSize: '0.8rem', fontWeight: '700', color: '#ffffff', cursor: 'pointer' }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeBannerSlider;
