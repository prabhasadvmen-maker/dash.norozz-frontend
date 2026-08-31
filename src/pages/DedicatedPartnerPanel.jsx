import { useState, useEffect } from 'react';
import DedicatedPartnerNavbar from '../components/partner/DedicatedPartnerNavbar';
import DedicatedPartnerSidebar from '../components/partner/DedicatedPartnerSidebar';
import PartnerMetricCards from '../components/partner/PartnerMetricCards';
import PartnerWalletCard from '../components/partner/PartnerWalletCard';
import PartnerJobsTable from '../components/partner/PartnerJobsTable';
import TechnicianGreetingHeader from '../components/partner/TechnicianGreetingHeader';
import UpcomingBookingCard from '../components/partner/UpcomingBookingCard';
import PartnerQuickActions from '../components/partner/PartnerQuickActions';
import OnlineOfflineModal from '../components/partner/OnlineOfflineModal';
import IncomingJobOfferModal from '../components/partner/IncomingJobOfferModal';
import PartnerFulfillmentPage from './partner/PartnerFulfillmentPage';
import PartnerProfileView from '../components/partner/PartnerProfileView';
import { socketService } from '../services/socket.service.js';
import { cityService } from '../services/city.service.js';
import { catalogService } from '../services/catalog.service.js';
import { usePartner } from '../hooks/usePartner.js';
import { toast } from '../utils/toast.js';
import {
  Users,
  Calendar,
  Star,
  Headphones,
  Lock,
  ZapOff,
} from 'lucide-react';

