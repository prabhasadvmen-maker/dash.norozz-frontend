import { useEffect, useMemo, useRef, useState } from 'react';
import { Wrench, Grid, IndianRupee, ImageOff, Plus, Search, MoreVertical, Eye, Pencil, Trash2, Package, X, Clock, ImageIcon, Video, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCatalog } from '../../hooks/useCatalog.js';

const PAGE_SIZE = 12;

const STATUS = {
  active: { label: 'Active', bg: '#ecfdf5', color: '#047857', border: '#a7f3d0' },
  inactive: { label: 'Inactive', bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
  deleted: { label: 'Deleted', bg: '#fef2f2', color: '#b91c1c', border: '#fecaca' },
};
const SORTS = [
  { id: 'newest', label: 'Newest first' },
  { id: 'name', label: 'Name A–Z' },
  { id: 'priceHigh', label: 'Price: high to low' },
  { id: 'priceLow', label: 'Price: low to high' },
];

const card = { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)' };
const inputStyle = { padding: '8px 11px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '0.84rem', color: '#0f172a', background: '#ffffff' };

const idOf = (v) => (v && typeof v === 'object' ? v._id : v);
const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');
const coverOf = (s) => s.thumbnail || s.image || (Array.isArray(s.gallery) && s.gallery[0]) || '';
const photoCount = (s) => (Array.isArray(s.gallery) ? s.gallery.length : 0);
const videoCount = (s) => (Array.isArray(s.videos) && s.videos.length ? s.videos.length : s.videoUrl ? 1 : 0);
const finalOf = (s) => (s.finalPrice > 0 ? s.finalPrice : Math.max(0, (s.price || 0) - (s.discount || 0)));

const StatusPill = ({ status }) => {
  const s = STATUS[status] || STATUS.active;
  return <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '3px 10px', borderRadius: '9999px', background: s.bg, color: s.color, border: `1px solid ${s.border}`, whiteSpace: 'nowrap' }}>● {s.label}</span>;
};

const Tag = ({ children, bg, color, border }) => (
  <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '3px 9px', borderRadius: '8px', background: bg, color, border: `1px solid ${border}`, whiteSpace: 'nowrap', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}>{children}</span>
);

