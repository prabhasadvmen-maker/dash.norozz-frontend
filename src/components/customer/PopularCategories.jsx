import React from 'react';
import {
  Wind,
  Sparkles,
  Scissors,
  UserCheck,
  Wrench,
  Paintbrush,
  Zap,
  Bug
} from 'lucide-react';
import { useCustomer } from '../../hooks/useCustomer.js';

const PopularCategories = () => {
  const { categories } = useCustomer();

  const fallbackCategories = [
    { name: 'AC & Appliance', icon: Wind, color: '#2563eb', bg: '#eff6ff' },
    { name: 'Home Cleaning', icon: Sparkles, color: '#7c3aed', bg: '#f5f3ff' },
    { name: 'Women Salon', icon: Scissors, color: '#ec4899', bg: '#fdf2f8' },
    { name: 'Men Salon', icon: UserCheck, color: '#06b6d4', bg: '#ecfeff' },
    { name: 'Plumbing', icon: Wrench, color: '#10b981', bg: '#ecfdf5' },
    { name: 'Electrician', icon: Zap, color: '#f59e0b', bg: '#fffbe6' },
    { name: 'Painting', icon: Paintbrush, color: '#6366f1', bg: '#eef2ff' },
    { name: 'Pest Control', icon: Bug, color: '#ef4444', bg: '#fef2f2' },
  ];

  const displayList = categories.length > 0 ? categories : fallbackCategories;

  return (
    <div style={{ marginBottom: '32px' }}>
      <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '16px', color: 'var(--text-primary)' }}>
        Popular Categories
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '14px' }}>
        {displayList.map((cat, idx) => {
          const Icon = cat.icon || Wind;
          const bgColors = ['#eff6ff', '#f5f3ff', '#fdf2f8', '#ecfeff', '#ecfdf5', '#fffbe6'];
          const iconColors = ['#2563eb', '#7c3aed', '#ec4899', '#06b6d4', '#10b981', '#f59e0b'];
          const color = cat.color || iconColors[idx % iconColors.length];
          const bg = cat.bg || bgColors[idx % bgColors.length];

          return (
            <div
              key={cat._id || idx}
              className="mui-card"
              style={{
                padding: '16px 10px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: '8px',
                cursor: 'pointer'
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
                boxShadow: 'var(--shadow-sm)'
              }}>
                <Icon size={22} color={color} />
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
