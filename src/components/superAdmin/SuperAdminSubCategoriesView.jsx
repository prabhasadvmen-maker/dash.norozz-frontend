import { useEffect, useMemo, useRef, useState } from 'react';
import { Layers, Grid, Wrench, AlertTriangle, Plus, Search, MoreVertical, Eye, Pencil, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCatalog } from '../../hooks/useCatalog.js';

const PAGE_SIZE = 10;

const STATUS = {
  active: { label: 'Active', bg: '#ecfdf5', color: '#047857', border: '#a7f3d0' },
  inactive: { label: 'Inactive', bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
  deleted: { label: 'Deleted', bg: '#fef2f2', color: '#b91c1c', border: '#fecaca' },
};
const SORTS = [
  { id: 'newest', label: 'Newest first' },
  { id: 'name', label: 'Name A–Z' },
  { id: 'parent', label: 'Parent category' },
  { id: 'services', label: 'Most services' },
];

const card = { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)' };
const inputStyle = { padding: '8px 11px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '0.84rem', color: '#0f172a', background: '#ffffff' };
const headRow = { background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' };
const td = { padding: '12px 10px', fontSize: '0.84rem', color: '#334155', verticalAlign: 'middle' };

const idOf = (v) => (v && typeof v === 'object' ? v._id : v);
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');

const StatusPill = ({ status }) => {
  const s = STATUS[status] || STATUS.active;
  return <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '3px 10px', borderRadius: '9999px', background: s.bg, color: s.color, border: `1px solid ${s.border}`, whiteSpace: 'nowrap' }}>● {s.label}</span>;
};

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

const Th = ({ children, right }) => <th style={{ padding: '11px 10px', fontWeight: 800, whiteSpace: 'nowrap', textAlign: right ? 'right' : 'left' }}>{children}</th>;

const ParentTag = ({ name }) => (
  <span style={{ fontSize: '0.74rem', fontWeight: 800, padding: '3px 10px', borderRadius: '8px', background: name ? '#f5f3ff' : '#fef2f2', color: name ? '#6d28d9' : '#b91c1c', border: `1px solid ${name ? '#ddd6fe' : '#fecaca'}`, whiteSpace: 'nowrap' }}>
    {name || 'Parent missing'}
  </span>
);

const menuItem = (color) => ({ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '9px 12px', background: 'transparent', border: 'none', borderRadius: '8px', color, fontSize: '0.84rem', fontWeight: 700, cursor: 'pointer', textAlign: 'left', whiteSpace: 'nowrap' });

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
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button type="button" aria-label="Subcategory actions" aria-haspopup="menu" aria-expanded={open} onClick={toggle} style={{ width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: open ? '#f1f5f9' : 'transparent', border: '1px solid transparent', borderRadius: '10px', color: '#64748b', cursor: 'pointer' }}>
        <MoreVertical size={18} />
      </button>
      {open && pos && (
        <div role="menu" style={{ position: 'fixed', ...pos, zIndex: 1100, minWidth: '170px', padding: '6px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 12px 30px rgba(15, 23, 42, 0.14)' }}>
          <button type="button" role="menuitem" onClick={pick(onView)} style={menuItem('#334155')}><Eye size={16} color="#2563eb" /> View details</button>
          <button type="button" role="menuitem" onClick={pick(onEdit)} style={menuItem('#334155')}><Pencil size={16} color="#d97706" /> Edit subcategory</button>
          <div style={{ height: '1px', background: '#f1f5f9', margin: '4px 0' }} />
          <button type="button" role="menuitem" onClick={pick(onDelete)} style={menuItem('#dc2626')}><Trash2 size={16} /> Delete</button>
        </div>
      )}
    </div>
  );
};

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

const ViewModal = ({ sub, parentName, srvs, onClose, onEdit }) => (
  <Modal title="Subcategory Details" onClose={onClose} maxWidth={500}>
    <div style={{ marginBottom: '10px' }}>
      <div style={{ fontWeight: 900, fontSize: '1.2rem', color: '#0f172a' }}>{sub.name}</div>
      <div style={{ marginTop: '6px', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
        <ParentTag name={parentName} /><StatusPill status={sub.status || 'active'} />
      </div>
    </div>
    {sub.description && <p style={{ margin: '0 0 8px', fontSize: '0.88rem', color: '#475569', lineHeight: 1.5 }}>{sub.description}</p>}
    <Row label="URL slug"><span style={{ fontFamily: 'monospace' }}>/{sub.slug}</span></Row>
    <Row label="Services attached">{srvs.length}</Row>
    <Row label="Created">{fmtDate(sub.createdAt)}</Row>
    <Row label="Last updated">{fmtDate(sub.updatedAt)}</Row>
    <Row label="ID"><span style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{sub._id}</span></Row>
    <div style={{ marginTop: '16px' }}>
      <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Services ({srvs.length})</div>
      {srvs.length ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {srvs.map((s) => <span key={s._id} style={{ fontSize: '0.76rem', fontWeight: 700, padding: '4px 10px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#334155' }}>{s.name}</span>)}
        </div>
      ) : <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>No services attached yet.</div>}
    </div>
    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '22px' }}>
      <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
      <button type="button" className="btn btn-primary" onClick={onEdit}>Edit Subcategory</button>
    </div>
  </Modal>
);

