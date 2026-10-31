import React, { useState, useEffect, useRef } from 'react';
import {
  Image,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  Loader2,
  X,
  Power,
  Link,
  Tag,
  ArrowRight,
  Wind,
  Home,
  Wrench,
  Scissors,
  MoreVertical,
  AlertTriangle
} from 'lucide-react';
import { superAdminService } from '../../services/superAdmin.service.js';
import { catalogService } from '../../services/catalog.service.js';
import { toast } from '../../utils/toast.js';

const gradientPresets = [
  { label: 'Emerald Night (Green)', value: 'linear-gradient(135deg, #09331E 0%, #064e3b 50%, #0f172a 100%)' },
  { label: 'Royal Blue & Violet', value: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #7c3aed 100%)' },
  { label: 'Magenta & Purple Spark', value: 'linear-gradient(135deg, #701a75 0%, #a21caf 60%, #c026d3 100%)' },
  { label: 'Sunset Amber & Gold', value: 'linear-gradient(135deg, #7c2d12 0%, #c2410c 50%, #d97706 100%)' },
  { label: 'Midnight Cyan', value: 'linear-gradient(135deg, #083344 0%, #0e7490 50%, #0284c7 100%)' },
];

const TEMPLATES = [
  { icon: Wind, color: '#0284c7', label: 'AC Foam Jet Cleaning', title: 'AC Foam Jet Deep Cleaning', subtitle: 'Book 2-in-1 Foam Jet AC Cleaning at flat 50% OFF', badgeText: 'SUMMER SPECIAL', gradientBg: 'linear-gradient(135deg, #083344 0%, #0e7490 50%, #0284c7 100%)', targetType: 'service' },
  { icon: Home, color: '#2563eb', label: 'Home Deep Cleaning', title: 'Full Home Deep Cleaning', subtitle: 'Complete 3BHK sanitization starting at ₹1,999', badgeText: 'BESTSELLER', gradientBg: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #7c3aed 100%)', targetType: 'category' },
  { icon: Wrench, color: '#059669', label: 'Appliance Repair', title: 'Expert Appliance Repair', subtitle: 'Same-day repair for AC, Fridge, Washing Machine & more', badgeText: 'SAME DAY', gradientBg: 'linear-gradient(135deg, #09331E 0%, #064e3b 50%, #0f172a 100%)', targetType: 'category' },
  { icon: Scissors, color: '#c026d3', label: 'Salon at Home', title: 'Salon & Beauty at Home', subtitle: 'Professional salon services at your doorstep', badgeText: 'FLAT 30% OFF', gradientBg: 'linear-gradient(135deg, #701a75 0%, #a21caf 60%, #c026d3 100%)', targetType: 'category' },
];

const card = { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)' };
const inputStyle = { padding: '8px 11px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '0.84rem', color: '#0f172a', background: '#ffffff' };
const headRow = { background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' };
const td = { padding: '12px 10px', fontSize: '0.84rem', color: '#334155', verticalAlign: 'middle' };

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

const Th = ({ children, w }) => <th style={{ padding: '11px 10px', fontWeight: 800, whiteSpace: 'nowrap', textAlign: 'left', width: w }}>{children}</th>;

const menuItem = (color) => ({ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '9px 12px', background: 'transparent', border: 'none', borderRadius: '8px', color, fontSize: '0.84rem', fontWeight: 700, cursor: 'pointer', textAlign: 'left', whiteSpace: 'nowrap' });

const RowMenu = ({ active, onEdit, onToggle, onDelete }) => {
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
      <button type="button" aria-label="Banner actions" aria-haspopup="menu" aria-expanded={open} onClick={toggle} style={{ width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: open ? '#f1f5f9' : 'transparent', border: '1px solid transparent', borderRadius: '10px', color: '#64748b', cursor: 'pointer' }}>
        <MoreVertical size={18} />
      </button>
      {open && pos && (
        <div role="menu" style={{ position: 'fixed', ...pos, zIndex: 1050, minWidth: '170px', padding: '6px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 12px 30px rgba(15, 23, 42, 0.14)' }}>
          <button type="button" role="menuitem" onClick={pick(onEdit)} style={menuItem('#334155')}><Edit2 size={16} color="#d97706" /> Edit banner</button>
          <button type="button" role="menuitem" onClick={pick(onToggle)} style={menuItem(active ? '#b45309' : '#047857')}><Power size={16} /> {active ? 'Deactivate' : 'Activate'}</button>
          <div style={{ height: '1px', background: '#f1f5f9', margin: '4px 0' }} />
          <button type="button" role="menuitem" onClick={pick(onDelete)} style={menuItem('#dc2626')}><Trash2 size={16} /> Delete</button>
        </div>
      )}
    </div>
  );
};

const DeleteModal = ({ banner, busy, onClose, onConfirm }) => {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" role="dialog" aria-modal="true" aria-label="Delete banner" onClick={(e) => e.stopPropagation()} style={{ padding: '26px', maxWidth: '430px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Delete banner</h3>
          <button type="button" onClick={onClose} aria-label="Close" style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '50%', color: '#64748b', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={18} /></button>
        </div>
        <div style={{ display: 'flex', gap: '12px', padding: '12px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', color: '#991b1b', fontSize: '0.86rem', lineHeight: 1.45 }}>
          <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '1px' }} />
          <div>Delete <strong>{banner.title}</strong>? It is removed from the customer app straight away. To hide it for now, use Deactivate instead.</div>
        </div>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '22px' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={busy}>Cancel</button>
          <button type="button" className="btn" disabled={busy} onClick={onConfirm} style={{ background: '#dc2626', color: '#fff', border: 'none' }}>{busy ? 'Deleting…' : 'Delete banner'}</button>
        </div>
      </div>
    </div>
  );
};

