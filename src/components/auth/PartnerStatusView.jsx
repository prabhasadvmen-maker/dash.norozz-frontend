import React from 'react';
import { Clock, CheckCircle2, AlertCircle, ShieldCheck, ArrowRight, RefreshCw } from 'lucide-react';

const PartnerStatusView = ({ partnerData, onProceedToLogin }) => {
  const isPending = partnerData?.status === 'pending';
  const isApproved = partnerData?.status === 'approved';

  return (
    <div style={{ textAlign: 'center', padding: '12px 0' }}>
      
      {/* Icon Indicator */}
      <div style={{
        width: '68px',
        height: '68px',
        borderRadius: '50%',
        background: isApproved ? 'var(--accent-emerald-light)' : 'var(--accent-amber-light)',
        color: isApproved ? 'var(--accent-emerald)' : 'var(--accent-amber)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '16px',
        border: `2px solid ${isApproved ? '#a7f3d0' : '#fef08a'}`
      }}>
        {isApproved ? <CheckCircle2 size={36} /> : <Clock size={36} />}
      </div>

      <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '6px' }}>
        {isApproved ? 'Partner Application Approved! 🎉' : 'Application Under Review ⏳'}
      </h3>

      <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.5' }}>
        {isApproved
          ? `Congratulations! Your technician partner account '${partnerData?.agencyName || partnerData?.name || 'Service Partner'}' has been approved.`
          : `Your technician partner application for '${partnerData?.agencyName || partnerData?.name || 'Service Partner'}' (${partnerData?.category || 'AC & Appliance Repair'}, ${partnerData?.city || 'Delhi NCR'}) has been submitted and is currently being verified.`}
      </p>

      {/* Detail Box */}
      <div style={{
        background: '#f8fafc',
        borderRadius: 'var(--radius-md)',
        padding: '16px',
        border: '1px solid var(--border-light)',
        textAlign: 'left',
        marginBottom: '24px',
        fontSize: '0.82rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ color: 'var(--text-muted)' }}>Technician / Display Name:</span>
          <span style={{ fontWeight: '700' }}>{partnerData?.agencyName || partnerData?.name || 'Service Partner'}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ color: 'var(--text-muted)' }}>Registered Email:</span>
          <span style={{ fontWeight: '700' }}>{partnerData?.email || 'partner@norozz.com'}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-muted)' }}>Approval Status:</span>
          <span className={`badge ${isApproved ? 'badge-success' : 'badge-warning'}`}>
            {isApproved ? 'APPROVED' : 'PENDING SUPER ADMIN APPROVAL'}
          </span>
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          type="button"
          onClick={onProceedToLogin}
          className="btn btn-primary"
          style={{ flex: 1, padding: '12px' }}
        >
          {isApproved ? 'Login to Partner Portal' : 'Proceed to Login'} <ArrowRight size={16} />
        </button>
      </div>

    </div>
  );
};

export default PartnerStatusView;
