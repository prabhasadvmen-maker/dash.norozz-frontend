import { useEffect, useMemo, useState } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Headphones, Inbox, Loader, CheckCircle2, Search, RefreshCw, ChevronLeft, ChevronRight, X, Trash2, AlertTriangle, Send } from 'lucide-react';
import { superAdminService } from '../../services/superAdmin.service.js';
import { cityService } from '../../services/city.service.js';
import { toast } from '../../utils/toast.js';

const PAGE_SIZE = 10;

const STATUS_TABS = [
  { id: 'all', label: 'All' },
  { id: 'Open', label: 'Open' },
  { id: 'In Progress', label: 'In progress' },
  { id: 'Resolved', label: 'Resolved' },
];
const STATUS_STYLE = {
  Open: { bg: '#fef2f2', color: '#b91c1c', border: '#fecaca' },
  'In Progress': { bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
  Resolved: { bg: '#ecfdf5', color: '#047857', border: '#a7f3d0' },
  Closed: { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' },
};
const PRIORITY_STYLE = {
  Urgent: { bg: '#fef2f2', color: '#b91c1c' },
  High: { bg: '#fff7ed', color: '#c2410c' },
  Medium: { bg: '#f1f5f9', color: '#475569' },
  Low: { bg: '#f8fafc', color: '#94a3b8' },
};
const TYPE_LABEL = { customer: 'Customer', partner: 'Partner', city_admin: 'City admin' };

const card = { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)' };
const inputStyle = { padding: '8px 11px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '0.84rem', color: '#0f172a', background: '#ffffff' };
const headRow = { background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' };
const td = { padding: '12px 10px', fontSize: '0.84rem', color: '#334155', verticalAlign: 'middle' };

const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
const fmtTime = (d) => new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

const StatusPill = ({ status }) => {
  const s = STATUS_STYLE[status] || STATUS_STYLE.Open;
  return <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '3px 10px', borderRadius: '9999px', background: s.bg, color: s.color, border: `1px solid ${s.border}`, whiteSpace: 'nowrap' }}>● {status}</span>;
};
const PriorityTag = ({ priority }) => {
  const p = PRIORITY_STYLE[priority] || PRIORITY_STYLE.Medium;
  return <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '3px 9px', borderRadius: '6px', background: p.bg, color: p.color, whiteSpace: 'nowrap' }}>{priority || 'Medium'}</span>;
};

const StatCard = ({ icon: Icon, color, bg, label, value }) => (
  <div style={{ ...card, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={20} color={color} />
    </div>
    <div>
      <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.1 }}>{value ?? '—'}</div>
      <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px', marginTop: '2px' }}>{label}</div>
    </div>
  </div>
);

const Th = ({ children, right }) => <th style={{ padding: '11px 10px', fontWeight: 800, whiteSpace: 'nowrap', textAlign: right ? 'right' : 'left' }}>{children}</th>;

const Overlay = ({ onClose, maxWidth, label, children }) => {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" role="dialog" aria-modal="true" aria-label={label} onClick={(e) => e.stopPropagation()} style={{ padding: '26px', maxWidth }}>{children}</div>
    </div>
  );
};

const CloseBtn = ({ onClick }) => (
  <button type="button" onClick={onClick} aria-label="Close" style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '50%', color: '#64748b', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}><X size={18} /></button>
);

const Field = ({ label, children }) => (
  <div style={{ minWidth: 0 }}>
    <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{label}</div>
    <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a', marginTop: '2px', overflowWrap: 'anywhere' }}>{children}</div>
  </div>
);

