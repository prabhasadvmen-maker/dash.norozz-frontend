import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Bell, Send, Users, Loader2, CheckCircle2, AlertTriangle, Upload, X, UserRound, Briefcase, Radio, RefreshCw } from 'lucide-react';
import { superAdminService } from '../../services/superAdmin.service.js';
import { toast } from '../../utils/toast.js';

const TITLE_MAX = 65;
const BODY_MAX = 200;

const AUDIENCES = [
  { id: 'all', label: 'Everyone', key: 'total' },
  { id: 'customers', label: 'Customers', key: 'customers' },
  { id: 'partners', label: 'Partners', key: 'partners' },
];
const LINKS = [
  { group: 'Customer app', items: [['/', 'Home'], ['/customer/bookings', 'My bookings'], ['/customer/offers', 'Offers & deals'], ['/customer/services', 'Browse services'], ['/customer/wallet', 'Wallet & credits']] },
  { group: 'Partner app', items: [['/partner', 'Partner dashboard'], ['/partner/bookings', 'Partner bookings'], ['/partner/earnings', 'Earnings']] },
];
const TEMPLATES = [
  { label: 'Special offer', title: 'Special Offer Just For You!', body: 'Limited time offer available — check it out now!' },
  { label: 'Booking confirmed', title: 'Booking Confirmed', body: 'Your booking has been confirmed. View details in the app.' },
  { label: 'Flash sale', title: '⚡ Flash Sale Live!', body: 'Only 30 minutes left — 50% off on all services!' },
  { label: 'Announcement', title: 'Important Announcement', body: 'We have an important update for you from Norozz.' },
];

const card = { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)' };
const inputStyle = { width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '0.88rem', fontWeight: 600, color: '#0f172a', background: '#ffffff', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' };
const headRow = { background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' };
const td = { padding: '11px 10px', fontSize: '0.82rem', color: '#334155', verticalAlign: 'top' };

// Firebase error codes in plain words
const FAILURE_TEXT = {
  'messaging/invalid-argument': 'invalid device token',
  'messaging/invalid-registration-token': 'invalid device token',
  'messaging/registration-token-not-registered': 'device unsubscribed or expired',
  'messaging/third-party-auth-error': 'web push key rejected',
  'messaging/mismatched-credential': 'token is from a different Firebase project',
  'messaging/quota-exceeded': 'sending limit reached',
  'messaging/internal-error': 'Firebase internal error',
  'messaging/server-unavailable': 'Firebase temporarily unavailable',
};
const failureLine = (reasons = []) => reasons.map((r) => `${r.count} × ${FAILURE_TEXT[r.code] || r.code}`).join(', ');

const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
const fmtTime = (d) => new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

const StatCard = ({ icon: Icon, color, bg, label, value, sub }) => (
  <div style={{ ...card, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={20} color={color} />
    </div>
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px', marginTop: '2px' }}>{label}</div>
      {sub && <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '1px' }}>{sub}</div>}
    </div>
  </div>
);

const Field = ({ label, right, children }) => (
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
      <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{label}</span>
      {right}
    </div>
    {children}
  </div>
);

const Counter = ({ n, max }) => <span style={{ fontSize: '0.72rem', color: n >= max ? '#b45309' : '#94a3b8', fontWeight: 600 }}>{n}/{max}</span>;

const ConfirmModal = ({ audienceLabel, count, busy, onClose, onConfirm }) => {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && !busy && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, busy]);
  return (
    <div className="modal-overlay" onClick={busy ? undefined : onClose}>
      <div className="modal-content" role="dialog" aria-modal="true" aria-label="Confirm broadcast" onClick={(e) => e.stopPropagation()} style={{ padding: '26px', maxWidth: '420px' }}>
        <h3 style={{ margin: '0 0 12px', fontSize: '1.1rem', fontWeight: 800 }}>Send this notification?</h3>
        <p style={{ margin: 0, fontSize: '0.88rem', color: '#475569', lineHeight: 1.5 }}>
          It will go to <strong>{count}</strong> {audienceLabel.toLowerCase()} subscriber{count === 1 ? '' : 's'} straight away. A push notification cannot be recalled once sent.
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '22px' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={busy}>Cancel</button>
          <button type="button" className="btn btn-primary" onClick={onConfirm} disabled={busy} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            {busy ? <Loader2 size={16} className="spin" /> : <Send size={16} />} {busy ? 'Sending…' : 'Send now'}
          </button>
        </div>
      </div>
    </div>
  );
};

