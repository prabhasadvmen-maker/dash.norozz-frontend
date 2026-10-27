import { useEffect, useMemo, useRef, useState } from 'react';
import { Grid, Plus, MoreVertical, Eye, Pencil, Trash2, X, FolderTree, Wrench, ImagePlus, AlertTriangle, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCatalog } from '../../hooks/useCatalog.js';
import { toast } from '../../utils/toast.js';

const idOf = (v) => (v && typeof v === 'object' ? v._id : v);
const isImageSrc = (s) => typeof s === 'string' && /^(data:image|https?:\/\/|\/uploads\/)/.test(s);
const imageOf = (cat) => [cat.image, cat.icon].find(isImageSrc) || '';
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');

const STATUS = {
  active: { label: 'Active', bg: '#ecfdf5', color: '#047857', border: '#a7f3d0' },
  inactive: { label: 'Inactive', bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
  deleted: { label: 'Deleted', bg: '#fef2f2', color: '#b91c1c', border: '#fecaca' },
};

// Downscale uploads so the base64 payload stays small
const compressImage = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, 400 / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });

const Avatar = ({ cat, size = 48 }) => {
  const src = imageOf(cat);
  const box = { width: size, height: size, borderRadius: size * 0.28, flexShrink: 0 };
  if (src) return <img src={src} alt={cat.name} style={{ ...box, objectFit: 'cover', border: '1px solid #e2e8f0' }} />;
  return (
    <div style={{ ...box, background: '#ecfdf5', border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Wrench size={size * 0.46} color="#059669" />
    </div>
  );
};

const StatusPill = ({ status }) => {
  const s = STATUS[status] || STATUS.active;
  return (
    <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '3px 10px', borderRadius: '9999px', background: s.bg, color: s.color, border: `1px solid ${s.border}`, whiteSpace: 'nowrap' }}>
      ● {s.label}
    </span>
  );
};

const CloseBtn = ({ onClick }) => (
  <button type="button" onClick={onClick} aria-label="Close" style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '50%', color: '#64748b', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
    <X size={18} />
  </button>
);

const Modal = ({ title, onClose, maxWidth = 480, children }) => {
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
          <CloseBtn onClick={onClose} />
        </div>
        {children}
      </div>
    </div>
  );
};

const menuItem = (color) => ({
  display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '9px 12px', background: 'transparent',
  border: 'none', borderRadius: '8px', color, fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', textAlign: 'left',
});

const RowMenu = ({ onView, onEdit, onDelete }) => {
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
      const flip = r.bottom + 150 > window.innerHeight;
      setPos({ right: window.innerWidth - r.right, ...(flip ? { bottom: window.innerHeight - r.top + 4 } : { top: r.bottom + 4 }) });
    }
    setOpen((o) => !o);
  };

  const pick = (fn) => () => { setOpen(false); fn(); };
  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0, display: 'inline-block' }}>
      <button type="button" aria-label="Category actions" aria-haspopup="menu" aria-expanded={open} onClick={toggle} style={{ width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: open ? '#f1f5f9' : 'transparent', border: '1px solid transparent', borderRadius: '10px', color: '#64748b', cursor: 'pointer' }}>
        <MoreVertical size={18} />
      </button>
      {open && pos && (
        <div role="menu" style={{ position: 'fixed', ...pos, zIndex: 1100, minWidth: '164px', padding: '6px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 12px 30px rgba(15, 23, 42, 0.14)' }}>
          <button type="button" role="menuitem" onClick={pick(onView)} style={menuItem('#334155')}><Eye size={16} color="#2563eb" /> View details</button>
          <button type="button" role="menuitem" onClick={pick(onEdit)} style={menuItem('#334155')}><Pencil size={16} color="#d97706" /> Edit category</button>
          <div style={{ height: '1px', background: '#f1f5f9', margin: '4px 0' }} />
          <button type="button" role="menuitem" onClick={pick(onDelete)} style={menuItem('#dc2626')}><Trash2 size={16} /> Delete</button>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon: Icon, color, bg, label, value }) => (
  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)', padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={20} color={color} />
    </div>
    <div>
      <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px', marginTop: '2px' }}>{label}</div>
    </div>
  </div>
);

