import React, { useState, useEffect } from 'react';
import {
  Bell,
  BellRing,
  BellOff,
  CheckCircle2,
  Gift,
  Calendar,
  Sparkles,
  Trash2,
  Check,
  ShieldCheck,
  ArrowRight,
  Loader2,
  AlertCircle,
  Tag,
  Info,
  Filter,
} from 'lucide-react';
import { customerService } from '../../services/customer.service.js';
import { axiosInstance } from '../../api/axiosInstance.js';
import { toast } from '../../utils/toast.js';

const INITIAL_NOTIFICATIONS = [
  {
    id: 'NOTIF-101',
    title: '🎁 50% OFF Summer Voucher Active!',
    message: 'Use promo code SUMMERAC to get 50% discount on all AC Foam Jet cleaning services today.',
    category: 'offer',
    time: '10 minutes ago',
    read: false,
    link: '/customer/offers',
  },
  {
    id: 'NOTIF-102',
    title: '👨‍🔧 Technician Dispatched',
    message: 'Rajesh Kumar (AC & Appliance Specialist) is on the way to your current address for booking #UC-98213.',
    category: 'booking',
    time: '1 hour ago',
    read: false,
    link: '/customer/bookings',
  },
  {
    id: 'NOTIF-103',
    title: '💰 Wallet Cashback Credited',
    message: '₹150 cashback credited to your Norozz Pay Wallet for your recent booking completion.',
    category: 'system',
    time: 'Yesterday',
    read: true,
    link: '/customer/wallet',
  },
  {
    id: 'NOTIF-104',
    title: '🛡️ Safety First Feature Enabled',
    message: 'All Norozz verified partners are now background-verified and health-screened before assignment.',
    category: 'system',
    time: '2 days ago',
    read: true,
  },
];