const SuperAdminNotificationsView = () => {
  const [form, setForm] = useState({ title: '', body: '', imageUrl: '', link: '', audience: 'all' });
  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [result, setResult] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, h] = await Promise.all([superAdminService.getPushSummary(), superAdminService.getPushHistory({ limit: 10 })]);
      setSummary(s?.data ?? null);
      setHistory(Array.isArray(h?.data) ? h.data : []);
    } catch {
      toast.error('Could not load notification data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const audience = AUDIENCES.find((a) => a.id === form.audience);
  const recipients = summary ? summary[audience.key] : 0;
  const canSend = form.title.trim() && form.body.trim() && !imageUploading && !sending && recipients > 0 && summary?.firebaseConfigured !== false;
  // Tell the admin exactly why Send is greyed out instead of leaving them guessing
  const blockedReason = (() => {
    if (loading || canSend) return '';
    if (summary?.firebaseConfigured === false) return 'The push service is not set up on the server yet.';
    if (recipients === 0) return form.audience === 'all'
      ? 'Nobody has turned on notifications yet. Open the customer app, go to Notifications and tap Enable push on at least one device.'
      : `No ${audience.label.toLowerCase()} have turned on notifications yet. Try "Everyone", or enable push on a ${form.audience === 'partners' ? 'partner' : 'customer'} device first.`;
    if (imageUploading) return 'Waiting for the image to finish uploading.';
    if (!form.title.trim() || !form.body.trim()) return 'Add a title and a message to send.';
    return '';
  })();

  const uploadImage = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please choose an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5 MB'); return; }
    setImageUploading(true);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await superAdminService.uploadPushImage(fd);
      const url = res?.data?.url;
      if (!url) throw new Error('No URL returned');
      setForm((f) => ({ ...f, imageUrl: url }));
    } catch {
      setImagePreview('');
      setForm((f) => ({ ...f, imageUrl: '' }));
      toast.error('Image upload failed. You can still send without an image.');
    } finally {
      setImageUploading(false);
    }
  };

  const removeImage = () => {
    setImagePreview('');
    setForm((f) => ({ ...f, imageUrl: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const doSend = async () => {
    setSending(true);
    setResult(null);
    try {
      const res = await superAdminService.sendPush({
        title: form.title.trim(),
        body: form.body.trim(),
        audience: form.audience,
        ...(form.imageUrl && { imageUrl: form.imageUrl }),
        ...(form.link && { link: form.link }),
      });
      const data = res?.data || {};
      setResult({ ok: !!data.delivered, ...data, message: data.message || res?.message });
      if (data.delivered) {
        setForm({ title: '', body: '', imageUrl: '', link: '', audience: form.audience });
        removeImage();
      }
      load();
    } catch (err) {
      setResult({ ok: false, message: err.response?.data?.message || 'Failed to send notification' });
    } finally {
      setSending(false);
      setConfirming(false);
    }
  };

  const linkLabel = useMemo(() => LINKS.flatMap((g) => g.items).find(([v]) => v === form.link)?.[1], [form.link]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        <StatCard icon={Users} color="#7c3aed" bg="#f5f3ff" label="Subscribers" value={loading ? '…' : summary?.total ?? 0} sub="devices with notifications on" />
        <StatCard icon={UserRound} color="#2563eb" bg="#eff6ff" label="Customers" value={loading ? '…' : summary?.customers ?? 0} />
        <StatCard icon={Briefcase} color="#059669" bg="#ecfdf5" label="Partners" value={loading ? '…' : summary?.partners ?? 0} />
        <StatCard icon={Radio} color={summary?.firebaseConfigured === false ? '#dc2626' : '#059669'} bg={summary?.firebaseConfigured === false ? '#fef2f2' : '#ecfdf5'} label="Push service" value={loading ? '…' : summary?.firebaseConfigured === false ? 'Not set up' : 'Connected'} sub={summary?.firebaseConfigured === false ? 'Firebase credentials missing' : 'Ready to send'} />
      </div>

      {summary?.firebaseConfigured === false && (
        <div role="alert" style={{ display: 'flex', gap: '12px', padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', color: '#991b1b', fontSize: '0.85rem', lineHeight: 1.5 }}>
          <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '1px' }} />
          <div><strong>The server cannot reach Firebase, so nothing can be delivered.</strong> Add the Firebase service-account key to the API server (<code>FIREBASE_SERVICE_ACCOUNT_PATH</code> or <code>FIREBASE_SERVICE_ACCOUNT</code>) and restart it.</div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '18px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Compose */}
        <form onSubmit={(e) => { e.preventDefault(); if (canSend) setConfirming(true); }} style={{ ...card, flex: '1 1 460px', minWidth: 0, padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
            <h3 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}><Send size={17} color="#7c3aed" /> Compose notification</h3>
            <select aria-label="Start from a template" value="" onChange={(e) => { const t = TEMPLATES[Number(e.target.value)]; if (t) setForm((f) => ({ ...f, title: t.title, body: t.body })); }} style={{ ...inputStyle, width: 'auto', padding: '6px 10px', fontSize: '0.8rem' }}>
              <option value="">Use a template…</option>
              {TEMPLATES.map((t, i) => <option key={t.label} value={i}>{t.label}</option>)}
            </select>
          </div>

          <Field label="Send to">
            <div role="radiogroup" aria-label="Audience" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {AUDIENCES.map((a) => {
                const active = form.audience === a.id;
                return (
                  <button key={a.id} type="button" role="radio" aria-checked={active} onClick={() => setForm((f) => ({ ...f, audience: a.id }))} style={{ padding: '7px 14px', borderRadius: '9999px', border: `1px solid ${active ? '#7c3aed' : '#e2e8f0'}`, background: active ? '#7c3aed' : '#ffffff', color: active ? '#ffffff' : '#475569', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
                    {a.label}<span style={{ opacity: 0.75, marginLeft: '6px' }}>{summary ? summary[a.key] : '…'}</span>
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label="Title *" right={<Counter n={form.title.length} max={TITLE_MAX} />}>
            <input type="text" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} maxLength={TITLE_MAX} placeholder="e.g. Special offer just for you" style={inputStyle} />
          </Field>

          <Field label="Message *" right={<Counter n={form.body.length} max={BODY_MAX} />}>
            <textarea rows={3} value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} maxLength={BODY_MAX} placeholder="e.g. A limited time offer is available — check it out now!" style={{ ...inputStyle, resize: 'vertical' }} />
          </Field>

          <Field label="Image (optional)">
            {imagePreview ? (
              <div style={{ position: 'relative' }}>
                <img src={imagePreview} alt="Notification preview" style={{ width: '100%', maxHeight: '140px', objectFit: 'cover', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'block' }} />
                {imageUploading ? (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#fff', fontSize: '0.85rem', fontWeight: 700 }}><Loader2 size={18} className="spin" /> Uploading…</div>
                ) : (
                  <button type="button" onClick={removeImage} aria-label="Remove image" style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(220,38,38,0.92)', border: 'none', borderRadius: '50%', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}><X size={14} /></button>
                )}
              </div>
            ) : (
              <div role="button" tabIndex={0} onClick={() => fileInputRef.current?.click()} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && fileInputRef.current?.click()} onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={(e) => { e.preventDefault(); setDragOver(false); uploadImage(e.dataTransfer.files?.[0]); }} style={{ border: `2px dashed ${dragOver ? '#7c3aed' : '#cbd5e1'}`, borderRadius: '12px', padding: '16px', textAlign: 'center', cursor: 'pointer', background: dragOver ? '#f5f3ff' : '#f8fafc' }}>
                <Upload size={20} color={dragOver ? '#7c3aed' : '#94a3b8'} style={{ margin: '0 auto 4px', display: 'block' }} />
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>Click or drop an image here</div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>PNG, JPG or WEBP, up to 5 MB</div>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => uploadImage(e.target.files?.[0])} style={{ display: 'none' }} />
          </Field>

          <Field label="Opens when tapped (optional)">
            <select value={form.link} onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))} style={inputStyle}>
              <option value="">Just open the app</option>
              {LINKS.map((g) => (
                <optgroup key={g.group} label={g.group}>
                  {g.items.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </optgroup>
              ))}
            </select>
          </Field>

          {result && (
            <div role="status" style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '12px 14px', borderRadius: '12px', fontSize: '0.86rem', fontWeight: 600, lineHeight: 1.45, background: result.ok ? '#f0fdf4' : '#fef2f2', border: `1px solid ${result.ok ? '#bbf7d0' : '#fecaca'}`, color: result.ok ? '#15803d' : '#b91c1c' }}>
              {result.ok ? <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: '1px' }} /> : <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '1px' }} />}
              <span>
                {result.ok
                  ? <>Delivered to <strong>{result.sent}</strong> of {result.total} device{result.total === 1 ? '' : 's'}.{result.failed > 0 && ` ${result.failed} failed${result.failureReasons?.length ? ` (${failureLine(result.failureReasons)})` : ''}.`}{result.removedStale > 0 && ` ${result.removedStale} expired device${result.removedStale === 1 ? '' : 's'} removed.`}</>
                  : result.message || 'The notification was not delivered.'}
              </span>
            </div>
          )}

          <button type="submit" disabled={!canSend} style={{ padding: '12px 22px', borderRadius: '12px', border: 'none', fontWeight: 800, fontSize: '0.9rem', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: canSend ? 'pointer' : 'not-allowed', opacity: canSend ? 1 : 0.5, background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', boxShadow: canSend ? '0 4px 14px rgba(124,58,237,0.3)' : 'none' }}>
            <Send size={17} /> {recipients > 0 ? `Send to ${recipients} ${audience.label.toLowerCase()}` : 'No subscribers to send to'}
          </button>
          {blockedReason && <div style={{ marginTop: '-6px', fontSize: '0.78rem', color: '#64748b', lineHeight: 1.45, textAlign: 'center' }}>{blockedReason}</div>}
        </form>

        {/* Preview */}
        <aside style={{ ...card, flex: '0 1 340px', minWidth: '280px', padding: '20px', position: 'sticky', top: '88px' }}>
          <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a', marginBottom: '14px' }}>Preview</div>
          <div style={{ background: '#1e293b', borderRadius: '16px', padding: '14px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0, background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Bell size={18} color="#fff" /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: form.title ? '#ffffff' : '#64748b', marginBottom: '4px', overflowWrap: 'anywhere' }}>{form.title || 'Notification title'}</div>
              <div style={{ fontSize: '0.78rem', color: form.body ? '#cbd5e1' : '#64748b', lineHeight: 1.4, overflowWrap: 'anywhere' }}>{form.body || 'Your message will appear here.'}</div>
              {imagePreview && <img src={imagePreview} alt="" style={{ width: '100%', borderRadius: '8px', marginTop: '8px', maxHeight: '90px', objectFit: 'cover' }} />}
              <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '6px' }}>Norozz • just now</div>
            </div>
          </div>
          <div style={{ marginTop: '12px', fontSize: '0.78rem', color: '#64748b', lineHeight: 1.6 }}>
            <div>To: <strong style={{ color: '#0f172a' }}>{audience.label}</strong></div>
            <div>On tap: <strong style={{ color: '#0f172a' }}>{linkLabel || 'Opens the app'}</strong></div>
          </div>
        </aside>
      </div>

      {/* History */}
      <div style={{ ...card, padding: '20px', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <h3 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 800, color: '#0f172a' }}>Recent broadcasts</h3>
          <button type="button" onClick={load} aria-label="Refresh" title="Refresh" style={{ padding: '7px 10px', border: '1px solid #e2e8f0', borderRadius: '10px', background: '#fff', cursor: 'pointer', display: 'inline-flex' }}>
            <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          </button>
        </div>
        <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
          <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={headRow}>
                {['#', 'Sent', 'Message', 'To', 'Delivered', 'By'].map((h) => <th key={h} style={{ padding: '11px 10px', fontWeight: 800, whiteSpace: 'nowrap' }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '32px 16px', textAlign: 'center', color: '#64748b', fontSize: '0.88rem' }}>{loading ? 'Loading…' : 'No broadcasts sent yet.'}</td></tr>
              ) : history.map((h, i) => (
                <tr key={h._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ ...td, color: '#94a3b8', fontWeight: 700, width: '48px' }}>{i + 1}</td>
                  <td style={{ ...td, whiteSpace: 'nowrap' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{fmtDate(h.createdAt)}</div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{fmtTime(h.createdAt)}</div>
                  </td>
                  <td style={{ ...td, maxWidth: '300px' }}>
                    <div style={{ fontWeight: 800, color: '#0f172a', overflowWrap: 'anywhere' }}>{h.title}</div>
                    <div style={{ fontSize: '0.76rem', color: '#64748b', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{h.body}</div>
                  </td>
                  <td style={{ ...td, textTransform: 'capitalize', whiteSpace: 'nowrap' }}>{h.audience === 'all' ? 'Everyone' : h.audience}</td>
                  <td style={{ ...td, whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '3px 10px', borderRadius: '9999px', background: h.delivered ? '#ecfdf5' : '#fef2f2', color: h.delivered ? '#047857' : '#b91c1c', border: `1px solid ${h.delivered ? '#a7f3d0' : '#fecaca'}` }}>
                      {h.delivered ? `${h.sent} of ${h.total}` : 'Not delivered'}
                    </span>
                    {h.failed > 0 && (
                      <div style={{ fontSize: '0.72rem', color: '#b45309', marginTop: '3px', whiteSpace: 'normal', maxWidth: '220px' }}>
                        {h.failed} failed{h.failureReasons?.length > 0 && <>: {failureLine(h.failureReasons)}</>}
                      </div>
                    )}
                  </td>
                  <td style={{ ...td, whiteSpace: 'nowrap', color: '#64748b' }}>{h.sentByName || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {confirming && <ConfirmModal audienceLabel={audience.label} count={recipients} busy={sending} onClose={() => setConfirming(false)} onConfirm={doSend} />}
    </div>
  );
};

export default SuperAdminNotificationsView;
