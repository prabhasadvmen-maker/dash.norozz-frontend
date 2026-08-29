import React from 'react';
import {
  Wind,
  Sparkles,
  Scissors,
  Wrench,
  Zap,
  UserCheck,
  Tv,
  Droplets
} from 'lucide-react';
import { useCustomer } from '../../hooks/useCustomer.js';

const PopularCategories = ({ selectedCategory, onSelectCategory }) => {
  const { categories } = useCustomer();

  const presetSubtitles = {
    'AC & Appliance Repair': 'Foam jet, gas refill',
    'Full Home Deep Cleaning': 'Deep & sofa cleaning',
    'Salon for Women & Spa': 'Facial, waxing, mani-pedi',
    'Appliance Repair': 'TV, Fridge, Washing Machine',
    'Plumbing & Leakage Repair': 'Certified technicians',
    'Salon for Men & Grooming': 'Haircut, shave, massage'
  };

  const defaultCategoryPresets = [
    { name: 'AC Repair', subtitle: 'Foam jet, gas refill', icon: Wind, color: '#2563eb', bg: '#dbeafe' },
    { name: 'Home Cleaning', subtitle: 'Deep & sofa cleaning', icon: Sparkles, color: '#16a34a', bg: '#dcfce7' },
    { name: 'Women\'s Salon', subtitle: 'Facial, waxing, mani-pedi', icon: Scissors, color: '#db2777', bg: '#fce7f3' },
    { name: 'Appliance Repair', subtitle: 'TV, Fridge, Washing Machine', icon: Tv, color: '#d97706', bg: '#fef3c7' },
    { name: 'Plumbing & Elec', subtitle: 'Certified technicians', icon: Wrench, color: '#0d9488', bg: '#ccfbf1' },
    { name: 'Men\'s Grooming', subtitle: 'Haircut, shave, massage', icon: UserCheck, color: '#9333ea', bg: '#f3e8ff' }
  ];

  const presetsColorList = [
    { color: '#2563eb', bg: '#dbeafe', icon: Wind },
    { color: '#16a34a', bg: '#dcfce7', icon: Sparkles },
    { color: '#db2777', bg: '#fce7f3', icon: Scissors },
    { color: '#d97706', bg: '#fef3c7', icon: Tv },
    { color: '#0d9488', bg: '#ccfbf1', icon: Wrench },
    { color: '#9333ea', bg: '#f3e8ff', icon: UserCheck }
  ];

  const listToDisplay = categories && categories.length > 0
    ? categories.slice(0, 6)
    : defaultCategoryPresets;

  return (
    <div style={{ marginBottom: '36px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#0f172a', margin: 0 }}>
          What are you looking for today?
        </h2>
        {selectedCategory && (
          <button
            onClick={() => onSelectCategory && onSelectCategory(null)}
            style={{
              background: 'none',
              border: 'none',
              color: '#2563eb',
              fontSize: '0.82rem',
              fontWeight: '800',
              cursor: 'pointer'
            }}
          >
            Show All Categories
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '16px' }}>
        {listToDisplay.map((cat, idx) => {
          const stylePreset = presetsColorList[idx % presetsColorList.length];
          const IconComp = cat.iconComponent || stylePreset.icon;
          const color = cat.color || stylePreset.color;
          const bg = cat.bg || stylePreset.bg;
          const subtitle = cat.subtitle || presetSubtitles[cat.name] || 'Quality service at doorstep';

          const isSelected = selectedCategory && (
            (typeof selectedCategory === 'object' && selectedCategory._id === cat._id) ||
            selectedCategory === cat.name ||
            (typeof selectedCategory === 'object' && selectedCategory.name === cat.name)
          );

          return (
            <div
              key={cat._id || idx}
              onClick={() => onSelectCategory && onSelectCategory(isSelected ? null : cat)}
              style={{
                background: isSelected ? '#eff6ff' : '#f8fafc',
                border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '20px 16px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
              }}
            >
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                background: bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: color,
                overflow: 'hidden',
                flexShrink: 0
              }}>
                {cat.image ? (
                  <img src={cat.image} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <IconComp size={28} />
                )}
              </div>

              <div>
                <h3 style={{ fontSize: '0.92rem', fontWeight: '800', color: '#0f172a', margin: '0 0 3px 0' }}>
                  {cat.name}
                </h3>
                <p style={{ fontSize: '0.74rem', color: '#64748b', margin: 0, lineHeight: 1.3 }}>
                  {subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PopularCategories;
