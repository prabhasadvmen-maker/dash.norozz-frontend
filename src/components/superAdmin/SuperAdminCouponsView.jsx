import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Tag,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  Percent,
  IndianRupee,
  Loader2,
  X,
  Power,
  MoreVertical,
  AlertTriangle
} from 'lucide-react';
import { superAdminService } from '../../services/superAdmin.service.js';
import { catalogService } from '../../services/catalog.service.js';
import { toast } from '../../utils/toast.js';

const card = { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)' };
const inputStyle = { padding: '8px 11px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '0.84rem', color: '#0f172a', background: '#ffffff' };
const headRow = { background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' };
const td = { padding: '12px 10px', fontSize: '0.84rem', color: '#334155', verticalAlign: 'middle' };
const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

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

const Th = ({ children, w, right }) => <th style={{ padding: '11px 10px', fontWeight: 800, whiteSpace: 'nowrap', textAlign: right ? 'right' : 'left', width: w }}>{children}</th>;

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
      <button type="button" aria-label="Coupon actions" aria-haspopup="menu" aria-expanded={open} onClick={toggle} style={{ width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: open ? '#f1f5f9' : 'transparent', border: '1px solid transparent', borderRadius: '10px', color: '#64748b', cursor: 'pointer' }}>
        <MoreVertical size={18} />
      </button>
      {open && pos && (
        <div role="menu" style={{ position: 'fixed', ...pos, zIndex: 1050, minWidth: '170px', padding: '6px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 12px 30px rgba(15, 23, 42, 0.14)' }}>
          <button type="button" role="menuitem" onClick={pick(onEdit)} style={menuItem('#334155')}><Edit2 size={16} color="#d97706" /> Edit coupon</button>
          <button type="button" role="menuitem" onClick={pick(onToggle)} style={menuItem(active ? '#b45309' : '#047857')}><Power size={16} /> {active ? 'Deactivate' : 'Activate'}</button>
          <div style={{ height: '1px', background: '#f1f5f9', margin: '4px 0' }} />
          <button type="button" role="menuitem" onClick={pick(onDelete)} style={menuItem('#dc2626')}><Trash2 size={16} /> Delete</button>
        </div>
      )}
    </div>
  );
};

const DeleteModal = ({ coupon, busy, onClose, onConfirm }) => {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  const redeemed = (coupon.usedBy || []).length;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" role="dialog" aria-modal="true" aria-label="Delete coupon" onClick={(e) => e.stopPropagation()} style={{ padding: '26px', maxWidth: '430px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Delete coupon</h3>
          <button type="button" onClick={onClose} aria-label="Close" style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '50%', color: '#64748b', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={18} /></button>
        </div>
        <div style={{ display: 'flex', gap: '12px', padding: '12px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', color: '#991b1b', fontSize: '0.86rem', lineHeight: 1.45 }}>
          <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '1px' }} />
          <div>
            Delete <strong>{coupon.code}</strong>? Customers will no longer be able to apply it{redeemed > 0 ? <>, and its record of <strong>{redeemed}</strong> redemption{redeemed === 1 ? '' : 's'} is lost</> : ''}. To stop it for now, use Deactivate instead.
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '22px' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={busy}>Cancel</button>
          <button type="button" className="btn" disabled={busy} onClick={onConfirm} style={{ background: '#dc2626', color: '#fff', border: 'none' }}>{busy ? 'Deleting…' : 'Delete coupon'}</button>
        </div>
      </div>
    </div>
  );
};

