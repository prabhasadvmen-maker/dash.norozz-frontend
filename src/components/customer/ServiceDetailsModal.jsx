import React from 'react';
import { X, Star, Clock, ShieldCheck, CheckCircle2, AlertCircle, Plus } from 'lucide-react';

const ServiceDetailsModal = ({ isOpen, onClose, service, onBookNow }) => {
  if (!isOpen || !service) return null;

  const title = service.name || service.title || 'AC Deep Jet Cleaning Package';
  const rawPrice = service.finalPrice || (typeof service.price === 'number' ? service.price : parseInt(String(service.price || '599').replace(/\D/g, '')) || 599);
  const rawOriginalPrice = service.originalPrice ? (typeof service.originalPrice === 'number' ? service.originalPrice : parseInt(String(service.originalPrice).replace(/\D/g, '')) || (rawPrice + 200)) : (rawPrice + 200);
  const discountVal = service.discount || (rawOriginalPrice - rawPrice > 0 ? rawOriginalPrice - rawPrice : 200);
  const offPercentage = Math.round((discountVal / rawOriginalPrice) * 100) || 25;
  const price = `₹${rawPrice}`;
  const originalPrice = `₹${rawOriginalPrice}`;
  const duration = service.duration || '45 mins';
  const rating = service.rating ? `${service.rating} (${service.reviews || '14.2k ratings'})` : '4.85 (14.2k ratings)';
  const categoryName = typeof service.category === 'object' ? service.category?.name : (service.category || 'Home Services');
  const description = service.description || 'Professional deep cleaning & servicing performed by background-verified experts using high-pressure foam jet equipment.';

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '540px',
          width: '90%',
          padding: 0,
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Modal Top Header Banner */}
        <div style={{
          position: 'relative',
          background: service.thumbnail ? `url(${service.thumbnail}) center/cover no-repeat` : 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #7c3aed 100%)',
          minHeight: '180px',
          display: 'flex',
          flexDirection: 'column',
          justify: 'flex-end',
          padding: '24px 24px 20px 24px',
          color: '#ffffff'
        }}>
          {/* Background Overlay if image exists */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(15, 23, 42, 0.92) 0%, rgba(15, 23, 42, 0.4) 100%)',
            zIndex: 1
          }} />

          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(0,0,0,0.5)',
              border: 'none',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justify: 'center',
              color: '#ffffff',
              cursor: 'pointer',
              zIndex: 2,
              backdropFilter: 'blur(4px)'
            }}
          >
            <X size={18} />
          </button>

          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
              <span className="badge" style={{ background: 'rgba(255,255,255,0.25)', color: '#ffffff', fontSize: '0.7rem', padding: '3px 8px' }}>
                {categoryName}
              </span>
              <span className="badge badge-success" style={{ fontSize: '0.7rem', padding: '3px 8px', fontWeight: '800' }}>
                {offPercentage}% OFF
              </span>
            </div>

            <h2 style={{ fontSize: '1.35rem', fontWeight: '800', margin: '0 0 6px 0', lineHeight: 1.3 }}>
              {title}
            </h2>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.82rem', opacity: 0.95, flexWrap: 'wrap' }}>
              <span style={{ color: '#fef08a', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Star size={14} fill="#fef08a" /> {rating}
              </span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={14} /> {duration}
              </span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={14} /> 30-Day Guarantee
              </span>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '22px' }}>
          
          {/* Price, Offer & Off% Section */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justify: 'space-between',
            background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)',
            padding: '16px 20px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid #bfdbfe'
          }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '700' }}>Special Package Price</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-primary)' }}>{price}</span>
                {originalPrice && (
                  <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>{originalPrice}</span>
                )}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className="badge badge-purple" style={{ fontSize: '0.78rem', padding: '4px 10px', display: 'inline-block', marginBottom: '4px' }}>
                🔥 FLAT {offPercentage}% OFF
              </span>
              <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: '800' }}>
                Instant Save ₹{discountVal}
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: '800', marginBottom: '6px', color: 'var(--text-primary)' }}>
              Service Description
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.65, margin: 0 }}>
              {description}
            </p>
          </div>

          {/* What's Included Section */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: '800', marginBottom: '10px', color: 'var(--text-primary)' }}>
              What's Included in Package
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                'High-pressure intense foam jet wash & deep cleaning',
                'Inspection & sanitization of cooling coils, blower & indoor filters',
                '30-Day post-service warranty & free doorstep re-visit guarantee',
                'Background-verified & trained NOROZZ certified professionals',
                'Pre & post service health inspection check report'
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                  <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Reviews Section */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
                Verified Customer Reviews
              </h4>
              <span style={{ fontSize: '0.78rem', color: '#f59e0b', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Star size={13} fill="#f59e0b" /> 4.9/5 Average Rating
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { name: 'Amit Sharma', rating: 5, date: '2 days ago', comment: 'Excellent jet cleaning! The technician Rajesh was very polite and cleaned the AC thoroughly.' },
                { name: 'Priya Verma', rating: 5, date: '1 week ago', comment: 'Super fast arrival within 30 mins. Cooling performance improved instantly after foam cleaning.' },
                { name: 'Rahul Gupta', rating: 4, date: '2 weeks ago', comment: 'Great service quality and clean job done. Highly recommended!' }
              ].map((rev, idx) => (
                <div key={idx} style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--text-primary)' }}>{rev.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{rev.date}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginBottom: '4px' }}>
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} size={11} fill="#f59e0b" color="#f59e0b" />
                    ))}
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                    "{rev.comment}"
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Safety & Guarantee Notice */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            background: '#eff6ff',
            padding: '14px 16px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid #bfdbfe'
          }}>
            <AlertCircle size={18} color="#2563eb" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.78rem', color: '#1e40af', lineHeight: 1.4 }}>
              <strong>NOROZZ Protection Promise:</strong> Fixed upfront transparent pricing with zero hidden doorstep fees. 100% money back guarantee if not satisfied!
            </div>
          </div>

        </div>

        {/* Modal Bottom Footer Actions */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--border-light)',
          background: '#ffffff',
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          justify: 'flex-end'
        }}>
          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ fontWeight: '700' }}
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              onBookNow(service);
            }}
            className="btn btn-primary"
            style={{ fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={16} /> Book This Service ({price})
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailsModal;
