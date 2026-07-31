import React, { useState } from 'react';
import DedicatedPartnerNavbar from '../components/partner/DedicatedPartnerNavbar';
import DedicatedPartnerSidebar from '../components/partner/DedicatedPartnerSidebar';
import PartnerKycStatusView from '../components/partner/PartnerKycStatusView';
import PartnerMetricCards from '../components/partner/PartnerMetricCards';
import PartnerWalletCard from '../components/partner/PartnerWalletCard';
import PartnerJobsTable from '../components/partner/PartnerJobsTable';
import { usePartner } from '../hooks/usePartner.js';
import {
  Users,
  Calendar,
  Star,
  FileText,
  Headphones,
  User,
  Upload,
  Lock,
} from 'lucide-react';

const DedicatedPartnerPanel = ({ currentUser, onLogout }) => {
  const { dashboard, refetch } = usePartner();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [refreshing, setRefreshing] = useState(false);

  const kycStatus = dashboard?.kycStatus || currentUser?.kycStatus || 'pending';
  const isApproved = kycStatus === 'approved';

  const handleRefresh = () => {
    setRefreshing(true);
    refetch();
    setTimeout(() => setRefreshing(false), 600);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      
      {/* Header with Live KYC Status Badge */}
      <DedicatedPartnerNavbar
        currentUser={currentUser}
        onLogout={onLogout}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        kycStatus={kycStatus}
      />

      {/* Main Layout */}
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 74px)' }}>
        
        {/* Dynamic Partner Sidebar */}
        <DedicatedPartnerSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLogout={onLogout}
          kycStatus={kycStatus}
        />

        {/* Main Content View */}
        <main style={{ flex: 1, padding: '28px 32px', overflowX: 'hidden' }}>
          
          {/* View Title Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0 }}>
                {activeTab === 'dashboard' && 'Partner Marketplace Operations Overview'}
                {activeTab === 'kycStatus' && 'Partner KYC Verification & Approval Status'}
                {activeTab === 'workers' && 'Field Technicians Roster'}
                {activeTab === 'bookings' && 'Assigned Customer Service Bookings'}
                {activeTab === 'calendar' && 'Service Schedule & Calendar Dispatch'}
                {activeTab === 'availability' && 'Service Operating Hours & Availability'}
                {activeTab === 'wallet' && 'Partner E-Wallet & Bank Settlements'}
                {activeTab === 'transactions' && 'Payout & Withdrawal Transaction Ledger'}
                {activeTab === 'reviews' && 'Customer Ratings & Reviews'}
                {activeTab === 'documents' && 'GST, Trade License & Compliance Documents'}
                {activeTab === 'support' && 'Partner Priority Helpdesk'}
                {activeTab === 'profile' && 'Agency Business Profile'}
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {currentUser?.agencyName || 'Service Partner Agency'} • {currentUser?.assignedCity || 'Delhi NCR'} Operational Zone
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
                        <div style={{ fontWeight: '800', fontSize: '1rem' }}>Your account is under verification.</div>
                        <div style={{ fontSize: '0.82rem', opacity: 0.9 }}>
                          Bookings, Calendar, Wallet, and Customer Reviews are hidden until City Admin approves your KYC.
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
                  <PartnerMetricCards />
                  <PartnerWalletCard />
                  <PartnerJobsTable />
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
                  <FileText size={20} color="#7c3aed" /> Uploaded Compliance Documents
                </h3>
                <button className="btn btn-secondary btn-sm"><Upload size={14} /> Upload New Doc</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {['GST Registration Certificate (GSTIN)', 'Agency Business Trade License', 'Police Background Check Clearance'].map((doc, idx) => (
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
                <Headphones size={20} color="#2563eb" /> Partner Onboarding Priority Helpdesk
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Need help with KYC document verification? Contact your City Operations Manager at <strong>+91 1800 200 9090</strong>.
              </p>
            </div>
          )}

          {/* TAB 5: PROFILE */}
          {activeTab === 'profile' && (
            <div className="mui-card" style={{ padding: '26px', maxWidth: '500px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={20} color="#7c3aed" /> Business Partner Agency Profile
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #ec4899)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1.2rem' }}>
                  P
                </div>
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: '800' }}>{currentUser?.agencyName || currentUser?.name || 'Partner Agency'}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{currentUser?.email}</div>
                  <span className={`badge ${isApproved ? 'badge-success' : 'badge-warning'}`} style={{ marginTop: '4px' }}>
                    {isApproved ? 'VERIFIED MARKETPLACE PARTNER' : 'KYC PENDING APPROVAL'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* UNLOCKED TABS */}
          {isApproved && (
            <>
              {activeTab === 'bookings' && <PartnerJobsTable />}
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

    </div>
  );
};

export default DedicatedPartnerPanel;