const StatCard = ({ icon: Icon, color, bg, label, value }) => (
  <div style={{ ...card, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={20} color={color} />
    </div>
    <div>
      <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px', marginTop: '2px' }}>{label}</div>
    </div>
  </div>
);

const menuItem = (color) => ({ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '9px 12px', background: 'transparent', border: 'none', borderRadius: '8px', color, fontSize: '0.84rem', fontWeight: 700, cursor: 'pointer', textAlign: 'left', whiteSpace: 'nowrap' });

const CardMenu = ({ onView, onEdit, onPackages, onDelete }) => {
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

  const toggle = (e) => {
    if (!open) {
      const r = e.currentTarget.getBoundingClientRect();
      const flip = r.bottom + 200 > window.innerHeight;
      setPos({ right: window.innerWidth - r.right, ...(flip ? { bottom: window.innerHeight - r.top + 4 } : { top: r.bottom + 4 }) });
    }
    setOpen((o) => !o);
  };
  const pick = (fn) => () => { setOpen(false); fn(); };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button type="button" aria-label="Service actions" aria-haspopup="menu" aria-expanded={open} onClick={toggle} style={{ width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.95)', border: '1px solid #e2e8f0', borderRadius: '10px', color: '#475569', cursor: 'pointer', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.12)' }}>
        <MoreVertical size={18} />
      </button>
      {open && pos && (
        <div role="menu" style={{ position: 'fixed', ...pos, zIndex: 1100, minWidth: '180px', padding: '6px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 12px 30px rgba(15, 23, 42, 0.14)' }}>
          <button type="button" role="menuitem" onClick={pick(onView)} style={menuItem('#334155')}><Eye size={16} color="#2563eb" /> View details</button>
          <button type="button" role="menuitem" onClick={pick(onEdit)} style={menuItem('#334155')}><Pencil size={16} color="#d97706" /> Edit service</button>
          <button type="button" role="menuitem" onClick={pick(onPackages)} style={menuItem('#334155')}><Package size={16} color="#059669" /> Manage packages</button>
          <div style={{ height: '1px', background: '#f1f5f9', margin: '4px 0' }} />
          <button type="button" role="menuitem" onClick={pick(onDelete)} style={menuItem('#dc2626')}><Trash2 size={16} /> Delete</button>
        </div>
      )}
    </div>
  );
};

const ServiceCard = ({ srv, catName, subName, onView, onEdit, onPackages, onDelete }) => {
  const cover = coverOf(srv);
  const photos = photoCount(srv);
  const videos = videoCount(srv);
  const hasDiscount = srv.discount > 0 && srv.price > finalOf(srv);
  return (
    <div style={{ ...card, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
      <div style={{ position: 'relative', height: '150px', background: '#f1f5f9' }}>
        {cover ? (
          <img src={cover} alt={srv.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        ) : (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}><ImageOff size={34} /></div>
        )}
        <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
          <CardMenu onView={onView} onEdit={onEdit} onPackages={onPackages} onDelete={onDelete} />
        </div>
        {(photos > 0 || videos > 0) && (
          <div style={{ position: 'absolute', left: '10px', bottom: '10px', display: 'flex', gap: '6px' }}>
            {photos > 0 && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '8px', background: 'rgba(15,23,42,0.72)', color: '#fff', fontSize: '0.7rem', fontWeight: 700 }}><ImageIcon size={12} /> {photos}</span>}
            {videos > 0 && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '8px', background: 'rgba(15,23,42,0.72)', color: '#fff', fontSize: '0.7rem', fontWeight: 700 }}><Video size={12} /> {videos}</span>}
          </div>
        )}
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
          <div title={srv.name} style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a', lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{srv.name}</div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#059669', lineHeight: 1.1 }}>{money(finalOf(srv))}</div>
            {hasDiscount && <div style={{ fontSize: '0.72rem', color: '#94a3b8', textDecoration: 'line-through' }}>{money(srv.price)}</div>}
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          <Tag bg="#f5f3ff" color="#6d28d9" border="#ddd6fe">{catName || 'No category'}</Tag>
          <Tag bg="#ecfdf5" color="#047857" border="#a7f3d0">{subName || 'No subcategory'}</Tag>
        </div>

        <p style={{ margin: 0, fontSize: '0.82rem', lineHeight: 1.45, color: srv.description ? '#64748b' : '#cbd5e1', minHeight: '2.4em', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {srv.description || 'No description added.'}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}><Clock size={13} /> {srv.duration || '45 mins'}</span>
          <StatusPill status={srv.status || 'active'} />
        </div>
      </div>
    </div>
  );
};

const Modal = ({ title, onClose, maxWidth = 500, children }) => {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()} style={{ padding: '26px', maxWidth }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '18px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>{title}</h3>
          <button type="button" onClick={onClose} aria-label="Close" style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '50%', color: '#64748b', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
};

const Row = ({ label, children }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', padding: '10px 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.86rem' }}>
    <span style={{ color: '#64748b', fontWeight: 700 }}>{label}</span>
    <span style={{ color: '#0f172a', fontWeight: 700, textAlign: 'right', minWidth: 0, overflowWrap: 'anywhere' }}>{children}</span>
  </div>
);

