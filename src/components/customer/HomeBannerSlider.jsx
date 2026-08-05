import React, { useState } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Tag } from 'lucide-react';

const HomeBannerSlider = () => {
  const banners = [
    {
      id: 1,
      title: 'AC Deep Jet Service',
      subtitle: 'Guaranteed 2x Cooling • Starts @ ₹399',
      tag: '50% OFF',
      gradient: 'linear-gradient(135deg, #76d729 0%, #00b4d8 50%, #0052d4 100%)',
      cta: 'Book AC Service'
    },
    {
      id: 2,
      title: 'Salon for Women at Home',
      subtitle: 'Professional Facial, Waxing & Spa',
      tag: 'FLAT ₹200 OFF',
      gradient: 'linear-gradient(135deg, #00b4d8 0%, #0052d4 100%)',
      cta: 'Book Salon'
    },
    {
      id: 3,
      title: 'Full Home Deep Cleaning',
      subtitle: 'Complete 3BHK Sanitization & Dusting',
      tag: 'VIP SPECIAL',
      gradient: 'linear-gradient(135deg, #76d729 0%, #00b4d8 100%)',
      cta: 'Book Cleaning'
    },
  ];

  const [activeBanner, setActiveBanner] = useState(0);

  return (
    <div style={{ marginBottom: '28px' }}>
      <div style={{
        background: banners[activeBanner].gradient,
        borderRadius: 'var(--radius-xl)',
        padding: '24px 28px',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 10px 25px rgba(0,180,216,0.25)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: '65%' }}>
          <span style={{
            background: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(4px)',
            padding: '4px 10px',
            borderRadius: '9999px',
            fontSize: '0.72rem',
            fontWeight: '800',
            letterSpacing: '0.6px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            marginBottom: '10px'
          }}>
            <Tag size={12} /> {banners[activeBanner].tag}
          </span>
          <h3 style={{ fontSize: '1.4rem', fontWeight: '800', margin: '0 0 6px 0', letterSpacing: '-0.4px' }}>
            {banners[activeBanner].title}
          </h3>
          <p style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: '16px' }}>
            {banners[activeBanner].subtitle}
          </p>
          <button className="btn" style={{ background: '#ffffff', color: '#0052d4', fontWeight: '800', border: 'none', padding: '8px 16px', fontSize: '0.85rem' }}>
            {banners[activeBanner].cta} <ArrowRight size={14} />
          </button>
        </div>

        <div style={{ textAlign: 'right' }}>
          <ShieldCheck size={72} opacity={0.3} />
        </div>
      </div>

      {/* Banner Indicators */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '12px' }}>
        {banners.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveBanner(idx)}
            style={{
              width: activeBanner === idx ? '24px' : '8px',
              height: '8px',
              borderRadius: '9999px',
              background: activeBanner === idx ? 'var(--accent-blue)' : '#cbd5e1',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.25s ease'
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default HomeBannerSlider;
