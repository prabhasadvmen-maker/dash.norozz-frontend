import React from 'react';
import { Crown, Building2, Briefcase, Smartphone } from 'lucide-react';

const RoleSelector = ({ selectedRole, onSelectRole }) => {
  const roles = [
    { id: 'superadmin', label: 'Super Admin', icon: Crown, color: '#7c3aed' },
    { id: 'admin', label: 'Admin', icon: Building2, color: '#2563eb' },
    { id: 'partner', label: 'Partner', icon: Briefcase, color: '#ec4899' },
    { id: 'customer', label: 'Customer', icon: Smartphone, color: '#10b981' },
  ];

  return (
    <div style={{ marginBottom: '24px' }}>
      <label className="form-label" style={{ textAlign: 'center', display: 'block', marginBottom: '10px' }}>
        Select Account Role to Sign In / Register
      </label>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '6px',
        background: '#f1f5f9',
        padding: '6px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-light)'
      }}>
        {roles.map((role) => {
          const Icon = role.icon;
          const isActive = selectedRole === role.id;
          return (
            <button
              key={role.id}
              type="button"
              onClick={() => onSelectRole(role.id)}
              style={{
                background: isActive ? '#ffffff' : 'transparent',
                color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                border: isActive ? '1px solid #cbd5e1' : '1px solid transparent',
                borderRadius: 'var(--radius-md)',
                padding: '8px 4px',
                fontSize: '0.78rem',
                fontWeight: isActive ? '800' : '600',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <Icon size={16} color={isActive ? role.color : '#94a3b8'} />
              <span>{role.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default RoleSelector;