const CustomerNotificationsView = ({ onNavigate }) => {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [pushPermission, setPushPermission] = useState('default');
  const [enablingPush, setEnablingPush] = useState(false);

  useEffect(() => {
    // Check browser notification permission status
    if ('Notification' in window) {
      setPushPermission(Notification.permission);
    }

    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await customerService.getNotifications();
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        // Merge with initial notifications safely
        const apiNotifs = res.data.map((item, idx) => ({
          id: item.id || `API-NOTIF-${idx}`,
          title: item.title || 'System Notification',
          message: item.message || item.body || '',
          category: item.category || 'system',
          time: item.time || 'Recently',
          read: false,
        }));
        setNotifications((prev) => {
          const combined = [...apiNotifs, ...prev];
          const unique = combined.filter((v, i, a) => a.findIndex((t) => t.id === v.id) === i);
          return unique;
        });
      }
    } catch {
      // Keep initial notifications state on fallback
    } finally {
      setLoading(false);
    }
  };

  const handleEnablePush = async () => {
    if (!('Notification' in window)) {
      toast.error('Push Notifications are not supported by your browser.');
      return;
    }

    setEnablingPush(true);
    try {
      const permission = await Notification.requestPermission();
      setPushPermission(permission);

      if (permission === 'granted') {
        toast.success('Push Notifications Enabled! 🎉');
        // Register token with backend if available
        try {
          const fakeToken = `token_${Math.random().toString(36).substring(2, 15)}`;
          await axiosInstance.post('/notifications/save-token', { token: fakeToken });
        } catch {
          // Token save background catch
        }
      } else if (permission === 'denied') {
        toast.error('Notification permission blocked in browser settings.');
      }
    } catch {
      toast.error('Failed to request notification permissions.');
    } finally {
      setEnablingPush(false);
    }
  };

  const handleMarkAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const handleDeleteNotif = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleClearAll = () => {
    setNotifications([]);
    toast.info('Notification feed cleared');
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === 'unread') return !n.read;
    if (activeFilter === 'offers') return n.category === 'offer';
    if (activeFilter === 'bookings') return n.category === 'booking';
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'offer':
        return <Gift size={20} color="#7c3aed" />;
      case 'booking':
        return <Calendar size={20} color="#2563eb" />;
      default:
        return <Bell size={20} color="#059669" />;
    }
  };

  const getCategoryBadgeStyle = (category) => {
    switch (category) {
      case 'offer':
        return { bg: '#f3e8ff', color: '#7c3aed', label: 'OFFER' };
      case 'booking':
        return { bg: '#dbeafe', color: '#1d4ed8', label: 'BOOKING' };
      default:
        return { bg: '#d1fae5', color: '#047857', label: 'SYSTEM' };
    }
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Top Banner & Header */}
      <div style={{
        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
        borderRadius: '24px',
        padding: '28px',
        color: '#ffffff',
        boxShadow: '0 10px 25px rgba(124, 58, 237, 0.25)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '54px', height: '54px', borderRadius: '18px',
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <BellRing size={28} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0 }}>Push Notifications & Alerts</h2>
              {unreadCount > 0 && (
                <span style={{
                  background: '#ef4444', color: '#fff', fontSize: '0.75rem', fontWeight: '800',
                  padding: '3px 10px', borderRadius: '99px'
                }}>
                  {unreadCount} New
                </span>
              )}
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.88rem', opacity: 0.9 }}>
              Stay updated with live booking tracking, promo discount alerts & wallet credits
            </p>
          </div>
        </div>

        {/* Push Notification Toggle Button */}
        <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', padding: '12px 18px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.2)' }}>
          {pushPermission === 'granted' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: '700' }}>
              <CheckCircle2 size={18} color="#4ade80" /> Push Alerts Active
            </div>
          ) : (
            <button
              onClick={handleEnablePush}
              disabled={enablingPush}
              style={{
                background: '#ffffff', color: '#6d28d9', border: 'none',
                padding: '8px 16px', borderRadius: '12px', fontWeight: '800',
                fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
            >
              {enablingPush ? <Loader2 size={16} className="spin" /> : <BellRing size={16} />}
              Enable Push Notifications
            </button>
          )}
        </div>
      </div>

      {/* Action Controls & Filters */}
      <div style={{
        background: '#ffffff',
        borderRadius: '20px',
        padding: '16px 20px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
      }}>
        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All', count: notifications.length },
            { id: 'unread', label: 'Unread', count: unreadCount },
            { id: 'offers', label: 'Offers & Deals', icon: Tag },
            { id: 'bookings', label: 'Bookings', icon: Calendar },
          ].map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '12px',
                  border: 'none',
                  background: isActive ? '#7c3aed' : '#f1f5f9',
                  color: isActive ? '#ffffff' : '#475569',
                  fontWeight: '700',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease'
                }}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span style={{
                    background: isActive ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                    color: isActive ? '#ffffff' : '#64748b',
                    padding: '2px 7px',
                    borderRadius: '99px',
                    fontSize: '0.72rem'
                  }}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Mark All / Clear Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              style={{
                background: 'none', border: 'none', color: '#2563eb',
                fontWeight: '700', fontSize: '0.82rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '4px'
              }}
            >
              <Check size={16} /> Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={handleClearAll}
              style={{
                background: 'none', border: 'none', color: '#ef4444',
                fontWeight: '700', fontSize: '0.82rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '4px'
              }}
            >
              <Trash2 size={16} /> Clear feed
            </button>
          )}
        </div>
      </div>

      {/* Notifications Feed */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
          <Loader2 size={28} className="spin" color="#7c3aed" style={{ margin: '0 auto 12px' }} />
          <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '600' }}>Loading your notifications...</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div style={{
          padding: '50px 20px',
          textAlign: 'center',
          background: '#ffffff',
          borderRadius: '24px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 16px rgba(0,0,0,0.02)'
        }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: '#f3e8ff', color: '#7c3aed', margin: '0 auto 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <BellOff size={32} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: '0 0 6px' }}>
            No Notifications Found
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>
            {activeFilter === 'unread' ? "You're all caught up! No unread alerts." : "You have no notifications in this category yet."}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredNotifications.map((n) => {
            const badge = getCategoryBadgeStyle(n.category);
            return (
              <div
                key={n.id}
                onClick={() => handleMarkAsRead(n.id)}
                style={{
                  background: n.read ? '#ffffff' : '#fcfaff',
                  borderRadius: '20px',
                  padding: '20px',
                  border: `1px solid ${n.read ? '#e2e8f0' : '#ddd6fe'}`,
                  boxShadow: n.read ? 'none' : '0 4px 14px rgba(124, 58, 237, 0.06)',
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'flex-start',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  cursor: 'pointer'
                }}
              >
                {/* Unread Indicator Dot */}
                {!n.read && (
                  <div style={{
                    position: 'absolute', top: '16px', right: '16px',
                    width: '8px', height: '8px', borderRadius: '50%', background: '#7c3aed'
                  }} />
                )}

                {/* Category Icon */}
                <div style={{
                  width: '46px', height: '46px', borderRadius: '14px',
                  background: badge.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {getCategoryIcon(n.category)}
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
                    <span style={{
                      background: badge.bg, color: badge.color,
                      fontSize: '0.68rem', fontWeight: '800', padding: '2px 8px', borderRadius: '6px'
                    }}>
                      {badge.label}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600' }}>
                      {n.time}
                    </span>
                  </div>

                  <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#0f172a', marginBottom: '4px' }}>
                    {n.title}
                  </div>

                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', lineHeight: '1.4' }}>
                    {n.message}
                  </p>

                  {/* Actions / Link */}
                  {n.link && onNavigate && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate(n.link);
                      }}
                      style={{
                        marginTop: '10px',
                        background: 'none', border: 'none', padding: 0,
                        color: '#7c3aed', fontWeight: '800', fontSize: '0.82rem',
                        display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer'
                      }}
                    >
                      View Details <ArrowRight size={14} />
                    </button>
                  )}
                </div>

                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteNotif(n.id);
                  }}
                  title="Remove notification"
                  style={{
                    background: 'none', border: 'none', color: '#cbd5e1',
                    cursor: 'pointer', padding: '4px', borderRadius: '6px',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#cbd5e1')}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default CustomerNotificationsView;
