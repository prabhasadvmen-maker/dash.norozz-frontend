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
  const [collapsed, setCollapsed] = useState(false);

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

  const [settingsForm, setSettingsForm] = useState({
    autoAssign: true,
    smsNotify: true,
    slaThreshold: '30',
    commissionRate: '20',
    darkMode: false,
  });
  const [settingsSaved, setSettingsSaved] = useState(false);

  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: 'dispatch',
    message: '',
  });
  const [ticketSuccess, setTicketSuccess] = useState(false);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  const handleSendTicket = (e) => {
    e.preventDefault();
    if (!ticketForm.message) return;
    setTicketSuccess(true);
    setTimeout(() => {
      setTicketSuccess(false);
      setTicketForm({ subject: '', category: 'dispatch', message: '' });
    }, 4000);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', color: '#0f172a' }}>
      
      {/* 9-Item City Admin Sidebar */}
      <DedicatedCitySidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={onLogout}
        collapsed={collapsed}
        assignedCity={assignedCity}
        partnersCount={partnersCount}
        pendingKycCount={pendingKycCount}
      />

      {/* Main Right Column Container */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* City Admin Header (Scoped to Assigned City) */}
        <DedicatedCityNavbar
          currentUser={currentUser}
          onLogout={onLogout}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          assignedCity={assignedCity}
        />

        {/* Content View Area */}
        <main style={{ flex: 1, padding: '28px 32px', overflowX: 'hidden' }}>
          
          {/* View Title */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>
                {activeTab === 'dashboard' && `${assignedCity} Operations Dashboard`}
                {activeTab === 'partners' && `${assignedCity} Active Service Partners & Technicians (${partners.length})`}
                {activeTab === 'partnerKyc' && `${assignedCity} Partner KYC & Onboarding Approvals`}
                {activeTab === 'bookings' && `${assignedCity} Live Booking Dispatch Center`}
                {activeTab === 'payments' && `${assignedCity} City Revenue & Daily Settlements`}
                {activeTab === 'reports' && `${assignedCity} Performance & SLA Reports`}
                {(activeTab === 'support' || activeTab === 'help') && `${assignedCity} Operations Support & Helpdesk Hub`}
                {activeTab === 'profile' && `${assignedCity} City Operations Manager Profile`}
                {activeTab === 'settings' && `${assignedCity} Jurisdiction Operations Settings`}
              </h2>
              <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>
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

          {/* TAB 7: HELP & SUPPORT HUB */}
          {(activeTab === 'support' || activeTab === 'help') && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
              {/* Left Column: Direct Support Ticket Form */}
              <div style={{ background: '#ffffff', borderRadius: '18px', border: '1px solid #e2e8f0', padding: '26px', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Headphones size={20} color="#10b981" /> {assignedCity} Operations Support Desk
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '4px', marginBottom: '20px' }}>
                  Submit urgent operational issues, partner dispute reports, or customer refund escalation requests directly to HQ.
                </p>

                {ticketSuccess && (
                  <div style={{ background: '#ecfdf5', border: '1px solid #6ee7b7', color: '#065f46', padding: '12px 16px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '700', marginBottom: '20px' }}>
                    ✅ Support Ticket Submitted! Ticket ID: #TK-NOR-{Math.floor(1000 + Math.random() * 9000)}. HQ response estimated within 15 minutes.
                  </div>
                )}

                <form onSubmit={handleSendTicket} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>Ticket Subject</label>
                    <input
                      type="text"
                      placeholder="e.g. Partner Dispatch Failure in Sector 4"
                      value={ticketForm.subject}
                      onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                      required
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>Issue Category</label>
                    <select
                      value={ticketForm.category}
                      onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', background: '#fff' }}
                    >
                      <option value="dispatch">Live Booking & Dispatch Issue</option>
                      <option value="kyc">Technician KYC & Compliance Dispute</option>
                      <option value="payment">Commission & Revenue Settlement</option>
                      <option value="system">System Bug or Interface Issue</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>Detailed Issue Description</label>
                    <textarea
                      rows={5}
                      placeholder="Describe the issue, booking reference number, or partner phone number..."
                      value={ticketForm.message}
                      onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })}
                      required
                      style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', resize: 'vertical' }}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ padding: '12px 20px', fontSize: '0.9rem', fontWeight: '800', borderRadius: '12px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    Submit Support Ticket
                  </button>
                </form>
              </div>

              {/* Right Column: Hotline & FAQs */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* 24/7 Hotline */}
                <div style={{ background: 'linear-gradient(135deg, #09331E 0%, #062616 100%)', borderRadius: '18px', padding: '22px', color: '#ffffff' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    24/7 HQ Hotline
                  </div>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: '900', margin: '6px 0 10px 0' }}>
                    +91 1800-NOROZZ-HELP
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: '#a7f3d0', margin: 0 }}>
                    Priority operations phone channel for City Managers. Available round the clock.
                  </p>
                </div>

                {/* FAQ Cards */}
                <div style={{ background: '#ffffff', borderRadius: '18px', border: '1px solid #e2e8f0', padding: '20px' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '800', margin: '0 0 14px 0', color: '#0f172a' }}>
                    Frequent Operational FAQs
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.82rem' }}>
                    <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontWeight: '800', color: '#0f172a' }}>Q: How do I approve a technician's KYC?</div>
                      <div style={{ color: '#64748b', marginTop: '4px' }}>Go to Partner KYC tab, click Inspect Documents, verify Aadhaar/PAN, and click Approve.</div>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontWeight: '800', color: '#0f172a' }}>Q: Can I reassign a pending booking?</div>
                      <div style={{ color: '#64748b', marginTop: '4px' }}>Yes! Open Bookings tab, click the Gear Icon next to the order, select Assign Technician, and pick an active partner.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: PROFILE PAGE */}
          {activeTab === 'profile' && (
            <div style={{ maxWidth: '780px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '30px', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '24px' }}>
                  <div style={{ width: '68px', height: '68px', borderRadius: '20px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '1.8rem', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)' }}>
                    {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'C'}
                  </div>

                  <div>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: '900', margin: 0, color: '#0f172a' }}>
                      {currentUser?.name || 'City Operations Manager'}
                    </h3>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>{currentUser?.email || 'jaipur.admin@norozz.com'}</div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      <span className="badge badge-purple" style={{ fontSize: '0.7rem', padding: '3px 10px', fontWeight: '800' }}>
                        {assignedCity.toUpperCase()} JURISDICTION
                      </span>
                      <span className="badge badge-success" style={{ fontSize: '0.7rem', padding: '3px 10px', fontWeight: '800' }}>
                        ACTIVE MANAGER
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '24px' }}>
                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Assigned Region</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', marginTop: '4px' }}>{assignedCity} Metro Area</div>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Access Role</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#10b981', marginTop: '4px' }}>City Admin</div>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Session Auth</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#2563eb', marginTop: '4px' }}>JWT Bearer Token</div>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>System Status</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#059669', marginTop: '4px' }}>Verified Live</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: SETTINGS PAGE */}
          {activeTab === 'settings' && (
            <div style={{ maxWidth: '780px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '30px', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {assignedCity} Operations Settings
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '4px', marginBottom: '24px' }}>
                  Configure dispatch automation rules, SLA alert timers, and jurisdiction notification rules.
                </p>

                {settingsSaved && (
                  <div style={{ background: '#ecfdf5', border: '1px solid #6ee7b7', color: '#065f46', padding: '12px 16px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '700', marginBottom: '20px' }}>
                    ✅ {assignedCity} Operations Settings saved successfully!
                  </div>
                )}

                <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#0f172a' }}>Auto-Assign Dispatch Engine</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Automatically route new customer bookings to nearest approved technician.</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settingsForm.autoAssign}
                      onChange={(e) => setSettingsForm({ ...settingsForm, autoAssign: e.target.checked })}
                      style={{ width: '20px', height: '20px', accentColor: '#10b981', cursor: 'pointer' }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#0f172a' }}>Customer SMS Notifications</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Send live SMS & WhatsApp tracking updates when partner is assigned.</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settingsForm.smsNotify}
                      onChange={(e) => setSettingsForm({ ...settingsForm, smsNotify: e.target.checked })}
                      style={{ width: '20px', height: '20px', accentColor: '#10b981', cursor: 'pointer' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>SLA Warning Alert (Minutes)</label>
                      <input
                        type="number"
                        value={settingsForm.slaThreshold}
                        onChange={(e) => setSettingsForm({ ...settingsForm, slaThreshold: e.target.value })}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>City Commission Rate (%)</label>
                      <input
                        type="number"
                        value={settingsForm.commissionRate}
                        onChange={(e) => setSettingsForm({ ...settingsForm, commissionRate: e.target.value })}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ padding: '12px 20px', fontSize: '0.9rem', fontWeight: '800', borderRadius: '12px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: 'fit-content' }}
                  >
                    Save Operational Settings
                  </button>
                </form>
              </div>
            </div>
          )}

        </main>

      </div>

    </div>
  );
};

export default CityAdminPanel;
