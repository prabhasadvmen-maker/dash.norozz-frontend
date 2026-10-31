import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  CalendarCheck,
  Clock,
  CheckCircle2,
  XCircle,
  User,
  MapPin,
  Play,
  Navigation,
  Layers,
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
  Inbox,
} from 'lucide-react';
import { usePartner } from '../../hooks/usePartner.js';
import { useBookings } from '../../hooks/useBookings.js';
import { partnerService } from '../../services/partner.service.js';
import { useAuthContext } from '../../contexts/AuthContext.jsx';
import PartnerCancelBookingModal from './PartnerCancelBookingModal.jsx';
import { toast } from '../../utils/toast.js';

const PAGE_SIZE = 10;
const VALID_TABS = ['all', 'upcoming', 'accepted', 'completed', 'cancelled'];
const ACCEPTED_STATUSES = ['accepted', 'assigned', 'on the way', 'on_the_way', 'started', 'in_progress'];
const CANCELLABLE_STATUSES = ['accepted', 'assigned', 'on the way', 'on_the_way'];

const EMPTY_MESSAGES = {
  all: 'No bookings yet.',
  upcoming: 'No open job offers right now. Stay online to receive new requests.',
  accepted: 'No active jobs at the moment.',
  completed: 'No completed jobs yet.',
  cancelled: 'No cancelled bookings.',
};

const formatINR = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

const bookingRef = (job) => job.bookingId || job.bookingNumber || `UC-${String(job._id).slice(-6).toUpperCase()}`;

const formatDate = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
};

// timeSlot is sometimes stored as "<date> • <time>"; the booking date is shown separately, so keep just the time
const getSlotTime = (slot) => (slot ? String(slot).split('•').pop().trim() : '');

const formatAddress = (job) => {
  if (job.address && typeof job.address === 'object') {
    return [job.address.addressLine, job.address.city || job.city].filter(Boolean).join(', ');
  }
  return job.address || job.city || '';
};

// Payout figures come from the server's financial snapshot; nothing is guessed on the client
const getPayout = (job) => {
  const snap = job.financialSnapshot;
  const pkg = snap?.servicePrice ?? job.packageSnapshot?.finalPrice ?? job.amount;
  const fee = snap?.partnerCommission;
  const net = snap?.partnerNetEarning;
  return { pkg, fee, net };
};

const th = { padding: '12px 10px', textAlign: 'left', whiteSpace: 'nowrap' };
const td = { padding: '12px 10px', verticalAlign: 'top' };

