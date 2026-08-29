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
    <div className="mui-card" style={{ padding: '26px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={22} color="#2563eb" /> Partner KYC & Onboarding Approvals ({assignedCity})
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Click any partner row to open full-page compliance inspection, view profile details, approve or reject applications.
          </p>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              <th style={{ padding: '12px 14px' }}>TECHNICIAN & NAME</th>
              <th style={{ padding: '12px 14px' }}>SKILL CATEGORY</th>
              <th style={{ padding: '12px 14px' }}>CONTACT</th>
              <th style={{ padding: '12px 14px' }}>SUBMITTED DOCUMENTS</th>
              <th style={{ padding: '12px 14px' }}>KYC STATUS</th>
              <th style={{ padding: '12px 14px' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {partners.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No service partners registered in {assignedCity} yet.
                </td>
              </tr>
            ) : (
              partners.map((p) => {
                const status = p.kycStatus || 'pending';
                const isSuspended = p.status === 'suspended' || p.status === 'blocked';
                return (
                  <tr
                    key={p._id}
                    onClick={() => handleOpenDocVerify(p)}
                    style={{
                      borderBottom: '1px solid var(--border-light)',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '14px' }}>
                      <div style={{ fontWeight: '800', fontSize: '0.9rem', color: '#2563eb', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {p.name} <Eye size={13} color="#94a3b8" />
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Display: {p.agencyName || `${p.name} (${getDisplayCategory(p)})`}</div>
                    </td>
                    <td style={{ padding: '14px', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                      {getDisplayCategory(p)}
                    </td>
                    <td style={{ padding: '14px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      <div>{p.phone || 'N/A'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.email}</div>
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
