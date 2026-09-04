import React, { useState, useEffect } from 'react';
import {
  Image,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
  X,
  Settings,
  Power,
  Sparkles,
  Link,
  Tag,
  ArrowRight,
  Eye
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

const SuperAdminBannersView = () => {
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [activeDropdownId, setActiveDropdownId] = useState(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [saving, setSaving] = useState(false);

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

  useEffect(() => {
    const handleClickOutside = () => setActiveDropdownId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

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
      badgeText: 'SPECIAL OFFER',
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
      badgeText: banner.badgeText || 'SPECIAL OFFER',
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Please enter banner title');
      return;
    }

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

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete banner '${title}'?`)) return;
    try {
      await superAdminService.deleteBanner(id);
      toast.success(`Banner '${title}' deleted`);
      fetchData();
    } catch (err) {
      toast.error('Failed to delete banner');
    }
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

  const filteredBanners = banners.filter((b) => {
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* HEADER ACTION BAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
            SuperAdmin Banner Management
          </h3>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
            Create & manage homepage hero banners, link them to service packages or categories, and attach promo codes for instant customer selection.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          style={{
            padding: '11px 20px',
            borderRadius: '14px',
            fontWeight: '800',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
            color: '#ffffff',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <Plus size={18} /> Create New Banner
        </button>
      </div>

      {/* STATS CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div className="mui-card" style={{ padding: '20px', borderRadius: '18px', background: '#ffffff' }}>
          <div style={{ fontSize: '0.76rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            Total Banners
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#0f172a', marginTop: '6px' }}>
            {banners.length}
          </div>
        </div>

        <div className="mui-card" style={{ padding: '20px', borderRadius: '18px', background: '#ffffff' }}>
          <div style={{ fontSize: '0.76rem', fontWeight: '800', color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            Active Customer Banners
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#10b981', marginTop: '6px' }}>
            {banners.filter((b) => b.isActive).length}
          </div>
        </div>

        <div className="mui-card" style={{ padding: '20px', borderRadius: '18px', background: '#ffffff' }}>
          <div style={{ fontSize: '0.76rem', fontWeight: '800', color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            Category Linked
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#2563eb', marginTop: '6px' }}>
            {banners.filter((b) => b.targetType === 'category').length}
          </div>
        </div>

        <div className="mui-card" style={{ padding: '20px', borderRadius: '18px', background: '#ffffff' }}>
          <div style={{ fontSize: '0.76rem', fontWeight: '800', color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            Service Linked
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#7c3aed', marginTop: '6px' }}>
            {banners.filter((b) => b.targetType === 'service').length}
          </div>
        </div>
      </div>

      {/* SEARCH & FILTER BAR */}
      <div
        className="mui-card"
        style={{
          padding: '16px 20px',
          borderRadius: '18px',
          background: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
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
            placeholder="Search banner title or subtitle..."
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
                background: statusFilter === st ? '#2563eb' : 'var(--bg-light)',
                color: statusFilter === st ? '#ffffff' : 'var(--text-secondary)',
              }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* BANNERS LIST TABLE */}
      <div className="mui-card" style={{ padding: 0, borderRadius: '20px', overflow: 'hidden', background: '#ffffff' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
            <Loader2 size={30} className="spin" style={{ margin: '0 auto 10px auto' }} />
            <div>Loading promotional banners...</div>
          </div>
        ) : filteredBanners.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
            <Image size={36} color="#cbd5e1" style={{ margin: '0 auto 10px auto' }} />
            <div style={{ fontWeight: '700', color: '#475569' }}>No promotional banners found</div>
            <div style={{ fontSize: '0.82rem', marginTop: '4px' }}>Click 'Create New Banner' to add hero banner for customer app.</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <th style={{ padding: '14px 20px' }}>Banner Preview</th>
                  <th style={{ padding: '14px 20px' }}>Banner Title & Text</th>
                  <th style={{ padding: '14px 20px' }}>Click Target / Link</th>
                  <th style={{ padding: '14px 20px' }}>Coupon Code</th>
                  <th style={{ padding: '14px 20px' }}>Order</th>
                  <th style={{ padding: '14px 20px' }}>Status</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBanners.map((b) => (
                  <tr key={b._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    
                    {/* Preview Cell */}
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{
                        width: '140px',
                        height: '70px',
                        borderRadius: '12px',
                        background: b.imageUrl ? `url(${b.imageUrl}) center/cover` : (b.gradientBg || 'linear-gradient(135deg, #09331E, #0f172a)'),
                        padding: '8px',
                        color: '#ffffff',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        overflow: 'hidden'
                      }}>
                        <span style={{ background: 'rgba(255,255,255,0.25)', fontSize: '0.55rem', fontWeight: '800', padding: '2px 6px', borderRadius: '6px', alignSelf: 'flex-start' }}>
                          {b.badgeText || 'OFFER'}
                        </span>
                        <div style={{ fontSize: '0.7rem', fontWeight: '900', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {b.title}
                        </div>
                      </div>
                    </td>

                    {/* Title & Subtitle */}
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '0.95rem' }}>{b.title}</div>
                      {b.subtitle && <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>{b.subtitle}</div>}
                    </td>

                    {/* Click Target */}
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '0.72rem',
                          fontWeight: '800',
                          background: b.targetType === 'category' ? '#dbeafe' : b.targetType === 'service' ? '#f3e8ff' : '#f1f5f9',
                          color: b.targetType === 'category' ? '#1d4ed8' : b.targetType === 'service' ? '#6b21a8' : '#475569',
                          textTransform: 'uppercase'
                        }}>
                          {b.targetType}
                        </span>
                        <span style={{ fontWeight: '700', fontSize: '0.82rem', color: '#334155' }}>
                          {b.targetValue || 'None'}
                        </span>
                      </div>
                    </td>

                    {/* Coupon Code */}
                    <td style={{ padding: '16px 20px' }}>
                      {b.couponCode ? (
                        <span style={{ background: '#ecfdf5', color: '#047857', border: '1px dashed #10b981', padding: '4px 10px', borderRadius: '8px', fontWeight: '800', fontSize: '0.8rem' }}>
                          🎟️ {b.couponCode}
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>None</span>
                      )}
                    </td>

                    {/* Order */}
                    <td style={{ padding: '16px 20px', fontWeight: '800', color: '#475569' }}>
                      #{b.displayOrder || 0}
                    </td>

                    {/* Status */}
                    <td style={{ padding: '16px 20px' }}>
                      <button
                        type="button"
                        onClick={() => handleToggleActive(b)}
                        style={{
                          border: 'none',
                          background: b.isActive ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                          color: b.isActive ? '#059669' : '#dc2626',
                          padding: '4px 12px',
                          borderRadius: '9999px',
                          fontWeight: '800',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                        }}
                      >
                        {b.isActive ? '● Active' : '○ Inactive'}
                      </button>
                    </td>

                    {/* Actions Dropdown */}
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <div style={{ position: 'relative', display: 'inline-block' }} onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => setActiveDropdownId(activeDropdownId === b._id ? null : b._id)}
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '10px',
                            background: activeDropdownId === b._id ? '#e2e8f0' : '#f1f5f9',
                            border: '1px solid #cbd5e1',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: '#334155'
                          }}
                        >
                          <Settings size={18} />
                        </button>

                        {activeDropdownId === b._id && (
                          <div style={{
                            position: 'absolute',
                            right: 0,
                            top: '42px',
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.12)',
                            padding: '6px',
                            zIndex: 50,
                            minWidth: '160px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px'
                          }}>
                            <button
                              type="button"
                              onClick={() => { setActiveDropdownId(null); handleOpenEditModal(b); }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 12px',
                                fontSize: '0.82rem',
                                fontWeight: '700',
                                color: '#2563eb',
                                background: 'transparent',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                textAlign: 'left',
                                width: '100%'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = '#eff6ff'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              <Edit2 size={15} color="#2563eb" /> Edit Banner
                            </button>

                            <button
                              type="button"
                              onClick={() => { setActiveDropdownId(null); handleToggleActive(b); }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 12px',
                                fontSize: '0.82rem',
                                fontWeight: '700',
                                color: b.isActive ? '#d97706' : '#16a34a',
                                background: 'transparent',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                textAlign: 'left',
                                width: '100%'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = b.isActive ? '#fffbeb' : '#f0fdf4'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              <Power size={15} color={b.isActive ? '#d97706' : '#16a34a'} /> {b.isActive ? 'Deactivate' : 'Activate'}
                            </button>

                            <div style={{ height: '1px', background: '#f1f5f9', margin: '2px 0' }} />

                            <button
                              type="button"
                              onClick={() => { setActiveDropdownId(null); handleDelete(b._id, b.title); }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 12px',
                                fontSize: '0.82rem',
                                fontWeight: '700',
                                color: '#dc2626',
                                background: 'transparent',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                textAlign: 'left',
                                width: '100%'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              <Trash2 size={15} color="#dc2626" /> Delete Banner
                            </button>
                          </div>
                        )}
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
                  <span style={{ background: 'rgba(255,255,255,0.2)', padding: '3px 10px', borderRadius: '12px', fontSize: '0.68rem', fontWeight: '800', textTransform: 'uppercase', alignSelf: 'flex-start' }}>
                    {formData.badgeText || 'SPECIAL OFFER'}
                  </span>
                  <div style={{ fontSize: '1.4rem', fontWeight: '900', lineHeight: 1.2 }}>
                    {formData.title || 'Banner Title Here'}
                  </div>
                  <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                    {formData.subtitle || 'Banner subtitle text will appear here.'}
                  </div>
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
                    BANNER TITLE *
                  </label>
                  <input
                    type="text"
                    required
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
                    OPTIONAL IMAGE URL
                  </label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }}
                  />
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