const PartnerJobsTable = ({ onOpenFulfillment }) => {
  const { currentUser } = useAuthContext();
  const { pendingBookings, allBookings, refetchAll, isLoading } = usePartner({ activeTab: 'bookings', isApproved: true });

  const { acceptBooking } = useBookings();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const activeTab = VALID_TABS.includes(tabParam) ? tabParam : 'all';

  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedCancelJob, setSelectedCancelJob] = useState(null);
  const [fetchingDetailsId, setFetchingDetailsId] = useState(null);
  const [acceptingId, setAcceptingId] = useState(null);

  const currentPartnerId = String(currentUser?._id || '');

  const handleTabClick = (tabId) => {
    setSearchParams({ tab: tabId });
    setPage(1);
  };

  const isCancelledForPartner = (b) => {
    const s = String(b?.status || '').toLowerCase();
    if (['cancelled', 'refunded'].includes(s)) return true;
    const byThisPartner = Array.isArray(b?.cancelledByPartners) && b.cancelledByPartners.some((p) => String(p?._id || p) === currentPartnerId);
    const partnerCancelled = b?.cancelledBy === 'partner' && (byThisPartner || !b.partner || String(b.partner?._id || b.partner) === currentPartnerId);
    return byThisPartner || partnerCancelled;
  };

  const lists = useMemo(() => {
    const mine = allBookings || [];
    return {
      all: mine,
      upcoming: pendingBookings || [],
      accepted: mine.filter((b) => ACCEPTED_STATUSES.includes(String(b.status || '').toLowerCase()) && !isCancelledForPartner(b)),
      completed: mine.filter((b) => String(b.status || '').toLowerCase() === 'completed'),
      cancelled: mine.filter((b) => isCancelledForPartner(b)),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allBookings, pendingBookings, currentPartnerId]);

  // Newest first, then filter by search text
  const filteredJobs = useMemo(() => {
    const sorted = [...lists[activeTab]].sort(
      (a, b) => new Date(b.createdAt || b.bookingDate || 0) - new Date(a.createdAt || a.bookingDate || 0)
    );
    const q = query.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter((job) =>
      [bookingRef(job), job.customer?.name, job.packageName, job.service?.name, formatAddress(job)]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [lists, activeTab, query]);

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const pageJobs = filteredJobs.slice(pageStart, pageStart + PAGE_SIZE);

  const handleAcceptJob = async (job) => {
    setAcceptingId(job._id);
    try {
      await partnerService.claimJobOffer(job._id);
      toast.success('Job accepted successfully!');
      await refetchAll();
    } catch (err) {
      // axiosInstance rejects with the response body, so the message is on err itself
      toast.error(err?.message || 'Failed to accept job.');
    } finally {
      setAcceptingId(null);
    }
  };

  // Admin / auto-assigned jobs are in 'Assigned' state and must be accepted by the partner
  const handleAcceptAssigned = async (job) => {
    setAcceptingId(job._id);
    try {
      await acceptBooking(job._id);
      await refetchAll();
    } catch {
      // API errors are already toasted by the axios interceptor
    } finally {
      setAcceptingId(null);
    }
  };

  const handleViewDetailsClick = async (job) => {
    setFetchingDetailsId(job._id);
    try {
      const res = await partnerService.getBookingDetails(job._id);
      const full = res?.data?.data || res?.data;
      onOpenFulfillment?.(full || job);
    } catch {
      // Fall back to the row data so the partner can still open the job
      onOpenFulfillment?.(job);
    } finally {
      setFetchingDetailsId(null);
    }
  };

  const getStatusBadge = (job) => {
    const s = String(job?.status || '').toLowerCase();
    const badge = (cls, Icon, label) => (
      <span className={`badge ${cls}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
        <Icon size={12} /> {label}
      </span>
    );

    if (isCancelledForPartner(job)) {
      const byPartner = job.cancelledBy === 'partner' || (Array.isArray(job.cancelledByPartners) && job.cancelledByPartners.some((p) => String(p?._id || p) === currentPartnerId));
      const who = byPartner ? 'by Partner' : job.cancelledBy === 'customer' ? 'by Customer' : job.cancelledBy === 'admin' ? 'by Admin' : '';
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
          {badge('badge-danger', XCircle, who ? `CANCELLED ${who.toUpperCase()}` : 'CANCELLED')}
          {job.cancellationReason && (
            <div style={{ fontSize: '0.72rem', color: '#64748b', maxWidth: '170px', lineHeight: 1.3 }}>
              {job.cancellationReason}
            </div>
          )}
        </div>
      );
    }
    if (s === 'completed') return badge('badge-success', CheckCircle2, 'COMPLETED');
    if (s === 'started' || s === 'in_progress') return badge('badge-blue', Play, 'IN PROGRESS');
    if (s === 'on the way' || s === 'on_the_way') return badge('badge-purple', Navigation, 'ON THE WAY');
    if (s === 'accepted') return badge('badge-blue', Clock, 'ACCEPTED');
    if (s === 'assigned') return badge('badge-purple', User, 'ASSIGNED');
    if (s === 'pending') return badge('badge-warning', Clock, 'OPEN OFFER');
    return badge('badge-warning', Clock, String(job?.status || 'UNKNOWN').toUpperCase());
  };

  const tabs = [
    { id: 'all', label: 'All', icon: Layers, color: '#2563eb' },
    { id: 'upcoming', label: 'Upcoming Offers', icon: Clock, color: '#0284c7' },
    { id: 'accepted', label: 'Active', icon: CalendarCheck, color: '#7c3aed' },
    { id: 'completed', label: 'Completed', icon: CheckCircle2, color: '#16a34a' },
    { id: 'cancelled', label: 'Cancelled', icon: XCircle, color: '#dc2626' },
  ];

  return (
    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(15,23,42,0.04)' }}>
      {/* Header + search */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', margin: 0, color: '#0f172a' }}>
            <CalendarCheck size={20} color="#7c3aed" /> My Jobs
          </h3>
          <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '4px 0 0 0', fontWeight: '500' }}>
            Accept new requests, track progress and complete jobs with customer OTP verification.
          </p>
        </div>

        <div style={{ position: 'relative', width: '280px', maxWidth: '100%' }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="search"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            placeholder="Search ref, customer, service…"
            aria-label="Search bookings"
            style={{ width: '100%', padding: '9px 12px 9px 36px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.84rem', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px', overflowX: 'auto', paddingBottom: '4px' }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabClick(tab.id)}
              style={{
                padding: '8px 14px',
                borderRadius: '10px',
                fontSize: '0.83rem',
                fontWeight: '700',
                border: `1px solid ${isActive ? tab.color : '#e2e8f0'}`,
                background: isActive ? `${tab.color}12` : '#ffffff',
                color: isActive ? tab.color : '#475569',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                whiteSpace: 'nowrap',
              }}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
              <span style={{ background: isActive ? tab.color : '#f1f5f9', color: isActive ? '#ffffff' : '#475569', padding: '1px 8px', borderRadius: '20px', fontSize: '0.74rem', fontWeight: '800' }}>
                {lists[tab.id].length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '860px' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '800' }}>
              <th style={{ ...th, width: '56px' }}>Sr. No.</th>
              <th style={th}>Booking Ref</th>
              <th style={th}>Customer</th>
              <th style={th}>Service</th>
              <th style={th}>Schedule & Location</th>
              <th style={th}>Payout</th>
              <th style={th}>Status</th>
              <th style={th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && filteredJobs.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '36px', textAlign: 'center', color: '#64748b', fontWeight: '600' }}>
                  <Loader2 size={18} className="spin" style={{ verticalAlign: 'middle', marginRight: '8px' }} /> Loading bookings…
                </td>
              </tr>
            ) : filteredJobs.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '44px 16px', textAlign: 'center', color: '#64748b' }}>
                  <Inbox size={30} color="#cbd5e1" style={{ display: 'block', margin: '0 auto 8px' }} />
                  <div style={{ fontWeight: '700' }}>{query ? 'No bookings match your search.' : EMPTY_MESSAGES[activeTab]}</div>
                </td>
              </tr>
            ) : (
              pageJobs.map((job, idx) => {
                const { pkg, fee, net } = getPayout(job);
                const date = formatDate(job.bookingDate);
                const slot = getSlotTime(job.timeSlot || job.bookingTimeSlot);
                const addr = formatAddress(job);
                const status = String(job.status || '').toLowerCase();
                const isOpenOffer = activeTab === 'upcoming' || (status === 'pending' && !job.partner);
                const canCancel = CANCELLABLE_STATUSES.includes(status) && !isCancelledForPartner(job);
                const isFetching = fetchingDetailsId === job._id;

                return (
                  <tr key={job._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ ...td, color: '#64748b', fontWeight: '700', fontSize: '0.86rem' }}>{pageStart + idx + 1}</td>
                    <td style={{ ...td, fontWeight: '800', color: '#6d28d9', fontSize: '0.86rem', whiteSpace: 'nowrap' }}>{bookingRef(job)}</td>
                    <td style={{ ...td, fontWeight: '700', fontSize: '0.86rem', color: '#0f172a' }}>{job.customer?.name || '—'}</td>
                    <td style={{ ...td, fontWeight: '700', fontSize: '0.86rem', color: '#0f172a' }}>
                      {job.packageName || job.service?.name || job.serviceName || '—'}
                    </td>
                    <td style={{ ...td, fontSize: '0.82rem', color: '#334155', minWidth: '170px' }}>
                      <div style={{ color: '#0f172a', fontWeight: '700' }}>
                        {[date, slot].filter(Boolean).join(' • ') || 'Schedule not set'}
                      </div>
                      {addr && (
                        <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'flex-start', gap: '4px', marginTop: '3px', lineHeight: 1.35 }}>
                          <MapPin size={13} color="#0284c7" style={{ flexShrink: 0, marginTop: '2px' }} /> <span>{addr}</span>
                        </div>
                      )}
                    </td>
                    <td style={{ ...td, minWidth: '120px' }}>
                      {net != null ? (
                        <>
                          <div style={{ fontSize: '0.92rem', fontWeight: '800', color: '#15803d' }}>
                            {formatINR(net)} <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#16a34a' }}>net</span>
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: '600', marginTop: '2px' }}>
                            Pkg {formatINR(pkg)}{fee != null ? ` • Fee −${formatINR(fee)}` : ''}
                          </div>
                        </>
                      ) : (
                        <div style={{ fontSize: '0.86rem', fontWeight: '700', color: '#475569' }}>{pkg != null ? formatINR(pkg) : '—'}</div>
                      )}
                    </td>
                    <td style={td}>{getStatusBadge(job)}</td>
                    <td style={{ ...td, width: '104px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'stretch' }}>
                        {isOpenOffer && !isCancelledForPartner(job) && (
                          <button
                            type="button"
                            onClick={() => handleAcceptJob(job)}
                            disabled={acceptingId === job._id}
                            className="btn btn-success btn-sm"
                            style={{ borderRadius: '10px', padding: '6px 12px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                          >
                            {acceptingId === job._id ? <Loader2 size={12} className="spin" /> : <CheckCircle2 size={13} />} Accept
                          </button>
                        )}
                        {status === 'assigned' && !isCancelledForPartner(job) && (
                          <button
                            type="button"
                            onClick={() => handleAcceptAssigned(job)}
                            disabled={acceptingId === job._id}
                            className="btn btn-success btn-sm"
                            style={{ borderRadius: '10px', padding: '6px 12px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                          >
                            {acceptingId === job._id ? <Loader2 size={12} className="spin" /> : <CheckCircle2 size={13} />} Accept
                          </button>
                        )}
                        {canCancel && (
                          <button
                            type="button"
                            onClick={() => { setSelectedCancelJob(job); setCancelModalOpen(true); }}
                            style={{ borderRadius: '10px', padding: '6px 12px', fontWeight: '700', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '5px', border: '1px solid #fca5a5', color: '#dc2626', background: '#fef2f2', cursor: 'pointer' }}
                          >
                            <XCircle size={13} /> Cancel
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleViewDetailsClick(job)}
                          disabled={isFetching}
                          className="btn btn-primary btn-sm"
                          style={{ borderRadius: '10px', padding: '6px 12px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '5px', whiteSpace: 'nowrap' }}
                        >
                          {isFetching ? <Loader2 size={12} className="spin" /> : <Navigation size={12} />} View
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

      {/* Pagination */}
      {filteredJobs.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginTop: '16px' }}>
          <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: '600' }}>
            Showing {pageStart + 1}–{Math.min(pageStart + PAGE_SIZE, filteredJobs.length)} of {filteredJobs.length}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setPage(safePage - 1)}
              disabled={safePage <= 1}
              aria-label="Previous page"
              style={{ width: '34px', height: '34px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#ffffff', cursor: safePage <= 1 ? 'default' : 'pointer', opacity: safePage <= 1 ? 0.45 : 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#334155', minWidth: '84px', textAlign: 'center' }}>
              Page {safePage} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage(safePage + 1)}
              disabled={safePage >= totalPages}
              aria-label="Next page"
              style={{ width: '34px', height: '34px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#ffffff', cursor: safePage >= totalPages ? 'default' : 'pointer', opacity: safePage >= totalPages ? 0.45 : 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      <PartnerCancelBookingModal
        isOpen={cancelModalOpen}
        booking={selectedCancelJob}
        onClose={() => {
          setCancelModalOpen(false);
          setSelectedCancelJob(null);
        }}
        onSuccess={async () => {
          setCancelModalOpen(false);
          setSelectedCancelJob(null);
          await refetchAll();
        }}
      />
    </div>
  );
};

export default PartnerJobsTable;