const ViewModal = ({ srv, catName, subName, onClose, onEdit, onPackages }) => {
  const gallery = Array.isArray(srv.gallery) ? srv.gallery.slice(0, 6) : [];
  const cover = coverOf(srv);
  return (
    <Modal title="Service Details" onClose={onClose} maxWidth={540}>
      {cover && <img src={cover} alt={srv.name} style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '14px', marginBottom: '14px', display: 'block' }} />}
      <div style={{ fontWeight: 900, fontSize: '1.2rem', color: '#0f172a' }}>{srv.name}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '8px 0 10px' }}>
        <Tag bg="#f5f3ff" color="#6d28d9" border="#ddd6fe">{catName || 'No category'}</Tag>
        <Tag bg="#ecfdf5" color="#047857" border="#a7f3d0">{subName || 'No subcategory'}</Tag>
        <StatusPill status={srv.status || 'active'} />
      </div>
      {srv.description && <p style={{ margin: '0 0 8px', fontSize: '0.88rem', color: '#475569', lineHeight: 1.5 }}>{srv.description}</p>}
      <Row label="Base price">{money(srv.price)}</Row>
      <Row label="Discount">{srv.discount > 0 ? `− ${money(srv.discount)}` : 'None'}</Row>
      <Row label="Customer pays"><span style={{ color: '#059669' }}>{money(finalOf(srv))}</span></Row>
      <Row label="Duration">{srv.duration || '45 mins'}</Row>
      <Row label="Photos / videos">{photoCount(srv)} / {videoCount(srv)}</Row>
      <Row label="URL slug"><span style={{ fontFamily: 'monospace' }}>/{srv.slug}</span></Row>
      <Row label="Created">{fmtDate(srv.createdAt)}</Row>
      <Row label="ID"><span style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{srv._id}</span></Row>
      {gallery.length > 1 && (
        <div style={{ display: 'flex', gap: '8px', marginTop: '14px', overflowX: 'auto' }}>
          {gallery.map((g) => <img key={g} src={g} alt="" loading="lazy" style={{ width: '64px', height: '64px', borderRadius: '10px', objectFit: 'cover', border: '1px solid #e2e8f0', flexShrink: 0 }} />)}
        </div>
      )}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '22px', flexWrap: 'wrap' }}>
        <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
        <button type="button" className="btn btn-secondary" onClick={onPackages}>Manage Packages</button>
        <button type="button" className="btn btn-primary" onClick={onEdit}>Edit Service</button>
      </div>
    </Modal>
  );
};

const EditModal = ({ srv, categories, subCategories, onClose, onSave }) => {
  const [name, setName] = useState(srv.name || '');
  const [category, setCategory] = useState(idOf(srv.category) || '');
  const [subCategory, setSubCategory] = useState(idOf(srv.subCategory) || '');
  const [price, setPrice] = useState(String(srv.price ?? ''));
  const [discount, setDiscount] = useState(String(srv.discount ?? 0));
  const [duration, setDuration] = useState(srv.duration || '');
  const [description, setDescription] = useState(srv.description || '');
  const [saving, setSaving] = useState(false);

  const subs = subCategories.filter((sc) => !category || idOf(sc.category) === category);
  const priceNum = Number(price);
  const discountNum = Number(discount) || 0;
  const invalid = !name.trim() || !category || !subCategory || !(priceNum >= 0) || price === '' || discountNum < 0 || discountNum > priceNum;

  const submit = async (e) => {
    e.preventDefault();
    if (invalid) return;
    setSaving(true);
    try {
      await onSave({ name: name.trim(), category, subCategory, price: priceNum, discount: discountNum, duration: duration.trim() || '45 mins', description: description.trim() });
      onClose();
    } catch {
      /* the request layer already shows the error toast; keep the form open */
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Edit Service" onClose={onClose} maxWidth={520}>
      <form onSubmit={submit}>
        <div className="form-group">
          <label className="form-label">Service Name *</label>
          <input type="text" className="form-input" value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' }}>
          <div className="form-group">
            <label className="form-label">Category *</label>
            <select className="form-input" value={category} onChange={(e) => { setCategory(e.target.value); setSubCategory(''); }} required>
              <option value="">-- Select --</option>
              {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Subcategory *</label>
            <select className="form-input" value={subCategory} onChange={(e) => setSubCategory(e.target.value)} required>
              <option value="">-- Select --</option>
              {subs.map((sc) => <option key={sc._id} value={sc._id}>{sc.name}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '12px' }}>
          <div className="form-group">
            <label className="form-label">Price (₹) *</label>
            <input type="number" min="0" className="form-input" value={price} onChange={(e) => setPrice(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Discount (₹)</label>
            <input type="number" min="0" className="form-input" value={discount} onChange={(e) => setDiscount(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Duration</label>
            <input type="text" className="form-input" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="e.g. 45 mins" />
          </div>
        </div>
        {price !== '' && (
          <div style={{ margin: '-4px 0 14px', fontSize: '0.8rem', color: discountNum > priceNum ? '#b91c1c' : '#64748b' }}>
            {discountNum > priceNum ? 'Discount cannot be more than the price.' : <>Customer will pay <strong style={{ color: '#059669' }}>{money(Math.max(0, priceNum - discountNum))}</strong></>}
          </div>
        )}
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea className="form-input" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} style={{ resize: 'vertical' }} />
        </div>
        <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginBottom: '18px' }}>Photos and videos are kept as they are. Packages are managed from the card menu.</div>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving || invalid}>{saving ? 'Saving…' : 'Save Changes'}</button>
        </div>
      </form>
    </Modal>
  );
};

const DeleteModal = ({ srv, onClose, onConfirm }) => {
  const [busy, setBusy] = useState(false);
  const confirm = async () => {
    setBusy(true);
    try {
      await onConfirm();
      onClose();
    } catch {
      setBusy(false);
    }
  };
  return (
    <Modal title="Delete Service" onClose={onClose} maxWidth={440}>
      <div style={{ display: 'flex', gap: '12px', padding: '12px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', color: '#991b1b', fontSize: '0.86rem', lineHeight: 1.45 }}>
        <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '1px' }} />
        <div>Delete <strong>{srv.name}</strong>? Customers will no longer be able to book it. Existing bookings are not affected.</div>
      </div>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '22px' }}>
        <button type="button" className="btn btn-secondary" onClick={onClose} disabled={busy}>Cancel</button>
        <button type="button" onClick={confirm} disabled={busy} className="btn" style={{ background: '#dc2626', color: '#fff', border: 'none' }}>{busy ? 'Deleting…' : 'Delete Service'}</button>
      </div>
    </Modal>
  );
};

