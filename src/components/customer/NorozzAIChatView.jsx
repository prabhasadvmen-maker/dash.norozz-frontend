import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Sparkles,
  Send,
  Paperclip,
  Star,
  Loader2,
  CheckCircle2,
  Calendar,
  Wallet,
  Clock,
} from 'lucide-react';
import { toast } from '../../utils/toast.js';

const NorozzAIChatView = ({ onBack, onBookService, currentUser }) => {
  const [messages, setMessages] = useState([
    {
      id: 'msg-1',
      sender: 'bot',
      text: 'Hello! I am your Norozz companion. What area of your home needs attention today?',
      timestamp: 'Just now',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Handle User Message Send & AI Response
  const handleSendMessage = (textToSend) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    const userMsg = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    // Simulate AI response thinking delay
    setTimeout(() => {
      const botResponse = generateAIResponse(query);
      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
    }, 800);
  };

  // AI Response Generator
  const generateAIResponse = (userQuery) => {
    const q = userQuery.toLowerCase();
    const ts = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    if (q.includes('kitchen') || q.includes('chimney') || q.includes('oily') || q.includes('dirt') || q.includes('tiles')) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: 'I highly recommend our Kitchen Intensive Deep Cleaning. Here is the direct details card:',
        timestamp: ts,
        serviceCard: {
          title: 'Kitchen Deep Cleaning',
          rating: '4.8',
          price: '899',
          originalPrice: '1199',
          image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80',
          category: 'Kitchen Deep Cleaning',
        },
      };
    }

    if (q.includes('ac') || q.includes('cool') || q.includes('jet') || q.includes('foam') || q.includes('servicing')) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: 'For AC cooling efficiency & air purification, our 2-in-1 Foam Jet Wash is top-rated by 14k+ customers:',
        timestamp: ts,
        serviceCard: {
          title: 'AC Foam Jet Deep Cleaning',
          rating: '4.85',
          price: '599',
          originalPrice: '799',
          image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80',
          category: 'AC & Appliance Repair',
        },
      };
    }

    if (q.includes('plumb') || q.includes('leak') || q.includes('tap') || q.includes('pipe') || q.includes('drain')) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: 'Our expert plumbers arrive within 30 minutes to fix leaks and tap installations:',
        timestamp: ts,
        serviceCard: {
          title: 'Tap & Plumbing Leak Repair',
          rating: '4.78',
          price: '299',
          originalPrice: '399',
          image: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=600&q=80',
          category: 'Plumbing & Leakage',
        },
      };
    }

    if (q.includes('full home') || q.includes('house') || q.includes('3bhk') || q.includes('2bhk') || q.includes('balcony')) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: 'Complete 3BHK house sanitization, vacuuming, window & balcony deep cleaning package:',
        timestamp: ts,
        serviceCard: {
          title: 'Full Home Deep Cleaning 3BHK',
          rating: '4.80',
          price: '4,499',
          originalPrice: '4,999',
          image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80',
          category: 'Home Deep Cleaning',
        },
      };
    }

    if (q.includes('price') || q.includes('pricing') || q.includes('rate') || q.includes('cost')) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: 'NOROZZ offers 100% transparent pricing with no hidden charges. Appliance repairs start at ₹299, AC servicing at ₹599, and deep cleaning at ₹899. All services come with a 30-day warranty guarantee!',
        timestamp: ts,
      };
    }

    if (q.includes('track') || q.includes('order') || q.includes('booking') || q.includes('status')) {
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: 'You can track all active bookings in real-time under Profile > My Bookings. Would you like to check our popular cleaning services?',
        timestamp: ts,
      };
    }

    if (q.includes('wallet') || q.includes('refund') || q.includes('balance')) {
      const bal = currentUser?.walletBalance || 0;
      return {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: `Your current NOROZZ Wallet balance is ₹${bal.toLocaleString('en-IN')}. Wallet credits are automatically applied during checkout for instant discounts!`,
        timestamp: ts,
      };
    }

    return {
      id: `bot-${Date.now()}`,
      sender: 'bot',
      text: "I am here to help you find the best home services, book expert technicians, check prices, or manage your bookings. Feel free to ask me anything!",
      timestamp: ts,
    };
  };

  const handleQuickBook = (cardData) => {
    toast.success(`⚡ Quick Booking initiated for ${cardData.title}`);
    if (onBookService) {
      onBookService({
        name: cardData.title,
        title: cardData.title,
        price: cardData.price,
        category: cardData.category,
      });
    }
  };

  return (
    <div
      style={{
        maxWidth: '540px',
        margin: '0 auto',
        background: '#090d16',
        color: '#ffffff',
        borderRadius: '24px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
        border: '1px solid #1e293b',
        height: '680px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header matching Screen4_AIAssistant */}
      <div
        style={{
          padding: '16px 20px',
          background: '#0f172a',
          borderBottom: '1px solid #1e293b',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
        }}
      >
        <button
          type="button"
          onClick={onBack}
          style={{
            background: '#1e293b',
            border: 'none',
            color: '#94a3b8',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={18} />
        </button>

        <div style={{ position: 'relative' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
            }}
          >
            <Sparkles size={22} />
          </div>
          <span
            style={{
              position: 'absolute',
              bottom: '1px',
              right: '1px',
              width: '11px',
              height: '11px',
              borderRadius: '50%',
              background: '#22c55e',
              border: '2px solid #0f172a',
            }}
          />
        </div>

        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '800', margin: 0, color: '#ffffff' }}>Norozz AI</h3>
          <div style={{ fontSize: '0.72rem', color: '#22c55e', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
            ● Online
          </div>
        </div>
      </div>

      {/* Messages Stream Container */}
      <div
        style={{
          flex: 1,
          padding: '20px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {messages.map((msg) => {
          const isBot = msg.sender === 'bot';
          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isBot ? 'flex-start' : 'flex-end',
              }}
            >
              {/* Message Bubble */}
              <div
                style={{
                  maxWidth: '82%',
                  padding: '14px 18px',
                  borderRadius: isBot ? '18px 18px 18px 4px' : '18px 18px 4px 18px',
                  background: isBot ? '#0f172a' : '#10b981',
                  color: '#ffffff',
                  border: isBot ? '1px solid #1e293b' : 'none',
                  fontSize: '0.9rem',
                  lineHeight: 1.5,
                  boxShadow: isBot ? 'none' : '0 4px 12px rgba(16, 185, 129, 0.25)',
                }}
              >
                <div>{msg.text}</div>

                {/* Inline Service Card Widget */}
                {msg.serviceCard && (
                  <div
                    style={{
                      marginTop: '12px',
                      background: '#090d16',
                      borderRadius: '16px',
                      border: '1.5px solid #10b981',
                      overflow: 'hidden',
                    }}
                  >
                    <img
                      src={msg.serviceCard.image}
                      alt={msg.serviceCard.title}
                      style={{ width: '100%', height: '120px', objectFit: 'cover' }}
                    />
                    <div style={{ padding: '12px' }}>
                      <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#ffffff', marginBottom: '4px' }}>
                        {msg.serviceCard.title}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <span style={{ fontSize: '0.78rem', color: '#f59e0b', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '2px' }}>
                          <Star size={13} fill="#f59e0b" color="#f59e0b" /> {msg.serviceCard.rating}
                        </span>
                        <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>•</span>
                        <span style={{ fontSize: '0.95rem', fontWeight: '800', color: '#10b981' }}>
                          ₹{msg.serviceCard.price}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleQuickBook(msg.serviceCard)}
                        style={{
                          width: '100%',
                          padding: '10px',
                          borderRadius: '10px',
                          background: '#10b981',
                          color: '#ffffff',
                          border: 'none',
                          fontWeight: '800',
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)',
                        }}
                      >
                        Quick Book
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Typing Indicator */}
        {isTyping && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.8rem', paddingLeft: '8px' }}>
            <Loader2 size={16} className="spin" color="#10b981" /> Norozz AI is typing...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestion Chips */}
      <div
        style={{
          padding: '8px 16px',
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          background: '#090d16',
          borderTop: '1px solid #1e293b',
        }}
      >
        {[
          'Book Kitchen Cleaning',
          'Ask for pricing',
          'Track my active booking',
          'Wallet & Refunds',
        ].map((chip, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(chip)}
            style={{
              padding: '8px 14px',
              borderRadius: '20px',
              border: '1px solid #1e293b',
              background: '#0f172a',
              color: '#cbd5e1',
              fontSize: '0.78rem',
              fontWeight: '700',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
            }}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input Bar matching Screen4_AIAssistant */}
      <div
        style={{
          padding: '12px 16px',
          background: '#0f172a',
          borderTop: '1px solid #1e293b',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Message Norozz AI..."
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            color: '#ffffff',
            fontSize: '0.9rem',
            outline: 'none',
          }}
        />

        <button
          type="button"
          onClick={() => toast.info('📎 Attachment photo preview option selected.')}
          style={{
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '6px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Paperclip size={20} />
        </button>

        <button
          type="button"
          onClick={() => handleSendMessage()}
          disabled={!inputText.trim()}
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: inputText.trim() ? '#10b981' : '#334155',
            color: '#ffffff',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: inputText.trim() ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s ease',
          }}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default NorozzAIChatView;
