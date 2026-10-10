import React, { useState } from 'react';
import CitySidebar from '../components/cityAdmin/CitySidebar';
import CityMetricCards from '../components/cityAdmin/CityMetricCards';
import CityCharts from '../components/cityAdmin/CityCharts';
import CityOrdersTable from '../components/cityAdmin/CityOrdersTable';
import UserTable from '../components/UserTable';
import { useCityAdmin } from '../hooks/useCityAdmin.js';
import {
  Users,
  Briefcase,
  CalendarCheck,
  CreditCard,
  Headphones,
  Bell,
  BarChart3,
  User,
  Plus,
  CheckCircle2,
  AlertCircle,
  MapPin,
  ShoppingBag,
  Loader2
} from 'lucide-react';

const CityAdminDashboard = ({ currentUser, onLogout, selectedCity }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notification, setNotification] = useState({ message: '', type: '' });
  const { partners, customers, isLoading } = useCityAdmin(selectedCity);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification({ message: '', type: '' });
    }, 4000);
  };

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 74px)' }}>
      
      {/* 10-Item City Sidebar */}
      <CitySidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={onLogout}
        selectedCity={selectedCity}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '28px 32px', overflowX: 'hidden' }}>
        
        {/* Toast Notification */}
        {notification.message && (
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
        )}

        {/* View Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0 }}>
              {activeTab === 'dashboard' && `${selectedCity} City Operations Overview`}
              {activeTab === 'customers' && `${selectedCity} Registered Customers`}
              {activeTab === 'partners' && `${selectedCity} Verified Partners & Technicians`}
              {activeTab === 'bookings' && `${selectedCity} Live Service Orders Dispatch`}
              {activeTab === 'payments' && `${selectedCity} Daily Revenue & Partner Payouts`}
              {activeTab === 'support' && `${selectedCity} Customer Support & Dispute Tickets`}
              {activeTab === 'notifications' && `${selectedCity} City Notifications & Alerts`}
              {activeTab === 'reports' && `${selectedCity} City Performance Reports`}
              {activeTab === 'profile' && `${selectedCity} City Admin Profile`}
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Multi-Service Platform • City Manager Control Panel ({selectedCity})
            </p>
          </div>
        </div>

        {/* TAB 1: CITY DASHBOARD */}
        {activeTab === 'dashboard' && (
          <>
            {/* 6 City Metric Cards */}
            <CityMetricCards selectedCity={selectedCity} />

            {/* 3 City Charts (Revenue, Bookings, Service Performance) */}
            <CityCharts selectedCity={selectedCity} />

            {/* City Live Orders Dispatch Table */}
            <CityOrdersTable selectedCity={selectedCity} />
          </>
        )}

        {/* TAB 2: CUSTOMERS */}
        {activeTab === 'customers' && (
          <div className="mui-card" style={{ padding: '26px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={20} color="#2563eb" /> {selectedCity} Customer Directory ({customers.length} Customers)
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              View and manage registered customers in {selectedCity}.
            </p>
            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                <Loader2 size={24} className="spin" style={{ display: 'inline-block' }} />
                <p style={{ marginTop: '12px' }}>Loading customers...</p>
              </div>
            ) : customers.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                {customers.slice(0, 8).map((c, i) => (
                  <div key={i} style={{ padding: '16px', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                    <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{c.name || 'Customer'}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{c.phone || c.email || 'N/A'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>{c.city || selectedCity} • {c.totalOrders || 0} Orders</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                <Users size={32} style={{ opacity: 0.5, marginBottom: '12px' }} />
                <p>No customers found in {selectedCity}</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PARTNERS */}
        {activeTab === 'partners' && (
          <div className="mui-card" style={{ padding: '26px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Briefcase size={20} color="#7c3aed" /> {selectedCity} Active Service Partners ({partners.length} Technicians)
              </h3>
              <button className="btn btn-primary"><Plus size={16} /> Onboard Local Partner</button>
            </div>
            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                <Loader2 size={24} className="spin" style={{ display: 'inline-block' }} />
                <p style={{ marginTop: '12px' }}>Loading partners...</p>
              </div>
            ) : partners.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                {partners.slice(0, 8).map((p, i) => {
                  const isApproved = (p.kycStatus || '').toLowerCase() === 'approved';
                  const status = p.isOnline ? 'Online' : p.isAvailable ? 'Available' : 'Offline';
                  return (
                    <div key={i} style={{ padding: '16px', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{p.name || 'Partner'}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{p.experience || 'Experienced'} • {p.averageRating || 4.8} ⭐</div>
                      </div>
                      <span className={`badge ${status === 'Offline' ? 'badge-warning' : 'badge-success'}`}>{status}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                <Briefcase size={32} style={{ opacity: 0.5, marginBottom: '12px' }} />
                <p>No partners registered in {selectedCity} yet</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: BOOKINGS */}
        {activeTab === 'bookings' && <CityOrdersTable selectedCity={selectedCity} />}

        {/* TAB 5: PAYMENTS */}
        {activeTab === 'payments' && (
          <div className="mui-card" style={{ padding: '26px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CreditCard size={20} color="#2563eb" /> {selectedCity} Payments & Daily Settlements
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              City level gross daily collection: ₹1,24,800 • City Commission Earned: ₹24,960.
            </p>
          </div>
        )}

        {/* TAB 6: SUPPORT */}
        {activeTab === 'support' && (
          <div className="mui-card" style={{ padding: '26px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Headphones size={20} color="#7c3aed" /> {selectedCity} Customer & Partner Support Desk
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Manage active customer complaints, partner dispatch issues, and SLA refunds.
            </p>
          </div>
        )}

        {/* TAB 7: NOTIFICATIONS */}
        {activeTab === 'notifications' && (
          <div className="mui-card" style={{ padding: '26px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bell size={20} color="#2563eb" /> {selectedCity} City Notifications & Alerts
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Broadcast city-wide operational messages to active service partners in {selectedCity}.
            </p>
          </div>
        )}

        {/* TAB 8: REPORTS */}
        {activeTab === 'reports' && (
          <div className="mui-card" style={{ padding: '26px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart3 size={20} color="#7c3aed" /> {selectedCity} City Performance Reports
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Download weekly order volume, partner SLA completion, and customer rating reports.
            </p>
          </div>
        )}

        {/* TAB 9: PROFILE */}
        {activeTab === 'profile' && (
          <div className="mui-card" style={{ padding: '26px', maxWidth: '500px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={20} color="#2563eb" /> {selectedCity} City Manager Profile
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'linear-gradient(135deg, #06b6d4, #2563eb)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1.2rem' }}>
                C
              </div>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: '800' }}>City Operations Manager</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>cityadmin.{selectedCity.toLowerCase().replace(/\s+/g, '')}@norozz.com</div>
                <span className="badge badge-blue" style={{ marginTop: '4px' }}>{selectedCity.toUpperCase()} MANAGER</span>
              </div>
            </div>
          </div>
        )}

      </main>

    </div>
  );
};

export default CityAdminDashboard;