const DedicatedPartnerPanel = ({ currentUser, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { dashboard, todayBookings, updateAvailability, refetchAll } = usePartner(activeTab);
  const [refreshing, setRefreshing] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

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

  const initialCityName = (typeof currentUser?.assignedCity === 'object' && currentUser?.assignedCity?.name)
    ? currentUser.assignedCity.name
    : (currentUser?.city || (typeof currentUser?.assignedCity === 'string' && !currentUser.assignedCity.match(/^[0-9a-fA-F]{24}$/) ? currentUser.assignedCity : 'Delhi NCR'));

  const [resolvedCityName, setResolvedCityName] = useState(initialCityName);

  const [resolvedCategoryNames, setResolvedCategoryNames] = useState(() => {
    if (Array.isArray(currentUser?.categories) && currentUser.categories.length > 0) {
      const names = currentUser.categories
        .map((c) => (typeof c === 'object' && c?.name ? c.name : null))
        .filter(Boolean);
      if (names.length > 0) return names.join(' • ');
    }
    if (typeof currentUser?.category === 'object' && currentUser?.category?.name) {
      return currentUser.category.name;
    }
    if (typeof currentUser?.category === 'string' && !currentUser.category.match(/^[0-9a-fA-F]{24}$/)) {
      return currentUser.category;
    }
    return '';
  });

  useEffect(() => {
    const raw = currentUser?.assignedCity || currentUser?.city;
    if (typeof raw === 'string' && raw.match(/^[0-9a-fA-F]{24}$/)) {
      cityService.getActiveCities().then((res) => {
        const list = res.data?.data || res.data || [];
        const match = list.find((c) => String(c._id) === String(raw));
        if (match?.name) setResolvedCityName(match.name);
      }).catch(() => {});
    }

    catalogService.getCategories().then((res) => {
      const list = res.data?.data || res.data || [];
      if (Array.isArray(list) && list.length > 0) {
        const rawCats = Array.isArray(currentUser?.categories) && currentUser.categories.length > 0
          ? currentUser.categories
          : (currentUser?.category ? [currentUser.category] : []);

        const catIds = rawCats.map((c) => (typeof c === 'object' ? c._id || c.id : c));

        const matchedNames = [];
        catIds.forEach((id) => {
          const found = list.find((cat) => String(cat._id) === String(id) || String(cat.id) === String(id));
          if (found?.name && !matchedNames.includes(found.name)) {
            matchedNames.push(found.name);
          }
        });

        if (matchedNames.length > 0) {
          setResolvedCategoryNames(matchedNames.join(' • '));
        }
      }
    }).catch(() => {});
  }, [currentUser]);

  // Real-Time Socket.io Connection Effect
  useEffect(() => {
    if (!currentUser?._id) return;

    const socket = socketService.connect();
    socketService.joinPartner({
      partnerId: currentUser._id,
      category: currentUser.category || 'AC & Appliance Repair',
      city: resolvedCityName,
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

    // Background Chat Listener: Notify partner when customer sends a message even if chat modal is closed
    const handleIncomingChatMessage = (msgPayload) => {
      if (msgPayload && msgPayload.sender !== currentUser._id) {
        toast.info(`💬 Message from ${msgPayload.senderName || 'Customer'}: "${msgPayload.message}"`, {
          duration: 6000,
        });
      }
    };

    socket.on('new_chat_message', handleIncomingChatMessage);
    socket.on('new_chat_notification', handleIncomingChatMessage);

    return () => {
      socketService.off('new_job_offer');
      socketService.off('job_claimed');
      socket.off('new_chat_message', handleIncomingChatMessage);
      socket.off('new_chat_notification', handleIncomingChatMessage);
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
    } catch {
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
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#f8fafc', color: '#0f172a' }}>
      
      {/* Dynamic Partner Sidebar */}
      <DedicatedPartnerSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={onLogout}
        kycStatus={kycStatus}
        currentUser={currentUser}
        collapsed={collapsed}
      />

      {/* Main Right Column Container */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh', overflow: 'hidden' }}>

        {/* Header with Live KYC Status Badge & Online Toggle */}
        <DedicatedPartnerNavbar
          currentUser={currentUser}
          cityName={resolvedCityName}
          categoryNames={resolvedCategoryNames}
          onLogout={onLogout}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          kycStatus={kycStatus}
          isOnline={isOnline}
          onToggleOnlineClick={handleOpenOnlineModal}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />

        {/* Main Content View */}
        <main style={{ flex: 1, padding: '28px 32px', overflowY: 'auto', overflowX: 'hidden' }}>
          
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
                {activeTab === 'bankDetails' && 'Bank Account & UPI Payout Settings'}
                {activeTab === 'referral' && 'Technician Referral & Earn Program'}
                {activeTab === 'editProfile' && 'Edit Service Technician Profile'}
                {activeTab === 'settings' && 'Technician Portal Preferences & Security Settings'}
                {activeTab === 'support' && 'Technician Priority Helpdesk'}
                {activeTab === 'profile' && 'Service Technician Partner Profile'}
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {currentUser?.name || 'Service Partner'} ({resolvedCategoryNames || 'Technician'}) • {resolvedCityName} Zone
              </p>
            </div>
          </div>

          {/* TAB: DASHBOARD */}
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
                          Bookings, Work Calendar, and Ratings will unlock as soon as City Admin approves your KYC.
                        </div>
                      </div>
                    </div>
                    <button onClick={() => setActiveTab('profile')} className="btn btn-primary btn-sm">
                      View Profile & KYC Details
                    </button>
                  </div>

                  <PartnerProfileView partnerData={currentUser} initialSubTab="overview" onTabChange={(t) => setActiveTab(t)} />
                </div>
              ) : (
                /* FULL UNLOCKED DASHBOARD VIEW */
                <>
                  {/* Greeting & Technician Code Banner */}
                  <TechnicianGreetingHeader
                    currentUser={currentUser}
                    categoryNames={resolvedCategoryNames}
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

          {/* TAB: SUPPORT */}
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

          {/* PROFILE & SUB TABS (PROFILE, EDIT PROFILE, DOCUMENTS, BANK DETAILS, REFERRAL, WALLET, SETTINGS) */}
          {activeTab === 'profile' && <PartnerProfileView partnerData={currentUser} initialSubTab="overview" onTabChange={(t) => setActiveTab(t)} />}
          {activeTab === 'editProfile' && <PartnerProfileView partnerData={currentUser} initialSubTab="edit" onTabChange={(t) => setActiveTab(t)} />}
          {activeTab === 'documents' && <PartnerProfileView partnerData={currentUser} initialSubTab="documents" onTabChange={(t) => setActiveTab(t)} />}
          {activeTab === 'bankDetails' && <PartnerProfileView partnerData={currentUser} initialSubTab="bank" onTabChange={(t) => setActiveTab(t)} />}
          {activeTab === 'referral' && <PartnerProfileView partnerData={currentUser} initialSubTab="referral" onTabChange={(t) => setActiveTab(t)} />}
          {activeTab === 'wallet' && <PartnerProfileView partnerData={currentUser} initialSubTab="wallet" onTabChange={(t) => setActiveTab(t)} />}
          {activeTab === 'settings' && <PartnerProfileView partnerData={currentUser} initialSubTab="settings" onTabChange={(t) => setActiveTab(t)} />}

          {/* UNLOCKED TABS FOR APPROVED PARTNERS */}
          {isApproved && (
            <>
              {activeTab === 'bookings' && <PartnerJobsTable onOpenFulfillment={handleOpenFulfillment} />}
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
