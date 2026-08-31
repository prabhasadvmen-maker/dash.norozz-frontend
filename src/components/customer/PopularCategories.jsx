import {
  Wind,
  Sparkles,
  Scissors,
  Wrench,
  Tv,
  UserCheck,
  ArrowUpRight
} from 'lucide-react';
import { useCustomer } from '../../hooks/useCustomer.js';

const PopularCategories = ({ selectedCategory, onSelectCategory }) => {
  const { categories } = useCustomer();

  const presetSubtitles = {
    'AC & Appliance Repair': 'Foam jet cleaning & gas refill',
    'Full Home Deep Cleaning': 'Sanitization & sofa vacuuming',
    'Salon for Women & Spa': 'Facial, waxing & mani-pedi',
    'Appliance Repair': 'TV, Fridge, Washing Machine',
    'Plumbing & Leakage Repair': 'Tap repair & drainage fix',
    'Salon for Men & Grooming': 'Haircut, beard trim & massage'
  };

  const defaultCategoryPresets = [
    { name: 'AC & Appliance Repair', subtitle: 'Foam jet wash & gas refill', icon: Wind, color: '#10b981', bg: '#ecfdf5', price: '₹599' },
    { name: 'Full Home Deep Cleaning', subtitle: 'Deep house & sofa vacuuming', icon: Sparkles, color: '#059669', bg: '#d1fae5', price: '₹1,499' },
    { name: 'Salon for Women & Spa', subtitle: 'Facials, waxing & mani-pedi', icon: Scissors, color: '#ec4899', bg: '#fce7f3', price: '₹399' },
    { name: 'Plumbing & Leakage Repair', subtitle: 'Tap leaks & pipe fittings', icon: Wrench, color: '#2563eb', bg: '#dbeafe', price: '₹299' },
    { name: 'Electrician & Home Wiring', subtitle: 'Switchboards & fan fitting', icon: Tv, color: '#d97706', bg: '#fef3c7', price: '₹199' },
    { name: 'Salon for Men & Grooming', subtitle: 'Haircut, beard & head massage', icon: UserCheck, color: '#8b5cf6', bg: '#f3e8ff', price: '₹249' }
  ];

  const presetsColorList = [
    { color: '#10b981', bg: '#ecfdf5', icon: Wind, price: '₹599' },
    { color: '#059669', bg: '#d1fae5', icon: Sparkles, price: '₹1,499' },
    { color: '#ec4899', bg: '#fce7f3', icon: Scissors, price: '₹399' },
    { color: '#2563eb', bg: '#dbeafe', icon: Wrench, price: '₹299' },
    { color: '#d97706', bg: '#fef3c7', icon: Tv, price: '₹199' },
    { color: '#8b5cf6', bg: '#f3e8ff', icon: UserCheck, price: '₹249' }
  ];

  const listToDisplay = categories && categories.length > 0
    ? categories.slice(0, 6)
    : defaultCategoryPresets;

  return (
    <div style={{ marginBottom: '36px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
            What are you looking for today?
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '2px 0 0 0', fontWeight: '500' }}>
            Choose from our top-rated verified home service categories
          </p>
        </div>

        {selectedCategory && (
          <button
            type="button"
            onClick={() => onSelectCategory && onSelectCategory(null)}
            style={{
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              color: '#0f172a',
              fontSize: '0.8rem',
              fontWeight: '800',
              cursor: 'pointer',
              padding: '6px 14px',
              borderRadius: '9999px',
              transition: 'all 0.2s ease'
            }}
          >
            Show All Categories
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
        {listToDisplay.map((cat, idx) => {
          const stylePreset = presetsColorList[idx % presetsColorList.length];
          const IconComp = cat.iconComponent || stylePreset.icon;
          const color = cat.color || stylePreset.color;
          const bg = cat.bg || stylePreset.bg;
          const priceTag = cat.price || stylePreset.price;
          const catName = cat.name || 'Service Category';
          const subtitle = cat.subtitle || presetSubtitles[catName] || 'Verified professionals at home';

          const isSelected = selectedCategory && (
            (typeof selectedCategory === 'object' && selectedCategory._id === cat._id) ||
            selectedCategory === catName ||
            (typeof selectedCategory === 'object' && selectedCategory.name === catName)
          );

          return (
            <div
              key={cat._id || idx}
              onClick={() => onSelectCategory && onSelectCategory(isSelected ? null : cat)}
              style={{
                background: isSelected ? '#ecfdf5' : '#ffffff',
                border: isSelected ? '2px solid #10b981' : '1px solid #e2e8f0',
                borderRadius: '18px',
                padding: '20px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '14px',
                transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: isSelected ? '0 8px 24px rgba(16, 185, 129, 0.2)' : '0 4px 16px rgba(0, 0, 0, 0.03)',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 28px rgba(0, 0, 0, 0.08)';
                  e.currentTarget.style.borderColor = '#10b981';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.03)';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '14px',
                    background: bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 4px 12px ${bg}`
                  }}>
                    <IconComp size={22} color={color} />
                  </div>

                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: '800',
                    color: '#059669',
                    background: '#ecfdf5',
                    padding: '3px 8px',
                    borderRadius: '8px',
                    border: '1px solid #a7f3d0'
                  }}>
                    Starts {priceTag}
                  </span>
                </div>

                <h3 style={{ fontSize: '0.98rem', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0', lineHeight: 1.25 }}>
                  {catName}
                </h3>
                <p style={{ fontSize: '0.76rem', color: '#64748b', margin: 0, lineHeight: 1.35, fontWeight: '500' }}>
                  {subtitle}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '0.76rem', fontWeight: '800', color: '#10b981' }}>
                  {isSelected ? 'Selected ✓' : 'Book Service'}
                </span>
                <ArrowUpRight size={16} color="#10b981" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PopularCategories;