const headRow = { background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' };
const td = { padding: '12px 10px', fontSize: '0.84rem', color: '#334155', verticalAlign: 'middle' };
const inputStyle = { padding: '8px 11px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '0.84rem', color: '#0f172a', background: '#ffffff' };
const Th = ({ children, right }) => <th style={{ padding: '11px 10px', fontWeight: 800, whiteSpace: 'nowrap', textAlign: right ? 'right' : 'left' }}>{children}</th>;
const SORTS = [
  { id: 'newest', label: 'Newest first' },
  { id: 'name', label: 'Name A–Z' },
  { id: 'services', label: 'Most services' },
  { id: 'subs', label: 'Most subcategories' },
];
const PAGE_SIZE = 10;

const Row = ({ label, children }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', padding: '10px 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.86rem' }}>
    <span style={{ color: '#64748b', fontWeight: 700 }}>{label}</span>
    <span style={{ color: '#0f172a', fontWeight: 700, textAlign: 'right', minWidth: 0, overflowWrap: 'anywhere' }}>{children}</span>
  </div>
);

const ChipList = ({ title, items }) => (
  <div style={{ marginTop: '16px' }}>
    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>{title} ({items.length})</div>
    {items.length ? (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {items.map((it) => (
          <span key={it._id} style={{ fontSize: '0.76rem', fontWeight: 700, padding: '4px 10px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#334155' }}>{it.name}</span>
        ))}
      </div>
    ) : <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>None yet.</div>}
  </div>
);

const ViewModal = ({ cat, subs, srvs, onClose, onEdit }) => (
  <Modal title="Category Details" onClose={onClose} maxWidth={500}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
      <Avatar cat={cat} size={64} />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 900, fontSize: '1.2rem', color: '#0f172a' }}>{cat.name}</div>
        <div style={{ marginTop: '6px' }}><StatusPill status={cat.status || 'active'} /></div>
      </div>
    </div>
    {cat.description && <p style={{ margin: '0 0 8px', fontSize: '0.88rem', color: '#475569', lineHeight: 1.5 }}>{cat.description}</p>}
    <Row label="URL slug"><span style={{ fontFamily: 'monospace' }}>/{cat.slug}</span></Row>
    <Row label="Subcategories">{subs.length}</Row>
    <Row label="Services">{srvs.length}</Row>
    <Row label="Created">{fmtDate(cat.createdAt)}</Row>
    <Row label="Last updated">{fmtDate(cat.updatedAt)}</Row>
    <Row label="ID"><span style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{cat._id}</span></Row>
    <ChipList title="Subcategories" items={subs} />
    <ChipList title="Services" items={srvs} />
    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '22px' }}>
      <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
      <button type="button" className="btn btn-primary" onClick={onEdit}>Edit Category</button>
    </div>
  </Modal>
);

const EditModal = ({ cat, onClose, onSave }) => {
  const [name, setName] = useState(cat.name || '');
  const [description, setDescription] = useState(cat.description || '');
  const [image, setImage] = useState(imageOf(cat));
  const [saving, setSaving] = useState(false);

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setImage(await compressImage(file));
    } catch {
      toast.error('Could not read that image. Try a different file.');
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        description: description.trim(),
        image,
        icon: image || (isImageSrc(cat.icon) ? 'Wrench' : cat.icon || 'Wrench'),
      });
      onClose();
    } catch {
      /* the request layer already shows the error toast; keep the form open */
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Edit Category" onClose={onClose}>
      <form onSubmit={submit}>
        <div className="form-group">
          <label className="form-label">Category Name *</label>
          <input type="text" className="form-input" value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea className="form-input" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short summary shown to customers" style={{ resize: 'vertical' }} />
        </div>
        <div className="form-group" style={{ marginBottom: '22px' }}>
          <label className="form-label">Category Image</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Avatar cat={{ name, image }} size={64} />
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <label className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', margin: 0 }}>
                <ImagePlus size={15} /> {image ? 'Change' : 'Upload'}
                <input type="file" accept="image/*" onChange={onFile} style={{ display: 'none' }} />
              </label>
              {image && <button type="button" className="btn btn-secondary" onClick={() => setImage('')}>Remove</button>}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving || !name.trim()}>{saving ? 'Saving…' : 'Save Changes'}</button>
        </div>
      </form>
    </Modal>
  );
};

