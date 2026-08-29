import React, { useState } from 'react';
import {
  ArrowLeft,
  Search,
  Box,
  CreditCard,
  Truck,
  User,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  PhoneCall,
  Sparkles,
} from 'lucide-react';
import { toast } from '../../utils/toast.js';

const CustomerHelpCenterView = ({ onBack, onOpenAIChat }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFaqId, setExpandedFaqId] = useState('faq-1'); // Default first expanded as in mockup

  const categories = [
    { id: 'orders', label: 'Orders', icon: Box, color: '#10b981' },
    { id: 'payment', label: 'Payment', icon: CreditCard, color: '#3b82f6' },
    { id: 'delivery', label: 'Delivery', icon: Truck, color: '#06b6d4' },
    { id: 'profile', label: 'Profile', icon: User, color: '#a855f7' },
  ];

  const faqs = [
    {
      id: 'faq-1',
      category: 'orders',
      question: 'How do I track my active order?',
      answer: "Go to your orders history in your profile, find your active order, and select 'Track Shipment'. You'll see real-time updates of our delivery partner.",
    },
    {
      id: 'faq-2',
      category: 'payment',
      question: 'What is your return and refund policy?',
      answer: 'Services can be cancelled free of charge up to 2 hours before the scheduled time slot. Refunds are credited instantly to your NOROZZ Wallet.',
    },
    {
      id: 'faq-3',
      category: 'profile',
      question: 'How do I change my delivery address?',
      answer: 'Go to Profile > Saved Addresses to add or edit your address before booking a service or during checkout.',
    },
    {
      id: 'faq-4',
      category: 'orders',
      question: 'Can I upgrade my plan mid-month?',
      answer: 'Yes, NOROZZ PLUS membership plans can be upgraded anytime from the Home page with instant pro-rata benefits.',
    },
    {
      id: 'faq-5',
      category: 'payment',
      question: 'What payment methods are supported?',
      answer: 'We accept UPI (Google Pay, PhonePe, Paytm), Credit & Debit Cards, Net Banking, and NOROZZ Wallet credits.',
    },
    {
      id: 'faq-6',
      category: 'profile',
      question: 'How is service partner background verified?',
      answer: 'All NOROZZ technicians undergo mandatory Aadhaar & Police KYC verification and 8-step technical skill assessment before onboarding.',
    },
  ];

  const filteredFaqs = faqs.filter((faq) => {
    if (selectedCategory !== 'all' && faq.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return faq.question.toLowerCase().includes(q) || faq.answer.toLowerCase().includes(q);
    }
    return true;
  });

  const toggleAccordion = (id) => {
    setExpandedFaqId(expandedFaqId === id ? null : id);
  };

  const handleCallSupport = () => {
    toast.info('📞 Connecting to NOROZZ 24x7 Customer Hotline (1800 200 9090)...');
    window.location.href = 'tel:18002009090';
  };

  return (
    <div
      style={{
        maxWidth: '540px',
        margin: '0 auto',
        background: '#090d16',
        color: '#ffffff',
        borderRadius: '24px',
        padding: '24px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
        border: '1px solid #1e293b',
        minHeight: '620px',
        display: 'flex',
        flexDirection: 'column',
        justify: 'space-between',
      }}
    >
      <div>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <button
            type="button"
            onClick={onBack}
            style={{
              background: '#1e293b',
              border: 'none',
              color: '#94a3b8',
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: '#ffffff' }}>Help Center</h2>
          <div style={{ width: '38px' }} />
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative', marginBottom: '24px' }}>
          <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for questions, orders..."
            style={{
              width: '100%',
              background: '#0f172a',
              border: '1px solid #1e293b',
              borderRadius: '16px',
              padding: '14px 16px 14px 48px',
              fontSize: '0.9rem',
              color: '#ffffff',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Support Categories Section */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#ffffff', marginBottom: '14px' }}>
            Support Categories
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            {categories.map((cat) => {
              const IconComp = cat.icon;
              const isSel = selectedCategory === cat.id;
              return (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCategory(isSel ? 'all' : cat.id)}
                  style={{
                    background: isSel ? 'rgba(16, 185, 129, 0.15)' : '#0f172a',
                    border: isSel ? '2px solid #10b981' : '1px solid #1e293b',
                    borderRadius: '16px',
                    padding: '16px 8px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 8px auto',
                      color: cat.color,
                    }}
                  >
                    <IconComp size={20} />
                  </div>
                  <span style={{ fontSize: '0.78rem', fontWeight: '700', color: isSel ? '#10b981' : '#cbd5e1' }}>
                    {cat.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Frequently Asked Questions Accordion List */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#ffffff' }}>
              Frequently Asked Questions
            </div>
            {selectedCategory !== 'all' && (
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                style={{ background: 'none', border: 'none', color: '#10b981', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer' }}
              >
                Clear Filter
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredFaqs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 16px', background: '#0f172a', borderRadius: '16px', color: '#64748b', fontSize: '0.84rem' }}>
                No matching questions found for "{searchQuery}".
              </div>
            ) : (
              filteredFaqs.map((faq) => {
                const isExpanded = expandedFaqId === faq.id;
                return (
                  <div
                    key={faq.id}
                    style={{
                      background: '#0f172a',
                      borderRadius: '16px',
                      border: isExpanded ? '1.5px solid #10b981' : '1px solid #1e293b',
                      overflow: 'hidden',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div
                      onClick={() => toggleAccordion(faq.id)}
                      style={{
                        padding: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                      }}
                    >
                      <span style={{ fontSize: '0.9rem', fontWeight: '800', color: '#ffffff', paddingRight: '12px' }}>
                        {faq.question}
                      </span>
                      {isExpanded ? <ChevronUp size={18} color="#10b981" /> : <ChevronDown size={18} color="#94a3b8" />}
                    </div>

                    {isExpanded && (
                      <div
                        style={{
                          padding: '0 16px 16px 16px',
                          fontSize: '0.83rem',
                          color: '#94a3b8',
                          lineHeight: 1.5,
                          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                          paddingTop: '12px',
                        }}
                      >
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Bottom Action Buttons (Chat with Us & Call Support) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '32px' }}>
        {/* Chat with Us */}
        <button
          type="button"
          onClick={onOpenAIChat}
          style={{
            padding: '14px',
            borderRadius: '16px',
            background: '#10b981',
            color: '#ffffff',
            border: 'none',
            fontSize: '0.9rem',
            fontWeight: '800',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 6px 18px rgba(16, 185, 129, 0.25)',
          }}
        >
          <MessageSquare size={18} /> Chat with Us
        </button>

        {/* Call Support */}
        <button
          type="button"
          onClick={handleCallSupport}
          style={{
            padding: '14px',
            borderRadius: '16px',
            background: 'transparent',
            color: '#ffffff',
            border: '1.5px solid #1e293b',
            fontSize: '0.9rem',
            fontWeight: '800',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <PhoneCall size={18} color="#10b981" /> Call Support
        </button>
      </div>
    </div>
  );
};

export default CustomerHelpCenterView;
