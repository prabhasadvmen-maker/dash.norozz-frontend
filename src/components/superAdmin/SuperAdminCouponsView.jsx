import React, { useState, useEffect } from 'react';
import {
  Tag,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Percent,
  DollarSign,
  ShieldCheck,
  AlertCircle,
  Loader2,
  X
} from 'lucide-react';
import { superAdminService } from '../../services/superAdmin.service.js';
import { toast } from '../../utils/toast.js';

const SuperAdminCouponsView = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    description: '',
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
  }, []);

  const handleOpenCreateModal = () => {
    setEditingCoupon(null);
    setFormData({
      code: '',
      title: '',
      description: '',
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

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Are you sure you want to delete coupon '${code}'?`)) return;
    try {
      await superAdminService.deleteCoupon(id);
      toast.success(`Coupon '${code}' deleted`);
      fetchCoupons();
    } catch (err) {
      toast.error('Failed to delete coupon');
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* HEADER ACTION BAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
            SuperAdmin Coupon Management
          </h3>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
            Create & configure promo codes, set minimum order rules, and limit 1-time usage per customer.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="btn btn-primary"
          style={{
            padding: '11px 20px',
            borderRadius: '14px',
            fontWeight: '800',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
            boxShadow: '0 4px 14px rgba(124, 58, 237, 0.3)',
          }}
        >
          <Plus size={18} /> Create New Coupon
        </button>
      </div>

      {/* STATS CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="mui-card" style={{ padding: '20px', borderRadius: '18px', background: '#ffffff' }}>
          <div style={{ fontSize: '0.76rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            Total Coupons
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#0f172a', marginTop: '6px' }}>
            {coupons.length}
          </div>
        </div>

        <div className="mui-card" style={{ padding: '20px', borderRadius: '18px', background: '#ffffff' }}>
          <div style={{ fontSize: '0.76rem', fontWeight: '800', color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            Active Promo Codes
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#10b981', marginTop: '6px' }}>
            {coupons.filter((c) => c.isActive).length}
          </div>
        </div>

        <div className="mui-card" style={{ padding: '20px', borderRadius: '18px', background: '#ffffff' }}>
          <div style={{ fontSize: '0.76rem', fontWeight: '800', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            Percentage % Offers
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#3b82f6', marginTop: '6px' }}>
            {coupons.filter((c) => c.discountType === 'percentage').length}
          </div>
        </div>

        <div className="mui-card" style={{ padding: '20px', borderRadius: '18px', background: '#ffffff' }}>
          <div style={{ fontSize: '0.76rem', fontWeight: '800', color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            Flat ₹ Cash Discounts
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#7c3aed', marginTop: '6px' }}>
            {coupons.filter((c) => c.discountType === 'fixed').length}
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div
        className="mui-card"
        style={{
          padding: '16px 20px',
          borderRadius: '18px',
          background: '#ffffff',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
        }}
      >
        <div style={{ position: 'relative', minWidth: '280px', flex: 1 }}>
          <Search size={17} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search promo code or title..."
            style={{
              width: '100%',
              padding: '10px 14px 10px 40px',
              borderRadius: '12px',
              border: '1px solid var(--border-light)',
              fontSize: '0.88rem',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {['ALL', 'ACTIVE', 'INACTIVE'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              style={{
                padding: '8px 16px',
                borderRadius: '12px',
                fontSize: '0.8rem',
                fontWeight: '800',
                cursor: 'pointer',
                border: '1px solid transparent',
                background: statusFilter === st ? '#7c3aed' : 'var(--bg-light)',
                color: statusFilter === st ? '#ffffff' : 'var(--text-secondary)',
              }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* TABLE LIST */}
      <div className="mui-card" style={{ padding: 0, borderRadius: '20px', overflow: 'hidden', background: '#ffffff' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
            <Loader2 size={30} className="animate-spin" style={{ margin: '0 auto 10px auto' }} />
            <div>Loading live coupons directory...</div>
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
            <Tag size={36} color="#cbd5e1" style={{ margin: '0 auto 10px auto' }} />
            <div style={{ fontWeight: '700', color: '#475569' }}>No coupons found</div>
            <div style={{ fontSize: '0.82rem', marginTop: '4px' }}>Click 'Create New Coupon' to configure your first promo code.</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <th style={{ padding: '14px 20px' }}>Coupon Code</th>
                  <th style={{ padding: '14px 20px' }}>Offer Title</th>
                  <th style={{ padding: '14px 20px' }}>Discount</th>
                  <th style={{ padding: '14px 20px' }}>Min Booking</th>
                  <th style={{ padding: '14px 20px' }}>Usage Rule</th>
                  <th style={{ padding: '14px 20px' }}>Status</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCoupons.map((c) => (
                  <tr key={c._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px 20px' }}>
                      <span
                        style={{
                          background: 'rgba(16, 185, 129, 0.12)',
                          color: '#059669',
                          border: '1px dashed #10b981',
                          padding: '6px 12px',
                          borderRadius: '10px',
                          fontWeight: '900',
                          fontSize: '0.92rem',
                          letterSpacing: '0.5px',
                        }}
                      >
                        {c.code}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontWeight: '800', color: '#0f172a' }}>{c.title}</div>
                      {c.description && <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>{c.description}</div>}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontWeight: '800', color: c.discountType === 'percentage' ? '#2563eb' : '#7c3aed' }}>
                        {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                      </div>
                      {c.discountType === 'percentage' && c.maxDiscountAmount && (
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Max Cap: ₹{c.maxDiscountAmount}</div>
                      )}
                    </td>
                    <td style={{ padding: '16px 20px', fontWeight: '700', color: '#334155' }}>
                      {c.minBookingAmount > 0 ? `₹${c.minBookingAmount}` : 'No Min Order'}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.82rem' }}>
                        {c.usageLimitPerUser === 1 ? '1 Time Per User' : `${c.usageLimitPerUser} Uses Per User`}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                        {(c.usedBy || []).length} Customers Redeemed
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <button
                        type="button"
                        onClick={() => handleToggleActive(c)}
                        style={{
                          border: 'none',
                          background: c.isActive ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                          color: c.isActive ? '#059669' : '#dc2626',
                          padding: '4px 12px',
                          borderRadius: '9999px',
                          fontWeight: '800',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                        }}
                      >
                        {c.isActive ? '● Active' : '○ Inactive'}
                      </button>
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(c)}
                          style={{
                            background: '#f1f5f9',
                            border: 'none',
                            color: '#475569',
                            padding: '6px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                          }}
                          title="Edit Coupon"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(c._id, c.code)}
                          style={{
                            background: '#fef2f2',
                            border: 'none',
                            color: '#ef4444',
                            padding: '6px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                          }}
                          title="Delete Coupon"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {modalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1100,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              maxWidth: '520px',
              width: '100%',
              background: '#ffffff',
              borderRadius: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* MODAL HEADER */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justify: 'space-between',
                background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                color: '#ffffff',
              }}
            >
              <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800' }}>
                {editingCoupon ? `Edit Coupon: ${editingCoupon.code}` : 'Create New Promo Coupon'}
              </h4>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', color: '#fff', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* FORM BODY */}
            <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                  }}
                />
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
                    }}
                  />
                </div>

                <div style={{ paddingTop: '20px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: '800', fontSize: '0.88rem', color: '#0f172a' }}>
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      style={{ width: '18px', height: '18px', accentColor: '#7c3aed' }}
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
                    background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
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
