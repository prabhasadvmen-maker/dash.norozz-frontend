import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Edit2, Star, Flame, CheckCircle2, ShieldAlert, Sparkles, Layers } from 'lucide-react';
import { catalogService } from '../../services/catalog.service.js';
import { toast } from '../../utils/toast.js';

const AdminPackageManagementModal = ({ isOpen, onClose, service }) => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form State for Create / Edit Package
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPackageId, setEditingPackageId] = useState(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [discountType, setDiscountType] = useState('none');
  const [discountValue, setDiscountValue] = useState('');
  const [duration, setDuration] = useState('45 mins');
  const [features, setFeatures] = useState([]);
  const [featureInput, setFeatureInput] = useState('');
  const [isPopular, setIsPopular] = useState(false);
  const [isRecommended, setIsRecommended] = useState(false);
  const [sortOrder, setSortOrder] = useState(0);

  const fetchPackages = () => {
    if (!service?._id) return;
    setLoading(true);
    catalogService
      .getServicePackages(service._id)
      .then((res) => {
        const list = res.data?.data || res.data || [];
        setPackages(Array.isArray(list) ? list : []);
      })
      .catch((err) => {
        console.error('Fetch packages error:', err);
        toast.error('Failed to load packages for this service.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isOpen && service?._id) {
      fetchPackages();
      setIsFormOpen(false);
    }
  }, [isOpen, service?._id]);

  if (!isOpen || !service) return null;

  // Live Server-Side Final Price Preview
  const calculateFinalPricePreview = () => {
    const baseP = Number(price) || 0;
    const discV = Number(discountValue) || 0;
    if (discountType === 'fixed') {
      return Math.max(0, baseP - discV);
    }
    if (discountType === 'percentage') {
      const pct = Math.min(100, Math.max(0, discV));
      return Math.max(0, Math.round(baseP * (1 - pct / 100)));
    }
    return Math.max(0, baseP);
  };

  const handleAddFeature = () => {
    if (!featureInput.trim()) return;
    setFeatures([...features, featureInput.trim()]);
    setFeatureInput('');
  };

  const handleRemoveFeature = (idx) => {
    setFeatures(features.filter((_, i) => i !== idx));
  };

  const handleOpenCreateForm = () => {
    setEditingPackageId(null);
    setTitle('');
    setDescription('');
    setPrice('');
    setDiscountType('none');
    setDiscountValue('');
    setDuration('45 mins');
    setFeatures([]);
    setFeatureInput('');
    setIsPopular(false);
    setIsRecommended(false);
    setSortOrder(packages.length);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (pkg) => {
    setEditingPackageId(pkg._id);
    setTitle(pkg.title || '');
    setDescription(pkg.description || '');
    setPrice(pkg.price || 0);
    setDiscountType(pkg.discountType || 'none');
    setDiscountValue(pkg.discountValue || 0);
    setDuration(pkg.duration || '45 mins');
    setFeatures(Array.isArray(pkg.features) ? [...pkg.features] : []);
    setFeatureInput('');
    setIsPopular(Boolean(pkg.isPopular));
    setIsRecommended(Boolean(pkg.isRecommended));
    setSortOrder(pkg.sortOrder || 0);
    setIsFormOpen(true);
  };

  const handleSubmitPackageForm = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Package title is required.');
      return;
    }
    if (price === '' || Number(price) < 0) {
      toast.error('Valid base price is required.');
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      price: Number(price),
      discountType,
      discountValue: Number(discountValue) || 0,
      duration: duration.trim() || '45 mins',
      features,
      isPopular,
      isRecommended,
      sortOrder: Number(sortOrder) || 0,
    };

    try {
      if (editingPackageId) {
        await catalogService.updatePackage(editingPackageId, payload);
        toast.success('Service Package updated successfully!');
      } else {
        await catalogService.createPackage(service._id, payload);
        toast.success('New Service Package created successfully!');
      }
      setIsFormOpen(false);
      fetchPackages();
    } catch (err) {
      console.error('Save package error:', err);
      toast.error(err.response?.data?.message || 'Failed to save service package.');
    }
  };

  const handleDeletePackage = async (id, pkgTitle) => {
    if (!window.confirm(`Are you sure you want to delete package '${pkgTitle}'?`)) return;
    try {
      await catalogService.deletePackage(id);
      toast.success(`Package '${pkgTitle}' deleted.`);
      fetchPackages();
    } catch (err) {
      toast.error('Failed to delete package.');
    }
  };

  const handleToggleStatus = async (pkg) => {
    const nextStatus = pkg.status === 'active' ? 'inactive' : 'active';
    try {
      await catalogService.updatePackageStatus(pkg._id, nextStatus);
      toast.success(`Package status updated to ${nextStatus.toUpperCase()}`);
      fetchPackages();
    } catch (err) {
      toast.error('Failed to update status.');
    }
  };

  const handleTogglePopular = async (pkg) => {
    try {
      await catalogService.togglePackagePopular(pkg._id);
      fetchPackages();
    } catch (err) {
      toast.error('Failed to update popular flag.');
    }
  };

  const handleToggleRecommended = async (pkg) => {
    try {
      await catalogService.togglePackageRecommended(pkg._id);
      fetchPackages();
    } catch (err) {
      toast.error('Failed to update recommended flag.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1050 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '820px',
          width: '95%',
          padding: 0,
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Modal Header */}
        <div style={{
          padding: '20px 24px',
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <span style={{
              fontSize: '0.7rem',
              fontWeight: '800',
              padding: '4px 10px',
              borderRadius: '9999px',
              background: '#eff6ff',
              color: '#2563eb',
              border: '1px solid #bfdbfe'
            }}>
              SERVICE PACKAGE MANAGER
            </span>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: '6px 0 0 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a' }}>
              <Layers size={20} color="#10b981" /> Packages for: {service.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: '1px solid #e2e8f0',
              borderRadius: '50%',
              color: '#64748b',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, background: '#ffffff' }}>
          
          {/* Top Bar Actions & Status Notice */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a' }}>
                Configured Packages ({packages.length})
              </div>
              <div style={{ fontSize: '0.82rem', color: '#475569', fontWeight: '500', marginTop: '2px' }}>
                Customer app displays active packages. Single active package auto-selects during checkout.
              </div>
            </div>

            {!isFormOpen && (
              <button
                type="button"
                onClick={handleOpenCreateForm}
                className="btn btn-primary btn-sm"
                style={{ fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={16} /> Create New Package
              </button>
            )}
          </div>

          {/* Warning Banner if 0 active packages */}
          {packages.filter((p) => p.status === 'active').length === 0 && !isFormOpen && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: '#fef2f2',
              border: '1px solid #fca5a5',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '20px',
              color: '#991b1b',
              fontSize: '0.82rem',
              fontWeight: '700'
            }}>
              <ShieldAlert size={18} color="#dc2626" />
              ⚠ Warning: No active packages configured for this service! Customers will not be able to book this service until at least 1 package is created and activated.
            </div>
          )}

          {/* CREATE / EDIT FORM CONTAINER */}
          {isFormOpen && (
            <form
              onSubmit={handleSubmitPackageForm}
              style={{
                background: '#f8fafc',
                border: '2px solid #bfdbfe',
                borderRadius: 'var(--radius-lg)',
                padding: '20px',
                marginBottom: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: '800', margin: 0, color: '#1e40af' }}>
                  {editingPackageId ? '✏️ Edit Service Package' : '✨ Create New Package'}
                </h4>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem' }}
                >
                  Cancel
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: '800' }}>Package Name / Title *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Basic / Standard / Premium"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: '800' }}>Duration *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 45 mins / 2 hrs"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: '800' }}>Description</label>
                <textarea
                  className="form-input"
                  rows={2}
                  placeholder="Short description of what this package covers..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Pricing & Discount Calculation Grid */}
              <div style={{
                background: '#ffffff',
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #cbd5e1',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '12px',
                alignItems: 'center'
              }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: '800' }}>Base Price (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    className="form-input"
                    placeholder="1499"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: '800' }}>Discount Type</label>
                  <select
                    className="form-input"
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                  >
                    <option value="none">No Discount</option>
                    <option value="fixed">Fixed Discount (₹)</option>
                    <option value="percentage">Percentage (%)</option>
                  </select>
                </div>

                {discountType !== 'none' && (
                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: '800' }}>
                      {discountType === 'percentage' ? 'Discount Percentage (%)' : 'Discount Value (₹)'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="form-input"
                      placeholder={discountType === 'percentage' ? '15' : '200'}
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                    />
                  </div>
                )}

                <div style={{ padding: '8px 12px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #93c5fd' }}>
                  <div style={{ fontSize: '0.68rem', color: '#1e40af', fontWeight: '800', textTransform: 'uppercase' }}>Live Calculated Final Price</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#2563eb' }}>
                    ₹{calculateFinalPricePreview()}
                  </div>
                </div>
              </div>

              {/* Dynamic Feature List Input */}
              <div>
                <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: '800' }}>Package Included Features Checklist</label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. High-pressure foam jet wash"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddFeature();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '8px 14px', fontWeight: '800', flexShrink: 0 }}
                  >
                    <Plus size={14} /> Add Feature
                  </button>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {features.map((feat, idx) => (
                    <span
                      key={idx}
                      className="badge badge-purple"
                      style={{ fontSize: '0.75rem', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      ✓ {feat}
                      <X
                        size={12}
                        color="#ef4444"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleRemoveFeature(idx)}
                      />
                    </span>
                  ))}
                </div>
              </div>

              {/* Checkbox Toggles & Sort Order */}
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap', paddingTop: '6px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={isPopular}
                    onChange={(e) => setIsPopular(e.target.checked)}
                  />
                  🔥 Mark as Popular
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={isRecommended}
                    onChange={(e) => setIsRecommended(e.target.checked)}
                  />
                  ⭐ Mark as Recommended
                </label>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: '700' }}>Sort Order:</span>
                  <input
                    type="number"
                    className="form-input"
                    style={{ width: '80px', padding: '4px 8px', fontSize: '0.8rem' }}
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  style={{ fontWeight: '800', padding: '8px 20px' }}
                >
                  {editingPackageId ? 'Save Changes' : 'Create Package'}
                </button>
              </div>
            </form>
          )}

          {/* PACKAGE LISTING CARDS */}
          {packages.length === 0 ? (
            <div style={{ padding: '36px', textAlign: 'center', color: '#64748b', fontWeight: '600' }}>
              No packages configured yet. Click "+ Create New Package" above to add the first package.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
              {packages.map((pkg) => {
                const isActive = pkg.status === 'active';
                return (
                  <div
                    key={pkg._id}
                    style={{
                      padding: '20px',
                      borderRadius: '16px',
                      border: isActive ? '1px solid #e2e8f0' : '1px solid #fca5a5',
                      background: isActive ? '#ffffff' : '#fef2f2',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      opacity: isActive ? 1 : 0.85
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', gap: '8px' }}>
                        <div>
                          <div style={{ fontWeight: '800', fontSize: '1.1rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            {pkg.title}
                            {pkg.isPopular && (
                              <span style={{ fontSize: '0.68rem', fontWeight: '800', padding: '3px 8px', borderRadius: '6px', background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' }}>
                                🔥 POPULAR
                              </span>
                            )}
                            {pkg.isRecommended && (
                              <span style={{ fontSize: '0.68rem', fontWeight: '800', padding: '3px 8px', borderRadius: '6px', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}>
                                ⭐ RECOMMENDED
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600', marginTop: '4px' }}>
                            ⏱️ Duration: {pkg.duration || '45 mins'} • Sort Order: {pkg.sortOrder || 0}
                          </div>
                        </div>

                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: '800',
                          padding: '4px 10px',
                          borderRadius: '9999px',
                          background: isActive ? '#ecfdf5' : '#fef2f2',
                          color: isActive ? '#047857' : '#dc2626',
                          border: isActive ? '1px solid #a7f3d0' : '1px solid #fecaca',
                          whiteSpace: 'nowrap'
                        }}>
                          {pkg.status.toUpperCase()}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '12px 0 10px 0' }}>
                        <span style={{ fontSize: '1.4rem', fontWeight: '800', color: '#059669' }}>
                          ₹{pkg.finalPrice}
                        </span>
                        {pkg.price > pkg.finalPrice && (
                          <span style={{ fontSize: '0.88rem', color: '#94a3b8', textDecoration: 'line-through', fontWeight: '600' }}>
                            ₹{pkg.price}
                          </span>
                        )}
                        {pkg.discountValue > 0 && (
                          <span style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: '800' }}>
                            ({pkg.discountType === 'percentage' ? `${pkg.discountValue}% OFF` : `Save ₹${pkg.discountValue}`})
                          </span>
                        )}
                      </div>

                      {pkg.description && (
                        <p style={{ fontSize: '0.85rem', color: '#475569', margin: '0 0 10px 0', lineHeight: 1.4, fontWeight: '500' }}>
                          {pkg.description}
                        </p>
                      )}

                      {/* Included Features Tags */}
                      {Array.isArray(pkg.features) && pkg.features.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '14px' }}>
                          {pkg.features.map((feat, idx) => (
                            <div key={idx} style={{ fontSize: '0.8rem', color: '#334155', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <CheckCircle2 size={14} color="#10b981" /> {feat}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Card Actions */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px dashed #e2e8f0', gap: '8px', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => handleTogglePopular(pkg)}
                          style={{
                            padding: '5px 10px',
                            fontSize: '0.74rem',
                            fontWeight: '700',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            background: pkg.isPopular ? '#fef3c7' : '#f8fafc',
                            color: pkg.isPopular ? '#b45309' : '#64748b',
                            border: pkg.isPopular ? '1px solid #fde68a' : '1px solid #e2e8f0'
                          }}
                          title="Toggle Popular Flag"
                        >
                          <Flame size={12} style={{ display: 'inline', marginRight: '3px' }} /> {pkg.isPopular ? 'Popular' : '+ Popular'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleRecommended(pkg)}
                          style={{
                            padding: '5px 10px',
                            fontSize: '0.74rem',
                            fontWeight: '700',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            background: pkg.isRecommended ? '#ecfdf5' : '#f8fafc',
                            color: pkg.isRecommended ? '#047857' : '#64748b',
                            border: pkg.isRecommended ? '1px solid #a7f3d0' : '1px solid #e2e8f0'
                          }}
                          title="Toggle Recommended Flag"
                        >
                          <Star size={12} style={{ display: 'inline', marginRight: '3px' }} /> {pkg.isRecommended ? 'Recommended' : '+ Recommended'}
                        </button>
                      </div>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(pkg)}
                          style={{
                            padding: '5px 10px',
                            fontSize: '0.74rem',
                            fontWeight: '700',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            background: isActive ? '#fffbeb' : '#f0fdf4',
                            color: isActive ? '#b45309' : '#15803d',
                            border: isActive ? '1px solid #fde68a' : '1px solid #bbf7d0'
                          }}
                        >
                          {isActive ? 'Deactivate' : 'Activate'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEditForm(pkg)}
                          style={{
                            padding: '5px 10px',
                            fontSize: '0.74rem',
                            fontWeight: '700',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            background: '#eff6ff',
                            color: '#2563eb',
                            border: '1px solid #bfdbfe'
                          }}
                        >
                          <Edit2 size={12} style={{ display: 'inline', marginRight: '3px' }} /> Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeletePackage(pkg._id, pkg.title)}
                          style={{
                            padding: '5px 8px',
                            fontSize: '0.74rem',
                            fontWeight: '700',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            background: '#fef2f2',
                            color: '#dc2626',
                            border: '1px solid #fecaca'
                          }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #e2e8f0',
          background: '#ffffff',
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 22px',
              borderRadius: '10px',
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              color: '#334155',
              fontWeight: '700',
              fontSize: '0.88rem',
              cursor: 'pointer'
            }}
          >
            Close Manager
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPackageManagementModal;
