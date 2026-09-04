import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Sparkles,
  Send,
  Paperclip,
  Star,
  Loader2,
  Bot,
  User,
  Zap,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { customerService } from '../../services/customer.service.js';
import { toast } from '../../utils/toast.js';

const defaultSuggestedPrompts = [
  { label: '🧹 Book Kitchen Cleaning', prompt: 'I want to book Kitchen Intensive Deep Cleaning. What are the inclusions and price?' },
  { label: '⚡ AC Repair & Servicing', prompt: 'My AC is not cooling properly and leaking water. Recommend a service.' },
  { label: '🔧 Plumbing Leak Repair', prompt: 'I have a leaking tap and pipeline leakage. What is the starting price?' },
  { label: '🎟️ Offers & Discounts', prompt: 'What active promo codes and wallet offers are available today?' },
  { label: '💵 Wallet & Refund Policy', prompt: 'How does the 30-Day Guarantee and wallet refund policy work?' },
];

const parseServiceCardsFromText = (text) => {
  if (!text) return { cleanText: '', serviceCards: [] };

  const cards = [];
  const regex = /\[SERVICE_CARD\]([\s\S]*?)\[\/SERVICE_CARD\]/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    try {
      const parsed = JSON.parse(match[1].trim());
      cards.push(parsed);
    } catch (e) {
      console.warn('Could not parse SERVICE_CARD json:', e);
    }
  }

  const cleanText = text.replace(/\[SERVICE_CARD\][\s\S]*?\[\/SERVICE_CARD\]/g, '').trim();
  return { cleanText, serviceCards: cards };
};