const EditModal = ({ sub, categories, onClose, onSave }) => {
  const [name, setName] = useState(sub.name || '');
  const [category, setCategory] = useState(idOf(sub.category) || '');
  const [description, setDescription] = useState(sub.description || '');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !category) return;
    setSaving(true);
    try {
      await onSave({ name: name.trim(), category, description: description.trim() });
      onClose();
    } catch {
      /* the request layer already shows the error toast; keep the form open */
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Edit Subcategory" onClose={onClose}>
      <form onSubmit={submit}>
        <div className="form-group">
          <label className="form-label">Subcategory Name *</label>
          <input type="text" className="form-input" value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
        </div>
        <div className="form-group">
          <label className="form-label">Parent Category *</label>
          <select className="form-input" value={category} onChange={(e) => setCategory(e.target.value)} required>
            <option value="">-- Select Parent Category --</option>
            {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
        <div className="form-group" style={{ marginBottom: '22px' }}>
          <label className="form-label">Description</label>
          <textarea className="form-input" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description" style={{ resize: 'vertical' }} />
        </div>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving || !name.trim() || !category}>{saving ? 'Saving…' : 'Save Changes'}</button>
        </div>
      </form>
    </Modal>
  );
};

const DeleteModal = ({ sub, srvCount, onClose, onConfirm }) => {
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
    <Modal title="Delete Subcategory" onClose={onClose} maxWidth={440}>
      <div style={{ display: 'flex', gap: '12px', padding: '12px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', color: '#991b1b', fontSize: '0.86rem', lineHeight: 1.45 }}>
        <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '1px' }} />
        <div>
          Delete <strong>{sub.name}</strong>? It will disappear from the customer app.
          {srvCount > 0 && <> <strong>{srvCount}</strong> service{srvCount === 1 ? ' is' : 's are'} still attached to it.</>}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '22px' }}>
        <button type="button" className="btn btn-secondary" onClick={onClose} disabled={busy}>Cancel</button>
        <button type="button" onClick={confirm} disabled={busy} className="btn" style={{ background: '#dc2626', color: '#fff', border: 'none' }}>{busy ? 'Deleting…' : 'Delete Subcategory'}</button>
      </div>
    </Modal>
  );
};

