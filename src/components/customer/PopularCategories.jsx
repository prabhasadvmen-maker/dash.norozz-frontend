import React from 'react';
import {
  Wind,
  Sparkles,
  Scissors,
  UserCheck,
  Wrench,
  Paintbrush,
  Zap,
  Bug,
  Droplets,
  ShieldCheck,
} from 'lucide-react';
import { useCustomer } from '../../hooks/useCustomer.js';

const ICON_MAP = {
  Wind,
  Sparkles,
  Scissors,
  UserCheck,
  Wrench,
  Paintbrush,
  Zap,
  Bug,
  Droplets,
  ShieldCheck,
};

const getIconComponent = (iconProp) => {
  if (!iconProp) return Wind;
  if (typeof iconProp === 'string') {
    return ICON_MAP[iconProp] || Wind;
  }
  return iconProp;
};

const PopularCategories = ({ selectedCategory, onSelectCategory }) => {
  const { categories } = useCustomer();

  const fallbackCategories = [
    { name: 'AC & Appliance Repair', icon: Wind, color: '#2563eb', bg: '#eff6ff' },
    { name: 'Full Home Deep Cleaning', icon: Sparkles, color: '#7c3aed', bg: '#f5f3ff' },
    { name: 'Salon for Women & Spa', icon: Scissors, color: '#ec4899', bg: '#fdf2f8' },
    { name: 'Salon for Men & Grooming', icon: UserCheck, color: '#06b6d4', bg: '#ecfeff' },
    { name: 'Plumbing & Leakage Repair', icon: Wrench, color: '#10b981', bg: '#ecfdf5' },
    { name: 'Electrician & Switchboard', icon: Zap, color: '#f59e0b', bg: '#fffbe6' },
    { name: 'Wall Painting & Waterproofing', icon: Paintbrush, color: '#6366f1', bg: '#eef2ff' },
    { name: 'Pest Control & Sanitization', icon: Bug, color: '#ef4444', bg: '#fef2f2' },
  ];

  const displayList = categories.length > 0 ? categories : fallbackCategories;

  return (
    <div style={{ marginBottom: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
          Popular Services
        </h3>
        {selectedCategory && (
          <button
            onClick={() => onSelectCategory && onSelectCategory(null)}
            style={{
              background: 'none',
              border: 'none',
              color: '#2563eb',
              fontSize: '0.8rem',
              fontWeight: '800',
              cursor: 'pointer'
            }}
          >
            Show All Categories
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '14px' }}>
        {displayList.map((cat, idx) => {
          const IconComponent = getIconComponent(cat.icon);
          const bgColors = ['#eff6ff', '#f5f3ff', '#fdf2f8', '#ecfeff', '#ecfdf5', '#fffbe6'];
          const iconColors = ['#2563eb', '#7c3aed', '#ec4899', '#06b6d4', '#10b981', '#f59e0b'];
          const color = cat.color || iconColors[idx % iconColors.length];
          const bg = cat.bg || bgColors[idx % bgColors.length];

          const isSelected = selectedCategory && (
            (typeof selectedCategory === 'object' && selectedCategory._id === cat._id) ||
            selectedCategory === cat.name ||
            (typeof selectedCategory === 'object' && selectedCategory.name === cat.name)
          );

          return (
            <div
              key={cat._id || idx}
              onClick={() => onSelectCategory && onSelectCategory(isSelected ? null : cat)}
              className="mui-card"
              style={{
                padding: '16px 10px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: '8px',
                cursor: 'pointer',
                border: isSelected ? '2px solid #2563eb' : '1px solid var(--border-light)',
                background: isSelected ? '#eff6ff' : 'var(--bg-card)',
                boxShadow: isSelected ? '0 4px 15px rgba(37,99,235,0.15)' : 'var(--shadow-sm)',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '14px',
                background: bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-sm)',
                overflow: 'hidden'
              }}>
                {cat.image ? (
                  <img src={cat.image} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <IconComponent size={22} color={color} />
                )}
              </div>
              <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                {cat.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PopularCategories;
