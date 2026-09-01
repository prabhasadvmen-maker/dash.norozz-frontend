import { useState, useEffect } from 'react';
import SuperAdminNavbar from '../components/superAdmin/SuperAdminNavbar';
import SuperAdminSidebar from '../components/superAdmin/SuperAdminSidebar';
import AdminPackageManagementModal from '../components/admin/AdminPackageManagementModal';
import PlatformAnalyticsGrid from '../components/superAdmin/PlatformAnalyticsGrid';
import CityAdminManagement from '../components/superAdmin/CityAdminManagement';
import CityManagementView from '../components/superAdmin/CityManagementView';
import SuperAdminCouponsView from '../components/superAdmin/SuperAdminCouponsView';
import AnalyticsCharts from '../components/AnalyticsCharts';
import { useSuperAdmin } from '../hooks/useSuperAdmin.js';
import { useCatalog } from '../hooks/useCatalog.js';
import { superAdminService } from '../services/superAdmin.service.js';
import {
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
  X,
  Sparkles,
  Home,
  Zap,
  Scissors,
  Paintbrush,
  Car,
  Star,
  ShieldCheck,
  Eye,
  Gift,
  Trash2
} from 'lucide-react';

const SuperAdminPanel = ({ currentUser, onLogout }) => {
  const { dashboard, customers, partners, bookings, refetch } = useSuperAdmin();
  const {
    categories,
    subCategories,
    services,
    skills,
    createCategory,
    deleteCategory,
    createSubCategory,
    deleteSubCategory,
    createService,
    deleteService,
    createSkill,
    deleteSkill,
  } = useCatalog();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [refreshing, setRefreshing] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Formatted date string (Image 2 style: "Saturday, 29 August 2026")
  const currentDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const tabTitles = {
    dashboard: 'Overview',
    cityAdmins: 'City Admins Management',
    cities: 'Dynamic City Operations',
    coupons: 'Coupons & Promos',
    customers: 'Customer Directory',
    partners: 'Marketplace Partners',
    categories: 'Categories Directory',
    skills: 'Skill Management',
    subCategories: 'Sub Categories',
    services: 'Services & Pricing',
    bookings: 'Bookings & Dispatch',
    payments: 'Payments & Payouts',
    reviews: 'Reviews & Ratings',
    reports: 'Reports & Growth',
    notifications: 'Notifications & Broadcasts',
    settings: 'Platform Settings',
    profile: 'Super Admin Account',
  };

  // Category Modal state
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatImage, setNewCatImage] = useState('');
  const [newCatSkills, setNewCatSkills] = useState('');

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
  const [newSrvImage, setNewSrvImage] = useState('');
  const [newSrvPackages] = useState([
    { title: 'Basic Clean', price: 999, description: 'Mopping & basic vacuuming', features: 'Mopping & deep vacuuming\nBathroom dry wiping & cleaning\nLiving room basic dusting', isPopular: false },
    { title: 'Standard Deep Clean', price: 1499, description: 'Intense scrubbing & degreasing', features: 'Kitchen chimney + slab degreasing\nIntense bathroom wall scrubbing\nWet mop & mechanised floor scrub\nDry upholstery vacuuming', isPopular: true },
    { title: 'Ultra Premium Scrub', price: 2499, description: 'Complete sanitation & sterilisation', features: 'Complete sanitation & sterilisation\nWet safe shampoo dry wash\nGlass facade & full balcony wash\nWall spots scrubbing & spot clean', isPopular: false }
  ]);

  // Catalog Filters
  const [subCatFilterCategory, setSubCatFilterCategory] = useState('');
  const [srvFilterCategory, setSrvFilterCategory] = useState('');
  const [srvFilterSubCategory, setSrvFilterSubCategory] = useState('');

  // Package Management Modal State
  const [selectedServiceForPackages, setSelectedServiceForPackages] = useState(null);
  const [isPkgModalOpen, setIsPkgModalOpen] = useState(false);

  // Referral & Platform Settings State
  const [referralBonusAmount, setReferralBonusAmount] = useState(500);
  const [customerPlatformFeePercent, setCustomerPlatformFeePercent] = useState(5);
  const [partnerPlatformFeePercent, setPartnerPlatformFeePercent] = useState(10);
  const [savingReferral, setSavingReferral] = useState(false);
  const [savingPlatformFee, setSavingPlatformFee] = useState(false);
  const [referralSuccessMsg, setReferralSuccessMsg] = useState('');
  const [platformSuccessMsg, setPlatformSuccessMsg] = useState('');

  useEffect(() => {
    superAdminService
      .getSettings()
      .then((res) => {
        const data = res.data?.data || res.data || {};
        if (data.referralBonusAmount !== undefined) setReferralBonusAmount(data.referralBonusAmount);
        if (data.customerPlatformFeePercent !== undefined) setCustomerPlatformFeePercent(data.customerPlatformFeePercent);
        if (data.partnerPlatformFeePercent !== undefined) setPartnerPlatformFeePercent(data.partnerPlatformFeePercent);
      })
      .catch((err) => console.warn('Fetch settings error:', err));
  }, []);

  const handleSavePlatformFeeConfig = async (e) => {
    e.preventDefault();
    setSavingPlatformFee(true);
    setPlatformSuccessMsg('');
    try {
      const res = await superAdminService.updateSettings({
        customerPlatformFeePercent: Number(customerPlatformFeePercent),
        partnerPlatformFeePercent: Number(partnerPlatformFeePercent),
      });
      const data = res.data || {};
      if (data) {
        setPlatformSuccessMsg('Platform Fee & Commission Rates updated successfully!');
        setTimeout(() => setPlatformSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.error('Save platform fee error:', err);
    } finally {
      setSavingPlatformFee(false);
    }
  };

  const handleSaveReferralBonus = async (e) => {
    e.preventDefault();
    setSavingReferral(true);
    setReferralSuccessMsg('');
    try {
      const res = await superAdminService.updateSettings({
        referralBonusAmount: Number(referralBonusAmount),
      });
      const data = res.data || {};
      if (data) {
        setReferralSuccessMsg('Partner Referral Bonus updated successfully!');
        setTimeout(() => setReferralSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.error('Save referral bonus error:', err);
    } finally {
      setSavingReferral(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    refetch();
    setTimeout(() => setRefreshing(false), 600);
  };

  const handleCatImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 400;
          const MAX_HEIGHT = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
          setNewCatImage(compressedBase64);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSrvImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 600;
          const MAX_HEIGHT = 600;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
          setNewSrvImage(compressedBase64);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const renderCategoryIcon = (cat) => {
    const iconStr = cat.icon || cat.image || cat.thumbnail || '';
    
    // If base64 image or web image URL, render img element
    if (typeof iconStr === 'string' && (iconStr.startsWith('data:image') || iconStr.startsWith('http://') || iconStr.startsWith('https://') || iconStr.startsWith('/uploads/'))) {
      return (
        <img
          src={iconStr}
          alt={cat.name}
          style={{
            width: '46px',
            height: '46px',
            borderRadius: '14px',
            objectFit: 'cover',
            border: '1.5px solid #e2e8f0',
            boxShadow: '0 4px 10px rgba(0,0,0,0.06)',
            flexShrink: 0
          }}
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      );
    }

    // Map icon name or category name to appropriate Lucide Icon symbol
    const nameLower = (cat.name || '').toLowerCase();
    const iconLower = typeof iconStr === 'string' ? iconStr.toLowerCase() : '';

    let IconComp = Grid;
    let bg = '#ecfdf5';
    let border = '#a7f3d0';
    let color = '#10b981';

    if (iconLower === 'sparkles' || nameLower.includes('beauty') || nameLower.includes('salon') || nameLower.includes('spa') || nameLower.includes('skin')) {
      IconComp = Sparkles;
      bg = '#f3e8ff'; border = '#e9d5ff'; color = '#7c3aed';
    } else if (iconLower === 'home' || nameLower.includes('clean') || nameLower.includes('pest') || nameLower.includes('home')) {
      IconComp = Home;
      bg = '#eff6ff'; border = '#bfdbfe'; color = '#2563eb';
    } else if (iconLower === 'zap' || nameLower.includes('electric') || nameLower.includes('wire')) {
      IconComp = Zap;
      bg = '#fffbeb'; border = '#fde68a'; color = '#d97706';
    } else if (iconLower === 'wrench' || nameLower.includes('repair') || nameLower.includes('ac') || nameLower.includes('appliance') || nameLower.includes('plumb')) {
      IconComp = Wrench;
      bg = '#ecfdf5'; border = '#a7f3d0'; color = '#059669';
    } else if (iconLower === 'scissors' || nameLower.includes('hair') || nameLower.includes('grooming') || nameLower.includes('barber')) {
      IconComp = Scissors;
      bg = '#fdf2f8'; border = '#fbcfe8'; color = '#db2777';
    } else if (iconLower === 'paintbrush' || nameLower.includes('paint')) {
      IconComp = Paintbrush;
      bg = '#f0f9ff'; border = '#bae6fd'; color = '#0284c7';
    } else if (nameLower.includes('driver') || nameLower.includes('car') || nameLower.includes('cab')) {
      IconComp = Car;
      bg = '#f0fdf4'; border = '#bbf7d0'; color = '#16a34a';
    }

    return (
      <div style={{
        width: '46px',
        height: '46px',
        borderRadius: '14px',
        background: bg,
        border: `1.5px solid ${border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: color,
        boxShadow: '0 4px 10px rgba(0,0,0,0.03)',
        flexShrink: 0
      }}>
        <IconComp size={24} color={color} />
      </div>
    );
  };

  const handleCreateCategorySubmit = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const skillsArray = newCatSkills ? newCatSkills.split(',').map((s) => s.trim()).filter(Boolean) : [];
    await createCategory({
      name: newCatName.trim(),
      description: newCatDesc.trim(),
      image: newCatImage,
      icon: newCatImage,
      skills: skillsArray,
    });
    setNewCatName('');
    setNewCatDesc('');
    setNewCatImage('');
    setNewCatSkills('');
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
    if (!newSrvName.trim() || !newSrvCategory || !newSrvSubCategory) return;

    const res = await createService({
      name: newSrvName.trim(),
      category: newSrvCategory,
      subCategory: newSrvSubCategory,
      price: Number(newSrvPrice) || 0,
      discount: Number(newSrvDiscount) || 0,
      duration: newSrvDuration || '45 mins',
      description: newSrvDesc.trim(),
      image: newSrvImage,
      thumbnail: newSrvImage,
    });

    const createdSrv = res?.data?.data || res?.data || res;
    setNewSrvName('');
    setNewSrvCategory('');
    setNewSrvSubCategory('');
    setNewSrvPrice('');
    setNewSrvDiscount('');
    setNewSrvDuration('45 mins');
    setNewSrvDesc('');
    setNewSrvImage('');
    setSrvModalOpen(false);

    if (createdSrv?._id) {
      setSelectedServiceForPackages(createdSrv);
      setIsPkgModalOpen(true);
    }
  };

  // Skill Inputs State per Service & Category Filter
  const [skillInputs, setSkillInputs] = useState({});
  const [skillCatFilter, setSkillCatFilter] = useState('ALL');

  const handleAddSkillToService = async (serviceId, catId) => {
    const inputVal = skillInputs[serviceId]?.trim();
    if (!inputVal) return;
    await createSkill({ name: inputVal, service: serviceId, category: catId });
    setSkillInputs((prev) => ({ ...prev, [serviceId]: '' }));
  };

  const handleRemoveSkillFromCategory = async (skillId) => {
    await deleteSkill(skillId);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#f4f6f8', color: '#0f172a' }}>
      
      {/* Super Admin Dark Green Sticky Full-Height Sidebar */}
      <SuperAdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={onLogout}
        collapsed={collapsed}
      />

      {/* Main Right Column Container */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh', overflow: 'hidden' }}>

        {/* Super Admin Top Header */}
        <SuperAdminNavbar
          currentUser={currentUser}
          onLogout={onLogout}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          activeTitle={tabTitles[activeTab] || 'Overview'}
        />

        {/* Content View Area */}
        <main style={{ flex: 1, padding: '32px 36px', overflowY: 'auto', overflowX: 'hidden', maxWidth: '1600px', width: '100%', margin: '0 auto' }}>
          
          {/* Page Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: 0, color: '#0f172a', letterSpacing: '-0.5px' }}>
                {activeTab === 'dashboard' ? 'Overview' : tabTitles[activeTab]}
              </h1>
              <p style={{ fontSize: '0.88rem', color: '#64748b', marginTop: '4px', fontWeight: '500' }}>
                {currentDateStr}
              </p>
            </div>

            {/* System Live Pill (Image 2 exact style) */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              background: '#e6f4ea',
              border: '1px solid #a7f3d0',
              borderRadius: '9999px',
              boxShadow: '0 2px 6px rgba(16, 185, 129, 0.08)'
            }}>
              <span style={{
                width: '9px',
                height: '9px',
                borderRadius: '50%',
                background: '#10b981',
                boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.25)',
                display: 'inline-block'
              }}></span>
              <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#065f46' }}>
                System Live and Synchronized
              </span>
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

          {/* TAB 2.5: CITIES MANAGEMENT */}
          {activeTab === 'cities' && (
            <CityManagementView />
          )}

          {/* TAB 2.8: COUPONS & PROMOS */}
          {activeTab === 'coupons' && (
            <SuperAdminCouponsView />
          )}

          {/* TAB 3: CUSTOMERS */}
          {activeTab === 'customers' && (
            <div style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '26px',
              border: '1px solid #f0f0f0',
              boxShadow: '0 8px 26px rgba(0, 0, 0, 0.03)'
            }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '18px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={20} color="#10b981" /> Customer Directory ({customers.length} Registered)
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '0.78rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      <th style={{ padding: '12px', borderRadius: '8px 0 0 8px' }}>NAME</th>
                      <th style={{ padding: '12px' }}>EMAIL</th>
                      <th style={{ padding: '12px' }}>CITY</th>
                      <th style={{ padding: '12px', borderRadius: '0 8px 8px 0' }}>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.length === 0 ? (
                      <tr><td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontWeight: '600' }}>No customers registered yet.</td></tr>
                    ) : (
                      customers.map((c) => (
                        <tr key={c._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '12px', fontWeight: '800', color: '#0f172a' }}>{c.name}</td>
                          <td style={{ padding: '12px', fontSize: '0.85rem', color: '#475569', fontWeight: '600' }}>{c.email}</td>
                          <td style={{ padding: '12px', fontSize: '0.85rem', color: '#2563eb', fontWeight: '700' }}>{c.city || 'Delhi NCR'}</td>
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
            <div style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '26px',
              border: '1px solid #f0f0f0',
              boxShadow: '0 8px 26px rgba(0, 0, 0, 0.03)'
            }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '18px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Briefcase size={20} color="#10b981" /> Marketplace Service Partners ({partners.length} Verified Agencies)
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '0.78rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      <th style={{ padding: '12px', borderRadius: '8px 0 0 8px' }}>TECHNICIAN / PARTNER</th>
                      <th style={{ padding: '12px' }}>SKILL CATEGORY</th>
                      <th style={{ padding: '12px' }}>EMAIL</th>
                      <th style={{ padding: '12px' }}>CITY</th>
                      <th style={{ padding: '12px', borderRadius: '0 8px 8px 0' }}>KYC STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {partners.length === 0 ? (
                      <tr><td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontWeight: '600' }}>No partners registered yet.</td></tr>
                    ) : (
                      partners.map((p) => (
                        <tr key={p._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '12px', fontWeight: '800', color: '#0f172a' }}>{p.name}</td>
                          <td style={{ padding: '12px', fontSize: '0.85rem', color: '#475569', fontWeight: '600' }}>{p.category || 'Service Technician'}</td>
                          <td style={{ padding: '12px', fontSize: '0.85rem', color: '#475569', fontWeight: '600' }}>{p.email}</td>
                          <td style={{ padding: '12px', fontSize: '0.85rem', color: '#2563eb', fontWeight: '700' }}>{p.assignedCity || p.city || 'Delhi NCR'}</td>
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
            <div style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '26px',
              border: '1px solid #f0f0f0',
              boxShadow: '0 8px 26px rgba(0, 0, 0, 0.03)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                    <Grid size={20} color="#10b981" /> Service Categories Master List ({categories.length})
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0 0 0' }}>Top-level categories for services</p>
                </div>
                <button
                  onClick={() => setCatModalOpen(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 18px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: '700',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)'
                  }}
                >
                  <Plus size={16} /> Create Category
                </button>
              </div>

              {categories.length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', color: '#64748b', fontWeight: '600' }}>No categories created yet. Click "Create Category" to add one.</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                  {categories.map((cat) => {
                    const subCount = subCategories.filter(sc => (sc.category?._id || sc.category) === cat._id).length;
                    const srvCount = services.filter(s => (s.category?._id || s.category) === cat._id).length;
                    const catSkills = skills.filter((sk) => {
                      const cId = typeof sk.category === 'object' ? sk.category?._id : sk.category;
                      return cId === cat._id;
                    });
                    const iconUrl = cat.icon || cat.image;

                    return (
                      <div
                        key={cat._id}
                        style={{
                          padding: '22px',
                          background: '#ffffff',
                          borderRadius: '18px',
                          border: '1px solid #e2e8f0',
                          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div>
                          {/* Top Row: Icon/Image + Name + Status Badge */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              {renderCategoryIcon(cat)}

                              <div>
                                <div style={{ fontWeight: '800', fontSize: '1.1rem', color: '#0f172a', lineHeight: '1.2' }}>
                                  {cat.name}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', marginTop: '2px', fontFamily: 'monospace' }}>
                                  /{cat.slug}
                                </div>
                              </div>
                            </div>

                            <span style={{
                              fontSize: '0.72rem',
                              fontWeight: '800',
                              padding: '4px 10px',
                              borderRadius: '9999px',
                              background: '#ecfdf5',
                              color: '#047857',
                              border: '1px solid #a7f3d0',
                              whiteSpace: 'nowrap'
                            }}>
                              ● ACTIVE
                            </span>
                          </div>

                          {/* Description */}
                          {cat.description && (
                            <p style={{ fontSize: '0.85rem', color: '#475569', margin: '8px 0 14px 0', fontWeight: '500', lineHeight: '1.4' }}>
                              {cat.description}
                            </p>
                          )}

                          {/* Metrics Badges */}
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
                            <span style={{
                              fontSize: '0.78rem',
                              fontWeight: '700',
                              color: '#3b82f6',
                              background: '#eff6ff',
                              border: '1px solid #bfdbfe',
                              padding: '4px 10px',
                              borderRadius: '8px'
                            }}>
                              📁 <strong>{subCount}</strong> Subcategories
                            </span>
                            <span style={{
                              fontSize: '0.78rem',
                              fontWeight: '700',
                              color: '#7c3aed',
                              background: '#f5f3ff',
                              border: '1px solid #ddd6fe',
                              padding: '4px 10px',
                              borderRadius: '8px'
                            }}>
                              🛠️ <strong>{srvCount}</strong> Services
                            </span>
                            <span style={{
                              fontSize: '0.78rem',
                              fontWeight: '700',
                              color: '#059669',
                              background: '#ecfdf5',
                              border: '1px solid #a7f3d0',
                              padding: '4px 10px',
                              borderRadius: '8px'
                            }}>
                              ⚡ <strong>{catSkills.length}</strong> Skills
                            </span>
                          </div>

                          {/* Skills Preview */}
                          {catSkills.length > 0 && (
                            <div style={{ marginBottom: '14px' }}>
                              <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.5px' }}>
                                Onboarding Skills ({catSkills.length}):
                              </div>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                {catSkills.slice(0, 4).map((sk) => (
                                  <span
                                    key={sk._id}
                                    style={{
                                      fontSize: '0.74rem',
                                      fontWeight: '700',
                                      padding: '3px 8px',
                                      borderRadius: '6px',
                                      background: '#f8fafc',
                                      border: '1px solid #e2e8f0',
                                      color: '#334155'
                                    }}
                                  >
                                    {sk.name}
                                  </span>
                                ))}
                                {catSkills.length > 4 && (
                                  <span style={{ fontSize: '0.74rem', fontWeight: '700', color: '#64748b', alignSelf: 'center' }}>
                                    +{catSkills.length - 4} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Footer Action Row */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', paddingTop: '12px', borderTop: '1px dashed #e2e8f0' }}>
                          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>
                            ID: <span style={{ fontFamily: 'monospace' }}>{cat._id.slice(-6)}</span>
                          </span>
                          <button
                            onClick={() => deleteCategory(cat._id)}
                            style={{
                              background: '#fef2f2',
                              color: '#dc2626',
                              border: '1px solid #fecaca',
                              padding: '6px 14px',
                              borderRadius: '8px',
                              fontWeight: '700',
                              fontSize: '0.82rem',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            title="Delete Category"
                          >
                            <Trash2 size={14} /> Delete Category
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 5.5: SERVICE-WISE SKILL MANAGEMENT PAGE */}
          {activeTab === 'skills' && (
            <div style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '26px',
              border: '1px solid #f0f0f0',
              boxShadow: '0 8px 26px rgba(0, 0, 0, 0.03)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                    <Grid size={22} color="#10b981" /> Service-wise Skill Options Management ({services.length} Services)
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                    Select a Service under any Category to add specific technical skills. Partners will select these skills during Step 3 Onboarding.
                  </p>
                </div>

                {/* Category Filter Dropdown */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '0.84rem', fontWeight: '700', color: '#475569' }}>Filter Category:</span>
                  <select
                    value={skillCatFilter}
                    onChange={(e) => setSkillCatFilter(e.target.value)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '12px',
                      border: '1.5px solid #cbd5e1',
                      background: '#ffffff',
                      fontSize: '0.86rem',
                      fontWeight: '700',
                      outline: 'none',
                      color: '#0f172a',
                    }}
                  >
                    <option value="ALL">All Categories ({categories.length})</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {services.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No services found. Please create a Service under a Category first.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
                  {services
                    .filter((srv) => {
                      if (skillCatFilter === 'ALL') return true;
                      const srvCatId = typeof srv.category === 'object' ? srv.category?._id : srv.category;
                      return String(srvCatId) === String(skillCatFilter);
                    })
                    .map((srv) => {
                      const srvSkills = skills.filter((sk) => {
                        const skSrvId = typeof sk.service === 'object' ? sk.service?._id : sk.service;
                        const skCatId = typeof sk.category === 'object' ? sk.category?._id : sk.category;
                        const srvCatId = typeof srv.category === 'object' ? srv.category?._id : srv.category;
                        return String(skSrvId) === String(srv._id) || (!skSrvId && String(skCatId) === String(srvCatId));
                      });

                      const parentCatName = typeof srv.category === 'object' ? srv.category?.name : (categories.find((c) => String(c._id) === String(srv.category))?.name || 'Category');

                      return (
                        <div
                          key={srv._id}
                          style={{
                            padding: '22px',
                            background: '#ffffff',
                            borderRadius: '18px',
                            border: '1.5px solid #e2e8f0',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                              <div>
                                <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#16a34a', textTransform: 'uppercase', background: '#f0fdf4', padding: '3px 8px', borderRadius: '6px', border: '1px solid #bbf7d0', display: 'inline-block', marginBottom: '4px' }}>
                                  {parentCatName}
                                </span>
                                <div style={{ fontWeight: '800', fontSize: '1.08rem', color: '#0f172a', lineHeight: '1.3' }}>
                                  {srv.name}
                                </div>
                              </div>
                              <span className="badge badge-purple" style={{ fontSize: '0.75rem', fontWeight: '700' }}>
                                {srvSkills.length} Skills
                              </span>
                            </div>

                            {/* Skill Tags List */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '18px', minHeight: '44px', alignItems: 'center' }}>
                              {srvSkills.length === 0 ? (
                                <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontStyle: 'italic' }}>
                                  No skills created for this service yet. Type skill name below & hit Enter.
                                </span>
                              ) : (
                                srvSkills.map((sk) => (
                                  <span
                                    key={sk._id}
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                      padding: '6px 12px',
                                      borderRadius: '20px',
                                      background: '#f0fdf4',
                                      border: '1px solid #bbf7d0',
                                      color: '#15803d',
                                      fontSize: '0.8rem',
                                      fontWeight: '700',
                                    }}
                                  >
                                    {sk.name}
                                    <Trash2
                                      size={13}
                                      color="#ef4444"
                                      style={{ cursor: 'pointer' }}
                                      onClick={() => handleRemoveSkillFromCategory(sk._id)}
                                      title="Delete Skill Document"
                                    />
                                  </span>
                                ))
                              )}
                            </div>
                          </div>

                          {/* Add Skill Input Box */}
                          <div style={{ display: 'flex', gap: '8px', paddingTop: '14px', borderTop: '1px dashed #e2e8f0' }}>
                            <input
                              type="text"
                              placeholder={`+ Add skill for ${srv.name}...`}
                              value={skillInputs[srv._id] || ''}
                              onChange={(e) => setSkillInputs({ ...skillInputs, [srv._id]: e.target.value })}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  const cId = typeof srv.category === 'object' ? srv.category?._id : srv.category;
                                  handleAddSkillToService(srv._id, cId);
                                }
                              }}
                              style={{
                                flex: 1,
                                padding: '9px 12px',
                                borderRadius: '12px',
                                border: '1px solid #cbd5e1',
                                fontSize: '0.84rem',
                                outline: 'none',
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const cId = typeof srv.category === 'object' ? srv.category?._id : srv.category;
                                handleAddSkillToService(srv._id, cId);
                              }}
                              style={{
                                padding: '9px 14px',
                                borderRadius: '12px',
                                background: '#16a34a',
                                color: '#ffffff',
                                border: 'none',
                                fontWeight: '700',
                                fontSize: '0.82rem',
                                cursor: 'pointer',
                              }}
                            >
                              Add
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
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', margin: 0, color: '#0f172a' }}>
                    <Layers size={22} color="#7c3aed" /> Sub Categories Management ({subCategories.length})
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '4px 0 0 0', fontWeight: '500' }}>Sub-groupings belonging to parent categories</p>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <select
                    style={{
                      width: '200px',
                      padding: '8px 12px',
                      fontSize: '0.85rem',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      color: '#0f172a',
                      fontWeight: '600',
                      outline: 'none'
                    }}
                    value={subCatFilterCategory}
                    onChange={(e) => setSubCatFilterCategory(e.target.value)}
                  >
                    <option value="">All Parent Categories</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => setSubCatModalOpen(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '9px 18px',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '10px',
                      fontWeight: '700',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)'
                    }}
                  >
                    <Plus size={16} /> Create SubCategory
                  </button>
                </div>
              </div>

              {subCategories.length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', color: '#64748b', fontWeight: '600' }}>No subcategories found. Click "Create SubCategory" to add one.</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
                  {subCategories
                    .filter((sc) => !subCatFilterCategory || (sc.category?._id || sc.category) === subCatFilterCategory)
                    .map((sub) => {
                      const parentCatName = typeof sub.category === 'object' ? sub.category?.name : categories.find(c => c._id === sub.category)?.name;
                      const srvCount = services.filter(s => (s.subCategory?._id || s.subCategory) === sub._id).length;
                      return (
                        <div
                          key={sub._id}
                          style={{
                            padding: '20px',
                            background: '#ffffff',
                            borderRadius: '16px',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.03)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                              <div style={{ fontWeight: '800', fontSize: '1.05rem', color: '#0f172a' }}>{sub.name}</div>
                              <span style={{
                                fontSize: '0.72rem',
                                fontWeight: '700',
                                padding: '3px 10px',
                                borderRadius: '9999px',
                                background: '#f3e8ff',
                                color: '#7c3aed',
                                border: '1px solid #e9d5ff',
                                whiteSpace: 'nowrap'
                              }}>
                                {parentCatName || 'Category Linked'}
                              </span>
                            </div>
                            {sub.description && (
                              <p style={{ fontSize: '0.85rem', color: '#475569', margin: '8px 0 10px 0', fontWeight: '500', lineHeight: '1.4' }}>{sub.description}</p>
                            )}
                            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '10px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              🛠️ <strong style={{ color: '#0f172a' }}>{srvCount}</strong> Services attached
                            </div>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '18px', paddingTop: '14px', borderTop: '1px dashed #e2e8f0' }}>
                            <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace', fontWeight: '600' }}>/{sub.slug}</span>
                            <button
                              onClick={() => deleteSubCategory(sub._id)}
                              style={{
                                background: '#fef2f2',
                                color: '#dc2626',
                                border: '1px solid #fecaca',
                                padding: '6px 12px',
                                borderRadius: '8px',
                                fontWeight: '700',
                                fontSize: '0.82rem',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                              title="Delete SubCategory"
                            >
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
                      const srvImg = srv.thumbnail || srv.image;

                      return (
                        <div key={srv._id} style={{ padding: '18px', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <div>
                            {srvImg && (
                              <div style={{ width: '100%', height: '110px', borderRadius: '8px', overflow: 'hidden', marginBottom: '12px' }}>
                                <img src={srvImg} alt={srv.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              </div>
                            )}

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

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px dashed #e2e8f0', gap: '8px', flexWrap: 'wrap' }}>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedServiceForPackages(srv);
                                setIsPkgModalOpen(true);
                              }}
                              className="btn btn-primary btn-sm"
                              style={{ fontWeight: '800', fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                            >
                              📦 Manage Packages
                            </button>
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
                      bookings.map((b) => {
                        const custName = typeof b.customer === 'object' && b.customer?.name
                          ? b.customer.name
                          : (b.customer?.email || 'Customer');
                        const srvTitle = b.packageName || (typeof b.service === 'object' && b.service?.name ? b.service.name : b.serviceName) || 'Home Service';
                        const bAmount = b.amount ?? b.totalAmount ?? b.financialSnapshot?.customerPayable ?? 0;
                        const refCode = b.bookingNumber || b.bookingId || (b._id ? b._id.substring(0, 8).toUpperCase() : 'NZ-BOOKING');

                        return (
                          <tr key={b._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                            <td style={{ padding: '12px', fontWeight: '800', color: '#2563eb' }}>{refCode}</td>
                            <td style={{ padding: '12px', fontWeight: '700' }}>{custName}</td>
                            <td style={{ padding: '12px' }}>{srvTitle}</td>
                            <td style={{ padding: '12px', fontWeight: '800', color: '#10b981' }}>₹{Number(bAmount).toLocaleString()}</td>
                            <td style={{ padding: '12px' }}><span className="badge badge-purple">{(b.status || 'Pending').toUpperCase()}</span></td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 9: PAYMENTS / FINANCIAL OVERVIEW */}
          {activeTab === 'payments' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{
                background: '#ffffff',
                borderRadius: '20px',
                padding: '26px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <CreditCard size={22} color="#10b981" /> NOROZZ FINANCIAL OVERVIEW
                    </h3>
                    <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '4px 0 0 0', fontWeight: '500' }}>
                      Master Dual-Sided Revenue, Partner Payouts & Double-Entry Ledger Summary
                    </p>
                  </div>
                  <span style={{
                    padding: '6px 14px',
                    borderRadius: '9999px',
                    background: '#ecfdf5',
                    color: '#047857',
                    fontSize: '0.78rem',
                    fontWeight: '800',
                    border: '1px solid #a7f3d0'
                  }}>
                    ● LIVE AUDIT LEDGER
                  </span>
                </div>

                {/* Top Metrics Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ padding: '18px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Gross Booking Value</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', marginTop: '6px' }}>₹1,00,000</div>
                  </div>

                  <div style={{ padding: '18px', background: '#eff6ff', borderRadius: '16px', border: '1px solid #bfdbfe' }}>
                    <div style={{ fontSize: '0.75rem', color: '#1d4ed8', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Customer Platform Fees</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#2563eb', marginTop: '6px' }}>+ ₹5,000</div>
                  </div>

                  <div style={{ padding: '18px', background: '#f5f3ff', borderRadius: '16px', border: '1px solid #ddd6fe' }}>
                    <div style={{ fontSize: '0.75rem', color: '#6d28d9', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Partner Commissions</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#7c3aed', marginTop: '6px' }}>+ ₹5,000</div>
                  </div>

                  <div style={{ padding: '18px', background: '#ecfdf5', borderRadius: '16px', border: '1px solid #a7f3d0' }}>
                    <div style={{ fontSize: '0.75rem', color: '#047857', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Gross Platform Revenue</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#059669', marginTop: '6px' }}>₹10,000</div>
                  </div>
                </div>

                {/* Ledger Breakdown Card */}
                <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '22px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: '800', color: '#0f172a', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Platform Net Contribution & Revenue Deductions
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#334155', fontWeight: '600' }}>
                      <span>Gross Platform Revenue</span>
                      <span style={{ fontWeight: '800', color: '#0f172a' }}>₹10,000</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dc2626', fontWeight: '600' }}>
                      <span>Customer Refunds & Adjustments</span>
                      <span style={{ fontWeight: '800' }}>- ₹1,000</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#d97706', fontWeight: '600' }}>
                      <span>Payment Gateway Charges (Razorpay / UPI)</span>
                      <span style={{ fontWeight: '800' }}>- ₹300</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontWeight: '600' }}>
                      <span>Statutory & Other Adjustments</span>
                      <span style={{ fontWeight: '800' }}>- ₹200</span>
                    </div>
                    <div style={{ height: '1px', background: '#cbd5e1', margin: '6px 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: '800' }}>
                      <span style={{ color: '#0f172a' }}>Net Platform Revenue / Contribution</span>
                      <span style={{ color: '#059669' }}>₹8,500</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9.5: REVIEWS & RATINGS MODERATION */}
          {activeTab === 'reviews' && (() => {
            const liveReviews = (bookings || [])
              .filter((b) => b.rating || b.customerRated || b.reviewComment)
              .map((b) => ({
                _id: b._id,
                reviewerName: typeof b.customer === 'object' && b.customer?.name ? b.customer.name : (b.customer?.email || 'Customer'),
                reviewerRole: 'CUSTOMER',
                revieweeName: typeof b.partner === 'object' && (b.partner?.name || b.partner?.agencyName) ? (b.partner.name || b.partner.agencyName) : (b.partnerName || 'Service Partner'),
                revieweeRole: 'PARTNER',
                rating: b.rating || 5,
                comment: b.reviewComment || 'Great service experience!',
                status: 'PUBLISHED',
                date: b.updatedAt ? new Date(b.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent',
              }));

            const ratingsList = liveReviews.map(r => r.rating);
            const avgRating = ratingsList.length > 0
              ? (ratingsList.reduce((a, b) => a + b, 0) / ratingsList.length).toFixed(1)
              : '5.0';

            return (
              <div className="mui-card" style={{ padding: '26px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Star size={22} color="#f59e0b" fill="#f59e0b" /> Reviews & Two-Way Ratings Moderation
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0 0 0' }}>
                      Manage customer and partner reviews, moderate inappropriate content, and view platform ratings
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <span className="badge badge-purple" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
                      ⭐ {avgRating} Platform Average Rating
                    </span>
                  </div>
                </div>

                {/* Reviews Moderation Table */}
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                        <th style={{ padding: '12px' }}>REVIEWER</th>
                        <th style={{ padding: '12px' }}>REVIEWEE</th>
                        <th style={{ padding: '12px' }}>RATING</th>
                        <th style={{ padding: '12px' }}>COMMENT / FEEDBACK</th>
                        <th style={{ padding: '12px' }}>STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {liveReviews.length === 0 ? (
                        <tr>
                          <td colSpan={5} style={{ padding: '28px', textAlign: 'center', color: 'var(--text-muted)' }}>
                            No customer or partner ratings submitted yet.
                          </td>
                        </tr>
                      ) : (
                        liveReviews.map((rev) => (
                          <tr key={rev._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                            <td style={{ padding: '12px' }}>
                              <div style={{ fontWeight: '800', fontSize: '0.88rem', color: '#0f172a' }}>{rev.reviewerName}</div>
                              <span className={`badge ${rev.reviewerRole === 'CUSTOMER' ? 'badge-blue' : 'badge-purple'}`} style={{ fontSize: '0.65rem' }}>
                                {rev.reviewerRole}
                              </span>
                            </td>

                            <td style={{ padding: '12px' }}>
                              <div style={{ fontWeight: '800', fontSize: '0.88rem', color: '#0f172a' }}>{rev.revieweeName}</div>
                              <span className={`badge ${rev.revieweeRole === 'CUSTOMER' ? 'badge-blue' : 'badge-purple'}`} style={{ fontSize: '0.65rem' }}>
                                {rev.revieweeRole}
                              </span>
                            </td>

                            <td style={{ padding: '12px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b', fontWeight: '800' }}>
                                <Star size={16} fill="#f59e0b" color="#f59e0b" />
                                <span>{rev.rating}.0</span>
                              </div>
                            </td>

                            <td style={{ padding: '12px', fontSize: '0.84rem', color: '#334155', maxWidth: '320px' }}>
                              "{rev.comment}"
                            </td>

                            <td style={{ padding: '12px' }}>
                              <span className={`badge ${rev.status === 'PUBLISHED' ? 'badge-success' : 'badge-warning'}`}>
                                {rev.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}

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
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
              <div className="mui-card" style={{ padding: '26px', maxWidth: '480px', flex: '1 1 400px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Settings size={20} color="#2563eb" /> Platform Fee & Commission Rates
                </h3>
                <p style={{ fontSize: '0.84rem', color: '#64748b', marginBottom: '16px' }}>
                  Set the percentage fee charged to customers on bookings and commission rate for service partners.
                </p>
                <form onSubmit={handleSavePlatformFeeConfig} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: '800', color: '#0f172a' }}>Customer Platform Fee (%)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={customerPlatformFeePercent}
                      onChange={(e) => setCustomerPlatformFeePercent(e.target.value)}
                      placeholder="e.g. 5"
                      min={0}
                      max={100}
                      required
                      style={{ fontSize: '1.1rem', fontWeight: '800' }}
                    />
                    <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                      Current: <strong>{customerPlatformFeePercent}%</strong> added to customer's booking total.
                    </span>
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: '800', color: '#0f172a' }}>Partner Platform Fee / Commission (%)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={partnerPlatformFeePercent}
                      onChange={(e) => setPartnerPlatformFeePercent(e.target.value)}
                      placeholder="e.g. 10"
                      min={0}
                      max={100}
                      required
                      style={{ fontSize: '1.1rem', fontWeight: '800' }}
                    />
                    <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                      Current: <strong>{partnerPlatformFeePercent}%</strong> commission deducted from partner payout.
                    </span>
                  </div>

                  {platformSuccessMsg && (
                    <div style={{ background: '#f0fdf4', color: '#15803d', padding: '10px 14px', border: '1px solid #bbf7d0', fontSize: '0.84rem', fontWeight: '800', borderRadius: '8px' }}>
                      ✓ {platformSuccessMsg}
                    </div>
                  )}

                  <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', padding: '12px 20px', fontWeight: '800' }} disabled={savingPlatformFee}>
                    {savingPlatformFee ? 'Saving...' : 'Save Configuration'}
                  </button>
                </form>
              </div>

              <div className="mui-card" style={{ padding: '26px', maxWidth: '520px', flex: '1 1 400px', borderLeft: '4px solid #701a75' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '900', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: '#701a75' }}>
                  <Gift size={22} color="#c026d3" /> Partner Referral Bonus Program Settings
                </h3>
                <p style={{ fontSize: '0.84rem', color: '#64748b', marginBottom: '16px' }}>
                  Configure the referral bonus amount credited to partners when a referred technician registers and completes their 1st booking.
                </p>
                <form onSubmit={handleSaveReferralBonus} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: '800', color: '#0f172a' }}>Partner Referral Bonus Per Signup (₹)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={referralBonusAmount}
                      onChange={(e) => setReferralBonusAmount(e.target.value)}
                      placeholder="e.g. 500"
                      min={0}
                      required
                      style={{ fontSize: '1.1rem', fontWeight: '800' }}
                    />
                  </div>
                  {referralSuccessMsg && (
                    <div style={{ background: '#f0fdf4', color: '#15803d', padding: '10px 14px', border: '1px solid #bbf7d0', fontSize: '0.84rem', fontWeight: '800' }}>
                      ✓ {referralSuccessMsg}
                    </div>
                  )}
                  <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', background: '#701a75', border: 'none', padding: '12px 20px', fontWeight: '800' }} disabled={savingReferral}>
                    {savingReferral ? 'Saving...' : 'Save Referral Bonus'}
                  </button>
                </form>
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>Create New Category</h3>
              <button
                type="button"
                onClick={() => setCatModalOpen(false)}
                style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '50%', color: '#64748b', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateCategorySubmit}>
              <div className="form-group">
                <label className="form-label">Category Name *</label>
                <input type="text" className="form-input" placeholder="e.g. Appliance Repair" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Category Image (Upload Icon / Photo)</label>
                <input type="file" accept="image/*" className="form-input" onChange={handleCatImageChange} />
                {newCatImage && (
                  <div style={{ marginTop: '10px', textAlign: 'center' }}>
                    <img
                      src={newCatImage}
                      alt="Category Preview"
                      style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover', border: '2px solid #2563eb', boxShadow: '0 4px 12px rgba(37,99,235,0.15)' }}
                    />
                  </div>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Description (Optional)</label>
                <input type="text" className="form-input" placeholder="Short summary" value={newCatDesc} onChange={(e) => setNewCatDesc(e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">Category Skills (Comma-separated for Technician Onboarding)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Split AC Installation, Gas Leakage Repair, PCB Board Repair"
                  value={newCatSkills}
                  onChange={(e) => setNewCatSkills(e.target.value)}
                />
                <small style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                  These skills will automatically appear on Partner Onboarding Step 4 when this category is selected.
                </small>
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>Create New SubCategory</h3>
              <button
                type="button"
                onClick={() => setSubCatModalOpen(false)}
                style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '50%', color: '#64748b', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>Create New Service Package</h3>
              <button
                type="button"
                onClick={() => setSrvModalOpen(false)}
                style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '50%', color: '#64748b', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>
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
              <div className="form-group">
                <label className="form-label">Service Image (Upload Photo / Banner)</label>
                <input type="file" accept="image/*" className="form-input" onChange={handleSrvImageChange} />
                {newSrvImage && (
                  <div style={{ marginTop: '10px', textAlign: 'center' }}>
                    <img
                      src={newSrvImage}
                      alt="Service Preview"
                      style={{ width: '130px', height: '80px', borderRadius: '10px', objectFit: 'cover', border: '2px solid #2563eb', boxShadow: '0 4px 12px rgba(37,99,235,0.15)' }}
                    />
                  </div>
                )}
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

      {/* Dedicated Service Package Management Modal */}
      <AdminPackageManagementModal
        isOpen={isPkgModalOpen}
        onClose={() => setIsPkgModalOpen(false)}
        service={selectedServiceForPackages}
      />

    </div>
  );
};

export default SuperAdminPanel;
