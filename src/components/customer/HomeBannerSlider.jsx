import { Star, ShieldCheck, Users, ArrowRight, Sparkles, Zap } from 'lucide-react';

const HomeBannerSlider = ({ onSelectCategory }) => {
  const quickTags = [
    { label: '✨ AC Repair', category: 'AC & Appliance Repair' },
    { label: '🧹 Home Cleaning', category: 'Full Home Deep Cleaning' },
    { label: '💇 Salon & Spa', category: 'Salon for Women & Spa' },
    { label: '⚡ Electrician', category: 'Electrician & Home Wiring' },
    { label: '🔧 Plumbing', category: 'Plumbing & Leakage Repair' },
    { label: '✂️ Men Grooming', category: 'Salon for Men & Grooming' },
  ];

  return (
    <div style={{
      background: 'linear-gradient(135deg, #09331E 0%, #064e3b 50%, #0f172a 100%)',
      borderRadius: '24px',
      padding: '36px 40px',
      color: '#ffffff',
      marginBottom: '36px',
      boxShadow: '0 20px 50px rgba(9, 51, 30, 0.25)',
      position: 'relative',
      overflow: 'hidden',
      border: '1px solid rgba(16, 185, 129, 0.25)'
    }}>
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
        filter: 'blur(40px)'
      }} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', alignItems: 'center', position: 'relative', zIndex: 1 }}>
        
        {/* Left Column: Headline, Subtitle, CTA & Tags */}
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
            <Sparkles size={13} color="#34d399" /> NOROZZ GUARANTEED HOME SERVICES
          </div>

          <h1 style={{
            fontSize: '2.4rem',
            fontWeight: '900',
            lineHeight: 1.15,
            margin: '0 0 16px 0',
            letterSpacing: '-0.5px',
            color: '#ffffff'
          }}>
            Premium On-Demand Services <br />
            <span style={{
              background: 'linear-gradient(135deg, #34d399 0%, #a7f3d0 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>at Your Doorstep</span>
          </h1>

          <p style={{
            fontSize: '0.92rem',
            color: '#a7f3d0',
            lineHeight: 1.6,
            marginBottom: '24px',
            maxWidth: '460px',
            fontWeight: '500'
          }}>
            Book background-verified professionals for deep cleaning, AC repair, grooming, and plumbing. Transparent upfront pricing with 100% satisfaction guarantee.
          </p>

          {/* CTA Button */}
          <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => onSelectCategory && onSelectCategory('AC & Appliance Repair')}
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
              <span>Explore All Services</span>
              <ArrowRight size={16} />
            </button>

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
          
          <div style={{
            height: '145px',
            borderRadius: '16px',
            overflow: 'hidden',
            border: '2.5px solid #ffffff',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
            position: 'relative',
            background: '#ffffff'
          }}>
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

          <div style={{
            height: '145px',
            borderRadius: '16px',
            overflow: 'hidden',
            border: '2.5px solid #ffffff',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
            position: 'relative',
            background: '#ffffff'
          }}>
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

          <div style={{
            height: '145px',
            borderRadius: '16px',
            overflow: 'hidden',
            border: '2.5px solid #ffffff',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
            position: 'relative',
            background: '#ffffff'
          }}>
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

          <div style={{
            height: '145px',
            borderRadius: '16px',
            overflow: 'hidden',
            border: '2.5px solid #ffffff',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
            position: 'relative',
            background: '#ffffff'
          }}>
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
    </div>
  );
};

export default HomeBannerSlider;
