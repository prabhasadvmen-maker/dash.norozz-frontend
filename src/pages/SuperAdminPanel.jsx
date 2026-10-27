import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SuperAdminNavbar from '../components/superAdmin/SuperAdminNavbar';
import SuperAdminSidebar from '../components/superAdmin/SuperAdminSidebar';
import AdminPackageManagementModal from '../components/admin/AdminPackageManagementModal';
import PlatformAnalyticsGrid from '../components/superAdmin/PlatformAnalyticsGrid';
import CityAdminManagement from '../components/superAdmin/CityAdminManagement';
import CityManagementView from '../components/superAdmin/CityManagementView';
import SuperAdminCouponsView from '../components/superAdmin/SuperAdminCouponsView';
import SuperAdminBannersView from '../components/superAdmin/SuperAdminBannersView';
import SuperAdminFaqsView from '../components/superAdmin/SuperAdminFaqsView';
import SuperAdminPartnerHiringView from '../components/superAdmin/SuperAdminPartnerHiringView';
import SuperAdminTicketsView from '../components/superAdmin/SuperAdminTicketsView';
import SuperAdminReferralView from '../components/superAdmin/SuperAdminReferralView';
import SuperAdminLegalPoliciesView from '../components/superAdmin/SuperAdminLegalPoliciesView';
import SuperAdminStarterPackView from '../components/superAdmin/SuperAdminStarterPackView';
import SuperAdminNotificationsView from '../components/superAdmin/SuperAdminNotificationsView';
import SuperAdminReportsView from '../components/superAdmin/SuperAdminReportsView';
import SuperAdminPaymentsView from '../components/superAdmin/SuperAdminPaymentsView';
import SuperAdminCustomersView from '../components/superAdmin/SuperAdminCustomersView';
import SuperAdminPartnersView from '../components/superAdmin/SuperAdminPartnersView';
import SuperAdminReviewsView from '../components/superAdmin/SuperAdminReviewsView';
import SuperAdminSubCategoriesView from '../components/superAdmin/SuperAdminSubCategoriesView';
import SuperAdminServicesView from '../components/superAdmin/SuperAdminServicesView';
import SuperAdminCategoriesView from '../components/superAdmin/SuperAdminCategoriesView';
import AnalyticsCharts from '../components/AnalyticsCharts';
import { useSuperAdmin } from '../hooks/useSuperAdmin.js';
import { useCatalog } from '../hooks/useCatalog.js';
import { superAdminService } from '../services/superAdmin.service.js';
import {
  Grid,
  CalendarCheck,
  Bell,
  Settings,
  User,
  X,
  Sparkles,
  Home,
  Zap,
  Scissors,
  Paintbrush,
  Car,
  ShieldCheck,
  Eye,
  Gift
} from 'lucide-react';

const fmtBookingDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');
const fmtBookingTime = (d) => (d ? new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '');