const SuperAdminBannersView = () => {
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    badgeText: 'SUMMER SPECIAL',
    imageUrl: '',
    gradientBg: gradientPresets[0].value,
    targetType: 'none',
    targetValue: '',
    couponCode: '',
    isActive: true,
    displayOrder: 0,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bannerRes, catRes, srvRes, couponRes] = await Promise.all([
        superAdminService.getBanners(),
        catalogService.getCategories().catch(() => ({ data: [] })),
        catalogService.getServices().catch(() => ({ data: [] })),
        superAdminService.getCoupons().catch(() => ({ data: [] }))
      ]);

      const bannerList = bannerRes.data?.data || bannerRes.data || [];
      const catList = catRes.data?.data || catRes.data || [];
      const srvList = srvRes.data?.data || srvRes.data || [];
      const couponList = couponRes.data?.data || couponRes.data || [];

      setBanners(Array.isArray(bannerList) ? bannerList : []);
      setCategories(Array.isArray(catList) ? catList : []);
      setServices(Array.isArray(srvList) ? srvList : []);
      setCoupons(Array.isArray(couponList) ? couponList : []);
    } catch (err) {
      toast.error('Failed to load banners directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingBanner(null);
    setFormData({
      title: '',
      subtitle: '',
      badgeText: '',
      imageUrl: '',
      gradientBg: gradientPresets[0].value,
      targetType: 'none',
      targetValue: '',
      couponCode: '',
      isActive: true,
      displayOrder: banners.length,
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      badgeText: banner.badgeText || '',
      imageUrl: banner.imageUrl || '',
      gradientBg: banner.gradientBg || gradientPresets[0].value,
      targetType: banner.targetType || 'none',
      targetValue: banner.targetValue || '',
      couponCode: banner.couponCode || '',
      isActive: banner.isActive !== undefined ? banner.isActive : true,
      displayOrder: banner.displayOrder !== undefined ? banner.displayOrder : 0,
    });
    setModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      
      const response = await superAdminService.getPresignedUrl({
        fileName: file.name,
        mimeType: file.type,
        folder: 'banners'
      });
      
      const responseData = response?.data?.data || response?.data;
      const { presignedUrl, publicUrl } = responseData;

      await fetch(presignedUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        body: file
      });

      setFormData(prev => ({ ...prev, imageUrl: publicUrl }));
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Upload Error:', error);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingBanner) {
        await superAdminService.updateBanner(editingBanner._id, formData);
        toast.success('Promotional banner updated successfully!');
      } else {
        await superAdminService.createBanner(formData);
        toast.success('New promotional banner created!');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Error saving banner';
      toast.error(errMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await superAdminService.deleteBanner(deleteTarget._id);
      toast.success(`Banner '${deleteTarget.title}' deleted`);
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      toast.error('Failed to delete banner');
    } finally {
      setDeleting(false);
    }
  };

  const openTemplate = (tpl) => {
    setEditingBanner(null);
    setFormData({
      title: tpl.title,
      subtitle: tpl.subtitle,
      badgeText: tpl.badgeText,
      imageUrl: '',
      gradientBg: tpl.gradientBg,
      targetType: tpl.targetType,
      targetValue: '',
      couponCode: '',
      isActive: true,
      displayOrder: banners.length,
    });
    setModalOpen(true);
  };

  const handleToggleActive = async (banner) => {
    try {
      await superAdminService.toggleBannerStatus(banner._id);
      toast.success(`Banner status updated to ${!banner.isActive ? 'Active' : 'Inactive'}`);
      fetchData();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const filteredBanners = [...banners].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)).filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.subtitle && b.subtitle.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && b.isActive) ||
      (statusFilter === 'INACTIVE' && !b.isActive);
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
      {/* STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        <StatCard icon={Image} color="#2563eb" bg="#eff6ff" label="Total banners" value={banners.length} />
        <StatCard icon={CheckCircle2} color="#059669" bg="#ecfdf5" label="Live in customer app" value={banners.filter((b) => b.isActive).length} />
        <StatCard icon={Tag} color="#d97706" bg="#fffbeb" label="Linked to category" value={banners.filter((b) => b.targetType === 'category').length} />
        <StatCard icon={Link} color="#7c3aed" bg="#f5f3ff" label="Linked to service" value={banners.filter((b) => b.targetType === 'service').length} />
      </div>

      <div style={{ ...card, padding: '20px', minWidth: 0 }}>
        {/* TOOLBAR */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div role="tablist" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {[['ALL', 'All', banners.length], ['ACTIVE', 'Active', banners.filter((b) => b.isActive).length], ['INACTIVE', 'Inactive', banners.filter((b) => !b.isActive).length]].map(([id, label, n]) => {
              const active = statusFilter === id;
              return (
                <button key={id} type="button" role="tab" aria-selected={active} onClick={() => setStatusFilter(id)} style={{ padding: '6px 13px', borderRadius: '9999px', border: `1px solid ${active ? '#059669' : '#e2e8f0'}`, background: active ? '#059669' : '#ffffff', color: active ? '#ffffff' : '#475569', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  {label}<span style={{ opacity: 0.75, marginLeft: '6px' }}>{n}</span>
                </button>
              );
            })}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
            <label style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
              <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '10px' }} />
              <input type="search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search title or subtitle" style={{ ...inputStyle, paddingLeft: '30px', width: '210px' }} />
            </label>
            <select aria-label="Start from a template" value="" onChange={(e) => { const t = TEMPLATES[Number(e.target.value)]; if (t) openTemplate(t); }} style={inputStyle}>
              <option value="">Use a template…</option>
              {TEMPLATES.map((t, i) => <option key={t.label} value={i}>{t.label}</option>)}
            </select>
            <button type="button" onClick={handleOpenCreateModal} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#ffffff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.84rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)' }}>
              <Plus size={16} /> Create Banner
            </button>
          </div>
        </div>

        {/* TABLE */}
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
            <Loader2 size={28} className="spin" style={{ margin: '0 auto 10px auto' }} />
            <div>Loading promotional banners…</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
            <table style={{ width: '100%', minWidth: '900px', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={headRow}>
                  <Th w="48px">#</Th><Th>Preview</Th><Th>Banner</Th><Th>Click target</Th><Th>Coupon</Th><Th>Order</Th><Th>Status</Th><th style={{ width: '56px' }} />
                </tr>
              </thead>
              <tbody>
                {filteredBanners.length === 0 ? (
                  <tr><td colSpan={8} style={{ padding: '40px 16px', textAlign: 'center', color: '#64748b', fontSize: '0.88rem' }}>
                    {banners.length ? 'No banners match these filters.' : 'No promotional banners yet. Click "Create Banner" or pick a template to add one.'}
                  </td></tr>
                ) : filteredBanners.map((b, idx) => (
                  <tr key={b._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ ...td, color: '#94a3b8', fontWeight: 700 }}>{idx + 1}</td>
                    <td style={td}>
                      <div style={{ width: '128px', height: '64px', borderRadius: '10px', background: b.imageUrl ? `url(${b.imageUrl}) center/cover` : (b.gradientBg || 'linear-gradient(135deg, #09331E, #0f172a)'), padding: '7px', color: '#ffffff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid rgba(15,23,42,0.08)', overflow: 'hidden' }}>
                        <span style={{ background: 'rgba(255,255,255,0.25)', fontSize: '0.55rem', fontWeight: 800, padding: '2px 6px', borderRadius: '6px', alignSelf: 'flex-start' }}>{b.badgeText || 'OFFER'}</span>
                        <div style={{ fontSize: '0.68rem', fontWeight: 900, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.title}</div>
                      </div>
                    </td>
                    <td style={{ ...td, maxWidth: '260px' }}>
                      <div title={b.title} style={{ fontWeight: 800, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.title}</div>
                      {b.subtitle && <div title={b.subtitle} style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{b.subtitle}</div>}
                    </td>
                    <td style={td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                        <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', background: b.targetType === 'category' ? '#dbeafe' : b.targetType === 'service' ? '#f3e8ff' : '#f1f5f9', color: b.targetType === 'category' ? '#1d4ed8' : b.targetType === 'service' ? '#6b21a8' : '#475569' }}>{b.targetType || 'none'}</span>
                        <span title={b.targetValue || ''} style={{ fontWeight: 600, fontSize: '0.8rem', color: '#334155', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.targetValue || '—'}</span>
                      </div>
                    </td>
                    <td style={td}>
                      {b.couponCode
                        ? <span style={{ background: '#ecfdf5', color: '#047857', border: '1px dashed #10b981', padding: '3px 9px', borderRadius: '8px', fontWeight: 800, fontSize: '0.78rem', whiteSpace: 'nowrap' }}>{b.couponCode}</span>
                        : <span style={{ color: '#cbd5e1' }}>—</span>}
                    </td>
                    <td style={{ ...td, fontWeight: 800, color: '#475569', whiteSpace: 'nowrap' }}>{b.displayOrder || 0}</td>
                    <td style={{ ...td, whiteSpace: 'nowrap' }}>
                      <button type="button" onClick={() => handleToggleActive(b)} title={b.isActive ? 'Click to deactivate' : 'Click to activate'} style={{ border: `1px solid ${b.isActive ? '#a7f3d0' : '#e2e8f0'}`, background: b.isActive ? '#ecfdf5' : '#f1f5f9', color: b.isActive ? '#047857' : '#64748b', padding: '3px 11px', borderRadius: '9999px', fontWeight: 800, fontSize: '0.7rem', cursor: 'pointer' }}>
                        ● {b.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td style={{ ...td, textAlign: 'right' }}>
                      <RowMenu active={b.isActive} onEdit={() => handleOpenEditModal(b)} onToggle={() => handleToggleActive(b)} onDelete={() => setDeleteTarget(b)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {deleteTarget && <DeleteModal banner={deleteTarget} busy={deleting} onClose={() => setDeleteTarget(null)} onConfirm={handleConfirmDelete} />}

      {/* CREATE / EDIT MODAL */}
      {modalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1100,
            background: 'rgba(15, 23, 42, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              maxWidth: '650px',
              width: '100%',
              maxHeight: '90vh',
              background: '#ffffff',
              borderRadius: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              margin: 'auto',
              border: '1px solid #e2e8f0'
            }}
          >
            {/* MODAL HEADER */}
            <div
              style={{
                padding: '18px 24px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#ffffff',
                color: '#0f172a',
                flexShrink: 0
              }}
            >
              <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', color: '#0f172a' }}>
                {editingBanner ? `Edit Banner: ${editingBanner.title}` : 'Create New Promotional Banner'}
              </h4>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '50%', color: '#64748b', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* FORM BODY */}
            <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', flex: 1 }}>
              
              {/* LIVE CUSTOMER PREVIEW CARD */}
              <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '14px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.74rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Live Customer App Preview
                </div>
                <div style={{
                  background: formData.imageUrl ? `url(${formData.imageUrl}) center/cover` : (formData.gradientBg || gradientPresets[0].value),
                  borderRadius: '16px',
                  padding: '20px',
                  color: '#ffffff',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  {formData.badgeText && (
                    <span style={{ background: 'rgba(255,255,255,0.2)', padding: '3px 10px', borderRadius: '12px', fontSize: '0.68rem', fontWeight: '800', textTransform: 'uppercase', alignSelf: 'flex-start' }}>
                      {formData.badgeText}
                    </span>
                  )}
                  {formData.title && (
                    <div style={{ fontSize: '1.4rem', fontWeight: '900', lineHeight: 1.2 }}>
                      {formData.title}
                    </div>
                  )}
                  {formData.subtitle && (
                    <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                      {formData.subtitle}
                    </div>
                  )}
                  <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button type="button" style={{ padding: '6px 14px', background: '#ffffff', color: '#0f172a', border: 'none', borderRadius: '9999px', fontSize: '0.76rem', fontWeight: '800', cursor: 'default' }}>
                      Book Now <ArrowRight size={12} style={{ display: 'inline', marginLeft: '4px' }} />
                    </button>
                    {formData.couponCode && (
                      <span style={{ fontSize: '0.74rem', color: '#fef08a', fontWeight: '800' }}>
                        🎟️ Code: {formData.couponCode}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* TITLE & BADGE */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#475569', display: 'block', marginBottom: '6px' }}>
                    BANNER TITLE
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. AC Jet Deep Cleaning"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#475569', display: 'block', marginBottom: '6px' }}>
                    BADGE TAG
                  </label>
                  <input
                    type="text"
                    value={formData.badgeText}
                    onChange={(e) => setFormData({ ...formData, badgeText: e.target.value })}
                    placeholder="e.g. FLAT 50% OFF"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#475569', display: 'block', marginBottom: '6px' }}>
                  SUBTITLE / DISCOUNT OFFER TEXT
                </label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="e.g. Book 2-in-1 Foam Jet AC Cleaning at flat 50% OFF"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none' }}
                />
              </div>

              {/* BACKGROUND PRESET OR IMAGE URL */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#475569', display: 'block', marginBottom: '6px' }}>
                    COLOR GRADIENT PRESET
                  </label>
                  <select
                    value={formData.gradientBg}
                    onChange={(e) => setFormData({ ...formData, gradientBg: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: '700', outline: 'none' }}
                  >
                    {gradientPresets.map((preset, idx) => (
                      <option key={idx} value={preset.value}>{preset.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#475569', display: 'block', marginBottom: '6px' }}>
                    Upload Image URL (Optional)
                  </label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      placeholder="https://... or click Upload"
                      style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }}
                    />
                    <label style={{ cursor: 'pointer', padding: '10px 14px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '700', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '70px' }}>
                      {uploadingImage ? <Loader2 size={16} className="spin" /> : 'Upload'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* TARGET TYPE & VALUE */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#475569', display: 'block', marginBottom: '6px' }}>
                    CLICK TARGET ACTION
                  </label>
                  <select
                    value={formData.targetType}
                    onChange={(e) => setFormData({ ...formData, targetType: e.target.value, targetValue: '' })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: '700', outline: 'none' }}
                  >
                    <option value="none">None (Informational Banner)</option>
                    <option value="category">Open Category Page</option>
                    <option value="service">Open Service Details</option>
                    <option value="coupon">Apply Promo Coupon</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#475569', display: 'block', marginBottom: '6px' }}>
                    TARGET VALUE
                  </label>

                  {formData.targetType === 'category' ? (
                    <select
                      value={formData.targetValue}
                      onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }}
                    >
                      <option value="">Select Category...</option>
                      {categories.map((c) => (
                        <option key={c._id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  ) : formData.targetType === 'service' ? (
                    <select
                      value={formData.targetValue}
                      onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }}
                    >
                      <option value="">Select Service...</option>
                      {services.map((s) => (
                        <option key={s._id} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                  ) : formData.targetType === 'coupon' ? (
                    <select
                      value={formData.targetValue}
                      onChange={(e) => setFormData({ ...formData, targetValue: e.target.value, couponCode: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: '800', outline: 'none' }}
                    >
                      <option value="">Select Promo Coupon...</option>
                      {coupons.map((c) => (
                        <option key={c._id} value={c.code}>🎟️ {c.code} ({c.title})</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={formData.targetValue}
                      onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })}
                      placeholder="Category / Service / Link name"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }}
                    />
                  )}
                </div>
              </div>

              {/* ATTACHED COUPON & ORDER */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#475569', display: 'block', marginBottom: '6px' }}>
                    ATTACH PROMO COUPON CODE
                  </label>
                  {coupons.length > 0 ? (
                    <select
                      value={formData.couponCode}
                      onChange={(e) => setFormData({ ...formData, couponCode: e.target.value.toUpperCase() })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: '800', outline: 'none', background: '#ffffff' }}
                    >
                      <option value="">-- Select Pre-Created Coupon --</option>
                      {coupons.map((c) => (
                        <option key={c._id} value={c.code}>
                          🎟️ {c.code} ({c.title} • {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={formData.couponCode}
                      onChange={(e) => setFormData({ ...formData, couponCode: e.target.value.toUpperCase() })}
                      placeholder="e.g. SUMMER50, CLEAN500"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', outline: 'none' }}
                    />
                  )}
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#475569', display: 'block', marginBottom: '6px' }}>
                    DISPLAY ORDER POSITION
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }}
                  />
                </div>
              </div>

              {/* ENABLE CHECKBOX */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: '800', fontSize: '0.88rem', color: '#0f172a' }}>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    style={{ width: '18px', height: '18px', accentColor: '#10b981' }}
                  />
                  Enable Banner on Customer Home Feed
                </label>
              </div>

              {/* MODAL FOOTER */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={{
                    padding: '12px 20px',
                    borderRadius: '14px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    fontWeight: '700',
                    color: '#64748b',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '14px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
                    fontWeight: '800',
                    color: '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  {saving && <Loader2 size={16} className="spin" />}
                  {editingBanner ? 'Save Changes' : 'Create Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminBannersView;
