import React from 'react';
import { Calendar, HelpCircle, MessageSquare, PhoneCall } from 'lucide-react';
import { toast } from '../../utils/toast.js';

const PartnerQuickActions = ({ onNavigateTab }) => {
  const actions = [
    {
      id: 'bookings',
      title: 'My Bookings',
      icon: Calendar,
      color: '#16a34a',
      bgColor: '#ecfdf5',
      action: () => onNavigateTab && onNavigateTab('bookings'),
    },
    {
      id: 'help',
      title: 'Help Center',
      icon: HelpCircle,
      color: '#64748b',
      bgColor: '#f1f5f9',
      action: () => onNavigateTab && onNavigateTab('support'),
    },
    {
      id: 'chat',
      title: 'Live Chat',
      icon: MessageSquare,
      color: '#0d9488',
      bgColor: '#ccfbf1',
      action: () => toast.info('Connecting to Partner Operations Live Chat...'),
    },
    {
      id: 'support',
      title: 'Support',
      icon: PhoneCall,
      color: '#2563eb',
      bgColor: '#eff6ff',
      action: () => toast.info('Calling Operations Helpline: +91 1800 200 9090'),
    },
  ];

  return (
    <div style={{ marginBottom: '24px' }}>
      <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '14px', color: 'var(--text-primary)' }}>
        Quick Actions
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        {actions.map((item) => {
          const IconComponent = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={item.action}
              className="btn"
              style={{
                background: '#ffffff',
                borderRadius: 'var(--radius-lg)',
                padding: '16px 20px',
                border: '1px solid var(--border-light)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                width: '100%'
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: item.bgColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <IconComponent size={20} color={item.color} />
              </div>

              <span style={{ fontSize: '0.92rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                {item.title}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PartnerQuickActions;