const DeleteModal = ({ cat, subCount, srvCount, onClose, onConfirm }) => {
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
    <Modal title="Delete Category" onClose={onClose} maxWidth={440}>
      <div style={{ display: 'flex', gap: '12px', padding: '12px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', color: '#991b1b', fontSize: '0.86rem', lineHeight: 1.45 }}>
        <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '1px' }} />
        <div>
          Delete <strong>{cat.name}</strong>? It will disappear from the customer app.
          {(subCount > 0 || srvCount > 0) && <> It currently has <strong>{subCount}</strong> subcategories and <strong>{srvCount}</strong> services linked to it.</>}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '22px' }}>
        <button type="button" className="btn btn-secondary" onClick={onClose} disabled={busy}>Cancel</button>
        <button type="button" onClick={confirm} disabled={busy} className="btn" style={{ background: '#dc2626', color: '#fff', border: 'none' }}>{busy ? 'Deleting…' : 'Delete Category'}</button>
      </div>
    </Modal>
  );
};

const SuperAdminCategoriesView = ({ onCreate }) => {
  const { categories, subCategories, services, updateCategory, deleteCategory } = useCatalog();
  const [dialog, setDialog] = useState(null); // { type: 'view' | 'edit' | 'delete', id }
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput.trim().toLowerCase()); setPage(1); }, 250);
    return () => clearTimeout(t);
  }, [searchInput]);

  const stats = useMemo(() => {
    const sub = new Map();
    const srv = new Map();
    for (const x of subCategories) {
      const k = idOf(x.category);
      sub.set(k, [...(sub.get(k) || []), x]);
    }
    for (const x of services) {
      const k = idOf(x.category);
      srv.set(k, [...(srv.get(k) || []), x]);
    }
    return { sub, srv };
  }, [subCategories, services]);

  const subsOf = (c) => stats.sub.get(c._id) || [];
  const srvsOf = (c) => stats.srv.get(c._id) || [];

  const rows = useMemo(() => {
    const list = categories.filter((c) => !search || [c.name, c.slug, c.description].some((v) => String(v || '').toLowerCase().includes(search)));
    const by = {
      newest: (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
      name: (a, b) => String(a.name || '').localeCompare(String(b.name || '')),
      services: (a, b) => (stats.srv.get(b._id)?.length || 0) - (stats.srv.get(a._id)?.length || 0),
      subs: (a, b) => (stats.sub.get(b._id)?.length || 0) - (stats.sub.get(a._id)?.length || 0),
    };
    return [...list].sort(by[sort]);
  }, [categories, search, sort, stats]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const visible = rows.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const emptyCount = categories.filter((c) => subsOf(c).length === 0 && srvsOf(c).length === 0).length;

  const open = (type, c) => setDialog({ type, id: c._id });
  const cat = dialog ? categories.find((c) => c._id === dialog.id) : null;
  const close = () => setDialog(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        <StatCard icon={Grid} color="#059669" bg="#ecfdf5" label="Categories" value={categories.length} />
        <StatCard icon={FolderTree} color="#2563eb" bg="#eff6ff" label="Subcategories" value={subCategories.length} />
        <StatCard icon={Wrench} color="#7c3aed" bg="#f5f3ff" label="Services" value={services.length} />
        <StatCard icon={AlertTriangle} color="#d97706" bg="#fffbeb" label="Empty categories" value={emptyCount} />
      </div>

      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)', padding: '20px', minWidth: 0 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
            Service categories <span style={{ color: '#94a3b8', fontWeight: 600 }}>({search ? `${rows.length} of ${categories.length}` : categories.length})</span>
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
            <label style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
              <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '10px' }} />
              <input type="search" placeholder="Search categories" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} style={{ ...inputStyle, paddingLeft: '30px', width: '200px' }} />
            </label>
            <select aria-label="Sort categories" value={sort} onChange={(e) => setSort(e.target.value)} style={inputStyle}>
              {SORTS.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
            </select>
            <button type="button" onClick={onCreate} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#ffffff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.84rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)' }}>
              <Plus size={16} /> Create Category
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
          <table style={{ width: '100%', minWidth: '760px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={headRow}>
                <Th>#</Th><Th>Category</Th><Th>Description</Th><Th right>Subcategories</Th><Th right>Services</Th><Th>Status</Th><Th>Created</Th><th style={{ width: '56px' }} />
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: '40px 16px', textAlign: 'center', color: '#64748b', fontSize: '0.88rem' }}>
                  {categories.length ? 'No categories match your search.' : 'No categories created yet. Click "Create Category" to add one.'}
                </td></tr>
              ) : visible.map((c, i) => (
                <tr key={c._id} onClick={() => open('view', c)} style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                  <td style={{ ...td, width: '48px', color: '#94a3b8', fontWeight: 700 }}>{(current - 1) * PAGE_SIZE + i + 1}</td>
                  <td style={td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                      <Avatar cat={c} size={40} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 800, color: '#0f172a' }}>{c.name}</div>
                        <div style={{ fontSize: '0.74rem', color: '#94a3b8', fontFamily: 'monospace' }}>/{c.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ ...td, maxWidth: '280px' }}>
                    <div title={c.description || ''} style={{ color: c.description ? '#475569' : '#cbd5e1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.description || '—'}</div>
                  </td>
                  <td style={{ ...td, textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>{subsOf(c).length}</td>
                  <td style={{ ...td, textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>{srvsOf(c).length}</td>
                  <td style={{ ...td, whiteSpace: 'nowrap' }}><StatusPill status={c.status || 'active'} /></td>
                  <td style={{ ...td, whiteSpace: 'nowrap', color: '#64748b' }}>{fmtDate(c.createdAt)}</td>
                  <td style={{ ...td, textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                    <RowMenu onView={() => open('view', c)} onEdit={() => open('edit', c)} onDelete={() => open('delete', c)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {rows.length > PAGE_SIZE && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginTop: '14px', fontSize: '0.8rem', color: '#64748b', flexWrap: 'wrap' }}>
            <span>Showing {(current - 1) * PAGE_SIZE + 1}–{Math.min(current * PAGE_SIZE, rows.length)} of {rows.length}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Page {current} of {totalPages}</span>
              <button type="button" aria-label="Previous page" disabled={current <= 1} onClick={() => setPage(current - 1)} style={{ ...inputStyle, padding: '6px 8px', cursor: 'pointer', opacity: current <= 1 ? 0.5 : 1 }}><ChevronLeft size={14} /></button>
              <button type="button" aria-label="Next page" disabled={current >= totalPages} onClick={() => setPage(current + 1)} style={{ ...inputStyle, padding: '6px 8px', cursor: 'pointer', opacity: current >= totalPages ? 0.5 : 1 }}><ChevronRight size={14} /></button>
            </div>
          </div>
        )}
      </div>

      {cat && dialog.type === 'view' && <ViewModal cat={cat} subs={subsOf(cat)} srvs={srvsOf(cat)} onClose={close} onEdit={() => open('edit', cat)} />}
      {cat && dialog.type === 'edit' && <EditModal cat={cat} onClose={close} onSave={(data) => updateCategory({ id: cat._id, data })} />}
      {cat && dialog.type === 'delete' && <DeleteModal cat={cat} subCount={subsOf(cat).length} srvCount={srvsOf(cat).length} onClose={close} onConfirm={() => deleteCategory(cat._id)} />}
    </div>
  );
};

export default SuperAdminCategoriesView;
