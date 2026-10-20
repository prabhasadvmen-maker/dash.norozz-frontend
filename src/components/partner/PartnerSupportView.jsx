import { useEffect, useRef, useState } from 'react';
import { Headphones, Loader2, Send, MessageSquare, AlertCircle, HelpCircle } from 'lucide-react';
import { partnerService } from '../../services/partner.service.js';
import { toast } from '../../utils/toast.js';

const COMPLAINT_TYPES = [
  'Payment Delay / Issue',
  'Customer Behavior',
  'Booking / Dispatch Issue',
  'App Technical Problem',
  'KYC / Account Issue',
  'Other',
];

const PartnerSupportView = () => {
  const [faqs, setFaqs] = useState([]);
  const [openFaq, setOpenFaq] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [messages, setMessages] = useState([]);
  const [chatText, setChatText] = useState('');
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ complaintType: COMPLAINT_TYPES[0], bookingId: '', description: '', priority: 'Medium' });
  const [submitting, setSubmitting] = useState(false);
  const chatEndRef = useRef(null);

  const loadComplaints = () =>
    partnerService.getComplaints()
      .then((res) => setComplaints(Array.isArray(res?.data) ? res.data : []))
      .catch(() => {});

  useEffect(() => {
    partnerService.getFaqs().then((res) => setFaqs(Array.isArray(res?.data) ? res.data : [])).catch(() => {});
    partnerService.getChatMessages().then((res) => setMessages(Array.isArray(res?.data) ? res.data : [])).catch(() => {});
    loadComplaints();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const sendChat = async (e) => {
    e.preventDefault();
    const text = chatText.trim();
    if (!text) return;
    setSending(true);
    setChatText('');
    try {
      const res = await partnerService.sendChatMessage({ text });
      if (Array.isArray(res?.data)) setMessages((prev) => [...prev, ...res.data]);
    } catch {
      setChatText(text);
    } finally {
      setSending(false);
    }
  };

  const submitComplaint = async (e) => {
    e.preventDefault();
    if (!form.description.trim()) return toast.error('Please describe your issue before submitting');
    setSubmitting(true);
    try {
      const res = await partnerService.submitComplaint(form);
      toast.success(`Complaint registered. Ticket ID: ${res?.data?.ticketId || ''}`);
      setForm({ ...form, description: '', bookingId: '' });
      loadComplaints();
    } catch {
      // interceptor shows the error toast
    } finally {
      setSubmitting(false);
    }
  };

  const card = { padding: '24px' };
  const h3 = { fontSize: '1.05rem', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' };
  const input = { width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '0.9rem' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="mui-card" style={card}>
        <h3 style={h3}><Headphones size={20} color="#2563eb" /> Technician Partner Helpdesk</h3>
        <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
          Need help with job dispatch, payouts or KYC? Chat with support below, raise a complaint, or call <strong>+91 1800 200 9090</strong>.
        </p>
      </div>

      <div className="mui-card" style={card}>
        <h3 style={h3}><MessageSquare size={20} color="#16a34a" /> Live Support Chat</h3>
        <div style={{ height: '260px', overflowY: 'auto', background: '#f1f5f9', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {messages.map((m) => (
            <div key={m._id || m.id} style={{ display: 'flex', justifyContent: m.sender === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{ maxWidth: '75%', padding: '8px 12px', borderRadius: '14px', fontSize: '0.86rem', background: m.sender === 'user' ? '#16a34a' : '#ffffff', color: m.sender === 'user' ? '#ffffff' : '#0f172a' }}>
                {m.sender !== 'user' && <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#2563eb' }}>{m.agentName || 'Support'}</div>}
                {m.text}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        <form onSubmit={sendChat} style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
          <input style={input} value={chatText} onChange={(e) => setChatText(e.target.value)} placeholder="Type your message..." />
          <button type="submit" disabled={sending} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            {sending ? <Loader2 size={16} className="spin" /> : <Send size={16} />} Send
          </button>
        </form>
      </div>

      <div className="mui-card" style={card}>
        <h3 style={h3}><AlertCircle size={20} color="#dc2626" /> Raise a Complaint</h3>
        <form onSubmit={submitComplaint} style={{ display: 'grid', gap: '10px' }}>
          <select style={input} value={form.complaintType} onChange={(e) => setForm({ ...form, complaintType: e.target.value })}>
            {COMPLAINT_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
          <input style={input} value={form.bookingId} onChange={(e) => setForm({ ...form, bookingId: e.target.value })} placeholder="Booking number (optional)" />
          <select style={input} value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
            {['Low', 'Medium', 'High'].map((p) => <option key={p}>{p}</option>)}
          </select>
          <textarea style={{ ...input, minHeight: '90px' }} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe your issue" />
          <button type="submit" disabled={submitting} className="btn btn-primary" style={{ justifySelf: 'start' }}>
            {submitting ? 'Submitting...' : 'Submit Complaint'}
          </button>
        </form>

        {complaints.length > 0 && (
          <div style={{ marginTop: '18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>Your Tickets</div>
            {complaints.map((c) => (
              <div key={c._id} style={{ padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '0.84rem', display: 'flex', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
                <span><strong>{c.ticketId}</strong> • {c.complaintType}</span>
                <span style={{ fontWeight: 700, color: c.status === 'Resolved' ? '#16a34a' : '#d97706' }}>{c.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {faqs.length > 0 && (
        <div className="mui-card" style={card}>
          <h3 style={h3}><HelpCircle size={20} color="#7c3aed" /> Frequently Asked Questions</h3>
          {faqs.map((f, i) => (
            <div key={f._id || i} style={{ borderBottom: '1px solid #e2e8f0', padding: '10px 0' }}>
              <button type="button" onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>
                {f.question}
              </button>
              {openFaq === i && <p style={{ margin: '8px 0 0', fontSize: '0.86rem', color: '#475569' }}>{f.answer}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PartnerSupportView;
