import React from 'react';
import { Star, Plus } from 'lucide-react';

const FeaturedServices = ({ popularServices = [], onBookService }) => {
  const fallbackServices = [
    {
      _id: 's1',
      title: 'Sofa Deep Cleaning',
      rating: '4.87',
      reviews: '22k reviews',
      price: '₹699',
      image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop'
    },
    {
      _id: 's2',
      title: 'Foam Jet AC Service',
      rating: '4.89',
      reviews: '35k reviews',
      price: '₹799',
      image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop'
    },
    {
      _id: 's3',
      title: 'Classic Haircut (Men)',
      rating: '4.84',
      reviews: '18k reviews',
      price: '₹249',
      image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&auto=format&fit=crop'
    },
    {
      _id: 's4',
      title: 'Deep Bath & Toilet Cleaning',
      rating: '4.85',
      reviews: '30k reviews',
      price: '₹399',
      image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop'
    }
  ];

  const listToDisplay = popularServices && popularServices.length > 0
    ? popularServices.slice(0, 4)
    : fallbackServices;

  return (
    <div style={{ marginBottom: '36px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#0f172a', margin: 0 }}>
          Top Rated Services
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        {listToDisplay.map((service, idx) => {
          const fallback = fallbackServices[idx % fallbackServices.length];
          const title = service.name || service.title || fallback.title;
          const priceVal = service.finalPrice ? `₹${service.finalPrice}` : (service.price ? (typeof service.price === 'number' ? `₹${service.price}` : service.price) : fallback.price);
          const rating = service.rating || fallback.rating;
          const reviews = service.reviews ? `${service.reviews}` : fallback.reviews;
          const image = service.thumbnail || service.image || fallback.image;

          return (
            <div
              key={service._id || idx}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                transition: 'all 0.2s ease'
              }}
            >
              <div>
                <div style={{ height: '140px', width: '100%', overflow: 'hidden', background: '#f1f5f9' }}>
                  <img
                    src={image}
                    alt={title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                <div style={{ padding: '16px' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0' }}>
                    {title}
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.76rem', color: '#64748b' }}>
                    <Star size={13} fill="#f59e0b" color="#f59e0b" />
                    <span style={{ fontWeight: '800', color: '#0f172a' }}>{rating}</span>
                    <span>({reviews})</span>
                  </div>
                </div>
              </div>

              <div style={{
                padding: '12px 16px',
                borderTop: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>Starts at</span>
                  <span style={{ fontSize: '1rem', fontWeight: '900', color: '#0f172a' }}>{priceVal}</span>
                </div>

                <button
                  onClick={() => onBookService && onBookService({ ...service, title, price: priceVal })}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '6px 16px',
                    fontSize: '0.82rem',
                    fontWeight: '800',
                    color: '#0f172a',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Plus size={14} /> Add
                </button>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FeaturedServices;
