import React, { useState, useEffect } from 'react';
import DedicatedPartnerNavbar from '../components/partner/DedicatedPartnerNavbar';
import DedicatedPartnerSidebar from '../components/partner/DedicatedPartnerSidebar';
import PartnerKycStatusView from '../components/partner/PartnerKycStatusView';
import PartnerMetricCards from '../components/partner/PartnerMetricCards';
import PartnerWalletCard from '../components/partner/PartnerWalletCard';
import PartnerJobsTable from '../components/partner/PartnerJobsTable';
import TechnicianGreetingHeader from '../components/partner/TechnicianGreetingHeader';
import UpcomingBookingCard from '../components/partner/UpcomingBookingCard';
import PartnerQuickActions from '../components/partner/PartnerQuickActions';
import OnlineOfflineModal from '../components/partner/OnlineOfflineModal';
import IncomingJobOfferModal from '../components/partner/IncomingJobOfferModal';
import PartnerFulfillmentPage from './partner/PartnerFulfillmentPage';
import { socketService } from '../services/socket.service.js';
import { partnerService } from '../services/partner.service.js';
import { usePartner } from '../hooks/usePartner.js';
import { toast } from '../utils/toast.js';
import {
  Users,
  Calendar,
  Star,
  FileText,
  Headphones,
  User,
  Upload,
  Lock,
  ZapOff,
} from 'lucide-react';

