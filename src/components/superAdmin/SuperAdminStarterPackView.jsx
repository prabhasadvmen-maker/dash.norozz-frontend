import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Save,
  Loader2,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Tag,
  Eye,
  Settings,
  Zap,
  Users,
  ShieldCheck
} from 'lucide-react';
import { superAdminService } from '../../services/superAdmin.service.js';
import { catalogService } from '../../services/catalog.service.js';
import { toast } from '../../utils/toast.js';

const SuperAdminStarterPackView = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [categoriesList, setCategoriesList] = useState([]);
  const [servicesList, setServicesList] = useState([]);

  const [formData, setFormData] = useState({
    badge: 'STARTER PACK',
    subBadge: '✦ ONE TIME OFFER ✦',
    title: '2 VISITS FOR ₹398 ₹139',
    originalPrice: 398,
    offerPrice: 139,
    ticketOriginalPrice: 199,
    ticketOfferPrice: 70,
    perVisitPriceText: 'Only ₹70 per visit',
    visitCount: 2,
    visitDurationMinutes: 60,
    validityDays: 15,
    bannerColor: '#ec4899',
    isActive: true,
    targetAudience: 'NEW_USERS_ONLY',
    applicableCategory: '',
    applicableService: '',
  });

  const fetchStarterPack = async () => {
    setLoading(true);
    try {
      // Fetch Categories & Services in parallel
      const [resPack, resCats, resSrvs] = await Promise.all([
        superAdminService.getStarterPack(),
        catalogService.getCategories().catch(() => ({ data: [] })),
        catalogService.getServices().catch(() => ({ data: [] })),
      ]);

      const catsData = resCats.data?.data || resCats.data || [];
      const srvsData = resSrvs.data?.data || resSrvs.data || [];
      setCategoriesList(Array.isArray(catsData) ? catsData : []);
      setServicesList(Array.isArray(srvsData) ? srvsData : []);

      const data = resPack.data?.data || resPack.data;
      if (data) {
        setFormData({
          badge: data.badge || 'STARTER PACK',
          subBadge: data.subBadge || '✦ ONE TIME OFFER ✦',
          title: data.title || '2 VISITS FOR ₹398 ₹139',
          originalPrice: data.originalPrice !== undefined ? data.originalPrice : 398,
          offerPrice: data.offerPrice !== undefined ? data.offerPrice : 139,
          ticketOriginalPrice: data.ticketOriginalPrice !== undefined ? data.ticketOriginalPrice : 199,
          ticketOfferPrice: data.ticketOfferPrice !== undefined ? data.ticketOfferPrice : 70,
          perVisitPriceText: data.perVisitPriceText || 'Only ₹70 per visit',
          visitCount: data.visitCount !== undefined ? data.visitCount : 2,
          visitDurationMinutes: data.visitDurationMinutes !== undefined ? data.visitDurationMinutes : 60,
          validityDays: data.validityDays !== undefined ? data.validityDays : 15,
          bannerColor: data.bannerColor || '#ec4899',
          isActive: data.isActive !== undefined ? data.isActive : true,
          targetAudience: data.targetAudience || 'NEW_USERS_ONLY',
          applicableCategory: data.applicableCategory?._id || data.applicableCategory || '',
          applicableService: data.applicableService?._id || data.applicableService || '',
        });
      }
    } catch (err) {
      console.error('Error fetching starter pack:', err);
      toast.error('Failed to load Starter Pack configuration');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStarterPack();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await superAdminService.updateStarterPack(formData);
      toast.success('🎉 Starter Pack Offer configuration updated & published successfully!');
    } catch (err) {
      console.error('Error updating starter pack:', err);
      toast.error(err.response?.data?.message || 'Failed to save Starter Pack configuration');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1200px' }}>
      
      {/* 1. Header Banner */}
      <div style={{
        background: '#ffffff',
        borderRadius: '24px',
        padding: '24px 30px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.02)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 16px rgba(236, 72, 153, 0.35)'
          }}>
            <Sparkles size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: '900', margin: 0, color: '#0f172a' }}>
              Starter Pack Offer Management
            </h2>
            <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '2px 0 0 0' }}>
              Configure new user welcome offers, discount voucher tickets, and visit duration passes.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving || loading}
          style={{
            padding: '11px 24px',
            borderRadius: '14px',
            fontWeight: '800',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
            boxShadow: '0 4px 14px rgba(236, 72, 153, 0.35)',
            color: '#ffffff',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          {saving ? <Loader2 size={18} className="spin" /> : <Save size={18} />}
          <span>Save & Publish Offer</span>
        </button>
      </div>

      {/* 2. Main Grid: Form Controls (Left) vs Live UI Preview (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px', alignItems: 'flex-start' }}>
        
        {/* Left Column: Form Controls */}
        <div style={{ background: '#ffffff', borderRadius: '24px', border: '1px solid #e2e8f0', padding: '28px', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.02)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '20px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Settings size={20} color="#ec4899" /> Offer Details & Pricing Parameters
          </h3>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Offer Badge & Sub-Badge */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#334155', display: 'block', marginBottom: '6px' }}>
                  BADGE TEXT
                </label>
                <input
                  type="text"
                  value={formData.badge}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  placeholder="e.g. STARTER PACK"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    fontWeight: '700',
                    outline: 'none',
                    color: '#0f172a',
                    background: '#f8fafc'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#334155', display: 'block', marginBottom: '6px' }}>
                  SUB-HEADER TAG
                </label>
                <input
                  type="text"
                  value={formData.subBadge}
                  onChange={(e) => setFormData({ ...formData, subBadge: e.target.value })}
                  placeholder="e.g. ✦ ONE TIME OFFER ✦"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    fontWeight: '700',
                    outline: 'none',
                    color: '#0f172a',
                    background: '#f8fafc'
                  }}
                />
              </div>
            </div>

            {/* Ticket Strikethrough & Offer Price */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#334155', display: 'block', marginBottom: '6px' }}>
                  TICKET ORIGINAL PRICE (₹)
                </label>
                <input
                  type="number"
                  value={formData.ticketOriginalPrice}
                  onChange={(e) => setFormData({ ...formData, ticketOriginalPrice: Number(e.target.value) })}
                  placeholder="199"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    fontWeight: '800',
                    outline: 'none',
                    color: '#dc2626',
                    background: '#f8fafc'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#334155', display: 'block', marginBottom: '6px' }}>
                  TICKET OFFER PRICE (₹)
                </label>
                <input
                  type="number"
                  value={formData.ticketOfferPrice}
                  onChange={(e) => setFormData({ ...formData, ticketOfferPrice: Number(e.target.value) })}
                  placeholder="70"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    fontWeight: '800',
                    outline: 'none',
                    color: '#059669',
                    background: '#f8fafc'
                  }}
                />
              </div>
            </div>

            {/* Total Original Price & Total Offer Price */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#334155', display: 'block', marginBottom: '6px' }}>
                  TOTAL ORIGINAL PRICE (₹)
                </label>
                <input
                  type="number"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({ ...formData, originalPrice: Number(e.target.value) })}
                  placeholder="398"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    fontWeight: '800',
                    outline: 'none',
                    color: '#64748b',
                    background: '#f8fafc'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#334155', display: 'block', marginBottom: '6px' }}>
                  TOTAL OFFER PRICE (₹)
                </label>
                <input
                  type="number"
                  value={formData.offerPrice}
                  onChange={(e) => setFormData({ ...formData, offerPrice: Number(e.target.value) })}
                  placeholder="139"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    fontWeight: '800',
                    outline: 'none',
                    color: '#ec4899',
                    background: '#f8fafc'
                  }}
                />
              </div>
            </div>

            {/* Per Visit Text */}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#334155', display: 'block', marginBottom: '6px' }}>
                PER VISIT SUBTITLE TEXT
              </label>
              <input
                type="text"
                value={formData.perVisitPriceText}
                onChange={(e) => setFormData({ ...formData, perVisitPriceText: e.target.value })}
                placeholder="Only ₹70 per visit"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  fontWeight: '700',
                  outline: 'none',
                  color: '#0f172a',
                  background: '#f8fafc'
                }}
              />
            </div>

            {/* Visit Count, Duration & Validity Days */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#334155', display: 'block', marginBottom: '6px' }}>
                  NUMBER OF VISITS
                </label>
                <input
                  type="number"
                  value={formData.visitCount}
                  onChange={(e) => setFormData({ ...formData, visitCount: Number(e.target.value) })}
                  placeholder="2"
                  min="1"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    fontWeight: '800',
                    outline: 'none',
                    color: '#0f172a',
                    background: '#f8fafc'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#334155', display: 'block', marginBottom: '6px' }}>
                  DURATION (MINS)
                </label>
                <input
                  type="number"
                  value={formData.visitDurationMinutes}
                  onChange={(e) => setFormData({ ...formData, visitDurationMinutes: Number(e.target.value) })}
                  placeholder="60"
                  min="15"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    fontWeight: '800',
                    outline: 'none',
                    color: '#0f172a',
                    background: '#f8fafc'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#334155', display: 'block', marginBottom: '6px' }}>
                  VALIDITY (DAYS)
                </label>
                <input
                  type="number"
                  value={formData.validityDays}
                  onChange={(e) => setFormData({ ...formData, validityDays: Number(e.target.value) })}
                  placeholder="15"
                  min="1"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    fontWeight: '800',
                    outline: 'none',
                    color: '#0f172a',
                    background: '#f8fafc'
                  }}
                />
              </div>
            </div>

            {/* Applicable Category & Specific Service */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#334155', display: 'block', marginBottom: '6px' }}>
                  APPLICABLE CATEGORY
                </label>
                <select
                  value={formData.applicableCategory}
                  onChange={(e) => setFormData({ ...formData, applicableCategory: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    fontWeight: '700',
                    outline: 'none',
                    color: '#0f172a',
                    background: '#ffffff'
                  }}
                >
                  <option value="">🌐 All Categories (Global Starter Pack)</option>
                  {categoriesList.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      📁 {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#334155', display: 'block', marginBottom: '6px' }}>
                  APPLICABLE SPECIFIC SERVICE (OPTIONAL)
                </label>
                <select
                  value={formData.applicableService}
                  onChange={(e) => setFormData({ ...formData, applicableService: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    fontWeight: '700',
                    outline: 'none',
                    color: '#0f172a',
                    background: '#ffffff'
                  }}
                >
                  <option value="">🛠️ All Services in Category</option>
                  {servicesList
                    .filter((srv) => !formData.applicableCategory || String(srv.category?._id || srv.category) === String(formData.applicableCategory))
                    .map((srv) => (
                      <option key={srv._id} value={srv._id}>
                        ⚡ {srv.name || srv.title}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Target Audience & Status Switch */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', alignItems: 'center' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#334155', display: 'block', marginBottom: '6px' }}>
                  TARGET AUDIENCE
                </label>
                <select
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    fontWeight: '700',
                    outline: 'none',
                    color: '#0f172a',
                    background: '#ffffff'
                  }}
                >
                  <option value="NEW_USERS_ONLY">🆕 New Customers Only (1st Booking)</option>
                  <option value="ALL_USERS">🌐 All Customers (Global Offer)</option>
                </select>
              </div>

              <div style={{ paddingTop: '18px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: '800', fontSize: '0.88rem', color: '#0f172a' }}>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    style={{ width: '20px', height: '20px', accentColor: '#ec4899' }}
                  />
                  Enable Offer on Customer App
                </label>
              </div>
            </div>

          </form>
        </div>

        {/* Right Column: Live Mobile UI Preview */}
        <div style={{ background: '#ffffff', borderRadius: '24px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#0f172a', fontWeight: '800', fontSize: '0.95rem' }}>
            <Eye size={18} color="#ec4899" /> LIVE CUSTOMER APP PREVIEW
          </div>

          {/* Screenshot-Identical Dark Card Preview */}
          <div style={{
            background: '#090d16',
            borderRadius: '24px',
            padding: '20px',
            color: '#ffffff',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Top Ticket Graphic Banner Box */}
            <div style={{
              background: 'linear-gradient(135deg, #111827 0%, #1f293d 100%)',
              borderRadius: '20px',
              padding: '24px 20px',
              position: 'relative',
              marginBottom: '16px',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              overflow: 'hidden'
            }}>
              {/* STARTER PACK BADGE */}
              <div style={{
                position: 'absolute',
                top: '14px',
                left: '14px',
                background: '#000000',
                color: '#ffffff',
                fontSize: '0.72rem',
                fontWeight: '900',
                letterSpacing: '1px',
                padding: '4px 12px',
                borderRadius: '9999px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 4px 10px rgba(0,0,0,0.5)'
              }}>
                {formData.badge}
              </div>

              {/* Pink Tickets Graphic Representation */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: '16px',
                position: 'relative',
                height: '80px'
              }}>
                {/* Background Rotated Tickets */}
                <div style={{
                  position: 'absolute',
                  width: '90px',
                  height: '50px',
                  background: '#be185d',
                  borderRadius: '8px',
                  transform: 'rotate(-15deg)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  opacity: 0.8
                }} />
                <div style={{
                  position: 'absolute',
                  width: '90px',
                  height: '50px',
                  background: '#9d174d',
                  borderRadius: '8px',
                  transform: 'rotate(15deg)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  opacity: 0.8
                }} />

                {/* Main Front Pink Ticket */}
                <div style={{
                  position: 'relative',
                  zIndex: 5,
                  background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                  borderRadius: '12px',
                  padding: '8px 18px',
                  boxShadow: '0 8px 24px rgba(236, 72, 153, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  border: '1.5px dashed rgba(255, 255, 255, 0.4)'
                }}>
                  <span style={{ fontSize: '1.1rem', textDecoration: 'line-through', opacity: 0.75, fontWeight: '700' }}>
                    ₹{formData.ticketOriginalPrice}
                  </span>
                  <span style={{ fontSize: '1.5rem', fontWeight: '900', color: '#ffffff' }}>
                    ₹{formData.ticketOfferPrice}
                  </span>
                </div>
              </div>
            </div>

            {/* Sub-Header Sparkle Tag */}
            <div style={{
              textAlign: 'center',
              fontSize: '0.74rem',
              fontWeight: '900',
              letterSpacing: '1px',
              color: '#ec4899',
              marginBottom: '8px'
            }}>
              {formData.subBadge}
            </div>

            {/* Main Title & Strikethrough Pricing */}
            <div style={{ textAlign: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '1.35rem', fontWeight: '900', letterSpacing: '-0.3px', marginRight: '8px' }}>
                {formData.visitCount} VISITS FOR
              </span>
              <span style={{ fontSize: '1.2rem', textDecoration: 'line-through', opacity: 0.5, fontWeight: '800', marginRight: '6px' }}>
                ₹{formData.originalPrice}
              </span>
              <span style={{ fontSize: '1.45rem', fontWeight: '900', color: '#ffffff' }}>
                ₹{formData.offerPrice}
              </span>
            </div>

            {/* Per Visit Rate Text */}
            <div style={{ textAlign: 'center', fontSize: '0.84rem', color: '#94a3b8', fontWeight: '600', marginBottom: '16px' }}>
              {formData.perVisitPriceText}
            </div>

            {/* Two Info Chips (Visits & Validity) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '14px',
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                fontSize: '0.8rem',
                fontWeight: '700',
                color: '#ffffff'
              }}>
                <Clock size={15} color="#ec4899" />
                <span>{formData.visitCount} × {formData.visitDurationMinutes} min visits</span>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '14px',
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                fontSize: '0.8rem',
                fontWeight: '700',
                color: '#ffffff'
              }}>
                <Calendar size={15} color="#ec4899" />
                <span>Valid for {formData.validityDays} days</span>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};

export default SuperAdminStarterPackView;