const SuperAdminCouponsView = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const paramTab = searchParams.get('tab');
  const statusFilter = paramTab ? paramTab.toUpperCase() : 'ALL';

  const setStatusFilter = (st) => {
    setSearchParams({ tab: st.toLowerCase() });
  };

  const [coupons, setCoupons] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    description: '',
    applicableCategory: '',
    discountType: 'fixed',
    discountValue: '',
    maxDiscountAmount: '',
    minBookingAmount: '0',
    usageLimitPerUser: '1',
    isActive: true,
  });

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await superAdminService.getCoupons();
      const list = res.data?.data || res.data || [];
      setCoupons(Array.isArray(list) ? list : []);
    } catch (err) {
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
    catalogService
      .getCategories()
      .then((res) => {
        const list = res.data?.data || res.data || [];
        setCategories(Array.isArray(list) ? list : []);
      })
      .catch((err) => console.warn('Failed to load categories:', err));
  }, []);

  const handleOpenCreateModal = () => {
    setEditingCoupon(null);
    setFormData({
      code: '',
      title: '',
      description: '',
      applicableCategory: '',
      discountType: 'fixed',
      discountValue: '',
      maxDiscountAmount: '',
      minBookingAmount: '0',
      usageLimitPerUser: '1',
      isActive: true,
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code || '',
      title: coupon.title || '',
      description: coupon.description || '',
      applicableCategory: coupon.applicableCategory?._id || coupon.applicableCategory || '',
      discountType: coupon.discountType || 'fixed',
      discountValue: coupon.discountValue !== undefined ? String(coupon.discountValue) : '',
      maxDiscountAmount: coupon.maxDiscountAmount ? String(coupon.maxDiscountAmount) : '',
      minBookingAmount: coupon.minBookingAmount !== undefined ? String(coupon.minBookingAmount) : '0',
      usageLimitPerUser: coupon.usageLimitPerUser !== undefined ? String(coupon.usageLimitPerUser) : '1',
      isActive: coupon.isActive !== undefined ? coupon.isActive : true,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.title.trim() || !formData.discountValue) {
      toast.error('Please fill in required fields (Code, Title, Discount Value)');
      return;
    }

    setSaving(true);
    try {
      if (editingCoupon) {
        await superAdminService.updateCoupon(editingCoupon._id, formData);
        toast.success('Coupon updated successfully!');
      } else {
        await superAdminService.createCoupon(formData);
        toast.success('New coupon created successfully!');
      }
      setModalOpen(false);
      fetchCoupons();
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Error saving coupon';
      toast.error(errMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await superAdminService.deleteCoupon(deleteTarget._id);
      toast.success(`Coupon '${deleteTarget.code}' deleted`);
      setDeleteTarget(null);
      fetchCoupons();
    } catch (err) {
      toast.error('Failed to delete coupon');
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleActive = async (coupon) => {
    try {
      await superAdminService.updateCoupon(coupon._id, { isActive: !coupon.isActive });
      toast.success(`Coupon status updated to ${!coupon.isActive ? 'Active' : 'Inactive'}`);
      fetchCoupons();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  // Filtered List
  const filteredCoupons = coupons.filter((c) => {
    const matchesSearch =
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && c.isActive) ||
      (statusFilter === 'INACTIVE' && !c.isActive);
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
      {/* STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        <StatCard icon={Tag} color="#2563eb" bg="#eff6ff" label="Total coupons" value={coupons.length} />
        <StatCard icon={CheckCircle2} color="#059669" bg="#ecfdf5" label="Active codes" value={coupons.filter((c) => c.isActive).length} />
        <StatCard icon={Percent} color="#d97706" bg="#fffbeb" label="Percentage offers" value={coupons.filter((c) => c.discountType === 'percentage').length} />
        <StatCard icon={IndianRupee} color="#7c3aed" bg="#f5f3ff" label="Flat ₹ discounts" value={coupons.filter((c) => c.discountType === 'fixed').length} />
      </div>

      <div style={{ ...card, padding: '20px', minWidth: 0 }}>
        {/* TOOLBAR */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div role="tablist" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {[['ALL', 'All', coupons.length], ['ACTIVE', 'Active', coupons.filter((c) => c.isActive).length], ['INACTIVE', 'Inactive', coupons.filter((c) => !c.isActive).length]].map(([id, label, n]) => {
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
              <input type="search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search code or title" style={{ ...inputStyle, paddingLeft: '30px', width: '210px' }} />
            </label>
            <button type="button" onClick={handleOpenCreateModal} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#ffffff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.84rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)' }}>
              <Plus size={16} /> Create Coupon
            </button>
          </div>
        </div>

        {/* TABLE */}
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
            <Loader2 size={28} className="spin" style={{ margin: '0 auto 10px auto' }} />
            <div>Loading coupons…</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
            <table style={{ width: '100%', minWidth: '900px', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={headRow}>
                  <Th w="48px">#</Th><Th>Code</Th><Th>Offer</Th><Th>Discount</Th><Th>Min booking</Th><Th>Usage</Th><Th>Status</Th><th style={{ width: '56px' }} />
                </tr>
              </thead>
              <tbody>
                {filteredCoupons.length === 0 ? (
                  <tr><td colSpan={8} style={{ padding: '40px 16px', textAlign: 'center', color: '#64748b', fontSize: '0.88rem' }}>
                    {coupons.length ? 'No coupons match these filters.' : 'No coupons yet. Click "Create Coupon" to set up your first promo code.'}
                  </td></tr>
                ) : filteredCoupons.map((c, idx) => {
                  const catName = c.applicableCategory
                    ? (typeof c.applicableCategory === 'object' ? c.applicableCategory.name : categories.find((cat) => cat._id === c.applicableCategory)?.name) || 'Category specific'
                    : '';
                  const redeemed = (c.usedBy || []).length;
                  return (
                    <tr key={c._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ ...td, color: '#94a3b8', fontWeight: 700 }}>{idx + 1}</td>
                      <td style={td}>
                        <span style={{ background: '#ecfdf5', color: '#047857', border: '1px dashed #10b981', padding: '4px 10px', borderRadius: '8px', fontWeight: 900, fontSize: '0.84rem', letterSpacing: '0.4px', whiteSpace: 'nowrap' }}>{c.code}</span>
                      </td>
                      <td style={{ ...td, maxWidth: '280px' }}>
                        <div title={c.title} style={{ fontWeight: 800, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</div>
                        {c.description && <div title={c.description} style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{c.description}</div>}
                        <span style={{ display: 'inline-block', marginTop: '5px', fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: '6px', background: catName ? '#eff6ff' : '#f8fafc', color: catName ? '#2563eb' : '#64748b', border: `1px solid ${catName ? '#bfdbfe' : '#e2e8f0'}` }}>
                          {catName || 'All categories'}
                        </span>
                      </td>
                      <td style={{ ...td, whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: 800, color: c.discountType === 'percentage' ? '#2563eb' : '#7c3aed' }}>
                          {c.discountType === 'percentage' ? `${c.discountValue}% off` : `${money(c.discountValue)} off`}
                        </div>
                        {c.discountType === 'percentage' && c.maxDiscountAmount > 0 && <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Up to {money(c.maxDiscountAmount)}</div>}
                      </td>
                      <td style={{ ...td, whiteSpace: 'nowrap', fontWeight: 700 }}>{c.minBookingAmount > 0 ? money(c.minBookingAmount) : <span style={{ color: '#94a3b8', fontWeight: 600 }}>No minimum</span>}</td>
                      <td style={{ ...td, whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{c.usageLimitPerUser === 1 ? 'Once per customer' : `${c.usageLimitPerUser}× per customer`}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{redeemed} redeemed</div>
                      </td>
                      <td style={{ ...td, whiteSpace: 'nowrap' }}>
                        <button type="button" onClick={() => handleToggleActive(c)} title={c.isActive ? 'Click to deactivate' : 'Click to activate'} style={{ border: `1px solid ${c.isActive ? '#a7f3d0' : '#e2e8f0'}`, background: c.isActive ? '#ecfdf5' : '#f1f5f9', color: c.isActive ? '#047857' : '#64748b', padding: '3px 11px', borderRadius: '9999px', fontWeight: 800, fontSize: '0.7rem', cursor: 'pointer' }}>
                          ● {c.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td style={{ ...td, textAlign: 'right' }}>
                        <RowMenu active={c.isActive} onEdit={() => handleOpenEditModal(c)} onToggle={() => handleToggleActive(c)} onDelete={() => setDeleteTarget(c)} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {deleteTarget && <DeleteModal coupon={deleteTarget} busy={deleting} onClose={() => setDeleteTarget(null)} onConfirm={handleConfirmDelete} />}

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
            background: 'rgba(15, 23, 42, 0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              maxWidth: '540px',
              width: '100%',
              maxHeight: '85vh',
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
                {editingCoupon ? `Edit Coupon: ${editingCoupon.code}` : 'Create New Promo Coupon'}
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
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#475569', display: 'block', marginBottom: '6px' }}>
                  PROMO CODE *
                </label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. FIRST30, FESTIVE100"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.95rem',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    outline: 'none',
                    color: '#0f172a',
                    background: '#f8fafc',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#475569', display: 'block', marginBottom: '6px' }}>
                  OFFER TITLE *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. 30% Off on your first booking"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    outline: 'none',
                    color: '#0f172a',
                    background: '#f8fafc',
                    fontWeight: '600',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#475569', display: 'block', marginBottom: '6px' }}>
                  SUBTITLE / DESCRIPTION
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Valid on bookings above ₹1,000"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    outline: 'none',
                    color: '#0f172a',
                    background: '#f8fafc',
                    fontWeight: '600',
                  }}
                />
              </div>

              {/* APPLICABLE CATEGORY */}
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#475569', display: 'block', marginBottom: '6px' }}>
                  APPLICABLE CATEGORY (OPTIONAL)
                </label>
                <select
                  value={formData.applicableCategory}
                  onChange={(e) => setFormData({ ...formData, applicableCategory: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    fontWeight: '700',
                    outline: 'none',
                    background: '#ffffff',
                    color: '#0f172a',
                  }}
                >
                  <option value="">🌐 All Categories (Global Promo Code)</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      📁 {cat.name}
                    </option>
                  ))}
                </select>
                <span style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '4px', display: 'block', fontWeight: '500' }}>
                  Select a category to restrict this promo code ONLY to that category's services. Leave empty for all categories.
                </span>
              </div>

              {/* DISCOUNT TYPE & VALUE */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#475569', display: 'block', marginBottom: '6px' }}>
                    DISCOUNT TYPE
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.88rem',
                      fontWeight: '700',
                      outline: 'none',
                      background: '#ffffff',
                    }}
                  >
                    <option value="fixed">Flat ₹ Cash Discount</option>
                    <option value="percentage">Percentage % Discount</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#475569', display: 'block', marginBottom: '6px' }}>
                    DISCOUNT VALUE *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    placeholder={formData.discountType === 'percentage' ? 'e.g. 30 (for 30%)' : 'e.g. 100 (for ₹100)'}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.88rem',
                      outline: 'none',
                      color: '#0f172a',
                      background: '#f8fafc',
                      fontWeight: '700',
                    }}
                  />
                </div>
              </div>

              {/* MIN BOOKING & MAX DISCOUNT CAP */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#475569', display: 'block', marginBottom: '6px' }}>
                    MIN ORDER AMOUNT (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minBookingAmount}
                    onChange={(e) => setFormData({ ...formData, minBookingAmount: e.target.value })}
                    placeholder="0 for no min"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.88rem',
                      outline: 'none',
                      color: '#0f172a',
                      background: '#f8fafc',
                      fontWeight: '700',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#475569', display: 'block', marginBottom: '6px' }}>
                    MAX DISCOUNT CAP (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.maxDiscountAmount}
                    onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                    placeholder="Leave blank for no cap"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.88rem',
                      outline: 'none',
                      color: '#0f172a',
                      background: '#f8fafc',
                      fontWeight: '700',
                    }}
                  />
                </div>
              </div>

              {/* USAGE LIMIT PER USER */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', alignItems: 'center' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#475569', display: 'block', marginBottom: '6px' }}>
                    MAX USES PER CUSTOMER
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.usageLimitPerUser}
                    onChange={(e) => setFormData({ ...formData, usageLimitPerUser: e.target.value })}
                    placeholder="1 (Default: Single use)"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.88rem',
                      outline: 'none',
                      color: '#0f172a',
                      background: '#f8fafc',
                      fontWeight: '700',
                    }}
                  />
                </div>

                <div style={{ paddingTop: '20px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: '800', fontSize: '0.88rem', color: '#0f172a' }}>
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      style={{ width: '18px', height: '18px', accentColor: '#10b981' }}
                    />
                    Enable Coupon
                  </label>
                </div>
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
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  {editingCoupon ? 'Save Changes' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminCouponsView;
