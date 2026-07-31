import React, { useState } from 'react';
import SuperAdminNavbar from '../components/superAdmin/SuperAdminNavbar';
import SuperAdminSidebar from '../components/superAdmin/SuperAdminSidebar';
import PlatformAnalyticsGrid from '../components/superAdmin/PlatformAnalyticsGrid';
import CityAdminManagement from '../components/superAdmin/CityAdminManagement';
import AnalyticsCharts from '../components/AnalyticsCharts';
import { useSuperAdmin } from '../hooks/useSuperAdmin.js';
import { useCatalog } from '../hooks/useCatalog.js';
import {
  Building2,
  Users,
  Briefcase,
  Grid,
  Layers,
  Wrench,
  CalendarCheck,
  CreditCard,
  BarChart3,
  Bell,
  Settings,
  User,
  Plus,
  Trash2,
  MapPin,
  CheckCircle2,
} from 'lucide-react';

const SuperAdminPanel = ({ currentUser, onLogout }) => {
  const { dashboard, customers, partners, bookings, refetch } = useSuperAdmin();
  const {
    categories,
    subCategories,
    services,
    createCategory,
    deleteCategory,
    createSubCategory,
    deleteSubCategory,
    createService,
    deleteService,
  } = useCatalog();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [refreshing, setRefreshing] = useState(false);

  // Category Modal state
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  // SubCategory Modal state
  const [subCatModalOpen, setSubCatModalOpen] = useState(false);
  const [newSubCatName, setNewSubCatName] = useState('');
  const [newSubCatCategory, setNewSubCatCategory] = useState('');
  const [newSubCatDesc, setNewSubCatDesc] = useState('');

  // Service Modal state
  const [srvModalOpen, setSrvModalOpen] = useState(false);
  const [newSrvName, setNewSrvName] = useState('');
  const [newSrvCategory, setNewSrvCategory] = useState('');
  const [newSrvSubCategory, setNewSrvSubCategory] = useState('');
  const [newSrvPrice, setNewSrvPrice] = useState('');
  const [newSrvDiscount, setNewSrvDiscount] = useState('');
  const [newSrvDuration, setNewSrvDuration] = useState('45 mins');
  const [newSrvDesc, setNewSrvDesc] = useState('');

  // Catalog Filters
  const [subCatFilterCategory, setSubCatFilterCategory] = useState('');
  const [srvFilterCategory, setSrvFilterCategory] = useState('');
  const [srvFilterSubCategory, setSrvFilterSubCategory] = useState('');

  const handleRefresh = () => {
    setRefreshing(true);
    refetch();
    setTimeout(() => setRefreshing(false), 600);
  };

  const handleCreateCategorySubmit = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    await createCategory({ name: newCatName.trim(), description: newCatDesc.trim() });
    setNewCatName('');
    setNewCatDesc('');
    setCatModalOpen(false);
  };

  const handleCreateSubCategorySubmit = async (e) => {
    e.preventDefault();
    if (!newSubCatName.trim() || !newSubCatCategory) return;
    await createSubCategory({
      name: newSubCatName.trim(),
      category: newSubCatCategory,
      description: newSubCatDesc.trim(),
    });
    setNewSubCatName('');
    setNewSubCatCategory('');
    setNewSubCatDesc('');
    setSubCatModalOpen(false);
  };

  const handleCreateServiceSubmit = async (e) => {
    e.preventDefault();
    if (!newSrvName.trim() || !newSrvCategory || !newSrvSubCategory || !newSrvPrice) return;
    await createService({
      name: newSrvName.trim(),
      category: newSrvCategory,
      subCategory: newSrvSubCategory,
      price: Number(newSrvPrice),
      discount: Number(newSrvDiscount) || 0,
      duration: newSrvDuration || '45 mins',
      description: newSrvDesc.trim(),
    });
    setNewSrvName('');
    setNewSrvCategory('');
    setNewSrvSubCategory('');
    setNewSrvPrice('');
    setNewSrvDiscount('');
    setNewSrvDuration('45 mins');
    setNewSrvDesc('');
    setSrvModalOpen(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      
      {/* Super Admin Top Header */}
      <SuperAdminNavbar
        currentUser={currentUser}
        onLogout={onLogout}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />

      {/* Main Layout */}
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 74px)' }}>
        
        {/* 13-Item Super Admin Sidebar */}
        <SuperAdminSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLogout={onLogout}
        />

        {/* Content View Area */}
        <main style={{ flex: 1, padding: '28px 32px', overflowX: 'hidden' }}>
          
          {/* View Title */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0 }}>
                {activeTab === 'dashboard' && 'Master Platform Analytics & Overview'}
                {activeTab === 'cityAdmins' && 'City Admin Management & City Assignment'}
                {activeTab === 'customers' && `Global Customer Directory (${customers.length} Registered)`}
                {activeTab === 'partners' && `Verified Marketplace Partners (${partners.length} Agencies)`}
                {activeTab === 'categories' && 'Service Category Master Directory'}
                {activeTab === 'subCategories' && 'Sub Category Services'}
                {activeTab === 'services' && 'Individual Service Packages & Base Pricing'}
                {activeTab === 'bookings' && `Master Bookings & Dispatch Log (${bookings.length} Total)`}
                {activeTab === 'payments' && 'Platform Commission & Partner Payout Ledger'}
                {activeTab === 'reports' && 'Financial Growth & Revenue Analytics Reports'}
                {activeTab === 'notifications' && 'Platform Notifications & System Broadcasts'}
                {activeTab === 'settings' && 'Global Platform Configuration & Commission %'}
                {activeTab === 'profile' && 'Super Admin Account Profile'}
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Multi-Service Platform Master Control • Dedicated Super Admin Panel
              </p>
            </div>
          </div>

          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <>
              {/* Platform Analytics Cards */}
              <PlatformAnalyticsGrid />

              {/* City Admins Control Quick View */}
              <CityAdminManagement />

              {/* Revenue & Booking Charts */}
              <div style={{ marginTop: '24px' }}>
                <AnalyticsCharts />
              </div>
            </>
          )}

          {/* TAB 2: CITY ADMINS */}
          {activeTab === 'cityAdmins' && (
            <CityAdminManagement />
          )}

          {/* TAB 3: CUSTOMERS */}
          {activeTab === 'customers' && (
            <div className="mui-card" style={{ padding: '26px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={20} color="#2563eb" /> Customer Directory ({customers.length} Registered)
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                      <th style={{ padding: '12px' }}>NAME</th>
                      <th style={{ padding: '12px' }}>EMAIL</th>
                      <th style={{ padding: '12px' }}>CITY</th>
                      <th style={{ padding: '12px' }}>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.length === 0 ? (
                      <tr><td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No customers registered yet.</td></tr>
                    ) : (
                      customers.map((c) => (
                        <tr key={c._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                          <td style={{ padding: '12px', fontWeight: '800' }}>{c.name}</td>
                          <td style={{ padding: '12px', fontSize: '0.85rem' }}>{c.email}</td>
                          <td style={{ padding: '12px', fontSize: '0.85rem', color: '#2563eb' }}>{c.city || 'Delhi NCR'}</td>
                          <td style={{ padding: '12px' }}><span className="badge badge-success">ACTIVE</span></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: PARTNERS */}
          {activeTab === 'partners' && (
            <div className="mui-card" style={{ padding: '26px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Briefcase size={20} color="#7c3aed" /> Marketplace Service Partners ({partners.length} Verified Agencies)
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                      <th style={{ padding: '12px' }}>AGENCY / PARTNER</th>
                      <th style={{ padding: '12px' }}>EMAIL</th>
                      <th style={{ padding: '12px' }}>CITY</th>
                      <th style={{ padding: '12px' }}>KYC STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {partners.length === 0 ? (
                      <tr><td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No partners registered yet.</td></tr>
                    ) : (
                      partners.map((p) => (
                        <tr key={p._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                          <td style={{ padding: '12px', fontWeight: '800' }}>{p.agencyName || p.name}</td>
                          <td style={{ padding: '12px', fontSize: '0.85rem' }}>{p.email}</td>
                          <td style={{ padding: '12px', fontSize: '0.85rem', color: '#2563eb' }}>{p.assignedCity || p.city || 'Delhi NCR'}</td>
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
          )}

          {/* TAB 5: CATEGORIES */}
          {activeTab === 'categories' && (
            <div className="mui-card" style={{ padding: '26px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                    <Grid size={20} color="#2563eb" /> Service Categories Master List ({categories.length})
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>Top-level categories for services</p>
                </div>
                <button onClick={() => setCatModalOpen(true)} className="btn btn-primary"><Plus size={16} /> Create Category</button>
              </div>

              {categories.length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>No categories created yet. Click "Create Category" to add one.</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                  {categories.map((cat) => {
                    const subCount = subCategories.filter(sc => (sc.category?._id || sc.category) === cat._id).length;
                    const srvCount = services.filter(s => (s.category?._id || s.category) === cat._id).length;
                    return (
                      <div key={cat._id} style={{ padding: '18px', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--text-primary)' }}>{cat.name}</div>
                            <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>ACTIVE</span>
                          </div>
                          {cat.description && (
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '6px 0 10px 0' }}>{cat.description}</p>
                          )}
                          <div style={{ display: 'flex', gap: '12px', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                            <span>📁 <strong>{subCount}</strong> Subcategories</span>
                            <span>🛠️ <strong>{srvCount}</strong> Services</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px dashed #e2e8f0' }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>/{cat.slug}</span>
                          <button onClick={() => deleteCategory(cat._id)} className="btn btn-danger btn-sm" title="Delete Category">
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: SUB CATEGORIES */}
          {activeTab === 'subCategories' && (
            <div className="mui-card" style={{ padding: '26px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                    <Layers size={20} color="#7c3aed" /> Sub Categories Management ({subCategories.length})
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>Sub-groupings belonging to parent categories</p>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <select
                    className="form-input"
                    style={{ width: '180px', padding: '6px 12px', fontSize: '0.82rem' }}
                    value={subCatFilterCategory}
                    onChange={(e) => setSubCatFilterCategory(e.target.value)}
                  >
                    <option value="">All Parent Categories</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                  <button onClick={() => setSubCatModalOpen(true)} className="btn btn-primary"><Plus size={16} /> Create SubCategory</button>
                </div>
              </div>

              {subCategories.length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>No subcategories found. Click "Create SubCategory" to add one.</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                  {subCategories
                    .filter((sc) => !subCatFilterCategory || (sc.category?._id || sc.category) === subCatFilterCategory)
                    .map((sub) => {
                      const parentCatName = typeof sub.category === 'object' ? sub.category?.name : categories.find(c => c._id === sub.category)?.name;
                      const srvCount = services.filter(s => (s.subCategory?._id || s.subCategory) === sub._id).length;
                      return (
                        <div key={sub._id} style={{ padding: '18px', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--text-primary)' }}>{sub.name}</div>
                              <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>
                                {parentCatName || 'Category Linked'}
                              </span>
                            </div>
                            {sub.description && (
                              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '6px 0 10px 0' }}>{sub.description}</p>
                            )}
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                              🛠️ <strong>{srvCount}</strong> Services attached
                            </div>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px dashed #e2e8f0' }}>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>/{sub.slug}</span>
                            <button onClick={() => deleteSubCategory(sub._id)} className="btn btn-danger btn-sm" title="Delete SubCategory">
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}

          {/* TAB 7: SERVICES */}
          {activeTab === 'services' && (
            <div className="mui-card" style={{ padding: '26px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                    <Wrench size={20} color="#2563eb" /> Individual Service Packages & Pricing ({services.length})
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>Specific services linked to a Category & SubCategory</p>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <select
                    className="form-input"
                    style={{ width: '160px', padding: '6px 12px', fontSize: '0.82rem' }}
                    value={srvFilterCategory}
                    onChange={(e) => {
                      setSrvFilterCategory(e.target.value);
                      setSrvFilterSubCategory('');
                    }}
                  >
                    <option value="">All Categories</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>

                  <select
                    className="form-input"
                    style={{ width: '160px', padding: '6px 12px', fontSize: '0.82rem' }}
                    value={srvFilterSubCategory}
                    onChange={(e) => setSrvFilterSubCategory(e.target.value)}
                  >
                    <option value="">All SubCategories</option>
                    {subCategories
                      .filter(sc => !srvFilterCategory || (sc.category?._id || sc.category) === srvFilterCategory)
                      .map((sc) => (
                        <option key={sc._id} value={sc._id}>{sc.name}</option>
                      ))}
                  </select>

                  <button onClick={() => setSrvModalOpen(true)} className="btn btn-primary"><Plus size={16} /> Create Service</button>
                </div>
              </div>

              {services.length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>No services found. Click "Create Service" to add one.</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                  {services
                    .filter((srv) => {
                      const cId = srv.category?._id || srv.category;
                      const scId = srv.subCategory?._id || srv.subCategory;
                      if (srvFilterCategory && cId !== srvFilterCategory) return false;
                      if (srvFilterSubCategory && scId !== srvFilterSubCategory) return false;
                      return true;
                    })
                    .map((srv) => {
                      const parentCatName = typeof srv.category === 'object' ? srv.category?.name : categories.find(c => c._id === srv.category)?.name;
                      const parentSubCatName = typeof srv.subCategory === 'object' ? srv.subCategory?.name : subCategories.find(s => s._id === srv.subCategory)?.name;

                      return (
                        <div key={srv._id} style={{ padding: '18px', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div style={{ fontWeight: '800', fontSize: '1.02rem', color: 'var(--text-primary)' }}>{srv.name}</div>
                              <div style={{ fontSize: '1rem', color: '#10b981', fontWeight: '800' }}>₹{srv.finalPrice || srv.price}</div>
                            </div>

                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                              <span className="badge badge-purple" style={{ fontSize: '0.68rem' }}>{parentCatName || 'Category'}</span>
                              <span className="badge badge-success" style={{ fontSize: '0.68rem' }}>{parentSubCatName || 'SubCategory'}</span>
                            </div>

                            {srv.description && (
                              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '8px 0 4px 0' }}>{srv.description}</p>
                            )}

                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                              ⏱️ Duration: <strong>{srv.duration || '45 mins'}</strong>
                              {srv.discount > 0 && <span style={{ marginLeft: '10px', color: '#ef4444' }}>Discount: ₹{srv.discount}</span>}
                            </div>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px dashed #e2e8f0' }}>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>/{srv.slug}</span>
                            <button onClick={() => deleteService(srv._id)} className="btn btn-danger btn-sm" title="Delete Service">
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}

          {/* TAB 8: BOOKINGS */}
          {activeTab === 'bookings' && (
            <div className="mui-card" style={{ padding: '26px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CalendarCheck size={20} color="#7c3aed" /> Master Bookings Log ({bookings.length} Total)
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                      <th style={{ padding: '12px' }}>BOOKING REF</th>
                      <th style={{ padding: '12px' }}>CUSTOMER</th>
                      <th style={{ padding: '12px' }}>SERVICE</th>
                      <th style={{ padding: '12px' }}>AMOUNT</th>
                      <th style={{ padding: '12px' }}>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.length === 0 ? (
                      <tr><td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No bookings created yet.</td></tr>
                    ) : (
                      bookings.map((b) => (
                        <tr key={b._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                          <td style={{ padding: '12px', fontWeight: '800', color: '#2563eb' }}>{b.bookingNumber || b._id.substring(0, 8).toUpperCase()}</td>
                          <td style={{ padding: '12px' }}>{b.customer?.name || 'Customer'}</td>
                          <td style={{ padding: '12px' }}>{b.serviceName || 'AC Service'}</td>
                          <td style={{ padding: '12px', fontWeight: '800', color: '#10b981' }}>₹{b.totalAmount || b.finalPrice || 599}</td>
                          <td style={{ padding: '12px' }}><span className="badge badge-purple">{b.status}</span></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 9: PAYMENTS */}
          {activeTab === 'payments' && (
            <div className="mui-card" style={{ padding: '26px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CreditCard size={20} color="#7c3aed" /> Platform Revenue & Commission Payout Ledger
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Total Platform Commission Collected: ₹{Number(dashboard?.platformCommission || 2496000).toLocaleString()} (20% default cut).
              </p>
            </div>
          )}

          {/* TAB 10: REPORTS */}
          {activeTab === 'reports' && (
            <div className="mui-card" style={{ padding: '26px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BarChart3 size={20} color="#2563eb" /> Growth & Financial Reports
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Export city revenue statements, partner payout summaries, and platform GST logs.
              </p>
            </div>
          )}

          {/* TAB 11: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="mui-card" style={{ padding: '26px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bell size={20} color="#7c3aed" /> System Broadcasts & Notifications
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Send global operational broadcasts to City Admins, Partners, or Customers.
              </p>
            </div>
          )}

          {/* TAB 12: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="mui-card" style={{ padding: '26px', maxWidth: '500px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Settings size={20} color="#2563eb" /> Platform Settings & Commission Rates
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Platform Default Commission (%)</label>
                  <input type="number" className="form-input" defaultValue={20} />
                </div>
                <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Save Configuration</button>
              </div>
            </div>
          )}

          {/* TAB 13: PROFILE */}
          {activeTab === 'profile' && (
            <div className="mui-card" style={{ padding: '26px', maxWidth: '500px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={20} color="#7c3aed" /> Super Admin Profile
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--gradient-brand)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1.2rem' }}>
                  {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'S'}
                </div>
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: '800' }}>{currentUser?.name || 'Super Admin'}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{currentUser?.email || 'superadmin@norozz.com'}</div>
                  <span className="badge badge-purple" style={{ marginTop: '4px' }}>MASTER CONTROL ROLE</span>
                </div>
              </div>
            </div>
          )}

        </main>

      </div>

      {/* CREATE CATEGORY MODAL */}
      {catModalOpen && (
        <div className="modal-overlay" onClick={() => setCatModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '28px', maxWidth: '440px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '16px' }}>Create New Category</h3>
            <form onSubmit={handleCreateCategorySubmit}>
              <div className="form-group">
                <label className="form-label">Category Name *</label>
                <input type="text" className="form-input" placeholder="e.g. Appliance Repair" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} required />
              </div>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">Description (Optional)</label>
                <input type="text" className="form-input" placeholder="Short summary" value={newCatDesc} onChange={(e) => setNewCatDesc(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setCatModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Category</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE SUBCATEGORY MODAL */}
      {subCatModalOpen && (
        <div className="modal-overlay" onClick={() => setSubCatModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '28px', maxWidth: '460px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '16px' }}>Create New SubCategory</h3>
            <form onSubmit={handleCreateSubCategorySubmit}>
              <div className="form-group">
                <label className="form-label">SubCategory Name *</label>
                <input type="text" className="form-input" placeholder="e.g. Split AC Service" value={newSubCatName} onChange={(e) => setNewSubCatName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Select Parent Category *</label>
                <select className="form-input" value={newSubCatCategory} onChange={(e) => setNewSubCatCategory(e.target.value)} required>
                  <option value="">-- Select Parent Category --</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">Description (Optional)</label>
                <input type="text" className="form-input" placeholder="Short description" value={newSubCatDesc} onChange={(e) => setNewSubCatDesc(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setSubCatModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create SubCategory</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE SERVICE MODAL */}
      {srvModalOpen && (
        <div className="modal-overlay" onClick={() => setSrvModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '28px', maxWidth: '500px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '16px' }}>Create New Service Package</h3>
            <form onSubmit={handleCreateServiceSubmit}>
              <div className="form-group">
                <label className="form-label">Service Package Name *</label>
                <input type="text" className="form-input" placeholder="e.g. AC Foam Jet Deep Cleaning" value={newSrvName} onChange={(e) => setNewSrvName(e.target.value)} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Select Category *</label>
                  <select
                    className="form-input"
                    value={newSrvCategory}
                    onChange={(e) => {
                      setNewSrvCategory(e.target.value);
                      setNewSrvSubCategory('');
                    }}
                    required
                  >
                    <option value="">-- Select Category --</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Select SubCategory *</label>
                  <select
                    className="form-input"
                    value={newSrvSubCategory}
                    onChange={(e) => setNewSrvSubCategory(e.target.value)}
                    disabled={!newSrvCategory}
                    required
                  >
                    <option value="">{newSrvCategory ? '-- Select SubCategory --' : '-- Select Category First --'}</option>
                    {subCategories
                      .filter(sc => (sc.category?._id || sc.category) === newSrvCategory)
                      .map((sc) => (
                        <option key={sc._id} value={sc._id}>{sc.name}</option>
                      ))}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Base Price (₹) *</label>
                  <input type="number" className="form-input" placeholder="599" value={newSrvPrice} onChange={(e) => setNewSrvPrice(e.target.value)} required min="0" />
                </div>
                <div className="form-group">
                  <label className="form-label">Discount (₹)</label>
                  <input type="number" className="form-input" placeholder="0" value={newSrvDiscount} onChange={(e) => setNewSrvDiscount(e.target.value)} min="0" />
                </div>
                <div className="form-group">
                  <label className="form-label">Duration</label>
                  <input type="text" className="form-input" placeholder="45 mins" value={newSrvDuration} onChange={(e) => setNewSrvDuration(e.target.value)} />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">Description (Optional)</label>
                <input type="text" className="form-input" placeholder="Detailed service description" value={newSrvDesc} onChange={(e) => setNewSrvDesc(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setSrvModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Service</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default SuperAdminPanel;
