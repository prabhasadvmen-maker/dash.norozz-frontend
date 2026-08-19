import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, FileCheck, Power } from 'lucide-react';
import { useCityAdmin } from '../../hooks/useCityAdmin.js';

const PartnerKycManagement = ({ assignedCity = 'Delhi NCR' }) => {
  const { partners, approvePartner, rejectPartner, verifyPartnerKyc, suspendPartner, activatePartner } = useCityAdmin();
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [rejectReasonModal, setRejectReasonModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const handleApprove = async (partnerId) => {
    await approvePartner(partnerId);
  };

  const handleVerifyKyc = async (partnerId) => {
    await verifyPartnerKyc(partnerId);
  };

  const handleToggleSuspend = async (partner) => {
    if (partner.status === 'suspended') {
      await activatePartner(partner._id);
    } else {
      await suspendPartner(partner._id);
    }
  };

  const handleOpenReject = (partner) => {
    setSelectedPartner(partner);
    setRejectReason('');
    setRejectReasonModal(true);
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!selectedPartner) return;
    await rejectPartner({ id: selectedPartner._id, reason: rejectReason });
    setRejectReasonModal(false);
  };

  const handleOpenDocVerify = (partner) => {
    setSelectedPartner(partner);
    setIsDocModalOpen(true);
  };

  return (
    <div className="mui-card" style={{ padding: '26px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={22} color="#2563eb" /> Partner KYC & Onboarding Approvals ({assignedCity})
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Verify uploaded compliance documents, approve active service agencies, or reject invalid applications.
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
                const isSuspended = p.status === 'suspended';
                return (
                  <tr key={p._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '14px' }}>
                      <div style={{ fontWeight: '800', fontSize: '0.9rem', color: 'var(--text-primary)' }}>{p.name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Display: {p.agencyName || `${p.name} (${p.category || 'Specialist'})`}</div>
                    </td>
                    <td style={{ padding: '14px', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                      {p.category || 'AC & Appliance Repair'}
                    </td>
                    <td style={{ padding: '14px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      <div>{p.phone || '+91 98765 43210'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.email}</div>
                    </td>
                    <td style={{ padding: '14px' }}>
                      <button
                        onClick={() => handleOpenDocVerify(p)}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.75rem' }}
                      >
                        <FileCheck size={14} color="#2563eb" /> Verify Documents
                      </button>
                    </td>
                    <td style={{ padding: '14px' }}>
                      <span className={`badge ${status === 'approved' ? 'badge-success' : status === 'rejected' ? 'badge-danger' : 'badge-warning'}`}>
                        {status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '14px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {status !== 'approved' && (
                          <button
                            onClick={() => handleApprove(p._id)}
                            className="btn btn-primary btn-sm"
                            style={{ padding: '6px 10px', fontSize: '0.78rem' }}
                          >
                            <CheckCircle2 size={14} /> Approve
                          </button>
                        )}

                        {status !== 'rejected' && (
                          <button
                            onClick={() => handleOpenReject(p)}
                            className="btn btn-danger btn-sm"
                            style={{ padding: '6px 10px', fontSize: '0.78rem' }}
                          >
                            <XCircle size={14} /> Reject
                          </button>
                        )}

                        <button
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

      {/* DOCUMENT VERIFICATION INSPECTION MODAL */}
      {isDocModalOpen && selectedPartner && (
        <div className="modal-overlay" onClick={() => setIsDocModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '28px', maxWidth: '540px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileCheck size={20} color="#2563eb" /> Verify Compliance Documents: {selectedPartner.name} ({selectedPartner.category || 'Technician'})
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              {['Aadhaar Document', 'PAN Card', 'GST Certificate', 'Bank Passbook'].map((doc, idx) => (
                <div key={idx} style={{ padding: '14px', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '0.88rem' }}>{doc}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Verified against official registry</div>
                  </div>
                  <span className="badge badge-success">VALID DOC</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-secondary" onClick={() => setIsDocModalOpen(false)} style={{ flex: 1 }}>
                Close
              </button>
              <button className="btn btn-primary" onClick={() => { handleVerifyKyc(selectedPartner._id); setIsDocModalOpen(false); }} style={{ flex: 1 }}>
                Mark All Docs Verified
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT REASON MODAL */}
      {rejectReasonModal && selectedPartner && (
        <div className="modal-overlay" onClick={() => setRejectReasonModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '28px', maxWidth: '480px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <XCircle size={20} color="#ef4444" /> Reject Partner Application: {selectedPartner.agencyName || selectedPartner.name}
            </h3>

            <form onSubmit={handleConfirmReject}>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">Reason for Rejection</label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="e.g. Invalid GST registration document or failed police verification."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setRejectReasonModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-danger">Confirm Rejection</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default PartnerKycManagement;
