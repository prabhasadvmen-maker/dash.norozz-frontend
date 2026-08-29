import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, Clock, ShieldCheck, CheckCircle2, AlertCircle, Plus, Sparkles, Award, Layers, Loader2 } from 'lucide-react';
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
        
        // Auto-Select Logic: If 1 package exists, auto-select it!
        if (activeList.length === 1) {
          setSelectedPackage(activeList[0]);
        } else if (activeList.length > 1) {
          // Default to recommended or first package
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
      serviceId: service._id,
      packageId: displayPackage?._id || null,
      package: displayPackage,
      packageName: displayPackage ? displayPackage.title : service.name,
      price: rawPrice,
      finalPrice: rawPrice,
      duration: duration,
      title: displayPackage ? `${service.name} (${displayPackage.title})` : service.name,
    };
    onBookNow(bookingPayload);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', paddingBottom: '90px' }}>
      
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
            style={{ fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 18px' }}
          >
            <ArrowLeft size={18} /> Back to Services
          </button>
        </div>

        {/* Hero Card Banner */}
        <div
          className="mui-card"
          style={{
            padding: 0,
            overflow: 'hidden',
            marginBottom: '24px',
            borderRadius: 'var(--radius-xl)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)'
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
                <span className="badge" style={{ background: 'rgba(255,255,255,0.25)', color: '#ffffff', fontSize: '0.75rem', padding: '4px 10px' }}>
                  {categoryName}
                </span>
                {offPercentage > 0 && (
                  <span className="badge badge-success" style={{ fontSize: '0.75rem', padding: '4px 10px', fontWeight: '800' }}>
                    {offPercentage}% OFF
                  </span>
                )}
              </div>

              <h1 style={{ fontSize: '1.65rem', fontWeight: '800', margin: '0 0 10px 0', lineHeight: 1.3 }}>
                {title} {displayPackage ? `— ${displayPackage.title}` : ''}
              </h1>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.85rem', opacity: 0.95, flexWrap: 'wrap' }}>
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
            borderBottom: '1px solid var(--border-light)'
          }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>
                {displayPackage ? `Selected Package (${displayPackage.title})` : 'Special Service Price'}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginTop: '2px' }}>
                <span style={{ fontSize: '2.1rem', fontWeight: '800', color: 'var(--text-primary)' }}>{price}</span>
                {originalPrice && (
                  <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>{originalPrice}</span>
                )}
              </div>
            </div>

            {discountVal > 0 && (
              <div style={{ textAlign: 'right' }}>
                <span className="badge badge-purple" style={{ fontSize: '0.82rem', padding: '6px 12px', display: 'inline-block', marginBottom: '4px' }}>
                  🔥 SPECIAL DISCOUNT
                </span>
                <div style={{ fontSize: '0.82rem', color: '#059669', fontWeight: '800' }}>
                  Instant Save ₹{discountVal}
                </div>
              </div>
            )}
          </div>

          {/* Card Content Section */}
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '26px' }}>
            
            {/* PACKAGE SELECTION SECTION */}
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '14px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={20} color="#2563eb" /> Choose Your Service Package
              </h3>

              {loadingPackages ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Loader2 size={20} className="spin" style={{ margin: '0 auto 8px auto', color: '#2563eb' }} />
                  <div>Loading available service packages...</div>
                </div>
              ) : packages.length === 0 ? (
                <div style={{ padding: '20px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 'var(--radius-md)', color: '#991b1b', fontSize: '0.85rem' }}>
                  ⚠️ This service currently has no active packages configured.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                  {packages.map((pkg) => {
                    const isSelected = selectedPackage?._id === pkg._id;
                    return (
                      <div
                        key={pkg._id}
                        onClick={() => setSelectedPackage(pkg)}
                        style={{
                          padding: '18px',
                          borderRadius: 'var(--radius-lg)',
                          border: isSelected ? '2px solid #2563eb' : '1px solid var(--border-light)',
                          background: isSelected ? '#eff6ff' : '#ffffff',
                          cursor: 'pointer',
                          boxShadow: isSelected ? '0 8px 24px rgba(37,99,235,0.18)' : 'var(--shadow-sm)',
                          transition: 'all 0.2s ease',
                          position: 'relative',
                          display: 'flex',
                          flexDirection: 'column',
                          justify: 'space-between'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                            <div style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--text-primary)' }}>
                              {pkg.title}
                            </div>
                            {isSelected && (
                              <span className="badge badge-primary" style={{ fontSize: '0.68rem', padding: '3px 8px', fontWeight: '800' }}>
                                ✓ SELECTED
                              </span>
                            )}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '10px' }}>
                            <span style={{ fontSize: '1.35rem', fontWeight: '800', color: '#10b981' }}>
                              ₹{pkg.finalPrice}
                            </span>
                            {pkg.price > pkg.finalPrice && (
                              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                                ₹{pkg.price}
                              </span>
                            )}
                          </div>

                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                            ⏱️ Duration: <strong>{pkg.duration}</strong>
                          </div>

                          {pkg.description && (
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 12px 0', lineHeight: 1.4 }}>
                              {pkg.description}
                            </p>
                          )}

                          {Array.isArray(pkg.features) && pkg.features.length > 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              {pkg.features.map((feat, idx) => (
                                <div key={idx} style={{ fontSize: '0.78rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                                  <CheckCircle2 size={14} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                                  <span>{feat}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPackage(pkg);
                          }}
                          className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                          style={{ marginTop: '16px', width: '100%', fontWeight: '800' }}
                        >
                          {isSelected ? 'Selected Package' : 'Select Package'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '800', marginBottom: '8px', color: 'var(--text-primary)' }}>
                Service Overview & Description
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
                {description}
              </p>
            </div>

            {/* What's Included */}
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '800', marginBottom: '14px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.88rem', color: 'var(--text-primary)', background: '#f8fafc', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                    <CheckCircle2 size={18} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Reviews Section */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Award size={18} color="#f59e0b" /> Verified Customer Reviews
                </h3>
                <span style={{ fontSize: '0.82rem', color: '#f59e0b', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Star size={15} fill="#f59e0b" color="#f59e0b" /> 4.9 / 5 Average Rating
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '14px' }}>
                {[
                  { name: 'Amit Sharma', rating: 5, date: '2 days ago', comment: 'Excellent jet cleaning! The technician Rajesh was very polite and cleaned the AC thoroughly.' },
                  { name: 'Priya Verma', rating: 5, date: '1 week ago', comment: 'Super fast arrival within 30 mins. Cooling performance improved instantly after foam cleaning.' },
                  { name: 'Rahul Gupta', rating: 4, date: '2 weeks ago', comment: 'Great service quality and clean job done. Highly recommended!' }
                ].map((rev, idx) => (
                  <div key={idx} style={{ padding: '14px 16px', background: '#f8fafc', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <div style={{ fontSize: '0.88rem', fontWeight: '800', color: 'var(--text-primary)' }}>{rev.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{rev.date}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginBottom: '6px' }}>
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} size={13} fill="#f59e0b" color="#f59e0b" />
                      ))}
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
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
              borderRadius: 'var(--radius-lg)',
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
        background: '#ffffff',
        borderTop: '1px solid var(--border-light)',
        padding: '14px 24px',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
        zIndex: 100
      }}>
        <div style={{ maxWidth: '860px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>TOTAL AMOUNT</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-primary)' }}>{price}</div>
          </div>
          <button
            type="button"
            onClick={handleBookServiceClick}
            disabled={packages.length === 0}
            className="btn btn-primary btn-lg"
            style={{ fontWeight: '800', padding: '12px 32px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Plus size={18} /> Book This Service ({price})
          </button>
        </div>
      </div>

    </div>
  );
};

export default CustomerServiceDetailPage;