const SuperAdminPanel = ({ currentUser, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const getTabFromPath = (path) => {
    const p = path.toLowerCase();
    if (p.includes('/super-admin/city-admins')) return 'cityAdmins';
    if (p.includes('/super-admin/city-management') || p.includes('/super-admin/cities')) return 'cities';
    if (p.includes('/super-admin/support-tickets') || p.includes('/super-admin/tickets')) return 'tickets';
    if (p.includes('/super-admin/coupons')) return 'coupons';
    if (p.includes('/super-admin/starter-pack') || p.includes('/super-admin/starterpack')) return 'starterPack';
    if (p.includes('/super-admin/promotional-banners') || p.includes('/super-admin/banners')) return 'banners';
    if (p.includes('/super-admin/faqs')) return 'faqs';
    if (p.includes('/super-admin/referral-program') || p.includes('/super-admin/referral')) return 'referral';
    if (p.includes('/super-admin/legal-policies') || p.includes('/super-admin/privacy-terms')) return 'legalPolicies';
    if (p.includes('/super-admin/customers')) return 'customers';
    if (p.includes('/super-admin/partner-hiring')) return 'partnerHiring';
    if (p.includes('/super-admin/partners')) return 'partners';
    if (p.includes('/super-admin/categories')) return 'categories';
    if (p.includes('/super-admin/sub-categories')) return 'subCategories';
    if (p.includes('/super-admin/services')) return 'services';
    if (p.includes('/super-admin/bookings')) return 'bookings';
    if (p.includes('/super-admin/payments')) return 'payments';
    if (p.includes('/super-admin/reviews')) return 'reviews';
    if (p.includes('/super-admin/reports')) return 'reports';
    if (p.includes('/super-admin/notifications')) return 'notifications';
    if (p.includes('/super-admin/profile')) return 'profile';
    if (p.includes('/super-admin/settings')) return 'settings';
    return 'dashboard';
  };

  const activeTab = getTabFromPath(location.pathname);

  const setActiveTab = (tabId) => {
    const tabToPath = {
      dashboard: '/super-admin/dashboard',
      cityAdmins: '/super-admin/city-admins',
      cities: '/super-admin/city-management',
      tickets: '/super-admin/support-tickets',
      coupons: '/super-admin/Coupons?tab=all',
      starterPack: '/super-admin/starter-pack',
      banners: '/super-admin/promotional-banners',
      faqs: '/super-admin/faqs',
      referral: '/super-admin/referral-program',
      legalPolicies: '/super-admin/legal-policies',
      customers: '/super-admin/customers',
      partners: '/super-admin/partners',
      partnerHiring: '/super-admin/partner-hiring',
      categories: '/super-admin/categories',
      subCategories: '/super-admin/sub-categories',
      services: '/super-admin/services',
      bookings: '/super-admin/bookings',
      payments: '/super-admin/payments',
      reviews: '/super-admin/reviews',
      reports: '/super-admin/reports',
      notifications: '/super-admin/notifications',
      profile: '/super-admin/profile',
      settings: '/super-admin/settings',
    };
    const targetPath = tabToPath[tabId] || '/super-admin/dashboard';
    if (location.pathname + location.search !== targetPath) {
      navigate(targetPath);
    }
  };

  useEffect(() => {
    if (location.pathname === '/super-admin' || location.pathname === '/super-admin/') {
      navigate('/super-admin/dashboard', { replace: true });
    }
  }, [location.pathname, navigate]);

  const { dashboard, customers, partners, bookings, refetch } = useSuperAdmin();
  const {
    categories = [],
    adminCategories = [],
    subCategories = [],
    services = [],
    skills = [],
    createCategory,
    createSubCategory,
    createService,
    createSkill,
    deleteSkill,
  } = useCatalog();
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
    banners: 'Promotional Banners',
    faqs: 'FAQs Management',
    referral: 'Referral Program Setup',
    legalPolicies: 'Privacy Policy & Terms Rich Text Manager',
    tickets: 'Support Tickets',
    starterPack: 'Starter Pack Offer',
    customers: 'Customer Directory',
    partners: 'Marketplace Partners',
    partnerHiring: 'Partner Hiring Applications',
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
  const [newSrvGallery, setNewSrvGallery] = useState([]);
  const [newSrvVideos, setNewSrvVideos] = useState([]);
  const [rawMediaFiles, setRawMediaFiles] = useState([]);
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [newSrvPackages] = useState([
    { title: 'Basic Clean', price: 999, description: 'Mopping & basic vacuuming', features: 'Mopping & deep vacuuming\nBathroom dry wiping & cleaning\nLiving room basic dusting', isPopular: false },
    { title: 'Standard Deep Clean', price: 1499, description: 'Intense scrubbing & degreasing', features: 'Kitchen chimney + slab degreasing\nIntense bathroom wall scrubbing\nWet mop & mechanised floor scrub\nDry upholstery vacuuming', isPopular: true },
    { title: 'Ultra Premium Scrub', price: 2499, description: 'Complete sanitation & sterilisation', features: 'Complete sanitation & sterilisation\nWet safe shampoo dry wash\nGlass facade & full balcony wash\nWall spots scrubbing & spot clean', isPopular: false }
  ]);

  // Catalog Filters

  // Package Management Modal State
  const [selectedServiceForPackages, setSelectedServiceForPackages] = useState(null);
  const [isPkgModalOpen, setIsPkgModalOpen] = useState(false);

  // Referral & Platform Settings State
  const [referralBonusAmount, setReferralBonusAmount] = useState(500);
  const [customerPlatformFeePercent, setCustomerPlatformFeePercent] = useState(5);
  const [partnerPlatformFeePercent, setPartnerPlatformFeePercent] = useState(10);
  const [partnerCancellationPenaltyAmount, setPartnerCancellationPenaltyAmount] = useState(100);
  const [maxDailyFreeCancellations, setMaxDailyFreeCancellations] = useState(3);
  const [partnerOnboardingFee, setPartnerOnboardingFee] = useState(999);
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
        if (data.partnerCancellationPenaltyAmount !== undefined) setPartnerCancellationPenaltyAmount(data.partnerCancellationPenaltyAmount);
        if (data.maxDailyFreeCancellations !== undefined) setMaxDailyFreeCancellations(data.maxDailyFreeCancellations);
        if (data.partnerOnboardingFee !== undefined) setPartnerOnboardingFee(data.partnerOnboardingFee);
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
        partnerCancellationPenaltyAmount: Number(partnerCancellationPenaltyAmount),
        maxDailyFreeCancellations: Number(maxDailyFreeCancellations),
        partnerOnboardingFee: Number(partnerOnboardingFee),
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
          setNewSrvGallery((prev) => (prev.includes(compressedBase64) ? prev : [compressedBase64, ...prev]));
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSrvUnifiedMediaChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setRawMediaFiles((prev) => [...prev, ...files]);

    files.forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            const MAX_WIDTH = 1200;
            const MAX_HEIGHT = 800;

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

            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.82);
            setNewSrvGallery((prev) => [...prev, compressedBase64]);
            setNewSrvImage((prev) => (prev ? prev : compressedBase64));
          };
          img.src = event.target.result;
        };
        reader.readAsDataURL(file);
      } else if (file.type.startsWith('video/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const videoData = event.target.result;
          setNewSrvVideos((prev) => [...prev, videoData]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleSrvMultipleImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 800;

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

          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.82);
          setNewSrvGallery((prev) => [...prev, compressedBase64]);
          setNewSrvImage((prev) => (prev ? prev : compressedBase64));
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSrvVideoFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const videoData = event.target.result;
        setNewSrvVideos((prev) => [...prev, videoData]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddVideoUrl = () => {
    if (!videoUrlInput.trim()) return;
    setNewSrvVideos((prev) => [...prev, videoUrlInput.trim()]);
    setVideoUrlInput('');
  };

  const handleRemoveGalleryImage = (index) => {
    setNewSrvGallery((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (updated.length > 0) {
        setNewSrvImage(updated[0]);
      } else {
        setNewSrvImage('');
      }
      return updated;
    });
  };

  const handleRemoveVideo = (index) => {
    setNewSrvVideos((prev) => prev.filter((_, i) => i !== index));
  };

  // Create forms are guarded by a ref (state would lag behind a fast double click) so one click = one record.
  const createLock = useRef(false);
  const [creating, setCreating] = useState(false);
  const runOnce = async (task) => {
    if (createLock.current) return;
    createLock.current = true;
    setCreating(true);
    try {
      await task();
    } catch {
      /* the request layer already shows the error toast; keep the form open */
    } finally {
      createLock.current = false;
      setCreating(false);
    }
  };

  const handleCreateCategorySubmit = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    return runOnce(async () => {
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
    });
  };

  const handleCreateSubCategorySubmit = (e) => {
    e.preventDefault();
    if (!newSubCatName.trim() || !newSubCatCategory) return;
    return runOnce(async () => {
      await createSubCategory({
        name: newSubCatName.trim(),
        category: newSubCatCategory,
        description: newSubCatDesc.trim(),
      });
      setNewSubCatName('');
      setNewSubCatCategory('');
      setNewSubCatDesc('');
      setSubCatModalOpen(false);
    });
  };

  const handleCreateServiceSubmit = (e) => {
    e.preventDefault();
    if (!newSrvName.trim() || !newSrvCategory || !newSrvSubCategory) return;
    return runOnce(() => submitNewService());
  };

  const submitNewService = async () => {

    const formData = new FormData();
    formData.append('name', newSrvName.trim());
    formData.append('category', newSrvCategory);
    formData.append('subCategory', newSrvSubCategory);
    formData.append('price', Number(newSrvPrice) || 0);
    formData.append('discount', Number(newSrvDiscount) || 0);
    formData.append('duration', newSrvDuration || '45 mins');
    formData.append('description', newSrvDesc.trim());

    if (rawMediaFiles && rawMediaFiles.length > 0) {
      rawMediaFiles.forEach((file) => {
        formData.append('files', file);
      });
    }

    const externalVideos = newSrvVideos.filter((v) => !v.startsWith('data:video/'));
    const externalGallery = newSrvGallery.filter((img) => !img.startsWith('data:image/'));

    if (externalGallery.length > 0) {
      formData.append('gallery', JSON.stringify(externalGallery));
    }
    if (externalVideos.length > 0) {
      formData.append('videos', JSON.stringify(externalVideos));
    }

    if (rawMediaFiles.length === 0) {
      if (newSrvGallery.length > 0) formData.append('gallery', JSON.stringify(newSrvGallery));
      if (newSrvVideos.length > 0) formData.append('videos', JSON.stringify(newSrvVideos));
    }

    const res = await createService(formData);

    const createdSrv = res?.data?.data || res?.data || res;
    setNewSrvName('');
    setNewSrvCategory('');
    setNewSrvSubCategory('');
    setNewSrvPrice('');
    setNewSrvDiscount('');
    setNewSrvDuration('45 mins');
    setNewSrvDesc('');
    setNewSrvImage('');
    setNewSrvGallery([]);
    setNewSrvVideos([]);
    setRawMediaFiles([]);
    setVideoUrlInput('');
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

          {/* TAB 2.7: CENTRAL SUPPORT TICKETS */}
          {activeTab === 'tickets' && (
            <SuperAdminTicketsView />
          )}

          {/* TAB 2.8: COUPONS & PROMOS */}
          {activeTab === 'coupons' && (
            <SuperAdminCouponsView />
          )}

          {/* TAB 2.85: PROMOTIONAL BANNERS */}
          {activeTab === 'banners' && (
            <SuperAdminBannersView />
          )}

          {/* PARTNER HIRING APPLICATIONS */}
          {activeTab === 'partnerHiring' && (
            <SuperAdminPartnerHiringView />
          )}

          {/* TAB 2.87: FAQS MANAGEMENT */}
          {activeTab === 'faqs' && (
            <SuperAdminFaqsView />
          )}

          {/* TAB 2.9: REFERRAL PROGRAM MANAGER */}
          {activeTab === 'referral' && (
            <SuperAdminReferralView />
          )}

          {/* TAB 2.95: LEGAL & PRIVACY POLICY RICH TEXT MANAGER */}
          {activeTab === 'legalPolicies' && (
            <SuperAdminLegalPoliciesView />
          )}

          {/* TAB 2.98: STARTER PACK OFFER MANAGER */}
          {activeTab === 'starterPack' && (
            <SuperAdminStarterPackView />
          )}

          {/* TAB 3: CUSTOMERS */}
          {activeTab === 'customers' && <SuperAdminCustomersView customers={customers} />}

          {/* TAB 4: PARTNERS */}
          {activeTab === 'partners' && <SuperAdminPartnersView partners={partners} />}

          {/* TAB 5: CATEGORIES */}
          {activeTab === 'categories' && <SuperAdminCategoriesView onCreate={() => setCatModalOpen(true)} />}

          {/* TAB 6: SUB CATEGORIES */}
          {activeTab === 'subCategories' && <SuperAdminSubCategoriesView onCreate={() => setSubCatModalOpen(true)} />}

          {/* TAB 7: SERVICES */}
          {activeTab === 'services' && (
            <SuperAdminServicesView
              onCreate={() => setSrvModalOpen(true)}
              onManagePackages={(srv) => {
                setSelectedServiceForPackages(srv);
                setIsPkgModalOpen(true);
              }}
            />
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
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '800' }}>
                      <th style={{ padding: '12px' }}>#</th>
                      <th style={{ padding: '12px' }}>BOOKING REF</th>
                      <th style={{ padding: '12px' }}>CUSTOMER</th>
                      <th style={{ padding: '12px' }}>SERVICE</th>
                      <th style={{ padding: '12px' }}>PLACED ON</th>
                      <th style={{ padding: '12px' }}>SCHEDULED FOR</th>
                      <th style={{ padding: '12px' }}>AMOUNT</th>
                      <th style={{ padding: '12px' }}>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.length === 0 ? (
                      <tr><td colSpan={8} style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No bookings created yet.</td></tr>
                    ) : (
                      bookings.map((b, idx) => {
                        const custName = typeof b.customer === 'object' && b.customer?.name
                          ? b.customer.name
                          : (b.customer?.email || 'Customer');
                        const srvTitle = b.packageName || (typeof b.service === 'object' && b.service?.name ? b.service.name : b.serviceName) || 'Home Service';
                        const bAmount = b.amount ?? b.totalAmount ?? b.financialSnapshot?.customerPayable ?? 0;
                        const refCode = b.bookingNumber || b.bookingId || (b._id ? b._id.substring(0, 8).toUpperCase() : 'NZ-BOOKING');

                        return (
                          <tr key={b._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '12px', color: '#94a3b8', fontWeight: '700' }}>{idx + 1}</td>
                            <td style={{ padding: '12px', fontWeight: '800', color: '#2563eb' }}>{refCode}</td>
                            <td style={{ padding: '12px', fontWeight: '700' }}>{custName}</td>
                            <td style={{ padding: '12px' }}>{srvTitle}</td>
                            <td style={{ padding: '12px', whiteSpace: 'nowrap' }}>
                              <div style={{ fontWeight: '700', color: '#0f172a' }}>{fmtBookingDate(b.createdAt)}</div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{fmtBookingTime(b.createdAt)}</div>
                            </td>
                            <td style={{ padding: '12px', whiteSpace: 'nowrap' }}>
                              <div style={{ fontWeight: '700', color: '#0f172a' }}>{fmtBookingDate(b.bookingDate)}</div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{b.timeSlot || '—'}</div>
                            </td>
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

          {/* TAB 9: PAYMENTS & PAYOUTS */}
          {activeTab === 'payments' && <SuperAdminPaymentsView />}

          {/* TAB 9.5: REVIEWS & RATINGS MODERATION */}
          {activeTab === 'reviews' && <SuperAdminReviewsView />}

          {/* TAB 10: REPORTS */}
          {activeTab === 'reports' && <SuperAdminReportsView />}

          {/* TAB 11: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <SuperAdminNotificationsView />
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

                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: '800', color: '#0f172a' }}>Max Free Cancellations Per Day (Partner)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={maxDailyFreeCancellations}
                      onChange={(e) => setMaxDailyFreeCancellations(e.target.value)}
                      placeholder="e.g. 3"
                      min={1}
                      required
                      style={{ fontSize: '1.1rem', fontWeight: '800' }}
                    />
                    <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                      Current: <strong>{maxDailyFreeCancellations} cancellations/day</strong> allowed for free before penalty & account suspension.
                    </span>
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: '800', color: '#0f172a' }}>Partner Cancellation Penalty Fee (₹)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={partnerCancellationPenaltyAmount}
                      onChange={(e) => setPartnerCancellationPenaltyAmount(e.target.value)}
                      placeholder="e.g. 100"
                      min={0}
                      required
                      style={{ fontSize: '1.1rem', fontWeight: '800' }}
                    />
                    <span style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '4px', display: 'block', fontWeight: '700' }}>
                      Charged starting from {Number(maxDailyFreeCancellations) + 1}th cancellation in 1 day + account automatically suspended.
                    </span>
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: '800', color: '#0f172a' }}>One-Time Partner Onboarding Fee (₹)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={partnerOnboardingFee}
                      onChange={(e) => setPartnerOnboardingFee(e.target.value)}
                      placeholder="e.g. 999"
                      min={0}
                      required
                      style={{ fontSize: '1.1rem', fontWeight: '800', color: '#16a34a' }}
                    />
                    <span style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '4px', display: 'block', fontWeight: '700' }}>
                      Registration fee displayed on Step 6 of partner onboarding (includes 18% GST calculation).
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
                <button type="submit" className="btn btn-primary" disabled={creating}>{creating ? 'Creating…' : 'Create Category'}</button>
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
                <button type="submit" className="btn btn-primary" disabled={creating}>{creating ? 'Creating…' : 'Create SubCategory'}</button>
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
              {/* UNIFIED SINGLE MEDIA UPLOAD FIELD (IMAGES & VIDEOS) */}
              <div className="form-group" style={{ background: '#f8fafc', padding: '18px', borderRadius: '16px', border: '1.5px dashed #2563eb' }}>
                <label className="form-label" style={{ fontWeight: '800', color: '#0f172a', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span>📁 Upload Service Media (Images & Videos)</span>
                  <span style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: '800' }}>
                    {newSrvGallery.length} Photo(s), {newSrvVideos.length} Video(s)
                  </span>
                </label>

                {/* SINGLE UNIFIED FILE INPUT FOR BOTH IMAGES & VIDEOS */}
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  className="form-input"
                  onChange={handleSrvUnifiedMediaChange}
                  style={{ background: '#ffffff', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '6px', display: 'block', fontWeight: '500' }}>
                  Select photos and videos together in one go. First photo will automatically become main cover banner.
                </span>

                {/* OPTIONAL EXTERNAL VIDEO URL LINK INPUT */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Or paste Video URL (YouTube, MP4, Vimeo link)"
                    value={videoUrlInput}
                    onChange={(e) => setVideoUrlInput(e.target.value)}
                    style={{ flex: 1, fontSize: '0.82rem', background: '#ffffff' }}
                  />
                  <button
                    type="button"
                    onClick={handleAddVideoUrl}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '10px',
                      background: '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      fontWeight: '800',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    + Add Link
                  </button>
                </div>

                {/* MEDIA PREVIEW LIST / GRID */}
                {(newSrvGallery.length > 0 || newSrvVideos.length > 0) && (
                  <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px dashed #cbd5e1' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#475569', marginBottom: '8px' }}>
                      SELECTED MEDIA PREVIEWS ({newSrvGallery.length + newSrvVideos.length} ITEMS)
                    </div>

                    {/* IMAGES PREVIEW GRID */}
                    {newSrvGallery.length > 0 && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '8px', marginBottom: '10px' }}>
                        {newSrvGallery.map((imgSrc, idx) => (
                          <div key={idx} style={{ position: 'relative', width: '80px', height: '65px', borderRadius: '8px', overflow: 'hidden', border: idx === 0 ? '2px solid #10b981' : '1px solid #cbd5e1' }}>
                            <img src={imgSrc} alt={`Image ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            {idx === 0 && (
                              <span style={{ position: 'absolute', bottom: '0', left: '0', right: '0', background: '#10b981', color: '#ffffff', fontSize: '0.58rem', fontWeight: '900', textAlign: 'center', padding: '1px 0' }}>
                                COVER
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveGalleryImage(idx)}
                              style={{
                                position: 'absolute',
                                top: '2px',
                                right: '2px',
                                background: 'rgba(220, 38, 38, 0.9)',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '50%',
                                width: '18px',
                                height: '18px',
                                fontSize: '0.65rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                              }}
                              title="Remove Photo"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* VIDEOS PREVIEW LIST */}
                    {newSrvVideos.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {newSrvVideos.map((vItem, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              background: '#ffffff',
                              padding: '6px 10px',
                              borderRadius: '8px',
                              border: '1px solid #cbd5e1',
                              fontSize: '0.8rem'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', flex: 1 }}>
                              <span>🎥</span>
                              <span style={{ fontWeight: '700', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {vItem.startsWith('data:video/') ? `Uploaded Video File #${idx + 1}` : vItem}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveVideo(idx)}
                              style={{
                                background: '#fef2f2',
                                color: '#dc2626',
                                border: '1px solid #fecaca',
                                borderRadius: '6px',
                                padding: '2px 6px',
                                fontSize: '0.7rem',
                                fontWeight: '700',
                                cursor: 'pointer'
                              }}
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">Description (Optional)</label>
                <input type="text" className="form-input" placeholder="Detailed service description" value={newSrvDesc} onChange={(e) => setNewSrvDesc(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setSrvModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={creating}>{creating ? 'Creating…' : 'Create Service'}</button>
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
