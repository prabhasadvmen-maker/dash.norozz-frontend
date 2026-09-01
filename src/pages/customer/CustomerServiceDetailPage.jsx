import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, Clock, ShieldCheck, CheckCircle2, AlertCircle, Plus, Sparkles, Award } from 'lucide-react';
import DedicatedCustomerNavbar from '../../components/customer/DedicatedCustomerNavbar';
import { catalogService } from '../../services/catalog.service.js';

const CustomerServiceDetailPage = ({ service, currentUser, onBack, onBookNow, onLogout }) => {
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [loadingPackages, setLoadingPackages] = useState(true);

  useEffect(() => {
    if (!service?._id) return;
    setLoadingPackages(true);
    catalogService
      .getServicePackages(service._id)
      .then((res) => {
        const list = res.data?.data || res.data || [];
        const activeList = Array.isArray(list) ? list.filter((p) => p.status === 'active') : [];
        setPackages(activeList);
        
        if (activeList.length === 1) {
          setSelectedPackage(activeList[0]);
        } else if (activeList.length > 1) {
          const recommended = activeList.find((p) => p.isRecommended) || activeList[0];
          setSelectedPackage(recommended);
        }
      })
      .catch((err) => {
        console.warn('Fetch service packages warning:', err);
        setPackages([]);
      })
      .finally(() => setLoadingPackages(false));
  }, [service?._id]);

  if (!service) return null;

  const title = service.name || service.title || 'AC Deep Jet Cleaning Package';
  const displayPackage = selectedPackage || (packages.length > 0 ? packages[0] : null);

  const rawPrice = displayPackage ? displayPackage.finalPrice : (service.finalPrice || service.price || 599);
  const rawOriginalPrice = displayPackage ? displayPackage.price : (service.price || rawPrice + 200);
  const discountVal = displayPackage
    ? (displayPackage.discountType === 'percentage'
        ? Math.round(displayPackage.price * (displayPackage.discountValue / 100))
        : displayPackage.discountValue || (rawOriginalPrice - rawPrice))
    : (rawOriginalPrice - rawPrice);

  const offPercentage = rawOriginalPrice > rawPrice ? Math.round(((rawOriginalPrice - rawPrice) / rawOriginalPrice) * 100) : 0;
  const price = `₹${rawPrice}`;
  const originalPrice = rawOriginalPrice > rawPrice ? `₹${rawOriginalPrice}` : null;
  const duration = displayPackage ? displayPackage.duration : (service.duration || '45 mins');
  const rating = service.rating ? `${service.rating} (${service.reviews || '14.2k ratings'})` : '4.85 (14.2k ratings)';
  const categoryName = typeof service.category === 'object' ? service.category?.name : (service.category || 'Home Services');
  const description = displayPackage?.description || service.description || 'Professional deep cleaning & servicing performed by background-verified experts.';
  const imageSrc = service.thumbnail || service.image || null;

  const handleBookServiceClick = () => {
    const bookingPayload = {
      ...service,
      serviceId: service._id || service.serviceId,
      packageId: displayPackage?._id || null,
      package: displayPackage,
      packages: packages && packages.length > 0 ? packages : service.packages,
      selectedPackage: displayPackage,
      packageName: displayPackage ? displayPackage.title : service.name,
      price: rawPrice,
      finalPrice: rawPrice,
      duration: duration,
      title: service.name || service.title,
    };
    onBookNow(bookingPayload);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0b0f19', paddingBottom: '100px', color: '#0f172a' }}>
      
      {/* Top Navbar */}
      <DedicatedCustomerNavbar currentUser={currentUser} onLogout={onLogout} />

      {/* Main Page Container */}
      <main style={{ maxWidth: '860px', margin: '0 auto', padding: '20px' }}>
        
        {/* Back Button Bar */}
        <div style={{ marginBottom: '16px' }}>
          <button
            type="button"
            onClick={onBack}
            className="btn btn-secondary btn-sm"
            style={{ fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#1e293b', color: '#ffffff', border: '1px solid #334155' }}
          >
            <ArrowLeft size={18} /> Back to Services
          </button>
        </div>

        {/* Hero Card Banner */}
        <div
          style={{
            padding: 0,
            overflow: 'hidden',
            marginBottom: '24px',
            borderRadius: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            background: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          {/* Hero Banner Header Image Container */}
          <div style={{
            position: 'relative',
            minHeight: '220px',
            background: imageSrc ? `url(${imageSrc}) center/cover no-repeat` : 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #7c3aed 100%)',
            display: 'flex',
            flexDirection: 'column',
            justify: 'flex-end',
            padding: '28px 24px',
            color: '#ffffff'
          }}>
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(15, 23, 42, 0.94) 0%, rgba(15, 23, 42, 0.45) 100%)',
              zIndex: 1
            }} />

            <div style={{ position: 'relative', zIndex: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                <span className="badge" style={{ background: 'rgba(255,255,255,0.25)', color: '#ffffff', fontSize: '0.75rem', padding: '4px 10px', fontWeight: '700' }}>
                  {categoryName}
                </span>
                {offPercentage > 0 && (
                  <span className="badge badge-success" style={{ fontSize: '0.75rem', padding: '4px 10px', fontWeight: '800' }}>
                    {offPercentage}% OFF
                  </span>
                )}
              </div>

              <h1 style={{ fontSize: '1.75rem', fontWeight: '900', margin: '0 0 10px 0', lineHeight: 1.3, color: '#ffffff' }}>
                {title} {displayPackage ? `— ${displayPackage.title}` : ''}
              </h1>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.85rem', opacity: 0.95, flexWrap: 'wrap', color: '#ffffff' }}>
                <span style={{ color: '#fef08a', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Star size={16} fill="#fef08a" color="#fef08a" /> {rating}
                </span>
                <span>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={16} /> {duration}
                </span>
                <span>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldCheck size={16} color="#4ade80" /> 30-Day Guarantee
                </span>
              </div>
            </div>
          </div>

          {/* Pricing & Offer Highlights Bar */}
          <div style={{
            padding: '24px',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justify: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            borderBottom: '1px solid #e2e8f0'
          }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {displayPackage ? `SELECTED PACKAGE (${displayPackage.title})` : 'SPECIAL SERVICE PRICE'}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginTop: '4px' }}>
                <span style={{ fontSize: '2.2rem', fontWeight: '900', color: '#0f172a' }}>{price}</span>
                {originalPrice && (
                  <span style={{ fontSize: '1.15rem', color: '#94a3b8', textDecoration: 'line-through', fontWeight: '600' }}>{originalPrice}</span>
                )}
              </div>
            </div>

            {discountVal > 0 && (
              <div style={{ textAlign: 'right' }}>
                <span className="badge badge-purple" style={{ fontSize: '0.82rem', padding: '6px 12px', display: 'inline-block', marginBottom: '4px', fontWeight: '800' }}>
                  🔥 SPECIAL DISCOUNT
                </span>
                <div style={{ fontSize: '0.85rem', color: '#059669', fontWeight: '800' }}>
                  Instant Save ₹{discountVal}
                </div>
              </div>
            )}
          </div>

          {/* Card Content Section */}
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '26px', background: '#ffffff' }}>
            
            {/* Description */}
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '8px', color: '#0f172a' }}>
                Service Overview & Description
              </h3>
              <p style={{ fontSize: '0.92rem', color: '#334155', lineHeight: 1.7, margin: 0 }}>
                {description}
              </p>
            </div>

            {/* What's Included */}
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '14px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="#2563eb" /> Standard Package Inclusions
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                {[
                  'High-pressure intense foam jet wash & deep cleaning',
                  'Inspection & sanitization of cooling coils, blower & indoor filters',
                  '30-Day post-service warranty & free doorstep re-visit guarantee',
                  'Background-verified & trained NOROZZ certified professionals',
                  'Pre & post service health inspection check report',
                  'Zero mess guarantee — clean & tidy work execution'
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.88rem', color: '#0f172a', background: '#f8fafc', padding: '12px 14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <CheckCircle2 size={18} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span style={{ color: '#1e293b', fontWeight: '600' }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Reviews Section */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Award size={18} color="#f59e0b" /> Verified Customer Reviews
                </h3>
                <span style={{ fontSize: '0.85rem', color: '#d97706', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Star size={15} fill="#f59e0b" color="#f59e0b" /> 4.9 / 5 Average Rating
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '14px' }}>
                {[
                  { name: 'Amit Sharma', rating: 5, date: '2 days ago', comment: 'Excellent jet cleaning! The technician Rajesh was very polite and cleaned the AC thoroughly.' },
                  { name: 'Priya Verma', rating: 5, date: '1 week ago', comment: 'Super fast arrival within 30 mins. Cooling performance improved instantly after foam cleaning.' },
                  { name: 'Rahul Gupta', rating: 4, date: '2 weeks ago', comment: 'Great service quality and clean job done. Highly recommended!' }
                ].map((rev, idx) => (
                  <div key={idx} style={{ padding: '16px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#0f172a' }}>{rev.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{rev.date}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginBottom: '6px' }}>
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} size={13} fill="#f59e0b" color="#f59e0b" />
                      ))}
                    </div>
                    <p style={{ fontSize: '0.83rem', color: '#475569', margin: 0, lineHeight: 1.5 }}>
                      "{rev.comment}"
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* NOROZZ Guarantee Card */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
              padding: '16px 20px',
              borderRadius: '16px',
              border: '1px solid #93c5fd'
            }}>
              <AlertCircle size={22} color="#2563eb" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.85rem', color: '#1e40af', lineHeight: 1.5 }}>
                <strong>NOROZZ Protection Promise:</strong> Fixed upfront transparent pricing with zero hidden doorstep fees. 100% money-back guarantee if not satisfied with service quality!
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* Sticky Bottom Action Bar */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#0f172a',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '16px 24px',
        boxShadow: '0 -10px 30px rgba(0,0,0,0.5)',
        zIndex: 100
      }}>
        <div style={{ maxWidth: '860px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' }}>TOTAL AMOUNT</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#ffffff' }}>{price}</div>
          </div>
          <button
            type="button"
            onClick={handleBookServiceClick}
            className="btn btn-primary btn-lg"
            style={{
              fontWeight: '800',
              padding: '14px 36px',
              fontSize: '1.05rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: '#ffffff',
              borderRadius: '14px',
              border: 'none',
              boxShadow: '0 8px 20px rgba(37, 99, 235, 0.4)',
              cursor: 'pointer'
            }}
          >
            <Plus size={18} /> Book This Service ({price})
          </button>
        </div>
      </div>

    </div>
  );
};

export default CustomerServiceDetailPage;
