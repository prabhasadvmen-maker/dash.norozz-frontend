import React from 'react';
import { Star, Plus, Clock, ShieldCheck } from 'lucide-react';

const FeaturedServices = () => {
  const services = [
    {
      id: 1,
      title: 'AC Foam Jet Deep Cleaning',
      rating: '4.85 (14.2k)',
      price: '₹599',
      originalPrice: '₹899',
      duration: '45 mins',
      tag: 'BESTSELLER'
    },
    {
      id: 2,
      title: 'Elegance Facial & Spa Salon',
      rating: '4.92 (8.4k)',
      price: '₹1,299',
      originalPrice: '₹1,699',
      duration: '60 mins',
      tag: 'TRENDING'
    },
    {
      id: 3,
      title: 'Full Home Deep Cleaning 3BHK',
      rating: '4.80 (6.1k)',
      price: '₹4,499',
      originalPrice: '₹5,999',
      duration: '4 hrs',
      tag: 'MOST POPULAR'
    },
    {
      id: 4,
      title: 'Tap & Plumbing Leak Repair',
      rating: '4.78 (12k)',
      price: '₹299',
      originalPrice: '₹499',
      duration: '30 mins',
      tag: 'EXPRESS'
    },
  ];

  return (
    <div style={{ marginBottom: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
          Featured Services
        </h3>
        <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--accent-blue)', cursor: 'pointer' }}>
          See All
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        {services.map((service) => (
          <div key={service.id} className="mui-card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="badge badge-purple" style={{ fontSize: '0.62rem', padding: '2px 6px' }}>
                  {service.tag}
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '2px' }}>
                  <Star size={12} fill="#f59e0b" /> {service.rating}
                </span>
              </div>

              <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '4px' }}>
                {service.title}
              </h4>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '14px' }}>
                <Clock size={12} /> {service.duration} • 30-Day Guarantee
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid var(--border-light)' }}>
              <div>
                <span style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-primary)' }}>{service.price}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'line-through', marginLeft: '6px' }}>{service.originalPrice}</span>
              </div>
              <button className="btn btn-secondary btn-sm" style={{ borderColor: 'var(--accent-blue)', color: 'var(--accent-blue)', fontWeight: '800' }}>
                <Plus size={14} /> Add
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedServices;
