import { Wind, Sparkles, Scissors, Wrench, Zap, UserCheck, ArrowUpRight } from 'lucide-react';
import { useCustomer } from '../../hooks/useCustomer.js';

// Decorative icon/colour rotation only; names, images and prices always come from the admin's catalogue
const STYLES = [
  { icon: Wind, color: '#10b981', bg: '#ecfdf5' },
  { icon: Sparkles, color: '#059669', bg: '#d1fae5' },
  { icon: Scissors, color: '#ec4899', bg: '#fce7f3' },
  { icon: Wrench, color: '#2563eb', bg: '#dbeafe' },
  { icon: Zap, color: '#d97706', bg: '#fef3c7' },
  { icon: UserCheck, color: '#8b5cf6', bg: '#f3e8ff' },
];

const PopularCategories = ({ selectedCategory, onSelectCategory, limit = null }) => {
  const { categories, isLoading } = useCustomer();
  const list = limit ? categories.slice(0, limit) : categories;

  const isSelectedCat = (cat) =>
    Boolean(selectedCategory) && (
      (typeof selectedCategory === 'object' && selectedCategory._id === cat._id) ||
      selectedCategory === cat.name
    );

  return (
    <section style={{ marginBottom: '36px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '18px' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>What are you looking for today?</h2>
          <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '2px 0 0 0' }}>Pick a category to see packages and prices</p>
        </div>
        {selectedCategory && (
          <button
            type="button"
            onClick={() => onSelectCategory?.(null)}
            style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#0f172a', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', padding: '6px 14px', borderRadius: '9999px' }}
          >
            Show all categories
          </button>
        )}
      </div>

      {isLoading && list.length === 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '16px' }}>
          {[0, 1, 2, 3].map((i) => <div key={i} style={{ height: '150px', borderRadius: '16px', background: '#f1f5f9' }} />)}
        </div>
      ) : list.length === 0 ? (
        <div style={{ padding: '32px 16px', textAlign: 'center', color: '#64748b', background: '#ffffff', border: '1px dashed #cbd5e1', borderRadius: '16px', fontSize: '0.9rem', fontWeight: '600' }}>
          Services are being set up in your area. Please check back soon.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '16px' }}>
          {list.map((cat, idx) => {
            const style = STYLES[idx % STYLES.length];
            const Icon = style.icon;
            const selected = isSelectedCat(cat);
            const startingPrice = Number(cat.startingPrice ?? cat.price);
            return (
              <button
                key={cat._id || cat.name}
                type="button"
                onClick={() => onSelectCategory?.(selected ? null : cat)}
                aria-pressed={selected}
                style={{
                  background: selected ? '#ecfdf5' : '#ffffff',
                  border: selected ? '2px solid #10b981' : '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '18px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  {cat.image ? (
                    <img src={cat.image} alt="" style={{ width: '46px', height: '46px', borderRadius: '12px', objectFit: 'cover', background: style.bg }} />
                  ) : (
                    <span style={{ width: '46px', height: '46px', borderRadius: '12px', background: style.bg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={22} color={style.color} />
                    </span>
                  )}
                  {Number.isFinite(startingPrice) && startingPrice > 0 && (
                    <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#047857', background: '#ecfdf5', padding: '3px 8px', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                      From ₹{startingPrice.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
                <div>
                  <h3 style={{ fontSize: '0.98rem', fontWeight: '800', color: '#0f172a', margin: 0, lineHeight: 1.3 }}>{cat.name}</h3>
                  {(cat.description || cat.subtitle) && (
                    <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '4px 0 0 0', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {cat.description || cat.subtitle}
                    </p>
                  )}
                </div>
                <span style={{ marginTop: 'auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '800', color: '#059669' }}>
                  {selected ? 'Selected ✓' : 'View services'} <ArrowUpRight size={16} />
                </span>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default PopularCategories;
