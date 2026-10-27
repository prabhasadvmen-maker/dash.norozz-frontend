import { useEffect, useMemo, useRef, useState } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Star, MessageSquare, Flag, EyeOff, Search, MoreVertical, CheckCircle2, Trash2, ChevronLeft, ChevronRight, X, AlertTriangle, ArrowRight } from 'lucide-react';
import { superAdminService } from '../../services/superAdmin.service.js';
import { toast } from '../../utils/toast.js';

const PAGE_SIZE = 10;

const STATUS_TABS = [
  { id: '', label: 'All', key: 'total' },
  { id: 'PUBLISHED', label: 'Published', key: 'published' },
  { id: 'FLAGGED', label: 'Flagged', key: 'flagged' },
  { id: 'HIDDEN', label: 'Hidden', key: 'hidden' },
];
const STATUS_STYLE = {
  PUBLISHED: { label: 'Published', bg: '#ecfdf5', color: '#047857', border: '#a7f3d0' },
  FLAGGED: { label: 'Flagged', bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' },
  HIDDEN: { label: 'Hidden', bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' },
};

const card = { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)' };
const inputStyle = { padding: '8px 11px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '0.84rem', color: '#0f172a', background: '#ffffff' };
const headRow = { background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' };
const td = { padding: '12px 10px', fontSize: '0.84rem', color: '#334155', verticalAlign: 'top' };

const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
// Comments are stored HTML-escaped; React escapes again on render, so show the original characters
const plain = (t) => String(t || '').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const nameOf = (u) => u?.name || u?.agencyName || u?.email || 'Deleted user';

const Stars = ({ value, size = 14 }) => (
  <span style={{ display: 'inline-flex', gap: '1px' }} aria-label={`${value} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={size} color={i <= value ? '#f59e0b' : '#e2e8f0'} fill={i <= value ? '#f59e0b' : '#e2e8f0'} />)}
  </span>
);

const StatusPill = ({ status }) => {
  const s = STATUS_STYLE[status] || STATUS_STYLE.PUBLISHED;
  return <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '3px 10px', borderRadius: '9999px', background: s.bg, color: s.color, border: `1px solid ${s.border}`, whiteSpace: 'nowrap' }}>● {s.label}</span>;
};

const StatCard = ({ icon: Icon, color, bg, label, value, sub }) => (
  <div style={{ ...card, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={20} color={color} />
    </div>
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.1 }}>{value ?? '—'}</div>
      <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px', marginTop: '2px' }}>{label}</div>
      {sub && <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '1px' }}>{sub}</div>}
    </div>
  </div>
);

const Th = ({ children }) => <th style={{ padding: '11px 10px', fontWeight: 800, whiteSpace: 'nowrap', textAlign: 'left' }}>{children}</th>;

const menuItem = (color) => ({ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '9px 12px', background: 'transparent', border: 'none', borderRadius: '8px', color, fontSize: '0.84rem', fontWeight: 700, cursor: 'pointer', textAlign: 'left', whiteSpace: 'nowrap' });

const RowMenu = ({ status, onSet, onDelete }) => {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState(null);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const close = () => setOpen(false);
    const onDown = (e) => ref.current && !ref.current.contains(e.target) && close();
    const onKey = (e) => e.key === 'Escape' && close();
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', close);
    window.addEventListener('scroll', close, true);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', close);
      window.removeEventListener('scroll', close, true);
    };
  }, [open]);
  // The table scrolls horizontally, which would clip an absolutely positioned menu, so it is fixed to the viewport
  const toggle = (e) => {
    if (!open) {
      const r = e.currentTarget.getBoundingClientRect();
      const flip = r.bottom + 190 > window.innerHeight;
      setPos({ right: window.innerWidth - r.right, ...(flip ? { bottom: window.innerHeight - r.top + 4 } : { top: r.bottom + 4 }) });
    }
    setOpen((o) => !o);
  };
  const run = (fn) => () => { setOpen(false); fn(); };
  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button type="button" aria-label="Review actions" aria-haspopup="menu" aria-expanded={open} onClick={toggle} style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: open ? '#f1f5f9' : 'transparent', border: '1px solid transparent', borderRadius: '10px', color: '#64748b', cursor: 'pointer' }}>
        <MoreVertical size={18} />
      </button>
      {open && pos && (
        <div role="menu" style={{ position: 'fixed', ...pos, zIndex: 1100, minWidth: '180px', padding: '6px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 12px 30px rgba(15, 23, 42, 0.14)' }}>
          {status !== 'PUBLISHED' && <button type="button" role="menuitem" onClick={run(() => onSet('PUBLISHED'))} style={menuItem('#047857')}><CheckCircle2 size={16} /> Publish</button>}
          {status !== 'FLAGGED' && <button type="button" role="menuitem" onClick={run(() => onSet('FLAGGED'))} style={menuItem('#c2410c')}><Flag size={16} /> Flag for review</button>}
          {status !== 'HIDDEN' && <button type="button" role="menuitem" onClick={run(() => onSet('HIDDEN'))} style={menuItem('#475569')}><EyeOff size={16} /> Hide from app</button>}
          <div style={{ height: '1px', background: '#f1f5f9', margin: '4px 0' }} />
          <button type="button" role="menuitem" onClick={run(onDelete)} style={menuItem('#dc2626')}><Trash2 size={16} /> Delete</button>
        </div>
      )}
    </div>
  );
};

const DeleteModal = ({ review, busy, onClose, onConfirm }) => {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" role="dialog" aria-modal="true" aria-label="Delete review" onClick={(e) => e.stopPropagation()} style={{ padding: '26px', maxWidth: '430px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Delete review</h3>
          <button type="button" onClick={onClose} aria-label="Close" style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '50%', color: '#64748b', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={18} /></button>
        </div>
        <div style={{ display: 'flex', gap: '12px', padding: '12px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', color: '#991b1b', fontSize: '0.86rem', lineHeight: 1.45 }}>
          <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '1px' }} />
          <div>Delete the {review.rating}★ review by <strong>{nameOf(review.reviewerId)}</strong>? It is removed everywhere and {nameOf(review.revieweeId)}&apos;s rating is recalculated. If you only need it off the app for now, use Hide instead.</div>
        </div>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '22px' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={busy}>Cancel</button>
          <button type="button" className="btn" disabled={busy} onClick={onConfirm} style={{ background: '#dc2626', color: '#fff', border: 'none' }}>{busy ? 'Deleting…' : 'Delete review'}</button>
        </div>
      </div>
    </div>
  );
};

const SuperAdminReviewsView = () => {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('');
  const [rating, setRating] = useState('');
  const [reviewerRole, setReviewerRole] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput.trim()); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const params = useMemo(() => ({ status: status || undefined, rating: rating || undefined, reviewerRole: reviewerRole || undefined, search: search || undefined, page, limit: PAGE_SIZE }), [status, rating, reviewerRole, search, page]);

  const summary = useQuery({
    queryKey: ['superAdmin', 'reviews', 'summary'],
    queryFn: async () => (await superAdminService.getReviewSummary())?.data ?? null,
    retry: false,
  });
  const list = useQuery({
    queryKey: ['superAdmin', 'reviews', 'list', params],
    queryFn: async () => (await superAdminService.getReviews(params))?.data ?? null,
    placeholderData: keepPreviousData,
    retry: false,
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['superAdmin', 'reviews'] });
  const moderate = useMutation({
    mutationFn: ({ id, next }) => superAdminService.moderateReview(id, next),
    onSuccess: (_res, { next }) => {
      toast.success(next === 'DELETED' ? 'Review deleted' : `Review marked ${STATUS_STYLE[next].label.toLowerCase()}`);
      setDeleting(null);
      refresh();
    },
    onError: () => toast.error('Could not update the review. Please try again.'),
  });

  const s = summary.data;
  const reviews = list.data?.reviews || [];
  const pg = list.data?.pagination;
  const dist = s?.distribution || {};
  const distMax = Math.max(1, ...Object.values(dist));
  const filtered = status || rating || reviewerRole || search;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px' }}>
        <StatCard icon={Star} color="#d97706" bg="#fffbeb" label="Platform rating" value={s?.averageRating != null ? `${s.averageRating} ★` : s ? 'No ratings' : '—'} sub={s ? `from ${s.published} published review${s.published === 1 ? '' : 's'}` : undefined} />
        <StatCard icon={MessageSquare} color="#2563eb" bg="#eff6ff" label="Total reviews" value={s?.total} />
        <StatCard icon={Flag} color="#c2410c" bg="#fff7ed" label="Flagged" value={s?.flagged} sub={s?.flagged ? 'Need your attention' : undefined} />
        <StatCard icon={EyeOff} color="#475569" bg="#f1f5f9" label="Hidden" value={s?.hidden} />
      </div>

      {s?.published > 0 && (
        <div style={{ ...card, padding: '18px 20px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '10px' }}>Rating breakdown (published)</div>
          {[5, 4, 3, 2, 1].map((star) => (
            <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', fontSize: '0.8rem' }}>
              <span style={{ width: '28px', fontWeight: 700, color: '#475569' }}>{star} ★</span>
              <div style={{ flex: 1, height: '8px', background: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden' }}>
                <div style={{ width: `${((dist[star] || 0) / distMax) * 100}%`, height: '100%', background: star >= 4 ? '#10b981' : star === 3 ? '#f59e0b' : '#ef4444' }} />
              </div>
              <span style={{ width: '32px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>{dist[star] || 0}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ ...card, padding: '20px', minWidth: 0 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div role="tablist" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {STATUS_TABS.map((t) => {
              const active = status === t.id;
              return (
                <button key={t.label} type="button" role="tab" aria-selected={active} onClick={() => { setStatus(t.id); setPage(1); }} style={{ padding: '6px 13px', borderRadius: '9999px', border: `1px solid ${active ? '#059669' : '#e2e8f0'}`, background: active ? '#059669' : '#ffffff', color: active ? '#ffffff' : '#475569', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  {t.label}{s && <span style={{ opacity: 0.75, marginLeft: '6px' }}>{s[t.key]}</span>}
                </button>
              );
            })}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <select aria-label="Review direction" value={reviewerRole} onChange={(e) => { setReviewerRole(e.target.value); setPage(1); }} style={inputStyle}>
              <option value="">All reviews</option>
              <option value="CUSTOMER">Customer → Partner</option>
              <option value="PARTNER">Partner → Customer</option>
            </select>
            <select aria-label="Star rating filter" value={rating} onChange={(e) => { setRating(e.target.value); setPage(1); }} style={inputStyle}>
              <option value="">Any rating</option>
              {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} star{n > 1 ? 's' : ''}</option>)}
            </select>
            <label style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
              <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '10px' }} />
              <input type="search" placeholder="Search name or comment" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} style={{ ...inputStyle, paddingLeft: '30px', width: '210px' }} />
            </label>
          </div>
        </div>

        {list.isError && (
          <div role="alert" style={{ padding: '12px 14px', marginBottom: '14px', borderRadius: '12px', background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: '0.85rem', fontWeight: 600 }}>
            Could not load reviews. Check your connection and press Refresh.
          </div>
        )}

        <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px', opacity: list.isFetching ? 0.75 : 1 }}>
          <table style={{ width: '100%', minWidth: '820px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={headRow}><Th>#</Th><Th>Rating &amp; feedback</Th><Th>From → To</Th><Th>Booking</Th><Th>Status</Th><th style={{ width: '48px' }} /></tr>
            </thead>
            <tbody>
              {reviews.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '40px 16px', textAlign: 'center', color: '#64748b', fontSize: '0.88rem' }}>
                  {list.isLoading ? 'Loading reviews…' : filtered ? 'No reviews match these filters.' : 'No reviews have been submitted yet. Ratings from customers and partners will appear here.'}
                </td></tr>
              ) : reviews.map((r, i) => (
                <tr key={r._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ ...td, width: '48px', color: '#94a3b8', fontWeight: 700 }}>{((pg?.page || 1) - 1) * PAGE_SIZE + i + 1}</td>
                  <td style={{ ...td, maxWidth: '360px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Stars value={r.rating} />
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{fmtDate(r.createdAt)}{r.isEdited ? ' · edited' : ''}</span>
                    </div>
                    <div style={{ marginTop: '5px', color: r.comment ? '#334155' : '#94a3b8', lineHeight: 1.45, overflowWrap: 'anywhere', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} title={plain(r.comment)}>
                      {r.comment ? plain(r.comment) : 'No written feedback'}
                    </div>
                  </td>
                  <td style={td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 800, color: '#0f172a' }}>{nameOf(r.reviewerId)}</span>
                      <ArrowRight size={13} color="#94a3b8" />
                      <span style={{ fontWeight: 800, color: '#0f172a' }}>{nameOf(r.revieweeId)}</span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>{r.reviewerRole === 'CUSTOMER' ? 'Customer reviewing a partner' : 'Partner reviewing a customer'}</div>
                  </td>
                  <td style={{ ...td, whiteSpace: 'nowrap' }}>
                    <div style={{ fontWeight: 700, color: '#2563eb' }}>{r.orderId?.bookingId || '—'}</div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{r.orderId?.packageName || ''}</div>
                  </td>
                  <td style={{ ...td, whiteSpace: 'nowrap' }}><StatusPill status={r.status} /></td>
                  <td style={{ ...td, textAlign: 'right' }}>
                    <RowMenu status={r.status} onSet={(next) => moderate.mutate({ id: r._id, next })} onDelete={() => setDeleting(r)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pg && pg.totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginTop: '14px', fontSize: '0.8rem', color: '#64748b', flexWrap: 'wrap' }}>
            <span>Showing {(pg.page - 1) * pg.limit + 1}–{Math.min(pg.page * pg.limit, pg.total)} of {pg.total}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Page {pg.page} of {pg.totalPages}</span>
              <button type="button" aria-label="Previous page" disabled={pg.page <= 1} onClick={() => setPage(pg.page - 1)} style={{ ...inputStyle, padding: '6px 8px', cursor: 'pointer', opacity: pg.page <= 1 ? 0.5 : 1 }}><ChevronLeft size={14} /></button>
              <button type="button" aria-label="Next page" disabled={pg.page >= pg.totalPages} onClick={() => setPage(pg.page + 1)} style={{ ...inputStyle, padding: '6px 8px', cursor: 'pointer', opacity: pg.page >= pg.totalPages ? 0.5 : 1 }}><ChevronRight size={14} /></button>
            </div>
          </div>
        )}
      </div>

      {deleting && <DeleteModal review={deleting} busy={moderate.isPending} onClose={() => setDeleting(null)} onConfirm={() => moderate.mutate({ id: deleting._id, next: 'DELETED' })} />}
    </div>
  );
};

export default SuperAdminReviewsView;
