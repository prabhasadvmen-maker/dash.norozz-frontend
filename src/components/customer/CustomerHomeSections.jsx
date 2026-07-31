import React from 'react';
import { Crown, Tag, RotateCcw, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

const CustomerHomeSections = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', marginBottom: '32px' }}>
      
      {/* 1. NOROZZ PLUS Membership Card */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
        borderRadius: 'var(--radius-xl)',
        padding: '24px 28px',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 10px 25px rgba(49,46,129,0.3)',
        border: '1px solid rgba(124,58,237,0.3)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f59e0b', fontWeight: '800', fontSize: '0.85rem', marginBottom: '6px' }}>
            <Crown size={18} fill="#f59e0b" /> NOROZZ PLUS VIP MEMBERSHIP
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: '0 0 4px 0' }}>
            Save 10% Extra on Every Booking
          </h3>
          <p style={{ fontSize: '0.82rem', opacity: 0.85, marginBottom: '14px' }}>
            Free cancellation • Priority slot booking • Dedicated 24x7 support
          </p>
          <button className="btn" style={{ background: '#f59e0b', color: '#000000', fontWeight: '800', border: 'none', padding: '8px 16px', fontSize: '0.82rem' }}>
            Join for ₹299 / 6 Months <ArrowRight size={14} />
          </button>
        </div>

        <Crown size={80} opacity={0.15} fill="#ffffff" />
      </div>

      {/* 2. Recently Booked Services (Rebook 1-Click) */}
      <div>
        <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '16px', color: 'var(--text-primary)' }}>
          Recently Booked
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          {[
            { title: 'AC Foam Jet Deep Cleaning', date: 'Booked on 12 June 2026', price: '₹599', partner: 'Rajesh Kumar' },
            { title: 'Full Home Deep Cleaning', date: 'Booked on 04 May 2026', price: '₹4,499', partner: 'CleanPro Services' }
          ].map((item, idx) => (
            <div key={idx} className="mui-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-primary)' }}>{item.title}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.date} • {item.price}</div>
              </div>
              <button className="btn btn-primary btn-sm">
                <RotateCcw size={14} /> Rebook
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Offers & Coupons Grid */}
      <div>
        <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '16px', color: 'var(--text-primary)' }}>
          Exclusive Offers & Coupons
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          {[
            { code: 'FIRST50', offer: 'Flat 50% OFF on First Booking', desc: 'Valid for all new customers' },
            { code: 'SUMMERAC', offer: 'Flat ₹300 OFF AC Cleaning', desc: 'Valid on AC Jet Clean package' }
          ].map((c, idx) => (
            <div key={idx} style={{ padding: '18px', background: '#f5f3ff', borderRadius: 'var(--radius-lg)', border: '1px border #ddd6fe', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#7c3aed', letterSpacing: '0.6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Tag size={12} /> PROMO CODE: {c.code}
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-primary)' }}>{c.offer}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.desc}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default CustomerHomeSections;