const DedicatedPartnerPanel = ({ currentUser, onLogout }) => {
  const { dashboard, todayBookings, updateAvailability, refetch } = usePartner();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [refreshing, setRefreshing] = useState(false);

  // Online / Offline Status State
  const [isOnline, setIsOnline] = useState(currentUser?.isOnline ?? true);
  const [onlineModalOpen, setOnlineModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  // Real-Time Incoming Job Offer State
  const [currentJobOffer, setCurrentJobOffer] = useState(null);
  const [claimingJob, setClaimingJob] = useState(false);

  // Dedicated Full-Page Fulfillment Booking State
  const [activeFulfillmentBooking, setActiveFulfillmentBooking] = useState(null);

  const handleOpenFulfillment = (b) => {
    setActiveFulfillmentBooking(b);
  };

  const kycStatus = dashboard?.kycStatus || currentUser?.kycStatus || 'pending';
  const isApproved = kycStatus === 'approved';

  // Real-Time Socket.io Connection Effect
  useEffect(() => {
    if (!isApproved || !isOnline || !currentUser?._id) return;

    socketService.connect();
    socketService.joinPartner({
      partnerId: currentUser._id,
      category: currentUser.category || 'AC & Appliance Repair',
      city: currentUser.assignedCity || currentUser.city || 'Delhi NCR',
    });

    // Listen for new real-time job offers
    socketService.onNewJobOffer((offer) => {
      console.log('⚡ Received real-time job offer:', offer);
      setCurrentJobOffer(offer);
    });

    // Listen when another partner claims the job
    socketService.onJobClaimed((data) => {
      if (data.claimedByPartnerId !== currentUser._id) {
        toast.info(data.message || 'Job was claimed by another technician.');
        setCurrentJobOffer((prev) => (prev && prev.bookingId === data.bookingId ? null : prev));
      }
    });

    return () => {
      socketService.off('new_job_offer');
      socketService.off('job_claimed');
    };
  }, [isApproved, isOnline, currentUser?._id, currentUser?.category, currentUser?.city, currentUser?.assignedCity]);

  const handleAcceptJobOffer = (offer) => {
    if (!offer || !currentUser?._id) return;
    setClaimingJob(true);

    socketService.claimJob(
      { bookingId: offer.bookingId, partnerId: currentUser._id },
      async (res) => {
        setClaimingJob(false);
        if (res && res.success) {
          toast.success(res.message || '🎉 Job successfully claimed & assigned to you!');
          setCurrentJobOffer(null);
          refetch();
        } else {
          toast.error(res?.message || 'Job already claimed by another technician!');
          setCurrentJobOffer(null);
        }
      }
    );
  };

  const handleDeclineJobOffer = () => {
    setCurrentJobOffer(null);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    refetch();
    setTimeout(() => setRefreshing(false), 600);
  };

  const handleOpenOnlineModal = () => {
    setOnlineModalOpen(true);
  };

  const handleConfirmToggleOnline = async () => {
    const nextStatus = !isOnline;
    setModalLoading(true);

    try {
      if (updateAvailability) {
        await updateAvailability({ isOnline: nextStatus });
      }
      setIsOnline(nextStatus);
      toast.success(
        nextStatus
          ? '⚡ You are now ONLINE! High-paying booking requests active.'
          : '🌙 You are now OFFLINE. Booking requests paused.'
      );
    } catch (err) {
      // Fallback local toggle if server fails
      setIsOnline(nextStatus);
    } finally {
      setModalLoading(false);
      setOnlineModalOpen(false);
    }
  };

  if (activeFulfillmentBooking) {
    return (
      <PartnerFulfillmentPage
        booking={activeFulfillmentBooking}
        currentUser={currentUser}
        onBack={() => setActiveFulfillmentBooking(null)}
        onComplete={() => {
          refetch();
          setActiveFulfillmentBooking(null);
        }}
      />
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      
      {/* Header with Live KYC Status Badge & Online Toggle */}
      <DedicatedPartnerNavbar
        currentUser={currentUser}
        onLogout={onLogout}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        kycStatus={kycStatus}
        isOnline={isOnline}
        onToggleOnlineClick={handleOpenOnlineModal}
      />

      {/* Main Layout */}
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 74px)' }}>
        
        {/* Dynamic Partner Sidebar */}
        <DedicatedPartnerSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLogout={onLogout}
          kycStatus={kycStatus}
          currentUser={currentUser}
        />

        {/* Main Content View */}
        <main style={{ flex: 1, padding: '28px 32px', overflowX: 'hidden' }}>
          
          {/* View Title Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0 }}>
                {activeTab === 'dashboard' && 'Technician Earnings & Bookings Overview'}
                {activeTab === 'kycStatus' && 'Technician KYC Verification Status'}
                {activeTab === 'bookings' && 'Assigned Customer Jobs & Earnings'}
                {activeTab === 'calendar' && 'Service Schedule & Work Calendar'}
                {activeTab === 'availability' && 'Service Operating Hours & Availability'}
                {activeTab === 'wallet' && 'Technician E-Wallet & Direct Bank Settlements'}
                {activeTab === 'transactions' && 'Payout & Earnings Ledger'}
                {activeTab === 'reviews' && 'Customer Ratings & Reviews'}
                {activeTab === 'documents' && 'Aadhaar, PAN & ID Verification Documents'}
                {activeTab === 'support' && 'Technician Priority Helpdesk'}
                {activeTab === 'profile' && 'Service Technician Partner Profile'}
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {currentUser?.name || 'Service Partner'} ({currentUser?.category || 'Technician'}) • {currentUser?.assignedCity || currentUser?.city || 'Delhi NCR'} Zone
              </p>
            </div>
          </div>

          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <>
              {!isApproved ? (
                /* PENDING KYC RESTRICTED DASHBOARD VIEW */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div style={{
                    padding: '20px 24px',
                    background: '#fffbe6',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid #fef08a',
                    color: '#92400e',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <Lock size={28} color="#d97706" />
                      <div>
                        <div style={{ fontWeight: '800', fontSize: '1rem' }}>Your technician account is under verification.</div>
                        <div style={{ fontSize: '0.82rem', opacity: 0.9 }}>
                          Bookings, Work Calendar, Wallet Payouts, and Ratings will unlock as soon as City Admin approves your KYC.
                        </div>
                      </div>
                    </div>
                    <button onClick={() => setActiveTab('kycStatus')} className="btn btn-primary btn-sm">
                      Check KYC Status
                    </button>
                  </div>

                  <PartnerKycStatusView
                    kycStatus={kycStatus}
                    partnerData={currentUser}
                  />
                </div>
              ) : (
                /* FULL UNLOCKED DASHBOARD VIEW */
                <>
                  {/* Greeting & Technician Code Banner */}
                  <TechnicianGreetingHeader
                    currentUser={currentUser}
                    isOnline={isOnline}
                    onToggleOnlineClick={handleOpenOnlineModal}
                  />

                  {/* Offline Warning Banner if Technician is Offline */}
                  {!isOnline && (
                    <div
                      style={{
                        padding: '16px 20px',
                        background: '#fef2f2',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid #fecaca',
                        color: '#991b1b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '24px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <ZapOff size={24} color="#dc2626" />
                        <div>
                          <div style={{ fontWeight: '800', fontSize: '0.95rem' }}>You are currently Offline</div>
                          <div style={{ fontSize: '0.82rem', opacity: 0.9 }}>
                            Switch back Online to start receiving instant booking dispatches near your area.
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleOpenOnlineModal}
                        className="btn btn-sm"
                        style={{ background: '#16a34a', color: '#ffffff', fontWeight: '700', borderRadius: '10px', padding: '8px 16px', border: 'none' }}
                      >
                        Go Online Now
                      </button>
                    </div>
                  )}

                  {/* 1. Today's Stats Row */}
                  <PartnerMetricCards />

                  {/* 2. Upcoming Active Booking Card */}
                  <UpcomingBookingCard
                    booking={todayBookings && todayBookings.length > 0 ? todayBookings[0] : null}
                    onViewAllClick={() => setActiveTab('bookings')}
                    onOpenFulfillment={handleOpenFulfillment}
                  />

                  {/* 3. Wallet Balance Card */}
                  <PartnerWalletCard />

                  {/* 4. Quick Actions Grid */}
                  <PartnerQuickActions
                    onNavigateTab={(tab) => setActiveTab(tab)}
                  />

                  {/* All Customer Jobs Table */}
                  <div style={{ marginTop: '28px' }}>
                    <PartnerJobsTable onOpenFulfillment={handleOpenFulfillment} />
                  </div>
                </>
              )}
            </>
          )}

          {/* TAB 2: KYC STATUS */}
          {activeTab === 'kycStatus' && (
            <PartnerKycStatusView
              kycStatus={kycStatus}
              partnerData={currentUser}
            />
          )}

          {/* TAB 3: DOCUMENTS */}
          {activeTab === 'documents' && (
            <div className="mui-card" style={{ padding: '26px', maxWidth: '600px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={20} color="#7c3aed" /> Uploaded ID Verification Documents
                </h3>
                <button className="btn btn-secondary btn-sm"><Upload size={14} /> Upload New Doc</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {['Aadhaar Card (Front & Back)', 'PAN Card Document', 'Bank Passbook / Cancelled Cheque'].map((doc, idx) => (
                  <div key={idx} style={{ padding: '14px', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: '600' }}>{doc}</span>
                    <span className={`badge ${isApproved ? 'badge-success' : 'badge-warning'}`}>
                      {isApproved ? 'VERIFIED' : 'PENDING REVIEW'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: SUPPORT */}
          {activeTab === 'support' && (
            <div className="mui-card" style={{ padding: '26px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Headphones size={20} color="#2563eb" /> Technician Partner Helpdesk
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Need help with job dispatch or KYC verification? Contact City Operations Manager at <strong>+91 1800 200 9090</strong>.
              </p>
            </div>
          )}

          {/* TAB 5: PROFILE */}
          {activeTab === 'profile' && (
            <div className="mui-card" style={{ padding: '26px', maxWidth: '500px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={20} color="#7c3aed" /> Service Technician Partner Profile
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #ec4899)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1.2rem' }}>
                  {(currentUser?.name || 'T')[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: '800' }}>{currentUser?.name || 'Service Technician'}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Skill: {currentUser?.category || 'Individual Professional'}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{currentUser?.email}</div>
                  <span className={`badge ${isApproved ? 'badge-success' : 'badge-warning'}`} style={{ marginTop: '6px' }}>
                    {isApproved ? 'VERIFIED INDIVIDUAL TECHNICIAN' : 'KYC PENDING APPROVAL'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* UNLOCKED TABS */}
          {isApproved && (
            <>
              {activeTab === 'bookings' && <PartnerJobsTable onOpenFulfillment={handleOpenFulfillment} />}
              {activeTab === 'wallet' && <PartnerWalletCard />}
              {activeTab === 'workers' && (
                <div className="mui-card" style={{ padding: '26px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={20} color="#7c3aed" /> Field Technicians Roster
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                    {['Rajesh Kumar (AC Specialist)', 'Amitabh Verma (Plumber)', 'Sunil Malhotra (Electrician)', 'Vikram Das (Cleaner)'].map((w, i) => (
                      <div key={i} style={{ padding: '14px', background: '#f8fafc', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ fontWeight: '700', fontSize: '0.88rem' }}>{w}</div>
                        <span className="badge badge-success" style={{ marginTop: '4px' }}>ACTIVE</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {activeTab === 'calendar' && (
                <div className="mui-card" style={{ padding: '26px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={20} color="#2563eb" /> Job Schedule & Dispatch Calendar
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Interactive calendar dispatch view.</p>
                </div>
              )}
              {activeTab === 'reviews' && (
                <div className="mui-card" style={{ padding: '26px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Star size={20} color="#f59e0b" /> Customer Ratings & Reviews
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Live Customer Reviews Received.</p>
                </div>
              )}
            </>
          )}

        </main>

      </div>

      {/* ONLINE / OFFLINE TOGGLE MODAL */}
      <OnlineOfflineModal
        isOpen={onlineModalOpen}
        targetStatus={!isOnline}
        onClose={() => setOnlineModalOpen(false)}
        onConfirm={handleConfirmToggleOnline}
        loading={modalLoading}
      />

      {/* REAL-TIME INCOMING JOB REQUEST MODAL */}
      <IncomingJobOfferModal
        offer={currentJobOffer}
        onAccept={(offer) => {
          handleAcceptJobOffer(offer);
        }}
        onDecline={handleDeclineJobOffer}
        claiming={claimingJob}
      />

    </div>
  );
};

export default DedicatedPartnerPanel;
