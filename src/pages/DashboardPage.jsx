import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import MetricCardsGrid from '../components/MetricCardsGrid';
import AnalyticsCharts from '../components/AnalyticsCharts';
import QuickBookingsTable from '../components/QuickBookingsTable';
import AdminTable from '../components/AdminTable';
import AdminModal from '../components/AdminModal';
import UserTable from '../components/UserTable';
import UserModal from '../components/UserModal';
import { adminService } from '../services/api';
import {
  UserPlus,
  Crown,
  Grid,
  MapPin,
  CalendarCheck,
  Briefcase,
  CreditCard,
  Tag,
  Bell,
  Headphones,
  BarChart3,
  Settings,
  User,
  CheckCircle2,
  AlertCircle,
  Plus,
  ShieldCheck,
  Star,
  DollarSign
} from 'lucide-react';

const DashboardPage = ({ currentUser, onLogout }) => {
  const [stats, setStats] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Active Tab (14 items: dashboard, users, categories, locations, bookings, partners, payments, coupons, notifications, tickets, reports, settings, profile)
  const [activeTab, setActiveTab] = useState('dashboard');

  // Filters & State
  const [adminSearch, setAdminSearch] = useState('');
  const [adminStatusFilter, setAdminStatusFilter] = useState('all');
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userStatusFilter, setUserStatusFilter] = useState('all');

  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  const [notification, setNotification] = useState({ message: '', type: '' });

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification({ message: '', type: '' });
    }, 4000);
  };

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const [statsData, adminsData, usersData] = await Promise.all([
        adminService.getStats(),
        adminService.getAdmins({ search: adminSearch, status: adminStatusFilter }),
        adminService.getUsers({ search: userSearch, role: userRoleFilter, status: userStatusFilter })
      ]);

      if (statsData.success) setStats(statsData.stats);
      if (adminsData.success) setAdmins(adminsData.data);
      if (usersData.success) setUsers(usersData.data);
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to fetch dashboard data', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [adminSearch, adminStatusFilter, userSearch, userRoleFilter, userStatusFilter]);

  // Admin Handlers
  const handleOpenCreateAdminModal = () => {
    setEditingAdmin(null);
    setIsAdminModalOpen(true);
  };

  const handleOpenEditAdminModal = (admin) => {
    setEditingAdmin(admin);
    setIsAdminModalOpen(true);
  };

  const handleAdminFormSubmit = async (adminData, adminId) => {
    if (adminId) {
      await adminService.updateAdmin(adminId, adminData);
      showNotification(`Admin '${adminData.name}' updated successfully`);
    } else {
      await adminService.createAdmin(adminData);
      showNotification(`New Admin '${adminData.name}' created successfully`);
    }
    fetchData();
  };

  const handleAdminStatusToggle = async (adminId, newStatus) => {
    try {
      await adminService.updateAdmin(adminId, { status: newStatus });
      showNotification(`Admin status set to '${newStatus.toUpperCase()}'`);
      fetchData();
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to update Admin status', 'error');
    }
  };

  const handleDeleteAdmin = async (adminId, adminName) => {
    if (!window.confirm(`Are you sure you want to delete Admin account '${adminName}'?`)) return;
    try {
      await adminService.deleteAdmin(adminId);
      showNotification(`Admin '${adminName}' deleted permanently`);
      fetchData();
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to delete Admin', 'error');
    }
  };

  // User Handlers
  const handleCreateUser = async (userData) => {
    await adminService.createUser(userData);
    showNotification(`User '${userData.name}' created as ${userData.role.toUpperCase()}`);
    fetchData();
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminService.updateUserRole(userId, newRole);
      showNotification(`Role updated to '${newRole.toUpperCase()}'`);
      fetchData();
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to update role', 'error');
    }
  };

  const handleUserStatusToggle = async (userId, newStatus) => {
    try {
      await adminService.updateUserStatus(userId, newStatus);
      showNotification(`User status set to '${newStatus.toUpperCase()}'`);
      fetchData();
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to update status', 'error');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user account '${userName}'?`)) return;
    try {
      await adminService.deleteUser(userId);
      showNotification(`User '${userName}' deleted permanently`);
      fetchData();
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to delete user', 'error');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', paddingBottom: '60px' }}>


      <div style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 1000,
        background: notification.type === 'error' ? '#ef4444' : '#10b981',
        color: '#ffffff',
        padding: '12px 20px',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: '0.88rem',
        fontWeight: '600',
        animation: 'modalSlideUp 0.3s ease'
      }}>
        {notification.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
        <span>{notification.message}</span>
      </div>


      {/* Main Layout Container */}
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 74px)' }}>

        {/* 14-Item Sidebar Navigation */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={onLogout} />

        {/* Content View Area */}
        <main style={{ flex: 1, padding: '28px 32px', overflowX: 'hidden' }}>

          {/* View Title Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0, textTransform: 'capitalize' }}>
                {activeTab === 'dashboard' && 'Super Admin Platform Overview'}
                {activeTab === 'users' && 'User & Account RBAC Management'}
                {activeTab === 'categories' && 'Service Category Management'}
                {activeTab === 'locations' && 'City & Location Coverage Management'}
                {activeTab === 'bookings' && 'Customer Bookings & Dispatch Center'}
                {activeTab === 'partners' && 'Partner & Service Provider Management'}
                {activeTab === 'payments' && 'Payments, Payouts & Platform Revenue'}
                {activeTab === 'coupons' && 'Coupons & Promotional Discounts'}
                {activeTab === 'notifications' && 'System Notifications & Broadcasts'}
                {activeTab === 'tickets' && 'Support Tickets & Helpdesk'}
                {activeTab === 'reports' && 'Business Reports & Analytics'}
                {activeTab === 'settings' && 'Platform Configuration & Settings'}
                {activeTab === 'profile' && 'Super Admin Account Profile'}
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Urban Company Multi-Service Platform Dashboard • White + Blue + Purple SaaS Theme
              </p>
            </div>

            {/* Quick Action Button for Admin Management */}
            {activeTab === 'users' && (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={handleOpenCreateAdminModal} className="btn btn-primary">
                  <Crown size={18} /> Create Admin
                </button>
                <button onClick={() => setIsUserModalOpen(true)} className="btn btn-secondary">
                  <UserPlus size={18} /> Add User
                </button>
              </div>
            )}
          </div>

          {/* TAB 1: DASHBOARD OVERVIEW */}
          {activeTab === 'dashboard' && (
            <>
              {/* 12 Metric Cards Grid */}
              <MetricCardsGrid stats={stats} />

              {/* Analytics Charts (Revenue, Bookings, Top Services, Top Partners) */}
              <AnalyticsCharts />

              {/* Recent Bookings Table */}
              <QuickBookingsTable />
            </>
          )}

          {/* TAB 2: USER MANAGEMENT */}
          {activeTab === 'users' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              <div style={{ background: '#fff', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Crown size={20} color="#7c3aed" /> Admin Accounts Management (Full CRUD)
                </h3>
                <AdminTable
                  admins={admins}
                  searchQuery={adminSearch}
                  onSearchChange={setAdminSearch}
                  statusFilter={adminStatusFilter}
                  onStatusFilterChange={setAdminStatusFilter}
                  onEditAdmin={handleOpenEditAdminModal}
                  onStatusToggle={handleAdminStatusToggle}
                  onDeleteAdmin={handleDeleteAdmin}
                  currentUser={currentUser}
                />
              </div>

              <div style={{ background: '#fff', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <UserPlus size={20} color="#2563eb" /> Customer & General User Accounts
                </h3>
                <UserTable
                  users={users}
                  searchQuery={userSearch}
                  onSearchChange={setUserSearch}
                  roleFilter={userRoleFilter}
                  onRoleFilterChange={setUserRoleFilter}
                  statusFilter={userStatusFilter}
                  onStatusFilterChange={setUserStatusFilter}
                  onRoleChange={handleRoleChange}
                  onStatusToggle={handleUserStatusToggle}
                  onDeleteUser={handleDeleteUser}
                  currentUser={currentUser}
                />
              </div>
            </div>
          )}

          {/* TAB 3: CATEGORY MANAGEMENT */}
          {activeTab === 'categories' && (
            <div className="mui-card" style={{ padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Grid size={20} color="#7c3aed" /> Multi-Service Categories (12 Active)
                </h3>
                <button className="btn btn-primary"><Plus size={16} /> Add New Category</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                {['Appliance Repair', 'Home Deep Cleaning', 'Salon for Women', 'Men Salon & Massage', 'Plumbing & Water', 'Electrician Services', 'Carpentry', 'Painting & Waterproofing', 'Pest Control', 'Disinfection', 'Packers & Movers', 'Ro Water Repair'].map((cat, idx) => (
                  <div key={idx} style={{ padding: '16px', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                    <div style={{ fontWeight: '700', fontSize: '0.92rem' }}>{cat}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Active • 6-12 Subservices</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: LOCATION MANAGEMENT */}
          {activeTab === 'locations' && (
            <div className="mui-card" style={{ padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={20} color="#2563eb" /> Operational Cities & Zones (12 Cities)
                </h3>
                <button className="btn btn-primary"><Plus size={16} /> Add New City</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                {['Delhi NCR', 'Mumbai', 'Bengaluru', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Chandigarh', 'Lucknow', 'Indore'].map((city, idx) => (
                  <div key={idx} style={{ padding: '16px', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.92rem' }}>{city}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Operational • 80+ Partners</div>
                    </div>
                    <span className="badge badge-success">ACTIVE</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: BOOKINGS */}
          {activeTab === 'bookings' && <QuickBookingsTable />}

          {/* TAB 6: PARTNER MANAGEMENT */}
          {activeTab === 'partners' && (
            <div className="mui-card" style={{ padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Briefcase size={20} color="#7c3aed" /> Service Partners & Professionals (1,450 Total)
                </h3>
                <button className="btn btn-primary"><Plus size={16} /> Onboard New Partner</button>
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Partner verification, background check, skill certifications, and daily earnings tracking portal.
              </div>
            </div>
          )}

          {/* TAB 7: PAYMENTS */}
          {activeTab === 'payments' && (
            <div className="mui-card" style={{ padding: '28px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CreditCard size={20} color="#2563eb" /> Platform Payments & Commission Payouts
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Automated weekly payout processing for verified partners, gateway transaction logs (Razorpay/Stripe), and commission settlement.
              </p>
            </div>
          )}

          {/* TAB 8: COUPONS */}
          {activeTab === 'coupons' && (
            <div className="mui-card" style={{ padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Tag size={20} color="#7c3aed" /> Promotional Coupons & Discounts
                </h3>
                <button className="btn btn-primary"><Plus size={16} /> Create Coupon</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                {[
                  { code: 'FIRST50', discount: '50% OFF up to ₹150', valid: 'New Users Only' },
                  { code: 'CLEAN200', discount: 'Flat ₹200 OFF', valid: 'Deep Cleaning Services' },
                  { code: 'SUMMERAC', discount: '20% OFF AC Service', valid: 'Appliance Repair' }
                ].map((c, i) => (
                  <div key={i} style={{ padding: '16px', background: '#f5f3ff', border: '1px border #ddd6fe', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '1rem', fontWeight: '800', color: '#7c3aed' }}>{c.code}</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-primary)', marginTop: '4px' }}>{c.discount}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.valid}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 9: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="mui-card" style={{ padding: '28px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bell size={20} color="#2563eb" /> System Push Notifications & Email Broadcasts
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Send promotional notifications to customers or operational alerts to service partners.
              </p>
            </div>
          )}

          {/* TAB 10: SUPPORT TICKETS */}
          {activeTab === 'tickets' && (
            <div className="mui-card" style={{ padding: '28px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Headphones size={20} color="#7c3aed" /> Customer Support Tickets & Dispute Resolution
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Helpdesk portal managing refunds, partner complaints, service re-assignments, and customer feedback.
              </p>
            </div>
          )}

          {/* TAB 11: REPORTS */}
          {activeTab === 'reports' && (
            <div className="mui-card" style={{ padding: '28px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BarChart3 size={20} color="#2563eb" /> Financial & Growth Analytics Reports
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Export GST reports, partner payout statements, and customer retention metrics (CSV/Excel/PDF).
              </p>
            </div>
          )}

          {/* TAB 12: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="mui-card" style={{ padding: '28px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Settings size={20} color="#7c3aed" /> Global SaaS Settings & Platform Commission Rates
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '500px', marginTop: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Platform Default Commission (%)</label>
                  <input type="number" className="form-input" defaultValue={20} />
                </div>
                <div className="form-group">
                  <label className="form-label">Customer Support Helpline Phone</label>
                  <input type="text" className="form-input" defaultValue="+91 1800 200 8080" />
                </div>
                <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Save Configuration</button>
              </div>
            </div>
          )}

          {/* TAB 13: PROFILE */}
          {activeTab === 'profile' && (
            <div className="mui-card" style={{ padding: '28px', maxWidth: '600px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={20} color="#2563eb" /> Super Admin Profile
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--gradient-brand)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1.5rem' }}>
                  {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'S'}
                </div>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '800' }}>{currentUser?.name || 'Super Admin'}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{currentUser?.email || 'superadmin@norozz.com'}</div>
                  <span className="badge badge-purple" style={{ marginTop: '4px' }}>SUPER ADMIN ROLE</span>
                </div>
              </div>
            </div>
          )}

        </main>

      </div>

      {/* Admin Creation / Edit Modal */}
      <AdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onSubmit={handleAdminFormSubmit}
        initialData={editingAdmin}
      />

      {/* General User Creation Modal */}
      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        onSubmit={handleCreateUser}
      />

    </div>
  );
};

export default DashboardPage;
