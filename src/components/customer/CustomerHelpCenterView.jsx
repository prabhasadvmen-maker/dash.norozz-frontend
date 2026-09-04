import React, { useState, useEffect } from 'react';
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
  Send,
  HelpCircle,
  ShieldCheck,
  CheckCircle2,
  Mail,
  MessageCircle,
  FileText
} from 'lucide-react';
import { customerService } from '../../services/customer.service.js';
import { toast } from '../../utils/toast.js';

const CustomerHelpCenterView = ({ onBack, onOpenAIChat }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFaqId, setExpandedFaqId] = useState(null);

  // Ticket Form state
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketCategory, setTicketCategory] = useState('Booking & Delay');
  const [ticketBookingId, setTicketBookingId] = useState('');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [submittingTicket, setSubmittingTicket] = useState(false);

  // Live FAQs State
  const [faqs, setFaqs] = useState([]);
  const [loadingFaqs, setLoadingFaqs] = useState(true);

  useEffect(() => {
    customerService
      .getFaqs()
      .then((res) => {
        const list = res.data?.data || res.data || [];
        const validList = Array.isArray(list) ? list : [];
        setFaqs(validList);
        if (validList.length > 0) {
          setExpandedFaqId(validList[0]._id);
        }
      })
      .catch((err) => {
        console.warn('Could not fetch customer FAQs:', err);
      })
      .finally(() => {
        setLoadingFaqs(false);
      });
  }, []);

  const baseCategories = [
    { id: 'all', label: 'All Topics' },
    { id: 'General', label: 'General' },
    { id: 'Booking & Order', label: 'Booking & Orders' },
    { id: 'Payment & Wallet', label: 'Payment & Wallet' },
    { id: 'Cancellation & Refund', label: 'Cancellation & Refund' },
    { id: 'Account & Safety', label: 'Account & Safety' },
  ];

  const uniqueFaqCats = Array.from(new Set(faqs.map(f => f.category).filter(Boolean)));
  uniqueFaqCats.forEach(cat => {
    if (!baseCategories.some(c => c.id === cat)) {
      baseCategories.push({ id: cat, label: cat });
    }
  });

  const categories = baseCategories;

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
    toast.info('📞 Connecting to Norozz Customer Hotline (1800-200-9090)...');
    window.location.href = 'tel:18002009090';
  };

  const handleWhatsAppSupport = () => {
    const text = 'Hi Norozz Support, I need help with my service booking.';
    window.open(`https://api.whatsapp.com/send?phone=919876543210&text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleEmailSupport = () => {
    window.location.href = 'mailto:support@norozz.com?subject=Customer Support Inquiry';
  };

  // User Raised Tickets State
  const [userTickets, setUserTickets] = useState([]);

  const fetchUserTickets = () => {
    customerService
      .getTickets()
      .then((res) => {
        const list = res.data?.data || res.data || [];
        if (Array.isArray(list)) setUserTickets(list);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchUserTickets();
  }, []);

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) {
      toast.error('Please enter subject and message description.');
      return;
    }
    setSubmittingTicket(true);
    try {
      const res = await customerService.createTicket({
        category: ticketCategory,
        bookingId: ticketBookingId,
        subject: ticketSubject,
        description: ticketMessage,
      });
      const created = res.data?.data || res.data;
      const tId = created?.ticketId || 'TK-SUBMITTED';
      toast.success(`🎉 Support Ticket Created! Ticket ID: #${tId}`);
      setTicketSubject('');
      setTicketMessage('');
      setTicketBookingId('');
      setShowTicketForm(false);
      fetchUserTickets();
    } catch (err) {
      console.error('Failed to submit ticket:', err);
      toast.error(err.response?.data?.message || 'Failed to submit support ticket.');
    } finally {
      setSubmittingTicket(false);
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '30px' }}>
      
      {/* 1. Hero Search Banner */}
      <div style={{
        background: '#0b132b',
        borderRadius: '24px',
        padding: '36px',
        color: '#ffffff',
        marginBottom: '28px',
        boxShadow: '0 16px 36px rgba(11,19,43,0.25)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          {onBack && (
            <button
              onClick={onBack}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: '#ffffff',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <ArrowLeft size={18} />
            </button>
          )}

          <span style={{ background: 'rgba(37, 99, 235, 0.3)', color: '#60a5fa', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '800', border: '1px solid rgba(96, 165, 250, 0.3)' }}>
            24x7 CUSTOMER HELP CENTER
          </span>
        </div>

        <h1 style={{ fontSize: '1.8rem', fontWeight: '900', margin: '0 0 8px 0', color: '#ffffff' }}>
          How can we help you today?
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#94a3b8', margin: '0 0 24px 0', maxWidth: '600px' }}>
          Search our knowledge base, explore frequently asked questions, or connect with our live support team instantly.
        </p>

        {/* Live Search Bar */}
        <div style={{ position: 'relative', maxWidth: '640px' }}>
          <Search size={20} color="#94a3b8" style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions (e.g. tracking, cancellation, refund)..."
            style={{
              width: '100%',
              background: '#ffffff',
              border: 'none',
              borderRadius: '16px',
              padding: '16px 20px 16px 52px',
              fontSize: '0.95rem',
              color: '#0f172a',
              outline: 'none',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
            }}
          />
        </div>
      </div>

      {/* 2. Quick Contact Channels Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        
        {/* Card 1: AI Live Chat */}
        <div
          onClick={onOpenAIChat}
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '20px',
            padding: '20px',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}
        >
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', flexShrink: 0 }}>
            <MessageSquare size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: '900', color: '#0f172a' }}>Live AI Support Chat</div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>Instant automated help 24/7</div>
          </div>
        </div>

        {/* Card 2: Phone Hotline */}
        <div
          onClick={handleCallSupport}
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '20px',
            padding: '20px',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}
        >
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a', flexShrink: 0 }}>
            <PhoneCall size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: '900', color: '#0f172a' }}>Call Support Hotline</div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>1800 200 9090 (Toll Free)</div>
          </div>
        </div>

        {/* Card 3: WhatsApp Support */}
        <div
          onClick={handleWhatsAppSupport}
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '20px',
            padding: '20px',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}
        >
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', flexShrink: 0 }}>
            <MessageCircle size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: '900', color: '#0f172a' }}>WhatsApp Chat</div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>Chat on WhatsApp</div>
          </div>
        </div>

        {/* Card 4: Submit Ticket */}
        <div
          onClick={() => setShowTicketForm(!showTicketForm)}
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '20px',
            padding: '20px',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}
        >
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#faf5ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9333ea', flexShrink: 0 }}>
            <FileText size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: '900', color: '#0f172a' }}>Submit Ticket</div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>Raise a support issue</div>
          </div>
        </div>

      </div>

      {/* 3. Submit Support Ticket Form Expansion */}
      {showTicketForm && (
        <div style={{ background: '#ffffff', borderRadius: '24px', padding: '28px', border: '2px solid #2563eb', marginBottom: '32px', boxShadow: '0 8px 24px rgba(37,99,235,0.12)' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0f172a', margin: '0 0 6px 0' }}>
            Submit a Support Ticket
          </h3>
          <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '0 0 20px 0' }}>
            Our customer response team will review your request and reply within 1 hour.
          </p>

          <form onSubmit={handleSubmitTicket} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#334155', display: 'block', marginBottom: '6px' }}>Issue Category</label>
              <select
                value={ticketCategory}
                onChange={(e) => setTicketCategory(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
              >
                <option value="Booking & Delay">Booking & Technician Delay</option>
                <option value="Payment & Refund">Payment or Wallet Refund</option>
                <option value="Service Quality">Service Quality & Warranty</option>
                <option value="Other Issue">Other Complaint</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#334155', display: 'block', marginBottom: '6px' }}>Booking ID (Optional)</label>
              <input
                type="text"
                placeholder="e.g. BK-984210"
                value={ticketBookingId}
                onChange={(e) => setTicketBookingId(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#334155', display: 'block', marginBottom: '6px' }}>Subject Summary</label>
              <input
                type="text"
                placeholder="Briefly state your concern..."
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                required
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#334155', display: 'block', marginBottom: '6px' }}>Detailed Description</label>
              <textarea
                rows={4}
                placeholder="Describe your issue in detail..."
                value={ticketMessage}
                onChange={(e) => setTicketMessage(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', resize: 'vertical' }}
                required
              />
            </div>

            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '12px' }}>
              <button
                type="submit"
                disabled={submittingTicket}
                style={{
                  background: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 24px',
                  fontSize: '0.9rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Send size={16} /> Submit Support Ticket
              </button>

              <button
                type="button"
                onClick={() => setShowTicketForm(false)}
                style={{
                  background: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  borderRadius: '12px',
                  padding: '12px 24px',
                  fontSize: '0.9rem',
                  fontWeight: '800',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* User Tickets History */}
      {userTickets.length > 0 && (
        <div style={{ background: '#ffffff', borderRadius: '24px', padding: '24px', border: '1px solid #e2e8f0', marginBottom: '28px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0f172a', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={20} color="#2563eb" /> My Support Tickets ({userTickets.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {userTickets.map((t) => (
              <div key={t._id || t.ticketId} style={{ border: '1px solid #e2e8f0', borderRadius: '16px', padding: '16px 20px', background: '#f8fafc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: '900', fontSize: '0.88rem', color: '#2563eb' }}>#{t.ticketId}</span>
                    <span style={{ fontSize: '0.78rem', background: '#e2e8f0', padding: '2px 8px', borderRadius: '6px', fontWeight: '700', color: '#475569' }}>{t.category}</span>
                  </div>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: '800',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    background: t.status === 'Resolved' ? '#dcfce7' : t.status === 'In Progress' ? '#fef3c7' : '#fee2e2',
                    color: t.status === 'Resolved' ? '#15803d' : t.status === 'In Progress' ? '#b45309' : '#b91c1c'
                  }}>
                    {t.status.toUpperCase()}
                  </span>
                </div>
                <div style={{ fontWeight: '800', fontSize: '0.92rem', color: '#0f172a', marginBottom: '4px' }}>{t.subject}</div>
                <div style={{ fontSize: '0.84rem', color: '#475569', lineHeight: '1.5' }}>{t.description}</div>
                {t.adminNote && (
                  <div style={{ marginTop: '12px', background: '#eff6ff', borderLeft: '4px solid #2563eb', padding: '10px 14px', borderRadius: '0 8px 8px 0', fontSize: '0.82rem', color: '#1e40af' }}>
                    <strong>Norozz Support Reply ({t.resolvedBy || 'Admin'}):</strong> {t.adminNote}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Category Pills */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '24px', paddingBottom: '4px' }}>
        {categories.map((cat) => {
          const isSel = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                padding: '10px 18px',
                borderRadius: '20px',
                border: isSel ? '2px solid #2563eb' : '1px solid #e2e8f0',
                background: isSel ? '#eff6ff' : '#ffffff',
                color: isSel ? '#2563eb' : '#475569',
                fontWeight: isSel ? '800' : '600',
                fontSize: '0.84rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* 5. Frequently Asked Questions Accordion List */}
      <div style={{ background: '#ffffff', borderRadius: '24px', padding: '28px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0f172a', margin: '0 0 20px 0' }}>
          Frequently Asked Questions (FAQs)
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredFaqs.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: '#64748b', fontSize: '0.88rem' }}>
              No matching questions found. Try a different search term or category.
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const faqKey = faq._id || faq.id;
              const isExpanded = expandedFaqId === faqKey;
              return (
                <div
                  key={faqKey}
                  style={{
                    background: isExpanded ? '#f8fafc' : '#ffffff',
                    borderRadius: '16px',
                    border: isExpanded ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                    overflow: 'hidden',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div
                    onClick={() => toggleAccordion(faqKey)}
                    style={{
                      padding: '18px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer'
                    }}
                  >
                    <span style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', paddingRight: '12px' }}>
                      {faq.question}
                    </span>
                    {isExpanded ? <ChevronUp size={18} color="#2563eb" /> : <ChevronDown size={18} color="#94a3b8" />}
                  </div>

                  {isExpanded && (
                    <div style={{ padding: '0 20px 18px 20px', fontSize: '0.88rem', color: '#475569', lineHeight: 1.5, borderTop: '1px solid #f1f5f9', paddingTop: '12px', whiteSpace: 'pre-line' }}>
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
  );
};

export default CustomerHelpCenterView;
