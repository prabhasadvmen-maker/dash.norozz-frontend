import React, { useState, useMemo } from 'react';
import {
  CalendarCheck,
  Clock,
  CheckCircle2,
  XCircle,
  User,
  MapPin,
  Play,
  Navigation,
  KeyRound,
  Camera,
  Layers,
  Loader2,
} from 'lucide-react';
import { usePartner } from '../../hooks/usePartner.js';
import { useBookings } from '../../hooks/useBookings.js';
import { partnerService } from '../../services/partner.service.js';

const PartnerJobsTable = ({ onOpenFulfillment }) => {
  const { todayBookings, pendingBookings, completedBookings, cancelledBookings, allBookings } = usePartner('bookings');
  const { completeBooking } = useBookings();

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'upcoming' | 'completed' | 'cancelled'
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [otpInput, setOtpInput] = useState('');
  const [fetchingDetailsId, setFetchingDetailsId] = useState(null);

  // Consolidate all bookings without duplicates
  const masterBookingsList = useMemo(() => {
    const map = new Map();
    [...(allBookings || []), ...(todayBookings || []), ...(pendingBookings || []), ...(completedBookings || []), ...(cancelledBookings || [])].forEach((b) => {
      if (b && b._id) {
        map.set(b._id.toString(), b);
      }
    });
    return Array.from(map.values());
  }, [allBookings, todayBookings, pendingBookings, completedBookings, cancelledBookings]);

  // Filter lists for tabs
  const upcomingBookings = useMemo(() => {
    return masterBookingsList.filter((b) =>
      ['Pending', 'pending', 'Accepted', 'accepted', 'Assigned', 'assigned', 'On The Way', 'on_the_way', 'Started', 'started', 'in_progress'].includes(b.status)
    );
  }, [masterBookingsList]);

  const [acceptingId, setAcceptingId] = useState(null);

  const handleAcceptJob = async (job) => {
    const jobId = job._id;
    setAcceptingId(jobId);
    try {
      await partnerService.claimJobOffer(jobId);
      toast.success('🎉 Congratulations! Job accepted successfully!');
      window.location.reload();
    } catch (err) {
      console.error('Accept job error:', err);
      toast.error(err.response?.data?.message || 'Failed to accept job.');
    } finally {
      setAcceptingId(null);
    }
  };

  const acceptedBookingsList = useMemo(() => {
    return masterBookingsList.filter((b) =>
      ['Accepted', 'accepted', 'Assigned', 'assigned', 'On The Way', 'on_the_way', 'Started', 'started', 'in_progress'].includes(b.status)
    );
  }, [masterBookingsList]);

  const completedBookingsList = useMemo(() => {
    return masterBookingsList.filter((b) =>
      ['Completed', 'completed'].includes(b.status)
    );
  }, [masterBookingsList]);

  const cancelledBookingsList = useMemo(() => {
    return masterBookingsList.filter((b) =>
      ['Cancelled', 'cancelled', 'Refunded', 'refunded'].includes(b.status)
    );
  }, [masterBookingsList]);

  // Current active display list
  const currentJobsList = useMemo(() => {
    switch (activeTab) {
      case 'upcoming':
        return upcomingBookings;
      case 'accepted':
        return acceptedBookingsList;
      case 'completed':
        return completedBookingsList;
      case 'cancelled':
        return cancelledBookingsList;
      case 'all':
      default:
        return masterBookingsList;
    }
  }, [activeTab, masterBookingsList, upcomingBookings, acceptedBookingsList, completedBookingsList, cancelledBookingsList]);

  // Handle Tab Click - Instant In-Memory Filter Transition
  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };

  // Handle View Details Click - Fetch Single Booking Data via API
  const handleViewDetailsClick = async (job) => {
    const jobId = job._id || job.rawId;
    setFetchingDetailsId(jobId);
    try {
      if (jobId && !jobId.toString().startsWith('demo')) {
        const res = await partnerService.getBookingDetails(jobId);
        const fullBooking = res.data?.data || res.data;
        if (fullBooking) {
          onOpenFulfillment && onOpenFulfillment(fullBooking);
        } else {
          onOpenFulfillment && onOpenFulfillment(job);
        }
      } else {
        onOpenFulfillment && onOpenFulfillment(job);
      }
    } catch (err) {
      console.warn('API error fetching booking details, using existing job object:', err);
      onOpenFulfillment && onOpenFulfillment(job);
    } finally {
      setFetchingDetailsId(null);
    }
  };

  const getStatusBadge = (status) => {
    const s = String(status || '').toLowerCase();
    if (s === 'completed') {
      return <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><CheckCircle2 size={12} /> COMPLETED</span>;
    } else if (s === 'started' || s === 'in_progress') {
      return <span className="badge badge-blue" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Play size={12} /> IN PROGRESS</span>;
    } else if (s === 'on the way' || s === 'on_the_way') {
      return <span className="badge badge-purple" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Navigation size={12} /> ON THE WAY</span>;
    } else if (s === 'accepted') {
      return <span className="badge badge-blue" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> ACCEPTED</span>;
    } else if (s === 'assigned') {
      return <span className="badge badge-purple" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><User size={12} /> ASSIGNED</span>;
    } else if (s === 'cancelled' || s === 'refunded') {
      return <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><XCircle size={12} /> CANCELLED</span>;
    } else {
      return <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {status.toUpperCase()}</span>;
    }
  };

  const handleConfirmComplete = async (e) => {
    e.preventDefault();
    if (!selectedJob) return;
    await completeBooking(selectedJob._id);
    setCompleteModalOpen(false);
  };

  return (
    <div className="mui-card" style={{ padding: '26px' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <CalendarCheck size={22} color="#7c3aed" /> Active Jobs & Field Dispatch Operations
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', margin: 0 }}>
            Accept incoming service assignments, update real-time progress, and complete jobs with OTP verification.
          </p>
        </div>
      </div>

      {/* Filter Tabs Row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '20px',
        borderBottom: '1.5px solid var(--border-light)',
        paddingBottom: '12px',
        overflowX: 'auto',
      }}>
        {[
          { id: 'all', label: 'All Bookings', count: masterBookingsList.length, icon: Layers, color: '#2563eb' },
          { id: 'upcoming', label: 'Upcoming', count: upcomingBookings.length, icon: Clock, color: '#0284c7' },
          { id: 'accepted', label: 'Accepted', count: acceptedBookingsList.length, icon: CalendarCheck, color: '#7c3aed' },
          { id: 'completed', label: 'Completed', count: completedBookingsList.length, icon: CheckCircle2, color: '#16a34a' },
          { id: 'cancelled', label: 'Cancelled', count: cancelledBookingsList.length, icon: XCircle, color: '#dc2626' },
        ].map((tab) => {
          const IconComp = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabClick(tab.id)}
              style={{
                padding: '8px 16px',
                borderRadius: '12px',
                fontSize: '0.84rem',
                fontWeight: '800',
                border: isActive ? `2px solid ${tab.color}` : '1px solid #e2e8f0',
                background: isActive ? `${tab.color}15` : '#ffffff',
                color: isActive ? tab.color : '#64748b',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
              }}
            >
              <IconComp size={15} color={isActive ? tab.color : '#64748b'} />
              <span>{tab.label}</span>
              <span style={{
                background: isActive ? tab.color : '#f1f5f9',
                color: isActive ? '#ffffff' : '#64748b',
                padding: '2px 8px',
                borderRadius: '20px',
                fontSize: '0.74rem',
                fontWeight: '800'
              }}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bookings Table */}
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
            {currentJobsList.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '28px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  {activeTab === 'all' && 'No bookings found.'}
                  {activeTab === 'upcoming' && 'No upcoming open jobs.'}
                  {activeTab === 'accepted' && 'No accepted jobs for today.'}
                  {activeTab === 'completed' && 'No completed jobs yet.'}
                  {activeTab === 'cancelled' && 'No cancelled bookings.'}
                </td>
              </tr>
            ) : (
              currentJobsList.map((job) => {
                const bId = job.bookingId || job.bookingNumber || `UC-${job._id.toString().slice(-6).toUpperCase()}`;
                const custName = job.customer?.name || 'Customer';
                const sName = job.packageName || job.service?.name || job.serviceName || 'Home Service Package';
                const slot = job.timeSlot || job.bookingTimeSlot || '10:30 AM';
                const addr = typeof job.address === 'object'
                  ? `${job.address?.addressLine ? job.address.addressLine + ', ' : ''}${job.address?.city || job.city || 'Delhi NCR'}`
                  : (job.address || job.city || 'Delhi NCR');
                const amt = job.amount || job.totalAmount || job.service?.finalPrice || 599;

                const isFetching = fetchingDetailsId === job._id;

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
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {(job.status === 'Pending' || job.status === 'pending' || !job.partner) && (
                          <button
                            type="button"
                            onClick={() => handleAcceptJob(job)}
                            disabled={acceptingId === job._id}
                            className="btn btn-success btn-sm"
                            style={{ borderRadius: '10px', padding: '6px 12px', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                          >
                            {acceptingId === job._id ? <Loader2 size={12} className="spin" /> : '✓ Accept Job'}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleViewDetailsClick(job)}
                          disabled={isFetching}
                          className="btn btn-primary btn-sm"
                          style={{ borderRadius: '10px', padding: '6px 12px', fontWeight: '700' }}
                        >
                          {isFetching ? (
                            <>
                              <Loader2 size={12} className="spin" /> Fetching Details...
                            </>
                          ) : (
                            <>
                              <Navigation size={12} /> View Details
                            </>
                          )}
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
