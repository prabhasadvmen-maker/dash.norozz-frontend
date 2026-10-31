import { Star, Plus } from 'lucide-react';

// Only real services from the catalogue are shown; with none, the section is hidden instead of showing sample data
const FeaturedServices = ({ popularServices = [], onBookService }) => {
  const list = (popularServices || []).slice(0, 8);
  if (list.length === 0) return null;

  return (
    <section style={{ marginBottom: '36px' }}>
      <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0f172a', margin: '0 0 18px 0' }}>Popular services</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
        {list.map((service) => {
          const title = service.name || service.title;
          const price = Number(service.finalPrice ?? service.price);
          const image = service.thumbnail || service.image;
          const rating = Number(service.rating);
          const reviews = service.reviews ?? service.totalReviews;

          return (
            <div key={service._id || title} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 1px 3px rgba(15,23,42,0.04)' }}>
              {image && (
                <div style={{ height: '140px', background: '#f1f5f9' }}>
                  <img src={image} alt={title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                </div>
              )}

              <div style={{ padding: '14px 16px', flex: 1 }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0', lineHeight: 1.3 }}>{title}</h3>
                {Number.isFinite(rating) && rating > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: '#64748b' }}>
                    <Star size={13} fill="#f59e0b" color="#f59e0b" />
                    <span style={{ fontWeight: '800', color: '#0f172a' }}>{rating.toFixed(1)}</span>
                    {reviews ? <span>({reviews})</span> : null}
                  </div>
                )}
              </div>

              <div style={{ padding: '12px 16px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  {Number.isFinite(price) && price > 0 ? (
                    <>
                      <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>Starts at</span>
                      <span style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a' }}>₹{price.toLocaleString('en-IN')}</span>
                    </>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>See packages</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onBookService?.({ ...service, title })}
                  style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', padding: '6px 14px', fontSize: '0.82rem', fontWeight: '800', color: '#047857', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <Plus size={14} /> Book
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default FeaturedServices;