const SuperAdminServicesView = ({ onCreate, onManagePackages }) => {
  const { categories, subCategories, services, updateService, deleteService } = useCatalog();
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [dialog, setDialog] = useState(null); // { type: 'view' | 'edit' | 'delete', id }

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput.trim().toLowerCase()); setPage(1); }, 250);
    return () => clearTimeout(t);
  }, [searchInput]);

  const catName = useMemo(() => {
    const byId = new Map(categories.map((c) => [c._id, c.name]));
    return (s) => (s.category && typeof s.category === 'object' && s.category.name) || byId.get(idOf(s.category)) || '';
  }, [categories]);
  const subName = useMemo(() => {
    const byId = new Map(subCategories.map((c) => [c._id, c.name]));
    return (s) => (s.subCategory && typeof s.subCategory === 'object' && s.subCategory.name) || byId.get(idOf(s.subCategory)) || '';
  }, [subCategories]);

  const rows = useMemo(() => {
    const list = services.filter((s) => {
      if (category && idOf(s.category) !== category) return false;
      if (subCategory && idOf(s.subCategory) !== subCategory) return false;
      if (!search) return true;
      return [s.name, s.description, catName(s), subName(s)].some((v) => String(v || '').toLowerCase().includes(search));
    });
    const by = {
      newest: (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
      name: (a, b) => String(a.name || '').localeCompare(String(b.name || '')),
      priceHigh: (a, b) => finalOf(b) - finalOf(a),
      priceLow: (a, b) => finalOf(a) - finalOf(b),
    };
    return [...list].sort(by[sort]);
  }, [services, category, subCategory, search, sort, catName, subName]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const visible = rows.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const avgPrice = services.length ? services.reduce((sum, s) => sum + finalOf(s), 0) / services.length : 0;
  const categoriesCovered = new Set(services.map((s) => idOf(s.category)).filter(Boolean)).size;
  const noMedia = services.filter((s) => !coverOf(s)).length;
  const filtered = category || subCategory || search;

  const open = (type, s) => setDialog({ type, id: s._id });
  const target = dialog ? services.find((s) => s._id === dialog.id) : null;
  const close = () => setDialog(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        <StatCard icon={Wrench} color="#2563eb" bg="#eff6ff" label="Services" value={services.length} />
        <StatCard icon={Grid} color="#059669" bg="#ecfdf5" label="Categories covered" value={categoriesCovered} />
        <StatCard icon={IndianRupee} color="#7c3aed" bg="#f5f3ff" label="Average price" value={money(avgPrice)} />
        <StatCard icon={ImageOff} color="#d97706" bg="#fffbeb" label="Without photo" value={noMedia} />
      </div>

      <div style={{ ...card, padding: '20px', minWidth: 0 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
            Services &amp; pricing <span style={{ color: '#94a3b8', fontWeight: 600 }}>({filtered ? `${rows.length} of ${services.length}` : services.length})</span>
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
            <label style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
              <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '10px' }} />
              <input type="search" placeholder="Search services" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} style={{ ...inputStyle, paddingLeft: '30px', width: '180px' }} />
            </label>
            <select aria-label="Filter by category" value={category} onChange={(e) => { setCategory(e.target.value); setSubCategory(''); setPage(1); }} style={inputStyle}>
              <option value="">All categories</option>
              {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            <select aria-label="Filter by subcategory" value={subCategory} onChange={(e) => { setSubCategory(e.target.value); setPage(1); }} style={inputStyle}>
              <option value="">All subcategories</option>
              {subCategories.filter((sc) => !category || idOf(sc.category) === category).map((sc) => <option key={sc._id} value={sc._id}>{sc.name}</option>)}
            </select>
            <select aria-label="Sort services" value={sort} onChange={(e) => setSort(e.target.value)} style={inputStyle}>
              {SORTS.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
            </select>
            <button type="button" onClick={onCreate} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#ffffff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.84rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)' }}>
              <Plus size={16} /> Create Service
            </button>
          </div>
        </div>

        {visible.length === 0 ? (
          <div style={{ padding: '40px 16px', textAlign: 'center', color: '#64748b', fontSize: '0.88rem' }}>
            {services.length ? 'No services match these filters.' : 'No services found. Click "Create Service" to add one.'}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '18px' }}>
            {visible.map((s) => (
              <ServiceCard key={s._id} srv={s} catName={catName(s)} subName={subName(s)} onView={() => open('view', s)} onEdit={() => open('edit', s)} onPackages={() => onManagePackages(s)} onDelete={() => open('delete', s)} />
            ))}
          </div>
        )}

        {rows.length > PAGE_SIZE && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginTop: '18px', fontSize: '0.8rem', color: '#64748b', flexWrap: 'wrap' }}>
            <span>Showing {(current - 1) * PAGE_SIZE + 1}–{Math.min(current * PAGE_SIZE, rows.length)} of {rows.length}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Page {current} of {totalPages}</span>
              <button type="button" aria-label="Previous page" disabled={current <= 1} onClick={() => setPage(current - 1)} style={{ ...inputStyle, padding: '6px 8px', cursor: 'pointer', opacity: current <= 1 ? 0.5 : 1 }}><ChevronLeft size={14} /></button>
              <button type="button" aria-label="Next page" disabled={current >= totalPages} onClick={() => setPage(current + 1)} style={{ ...inputStyle, padding: '6px 8px', cursor: 'pointer', opacity: current >= totalPages ? 0.5 : 1 }}><ChevronRight size={14} /></button>
            </div>
          </div>
        )}
      </div>

      {target && dialog.type === 'view' && <ViewModal srv={target} catName={catName(target)} subName={subName(target)} onClose={close} onEdit={() => open('edit', target)} onPackages={() => { close(); onManagePackages(target); }} />}
      {target && dialog.type === 'edit' && <EditModal srv={target} categories={categories} subCategories={subCategories} onClose={close} onSave={(data) => updateService({ id: target._id, data })} />}
      {target && dialog.type === 'delete' && <DeleteModal srv={target} onClose={close} onConfirm={() => deleteService(target._id)} />}
    </div>
  );
};

export default SuperAdminServicesView;
