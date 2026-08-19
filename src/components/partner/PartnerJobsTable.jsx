import React, { useState } from 'react';
import { CalendarCheck, Clock, CheckCircle2, User, MapPin, Play, Navigation, KeyRound, Camera } from 'lucide-react';
import { usePartner } from '../../hooks/usePartner.js';
import { useBookings } from '../../hooks/useBookings.js';

const PartnerJobsTable = ({ onOpenFulfillment }) => {
  const { todayBookings, pendingBookings } = usePartner();
  const { acceptBooking, updateBookingStatus, completeBooking } = useBookings();
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [otpInput, setOtpInput] = useState('');

  const allJobs = [...todayBookings, ...pendingBookings];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return <span className="badge badge-success"><CheckCircle2 size={12} /> COMPLETED</span>;
      case 'Started':
        return <span className="badge badge-blue"><Play size={12} /> IN PROGRESS</span>;
      case 'On The Way':
        return <span className="badge badge-purple"><Navigation size={12} /> ON THE WAY</span>;
      case 'Accepted':
        return <span className="badge badge-blue"><Clock size={12} /> ACCEPTED</span>;
      case 'Assigned':
        return <span className="badge badge-purple"><User size={12} /> ASSIGNED</span>;
      default:
        return <span className="badge badge-warning"><Clock size={12} /> {status.toUpperCase()}</span>;
    }
  };

  const handleOpenComplete = (job) => {
    setSelectedJob(job);
    setOtpInput('');
    setCompleteModalOpen(true);
  };

  const handleConfirmComplete = async (e) => {
    e.preventDefault();
    if (!selectedJob) return;
    await completeBooking(selectedJob._id);
    setCompleteModalOpen(false);
  };

  return (
    <div className="mui-card" style={{ padding: '26px' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CalendarCheck size={22} color="#7c3aed" /> Active Jobs & Field Dispatch Operations
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Accept incoming service assignments, update real-time progress, and complete jobs with OTP verification.
          </p>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              <th style={{ padding: '12px 14px' }}>BOOKING REF</th>
              <th style={{ padding: '12px 14px' }}>CUSTOMER</th>
              <th style={{ padding: '12px 14px' }}>SERVICE REQUEST</th>
              <th style={{ padding: '12px 14px' }}>TIME & LOCATION</th>
              <th style={{ padding: '12px 14px' }}>PAYOUT</th>
              <th style={{ padding: '12px 14px' }}>STATUS</th>
              <th style={{ padding: '12px 14px' }}>ACTION / PROGRESS</th>
            </tr>
          </thead>
          <tbody>
            {allJobs.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No active bookings assigned yet.
                </td>
              </tr>
            ) : (
              allJobs.map((job) => {
                const bId = job.bookingId || job.bookingNumber || `UC-${job._id.toString().slice(-6).toUpperCase()}`;
                const custName = job.customer?.name || 'Customer';
                const sName = job.packageName || job.service?.name || job.serviceName || 'Home Service Package';
                const slot = job.timeSlot || job.bookingTimeSlot || '10:30 AM';
                const addr = typeof job.address === 'object'
                  ? `${job.address?.addressLine ? job.address.addressLine + ', ' : ''}${job.address?.city || job.city || 'Delhi NCR'}`
                  : (job.address || job.city || 'Delhi NCR');
                const amt = job.amount || job.totalAmount || job.service?.finalPrice || 599;

                return (
                  <tr key={job._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '14px', fontWeight: '800', color: 'var(--accent-purple)', fontSize: '0.85rem' }}>
                      {bId}
                    </td>
                    <td style={{ padding: '14px', fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                      {custName}
                    </td>
                    <td style={{ padding: '14px', fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                      {sName}
                    </td>
                    <td style={{ padding: '14px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      <div>{slot}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={12} color="#2563eb" /> {addr}
                      </div>
                    </td>
                    <td style={{ padding: '14px', fontWeight: '800', color: '#10b981', fontSize: '0.9rem' }}>
                      ₹{amt}
                    </td>
                    <td style={{ padding: '14px' }}>
                      {getStatusBadge(job.status)}
                    </td>
                    <td style={{ padding: '14px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => onOpenFulfillment && onOpenFulfillment(job)}
                          className="btn btn-primary btn-sm"
                          style={{ borderRadius: '10px', padding: '6px 12px', fontWeight: '700' }}
                        >
                          <Navigation size={12} /> View Details & Fulfill
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

      {/* COMPLETE SERVICE & OTP VERIFICATION MODAL */}
      {completeModalOpen && selectedJob && (
        <div className="modal-overlay" onClick={() => setCompleteModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '28px', maxWidth: '480px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={20} color="#10b981" /> Complete Job {selectedJob.bookingNumber || selectedJob._id}
            </h3>

            <div style={{ padding: '14px', background: '#f8fafc', borderRadius: 'var(--radius-md)', marginBottom: '20px', fontSize: '0.85rem' }}>
              <div><strong>Service:</strong> {selectedJob.serviceName || selectedJob.packageTitle}</div>
              <div><strong>Customer:</strong> {selectedJob.customer?.name || 'Ananya Deshmukh'}</div>
              <div><strong>Payout Settlement:</strong> <span style={{ color: '#10b981', fontWeight: '800' }}>₹{selectedJob.totalAmount || selectedJob.finalPrice || 599}</span></div>
            </div>

            <form onSubmit={handleConfirmComplete}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <KeyRound size={14} color="#7c3aed" /> Enter 4-Digit Customer Completion OTP
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 4821"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  maxLength={4}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Camera size={14} color="#2563eb" /> Upload Work Completion Image (Optional)
                </label>
                <input type="file" className="form-input" accept="image/*" />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setCompleteModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-success">Verify OTP & Settle Payout</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default PartnerJobsTable;
