import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Phone, ShieldCheck, User, Loader2 } from 'lucide-react';
import { socketService } from '../../services/socket.service.js';
import { axiosInstance } from '../../api/axiosInstance.js';
import { toast } from '../../utils/toast.js';

// Web Audio API Chime Sound Notification
const playChatChimeSound = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.35, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.3);
  } catch (e) {
    // Ignore audio autoplay restrictions
  }
};

const LiveChatModal = ({ isOpen, booking, currentUser, userRole = 'customer', onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(false);
  const messagesEndRef = useRef(null);

  const bookingId = booking?._id || booking?.rawId || booking?.bookingId || booking?.bookingNumber || 'demo-booking-1';
  const bookingRef = booking?.bookingId || booking?.bookingNumber || `#NZ${bookingId?.toString().slice(-4).toUpperCase() || '2847'}`;
  
  // Recipient details
  const isCustomer = userRole === 'customer';
  const recipientName = isCustomer
    ? (booking?.partner?.name || 'Krishna Kumar (Technician)')
    : (booking?.customer?.name || 'Bharti (Customer)');
  const recipientPhone = isCustomer
    ? (booking?.partner?.phone || '+91 98765 43210')
    : (booking?.customer?.phone || '+91 98765 43210');

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // 1. Fetch History & Join Socket Chat Room
  useEffect(() => {
    if (isOpen && bookingId) {
      // Connect Socket.IO
      const socket = socketService.connect();

      // Join chat room
      socket.emit('join_chat_room', { bookingId });

      // Fetch past messages
      const fetchHistory = async () => {
        setLoadingHistory(true);
        try {
          const targetId = booking?._id || booking?.rawId || bookingId;
          const res = await axiosInstance.get(`/chat/${targetId}`);
          
          // axiosInstance response interceptor unwraps response.data directly
          const fetchedMsgs = Array.isArray(res)
            ? res
            : (Array.isArray(res?.data) ? res.data : (Array.isArray(res?.data?.data) ? res.data.data : []));

          setMessages(fetchedMsgs);
        } catch (err) {
          console.warn('Failed to load chat history:', err);
        } finally {
          setLoadingHistory(false);
          scrollToBottom();
        }
      };

      fetchHistory();

      // Socket Listener for Incoming Messages
      const handleNewMessage = (msg) => {
        if (!msg) return;
        setMessages((prev) => {
          if (msg._id && prev.some((m) => String(m._id) === String(msg._id))) {
            return prev;
          }
          return [...prev, msg];
        });

        // Trigger Sound & Notification Toast for recipient
        if (msg.senderRole !== userRole) {
          playChatChimeSound();
          toast.info(`💬 ${msg.senderName}: "${msg.message}"`);
        }
        scrollToBottom();
      };

      socket.on('new_chat_message', handleNewMessage);

      return () => {
        socket.off('new_chat_message', handleNewMessage);
      };
    }
  }, [isOpen, bookingId, userRole]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!isOpen || !booking) return null;

  // Send Chat Message Action
  const handleSendMessage = (e) => {
    if (e) e.preventDefault();
    const text = inputText.trim();
    if (!text) return;

    const socket = socketService.getSocket();
    if (!socket) {
      toast.error('Socket connection offline');
      return;
    }

    const payload = {
      bookingId,
      senderId: currentUser?._id || 'user-1',
      senderName: currentUser?.name || (isCustomer ? 'Customer' : 'Technician'),
      senderRole: userRole,
      message: text,
    };

    // Emit live message via Socket.IO
    socket.emit('send_chat_message', payload);
    setInputText('');
  };

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.78)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 4000,
        padding: '16px',
      }}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#ffffff',
          borderRadius: '24px',
          maxWidth: '460px',
          width: '100%',
          height: '620px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
          overflow: 'hidden',
          animation: 'modalSlideUp 0.25s ease-out',
        }}
      >
        {/* TOP CHAT HEADER BAR */}
        <div
          style={{
            padding: '14px 20px',
            background: 'linear-gradient(135deg, #1e293b, #0f172a)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1.1rem' }}>
              {recipientName.charAt(0)}
            </div>
            <div>
              <div style={{ fontWeight: '800', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {recipientName}
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
              </div>
              <div style={{ fontSize: '0.72rem', opacity: 0.8 }}>
                Live Chat • {bookingRef}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <a href={`tel:${recipientPhone}`} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <Phone size={16} />
            </a>
            <button
              type="button"
              onClick={onClose}
              style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* CHAT MESSAGES BODY CONTAINER */}
        <div style={{ flex: 1, padding: '16px', overflowY: 'auto', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          
          {/* Welcome Info Banner */}
          <div style={{ textAlign: 'center', margin: '8px 0 14px 0' }}>
            <span style={{ background: '#e2e8f0', color: '#475569', fontSize: '0.72rem', fontWeight: '700', padding: '4px 12px', borderRadius: '9999px' }}>
              🔒 Messages are encrypted & connected live via Socket.IO
            </span>
          </div>

          {loadingHistory && (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>
              <Loader2 size={20} className="spin" style={{ margin: '0 auto 6px auto' }} />
              Loading chat history...
            </div>
          )}

          {messages.length === 0 && !loadingHistory && (
            <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.82rem', padding: '30px 20px' }}>
              💬 No messages yet. Send a message to start live chat with {recipientName}!
            </div>
          )}

          {messages.map((msg, idx) => {
            const isMe = msg.senderRole === userRole || String(msg.sender) === String(currentUser?._id);
            const timeStr = msg.timestamp
              ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : 'Now';

            return (
              <div
                key={msg._id || idx}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isMe ? 'flex-end' : 'flex-start',
                }}
              >
                <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginBottom: '2px', padding: '0 4px', fontWeight: '600' }}>
                  {msg.senderName}
                </div>
                <div
                  style={{
                    maxWidth: '78%',
                    padding: '10px 14px',
                    borderRadius: isMe ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                    background: isMe ? '#16a34a' : '#ffffff',
                    color: isMe ? '#ffffff' : '#0f172a',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                    border: isMe ? 'none' : '1px solid #e2e8f0',
                    fontSize: '0.88rem',
                    lineHeight: '1.4',
                    fontWeight: '500',
                  }}
                >
                  {msg.message}
                  <div
                    style={{
                      fontSize: '0.62rem',
                      textAlign: 'right',
                      marginTop: '4px',
                      opacity: 0.8,
                      color: isMe ? '#dcfce7' : '#64748b',
                    }}
                  >
                    {timeStr}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* INPUT FORM FOOTER */}
        <form
          onSubmit={handleSendMessage}
          style={{
            padding: '12px 16px',
            background: '#ffffff',
            borderTop: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <input
            type="text"
            className="form-input"
            placeholder={`Message ${recipientName}...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            style={{
              flex: 1,
              borderRadius: '9999px',
              padding: '10px 18px',
              fontSize: '0.9rem',
              background: '#f1f5f9',
              border: '1px solid var(--border-light)',
            }}
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: inputText.trim() ? '#16a34a' : '#cbd5e1',
              color: '#ffffff',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: inputText.trim() ? 'pointer' : 'default',
              transition: 'background 0.2s ease',
            }}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default LiveChatModal;
