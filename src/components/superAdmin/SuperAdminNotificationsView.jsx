import React, { useState, useEffect, useRef } from 'react';
import { Bell, Send, Users, Loader2, CheckCircle2, AlertCircle, Upload, X } from 'lucide-react';
import { axiosInstance } from '../../api/axiosInstance.js';

const SuperAdminNotificationsView = () => {
  const [form, setForm] = useState({ title: '', body: '', imageUrl: '', link: '' });
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [loadingCount, setLoadingCount] = useState(true);
  const [imageUploading, setImageUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const fetchSubscriberCount = async () => {
    try {
      const res = await axiosInstance.get('/notifications/subscriber-count');
      setSubscriberCount(res.data?.data?.count || 0);
    } catch {
      setSubscriberCount(0);
    } finally {
      setLoadingCount(false);
    }
  };

  useEffect(() => {
    fetchSubscriberCount();
  }, []);

  const handleImageUpload = async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setImageUploading(true);
    try {
      // Show local preview immediately
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);

      const formData = new FormData();
      formData.append('image', file);
      const res = await axiosInstance.post('/notifications/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const url = res.data?.data?.url;
      if (url) setForm((prev) => ({ ...prev, imageUrl: url }));
    } catch {
      setImagePreview('');
      setForm((prev) => ({ ...prev, imageUrl: '' }));
    } finally {
      setImageUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageUpload(file);
  };

  const removeImage = () => {
    setImagePreview('');
    setForm((prev) => ({ ...prev, imageUrl: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) return;

    setSending(true);
    setResult(null);
    try {
      const payload = {
        title: form.title.trim(),
        body: form.body.trim(),
        ...(form.imageUrl.trim() && { imageUrl: form.imageUrl.trim() }),
        ...(form.link.trim() && { data: { link: form.link.trim() } }),
      };
      const res = await axiosInstance.post('/notifications/send', payload);
      setResult({ success: true, ...res.data?.data });
      setForm({ title: '', body: '', imageUrl: '', link: '' });
      fetchSubscriberCount();
    } catch (err) {
      setResult({ success: false, message: err.response?.data?.message || 'Failed to send notification' });
    } finally {
      setSending(false);
    }
  };

  const templates = [
    { label: '🎁 Special Offer', title: 'Special Offer Just For You!', body: 'Limited time offer available — check it out now!' },
    { label: '✅ Booking Confirmed', title: 'Booking Confirmed', body: 'Your booking has been confirmed. View details in the app.' },
    { label: '⚡ Flash Sale', title: '⚡ Flash Sale Live!', body: 'Only 30 minutes left — 50% off on all services!' },
    { label: '📢 Announcement', title: 'Important Announcement', body: 'We have an important update for you from Norozz.' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '900px' }}>

      {/* Header */}
      <div style={{
        background: '#ffffff',
        borderRadius: '24px',
        padding: '24px 30px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 16px rgba(0,0,0,0.02)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '46px', height: '46px', borderRadius: '16px',
            background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
            color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 6px 16px rgba(124,58,237,0.35)'
          }}>
            <Bell size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: '900', margin: 0, color: '#0f172a' }}>
              Push Notifications
            </h2>
            <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '2px 0 0 0' }}>
              Broadcast instant push notifications to all subscribed users
            </p>
          </div>
        </div>

        {/* Subscriber Count */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '12px 20px', borderRadius: '16px',
          background: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)',
          border: '1px solid #c4b5fd'
        }}>
          <Users size={20} color="#7c3aed" />
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#5b21b6', lineHeight: 1 }}>
              {loadingCount ? '...' : subscriberCount}
            </div>
            <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#7c3aed' }}>SUBSCRIBERS</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px', alignItems: 'flex-start' }}>

        {/* Left — Compose Form */}
        <div style={{
          background: '#ffffff', borderRadius: '24px',
          border: '1px solid #e2e8f0', padding: '28px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.02)'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '20px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Send size={18} color="#7c3aed" /> Compose Notification
          </h3>

          <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: '800', color: '#334155', display: 'block', marginBottom: '6px' }}>
                TITLE *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. 🎁 Special Offer Just For You!"
                maxLength={65}
                required
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: '12px',
                  border: '1px solid #cbd5e1', fontSize: '0.9rem', fontWeight: '700',
                  outline: 'none', color: '#0f172a', background: '#f8fafc', boxSizing: 'border-box'
                }}
              />
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px', textAlign: 'right' }}>
                {form.title.length}/65
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: '800', color: '#334155', display: 'block', marginBottom: '6px' }}>
                MESSAGE BODY *
              </label>
              <textarea
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                placeholder="e.g. A limited time offer is available — check it out now!"
                maxLength={200}
                required
                rows={3}
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: '12px',
                  border: '1px solid #cbd5e1', fontSize: '0.88rem', fontWeight: '600',
                  outline: 'none', color: '#0f172a', background: '#f8fafc',
                  resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit'
                }}
              />
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px', textAlign: 'right' }}>
                {form.body.length}/200
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: '800', color: '#334155', display: 'block', marginBottom: '6px' }}>
                🖼️ NOTIFICATION IMAGE (Optional)
              </label>

              {/* Image Preview */}
              {imagePreview ? (
                <div style={{ position: 'relative', display: 'inline-block', marginBottom: '8px' }}>
                  <img
                    src={imagePreview}
                    alt="preview"
                    style={{ width: '100%', maxHeight: '140px', objectFit: 'cover', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                  />
                  {imageUploading && (
                    <div style={{
                      position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)',
                      borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#fff', fontSize: '0.85rem', fontWeight: '700'
                    }}>
                      <Loader2 size={18} className="spin" /> Uploading...
                    </div>
                  )}
                  {!imageUploading && (
                    <button
                      type="button"
                      onClick={removeImage}
                      style={{
                        position: 'absolute', top: '6px', right: '6px',
                        background: 'rgba(220,38,38,0.9)', border: 'none', borderRadius: '50%',
                        width: '26px', height: '26px', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', cursor: 'pointer', color: '#fff'
                      }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ) : (
                /* Drag & Drop Upload Zone */
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  style={{
                    border: `2px dashed ${dragOver ? '#7c3aed' : '#cbd5e1'}`,
                    borderRadius: '12px',
                    padding: '20px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: dragOver ? '#ede9fe' : '#f8fafc',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Upload size={22} color={dragOver ? '#7c3aed' : '#94a3b8'} style={{ margin: '0 auto 6px' }} />
                  <div style={{ fontSize: '0.82rem', fontWeight: '700', color: dragOver ? '#7c3aed' : '#64748b' }}>
                    Click or drag & drop an image to upload
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '3px' }}>PNG, JPG, WEBP</div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => handleImageUpload(e.target.files?.[0])}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: '800', color: '#334155', display: 'block', marginBottom: '6px' }}>
                🔗 DEEP LINK — Destination on notification click (Optional)
              </label>
              <select
                value={form.link}
                onChange={(e) => setForm({ ...form, link: e.target.value })}
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: '12px',
                  border: '1px solid #cbd5e1', fontSize: '0.88rem', fontWeight: '600',
                  outline: 'none', color: form.link ? '#0f172a' : '#94a3b8',
                  background: '#f8fafc', boxSizing: 'border-box', cursor: 'pointer'
                }}
              >
                <option value="">— No redirect (notification only) —</option>
                <optgroup label="Customer App">
                  <option value="/">🏠 Customer Home</option>
                  <option value="/customer/bookings">📅 My Bookings</option>
                  <option value="/customer/offers">🎁 Offers & Deals</option>
                  <option value="/customer/services">🛠️ Browse Services</option>
                  <option value="/customer/wallet">💰 Wallet & Credits</option>
                </optgroup>
                <optgroup label="Partner App">
                  <option value="/partner">🧑‍🔧 Partner Dashboard</option>
                  <option value="/partner/bookings">📋 Partner Bookings</option>
                  <option value="/partner/earnings">💵 Earnings</option>
                </optgroup>
              </select>
            </div>

            {/* Result Message */}
            {result && (
              <div style={{
                padding: '12px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px',
                background: result.success ? '#f0fdf4' : '#fef2f2',
                border: `1px solid ${result.success ? '#bbf7d0' : '#fecaca'}`,
                color: result.success ? '#15803d' : '#dc2626',
                fontSize: '0.88rem', fontWeight: '700'
              }}>
                {result.success
                  ? <><CheckCircle2 size={18} /> Sent to {result.sent} subscribers! {result.failed > 0 && `(${result.failed} failed)`}</>
                  : <><AlertCircle size={18} /> {result.message}</>
                }
              </div>
            )}

            <button
              type="submit"
              disabled={sending}
              style={{
                padding: '12px 24px', borderRadius: '14px', fontWeight: '800',
                fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                color: '#ffffff',
                border: 'none', cursor: sending ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 14px rgba(124,58,237,0.35)',
                opacity: sending ? 0.7 : 1
              }}
            >
              {sending ? <Loader2 size={18} className="spin" /> : <Send size={18} />}
              {sending ? 'Sending...' : `Send to ${subscriberCount} Subscriber${subscriberCount !== 1 ? 's' : ''}`}
            </button>
          </form>
        </div>

        {/* Right — Templates + Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Quick Templates */}
          <div style={{
            background: '#ffffff', borderRadius: '24px',
            border: '1px solid #e2e8f0', padding: '24px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.02)'
          }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: '800', marginBottom: '14px', color: '#0f172a' }}>
              ⚡ Quick Templates
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {templates.map((t, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setForm({ ...form, title: t.title, body: t.body })}
                  style={{
                    padding: '10px 14px', borderRadius: '12px', textAlign: 'left',
                    background: '#f8fafc', border: '1px solid #e2e8f0',
                    cursor: 'pointer', fontSize: '0.82rem', fontWeight: '700', color: '#334155',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#ede9fe'; e.currentTarget.style.borderColor = '#c4b5fd'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Live Preview */}
          <div style={{
            background: '#ffffff', borderRadius: '24px',
            border: '1px solid #e2e8f0', padding: '24px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.02)'
          }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: '800', marginBottom: '14px', color: '#0f172a' }}>
              👁️ Live Preview
            </h3>
            <div style={{
              background: '#1e293b', borderRadius: '16px', padding: '16px',
              display: 'flex', alignItems: 'flex-start', gap: '12px'
            }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                background: 'linear-gradient(135deg, #10b981, #059669)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Bell size={18} color="#fff" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#ffffff', marginBottom: '4px' }}>
                  {form.title || 'Notification Title'}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: '1.4' }}>
                  {form.body || 'Notification message body will appear here...'}
                </div>
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="notification"
                    style={{ width: '100%', borderRadius: '8px', marginTop: '8px', maxHeight: '80px', objectFit: 'cover' }}
                  />
                )}
                <div style={{ fontSize: '0.7rem', color: '#475569', marginTop: '6px' }}>
                  Norozz • just now
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminNotificationsView;
