import { useState, useEffect } from 'react';
import DedicatedCityNavbar from '../components/cityAdmin/DedicatedCityNavbar';
import DedicatedCitySidebar from '../components/cityAdmin/DedicatedCitySidebar';
import CityMetricCards from '../components/cityAdmin/CityMetricCards';
import CityCharts from '../components/cityAdmin/CityCharts';
import PartnerKycManagement from '../components/cityAdmin/PartnerKycManagement';
import PartnerKycDetailPage from '../components/cityAdmin/PartnerKycDetailPage';
import CityBookingDispatch from '../components/cityAdmin/CityBookingDispatch';
import { useCityAdmin } from '../hooks/useCityAdmin.js';
import { cityService } from '../services/city.service.js';
import {
  Briefcase,
  CreditCard,
  BarChart3,
  Headphones,
  User,
  Eye
} from 'lucide-react';

const CityAdminPanel = ({ currentUser, onLogout }) => {
  const { partners, revenue, refetch, approvePartner, rejectPartner, updateDocumentStatus, suspendPartner, activatePartner } = useCityAdmin();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [partnerModalOpen, setPartnerModalOpen] = useState(false);

  const partnersCount = partners.length;
  const pendingKycCount = partners.filter((p) => (p.kycStatus || 'pending').toLowerCase() === 'pending').length;

  const initialCityName = (typeof currentUser?.assignedCity === 'object' && currentUser?.assignedCity?.name)
    ? currentUser.assignedCity.name
    : (currentUser?.city || (typeof currentUser?.assignedCity === 'string' && !currentUser.assignedCity.match(/^[0-9a-fA-F]{24}$/) ? currentUser.assignedCity : 'Delhi NCR'));

  const [assignedCity, setAssignedCity] = useState(initialCityName);

  useEffect(() => {
    const raw = currentUser?.assignedCity || currentUser?.city;
    if (typeof raw === 'string' && raw.match(/^[0-9a-fA-F]{24}$/)) {
      cityService.getActiveCities().then((res) => {
        const list = res.data?.data || res.data || [];
        const match = list.find((c) => String(c._id) === String(raw));
        if (match?.name) setAssignedCity(match.name);
      }).catch(() => {});
    }
  }, [currentUser]);

  const handleRefresh = () => {
    setRefreshing(true);
    refetch();
    setTimeout(() => setRefreshing(false), 600);
  };

  const cityGmv = revenue?.cityRevenueGmv || 124800;
  const cityCommission = revenue?.cityCommission || 24960;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      
      {/* City Admin Header (Scoped to Assigned City) */}
      <DedicatedCityNavbar
        currentUser={currentUser}
        onLogout={onLogout}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        assignedCity={assignedCity}
      />

      {/* Main Layout */}
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 74px)' }}>
        
        {/* 9-Item City Admin Sidebar */}
        <DedicatedCitySidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLogout={onLogout}
          assignedCity={assignedCity}
          partnersCount={partnersCount}
          pendingKycCount={pendingKycCount}
        />

        {/* Content View Area */}
        <main style={{ flex: 1, padding: '28px 32px', overflowX: 'hidden' }}>
          
          {/* View Title */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0 }}>
                {activeTab === 'dashboard' && `${assignedCity} Operations Dashboard`}
                {activeTab === 'partners' && `${assignedCity} Active Service Partners & Technicians (${partners.length})`}
                {activeTab === 'partnerKyc' && `${assignedCity} Partner KYC & Onboarding Approvals`}
                {activeTab === 'bookings' && `${assignedCity} Live Booking Dispatch Center`}
                {activeTab === 'payments' && `${assignedCity} City Revenue & Daily Settlements`}
                {activeTab === 'reports' && `${assignedCity} Performance & SLA Reports`}
                {activeTab === 'support' && `${assignedCity} Customer & Partner Helpdesk`}
                {activeTab === 'profile' && `${assignedCity} City Operations Manager Profile`}
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Multi-Service Platform • Scoped to {assignedCity} Jurisdiction Only
              </p>
            </div>
          </div>

          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <>
              {/* 6 City Metric Cards */}
              <CityMetricCards selectedCity={assignedCity} />

              {/* Partner KYC Quick Action */}
              <PartnerKycManagement assignedCity={assignedCity} />

              {/* Live Booking Dispatch */}
              <div style={{ marginTop: '24px' }}>
                <CityBookingDispatch assignedCity={assignedCity} />
              </div>

              {/* 3 City Analytics Charts */}
              <div style={{ marginTop: '24px' }}>
                <CityCharts selectedCity={assignedCity} />
              </div>
            </>
          )}

          {/* TAB 2: PARTNERS */}
          {activeTab === 'partners' && (
            selectedPartner ? (
              <PartnerKycDetailPage
                partner={selectedPartner}
                onBack={() => setSelectedPartner(null)}
                onApprove={async (id) => {
                  await approvePartner(id);
                }}
                onReject={async (id, reason) => {
                  await rejectPartner({ id, reason });
                }}
                onToggleSuspend={async (p) => {
                  if (p.status === 'suspended' || p.status === 'blocked') {
                    await activatePartner(p._id);
                  } else {
                    await suspendPartner(p._id);
                  }
                }}
                onUpdateDocumentStatus={async (id, docKey, status, rejectionReason) => {
                  await updateDocumentStatus({ id, docKey, status, rejectionReason });
                }}
              />
            ) : (
              <div className="mui-card" style={{ padding: '26px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Briefcase size={20} color="#2563eb" /> {assignedCity} Verified Service Partners ({partners.length} Total)
                </h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                        <th style={{ padding: '12px' }}>TECHNICIAN NAME</th>
                        <th style={{ padding: '12px' }}>SKILL CATEGORY</th>
                        <th style={{ padding: '12px' }}>EMAIL</th>
                        <th style={{ padding: '12px' }}>KYC STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {partners.length === 0 ? (
                        <tr><td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No partners registered in {assignedCity}.</td></tr>
                      ) : (
                        partners.map((p) => (
                          <tr
                            key={p._id}
                            onClick={() => setSelectedPartner(p)}
                            style={{
                              borderBottom: '1px solid var(--border-light)',
                              cursor: 'pointer',
                              transition: 'background-color 0.15s ease',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            <td style={{ padding: '12px', fontWeight: '800', color: '#2563eb', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {p.name} <Eye size={14} color="#94a3b8" />
                            </td>
                            <td style={{ padding: '12px', fontWeight: '700' }}>{p.category || 'Service Technician'}</td>
                            <td style={{ padding: '12px', fontSize: '0.85rem' }}>{p.email}</td>
                            <td style={{ padding: '12px' }}>
                              <span className={`badge ${p.kycStatus === 'approved' ? 'badge-success' : 'badge-warning'}`}>
                                {(p.kycStatus || 'pending').toUpperCase()}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          )}

          {/* TAB 3: PARTNER KYC */}
          {activeTab === 'partnerKyc' && (
            <PartnerKycManagement assignedCity={assignedCity} />
          )}

          {/* TAB 4: BOOKINGS */}
          {activeTab === 'bookings' && (
            <CityBookingDispatch assignedCity={assignedCity} />
          )}

          {/* TAB 5: PAYMENTS */}
          {activeTab === 'payments' && (
            <div className="mui-card" style={{ padding: '26px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CreditCard size={20} color="#7c3aed" /> {assignedCity} Revenue & Daily Settlements
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Gross Daily GMV: <strong>₹{Number(cityGmv).toLocaleString()}</strong> • City Commission Earned: <strong>₹{Number(cityCommission).toLocaleString()}</strong>.
              </p>
            </div>
          )}

          {/* TAB 6: REPORTS */}
          {activeTab === 'reports' && (
            <div className="mui-card" style={{ padding: '26px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BarChart3 size={20} color="#2563eb" /> {assignedCity} City Performance Reports
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Download weekly order completion, partner SLA ratings, and cancellation logs.
              </p>
            </div>
          )}

          {/* TAB 7: SUPPORT */}
          {activeTab === 'support' && (
            <div className="mui-card" style={{ padding: '26px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Headphones size={20} color="#7c3aed" /> {assignedCity} Customer & Partner Helpdesk
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Manage local complaints, customer refund requests, and technician dispatch issues.
              </p>
            </div>
          )}

          {/* TAB 8: PROFILE */}
          {activeTab === 'profile' && (
            <div className="mui-card" style={{ padding: '26px', maxWidth: '500px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={20} color="#2563eb" /> {assignedCity} Operations Manager Profile
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'linear-gradient(135deg, #06b6d4, #2563eb)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1.2rem' }}>
                  {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'C'}
                </div>
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: '800' }}>{currentUser?.name || 'City Operations Manager'}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{currentUser?.email}</div>
                  <span className="badge badge-blue" style={{ marginTop: '4px' }}>{assignedCity.toUpperCase()} JURISDICTION</span>
                </div>
              </div>
            </div>
          )}

        </main>

      </div>

    </div>
  );
};

export default CityAdminPanel;
