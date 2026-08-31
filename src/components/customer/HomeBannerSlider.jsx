import React from 'react';
import { Star, ShieldCheck, Users, ArrowRight, Download } from 'lucide-react';

const HomeBannerSlider = ({ onSelectCategory }) => {
  const quickTags = [
    { label: 'AC Repair', category: 'AC & Appliance Repair' },
    { label: 'Home Cleaning', category: 'Full Home Deep Cleaning' },
    { label: 'Salon', category: 'Salon for Women & Spa' },
    { label: 'Appliance', category: 'AC & Appliance Repair' },
    { label: 'Plumbing', category: 'Plumbing & Leakage Repair' },
    { label: 'Grooming', category: 'Salon for Men & Grooming' },
  ];

  return (
    <div style={{
      background: '#0b132b',
      borderRadius: '24px',
      padding: '36px 40px',
      color: '#ffffff',
      marginBottom: '36px',
      boxShadow: '0 20px 40px rgba(11, 19, 43, 0.4)'
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', alignItems: 'center' }}>
        
        {/* Left Column: Headline, Subtitle, CTA & Tags */}
        <div>
          <h1 style={{
            fontSize: '2.4rem',
            fontWeight: '900',
            lineHeight: 1.15,
            margin: '0 0 16px 0',
            letterSpacing: '-0.5px',
            color: '#ffffff'
          }}>
            Expert Home Services <br />
            <span style={{ color: '#ffffff' }}>at Your Doorstep</span>
          </h1>

          <p style={{
            fontSize: '0.92rem',
            color: '#94a3b8',
            lineHeight: 1.6,
            marginBottom: '24px',
            maxWidth: '440px'
          }}>
            Book certified professionals for cleaning, repair, grooming, and more. Transparent pricing and guaranteed satisfaction.
          </p>

          {/* CTA Button */}
          <div style={{ marginBottom: '28px' }}>
            <button style={{
              background: '#4f46e5',
              color: '#ffffff',
              border: 'none',
              borderRadius: '24px',
              padding: '12px 24px',
              fontSize: '0.88rem',
              fontWeight: '800',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)'
            }}>
              <span>Download App</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Popular Services Pills */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
              POPULAR SERVICES
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {quickTags.map((tag, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectCategory && onSelectCategory(tag.category)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '16px',
                    padding: '5px 12px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    color: '#e2e8f0',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </div>

          {/* Trust Highlights */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '0.78rem', fontWeight: '700', color: '#cbd5e1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Star size={14} fill="#f59e0b" color="#f59e0b" />
              <span>4.8 Rating</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={14} color="#10b981" />
              <span>Verified Pros</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Users size={14} color="#3b82f6" />
              <span>50k+ Bookings</span>
            </div>
          </div>
        </div>

        {/* Right Column: 2x2 Collage Grid of Service Photos */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div style={{ height: '140px', borderRadius: '18px', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.1)' }}>
            <img
              src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&auto=format&fit=crop"
              alt="Salon Facial Spa"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <div style={{ height: '140px', borderRadius: '18px', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.1)' }}>
            <img
              src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&auto=format&fit=crop"
              alt="Relaxing Body Spa Massage"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <div style={{ height: '140px', borderRadius: '18px', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.1)' }}>
            <img
              src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop"
              alt="AC Repair Technician"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <div style={{ height: '140px', borderRadius: '18px', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.1)' }}>
            <img
              src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format&fit=crop"
              alt="Deep Cleaning Specialist"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default HomeBannerSlider;