const SuperAdminSubCategoriesView = ({ onCreate }) => {
  const { categories, subCategories, services, updateSubCategory, deleteSubCategory } = useCatalog();
  const [parent, setParent] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [dialog, setDialog] = useState(null); // { type: 'view' | 'edit' | 'delete', id }

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput.trim().toLowerCase()); setPage(1); }, 250);
    return () => clearTimeout(t);
  }, [searchInput]);

  const parentName = useMemo(() => {
    const byId = new Map(categories.map((c) => [c._id, c.name]));
    return (sub) => (sub.category && typeof sub.category === 'object' && sub.category.name) || byId.get(idOf(sub.category)) || '';
  }, [categories]);

  const servicesBySub = useMemo(() => {
    const map = new Map();
    for (const s of services) {
      const k = idOf(s.subCategory);
      if (k) map.set(k, [...(map.get(k) || []), s]);
    }
    return map;
  }, [services]);
  const srvsOf = (sub) => servicesBySub.get(sub._id) || [];

  const rows = useMemo(() => {
    const list = subCategories.filter((sc) => {
      if (parent && idOf(sc.category) !== parent) return false;
      if (!search) return true;
      return [sc.name, sc.slug, sc.description, parentName(sc)].some((v) => String(v || '').toLowerCase().includes(search));
    });
    const by = {
      newest: (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
      name: (a, b) => String(a.name || '').localeCompare(String(b.name || '')),
      parent: (a, b) => parentName(a).localeCompare(parentName(b)) || String(a.name || '').localeCompare(String(b.name || '')),
      services: (a, b) => (servicesBySub.get(b._id)?.length || 0) - (servicesBySub.get(a._id)?.length || 0),
    };
    return [...list].sort(by[sort]);
  }, [subCategories, parent, search, sort, parentName, servicesBySub]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const visible = rows.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const withoutServices = subCategories.filter((sc) => !servicesBySub.get(sc._id)?.length).length;
  const parentsUsed = new Set(subCategories.map((sc) => idOf(sc.category))).size;
  const filtered = parent || search;

  const open = (type, sub) => setDialog({ type, id: sub._id });
  const target = dialog ? subCategories.find((sc) => sc._id === dialog.id) : null;
  const close = () => setDialog(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        <StatCard icon={Layers} color="#7c3aed" bg="#f5f3ff" label="Subcategories" value={subCategories.length} />
        <StatCard icon={Grid} color="#059669" bg="#ecfdf5" label="Parent categories used" value={parentsUsed} />
        <StatCard icon={Wrench} color="#2563eb" bg="#eff6ff" label="Services" value={services.length} />
        <StatCard icon={AlertTriangle} color="#d97706" bg="#fffbeb" label="Without services" value={withoutServices} />
      </div>

      <div style={{ ...card, padding: '20px', minWidth: 0 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
            Subcategories <span style={{ color: '#94a3b8', fontWeight: 600 }}>({filtered ? `${rows.length} of ${subCategories.length}` : subCategories.length})</span>
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
            <label style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
              <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '10px' }} />
              <input type="search" placeholder="Search subcategories" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} style={{ ...inputStyle, paddingLeft: '30px', width: '200px' }} />
            </label>
            <select aria-label="Filter by parent category" value={parent} onChange={(e) => { setParent(e.target.value); setPage(1); }} style={inputStyle}>
              <option value="">All parent categories</option>
              {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            <select aria-label="Sort subcategories" value={sort} onChange={(e) => setSort(e.target.value)} style={inputStyle}>
              {SORTS.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
            </select>
            <button type="button" onClick={onCreate} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#ffffff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.84rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)' }}>
              <Plus size={16} /> Create SubCategory
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
          <table style={{ width: '100%', minWidth: '820px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={headRow}>
                <Th>#</Th><Th>Subcategory</Th><Th>Parent category</Th><Th>Description</Th><Th right>Services</Th><Th>Status</Th><Th>Created</Th><th style={{ width: '56px' }} />
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: '40px 16px', textAlign: 'center', color: '#64748b', fontSize: '0.88rem' }}>
                  {subCategories.length ? 'No subcategories match these filters.' : 'No subcategories found. Click "Create SubCategory" to add one.'}
                </td></tr>
              ) : visible.map((sc, i) => (
                <tr key={sc._id} onClick={() => open('view', sc)} style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                  <td style={{ ...td, width: '48px', color: '#94a3b8', fontWeight: 700 }}>{(current - 1) * PAGE_SIZE + i + 1}</td>
                  <td style={td}>
                    <div style={{ fontWeight: 800, color: '#0f172a' }}>{sc.name}</div>
                    <div style={{ fontSize: '0.74rem', color: '#94a3b8', fontFamily: 'monospace' }}>/{sc.slug}</div>
                  </td>
                  <td style={td}><ParentTag name={parentName(sc)} /></td>
                  <td style={{ ...td, maxWidth: '260px' }}>
                    <div title={sc.description || ''} style={{ color: sc.description ? '#475569' : '#cbd5e1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sc.description || '—'}</div>
                  </td>
                  <td style={{ ...td, textAlign: 'right', fontWeight: 800, color: srvsOf(sc).length ? '#0f172a' : '#cbd5e1' }}>{srvsOf(sc).length}</td>
                  <td style={{ ...td, whiteSpace: 'nowrap' }}><StatusPill status={sc.status || 'active'} /></td>
                  <td style={{ ...td, whiteSpace: 'nowrap', color: '#64748b' }}>{fmtDate(sc.createdAt)}</td>
                  <td style={{ ...td, textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                    <RowMenu onView={() => open('view', sc)} onEdit={() => open('edit', sc)} onDelete={() => open('delete', sc)} />
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

      {target && dialog.type === 'view' && <ViewModal sub={target} parentName={parentName(target)} srvs={srvsOf(target)} onClose={close} onEdit={() => open('edit', target)} />}
      {target && dialog.type === 'edit' && <EditModal sub={target} categories={categories} onClose={close} onSave={(data) => updateSubCategory({ id: target._id, data })} />}
      {target && dialog.type === 'delete' && <DeleteModal sub={target} srvCount={srvsOf(target).length} onClose={close} onConfirm={() => deleteSubCategory(target._id)} />}
    </div>
  );
};

export default SuperAdminSubCategoriesView;