const TicketModal = ({ ticket, onClose, onSave, saving }) => {
  const [status, setStatus] = useState(ticket.status || 'Open');
  const [priority, setPriority] = useState(ticket.priority || 'Medium');
  const [note, setNote] = useState(ticket.adminNote || '');
  const dirty = status !== ticket.status || priority !== (ticket.priority || 'Medium') || note.trim() !== (ticket.adminNote || '');

  return (
    <Overlay onClose={onClose} maxWidth={620} label="Ticket details">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '16px' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 900, color: '#2563eb', fontSize: '0.95rem' }}>#{ticket.ticketId}</span>
            <StatusPill status={ticket.status} />
            <PriorityTag priority={ticket.priority} />
          </div>
          <h3 style={{ margin: '8px 0 0', fontSize: '1.1rem', fontWeight: 800, overflowWrap: 'anywhere' }}>{ticket.subject}</h3>
        </div>
        <CloseBtn onClick={onClose} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '14px', padding: '14px', background: '#f8fafc', borderRadius: '12px', marginBottom: '16px' }}>
        <Field label="Raised by">{ticket.userName || 'Unknown'} <span style={{ color: '#94a3b8', fontWeight: 600 }}>· {TYPE_LABEL[ticket.userType] || 'Customer'}</span></Field>
        <Field label="Contact">{ticket.userPhone || ticket.userEmail || 'No contact'}</Field>
        <Field label="City">{ticket.city || '—'}</Field>
        <Field label="Category">{ticket.category || 'General'}</Field>
        <Field label="Booking reference">{ticket.bookingId || 'Not linked'}</Field>
        <Field label="Created">{fmtDate(ticket.createdAt)}, {fmtTime(ticket.createdAt)}</Field>
        {ticket.resolvedAt && <Field label="Resolved">{fmtDate(ticket.resolvedAt)}{ticket.resolvedBy ? ` by ${ticket.resolvedBy}` : ''}</Field>}
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>Issue description</div>
        <div style={{ padding: '12px 14px', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '0.86rem', lineHeight: 1.6, color: '#334155', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{ticket.description}</div>
      </div>

      {ticket.replies?.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>Conversation ({ticket.replies.length})</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
            {ticket.replies.map((r) => (
              <div key={r._id || r.createdAt} style={{ padding: '10px 12px', borderRadius: '12px', background: r.senderType === 'admin' ? '#eff6ff' : '#f8fafc', border: `1px solid ${r.senderType === 'admin' ? '#bfdbfe' : '#e2e8f0'}`, fontSize: '0.84rem', color: '#334155' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', marginBottom: '2px' }}>{r.senderName || (r.senderType === 'admin' ? 'Support' : 'Customer')} · {fmtDate(r.createdAt)}, {fmtTime(r.createdAt)}</div>
                {r.message}
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '14px', marginBottom: '14px' }}>
        <label style={{ display: 'block' }}>
          <span style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>Status</span>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="form-input" style={{ width: '100%' }}>
            {['Open', 'In Progress', 'Resolved', 'Closed'].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <label style={{ display: 'block' }}>
          <span style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>Priority</span>
          <select value={priority} onChange={(e) => setPriority(e.target.value)} className="form-input" style={{ width: '100%' }}>
            {['Low', 'Medium', 'High', 'Urgent'].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
      </div>

      <label style={{ display: 'block', marginBottom: '22px' }}>
        <span style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#334155', marginBottom: '2px' }}>Reply to the customer</span>
        <span style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', marginBottom: '6px' }}>This message is shown to them as Norozz Support&apos;s reply.</span>
        <textarea rows={4} className="form-input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Write the resolution or next steps…" style={{ width: '100%', resize: 'vertical' }} />
      </label>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button type="button" className="btn btn-primary" disabled={saving || !dirty} onClick={() => onSave({ status, priority, adminNote: note.trim() })} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <Send size={15} /> {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </Overlay>
  );
};

const DeleteModal = ({ ticket, onClose, onConfirm, busy }) => (
  <Overlay onClose={onClose} maxWidth={420} label="Delete ticket">
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
      <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Delete ticket</h3>
      <CloseBtn onClick={onClose} />
    </div>
    <div style={{ display: 'flex', gap: '12px', padding: '12px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', color: '#991b1b', fontSize: '0.86rem', lineHeight: 1.45 }}>
      <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '1px' }} />
      <div>Permanently delete <strong>#{ticket.ticketId}</strong> ({ticket.subject})? This cannot be undone. To keep a record, mark it Resolved instead.</div>
    </div>
    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '22px' }}>
      <button type="button" className="btn btn-secondary" onClick={onClose} disabled={busy}>Cancel</button>
      <button type="button" className="btn" disabled={busy} onClick={onConfirm} style={{ background: '#dc2626', color: '#fff', border: 'none' }}>{busy ? 'Deleting…' : 'Delete ticket'}</button>
    </div>
  </Overlay>
);

const SuperAdminTicketsView = () => {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('all');
  const [city, setCity] = useState('all');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [dialog, setDialog] = useState(null); // { type: 'view' | 'delete', id }

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput.trim()); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const params = useMemo(() => ({ status, city, search: search || undefined }), [status, city, search]);

  const list = useQuery({
    queryKey: ['superAdmin', 'tickets', params],
    queryFn: async () => {
      const res = await superAdminService.getTickets(params);
      const rows = res?.data ?? res;
      return Array.isArray(rows) ? rows : [];
    },
    placeholderData: keepPreviousData,
    retry: false,
  });
  const summary = useQuery({
    queryKey: ['superAdmin', 'tickets', 'summary'],
    queryFn: async () => (await superAdminService.getTicketSummary())?.data ?? null,
    retry: false,
  });
  const cities = useQuery({
    queryKey: ['superAdmin', 'tickets', 'cities'],
    queryFn: async () => {
      const res = await cityService.getActiveCities();
      const rows = res?.data?.data || res?.data || [];
      return Array.isArray(rows) ? rows : [];
    },
    retry: false,
  });

  const refreshAll = () => queryClient.invalidateQueries({ queryKey: ['superAdmin', 'tickets'] });

  const update = useMutation({
    mutationFn: ({ id, data }) => superAdminService.updateTicketStatus(id, { ...data, resolvedBy: 'Super Admin' }),
    onSuccess: () => { toast.success('Ticket updated'); setDialog(null); refreshAll(); },
    onError: () => toast.error('Could not update the ticket. Please try again.'),
  });
  const remove = useMutation({
    mutationFn: (id) => superAdminService.deleteTicket(id),
    onSuccess: () => { toast.success('Ticket deleted'); setDialog(null); refreshAll(); },
    onError: () => toast.error('Could not delete the ticket. Please try again.'),
  });

  const tickets = list.data || [];
  const totalPages = Math.max(1, Math.ceil(tickets.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const visible = tickets.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const target = dialog ? tickets.find((t) => t._id === dialog.id) : null;
  const s = summary.data;
  const tabCount = { all: s?.total, Open: s?.open, 'In Progress': s?.inProgress, Resolved: s?.resolved };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        <StatCard icon={Headphones} color="#2563eb" bg="#eff6ff" label="Total tickets" value={s?.total} />
        <StatCard icon={Inbox} color="#dc2626" bg="#fef2f2" label="Open" value={s?.open} />
        <StatCard icon={Loader} color="#d97706" bg="#fffbeb" label="In progress" value={s?.inProgress} />
        <StatCard icon={CheckCircle2} color="#059669" bg="#ecfdf5" label="Resolved / closed" value={s?.resolved} />
      </div>

      <div style={{ ...card, padding: '20px', minWidth: 0 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div role="tablist" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {STATUS_TABS.map((t) => {
              const active = status === t.id;
              return (
                <button key={t.id} type="button" role="tab" aria-selected={active} onClick={() => { setStatus(t.id); setPage(1); }} style={{ padding: '6px 13px', borderRadius: '9999px', border: `1px solid ${active ? '#2563eb' : '#e2e8f0'}`, background: active ? '#2563eb' : '#ffffff', color: active ? '#ffffff' : '#475569', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  {t.label}{tabCount[t.id] !== undefined && <span style={{ opacity: 0.75, marginLeft: '6px' }}>{tabCount[t.id]}</span>}
                </button>
              );
            })}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
            <select aria-label="City filter" value={city} onChange={(e) => { setCity(e.target.value); setPage(1); }} style={inputStyle}>
              <option value="all">All cities</option>
              {(cities.data || []).map((c) => <option key={c._id} value={c.name}>{c.name}</option>)}
            </select>
            <label style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
              <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '10px' }} />
              <input type="search" placeholder="Search ticket, name, phone, booking" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} style={{ ...inputStyle, paddingLeft: '30px', width: '250px' }} />
            </label>
            <button type="button" onClick={refreshAll} aria-label="Refresh tickets" title="Refresh" style={{ ...inputStyle, display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
              <RefreshCw size={14} style={{ animation: list.isFetching ? 'spin 1s linear infinite' : 'none' }} />
            </button>
          </div>
        </div>

        {list.isError && (
          <div role="alert" style={{ padding: '12px 14px', marginBottom: '14px', borderRadius: '12px', background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: '0.85rem', fontWeight: 600 }}>
            Could not load support tickets. Check your connection and try Refresh.
          </div>
        )}

        <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px', opacity: list.isFetching ? 0.75 : 1 }}>
          <table style={{ width: '100%', minWidth: '860px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={headRow}>
                <Th>#</Th><Th>Ticket</Th><Th>Raised by</Th><Th>Issue</Th><Th>City</Th><Th>Priority</Th><Th>Status</Th><Th right>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: '40px 16px', textAlign: 'center', color: '#64748b', fontSize: '0.88rem' }}>
                  {list.isLoading ? 'Loading support tickets…' : 'No support tickets match these filters.'}
                </td></tr>
              ) : visible.map((t, i) => (
                <tr key={t._id} onClick={() => setDialog({ type: 'view', id: t._id })} style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                  <td style={{ ...td, width: '48px', color: '#94a3b8', fontWeight: 700 }}>{(current - 1) * PAGE_SIZE + i + 1}</td>
                  <td style={{ ...td, whiteSpace: 'nowrap' }}>
                    <div style={{ fontWeight: 900, color: '#2563eb' }}>#{t.ticketId}</div>
                    <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>{fmtDate(t.createdAt)}, {fmtTime(t.createdAt)}</div>
                  </td>
                  <td style={td}>
                    <div style={{ fontWeight: 800, color: '#0f172a' }}>{t.userName || 'Unknown'}</div>
                    <div style={{ fontSize: '0.76rem', color: '#64748b' }}>{TYPE_LABEL[t.userType] || 'Customer'} · {t.userPhone || t.userEmail || 'No contact'}</div>
                  </td>
                  <td style={{ ...td, maxWidth: '280px' }}>
                    <div title={t.subject} style={{ fontWeight: 700, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.subject}</div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{t.category || 'General'}{t.bookingId ? ` · ${t.bookingId}` : ''}</div>
                  </td>
                  <td style={{ ...td, whiteSpace: 'nowrap', fontWeight: 600 }}>{t.city || '—'}</td>
                  <td style={td}><PriorityTag priority={t.priority} /></td>
                  <td style={td}><StatusPill status={t.status} /></td>
                  <td style={{ ...td, textAlign: 'right', whiteSpace: 'nowrap' }} onClick={(e) => e.stopPropagation()}>
                    <button type="button" onClick={() => setDialog({ type: 'view', id: t._id })} style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #bfdbfe', background: '#eff6ff', color: '#1d4ed8', fontWeight: 800, fontSize: '0.78rem', cursor: 'pointer' }}>View &amp; reply</button>
                    <button type="button" aria-label={`Delete ticket ${t.ticketId}`} title="Delete ticket" onClick={() => setDialog({ type: 'delete', id: t._id })} style={{ marginLeft: '6px', padding: '6px 9px', borderRadius: '8px', border: '1px solid #fecaca', background: '#fff5f5', color: '#dc2626', cursor: 'pointer', verticalAlign: 'middle' }}>
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {tickets.length > PAGE_SIZE && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginTop: '14px', fontSize: '0.8rem', color: '#64748b', flexWrap: 'wrap' }}>
            <span>Showing {(current - 1) * PAGE_SIZE + 1}–{Math.min(current * PAGE_SIZE, tickets.length)} of {tickets.length}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Page {current} of {totalPages}</span>
              <button type="button" aria-label="Previous page" disabled={current <= 1} onClick={() => setPage(current - 1)} style={{ ...inputStyle, padding: '6px 8px', cursor: 'pointer', opacity: current <= 1 ? 0.5 : 1 }}><ChevronLeft size={14} /></button>
              <button type="button" aria-label="Next page" disabled={current >= totalPages} onClick={() => setPage(current + 1)} style={{ ...inputStyle, padding: '6px 8px', cursor: 'pointer', opacity: current >= totalPages ? 0.5 : 1 }}><ChevronRight size={14} /></button>
            </div>
          </div>
        )}
      </div>

      {target && dialog.type === 'view' && (
        <TicketModal key={target._id} ticket={target} saving={update.isPending} onClose={() => setDialog(null)} onSave={(data) => update.mutate({ id: target._id, data })} />
      )}
      {target && dialog.type === 'delete' && (
        <DeleteModal ticket={target} busy={remove.isPending} onClose={() => setDialog(null)} onConfirm={() => remove.mutate(target._id)} />
      )}
    </div>
  );
};

export default SuperAdminTicketsView;
