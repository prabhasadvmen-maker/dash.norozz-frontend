import React, { useState } from 'react';
import PartnerSidebar from '../components/partner/PartnerSidebar';
import PartnerMetricCards from '../components/partner/PartnerMetricCards';
import PartnerWalletCard from '../components/partner/PartnerWalletCard';
import PartnerJobsTable from '../components/partner/PartnerJobsTable';
import {
  Users,
  CalendarCheck,
  Calendar,
  Clock,
  Wallet,
  Receipt,
  Star,
  FileText,
  Headphones,
  User,
  Plus,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Upload
} from 'lucide-react';

const PartnerDashboard = ({ currentUser, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notification, setNotification] = useState({ message: '', type: '' });

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification({ message: '', type: '' });
    }, 4000);
  };

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 74px)' }}>
      
      {/* 12-Item Partner Sidebar */}
      <PartnerSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={onLogout}
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
              {activeTab === 'dashboard' && 'Partner Marketplace Operations Overview'}
              {activeTab === 'workers' && 'Field Technicians & Worker Roster (6 Active)'}
              {activeTab === 'bookings' && 'Assigned Customer Job Bookings'}
              {activeTab === 'calendar' && 'Service Schedule & Calendar Dispatch'}
              {activeTab === 'availability' && 'Service Operating Hours & Availability'}
              {activeTab === 'wallet' && 'Partner E-Wallet & Bank Settlements'}
              {activeTab === 'transactions' && 'Job Payout & Withdrawal Transaction History'}
              {activeTab === 'reviews' && 'Customer Ratings & Reviews (4.92 ⭐)'}
              {activeTab === 'documents' && 'GST, Agency License & Background Check Verification'}
              {activeTab === 'support' && 'Partner Agency Support & Helpdesk'}
              {activeTab === 'profile' && 'Agency Business Profile'}
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              CleanPro Services • Verified Marketplace Business Partner
            </p>
          </div>
        </div>

        {/* TAB 1: PARTNER DASHBOARD */}
        {activeTab === 'dashboard' && (
          <>
            {/* 7 Partner Metric Cards */}
            <PartnerMetricCards />

            {/* Wallet & Instant Payout Card */}
            <PartnerWalletCard />

            {/* Partner Active Jobs Dispatch Table */}
            <PartnerJobsTable />
          </>
        )}

        {/* TAB 2: WORKERS */}
        {activeTab === 'workers' && (
          <div className="mui-card" style={{ padding: '26px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={20} color="#7c3aed" /> Field Technicians & Workers (6 On-Field)
              </h3>
              <button className="btn btn-primary"><Plus size={16} /> Add Technician</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              {[
                { name: 'Rajesh Kumar', skill: 'AC Jet Cleaning Specialist', rating: '4.95 ⭐', status: 'On Job' },
                { name: 'Amitabh Verma', skill: 'Master Plumber', rating: '4.88 ⭐', status: 'Available' },
                { name: 'Sunil Malhotra', skill: 'Electrician Expert', rating: '4.85 ⭐', status: 'On Job' },
                { name: 'Vikram Das', skill: 'Cleaner Specialist', rating: '4.90 ⭐', status: 'Available' },
                { name: 'Sanjay Dutt', skill: 'Cleaner Specialist', rating: '4.82 ⭐', status: 'Available' },
                { name: 'Manoj Tiwari', skill: 'Appliance Technician', rating: '4.89 ⭐', status: 'On Job' },
              ].map((w, i) => (
                <div key={i} style={{ padding: '16px', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{w.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{w.skill} • {w.rating}</div>
                  </div>
                  <span className={`badge ${w.status === 'On Job' ? 'badge-blue' : 'badge-success'}`}>{w.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: BOOKINGS */}
        {activeTab === 'bookings' && <PartnerJobsTable />}

        {/* TAB 4: CALENDAR */}
        {activeTab === 'calendar' && (
          <div className="mui-card" style={{ padding: '26px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={20} color="#2563eb" /> Job Schedule & Calendar Dispatch
            </h3>
            <div style={{ padding: '20px', background: '#f8fafc', borderRadius: 'var(--radius-md)', textAlign: 'center', color: 'var(--text-muted)' }}>
              Interactive Service Calendar - Today: 8 Scheduled Slot Dispatches
            </div>
          </div>
        )}

        {/* TAB 5: AVAILABILITY */}
        {activeTab === 'availability' && (
          <div className="mui-card" style={{ padding: '26px', maxWidth: '500px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={20} color="#7c3aed" /> Service Operating Hours
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {['Monday - Friday (08:00 AM - 08:00 PM)', 'Saturday (08:00 AM - 09:00 PM)', 'Sunday (09:00 AM - 06:00 PM)'].map((slot, idx) => (
                <div key={idx} style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: '600' }}>{slot}</span>
                  <span className="badge badge-success">ACTIVE</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: WALLET */}
        {activeTab === 'wallet' && <PartnerWalletCard />}

        {/* TAB 7: TRANSACTIONS */}
        {activeTab === 'transactions' && (
          <div className="mui-card" style={{ padding: '26px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Receipt size={20} color="#2563eb" /> Complete Payout Transaction Ledger
            </h3>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Showing all job earnings settlements and direct bank withdrawals for CleanPro Services.
            </div>
          </div>
        )}

        {/* TAB 8: REVIEWS */}
        {activeTab === 'reviews' && (
          <div className="mui-card" style={{ padding: '26px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Star size={20} color="#f59e0b" /> Customer Ratings & Reviews (4.92 ⭐)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { name: 'Rohan Mehta', rating: '5 ⭐', comment: 'Super fast AC deep cleaning! Technicians Rajesh was punctual.', date: 'Today' },
                { name: 'Ananya Deshmukh', rating: '5 ⭐', comment: 'Excellent home cleaning job. Very polite staff.', date: 'Yesterday' }
              ].map((rev, idx) => (
                <div key={idx} style={{ padding: '14px', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '0.88rem' }}>
                    <span>{rev.name}</span>
                    <span style={{ color: '#f59e0b' }}>{rev.rating}</span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>"{rev.comment}"</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 9: DOCUMENTS */}
        {activeTab === 'documents' && (
          <div className="mui-card" style={{ padding: '26px', maxWidth: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={20} color="#7c3aed" /> Verification Documents & Compliance
              </h3>
              <button className="btn btn-secondary btn-sm"><Upload size={14} /> Upload Doc</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {['GST Registration Certificate', 'Agency Business Trade License', 'Worker Police Background Clearance'].map((doc, idx) => (
                <div key={idx} style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: '600' }}>{doc}</span>
                  <span className="badge badge-success">VERIFIED</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 10: SUPPORT */}
        {activeTab === 'support' && (
          <div className="mui-card" style={{ padding: '26px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Headphones size={20} color="#2563eb" /> Partner Priority Helpdesk
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Dedicated partner helpline for customer address issues, equipment claims, or payment inquiries.
            </p>
          </div>
        )}

        {/* TAB 11: PROFILE */}
        {activeTab === 'profile' && (
          <div className="mui-card" style={{ padding: '26px', maxWidth: '500px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={20} color="#7c3aed" /> Business Partner Profile
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #ec4899)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1.2rem' }}>
                C
              </div>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: '800' }}>CleanPro Services Agency</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>partner.cleanpro@norozz.com</div>
                <span className="badge badge-purple" style={{ marginTop: '4px' }}>VERIFIED MARKETPLACE PARTNER</span>
              </div>
            </div>
          </div>
        )}

      </main>

    </div>
  );
};

export default PartnerDashboard;
