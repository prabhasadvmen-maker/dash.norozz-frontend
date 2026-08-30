import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, FileCheck, Power, Eye } from 'lucide-react';
import { useCityAdmin } from '../../hooks/useCityAdmin.js';
import { catalogService } from '../../services/catalog.service.js';
import PartnerKycDetailPage from './PartnerKycDetailPage';

const PartnerKycManagement = ({ assignedCity = 'Delhi NCR' }) => {
  const { partners, approvePartner, rejectPartner, updateDocumentStatus, verifyPartnerKyc, suspendPartner, activatePartner } = useCityAdmin();
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [categoryMap, setCategoryMap] = useState({});

  useEffect(() => {
    catalogService.getCategories()
      .then((res) => {
        const list = res.data?.data || res.data || [];
        if (Array.isArray(list)) {
          const map = {};
          list.forEach((c) => {
            if (c._id && c.name) map[String(c._id)] = c.name;
          });
          setCategoryMap(map);
        }
      })
      .catch((err) => console.warn('Categories map fetch warning:', err));
  }, []);

  const getDisplayCategory = (partner) => {
    const rawCat = partner.category;
    if (rawCat && !rawCat.match(/^[0-9a-fA-F]{24}$/)) {
      return rawCat;
    }
    if (rawCat && categoryMap[rawCat]) {
      return categoryMap[rawCat];
    }
    if (Array.isArray(partner.categories) && partner.categories.length > 0) {
      const names = partner.categories
        .map((c) => (typeof c === 'object' && c?.name ? c.name : categoryMap[String(c)] || null))
        .filter(Boolean);
      if (names.length > 0) return names.join(', ');
    }
    return 'General Service Technician';
  };

  const handleApprove = async (partnerId) => {
    await approvePartner(partnerId);
  };

  const handleReject = async (partnerId, reason) => {
    await rejectPartner({ id: partnerId, reason });
  };

  const handleToggleSuspend = async (partner) => {
    if (partner.status === 'suspended' || partner.status === 'blocked') {
      await activatePartner(partner._id);
    } else {
      await suspendPartner(partner._id);
    }
  };

  const handleOpenDocVerify = (partner) => {
    setSelectedPartner(partner);
  };

  // IF PARTNER SELECTED: RENDER FULL PAGE VIEW (NOT MODAL)
  if (selectedPartner) {
    return (
      <PartnerKycDetailPage
        partner={selectedPartner}
        onBack={() => setSelectedPartner(null)}
        onApprove={handleApprove}
        onReject={handleReject}
        onToggleSuspend={handleToggleSuspend}
        onUpdateDocumentStatus={(id, docKey, status, rejectionReason) =>
          updateDocumentStatus({ id, docKey, status, rejectionReason })
        }
        categoryMap={categoryMap}
      />
    );
  }

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '20px',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
      padding: '26px'
    }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={22} color="#2563eb" /> Partner KYC & Onboarding Approvals ({assignedCity})
          </h3>
          <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>
            Click any partner row to open full-page compliance inspection, view profile details, approve or reject applications.
          </p>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              <th style={{ padding: '14px 16px', fontWeight: '800', textAlign: 'center', width: '50px' }}>SR NO.</th>
              <th style={{ padding: '14px 16px', fontWeight: '800' }}>TECHNICIAN & NAME</th>
              <th style={{ padding: '14px 16px', fontWeight: '800' }}>SKILL CATEGORY</th>
              <th style={{ padding: '14px 16px', fontWeight: '800' }}>CONTACT</th>
              <th style={{ padding: '14px 16px', fontWeight: '800' }}>SUBMITTED DOCUMENTS</th>
              <th style={{ padding: '14px 16px', fontWeight: '800' }}>KYC STATUS</th>
              <th style={{ padding: '14px 16px', fontWeight: '800' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {partners.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
                  No service partners registered in {assignedCity} yet.
                </td>
              </tr>
            ) : (
              partners.map((p, idx) => {
                const status = p.kycStatus || 'pending';
                const isSuspended = p.status === 'suspended' || p.status === 'blocked';
                return (
                  <tr
                    key={p._id}
                    onClick={() => handleOpenDocVerify(p)}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      cursor: 'pointer',
                      background: '#ffffff',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                  >
                    <td style={{ padding: '14px 16px', fontWeight: '700', color: '#64748b', fontSize: '0.82rem', textAlign: 'center' }}>
                      {idx + 1}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: '800', fontSize: '0.9rem', color: '#2563eb', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {p.name} <Eye size={13} color="#94a3b8" />
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600' }}>Display: {p.agencyName || `${p.name} (${getDisplayCategory(p)})`}</div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '0.85rem', fontWeight: '800', color: '#0f172a' }}>
                      {getDisplayCategory(p)}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '0.82rem', color: '#334155', fontWeight: '600' }}>
                      <div style={{ color: '#0f172a', fontWeight: '700' }}>{p.phone || '+91 98765 43210'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.email}</div>
                    </td>
                    <td style={{ padding: '14px' }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDocVerify(p);
                        }}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.75rem', fontWeight: '700' }}
                      >
                        <FileCheck size={14} color="#2563eb" /> Inspect Documents
                      </button>
                    </td>
                    <td style={{ padding: '14px' }}>
                      <span className={`badge ${status === 'approved' ? 'badge-success' : status === 'rejected' ? 'badge-danger' : 'badge-warning'}`}>
                        {status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '14px' }}>
                      <div style={{ display: 'flex', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
                        {status !== 'approved' && (
                          <button
                            type="button"
                            onClick={() => handleApprove(p._id)}
                            className="btn btn-primary btn-sm"
                            style={{ padding: '6px 10px', fontSize: '0.78rem' }}
                          >
                            <CheckCircle2 size={14} /> Approve
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleToggleSuspend(p)}
                          className={`btn btn-sm ${isSuspended ? 'btn-success' : 'btn-secondary'}`}
                          style={{ padding: '6px 8px', fontSize: '0.75rem' }}
                          title={isSuspended ? 'Activate Partner' : 'Suspend Partner'}
                        >
                          <Power size={12} /> {isSuspended ? 'Activate' : 'Suspend'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default PartnerKycManagement;
