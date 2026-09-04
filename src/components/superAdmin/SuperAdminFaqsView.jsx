import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Users,
  Briefcase,
  Layers,
  Filter,
  Loader2,
  X,
  Sparkles,
  ArrowUpDown
} from 'lucide-react';
import { superAdminService } from '../../services/superAdmin.service.js';
import { toast } from '../../utils/toast.js';

const SuperAdminFaqsView = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [audienceFilter, setAudienceFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    targetAudience: 'both',
    category: 'General',
    displayOrder: 0,
    isActive: true,
  });

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const res = await superAdminService.getFaqs({
        targetAudience: audienceFilter !== 'all' ? audienceFilter : undefined,
        search: searchQuery.trim() || undefined,
      });
      const data = res.data?.data || res.data || [];
      setFaqs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching FAQs:', err);
      toast.error('Failed to load FAQs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, [audienceFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchFaqs();
  };

  const handleOpenCreateModal = () => {
    setEditingFaq(null);
    setFormData({
      question: '',
      answer: '',
      targetAudience: 'both',
      category: 'General',
      displayOrder: faqs.length + 1,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (faq) => {
    setEditingFaq(faq);
    setFormData({
      question: faq.question || '',
      answer: faq.answer || '',
      targetAudience: faq.targetAudience || 'both',
      category: faq.category || 'General',
      displayOrder: faq.displayOrder || 0,
      isActive: faq.isActive !== undefined ? faq.isActive : true,
    });
    setIsModalOpen(true);
  };

  const handleSaveFaq = async (e) => {
    e.preventDefault();
    if (!formData.question.trim() || !formData.answer.trim()) {
      toast.error('Please fill in both Question and Answer.');
      return;
    }

    try {
      setSubmitting(true);
      if (editingFaq) {
        await superAdminService.updateFaq(editingFaq._id, formData);
        toast.success('FAQ updated successfully!');
      } else {
        await superAdminService.createFaq(formData);
        toast.success('New FAQ created successfully!');
      }
      setIsModalOpen(false);
      fetchFaqs();
    } catch (err) {
      console.error('Error saving FAQ:', err);
      toast.error(err.response?.data?.message || 'Failed to save FAQ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteFaq = async (id, question) => {
    if (!window.confirm(`Are you sure you want to delete this FAQ?\n"${question.slice(0, 50)}..."`)) return;

    try {
      await superAdminService.deleteFaq(id);
      toast.success('FAQ deleted successfully');
      fetchFaqs();
    } catch (err) {
      console.error('Error deleting FAQ:', err);
      toast.error('Failed to delete FAQ');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await superAdminService.toggleFaqStatus(id);
      toast.success('FAQ status updated');
      fetchFaqs();
    } catch (err) {
      console.error('Error toggling status:', err);
      toast.error('Failed to update FAQ status');
    }
  };

  // Metrics
  const totalFaqsCount = faqs.length;
  const customerFaqsCount = faqs.filter((f) => f.targetAudience === 'customer' || f.targetAudience === 'both').length;
  const partnerFaqsCount = faqs.filter((f) => f.targetAudience === 'partner' || f.targetAudience === 'both').length;
  const activeFaqsCount = faqs.filter((f) => f.isActive).length;

  return (
    <div style={{ padding: '24px', background: '#f8fafc', minHeight: '100vh' }}>
      
      {/* 1. Header Title & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
            <HelpCircle size={28} color="#2563eb" /> FAQ Management Center
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px', margin: 0 }}>
            Create and manage Frequently Asked Questions for Customer App and Partner App.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          style={{
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            color: '#ffffff',
            padding: '12px 22px',
            borderRadius: '12px',
            fontWeight: '800',
            fontSize: '0.9rem',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)'
          }}
        >
          <Plus size={18} /> Add New FAQ
        </button>
      </div>

      {/* 2. Top Stats Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '6px' }}>Total FAQs</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#0f172a' }}>{totalFaqsCount}</div>
        </div>

        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ color: '#16a34a', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Users size={14} /> Customer FAQs
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#16a34a' }}>{customerFaqsCount}</div>
        </div>

        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ color: '#2563eb', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Briefcase size={14} /> Partner FAQs
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#2563eb' }}>{partnerFaqsCount}</div>
        </div>

        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ color: '#9333ea', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '6px' }}>Active Live</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#9333ea' }}>{activeFaqsCount}</div>
        </div>
      </div>

      {/* 3. Search & Target Audience Filter Bar */}
      <div style={{ background: '#ffffff', borderRadius: '16px', padding: '16px 20px', border: '1px solid #e2e8f0', marginBottom: '20px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
        
        {/* Audience Filter Tabs */}
        <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '12px', gap: '4px' }}>
          {[
            { id: 'all', label: 'All FAQs' },
            { id: 'customer', label: '🟢 Customer App' },
            { id: 'partner', label: '🔵 Partner App' },
            { id: 'both', label: '🟣 Both Apps' },
          ].map((tab) => {
            const active = audienceFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setAudienceFilter(tab.id)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: '800',
                  border: 'none',
                  cursor: 'pointer',
                  background: active ? '#ffffff' : 'transparent',
                  color: active ? '#2563eb' : '#64748b',
                  boxShadow: active ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, maxWidth: '360px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search question, answer, category..."
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '0.86rem',
                outline: 'none'
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              padding: '9px 16px',
              borderRadius: '10px',
              background: '#0f172a',
              color: '#ffffff',
              border: 'none',
              fontWeight: '700',
              fontSize: '0.84rem',
              cursor: 'pointer'
            }}
          >
            Search
          </button>
        </form>

      </div>

      {/* 4. FAQs Cards List */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
          <Loader2 size={32} className="spin" style={{ margin: '0 auto 12px' }} />
          <div>Loading FAQs...</div>
        </div>
      ) : faqs.length === 0 ? (
        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '48px 24px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
          <HelpCircle size={48} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>No FAQs Found</h3>
          <p style={{ color: '#64748b', fontSize: '0.86rem', marginBottom: '16px' }}>
            No FAQs match your search criteria. Create your first FAQ for Customer or Partner App!
          </p>
          <button
            type="button"
            onClick={handleOpenCreateModal}
            style={{
              background: '#2563eb',
              color: '#ffffff',
              padding: '10px 20px',
              borderRadius: '10px',
              fontWeight: '800',
              fontSize: '0.84rem',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            + Create FAQ Now
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {faqs.map((faq) => {
            const isCustomer = faq.targetAudience === 'customer';
            const isPartner = faq.targetAudience === 'partner';
            const isBoth = faq.targetAudience === 'both';

            return (
              <div
                key={faq._id}
                style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  padding: '20px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '20px',
                  alignItems: 'flex-start'
                }}
              >
                <div style={{ flex: 1 }}>
                  
                  {/* Badges Bar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '0.72rem',
                      fontWeight: '800',
                      background: isCustomer ? '#f0fdf4' : isPartner ? '#eff6ff' : '#faf5ff',
                      color: isCustomer ? '#15803d' : isPartner ? '#1d4ed8' : '#7e22ce',
                      border: `1px solid ${isCustomer ? '#bbf7d0' : isPartner ? '#bfdbfe' : '#e9d5ff'}`
                    }}>
                      {isCustomer && '🟢 Customer App Only'}
                      {isPartner && '🔵 Partner App Only'}
                      {isBoth && '🟣 Both Customer & Partner'}
                    </span>

                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '0.72rem',
                      fontWeight: '700',
                      background: '#f1f5f9',
                      color: '#475569'
                    }}>
                      📁 {faq.category || 'General'}
                    </span>

                    <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: '600' }}>
                      Order: #{faq.displayOrder || 0}
                    </span>
                  </div>

                  {/* Question & Answer */}
                  <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', marginBottom: '6px', lineHeight: 1.4 }}>
                    {faq.question}
                  </h4>
                  <p style={{ fontSize: '0.88rem', color: '#475569', margin: 0, lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                    {faq.answer}
                  </p>

                </div>

                {/* Right Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(faq._id)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '0.74rem',
                      fontWeight: '800',
                      border: 'none',
                      cursor: 'pointer',
                      background: faq.isActive ? '#f0fdf4' : '#fef2f2',
                      color: faq.isActive ? '#16a34a' : '#dc2626'
                    }}
                  >
                    {faq.isActive ? '✓ Active' : '✕ Inactive'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(faq)}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      color: '#334155',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <Edit2 size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteFaq(faq._id, faq.question)}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      color: '#dc2626',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* 5. Create / Edit FAQ Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '620px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden',
            animation: 'fadeIn 0.2s ease'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px',
              background: '#0f172a',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '900', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HelpCircle size={20} color="#38bdf8" /> {editingFaq ? 'Edit FAQ Item' : 'Create New FAQ Item'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveFaq} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              
              {/* Question */}
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '800', color: '#334155', marginBottom: '6px' }}>
                  FAQ Question *
                </label>
                <input
                  type="text"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="e.g. How do I track my assigned service partner?"
                  required
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Answer */}
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '800', color: '#334155', marginBottom: '6px' }}>
                  Detailed Answer *
                </label>
                <textarea
                  rows={4}
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  placeholder="e.g. Once your booking is confirmed, go to My Bookings tab..."
                  required
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Target Audience & Category Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '800', color: '#334155', marginBottom: '6px' }}>
                    Target Audience *
                  </label>
                  <select
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.88rem',
                      outline: 'none',
                      background: '#ffffff'
                    }}
                  >
                    <option value="both">🟣 Both Customer & Partner Apps</option>
                    <option value="customer">🟢 Customer App Only</option>
                    <option value="partner">🔵 Partner App Only</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '800', color: '#334155', marginBottom: '6px' }}>
                    Category Tag
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g. Bookings, Payments, Safety"
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.88rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Display Order & Active Checkbox Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'center' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '800', color: '#334155', marginBottom: '6px' }}>
                    Display Sorting Order
                  </label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.88rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ paddingTop: '20px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '800', color: '#0f172a' }}>
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      style={{ width: '18px', height: '18px', accentColor: '#2563eb', cursor: 'pointer' }}
                    />
                    Publish FAQ Immediately
                  </label>
                </div>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '11px 20px',
                    borderRadius: '10px',
                    background: '#f1f5f9',
                    color: '#475569',
                    border: '1px solid #cbd5e1',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '11px 24px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: '800',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {submitting ? <Loader2 size={16} className="spin" /> : editingFaq ? 'Update FAQ' : 'Create FAQ'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default SuperAdminFaqsView;