const CustomerAiChatView = ({ currentUser, onBack, onBookService }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChatHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const res = await customerService.getAiChatHistory();
      const historyList = res.data?.data || res.data || [];

      if (Array.isArray(historyList) && historyList.length > 0) {
        setMessages(historyList);
      } else {
        setMessages([
          {
            id: 'msg_welcome',
            role: 'assistant',
            text: `Hello ${currentUser?.name ? currentUser.name.split(' ')[0] : 'there'}! I am your Norozz AI companion. What area of your home needs attention today?`,
            timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (err) {
      console.warn('Could not fetch AI chat history:', err);
      setMessages([
        {
          id: 'msg_welcome',
          role: 'assistant',
          text: `Hello ${currentUser?.name ? currentUser.name.split(' ')[0] : 'there'}! I am your Norozz AI companion. What area of your home needs attention today?`,
          timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchChatHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear your AI chat history?')) return;
    try {
      await customerService.clearAiChatHistory();
      setMessages([
        {
          id: 'msg_welcome',
          role: 'assistant',
          text: `Hello ${currentUser?.name ? currentUser.name.split(' ')[0] : 'there'}! I am your Norozz AI companion. What area of your home needs attention today?`,
          timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      toast.success('AI chat history cleared successfully');
    } catch (err) {
      console.error('Clear chat error:', err);
      toast.error('Failed to clear chat history');
    }
  };

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputValue).trim();
    if (!query || isTyping) return;

    const userMsg = {
      id: `user_${Date.now()}`,
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const res = await customerService.sendAiChatMessage({ message: query });
      const aiReply = res.data?.data?.reply || res.data?.reply || 'I am happy to assist with your home service booking!';

      const botMsg = {
        id: `bot_${Date.now()}`,
        role: 'assistant',
        text: aiReply,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.warn('AI Chat Error:', err);
      let fallbackText = "I can certainly help you book that! We have verified experts available in 30 minutes with a 30-Day Satisfaction Guarantee.";
      
      setMessages((prev) => [
        ...prev,
        {
          id: `bot_${Date.now()}`,
          role: 'assistant',
          text: fallbackText,
          timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div style={{
      maxWidth: '600px',
      margin: '0 auto',
      height: 'calc(100vh - 40px)',
      maxHeight: '820px',
      background: '#091224',
      borderRadius: '28px',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
      border: '1px solid rgba(255,255,255,0.08)',
      overflow: 'hidden',
      position: 'relative'
    }}>
      
      {/* 1. DARK SLEEK HEADER */}
      <div style={{
        padding: '16px 20px',
        background: '#0b162c',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            type="button"
            onClick={onBack}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={18} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
              position: 'relative'
            }}>
              <Sparkles size={20} color="#ffffff" />
              <div style={{
                position: 'absolute',
                bottom: '1px',
                right: '1px',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: '#22c55e',
                border: '2px solid #0b162c'
              }} />
            </div>

            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.2px' }}>
                Norozz AI
              </div>
              <div style={{ fontSize: '0.74rem', color: '#4ade80', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                ● Online 24/7 Support
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            background: 'rgba(52, 211, 153, 0.15)',
            color: '#34d399',
            border: '1px solid rgba(52, 211, 153, 0.3)',
            fontSize: '0.68rem',
            fontWeight: '800',
            padding: '4px 10px',
            borderRadius: '20px',
            textTransform: 'uppercase'
          }}>
            ⚡ Powered by Groq AI
          </span>

          <button
            type="button"
            onClick={handleClearHistory}
            title="Clear Chat History"
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* 2. CHAT STREAM MESSAGES */}
      <div style={{
        flex: 1,
        padding: '20px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        background: 'linear-gradient(180deg, #091224 0%, #060b17 100%)'
      }}>
        {isLoadingHistory ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '40px 0', color: '#a7f3d0' }}>
            <Loader2 size={20} className="spin" />
            <span style={{ fontSize: '0.88rem', fontWeight: '600' }}>Loading past chat history...</span>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === 'user';
            const { cleanText, serviceCards } = parseServiceCardsFromText(msg.text);

            return (
              <div
                key={msg.id || `msg_${Math.random()}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isUser ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  alignSelf: isUser ? 'flex-end' : 'flex-start',
                }}
              >
                {/* Message Bubble */}
                <div
                  style={{
                    background: isUser
                      ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)'
                      : 'rgba(255, 255, 255, 0.07)',
                    color: '#ffffff',
                    padding: '14px 18px',
                    borderRadius: isUser ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                    boxShadow: isUser ? '0 4px 14px rgba(16, 185, 129, 0.25)' : '0 2px 8px rgba(0,0,0,0.2)',
                    border: isUser ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                    fontSize: '0.92rem',
                    lineHeight: 1.55,
                    whiteSpace: 'pre-line'
                  }}
                >
                  {cleanText}

                  {/* Embedded Interactive Service Recommendation Cards */}
                  {serviceCards && serviceCards.length > 0 && (
                    <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {serviceCards.map((card, idx) => (
                        <div
                          key={idx}
                          style={{
                            background: '#0d182e',
                            border: '1px solid rgba(16, 185, 129, 0.4)',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            boxShadow: '0 8px 20px rgba(0,0,0,0.3)'
                          }}
                        >
                          {card.image && (
                            <div style={{ height: '120px', width: '100%', overflow: 'hidden' }}>
                              <img src={card.image} alt={card.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                          )}

                          <div style={{ padding: '14px' }}>
                            <div style={{ fontSize: '1rem', fontWeight: '900', color: '#ffffff', marginBottom: '4px' }}>
                              {card.title}
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#a7f3d0', marginBottom: '12px' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#f59e0b', fontWeight: '800' }}>
                                <Star size={14} fill="#f59e0b" color="#f59e0b" /> {card.rating || 4.8}
                              </span>
                              <span>•</span>
                              <span style={{ fontSize: '1rem', fontWeight: '900', color: '#34d399' }}>
                                ₹{card.price}
                              </span>
                              {card.originalPrice && (
                                <span style={{ textDecoration: 'line-through', opacity: 0.6, fontSize: '0.78rem' }}>
                                  ₹{card.originalPrice}
                                </span>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                if (onBookService) {
                                  onBookService({
                                    name: card.title,
                                    title: card.title,
                                    price: card.price,
                                    category: card.category || 'Home Services'
                                  });
                                } else {
                                  toast.success(`Starting booking for ${card.title}`);
                                }
                              }}
                              style={{
                                width: '100%',
                                padding: '10px',
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '10px',
                                fontWeight: '800',
                                fontSize: '0.84rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                              }}
                            >
                              <Zap size={14} /> Quick Book Now
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Timestamp */}
                <span style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '4px', padding: '0 4px' }}>
                  {msg.timestamp}
                </span>
              </div>
            );
          })
        )}

        {/* Typing Indicator */}
        {isTyping && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.07)', padding: '12px 18px', borderRadius: '20px 20px 20px 4px', width: 'fit-content' }}>
            <Loader2 size={16} className="spin" color="#34d399" />
            <span style={{ fontSize: '0.82rem', color: '#a7f3d0', fontWeight: '600' }}>Norozz AI is thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. SUGGESTED QUICK PROMPT CHIPS */}
      <div style={{
        padding: '8px 16px',
        background: '#091224',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        flexShrink: 0
      }}>
        {defaultSuggestedPrompts.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(item.prompt)}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#e2e8f0',
              fontSize: '0.78rem',
              fontWeight: '600',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(16, 185, 129, 0.2)';
              e.currentTarget.style.borderColor = '#34d399';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* 4. BOTTOM INPUT BAR */}
      <div style={{
        padding: '14px 16px',
        background: '#0b162c',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        flexShrink: 0
      }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(255, 255, 255, 0.06)',
            borderRadius: '9999px',
            padding: '6px 8px 6px 16px',
            border: '1px solid rgba(255, 255, 255, 0.12)'
          }}
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Message Norozz AI..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: '#ffffff',
              fontSize: '0.9rem',
              outline: 'none'
            }}
          />

          <button
            type="button"
            onClick={() => toast.info('📎 Attachment feature available soon')}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            <Paperclip size={18} />
          </button>

          <button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: inputValue.trim() && !isTyping ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'rgba(255,255,255,0.1)',
              color: '#ffffff',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: inputValue.trim() && !isTyping ? 'pointer' : 'default',
              boxShadow: inputValue.trim() && !isTyping ? '0 4px 12px rgba(16, 185, 129, 0.4)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <Send size={16} />
          </button>
        </form>
      </div>

    </div>
  );
};

export default CustomerAiChatView;
