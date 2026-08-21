import { useState, useEffect } from 'react';
import {
  User,
  Phone,
  Clock,
  Briefcase,
  FileText,
  ExternalLink,
  CheckCircle2,
  Clock3,
  Copy,
  Check
} from 'lucide-react';
import { catalogService } from '../../services/catalog.service.js';
import { cityService } from '../../services/city.service.js';

const PartnerProfileView = ({ partnerData = {} }) => {
  const [copiedId, setCopiedId] = useState(false);
  const [categoriesMap, setCategoriesMap] = useState({});
  const [citiesMap, setCitiesMap] = useState({});

  const user = partnerData || {};
  const kycStatus = user.kycStatus || 'pending';
  const isApproved = kycStatus === 'approved';

  // Load backend categories & cities to map raw ObjectIds to readable Names
  useEffect(() => {
    catalogService
      .getCategories()
      .then((res) => {
        const list = res.data?.data || res.data || [];
        if (Array.isArray(list)) {
          const map = {};
          list.forEach((c) => {
            if (c._id && c.name) map[String(c._id)] = c.name;
            if (c.id && c.name) map[String(c.id)] = c.name;
          });
          setCategoriesMap(map);
        }
      })
      .catch((err) => console.warn('Catalog category fetch warning:', err));

    cityService
      .getActiveCities()
      .then((res) => {
        const list = res.data?.data || res.data || [];
        if (Array.isArray(list)) {
          const map = {};
          list.forEach((c) => {
            if (c._id && c.name) map[String(c._id)] = c.name;
          });
          setCitiesMap(map);
        }
      })
      .catch((err) => console.warn('Cities fetch warning:', err));
  }, []);

  const handleCopyUserId = () => {
    if (user.userId) {
      navigator.clipboard.writeText(user.userId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  // Resolve all selected categories into human-readable names
  const getResolvedCategories = () => {
    const namesList = [];

    const rawCategories = Array.isArray(user.categories) && user.categories.length > 0
      ? user.categories
      : (user.category ? [user.category] : []);

    rawCategories.forEach((cat) => {
      if (typeof cat === 'object' && cat?.name) {
        namesList.push(cat.name);
      } else if (typeof cat === 'string') {
        if (categoriesMap[cat]) {
          namesList.push(categoriesMap[cat]);
        } else if (!cat.match(/^[0-9a-fA-F]{24}$/)) {
          namesList.push(cat);
        }
      }
    });

    if (!namesList.length && user.category) {
      if (categoriesMap[user.category]) {
        namesList.push(categoriesMap[user.category]);
      } else if (!user.category.match(/^[0-9a-fA-F]{24}$/)) {
        namesList.push(user.category);
      }
    }

    if (!namesList.length) {
      namesList.push('General Service Technician');
    }

    return Array.from(new Set(namesList));
  };

  const getResolvedCityName = () => {
    const rawCity = user.assignedCity || user.city;
    if (typeof rawCity === 'object' && rawCity?.name) return rawCity.name;
    if (typeof rawCity === 'string') {
      if (citiesMap[rawCity]) return citiesMap[rawCity];
      if (!rawCity.match(/^[0-9a-fA-F]{24}$/)) return rawCity;
    }
    return 'Delhi NCR';
  };

  const resolvedCategoryNames = getResolvedCategories();
  const resolvedCityName = getResolvedCityName();
  const docs = user.documents || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1000px' }}>
      
      {/* TOP HERO PROFILE CARD */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0284c7 100%)',
          borderRadius: '24px',
          padding: '32px 36px',
          color: '#ffffff',
          boxShadow: '0 20px 40px rgba(15, 23, 42, 0.25)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Subtle Decorative Circle */}
        <div
          style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.05)',
            pointerEvents: 'none'
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '28px', flexWrap: 'wrap' }}>
          
          {/* Avatar Image Container */}
          <div style={{ position: 'relative' }}>
            {user.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.name || 'Partner Profile'}
                style={{
                  width: '96px',
                  height: '96px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '4px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
                }}
              />
            ) : (
              <div
                style={{
                  width: '96px',
                  height: '96px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #16a34a, #059669)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.4rem',
                  fontWeight: '900',
                  color: '#ffffff',
                  border: '4px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
                }}
              >
                {(user.name || 'P')[0].toUpperCase()}
              </div>
            )}
            {/* Online Status Circle Indicator */}
            <span
              style={{
                position: 'absolute',
                bottom: '4px',
                right: '4px',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: '#22c55e',
                border: '3px solid #0f172a'
              }}
            />
          </div>

          {/* User Primary Details Header */}
          <div style={{ flex: 1, minWidth: '260px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.8rem', fontWeight: '900', margin: 0, letterSpacing: '-0.5px' }}>
                {user.name || 'Technician Partner'}
              </h1>

              {/* KYC Status Badge */}
              <span
                style={{
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: '800',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  background: isApproved ? 'rgba(34, 197, 94, 0.2)' : 'rgba(234, 179, 8, 0.2)',
                  color: isApproved ? '#4ade80' : '#fde047',
                  border: isApproved ? '1px solid rgba(74, 222, 128, 0.4)' : '1px solid rgba(253, 224, 71, 0.4)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {isApproved ? <CheckCircle2 size={13} /> : <Clock3 size={13} />}
                {isApproved ? 'KYC Approved' : 'KYC Pending Verification'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '14px', flexWrap: 'wrap', fontSize: '0.9rem', opacity: 0.9 }}>
              
              {/* User ID Badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.1)', padding: '4px 10px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.8rem', opacity: 0.7, fontWeight: '700' }}>ID:</span>
                <span style={{ fontWeight: '800', letterSpacing: '0.5px' }}>{user.userId || 'NRZ-P-000000'}</span>
                <button
                  type="button"
                  onClick={handleCopyUserId}
                  style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', opacity: 0.8, padding: 0, marginLeft: '4px' }}
                  title="Copy Partner ID"
                >
                  {copiedId ? <Check size={14} color="#4ade80" /> : <Copy size={14} />}
                </button>
              </div>

              {/* Phone */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Phone size={15} color="#38bdf8" />
                <span style={{ fontWeight: '600' }}>{user.phone || '+91 N/A'}</span>
              </div>

              {/* All Selected Service Categories Badges */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                {resolvedCategoryNames.map((catName, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(56, 189, 248, 0.15)', padding: '4px 12px', borderRadius: '20px', color: '#7dd3fc', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                    <Briefcase size={14} />
                    <span style={{ fontWeight: '700', fontSize: '0.82rem' }}>{catName}</span>
                  </div>
                ))}
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* 2-COLUMN GRID DETAILS SECTION */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        
        {/* PERSONAL DETAILS CARD */}
        <div style={{ background: '#ffffff', borderRadius: '18px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: '0 0 18px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', borderRadius: '10px', background: '#e0f2fe', color: '#0284c7' }}>
              <User size={18} />
            </div>
            Personal Information
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
              <span style={{ color: '#64748b', fontSize: '0.86rem', fontWeight: '600' }}>Full Name</span>
              <span style={{ color: '#0f172a', fontSize: '0.88rem', fontWeight: '700' }}>{user.name || 'N/A'}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
              <span style={{ color: '#64748b', fontSize: '0.86rem', fontWeight: '600' }}>Mobile Phone</span>
              <span style={{ color: '#0f172a', fontSize: '0.88rem', fontWeight: '700' }}>{user.phone || 'N/A'}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
              <span style={{ color: '#64748b', fontSize: '0.86rem', fontWeight: '600' }}>Email Address</span>
              <span style={{ color: '#0f172a', fontSize: '0.88rem', fontWeight: '700' }}>{user.email || 'N/A'}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
              <span style={{ color: '#64748b', fontSize: '0.86rem', fontWeight: '600' }}>Date of Birth</span>
              <span style={{ color: '#0f172a', fontSize: '0.88rem', fontWeight: '700' }}>{user.dob || 'N/A'}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
              <span style={{ color: '#64748b', fontSize: '0.86rem', fontWeight: '600' }}>Gender</span>
              <span style={{ color: '#0f172a', fontSize: '0.88rem', fontWeight: '700' }}>{user.gender || 'N/A'}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '4px' }}>
              <span style={{ color: '#64748b', fontSize: '0.86rem', fontWeight: '600' }}>Base City / Zone</span>
              <span style={{ color: '#16a34a', fontSize: '0.88rem', fontWeight: '800' }}>{resolvedCityName}</span>
            </div>

          </div>
        </div>

        {/* SERVICE OPERATING DETAILS CARD */}
        <div style={{ background: '#ffffff', borderRadius: '18px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: '0 0 18px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', borderRadius: '10px', background: '#dcfce7', color: '#16a34a' }}>
              <Briefcase size={18} />
            </div>
            Service & Operational Area
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            {/* Service Categories (All Selected) */}
            <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
              <span style={{ color: '#64748b', fontSize: '0.84rem', fontWeight: '600', display: 'block', marginBottom: '8px' }}>
                Service Categories (Active Booking Dispatches)
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {resolvedCategoryNames.map((catName, idx) => (
                  <span key={idx} style={{ background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd', padding: '4px 12px', borderRadius: '12px', fontSize: '0.82rem', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Briefcase size={13} /> {catName}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
              <span style={{ color: '#64748b', fontSize: '0.86rem', fontWeight: '600' }}>Work Experience</span>
              <span style={{ color: '#0f172a', fontSize: '0.88rem', fontWeight: '700' }}>{user.experience || '3-5 Years'}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
              <span style={{ color: '#64748b', fontSize: '0.86rem', fontWeight: '600' }}>Operating Radius</span>
              <span style={{ color: '#16a34a', fontSize: '0.88rem', fontWeight: '800' }}>{user.workRadius || 8} km</span>
            </div>

            <div>
              <span style={{ color: '#64748b', fontSize: '0.84rem', fontWeight: '600', display: 'block', marginBottom: '8px' }}>
                Active Service Localities
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {user.localities?.length > 0 ? (
                  user.localities.map((loc, idx) => (
                    <span key={idx} style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '4px 10px', borderRadius: '10px', fontSize: '0.78rem', fontWeight: '700' }}>
                      📍 {loc}
                    </span>
                  ))
                ) : (
                  <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>All city areas covered</span>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* KYC DOCUMENTS & VERIFICATION STATUS SECTION */}
      <div style={{ background: '#ffffff', borderRadius: '18px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', borderRadius: '10px', background: '#fef3c7', color: '#d97706' }}>
              <FileText size={18} />
            </div>
            KYC Identity & Document Verification Status
          </h3>
          <span style={{
            fontSize: '0.82rem',
            fontWeight: '800',
            padding: '4px 12px',
            borderRadius: '12px',
            background: isApproved ? '#dcfce7' : '#fef3c7',
            color: isApproved ? '#15803d' : '#b45309'
          }}>
            {isApproved ? 'VERIFIED PARTNER' : 'PENDING CITY ADMIN REVIEW'}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
          
          {/* Aadhaar Card */}
          <div style={{ padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.86rem', fontWeight: '700', color: '#0f172a' }}>Aadhaar Card</div>
              <div style={{ fontSize: '0.74rem', color: (docs.aadhaarFront || docs.aadhaarDoc) ? '#16a34a' : '#dc2626', fontWeight: '600' }}>
                {(docs.aadhaarFront || docs.aadhaarDoc) ? 'Uploaded' : 'Not Uploaded'}
              </div>
            </div>
            {(docs.aadhaarFront || docs.aadhaarDoc) && (
              <a href={docs.aadhaarFront || docs.aadhaarDoc} target="_blank" rel="noopener noreferrer" style={{ color: '#0284c7', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', textDecoration: 'none', fontWeight: '700' }}>
                View <ExternalLink size={13} />
              </a>
            )}
          </div>

          {/* PAN Card */}
          <div style={{ padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.86rem', fontWeight: '700', color: '#0f172a' }}>PAN Card</div>
              <div style={{ fontSize: '0.74rem', color: docs.panDoc ? '#16a34a' : '#94a3b8', fontWeight: '600' }}>
                {docs.panDoc ? 'Uploaded' : 'Optional / Pending'}
              </div>
            </div>
            {docs.panDoc && (
              <a href={docs.panDoc} target="_blank" rel="noopener noreferrer" style={{ color: '#0284c7', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', textDecoration: 'none', fontWeight: '700' }}>
                View <ExternalLink size={13} />
              </a>
            )}
          </div>

          {/* Driving License / Bank Passbook */}
          <div style={{ padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.86rem', fontWeight: '700', color: '#0f172a' }}>Driving License / Bank Passbook</div>
              <div style={{ fontSize: '0.74rem', color: (docs.drivingLicenseDoc || docs.bankPassbookDoc) ? '#16a34a' : '#94a3b8', fontWeight: '600' }}>
                {(docs.drivingLicenseDoc || docs.bankPassbookDoc) ? 'Uploaded' : 'Optional / Pending'}
              </div>
            </div>
            {(docs.drivingLicenseDoc || docs.bankPassbookDoc) && (
              <a href={docs.drivingLicenseDoc || docs.bankPassbookDoc} target="_blank" rel="noopener noreferrer" style={{ color: '#0284c7', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', textDecoration: 'none', fontWeight: '700' }}>
                View <ExternalLink size={13} />
              </a>
            )}
          </div>

        </div>
      </div>

      {/* WORKING SCHEDULE SECTION */}
      {user.workingHours?.length > 0 && (
        <div style={{ background: '#ffffff', borderRadius: '18px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', borderRadius: '10px', background: '#f3e8ff', color: '#9333ea' }}>
              <Clock size={18} />
            </div>
            Weekly Operating Schedule
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
            {user.workingHours.map((schedule, idx) => (
              <div
                key={idx}
                style={{
                  padding: '10px 14px',
                  borderRadius: '12px',
                  background: schedule.isOpen ? '#f8fafc' : '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.84rem', fontWeight: '700', color: '#0f172a' }}>{schedule.day}</span>
                  <span style={{ fontSize: '0.68rem', fontWeight: '800', padding: '2px 6px', borderRadius: '6px', background: schedule.isOpen ? '#dcfce7' : '#fee2e2', color: schedule.isOpen ? '#15803d' : '#991b1b' }}>
                    {schedule.isOpen ? 'OPEN' : 'OFF'}
                  </span>
                </div>
                {schedule.isOpen && (
                  <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: '600' }}>
                    {schedule.openTime} - {schedule.closeTime}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default PartnerProfileView;
