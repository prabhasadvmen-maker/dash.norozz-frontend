import { useState, useEffect } from 'react';
import {
  User,
  Phone,
  Clock,
  Briefcase,
  FileText,
  ExternalLink,
  CheckCircle2,
  Clock3,
  Copy,
  Check,
  UserCheck,
  Landmark,
  Gift,
  Wallet,
  Settings,
  Upload,
  ShieldCheck,
  Share2,
  ArrowUpRight,
  Lock,
  Bell,
  Globe,
  KeyRound,
  Plus,
  Trash2,
  Camera,
  CreditCard,
  Sparkles,
  TrendingUp,
  AlertCircle,
  ChevronRight,
  Building2,
  DollarSign,
  Eye,
  X,
  ArrowLeft,
  HelpCircle,
  Headphones,
  MessageSquare,
  AlertTriangle,
  Info,
  LogOut,
  EyeOff,
  PhoneCall,
  Mail,
  Send,
  Paperclip,
  Search,
  Volume2,
  Vibrate,
  Sliders,
  ChevronDown,
  ChevronUp,
  Shield,
  Fingerprint,
  FileCode,
  Award
} from 'lucide-react';
import { catalogService } from '../../services/catalog.service.js';
import { cityService } from '../../services/city.service.js';
import { partnerService } from '../../services/partner.service.js';
import { axiosInstance } from '../../api/axiosInstance.js';
import { toast } from '../../utils/toast.js';

const PartnerProfileView = ({ partnerData = {}, initialSubTab = 'overview', onTabChange, onUpdateUser }) => {
  const [activeSubTab, setActiveSubTab] = useState(initialSubTab);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);
  const [previewModalData, setPreviewModalData] = useState(null);
  const [imgLoadError, setImgLoadError] = useState(false);

  const DEFAULT_KYC_IMAGE = 'http://localhost:5000/api/media/norozz_kyc/aadhaar/1787396029730_3d-cartoon-style-character.jpg';

  const resolveDocUrl = (url) => {
    if (!url) return DEFAULT_KYC_IMAGE;
    if (typeof url === 'object' && url.url) url = url.url;
    if (typeof url !== 'string') return DEFAULT_KYC_IMAGE;
    const clean = url.trim();
    if (!clean) return DEFAULT_KYC_IMAGE;
    if (clean.startsWith('data:') || clean.startsWith('blob:') || clean.startsWith('http://') || clean.startsWith('https://')) {
      return clean;
    }
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const origin = API_BASE.replace(/\/api\/?$/, '');
    return clean.startsWith('/') ? `${origin}${clean}` : `${origin}/${clean}`;
  };

  const handleOpenDocPreview = (title, url, docKey = '', docStatus = 'approved', rejectionReason = '') => {
    setImgLoadError(false);
    const targetUrl = url || DEFAULT_KYC_IMAGE;
    const resolved = resolveDocUrl(targetUrl);
    setPreviewModalData({ title, url: resolved, rawUrl: targetUrl, docKey, docStatus, rejectionReason });
  };
  const [categoriesMap, setCategoriesMap] = useState({});
  const [citiesMap, setCitiesMap] = useState({});
  const [servicesMap, setServicesMap] = useState({});
  const [saving, setSaving] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);

  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [isDepositing, setIsDepositing] = useState(false);

  const user = partnerData || {};
  const kycStatus = user.kycStatus || 'pending';
  const isApproved = kycStatus === 'approved';

  // Keep activeSubTab in sync if parent initialSubTab prop changes
  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const [referralData, setReferralData] = useState(null);
  const [referralUserFilter, setReferralUserFilter] = useState('ALL');

  useEffect(() => {
    partnerService
      .getReferralData()
      .then((res) => {
        const val = res.data?.data || res.data || res;
        if (val) setReferralData(val);
      })
      .catch((err) => console.warn('Referral data fetch warning:', err));
  }, []);

  const referralBonusAmount = referralData?.referralBonusAmount ?? 500;
  const referralCode = referralData?.referralCode || user.referralCode || `NRZ-REF-${(user.phone || '600653').slice(-6)}`;

  // Form State for Edit Profile
  const [editForm, setEditForm] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    dob: user.dob || '',
    gender: user.gender || 'Male',
    experience: user.experience || '3-5 Years',
    workRadius: user.workRadius || 8,
    address: user.address || '',
    localities: user.localities ? [...user.localities] : [],
    newLocalityInput: '',
    profileImage: user.profileImage || '',
  });

  // Form State for Bank Details
  const bank = user.bankDetails || {};
  const [bankForm, setBankForm] = useState({
    accountHolderName: bank.accountHolderName || user.name || '',
    bankName: bank.bankName || '',
    accountNumber: bank.accountNumber || '',
    confirmAccountNumber: bank.accountNumber || '',
    ifscCode: bank.ifscCode || '',
    upiId: bank.upiId || '',
  });

  // Settings Navigation & Screens State
  const [settingsScreen, setSettingsScreen] = useState('main');
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  // Expanded Notification & Settings State
  const [settingsForm, setSettingsForm] = useState({
    allowNotifications: true,
    jobAlerts: true,
    surgeAlerts: true,
    whatsappNotifs: true,
    chatMessagesAlerts: true,
    scheduleReminders: true,
    soundAlert: true,
    vibrationAlert: true,
    autoAcceptNearJobs: false,
    language: 'English',
  });

  // Privacy & Security State
  const [privacyState, setPrivacyState] = useState({
    twoFactor: true,
    biometric: true,
    loginAlerts: true,
    locationSharing: 'Only while working',
  });

  // Change Password Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPass, setShowPass] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // FAQ State
  const [faqSearchQuery, setFaqSearchQuery] = useState('');
  const [faqCategory, setFaqCategory] = useState('All');
  const [expandedFaq, setExpandedFaq] = useState(0);

  // Live Chat State
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'agent', name: 'Neha Sharma', text: 'Namaste monu! I am Neha from NOROZZ Partner support. How can I help you today?', time: '10:42 AM' },
    { id: 2, sender: 'user', text: 'Bhai, I completed booking #NRZ-1922 AC Service deep cleaning yesterday but payment is still pending.', time: '10:44 AM' },
    { id: 3, sender: 'agent', name: 'Neha Sharma', text: 'Let me check that for you. Yes, I see the completion. Since it was booked after bank hours, it is currently processing and will be credited within 2 hours to your wallet!', time: '10:45 AM' },
  ]);
  const [chatInputText, setChatInputText] = useState('');

  // Complaint Form State
  const [partnerBookingsList, setPartnerBookingsList] = useState([]);
  const [complaintForm, setComplaintForm] = useState({
    complaintType: 'Payment Delay / Issue',
    bookingId: '',
    description: '',
    screenshot: null,
    priority: 'Medium',
  });
  const [submittingComplaint, setSubmittingComplaint] = useState(false);

  // Wallet & Earnings Control Center State
  const [earningsTimeframe, setEarningsTimeframe] = useState('overview'); // 'overview', 'daily', 'weekly', 'monthly'
  const [walletData, setWalletData] = useState(null);
  const [earningsData, setEarningsData] = useState(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // FAQ Knowledge Base (Live backend fetched)
  const [faqs, setFaqs] = useState([
    {
      cat: 'Bookings',
      q: 'How do I accept a booking?',
      a: 'When a new booking request appears on your screen, tap on the "Accept Booking" button within the 30-second timer to claim the service request.'
    },
    {
      cat: 'Payments',
      q: 'When do I receive my payment?',
      a: 'Earnings are instantly credited to your NOROZZ Wallet upon customer OTP job completion. You can withdraw funds directly to your linked bank account anytime.'
    },
    {
      cat: 'General',
      q: 'How to update my documents?',
      a: 'Go to "My Documents" in your Partner Profile sidebar, select the file you wish to update, and click Save Documents for admin verification.'
    },
    {
      cat: 'Bookings',
      q: 'What if the customer cancels the job?',
      a: 'If a customer cancels after you have arrived at the location, a cancellation fee compensation is automatically added to your wallet earnings.'
    },
    {
      cat: 'Technical',
      q: 'How to enable high demand peak surge alerts?',
      a: 'Go to Settings > Notification Settings and toggle ON "High Demand Peak Surge Notifications" to get instant alerts on high-payout areas.'
    },
    {
      cat: 'General',
      q: 'How do I change my preferred app language?',
      a: 'Go to Settings > App Language and pick your preferred language (English, Hindi, Hinglish, Marathi, etc.) to switch the entire interface language.'
    }
  ]);

  useEffect(() => {
    partnerService.getFaqs()
      .then((res) => {
        const list = res.data?.data || res.data || [];
        if (Array.isArray(list) && list.length > 0) {
          setFaqs(list.map((item) => ({
            cat: item.category || 'General',
            q: item.question,
            a: item.answer
          })));
        }
      })
      .catch((err) => console.error('Error fetching partner FAQs:', err));

    // Fetch real partner bookings for complaint dropdown
    partnerService.getAllBookings()
      .then((res) => {
        const bList = res.data?.data || res.data || [];
        if (Array.isArray(bList) && bList.length > 0) {
          setPartnerBookingsList(bList);
          const firstB = bList[0];
          const firstBNum = firstB.bookingId || firstB.bookingNumber || `NRZ-${firstB._id?.toString().slice(-4).toUpperCase()}`;
          const firstSName = firstB.serviceName || firstB.service?.name || firstB.packageName || 'Service';
          const defaultVal = `Booking #${firstBNum} - ${firstSName}`;
          setComplaintForm((prev) => ({
            ...prev,
            bookingId: prev.bookingId || defaultVal
          }));
        } else {
          setComplaintForm((prev) => ({
            ...prev,
            bookingId: prev.bookingId || 'General Partner Account Issue'
          }));
        }
      })
      .catch((err) => {
        console.warn('Could not fetch partner bookings for complaints dropdown:', err);
        setComplaintForm((prev) => ({
          ...prev,
          bookingId: prev.bookingId || 'General Partner Account Issue'
        }));
      });
  }, []);

  // Load initial settings preferences from user object
  useEffect(() => {
    if (user.notificationPreferences) {
      setSettingsForm((prev) => ({ ...prev, ...user.notificationPreferences }));
    }
    if (user.privacySecurity) {
      setPrivacyState((prev) => ({ ...prev, ...user.privacySecurity }));
    }
    if (user.preferredLanguage) {
      setSettingsForm((prev) => ({ ...prev, language: user.preferredLanguage }));
    }
  }, [partnerData]);

  // Fetch Wallet & Earnings data on mount / tab switch
  useEffect(() => {
    partnerService.getWallet()
      .then((res) => {
        const val = res.data?.data || res.data;
        if (val) setWalletData(val);
      })
      .catch((err) => console.error('Failed to fetch wallet:', err));

    partnerService.getEarnings()
      .then((res) => {
        const val = res.data?.data || res.data;
        if (val) setEarningsData(val);
      })
      .catch((err) => console.error('Failed to fetch earnings analytics:', err));
  }, [activeSubTab]);

  // Load chat messages and complaints when opening settings / chat screen
  useEffect(() => {
    if (activeSubTab === 'settings') {
      partnerService.getChatMessages()
        .then((res) => {
          if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
            setChatMessages(res.data.data);
          }
        })
        .catch((err) => console.error('Failed to load chat messages:', err));
    }
  }, [activeSubTab, settingsScreen]);

  const [liveTermsContent, setLiveTermsContent] = useState('');
  const [livePrivacyContent, setLivePrivacyContent] = useState('');

  useEffect(() => {
    if (settingsScreen === 'terms' && !liveTermsContent) {
      axiosInstance.get('/policies/partner/terms_and_conditions')
        .then((res) => {
          const data = res.data?.data || res.data;
          if (data?.content) setLiveTermsContent(data.content);
        })
        .catch(() => {});
    }
    if (settingsScreen === 'privacy' && !livePrivacyContent) {
      axiosInstance.get('/policies/partner/privacy_policy')
        .then((res) => {
          const data = res.data?.data || res.data;
          if (data?.content) setLivePrivacyContent(data.content);
        })
        .catch(() => {});
    }
  }, [settingsScreen]);

  // Sync settings preferences to backend
  const handleToggleSetting = async (category, key, value) => {
    let updatedNotif = { ...settingsForm };
    let updatedPriv = { ...privacyState };
    let updatedLang = settingsForm.language;

    if (category === 'notification') {
      updatedNotif[key] = value;
      setSettingsForm(updatedNotif);
    } else if (category === 'privacy') {
      updatedPriv[key] = value;
      setPrivacyState(updatedPriv);
    } else if (category === 'language') {
      updatedLang = value;
      setSettingsForm((prev) => ({ ...prev, language: value }));
    }

    try {
      await partnerService.updateSettingsPreferences({
        notificationPreferences: updatedNotif,
        privacySecurity: updatedPriv,
        preferredLanguage: updatedLang,
      });
      toast.success('⚙️ Setting updated in backend!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to sync settings with server');
    }
  };

  const handleSendChatMessage = async (e) => {
    e.preventDefault();
    if (!chatInputText.trim()) return;
    const text = chatInputText.trim();
    setChatInputText('');

    try {
      const res = await partnerService.sendChatMessage({ text });
      if (res.data?.data) {
        setChatMessages(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to send message to support chat');
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword) {
      return toast.error('Please enter your current password');
    }
    if (passwordForm.newPassword.length < 6) {
      return toast.error('New password must be at least 6 characters long');
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return toast.error('New password and confirm password do not match');
    }

    try {
      const res = await partnerService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success(res.data?.message || '🔒 Password updated successfully in database!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSettingsScreen('main');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    }
  };

  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    if (!complaintForm.description.trim()) {
      return toast.error('Please explain your issue before submitting');
    }
    setSubmittingComplaint(true);
    try {
      const res = await partnerService.submitComplaint(complaintForm);
      const created = res.data?.data;
      const ticketId = created?.ticketId || 'TKT-LIVE';
      toast.success(`🎉 Complaint registered in database! Ticket ID: ${ticketId}`);
      setComplaintForm({
        complaintType: 'Payment Delay / Issue',
        bookingId: 'Booking #NRZ-1922 - AC Service Deep Cleaning',
        description: '',
        screenshot: null,
        priority: 'Medium',
      });
      setSettingsScreen('help');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setSubmittingComplaint(false);
    }
  };

  const handleConfirmWithdrawal = async (e) => {
    e.preventDefault();
    const amt = Number(withdrawAmount);
    if (!amt || amt <= 0) {
      return toast.error('Please enter a valid withdrawal amount');
    }
    const currentBal = walletData?.walletBalance ?? user.walletBalance ?? 0;
    if (amt > currentBal) {
      return toast.error(`Insufficient balance. Available: ₹${currentBal.toLocaleString('en-IN')}`);
    }

    setIsWithdrawing(true);
    try {
      const res = await partnerService.requestWithdrawal(amt);
      toast.success(res.data?.message || `₹${amt.toLocaleString('en-IN')} transferred to your bank account!`);
      setWithdrawModalOpen(false);
      setWithdrawAmount('');
      const updatedWallet = await partnerService.getWallet();
      if (updatedWallet.data?.data) setWalletData(updatedWallet.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Withdrawal request failed');
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleConfirmDeposit = async (e) => {
    e?.preventDefault();
    const amt = Number(depositAmount);
    if (!amt || amt <= 0) {
      return toast.error('Please enter a valid deposit amount');
    }

    setIsDepositing(true);
    try {
      const res = await partnerService.addDepositToWallet(amt);
      toast.success(res.data?.message || `₹${amt.toLocaleString('en-IN')} added to your wallet!`);
      setDepositModalOpen(false);
      setDepositAmount('');
      const updatedWallet = await partnerService.getWallet();
      const newBal = res.data?.data?.walletBalance ?? res.data?.walletBalance ?? updatedWallet.data?.data?.walletBalance;
      if (updatedWallet.data?.data) {
        setWalletData(updatedWallet.data.data);
      }
      if (onUpdateUser && newBal !== undefined) {
        onUpdateUser({ ...user, walletBalance: newBal });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Deposit failed');
    } finally {
      setIsDepositing(false);
    }
  };

  // Uploaded Documents local state
  const docs = user.documents || {};
  const [documentsState, setDocumentsState] = useState({
    aadhaarFront: docs.aadhaarFront || docs.aadhaarDoc || DEFAULT_KYC_IMAGE,
    aadhaarBack: docs.aadhaarBack || DEFAULT_KYC_IMAGE,
    panDoc: docs.panDoc || DEFAULT_KYC_IMAGE,
    drivingLicenseDoc: docs.drivingLicenseDoc || DEFAULT_KYC_IMAGE,
    bankPassbookDoc: docs.bankPassbookDoc || DEFAULT_KYC_IMAGE,
    passportPhoto: docs.passportPhoto || DEFAULT_KYC_IMAGE,
  });

  useEffect(() => {
    const d = user.documents || {};
    setDocumentsState({
      aadhaarFront: d.aadhaarFront || d.aadhaarDoc || DEFAULT_KYC_IMAGE,
      aadhaarBack: d.aadhaarBack || DEFAULT_KYC_IMAGE,
      panDoc: d.panDoc || DEFAULT_KYC_IMAGE,
      drivingLicenseDoc: d.drivingLicenseDoc || DEFAULT_KYC_IMAGE,
      bankPassbookDoc: d.bankPassbookDoc || DEFAULT_KYC_IMAGE,
      passportPhoto: d.passportPhoto || DEFAULT_KYC_IMAGE,
    });
  }, [partnerData]);

  // Load backend categories & cities to map ObjectIds
  useEffect(() => {
    catalogService
      .getCategories()
      .then((res) => {
        const list = res.data?.data || res.data || [];
        if (Array.isArray(list)) {
          const map = {};
          list.forEach((c) => {
            if (c._id && c.name) map[String(c._id)] = c.name;
            if (c.id && c.name) map[String(c.id)] = c.name;
          });
          setCategoriesMap(map);
        }
      })
      .catch((err) => console.warn('Catalog category fetch warning:', err));

    cityService
      .getActiveCities()
      .then((res) => {
        const list = res.data?.data || res.data || [];
        if (Array.isArray(list)) {
          const map = {};
          list.forEach((c) => {
            if (c._id && c.name) map[String(c._id)] = c.name;
          });
          setCitiesMap(map);
        }
      })
      .catch((err) => console.warn('Cities fetch warning:', err));
  }, []);

  const handleCopyUserId = () => {
    if (user.userId) {
      navigator.clipboard.writeText(user.userId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleCopyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedRef(true);
    toast.success('Referral Code copied to clipboard!');
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = `Join NOROZZ Partner Portal as a Service Technician and earn up to ₹50,000/month! Use my referral code: ${referralCode} to get ₹${referralBonusAmount} joining bonus. Sign up here: https://norozz.in/partner-register`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Resolve Categories & Cities
  const getResolvedCategories = () => {
    const namesList = [];
    const rawCategories = Array.isArray(user.categories) && user.categories.length > 0
      ? user.categories
      : (user.category ? [user.category] : []);

    rawCategories.forEach((cat) => {
      if (typeof cat === 'object' && cat?.name) {
        namesList.push(cat.name);
      } else if (typeof cat === 'string') {
        if (categoriesMap[cat]) {
          namesList.push(categoriesMap[cat]);
        } else if (!cat.match(/^[0-9a-fA-F]{24}$/)) {
          namesList.push(cat);
        }
      }
    });

    if (!namesList.length && user.category) {
      if (categoriesMap[user.category]) {
        namesList.push(categoriesMap[user.category]);
      } else if (!user.category.match(/^[0-9a-fA-F]{24}$/)) {
        namesList.push(user.category);
      }
    }

    if (!namesList.length) {
      namesList.push('General Service Technician');
    }

    return Array.from(new Set(namesList));
  };

  const getResolvedCityName = () => {
    const rawCity = user.assignedCity || user.city;
    if (typeof rawCity === 'object' && rawCity?.name) return rawCity.name;
    if (typeof rawCity === 'string') {
      if (citiesMap[rawCity]) return citiesMap[rawCity];
      if (!rawCity.match(/^[0-9a-fA-F]{24}$/)) return rawCity;
    }
    return 'Delhi NCR';
  };

  useEffect(() => {
    catalogService.getServices()
      .then((res) => {
        const sList = res.data?.data?.items || res.data?.data || res.data || [];
        if (Array.isArray(sList)) {
          const map = {};
          sList.forEach((s) => {
            if (s._id && (s.name || s.title)) {
              map[s._id] = s.name || s.title;
            }
          });
          setServicesMap(map);
        }
      })
      .catch(() => {});
  }, []);

  const getResolvedOfferedServices = () => {
    const namesList = [];
    const rawServices = Array.isArray(user.offeredServices) && user.offeredServices.length > 0
      ? user.offeredServices
      : (Array.isArray(user.skills) ? user.skills : []);

    rawServices.forEach((svc) => {
      if (typeof svc === 'object' && (svc?.name || svc?.title)) {
        namesList.push(svc.name || svc.title);
      } else if (typeof svc === 'string') {
        if (servicesMap[svc]) {
          namesList.push(servicesMap[svc]);
        } else if (categoriesMap[svc]) {
          namesList.push(categoriesMap[svc]);
        } else if (!svc.match(/^[0-9a-fA-F]{24}$/)) {
          namesList.push(svc);
        }
      }
    });

    return Array.from(new Set(namesList));
  };

  const resolvedCategoryNames = getResolvedCategories();
  const resolvedCityName = getResolvedCityName();
  const resolvedOfferedServices = getResolvedOfferedServices();

  const handleProfileImageChange = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (PNG, JPG, JPEG)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('profileImage', file);

      // Local preview URL
      const localPreviewUrl = URL.createObjectURL(file);
      setEditForm((prev) => ({ ...prev, profileImage: localPreviewUrl }));

      const res = await partnerService.updateProfile(formData);
      toast.success('📸 Profile picture updated successfully!');

      const updatedUser = res.data?.user || res.data?.data || res.data;
      if (updatedUser) {
        if (onUpdateUser) onUpdateUser(updatedUser);
        if (updatedUser.profileImage) {
          setEditForm((prev) => ({ ...prev, profileImage: updatedUser.profileImage }));
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile picture.');
    } finally {
      setSaving(false);
    }
  };

  // Sync editForm state when partnerData prop updates
  useEffect(() => {
    const u = partnerData || {};
    setEditForm({
      name: u.name || '',
      email: u.email || '',
      phone: u.phone || '',
      dob: u.dob || '',
      gender: u.gender || 'Male',
      experience: u.experience || '3-5 Years',
      workRadius: u.workRadius || 8,
      address: u.address || '',
      localities: u.localities ? [...u.localities] : [],
      newLocalityInput: '',
      profileImage: u.profileImage || '',
    });
  }, [partnerData]);

  // Handlers for Profile Save (Sends ONLY modified fields in API payload)
  const handleSaveProfile = async (e) => {
    e?.preventDefault();
    setSaving(true);
    try {
      const payload = {};

      const initialName = (user.name || '').trim();
      const initialDob = user.dob || '';
      const initialGender = user.gender || 'Male';
      const initialExperience = user.experience || '3-5 Years';
      const initialWorkRadius = Number(user.workRadius || 8);
      const initialLocalities = JSON.stringify(user.localities || []);
      const initialAddress = (user.address || '').trim();
      const initialProfileImage = user.profileImage || '';

      const currentName = (editForm.name || '').trim();
      const currentAddress = (editForm.address || '').trim();

      if (currentName && currentName !== initialName) payload.name = currentName;
      if (editForm.dob && editForm.dob !== initialDob) payload.dob = editForm.dob;
      if (editForm.gender && editForm.gender !== initialGender) payload.gender = editForm.gender;
      if (editForm.experience && editForm.experience !== initialExperience) payload.experience = editForm.experience;
      if (Number(editForm.workRadius) !== initialWorkRadius) payload.workRadius = Number(editForm.workRadius);
      if (JSON.stringify(editForm.localities || []) !== initialLocalities) payload.localities = editForm.localities;
      if (currentAddress !== initialAddress) payload.address = currentAddress;
      if (editForm.profileImage && editForm.profileImage !== initialProfileImage) payload.profileImage = editForm.profileImage;

      if (Object.keys(payload).length === 0) {
        toast.info('No changes detected in profile fields.');
        setSaving(false);
        return;
      }

      console.log('📤 Sending Profile Edit Payload (Modified Fields Only):', payload);
      const res = await partnerService.updateProfile(payload);
      toast.success('🎉 Profile updated successfully!');

      const updatedUser = res.data?.user || res.data?.data || res.data;
      if (updatedUser && onUpdateUser) {
        onUpdateUser(updatedUser);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  // Handler for Bank Details Save
  const handleSaveBankDetails = async (e) => {
    e?.preventDefault();
    if (bankForm.accountNumber && bankForm.accountNumber !== bankForm.confirmAccountNumber) {
      toast.error('Account numbers do not match!');
      return;
    }
    setSaving(true);
    try {
      const bankDetailsObj = {
        accountHolderName: bankForm.accountHolderName,
        bankName: bankForm.bankName,
        accountNumber: bankForm.accountNumber,
        ifscCode: bankForm.ifscCode.toUpperCase(),
        upiId: bankForm.upiId,
        isVerified: true,
      };

      const res = await partnerService.updateProfile({ bankDetails: bankDetailsObj });
      toast.success('🏦 Bank details updated & verified!');
      if (onUpdateUser && res.data?.user) {
        onUpdateUser(res.data.user);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save bank details.');
    } finally {
      setSaving(false);
    }
  };

  // Handler for Document File Selection & Base64 upload simulation
  const handleFileUpload = async (docType, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Url = reader.result;
      setDocumentsState((prev) => ({ ...prev, [docType]: base64Url }));
      toast.success(`Document uploaded! Opening image preview...`);
      const docTitles = {
        aadhaarFront: 'Aadhaar Card (Front)',
        aadhaarBack: 'Aadhaar Card (Back)',
        panDoc: 'PAN Card',
        drivingLicenseDoc: 'Driving License / ID',
        bankPassbookDoc: 'Bank Passbook / Cheque',
      };
      handleOpenDocPreview(docTitles[docType] || docType, base64Url, docType);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveDocuments = async () => {
    setSaving(true);
    try {
      const payload = {
        documents: {
          ...docs,
          ...documentsState,
        },
      };
      const res = await partnerService.updateProfile(payload);
      toast.success('📄 Documents submitted for verification!');
      if (onUpdateUser && res.data?.user) {
        onUpdateUser(res.data.user);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit documents.');
    } finally {
      setSaving(false);
    }
  };


  // Add locality tag
  const handleAddLocality = () => {
    if (editForm.newLocalityInput.trim()) {
      setEditForm((prev) => ({
        ...prev,
        localities: [...prev.localities, prev.newLocalityInput.trim()],
        newLocalityInput: '',
      }));
    }
  };

  const handleRemoveLocality = (idx) => {
    setEditForm((prev) => ({
      ...prev,
      localities: prev.localities.filter((_, i) => i !== idx),
    }));
  };

  // Switch Sub-Tab
  const handleSwitchTab = (tabId) => {
    setActiveSubTab(tabId);
    if (onTabChange) {
      // Map internal subTab to sidebar tab ID if needed
      const tabMap = {
        overview: 'profile',
        edit: 'editProfile',
        documents: 'documents',
        bank: 'bankDetails',
        referral: 'referral',
        wallet: 'wallet',
        settings: 'settings',
      };
      if (tabMap[tabId]) onTabChange(tabMap[tabId]);
    }
  };

  const SUB_TABS = [
    { id: 'overview', label: 'Profile Overview', icon: User },
    { id: 'edit', label: 'Edit Profile', icon: UserCheck },
    { id: 'documents', label: 'My Documents', icon: FileText },
    { id: 'bank', label: 'Bank Details', icon: Landmark },
    { id: 'referral', label: 'Referral Program', icon: Gift, badge: '₹500' },
    { id: 'wallet', label: 'Wallet & Payouts', icon: Wallet },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1100px' }}>
      
      {/* 1. TOP ULTRA-COMPACT INDUSTRIAL HERO PROFILE CARD */}
      <div
        style={{
          background: 'linear-gradient(135deg, #09331E 0%, #064e3b 50%, #0f172a 100%)',
          borderRadius: '16px',
          padding: '14px 20px',
          color: '#ffffff',
          boxShadow: '0 8px 24px rgba(9, 51, 30, 0.18)',
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid rgba(16, 185, 129, 0.25)'
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-30px',
            right: '-30px',
            width: '140px',
            height: '140px',
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.08)',
            pointerEvents: 'none'
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
          
          {/* Avatar Image with Quick Camera Upload Overlay */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            {editForm.profileImage || user.profileImage ? (
              <img
                src={editForm.profileImage || user.profileImage}
                alt={user.name || 'Partner Profile'}
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2.5px solid #10b981',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                }}
              />
            ) : (
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.4rem',
                  fontWeight: '900',
                  color: '#ffffff',
                  border: '2.5px solid #34d399',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                }}
              >
                {(user.name || 'P')[0].toUpperCase()}
              </div>
            )}
            
            {/* Online indicator dot */}
            <span
              style={{
                position: 'absolute',
                bottom: '2px',
                right: '2px',
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                background: '#10b981',
                border: '2px solid #064e3b',
                zIndex: 2
              }}
            />

            {/* Camera Overlay Badge Button */}
            <label
              htmlFor="hero-profile-image-input"
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#2563eb',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
                border: '2px solid #ffffff',
                zIndex: 3,
                transition: 'transform 0.2s ease'
              }}
              title="Change Profile Photo"
            >
              <Camera size={16} />
            </label>
            <input
              id="hero-profile-image-input"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleProfileImageChange(e.target.files[0]);
                }
              }}
            />
          </div>

          {/* User Details */}
          <div style={{ flex: 1, minWidth: '240px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.45rem', fontWeight: '900', margin: 0, letterSpacing: '-0.3px', color: '#ffffff' }}>
                {user.name || 'Technician Partner'}
              </h1>

              <span
                style={{
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  fontSize: '0.72rem',
                  fontWeight: '800',
                  letterSpacing: '0.4px',
                  textTransform: 'uppercase',
                  background: isApproved ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                  color: isApproved ? '#6ee7b7' : '#fde047',
                  border: isApproved ? '1px solid rgba(110, 231, 183, 0.4)' : '1px solid rgba(253, 224, 71, 0.4)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                {isApproved ? <CheckCircle2 size={12} /> : <Clock3 size={12} />}
                {isApproved ? 'KYC Approved' : 'KYC Pending Verification'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px', flexWrap: 'wrap', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.08)', padding: '3px 10px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <span style={{ fontSize: '0.72rem', opacity: 0.7, fontWeight: '700' }}>ID:</span>
                <span style={{ fontWeight: '800', letterSpacing: '0.5px', color: '#6ee7b7' }}>{user.userId || 'NRZ-P-309983'}</span>
                <button
                  type="button"
                  onClick={handleCopyUserId}
                  style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', opacity: 0.8, padding: 0, marginLeft: '2px' }}
                  title="Copy Partner ID"
                >
                  {copiedId ? <Check size={13} color="#4ade80" /> : <Copy size={13} />}
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#a7f3d0' }}>
                <Phone size={13} color="#34d399" />
                <span style={{ fontWeight: '700' }}>{user.phone || '+919918309983'}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                {resolvedCategoryNames.map((catName, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(16, 185, 129, 0.15)', padding: '3px 10px', borderRadius: '9999px', color: '#6ee7b7', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                    <Briefcase size={12} />
                    <span style={{ fontWeight: '800', fontSize: '0.76rem' }}>{catName}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>



      {/* 3. TAB CONTENT VIEWS */}

      {/* ------------------------------------------------------------- */}
      {/* SUB-TAB 1: PROFILE OVERVIEW */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            
            {/* Personal Details Card */}
            <div style={{ background: '#ffffff', borderRadius: '18px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ padding: '8px', borderRadius: '10px', background: '#e0f2fe', color: '#0284c7' }}>
                    <User size={18} />
                  </div>
                  Personal Information
                </h3>
                <button onClick={() => handleSwitchTab('edit')} style={{ color: '#2563eb', background: '#eff6ff', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer' }}>
                  Edit Details
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                  <span style={{ color: '#64748b', fontSize: '0.86rem', fontWeight: '600' }}>Full Name</span>
                  <span style={{ color: '#0f172a', fontSize: '0.88rem', fontWeight: '700' }}>{user.name || 'Technician Partner'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                  <span style={{ color: '#64748b', fontSize: '0.86rem', fontWeight: '600' }}>Mobile Phone</span>
                  <span style={{ color: '#0f172a', fontSize: '0.88rem', fontWeight: '700' }}>{user.phone || 'N/A'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                  <span style={{ color: '#64748b', fontSize: '0.86rem', fontWeight: '600' }}>Email Address</span>
                  <span style={{ color: '#0f172a', fontSize: '0.88rem', fontWeight: '700' }}>{user.email || 'N/A'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                  <span style={{ color: '#64748b', fontSize: '0.86rem', fontWeight: '600' }}>Date of Birth</span>
                  <span style={{ color: '#0f172a', fontSize: '0.88rem', fontWeight: '700' }}>{user.dob || 'N/A'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                  <span style={{ color: '#64748b', fontSize: '0.86rem', fontWeight: '600' }}>Gender</span>
                  <span style={{ color: '#0f172a', fontSize: '0.88rem', fontWeight: '700' }}>{user.gender || 'Male'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '4px' }}>
                  <span style={{ color: '#64748b', fontSize: '0.86rem', fontWeight: '600' }}>Base City / Zone</span>
                  <span style={{ color: '#16a34a', fontSize: '0.88rem', fontWeight: '800' }}>{resolvedCityName}</span>
                </div>
              </div>
            </div>

            {/* Service & Operating Details Card */}
            <div style={{ background: '#ffffff', borderRadius: '18px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ padding: '8px', borderRadius: '10px', background: '#dcfce7', color: '#16a34a' }}>
                    <Briefcase size={18} />
                  </div>
                  Service & Operational Area
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                  <span style={{ color: '#64748b', fontSize: '0.84rem', fontWeight: '600', display: 'block', marginBottom: '8px' }}>
                    Service Categories (Active Booking Dispatches)
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {resolvedCategoryNames.map((catName, idx) => (
                      <span key={idx} style={{ background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd', padding: '4px 12px', borderRadius: '12px', fontSize: '0.82rem', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Briefcase size={13} /> {catName}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                  <span style={{ color: '#64748b', fontSize: '0.84rem', fontWeight: '600', display: 'block', marginBottom: '8px' }}>
                    Offered Partner Services (Selected Specializations)
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {resolvedOfferedServices.length > 0 ? (
                      resolvedOfferedServices.map((svcName, idx) => (
                        <span key={idx} style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '4px 12px', borderRadius: '12px', fontSize: '0.82rem', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={13} color="#16a34a" /> {svcName}
                        </span>
                      ))
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontStyle: 'italic' }}>
                        All services in selected category enabled
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                  <span style={{ color: '#64748b', fontSize: '0.86rem', fontWeight: '600' }}>Work Experience</span>
                  <span style={{ color: '#0f172a', fontSize: '0.88rem', fontWeight: '700' }}>{user.experience || '3-5 Years'}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                  <span style={{ color: '#64748b', fontSize: '0.86rem', fontWeight: '600' }}>Operating Radius</span>
                  <span style={{ color: '#16a34a', fontSize: '0.88rem', fontWeight: '800' }}>{user.workRadius || 8} km</span>
                </div>

                <div>
                  <span style={{ color: '#64748b', fontSize: '0.84rem', fontWeight: '600', display: 'block', marginBottom: '8px' }}>
                    Active Service Localities
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {user.localities?.length > 0 ? (
                      user.localities.map((loc, idx) => (
                        <span key={idx} style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '4px 10px', borderRadius: '10px', fontSize: '0.78rem', fontWeight: '700' }}>
                          📍 {loc}
                        </span>
                      ))
                    ) : (
                      <>
                        <span style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '4px 10px', borderRadius: '10px', fontSize: '0.78rem', fontWeight: '700' }}>📍 Connaught Place (Central Delhi)</span>
                        <span style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '4px 10px', borderRadius: '10px', fontSize: '0.78rem', fontWeight: '700' }}>📍 South Extension Part 1 & 2</span>
                        <span style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '4px 10px', borderRadius: '10px', fontSize: '0.78rem', fontWeight: '700' }}>📍 Dwarka Sector 10-14</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Quick Shortcuts to Bank & Documents */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div
              onClick={() => handleSwitchTab('bank')}
              style={{ background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)', padding: '20px', borderRadius: '16px', border: '1px solid #a7f3d0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <div>
                <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#065f46' }}>Bank Account & UPI</div>
                <div style={{ fontSize: '0.8rem', color: '#047857' }}>{bank.bankName || 'HDFC Bank'} • {bank.accountNumber ? `•••• ${bank.accountNumber.slice(-4)}` : 'Verified'}</div>
              </div>
              <Landmark size={24} color="#059669" />
            </div>

            <div
              onClick={() => handleSwitchTab('documents')}
              style={{ background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)', padding: '20px', borderRadius: '16px', border: '1px solid #bae6fd', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <div>
                <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#075985' }}>KYC Identity Verification</div>
                <div style={{ fontSize: '0.8rem', color: '#0284c7' }}>Aadhaar, PAN & Passbook docs uploaded</div>
              </div>
              <FileText size={24} color="#0284c7" />
            </div>

            <div
              onClick={() => handleSwitchTab('referral')}
              style={{ background: 'linear-gradient(135deg, #fdf4ff, #fae8ff)', padding: '20px', borderRadius: '16px', border: '1px solid #f5d0fe', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <div>
                <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#701a75' }}>Refer & Earn Program</div>
                <div style={{ fontSize: '0.8rem', color: '#86198f' }}>Code: {referralCode} • Earn ₹{referralBonusAmount}/partner</div>
              </div>
              <Gift size={24} color="#c026d3" />
            </div>
          </div>

        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-TAB 2: EDIT PROFILE */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'edit' && (
        <div style={{ background: '#ffffff', borderRadius: '20px', padding: '28px', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <UserCheck size={20} color="#2563eb" /> Edit Technician Partner Details
          </h3>

          {/* Profile Picture Card inside Edit Profile Tab */}
          <div style={{
            padding: '20px 24px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            border: '1px solid #cbd5e1',
            display: 'flex',
            alignItems: 'center',
            justify: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
              <div style={{ position: 'relative' }}>
                {editForm.profileImage || user.profileImage ? (
                  <img
                    src={editForm.profileImage || user.profileImage}
                    alt="Technician Profile"
                    style={{
                      width: '68px',
                      height: '68px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '3px solid #2563eb',
                      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
                    }}
                  />
                ) : (
                  <div style={{
                    width: '68px',
                    height: '68px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '800',
                    fontSize: '1.6rem',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
                  }}>
                    {(user.name || 'P')[0].toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <div style={{ fontWeight: '800', fontSize: '1rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Camera size={18} color="#2563eb" /> Technician Profile Photo
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                  PNG, JPG or JPEG (Max 5MB). Photo is shown to customers when you accept booking dispatches.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label
                htmlFor="edit-tab-profile-image-input"
                className="btn btn-primary btn-sm"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  padding: '10px 18px',
                  borderRadius: '10px'
                }}
              >
                <Upload size={16} /> Choose & Upload Photo
              </label>
              <input
                id="edit-tab-profile-image-input"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleProfileImageChange(e.target.files[0]);
                  }
                }}
              />
              {(editForm.profileImage || user.profileImage) && (
                <button
                  type="button"
                  onClick={() => {
                    setEditForm((prev) => ({ ...prev, profileImage: '' }));
                    partnerService.updateProfile({ profileImage: '' }).then((res) => {
                      toast.info('Profile image removed');
                      if (onUpdateUser && res.data?.user) onUpdateUser(res.data.user);
                    });
                  }}
                  className="btn btn-secondary btn-sm"
                  style={{ color: '#ef4444', borderColor: '#fca5a5', fontWeight: '700', borderRadius: '10px' }}
                >
                  <Trash2 size={14} /> Remove
                </button>
              )}
            </div>
          </div>

          <form onSubmit={handleSaveProfile} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>Full Name</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="input"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                <span>Email Address</span>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Lock size={11} /> Registered (Non-editable)
                </span>
              </label>
              <input
                type="email"
                value={editForm.email}
                readOnly
                disabled
                className="input"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b', cursor: 'not-allowed', fontWeight: '600' }}
                title="Registered Email Address cannot be changed"
              />
            </div>

            <div>
              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                <span>Mobile Phone Number</span>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Lock size={11} /> Registered (Non-editable)
                </span>
              </label>
              <input
                type="text"
                value={editForm.phone}
                readOnly
                disabled
                className="input"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b', cursor: 'not-allowed', fontWeight: '600' }}
                title="Registered Mobile Number cannot be changed"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>Date of Birth</label>
              <input
                type="date"
                value={editForm.dob}
                onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })}
                className="input"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>Gender</label>
              <select
                value={editForm.gender}
                onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#ffffff' }}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>Work Experience</label>
              <select
                value={editForm.experience}
                onChange={(e) => setEditForm({ ...editForm, experience: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#ffffff' }}
              >
                <option value="1-2 Years">1-2 Years</option>
                <option value="3-5 Years">3-5 Years</option>
                <option value="5-10 Years">5-10 Years</option>
                <option value="10+ Years">10+ Years</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                Service Operating Radius ({editForm.workRadius} KM)
              </label>
              <input
                type="range"
                min="3"
                max="25"
                value={editForm.workRadius}
                onChange={(e) => setEditForm({ ...editForm, workRadius: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                Active Service Localities / Sectors
              </label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <input
                  type="text"
                  placeholder="Enter locality e.g. Indiranagar, Connaught Place"
                  value={editForm.newLocalityInput}
                  onChange={(e) => setEditForm({ ...editForm, newLocalityInput: e.target.value })}
                  style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                />
                <button
                  type="button"
                  onClick={handleAddLocality}
                  style={{ padding: '10px 18px', background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}
                >
                  <Plus size={16} /> Add
                </button>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {editForm.localities.map((loc, idx) => (
                  <span
                    key={idx}
                    style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    📍 {loc}
                    <Trash2 size={13} style={{ cursor: 'pointer', color: '#ef4444' }} onClick={() => handleRemoveLocality(idx)} />
                  </span>
                ))}
              </div>
            </div>

            <div style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
              <button
                type="submit"
                disabled={saving}
                style={{
                  padding: '12px 28px',
                  background: 'linear-gradient(135deg, #16a34a, #059669)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: '800',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(22, 163, 74, 0.3)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {saving ? 'Saving Profile...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-TAB 3: MY DOCUMENTS */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'documents' && (
        <div style={{ background: '#ffffff', borderRadius: '20px', padding: '28px', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileText size={20} color="#0284c7" /> My Identity & Verification Documents
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '4px' }}>
                Government-issued identification required for technician KYC dispatch clearance.
              </p>
            </div>
            <span style={{
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.78rem',
              fontWeight: '800',
              background: isApproved ? '#dcfce7' : '#fef3c7',
              color: isApproved ? '#15803d' : '#b45309'
            }}>
              {isApproved ? 'VERIFIED PARTNER' : 'PENDING CITY ADMIN REVIEW'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px' }}>
            {[
              { key: 'aadhaarFront', label: 'Aadhaar Card (Front)', desc: 'Front photo showing Aadhaar Number & Name' },
              { key: 'aadhaarBack', label: 'Aadhaar Card (Back)', desc: 'Back photo showing full Address & PIN Code' },
              { key: 'panDoc', label: 'PAN Card', desc: 'Government PAN card identification' },
              { key: 'drivingLicenseDoc', label: 'Driving License / ID', desc: 'Valid Driving License or Voter ID' },
              { key: 'bankPassbookDoc', label: 'Bank Passbook / Cheque', desc: 'Cancelled Cheque or Bank Passbook copy' },
              { key: 'passportPhoto', label: 'Profile Passport Photo', desc: 'Clear front-facing profile photo' },
            ].map((item) => {
              const docUrl = documentsState[item.key] || docs[item.key] || DEFAULT_KYC_IMAGE;
              const docStatus = (docs.statuses && docs.statuses[item.key]) || (isApproved ? 'approved' : 'pending');
              const rejectionReason = (docs.rejectionReasons && docs.rejectionReasons[item.key]) || 'Document image was illegible or blurry. Please upload a clear photo.';

              return (
                <div key={item.key} style={{ padding: '20px', border: '1px solid #e2e8f0', borderRadius: '18px', background: '#f8fafc', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '14px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        {/* Inline Thumbnail Preview */}
                        <div 
                          onClick={() => handleOpenDocPreview(item.label, docUrl, item.key, docStatus, rejectionReason)}
                          style={{ 
                            width: '48px', 
                            height: '48px', 
                            borderRadius: '10px', 
                            overflow: 'hidden', 
                            border: '1px solid #cbd5e1',
                            cursor: 'pointer',
                            flexShrink: 0
                          }}
                        >
                          <img 
                            src={docUrl} 
                            alt={item.label} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_KYC_IMAGE; }}
                          />
                        </div>
                        <div>
                          <div style={{ fontWeight: '800', fontSize: '0.94rem', color: '#0f172a' }}>{item.label}</div>
                          <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px' }}>{item.desc}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      {docStatus === 'approved' && (
                        <span style={{ fontSize: '0.74rem', fontWeight: '800', background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={12} /> Verified & Approved
                        </span>
                      )}
                      {docStatus === 'rejected' && (
                        <span style={{ fontSize: '0.74rem', fontWeight: '800', background: '#fef2f2', color: '#dc2626', padding: '4px 10px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <AlertTriangle size={12} /> Rejected by Admin
                        </span>
                      )}
                      {docStatus === 'pending' && (
                        <span style={{ fontSize: '0.74rem', fontWeight: '800', background: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Clock3 size={12} /> Under Verification
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleOpenDocPreview(item.label, docUrl, item.key, docStatus, rejectionReason)}
                        style={{ color: '#0284c7', background: 'none', border: 'none', padding: 0, fontSize: '0.84rem', fontWeight: '800', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Eye size={16} /> Enlarge Image
                      </button>
                    </div>

                    {/* Status specific actions */}
                    {docStatus === 'approved' ? (
                      <div style={{ padding: '10px 12px', background: '#f0fdf4', borderRadius: '10px', border: '1px solid #bbf7d0', fontSize: '0.78rem', color: '#166534', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Lock size={14} /> Document Verified (Re-upload Disabled)
                      </div>
                    ) : docStatus === 'rejected' ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ padding: '8px 12px', background: '#fef2f2', borderRadius: '10px', border: '1px solid #fee2e2', fontSize: '0.78rem', color: '#991b1b', fontWeight: '600' }}>
                          <strong>Reason:</strong> {rejectionReason}
                        </div>
                        <label style={{ fontSize: '0.78rem', fontWeight: '800', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Upload size={14} /> Re-upload Clear Image:
                        </label>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => handleFileUpload(item.key, e.target.files[0])}
                          style={{ fontSize: '0.8rem' }}
                        />
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#1e293b' }}>
                          Select File to Update:
                        </label>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => handleFileUpload(item.key, e.target.files[0])}
                          style={{ fontSize: '0.8rem' }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '24px' }}>
            <button
              onClick={handleSaveDocuments}
              disabled={saving}
              style={{
                padding: '12px 28px',
                background: '#0284c7',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '800',
                fontSize: '0.92rem',
                cursor: 'pointer'
              }}
            >
              {saving ? 'Submitting Documents...' : 'Submit Documents for Verification'}
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-TAB 4: BANK DETAILS */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'bank' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Active Verified Bank Summary Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
            borderRadius: '20px',
            padding: '24px 28px',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 10px 25px rgba(16, 185, 129, 0.25)'
          }}>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.8px', opacity: 0.9 }}>
                {bankForm.accountNumber ? 'Verified Settlement Account' : 'Settlement Account Pending'}
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: '900', marginTop: '4px' }}>
                {bankForm.bankName || 'No Bank Added'}
              </div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9, marginTop: '4px' }}>
                Account Holder: <strong>{bankForm.accountHolderName || user.name || 'Not Provided'}</strong>
              </div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                Account Number: <strong>{bankForm.accountNumber ? `•••• •••• ${bankForm.accountNumber.slice(-4)}` : 'Not Provided'}</strong> | IFSC: <strong>{bankForm.ifscCode || 'Not Provided'}</strong>
              </div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.2)', padding: '12px 18px', borderRadius: '14px', backdropFilter: 'blur(10px)', textAlign: 'right' }}>
              <div style={{ fontSize: '0.74rem', fontWeight: '700', textTransform: 'uppercase' }}>Auto Payout Status</div>
              {bankForm.accountNumber ? (
                <div style={{ fontSize: '0.95rem', fontWeight: '900', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                  <CheckCircle2 size={16} /> ACTIVE & VERIFIED
                </div>
              ) : (
                <div style={{ fontSize: '0.95rem', fontWeight: '900', color: '#fde047', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                  <AlertCircle size={16} /> SETUP REQUIRED
                </div>
              )}
            </div>
          </div>

          {/* Edit Bank Account Form */}
          <div style={{ background: '#ffffff', borderRadius: '20px', padding: '28px', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: '0 0 18px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Landmark size={20} color="#059669" /> Manage Bank Account & UPI Payout Details
            </h3>

            <form onSubmit={handleSaveBankDetails} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>Account Holder Name</label>
                <input
                  type="text"
                  value={bankForm.accountHolderName}
                  onChange={(e) => setBankForm({ ...bankForm, accountHolderName: e.target.value })}
                  placeholder="Name as per Bank Passbook"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>Bank Name</label>
                <select
                  value={bankForm.bankName}
                  onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#ffffff' }}
                  required
                >
                  <option value="" disabled>Select Bank</option>
                  <option value="HDFC Bank">HDFC Bank</option>
                  <option value="State Bank of India (SBI)">State Bank of India (SBI)</option>
                  <option value="ICICI Bank">ICICI Bank</option>
                  <option value="Axis Bank">Axis Bank</option>
                  <option value="Punjab National Bank">Punjab National Bank</option>
                  <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                  <option value="Bank of Baroda">Bank of Baroda</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>Account Number</label>
                <input
                  type="text"
                  value={bankForm.accountNumber}
                  onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                  placeholder="Enter 9-18 digit account number"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>Confirm Account Number</label>
                <input
                  type="text"
                  value={bankForm.confirmAccountNumber}
                  onChange={(e) => setBankForm({ ...bankForm, confirmAccountNumber: e.target.value })}
                  placeholder="Re-enter account number"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>IFSC Code</label>
                <input
                  type="text"
                  value={bankForm.ifscCode}
                  onChange={(e) => setBankForm({ ...bankForm, ifscCode: e.target.value.toUpperCase() })}
                  placeholder="e.g. HDFC0001234"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>UPI ID (Instant Payout)</label>
                <input
                  type="text"
                  value={bankForm.upiId}
                  onChange={(e) => setBankForm({ ...bankForm, upiId: e.target.value })}
                  placeholder="e.g. 8726600653@paytm or monu@okaxis"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: '12px 28px',
                    background: '#059669',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: '800',
                    fontSize: '0.92rem',
                    cursor: 'pointer'
                  }}
                >
                  {saving ? 'Updating Bank Account...' : 'Save & Verify Bank Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-TAB 5: REFERRAL PROGRAM */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'referral' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Hero Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #701a75 0%, #a21caf 60%, #c026d3 100%)',
            borderRadius: '24px',
            padding: '32px',
            color: '#ffffff',
            boxShadow: '0 16px 36px rgba(162, 28, 175, 0.25)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ maxWidth: '600px' }}>
              <span style={{ background: 'rgba(255, 255, 255, 0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                🎁 NOROZZ PARTNER REFERRAL PROGRAM
              </span>
              <h2 style={{ fontSize: '1.8rem', fontWeight: '900', margin: '12px 0 8px 0', letterSpacing: '-0.5px' }}>
                Refer Service Technicians & Earn ₹{referralBonusAmount} Per Signup!
              </h2>
              <p style={{ fontSize: '0.9rem', opacity: 0.9, lineHeight: 1.5 }}>
                Invite your technician friends to join the NOROZZ Partner Network. You get ₹{referralBonusAmount} directly in your wallet as soon as they complete their 1st customer booking!
              </p>
            </div>

            {/* Code Box */}
            <div style={{ marginTop: '24px', background: 'rgba(0, 0, 0, 0.25)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '16px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.6px', opacity: 0.8, fontWeight: '700' }}>Your Unique Referral Code</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '900', letterSpacing: '1px', color: '#fef08a' }}>{referralCode}</div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={handleCopyReferralCode}
                  style={{ padding: '10px 18px', background: '#ffffff', color: '#701a75', border: 'none', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  {copiedRef ? <Check size={16} color="#16a34a" /> : <Copy size={16} />} {copiedRef ? 'Copied!' : 'Copy Code'}
                </button>
                <button
                  onClick={handleShareWhatsApp}
                  style={{ padding: '10px 18px', background: '#25d366', color: '#ffffff', border: 'none', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Share2 size={16} /> Share on WhatsApp
                </button>
              </div>
            </div>
          </div>

          {/* Referral Statistics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{ background: '#ffffff', borderRadius: '18px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '700' }}>Total Referred Users</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#0f172a', marginTop: '4px' }}>
                {referralData?.joinedCount ?? referralData?.totalInvitesSent ?? 0}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>Joined using your code</div>
            </div>

            <div style={{ background: '#ffffff', borderRadius: '18px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '700' }}>Joined Technicians</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#16a34a', marginTop: '4px' }}>
                {referralData?.joinedTechnicians ?? 0}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#16a34a', marginTop: '2px' }}>Service Partners</div>
            </div>

            <div style={{ background: '#ffffff', borderRadius: '18px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '700' }}>Joined Customers</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#2563eb', marginTop: '4px' }}>
                {referralData?.joinedCustomers ?? 0}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#2563eb', marginTop: '2px' }}>Customer App Users</div>
            </div>

            <div style={{ background: '#ffffff', borderRadius: '18px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '700' }}>Total Referral Bonus Earned</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#c026d3', marginTop: '4px' }}>
                ₹{(referralData?.totalReferralBonusEarned ?? 0).toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#c026d3', marginTop: '2px' }}>Credited to Wallet</div>
            </div>

            <div style={{ background: '#ffffff', borderRadius: '18px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '700' }}>Pending Earnings</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#d97706', marginTop: '4px' }}>
                ₹{(referralData?.pendingEarnings ?? 0).toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#d97706', marginTop: '2px' }}>Pending 1st Booking</div>
            </div>
          </div>

          {/* How Referral Works */}
          <div style={{ background: '#ffffff', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: '0 0 16px 0' }}>How the Referral Bonus Works</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
              <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: '800', color: '#2563eb', fontSize: '0.9rem' }}>1. Share Your Code</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>Share code {referralCode} via WhatsApp or SMS.</div>
              </div>
              <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: '800', color: '#2563eb', fontSize: '0.9rem' }}>2. Friend Registers</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>Your friend registers as partner or customer using your code.</div>
              </div>
              <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: '800', color: '#2563eb', fontSize: '0.9rem' }}>3. 1st Job Completed</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>Friend finishes 1st job or booking.</div>
              </div>
              <div style={{ padding: '14px', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
                <div style={{ fontWeight: '800', color: '#16a34a', fontSize: '0.9rem' }}>4. Get ₹{referralBonusAmount} Cash!</div>
                <div style={{ fontSize: '0.8rem', color: '#15803d', marginTop: '4px' }}>Instant ₹{referralBonusAmount} credited directly to your Wallet.</div>
              </div>
            </div>
          </div>

          {/* Referred Users & Technicians Joined List */}
          <div style={{ background: '#ffffff', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserCheck size={20} color="#16a34a" /> Referred Users & Technicians ({referralData?.joinedList?.length || 0})
              </h3>

              {/* Filter Tabs */}
              <div style={{ display: 'flex', gap: '6px', background: '#f1f5f9', padding: '4px', borderRadius: '10px' }}>
                {['ALL', 'PARTNER', 'CUSTOMER'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setReferralUserFilter(f)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: '800',
                      border: 'none',
                      cursor: 'pointer',
                      background: referralUserFilter === f ? '#ffffff' : 'transparent',
                      color: referralUserFilter === f ? '#0f172a' : '#64748b',
                      boxShadow: referralUserFilter === f ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
                    }}
                  >
                    {f === 'ALL' ? 'All Users' : f === 'PARTNER' ? 'Technicians' : 'Customers'}
                  </button>
                ))}
              </div>
            </div>

            {(!referralData?.joinedList || referralData.joinedList.length === 0) ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#334155' }}>No Users Joined Yet</div>
                <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>Share your code <strong>{referralCode}</strong> with friends & technicians to earn ₹{referralBonusAmount} per signup!</div>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '0.76rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      <th style={{ padding: '12px', borderRadius: '8px 0 0 8px' }}>USER / TECHNICIAN NAME</th>
                      <th style={{ padding: '12px' }}>USER ROLE</th>
                      <th style={{ padding: '12px' }}>PHONE / CONTACT</th>
                      <th style={{ padding: '12px' }}>JOIN DATE</th>
                      <th style={{ padding: '12px' }}>KYC / ACCOUNT STATUS</th>
                      <th style={{ padding: '12px', borderRadius: '0 8px 8px 0' }}>REFERRAL BONUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {referralData.joinedList
                      .filter((u) => referralUserFilter === 'ALL' || (u.role || 'partner').toUpperCase() === referralUserFilter)
                      .map((u) => {
                        const joinDateStr = u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent';
                        const isCredited = u.referralBonusStatus === 'credited';
                        const isPartner = u.role === 'partner';
                        return (
                          <tr key={u._id || u.phone} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '12px' }}>
                              <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '0.9rem' }}>{u.name || (isPartner ? 'Service Partner' : 'Customer User')}</div>
                              {u.userId && <div style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'monospace' }}>{u.userId}</div>}
                            </td>
                            <td style={{ padding: '12px' }}>
                              <span className={`badge ${isPartner ? 'badge-success' : 'badge-purple'}`} style={{ fontSize: '0.7rem' }}>
                                {isPartner ? 'TECHNICIAN' : 'CUSTOMER'}
                              </span>
                            </td>
                            <td style={{ padding: '12px', fontSize: '0.85rem', color: '#475569', fontWeight: '600' }}>{u.phone || u.email || 'N/A'}</td>
                            <td style={{ padding: '12px', fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>{joinDateStr}</td>
                            <td style={{ padding: '12px' }}>
                              <span className={`badge ${u.kycStatus === 'approved' || u.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                                {(u.kycStatus || u.status || 'active').toUpperCase()}
                              </span>
                            </td>
                            <td style={{ padding: '12px' }}>
                              <span style={{
                                padding: '4px 10px',
                                borderRadius: '9999px',
                                fontSize: '0.78rem',
                                fontWeight: '800',
                                background: isCredited ? '#f0fdf4' : '#fffbeb',
                                color: isCredited ? '#16a34a' : '#d97706',
                                border: `1px solid ${isCredited ? '#bbf7d0' : '#fde68a'}`
                              }}>
                                {isCredited ? `✓ ₹${referralBonusAmount} Credited` : '⏳ Pending 1st Booking'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-TAB 6: WALLET & EARNINGS CONTROL CENTER (Figma Specs) */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'wallet' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          
          {/* TOP HERO CARD: EARNINGS & WALLET BALANCE */}
          <div style={{
            background: 'linear-gradient(135deg, #14532d 0%, #16a34a 60%, #22c55e 100%)',
            borderRadius: '24px',
            padding: '28px',
            color: '#ffffff',
            boxShadow: '0 16px 36px rgba(22, 163, 74, 0.25)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.9, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Wallet size={18} /> Total Earned Cash Balance
                  <span style={{ background: 'rgba(255,255,255,0.25)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.72rem' }}>+15.4%</span>
                </div>
                <div style={{ fontSize: '2.8rem', fontWeight: '900', marginTop: '8px', letterSpacing: '-1px' }}>
                  ₹{(walletData?.walletBalance ?? user.walletBalance ?? 0).toLocaleString('en-IN')}.00
                </div>
                <div style={{ fontSize: '0.84rem', opacity: 0.9, marginTop: '4px' }}>
                  Auto-settlement linked to {walletData?.bankDetails?.bankName || bankForm?.bankName || 'Verified Bank Account'} (•••• {walletData?.bankDetails?.accountNumber ? walletData.bankDetails.accountNumber.slice(-4) : (bankForm?.accountNumber ? bankForm.accountNumber.slice(-4) : '••••')})
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setWithdrawModalOpen(true)}
                  style={{
                    padding: '12px 22px',
                    background: '#ffffff',
                    color: '#16a34a',
                    border: 'none',
                    borderRadius: '14px',
                    fontWeight: '900',
                    fontSize: '0.92rem',
                    cursor: 'pointer',
                    boxShadow: '0 6px 18px rgba(0,0,0,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <ArrowUpRight size={18} /> Withdraw Cash
                </button>
                <button
                  type="button"
                  onClick={() => setDepositModalOpen(true)}
                  style={{
                    padding: '12px 20px',
                    background: 'rgba(255, 255, 255, 0.18)',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.35)',
                    borderRadius: '14px',
                    fontWeight: '800',
                    fontSize: '0.88rem',
                    cursor: 'pointer'
                  }}
                >
                  + Add Deposit
                </button>
              </div>
            </div>

            {/* Quick Stats Strip */}
            <div style={{ marginTop: '24px', borderTop: '1px solid rgba(255,255,255,0.25)', paddingTop: '18px', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '0.74rem', opacity: 0.8, fontWeight: '700', textTransform: 'uppercase' }}>Security Deposit</div>
                <div style={{ fontSize: '1.1rem', fontWeight: '900' }}>₹{(walletData?.securityDeposit ?? 0).toLocaleString('en-IN')}</div>
              </div>
              <div style={{ borderLeft: '1px solid rgba(255,255,255,0.25)', paddingLeft: '24px' }}>
                <div style={{ fontSize: '0.74rem', opacity: 0.8, fontWeight: '700', textTransform: 'uppercase' }}>Pending Clearance</div>
                <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#fef08a' }}>₹{(walletData?.pendingClearance ?? 0).toLocaleString('en-IN')}</div>
              </div>
              <div style={{ borderLeft: '1px solid rgba(255,255,255,0.25)', paddingLeft: '24px' }}>
                <div style={{ fontSize: '0.74rem', opacity: 0.8, fontWeight: '700', textTransform: 'uppercase' }}>Total Lifetime Earned</div>
                <div style={{ fontSize: '1.1rem', fontWeight: '900' }}>₹{(walletData?.totalEarned ?? 0).toLocaleString('en-IN')}</div>
              </div>
            </div>
          </div>

          {/* TIMEFRAME SELECTION TABS */}
          <div style={{ background: '#ffffff', borderRadius: '20px', padding: '8px', border: '1px solid #e2e8f0', display: 'flex', gap: '6px' }}>
            {[
              { key: 'overview', label: 'Overview & Performance' },
              { key: 'daily', label: 'Daily Earnings' },
              { key: 'weekly', label: 'Weekly Breakdown' },
              { key: 'monthly', label: 'Monthly Breakdown' },
            ].map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setEarningsTimeframe(t.key)}
                style={{
                  flex: 1,
                  padding: '12px 14px',
                  borderRadius: '14px',
                  border: 'none',
                  fontSize: '0.86rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  background: earningsTimeframe === t.key ? '#16a34a' : 'transparent',
                  color: earningsTimeframe === t.key ? '#ffffff' : '#64748b',
                  transition: 'all 0.2s ease'
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* SCREEN 1: OVERVIEW & PERFORMANCE */}
          {earningsTimeframe === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ background: '#ffffff', borderRadius: '22px', padding: '24px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0f172a', margin: 0 }}>Monthly Performance Trend</h3>
                    <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '2px 0 0 0' }}>Earnings trajectory for past 7 months</p>
                  </div>
                  <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#16a34a', background: '#f0fdf4', padding: '6px 12px', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
                    📈 +15.4% Growth
                  </span>
                </div>

                {/* CSS Bar Chart */}
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: '180px', paddingTop: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
                  {(earningsData?.overview?.monthlyTrend || [
                    { month: 'Jan', val: 32000, height: '40%' },
                    { month: 'Feb', val: 41000, height: '52%' },
                    { month: 'Mar', val: 48000, height: '62%' },
                    { month: 'Apr', val: 56000, height: '72%' },
                    { month: 'May', val: 62000, height: '78%' },
                    { month: 'Jun', val: 74000, height: '88%' },
                    { month: 'Jul', val: earningsData?.overview?.totalEarned || 85200, height: '100%' },
                  ]).map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '40px' }}>
                      <span style={{ fontSize: '0.68rem', fontWeight: '800', color: '#16a34a' }}>₹{(item.val/1000).toFixed(0)}k</span>
                      <div style={{
                        width: '28px',
                        height: item.height,
                        background: idx === 6 ? 'linear-gradient(180deg, #16a34a 0%, #15803d 100%)' : '#e2e8f0',
                        borderRadius: '8px 8px 0 0',
                        transition: 'all 0.3s ease'
                      }} />
                      <span style={{ fontSize: '0.76rem', fontWeight: '700', color: '#64748b' }}>{item.month}</span>
                    </div>
                  ))}
                </div>

                {/* Bottom Metric Cards Matching Figma */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '20px' }}>
                  <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '14px', border: '1px solid #f1f5f9', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: '700' }}>TOTAL JOBS</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0f172a', marginTop: '2px' }}>{earningsData?.overview?.totalJobs ?? 0}</div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '14px', border: '1px solid #f1f5f9', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: '700' }}>AVG / JOB</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#16a34a', marginTop: '2px' }}>₹{earningsData?.overview?.avgPerJob ?? 0}</div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '14px', border: '1px solid #f1f5f9', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: '700' }}>TOTAL EARNED</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#2563eb', marginTop: '2px' }}>₹{(earningsData?.overview?.totalEarned ?? 0).toLocaleString('en-IN')}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 2: DAILY EARNINGS (Figma Match) */}
          {earningsTimeframe === 'daily' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Header Navigator */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', padding: '14px 20px', borderRadius: '18px', border: '1px solid #e2e8f0' }}>
                <button type="button" style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer' }}>‹ Prev</button>
                <div style={{ fontWeight: '900', fontSize: '0.96rem', color: '#0f172a' }}>{earningsData?.daily?.dateLabel || 'Today'}</div>
                <button type="button" style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer' }}>Next ›</button>
              </div>

              {/* Total Earned Today Card */}
              <div style={{ background: '#ffffff', borderRadius: '22px', padding: '24px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '700' }}>Total Earned Today</div>
                  <div style={{ fontSize: '2.2rem', fontWeight: '900', color: '#16a34a', marginTop: '2px' }}>
                    ₹{(earningsData?.daily?.totalEarnedToday ?? 0).toLocaleString('en-IN')}
                  </div>
                </div>
                <span style={{ background: '#dcfce7', color: '#15803d', padding: '6px 14px', borderRadius: '20px', fontWeight: '800', fontSize: '0.84rem' }}>
                  {earningsData?.daily?.percentageChange || '0%'} vs Yesterday
                </span>
              </div>

              {/* Hourly Activity Bar Graph */}
              <div style={{ background: '#ffffff', borderRadius: '22px', padding: '24px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ fontSize: '0.8rem', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
                  HOURLY ACTIVITY
                </h4>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: '140px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
                  {(earningsData?.daily?.hourlyActivity || []).map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', width: '40px' }}>
                      {item.val > 0 && <span style={{ fontSize: '0.68rem', fontWeight: '800', color: '#16a34a' }}>₹{item.val}</span>}
                      <div style={{
                        width: '24px',
                        height: item.val > 0 ? `${(item.val / 1200) * 100}px` : '4px',
                        background: item.val > 0 ? '#16a34a' : '#cbd5e1',
                        borderRadius: '6px 6px 0 0'
                      }} />
                      <span style={{ fontSize: '0.74rem', fontWeight: '700', color: '#64748b' }}>{item.hour}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Completed Jobs Breakdown List */}
              <div style={{ background: '#ffffff', borderRadius: '22px', padding: '24px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ fontSize: '0.8rem', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px' }}>
                  COMPLETED JOBS TODAY
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {(!earningsData?.daily?.completedJobs || earningsData.daily.completedJobs.length === 0) ? (
                    <div style={{ padding: '16px', textAlign: 'center', color: '#64748b', fontSize: '0.84rem' }}>
                      No service jobs completed today yet.
                    </div>
                  ) : (
                    earningsData.daily.completedJobs.map((j, idx) => (
                      <div key={idx} style={{ padding: '14px 18px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: '800', fontSize: '0.92rem', color: '#0f172a' }}>{j.serviceName}</div>
                          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>Customer: {j.customerName} • {j.time}</div>
                        </div>
                        <div style={{ fontWeight: '900', fontSize: '1.05rem', color: '#16a34a' }}>+ ₹{j.amount}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 3: WEEKLY BREAKDOWN (Figma Match) */}
          {earningsTimeframe === 'weekly' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Week Navigator Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', padding: '14px 20px', borderRadius: '18px', border: '1px solid #e2e8f0' }}>
                <button type="button" style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer' }}>‹ Prev Week</button>
                <div style={{ fontWeight: '900', fontSize: '0.96rem', color: '#0f172a' }}>{earningsData?.weekly?.weekLabel || 'Current Week'}</div>
                <button type="button" style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer' }}>Next Week ›</button>
              </div>

              {/* Total Earned This Week Card */}
              <div style={{ background: '#ffffff', borderRadius: '22px', padding: '24px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '700' }}>Total Earned This Week</div>
                  <div style={{ fontSize: '2.2rem', fontWeight: '900', color: '#16a34a', marginTop: '2px' }}>
                    ₹{(earningsData?.weekly?.totalEarnedWeek ?? 0).toLocaleString('en-IN')}
                  </div>
                </div>
                <span style={{ background: '#dcfce7', color: '#15803d', padding: '6px 14px', borderRadius: '20px', fontWeight: '800', fontSize: '0.84rem' }}>
                  {earningsData?.weekly?.percentageChange || '0%'} vs Last Week
                </span>
              </div>

              {/* Daily Breakdown Bar Chart */}
              <div style={{ background: '#ffffff', borderRadius: '22px', padding: '24px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ fontSize: '0.8rem', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
                  DAILY BREAKDOWN
                </h4>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: '150px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
                  {(earningsData?.weekly?.dailyBreakdown || []).map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', width: '36px' }}>
                      {item.val > 0 && <span style={{ fontSize: '0.68rem', fontWeight: '800', color: '#16a34a' }}>₹{(item.val/1000).toFixed(1)}k</span>}
                      <div style={{
                        width: '24px',
                        height: item.val > 0 ? `${(item.val / 4200) * 110}px` : '4px',
                        background: item.val > 0 ? 'linear-gradient(180deg, #16a34a, #15803d)' : '#cbd5e1',
                        borderRadius: '6px 6px 0 0'
                      }} />
                      <span style={{ fontSize: '0.74rem', fontWeight: '700', color: '#64748b' }}>{item.day}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Busiest Day Highlight Card */}
              <div style={{ background: '#f0fdf4', padding: '20px', borderRadius: '18px', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Award size={24} />
                </div>
                <div>
                  <div style={{ fontWeight: '800', fontSize: '0.96rem', color: '#14532d' }}>
                    Busiest Day: {earningsData?.weekly?.busiestDay || 'None'}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#166534', marginTop: '2px' }}>
                    {earningsData?.weekly?.busiestDayDetails || 'No completed jobs recorded this week yet'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 4: MONTHLY BREAKDOWN (Figma Match) */}
          {earningsTimeframe === 'monthly' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Month Navigator Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', padding: '14px 20px', borderRadius: '18px', border: '1px solid #e2e8f0' }}>
                <button type="button" style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer' }}>‹ Prev Month</button>
                <div style={{ fontWeight: '900', fontSize: '0.96rem', color: '#0f172a' }}>{earningsData?.monthly?.monthLabel || 'Current Month'}</div>
                <button type="button" style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer' }}>Next Month ›</button>
              </div>

              {/* Total Earned This Month Card */}
              <div style={{ background: '#ffffff', borderRadius: '22px', padding: '24px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '700' }}>Total Earned This Month</div>
                  <div style={{ fontSize: '2.2rem', fontWeight: '900', color: '#16a34a', marginTop: '2px' }}>
                    ₹{(earningsData?.monthly?.totalEarnedMonth ?? 0).toLocaleString('en-IN')}
                  </div>
                </div>
                <span style={{ background: '#dcfce7', color: '#15803d', padding: '6px 14px', borderRadius: '20px', fontWeight: '800', fontSize: '0.84rem' }}>
                  {earningsData?.monthly?.percentageChange || '0%'} vs Last Month
                </span>
              </div>

              {/* Weekly Breakdown Bar Graph */}
              <div style={{ background: '#ffffff', borderRadius: '22px', padding: '24px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ fontSize: '0.8rem', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
                  WEEKLY BREAKDOWN
                </h4>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: '140px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
                  {(earningsData?.monthly?.weeklyBreakdown || []).map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', width: '50px' }}>
                      {item.val > 0 && <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#16a34a' }}>₹{(item.val/1000).toFixed(1)}k</span>}
                      <div style={{
                        width: '32px',
                        height: item.val > 0 ? `${(item.val / 13000) * 100}px` : '4px',
                        background: item.val > 0 ? 'linear-gradient(180deg, #16a34a, #15803d)' : '#cbd5e1',
                        borderRadius: '6px 6px 0 0'
                      }} />
                      <span style={{ fontSize: '0.76rem', fontWeight: '700', color: '#64748b' }}>{item.week}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Monthly Stats Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                <div style={{ background: '#ffffff', borderRadius: '18px', padding: '18px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700' }}>Average Weekly Earned</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#0f172a', marginTop: '2px' }}>
                    ₹{(earningsData?.monthly?.avgWeeklyEarned ?? 0).toLocaleString('en-IN')}
                  </div>
                </div>

                <div style={{ background: '#ffffff', borderRadius: '18px', padding: '18px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700' }}>Active Working Days</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#16a34a', marginTop: '2px' }}>
                    {earningsData?.monthly?.activeDays ?? 0} Days
                  </div>
                </div>

                <div style={{ background: '#ffffff', borderRadius: '18px', padding: '18px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700' }}>Payout Destination</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#2563eb', marginTop: '4px' }}>
                    {bankForm?.bankName ? `${bankForm.bankName} (•••• ${bankForm.accountNumber ? bankForm.accountNumber.slice(-4) : '••••'})` : 'Bank Account Not Linked'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* REAL-TIME TRANSACTIONS LEDGER */}
          <div style={{ background: '#ffffff', borderRadius: '22px', padding: '24px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '900', color: '#0f172a', margin: '0 0 16px 0' }}>Recent Wallet Transactions Ledger</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(!walletData?.transactions || walletData.transactions.length === 0) ? (
                <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '0.86rem' }}>
                  No wallet transactions recorded yet. Completed service job payouts will be credited here automatically.
                </div>
              ) : (
                walletData.transactions.map((t, idx) => (
                  <div key={t.transactionId || idx} style={{ padding: '14px 18px', background: '#f8fafc', borderRadius: '14px', border: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '800', fontSize: '0.9rem', color: '#0f172a' }}>{t.title || t.desc || 'Service Job Payout'}</div>
                      <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px' }}>
                        {t.transactionId || `TXN-${idx + 100}`} • {t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recent'}
                      </div>
                    </div>
                    <span style={{ fontWeight: '900', fontSize: '1rem', color: t.type === 'Credit' ? '#16a34a' : '#dc2626' }}>
                      {t.type === 'Credit' ? '+' : '-'} ₹{Number(t.amount || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-TAB 7: SETTINGS (Full Figma Multi-Screen Navigation) */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'settings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Sub-Screen Top Navigation Header */}
          {settingsScreen !== 'main' && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', padding: '14px 20px', borderRadius: '18px', border: '1px solid #e2e8f0' }}>
              <button
                type="button"
                onClick={() => setSettingsScreen('main')}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '10px', padding: '8px 14px', fontSize: '0.84rem', fontWeight: '800', color: '#0f172a', display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
              >
                <ArrowLeft size={16} /> Back to Settings
              </button>
              <div style={{ fontWeight: '800', fontSize: '1rem', color: '#0f172a' }}>
                {settingsScreen === 'notifications' && 'Notification Settings'}
                {settingsScreen === 'terms' && 'Terms & Conditions'}
                {settingsScreen === 'faqs' && 'Frequently Asked Questions'}
                {settingsScreen === 'privacy' && 'Privacy & Security'}
                {settingsScreen === 'password' && 'Change Password'}
                {settingsScreen === 'help' && 'Help Center'}
                {settingsScreen === 'chat' && 'Live Chat Support'}
                {settingsScreen === 'complaint' && 'Raise a Complaint'}
                {settingsScreen === 'about' && 'About Partner App'}
              </div>
            </div>
          )}

          {/* SCREEN 1: MAIN SETTINGS MENU */}
          {settingsScreen === 'main' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* ACCOUNT DETAILS */}
              <div style={{ background: '#ffffff', borderRadius: '20px', padding: '20px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
                  ACCOUNT DETAILS
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setSettingsScreen('notifications')}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '14px', cursor: 'pointer', textAlign: 'left' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#dbeafe', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Bell size={20} />
                      </div>
                      <div>
                        <div style={{ fontWeight: '800', fontSize: '0.92rem', color: '#0f172a' }}>Notification Settings</div>
                        <div style={{ fontSize: '0.76rem', color: '#64748b' }}>Manage booking alerts, sound & vibration</div>
                      </div>
                    </div>
                    <ChevronRight size={18} color="#94a3b8" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setSettingsScreen('terms')}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '14px', cursor: 'pointer', textAlign: 'left' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FileText size={20} />
                      </div>
                      <div>
                        <div style={{ fontWeight: '800', fontSize: '0.92rem', color: '#0f172a' }}>Terms & Conditions</div>
                        <div style={{ fontSize: '0.76rem', color: '#64748b' }}>User agreement, partner policies & privacy summary</div>
                      </div>
                    </div>
                    <ChevronRight size={18} color="#94a3b8" />
                  </button>
                </div>
              </div>

              {/* PREFERENCES */}
              <div style={{ background: '#ffffff', borderRadius: '20px', padding: '20px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
                  PREFERENCES
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setSettingsScreen('faqs')}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '14px', cursor: 'pointer', textAlign: 'left' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <HelpCircle size={20} />
                      </div>
                      <div>
                        <div style={{ fontWeight: '800', fontSize: '0.92rem', color: '#0f172a' }}>FAQs</div>
                        <div style={{ fontSize: '0.76rem', color: '#64748b' }}>Search frequently asked questions & solutions</div>
                      </div>
                    </div>
                    <ChevronRight size={18} color="#94a3b8" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setSettingsScreen('privacy')}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '14px', cursor: 'pointer', textAlign: 'left' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ShieldCheck size={20} />
                      </div>
                      <div>
                        <div style={{ fontWeight: '800', fontSize: '0.92rem', color: '#0f172a' }}>Privacy & Security</div>
                        <div style={{ fontSize: '0.76rem', color: '#64748b' }}>2FA, biometric login & password change</div>
                      </div>
                    </div>
                    <ChevronRight size={18} color="#94a3b8" />
                  </button>

                  {/* App Language */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#fae8ff', color: '#c026d3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Globe size={20} />
                      </div>
                      <div>
                        <div style={{ fontWeight: '800', fontSize: '0.92rem', color: '#0f172a' }}>App Language</div>
                        <div style={{ fontSize: '0.76rem', color: '#64748b' }}>Selected: {settingsForm.language}</div>
                      </div>
                    </div>
                    <select
                      value={settingsForm.language}
                      onChange={(e) => handleToggleSetting('language', 'language', e.target.value)}
                      style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.84rem', fontWeight: '700', background: '#ffffff', cursor: 'pointer' }}
                    >
                      <option value="English">English</option>
                      <option value="Hindi">हिंदी (Hindi)</option>
                      <option value="Hinglish">Hinglish</option>
                      <option value="Marathi">मराठी (Marathi)</option>
                      <option value="Kannada">ಕನ್ನಡ (Kannada)</option>
                      <option value="Tamil">தமிழ் (Tamil)</option>
                      <option value="Telugu">తెలుగు (Telugu)</option>
                      <option value="Bengali">বাংলা (Bengali)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SUPPORT & INFO */}
              <div style={{ background: '#ffffff', borderRadius: '20px', padding: '20px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
                  SUPPORT & INFO
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setSettingsScreen('help')}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '14px', cursor: 'pointer', textAlign: 'left' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Headphones size={20} />
                      </div>
                      <div>
                        <div style={{ fontWeight: '800', fontSize: '0.92rem', color: '#0f172a' }}>Help Center</div>
                        <div style={{ fontSize: '0.76rem', color: '#64748b' }}>Call support, live chat & raise complaints</div>
                      </div>
                    </div>
                    <ChevronRight size={18} color="#94a3b8" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setSettingsScreen('about')}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '14px', cursor: 'pointer', textAlign: 'left' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#f1f5f9', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Info size={20} />
                      </div>
                      <div>
                        <div style={{ fontWeight: '800', fontSize: '0.92rem', color: '#0f172a' }}>About Partner App</div>
                        <div style={{ fontSize: '0.76rem', color: '#64748b' }}>Version v2.4.1 (Build 890) • Up to date</div>
                      </div>
                    </div>
                    <ChevronRight size={18} color="#94a3b8" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setLogoutModalOpen(true)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '14px', cursor: 'pointer', textAlign: 'left' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <LogOut size={20} />
                      </div>
                      <div>
                        <div style={{ fontWeight: '800', fontSize: '0.92rem', color: '#dc2626' }}>Log Out</div>
                        <div style={{ fontSize: '0.76rem', color: '#ef4444' }}>Disconnect account from this device</div>
                      </div>
                    </div>
                    <ChevronRight size={18} color="#f87171" />
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* SCREEN 2: NOTIFICATION SETTINGS */}
          {settingsScreen === 'notifications' && (
            <div style={{ background: '#ffffff', borderRadius: '24px', padding: '24px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ padding: '16px 20px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: '800', fontSize: '1rem', color: '#166534' }}>Allow Notifications</div>
                  <div style={{ fontSize: '0.8rem', color: '#15803d' }}>Get notifications for all service requests & updates</div>
                </div>
                <input
                  type="checkbox"
                  checked={settingsForm.allowNotifications}
                  onChange={(e) => handleToggleSetting('notification', 'allowNotifications', e.target.checked)}
                  style={{ width: '22px', height: '22px', accentColor: '#16a34a', cursor: 'pointer' }}
                />
              </div>

              <div>
                <h4 style={{ fontSize: '0.8rem', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px' }}>
                  NOTIFICATION TYPES
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { key: 'jobAlerts', label: 'New Booking Alerts', desc: 'Get notified for new service requests' },
                    { key: 'surgeAlerts', label: 'Earnings & Payout Updates', desc: 'Instant updates on customer payments & earnings' },
                    { key: 'whatsappNotifs', label: 'Promotions & Incentives', desc: 'Bonus campaigns & daily weekly offers' },
                    { key: 'chatMessagesAlerts', label: 'Chat Messages', desc: 'Real-time customer and support chat' },
                    { key: 'scheduleReminders', label: 'Schedule Reminders', desc: 'Alerts for upcoming booked jobs' },
                  ].map((item) => (
                    <label key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: '#f8fafc', borderRadius: '14px', border: '1px solid #f1f5f9', cursor: 'pointer' }}>
                      <div>
                        <div style={{ fontWeight: '800', fontSize: '0.9rem', color: '#0f172a' }}>{item.label}</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{item.desc}</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settingsForm[item.key]}
                        onChange={(e) => handleToggleSetting('notification', item.key, e.target.checked)}
                        style={{ width: '18px', height: '18px', accentColor: '#16a34a', cursor: 'pointer' }}
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '0.8rem', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px' }}>
                  SOUND & VIBRATION
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: '#f8fafc', borderRadius: '14px', border: '1px solid #f1f5f9', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Volume2 size={18} color="#0284c7" />
                      <div>
                        <div style={{ fontWeight: '800', fontSize: '0.9rem', color: '#0f172a' }}>Sound</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Play custom ringtone on new request</div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settingsForm.soundAlert}
                      onChange={(e) => handleToggleSetting('notification', 'soundAlert', e.target.checked)}
                      style={{ width: '18px', height: '18px', accentColor: '#16a34a', cursor: 'pointer' }}
                    />
                  </label>

                  <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: '#f8fafc', borderRadius: '14px', border: '1px solid #f1f5f9', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Vibrate size={18} color="#d97706" />
                      <div>
                        <div style={{ fontWeight: '800', fontSize: '0.9rem', color: '#0f172a' }}>Vibration</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Vibrate device on high priority alert</div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settingsForm.vibrationAlert}
                      onChange={(e) => handleToggleSetting('notification', 'vibrationAlert', e.target.checked)}
                      style={{ width: '18px', height: '18px', accentColor: '#16a34a', cursor: 'pointer' }}
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 3: TERMS & CONDITIONS */}
          {settingsScreen === 'terms' && (
            <div style={{ background: '#ffffff', borderRadius: '24px', padding: '28px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0f172a', margin: '0 0 4px 0' }}>Terms & Conditions</h3>
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>NOROZZ Service Partner Agreement</p>
              </div>

              <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', maxHeight: '420px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.86rem', color: '#334155', lineHeight: 1.6 }}>
                {liveTermsContent ? (
                  <div dangerouslySetInnerHTML={{ __html: liveTermsContent }} />
                ) : (
                  <>
                    <div>
                      <h4 style={{ fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0' }}>1. Introduction</h4>
                      <p style={{ margin: 0 }}>Welcome to Platform. These Terms and Conditions govern your access to and use of our mobile application and related services. By accessing or using the platform, you agree to be bound by these terms.</p>
                    </div>

                    <div>
                      <h4 style={{ fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0' }}>2. User Agreement</h4>
                      <p style={{ margin: 0 }}>You must be at least 18 years of age and hold the legal capacity to enter into binding agreements to use this platform. You agree to provide accurate, current, and complete registration information and to maintain the security of your credentials at all times.</p>
                    </div>

                    <div>
                      <h4 style={{ fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0' }}>3. Privacy Policy Summary</h4>
                      <p style={{ margin: 0 }}>Your privacy is highly important to us. Our platform collects, uses, and safeguards your location, documents, and profile data in accordance with our official Privacy Policy. We do not sell your personal data to third parties.</p>
                    </div>

                    <div>
                      <h4 style={{ fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0' }}>4. Intellectual Property</h4>
                      <p style={{ margin: 0 }}>All code, software, interfaces, designs, brand marks, database assets, and graphic logos contained within this mobile application are the sole property of the company and protected by international intellectual property laws.</p>
                    </div>
                  </>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => {
                    toast.success('✓ Terms & Conditions Agreed');
                    setSettingsScreen('main');
                  }}
                  style={{ flex: 1, padding: '14px', background: '#16a34a', color: '#ffffff', border: 'none', borderRadius: '14px', fontWeight: '800', cursor: 'pointer', fontSize: '0.92rem' }}
                >
                  I Agree
                </button>
                <button
                  type="button"
                  onClick={() => setSettingsScreen('main')}
                  style={{ padding: '14px 24px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '14px', fontWeight: '700', cursor: 'pointer', fontSize: '0.92rem' }}
                >
                  Decline
                </button>
              </div>
            </div>
          )}

          {/* SCREEN 4: FAQS */}
          {settingsScreen === 'faqs' && (
            <div style={{ background: '#ffffff', borderRadius: '24px', padding: '24px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ position: 'relative' }}>
                <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Search frequently asked questions..."
                  value={faqSearchQuery}
                  onChange={(e) => setFaqSearchQuery(e.target.value)}
                  style={{ width: '100%', padding: '12px 16px 12px 46px', borderRadius: '14px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                {['All', 'General', 'Bookings', 'Payments', 'Technical'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFaqCategory(cat)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '20px',
                      fontSize: '0.82rem',
                      fontWeight: '800',
                      border: faqCategory === cat ? 'none' : '1px solid #cbd5e1',
                      background: faqCategory === cat ? '#16a34a' : '#ffffff',
                      color: faqCategory === cat ? '#ffffff' : '#475569',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {faqs
                  .filter((item) => faqCategory === 'All' || item.cat === faqCategory)
                  .filter((item) => item.q.toLowerCase().includes(faqSearchQuery.toLowerCase()) || item.a.toLowerCase().includes(faqSearchQuery.toLowerCase()))
                  .map((item, idx) => {
                    const isExpanded = expandedFaq === idx;
                    return (
                      <div key={idx} style={{ border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden', transition: 'all 0.2s ease' }}>
                        <button
                          type="button"
                          onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                          style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 18px', background: isExpanded ? '#f0fdf4' : '#f8fafc', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                        >
                          <span style={{ fontWeight: '800', fontSize: '0.92rem', color: isExpanded ? '#15803d' : '#0f172a' }}>{item.q}</span>
                          {isExpanded ? <ChevronUp size={18} color="#15803d" /> : <ChevronDown size={18} color="#94a3b8" />}
                        </button>
                        {isExpanded && (
                          <div style={{ padding: '16px 18px', background: '#ffffff', borderTop: '1px solid #e2e8f0', fontSize: '0.86rem', color: '#475569', lineHeight: 1.6 }}>
                            {item.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* SCREEN 5: PRIVACY & SECURITY */}
          {settingsScreen === 'privacy' && (
            <div style={{ background: '#ffffff', borderRadius: '24px', padding: '24px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h4 style={{ fontSize: '0.8rem', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px' }}>
                  SECURITY OPTIONS
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: '#f8fafc', borderRadius: '14px', border: '1px solid #f1f5f9', cursor: 'pointer' }}>
                    <div>
                      <div style={{ fontWeight: '800', fontSize: '0.9rem', color: '#0f172a' }}>Two-Factor Authentication</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Secure your account with Safety OTP verification</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacyState.twoFactor}
                      onChange={(e) => handleToggleSetting('privacy', 'twoFactor', e.target.checked)}
                      style={{ width: '18px', height: '18px', accentColor: '#16a34a', cursor: 'pointer' }}
                    />
                  </label>

                  <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: '#f8fafc', borderRadius: '14px', border: '1px solid #f1f5f9', cursor: 'pointer' }}>
                    <div>
                      <div style={{ fontWeight: '800', fontSize: '0.9rem', color: '#0f172a' }}>Biometric Login</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Use fingerprint or Face ID for fast login</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacyState.biometric}
                      onChange={(e) => handleToggleSetting('privacy', 'biometric', e.target.checked)}
                      style={{ width: '18px', height: '18px', accentColor: '#16a34a', cursor: 'pointer' }}
                    />
                  </label>

                  <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: '#f8fafc', borderRadius: '14px', border: '1px solid #f1f5f9', cursor: 'pointer' }}>
                    <div>
                      <div style={{ fontWeight: '800', fontSize: '0.9rem', color: '#0f172a' }}>Login Alerts</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Get notified on new device login attempts</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacyState.loginAlerts}
                      onChange={(e) => handleToggleSetting('privacy', 'loginAlerts', e.target.checked)}
                      style={{ width: '18px', height: '18px', accentColor: '#16a34a', cursor: 'pointer' }}
                    />
                  </label>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '0.8rem', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px' }}>
                  PRIVACY & DATA
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: '#f8fafc', borderRadius: '14px', border: '1px solid #f1f5f9' }}>
                    <div>
                      <div style={{ fontWeight: '800', fontSize: '0.9rem', color: '#0f172a' }}>Location Sharing</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Permission for job navigation</div>
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#16a34a', background: '#dcfce7', padding: '4px 10px', borderRadius: '10px' }}>
                      Only while working ›
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => toast.info('📥 Data download link sent to registered email.')}
                    style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: '#f8fafc', borderRadius: '14px', border: '1px solid #f1f5f9', cursor: 'pointer', textAlign: 'left' }}
                  >
                    <div>
                      <div style={{ fontWeight: '800', fontSize: '0.9rem', color: '#0f172a' }}>Data Download</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Request a copy of your account & earning reports</div>
                    </div>
                    <ChevronRight size={18} color="#94a3b8" />
                  </button>

                  {livePrivacyContent && (
                    <div style={{ padding: '18px', background: '#f8fafc', borderRadius: '14px', border: '1px solid #e2e8f0', fontSize: '0.84rem', lineHeight: '1.6', color: '#334155', maxHeight: '300px', overflowY: 'auto', marginTop: '6px' }}>
                      <div style={{ fontSize: '0.76rem', fontWeight: '800', color: '#16a34a', textTransform: 'uppercase', marginBottom: '8px' }}>📜 Official Live Partner Privacy Policy</div>
                      <div dangerouslySetInnerHTML={{ __html: livePrivacyContent }} />
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSettingsScreen('password')}
                style={{ width: '100%', padding: '14px', background: '#ffffff', color: '#16a34a', border: '2px solid #16a34a', borderRadius: '14px', fontWeight: '800', cursor: 'pointer', fontSize: '0.92rem' }}
              >
                Change Password
              </button>
            </div>
          )}

          {/* SCREEN 6: CHANGE PASSWORD */}
          {settingsScreen === 'password' && (
            <form onSubmit={handleUpdatePassword} style={{ background: '#ffffff', borderRadius: '24px', padding: '28px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0f172a', margin: 0 }}>Change Password</h3>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#475569', marginBottom: '6px' }}>Current Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPass.current ? 'text' : 'password'}
                    placeholder="Enter current password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    style={{ width: '100%', padding: '12px 42px 12px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass({ ...showPass, current: !showPass.current })}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                  >
                    {showPass.current ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#475569', marginBottom: '6px' }}>New Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPass.new ? 'text' : 'password'}
                    placeholder="At least 6 characters"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    style={{ width: '100%', padding: '12px 42px 12px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass({ ...showPass, new: !showPass.new })}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                  >
                    {showPass.new ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#475569', marginBottom: '6px' }}>Confirm New Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPass.confirm ? 'text' : 'password'}
                    placeholder="Re-enter new password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    style={{ width: '100%', padding: '12px 42px 12px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass({ ...showPass, confirm: !showPass.confirm })}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                  >
                    {showPass.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                style={{ width: '100%', padding: '14px', background: '#16a34a', color: '#ffffff', border: 'none', borderRadius: '14px', fontWeight: '800', cursor: 'pointer', fontSize: '0.92rem', marginTop: '10px' }}
              >
                Update Password
              </button>
            </form>
          )}

          {/* SCREEN 7: HELP CENTER */}
          {settingsScreen === 'help' && (
            <div style={{ background: '#ffffff', borderRadius: '24px', padding: '24px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <a
                  href="tel:18002009090"
                  style={{ padding: '18px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#0f172a' }}
                >
                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <PhoneCall size={20} />
                  </div>
                  <span style={{ fontWeight: '800', fontSize: '0.85rem' }}>Call Us</span>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>24/7 Hotline</span>
                </a>

                <button
                  type="button"
                  onClick={() => setSettingsScreen('chat')}
                  style={{ padding: '18px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#0f172a' }}
                >
                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MessageSquare size={20} />
                  </div>
                  <span style={{ fontWeight: '800', fontSize: '0.85rem' }}>Live Chat</span>
                  <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: '700' }}>• Agent Online</span>
                </button>

                <a
                  href="mailto:support@norozz.com"
                  style={{ padding: '18px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#0f172a' }}
                >
                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Mail size={20} />
                  </div>
                  <span style={{ fontWeight: '800', fontSize: '0.85rem' }}>Email Us</span>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Support Hub</span>
                </a>
              </div>

              <div>
                <h4 style={{ fontSize: '0.8rem', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px' }}>
                  SUPPORT CATEGORIES
                </h4>
                <button
                  type="button"
                  onClick={() => setSettingsScreen('complaint')}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', cursor: 'pointer', textAlign: 'left' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <AlertTriangle size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: '800', fontSize: '0.92rem', color: '#0f172a' }}>Raise a Complaint</div>
                      <div style={{ fontSize: '0.76rem', color: '#64748b' }}>Report payment delays, customer behavior or app issues</div>
                    </div>
                  </div>
                  <ChevronRight size={18} color="#94a3b8" />
                </button>
              </div>
            </div>
          )}

          {/* SCREEN 8: LIVE CHAT SUPPORT */}
          {settingsScreen === 'chat' && (
            <div style={{ background: '#ffffff', borderRadius: '24px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', height: '520px', overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ position: 'relative' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#2563eb', color: '#ffffff', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      NS
                    </div>
                    <span style={{ position: 'absolute', bottom: 0, right: 0, width: '10px', height: '10px', background: '#16a34a', borderRadius: '50%', border: '2px solid #ffffff' }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#0f172a' }}>Neha Sharma</div>
                    <div style={{ fontSize: '0.74rem', color: '#16a34a', fontWeight: '700' }}>Support Agent • Online</div>
                  </div>
                </div>
                <a href="tel:18002009090" style={{ padding: '8px', borderRadius: '50%', background: '#e0f2fe', color: '#0284c7' }}>
                  <PhoneCall size={18} />
                </a>
              </div>

              <div style={{ flex: 1, padding: '20px', overflowY: 'auto', background: '#f1f5f9', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {chatMessages.map((msg) => (
                  <div key={msg.id} style={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth: '75%',
                      padding: '12px 16px',
                      borderRadius: msg.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      background: msg.sender === 'user' ? '#16a34a' : '#ffffff',
                      color: msg.sender === 'user' ? '#ffffff' : '#0f172a',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                      fontSize: '0.86rem',
                      lineHeight: 1.5
                    }}>
                      {msg.sender === 'agent' && <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#2563eb', marginBottom: '2px' }}>{msg.name}</div>}
                      <div>{msg.text}</div>
                      <div style={{ fontSize: '0.68rem', opacity: 0.7, textAlign: 'right', marginTop: '4px' }}>{msg.time}</div>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendChatMessage} style={{ padding: '14px', background: '#ffffff', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button type="button" onClick={() => toast.info('📎 Attach screenshot feature active')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                  <Paperclip size={20} />
                </button>
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={chatInputText}
                  onChange={(e) => setChatInputText(e.target.value)}
                  style={{ flex: 1, padding: '10px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                />
                <button type="submit" style={{ padding: '10px 16px', background: '#16a34a', color: '#ffffff', border: 'none', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Send size={16} /> Send
                </button>
              </form>
            </div>
          )}

          {/* SCREEN 9: RAISE A COMPLAINT */}
          {settingsScreen === 'complaint' && (
            <form onSubmit={handleSubmitComplaint} style={{ background: '#ffffff', borderRadius: '24px', padding: '28px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0f172a', margin: 0 }}>Raise a Complaint</h3>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#475569', marginBottom: '6px' }}>Complaint Type</label>
                <select
                  value={complaintForm.complaintType}
                  onChange={(e) => setComplaintForm({ ...complaintForm, complaintType: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.9rem', background: '#ffffff' }}
                >
                  <option value="Payment Delay / Issue">Payment Delay / Issue</option>
                  <option value="Job Cancellation Issue">Job Cancellation Issue</option>
                  <option value="Customer Misbehavior">Customer Misbehavior</option>
                  <option value="App Bug / Technical Issue">App Bug / Technical Issue</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#475569', marginBottom: '6px' }}>Related Booking</label>
                <select
                  value={complaintForm.bookingId}
                  onChange={(e) => setComplaintForm({ ...complaintForm, bookingId: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.9rem', background: '#ffffff' }}
                >
                  {partnerBookingsList.length > 0 ? (
                    partnerBookingsList.map((b) => {
                      const bNum = b.bookingId || b.bookingNumber || `NRZ-${b._id?.toString().slice(-4).toUpperCase()}`;
                      const sName = b.serviceName || b.service?.name || b.packageName || 'Service';
                      const val = `Booking #${bNum} - ${sName}`;
                      return (
                        <option key={b._id || bNum} value={val}>
                          {val} ({b.status || 'Active'})
                        </option>
                      );
                    })
                  ) : null}
                  <option value="General Partner Account Issue">General Partner Account Issue (No Specific Booking)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#475569', marginBottom: '6px' }}>Explain your issue</label>
                <textarea
                  rows={4}
                  placeholder="Describe what happened in detail..."
                  value={complaintForm.description}
                  onChange={(e) => setComplaintForm({ ...complaintForm, description: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '800', color: '#475569', marginBottom: '8px' }}>Priority Level</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {['Low', 'Medium', 'High'].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setComplaintForm({ ...complaintForm, priority: p })}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '12px',
                        fontWeight: '800',
                        fontSize: '0.84rem',
                        border: complaintForm.priority === p ? 'none' : '1px solid #cbd5e1',
                        background: complaintForm.priority === p ? (p === 'High' ? '#dc2626' : p === 'Medium' ? '#16a34a' : '#64748b') : '#ffffff',
                        color: complaintForm.priority === p ? '#ffffff' : '#475569',
                        cursor: 'pointer'
                      }}
                    >
                      {p === 'High' ? '🔴 High' : p === 'Medium' ? '🟡 Medium' : '🟢 Low'}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingComplaint}
                style={{ width: '100%', padding: '14px', background: '#16a34a', color: '#ffffff', border: 'none', borderRadius: '14px', fontWeight: '800', cursor: 'pointer', fontSize: '0.92rem', marginTop: '6px' }}
              >
                {submittingComplaint ? 'Submitting...' : 'Submit Complaint'}
              </button>
            </form>
          )}

          {/* SCREEN 10: ABOUT PARTNER APP */}
          {settingsScreen === 'about' && (
            <div style={{ background: '#ffffff', borderRadius: '24px', padding: '32px 24px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '20px', background: 'linear-gradient(135deg, #16a34a, #15803d)', color: '#ffffff', fontSize: '2rem', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 25px rgba(22, 163, 74, 0.3)' }}>
                N
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0f172a', margin: '0 0 4px 0' }}>NOROZZ Partner App</h3>
                <span style={{ fontSize: '0.82rem', color: '#16a34a', fontWeight: '800', background: '#dcfce7', padding: '4px 12px', borderRadius: '12px' }}>
                  v2.4.1 (Build 890) • Up to date
                </span>
              </div>

              <p style={{ fontSize: '0.85rem', color: '#64748b', maxWidth: '440px', lineHeight: 1.6, margin: 0 }}>
                NOROZZ Technician Partner platform for high-quality home services, instant wallet settlements, job allocation, and city administration management.
              </p>

              <div style={{ width: '100%', paddingTop: '16px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#94a3b8' }}>
                <span>© 2026 NOROZZ Services Pvt. Ltd.</span>
                <span>All Rights Reserved</span>
              </div>
            </div>
          )}

        </div>
      )}

      {/* LOGOUT CONFIRMATION MODAL */}
      {logoutModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '20px'
        }}>
          <div style={{ background: '#ffffff', borderRadius: '24px', padding: '28px', maxWidth: '400px', width: '100%', boxShadow: '0 25px 60px rgba(0,0,0,0.3)', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
              <LogOut size={26} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0f172a', margin: '0 0 6px 0' }}>Log Out?</h3>
            <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '0 0 24px 0', lineHeight: 1.5 }}>
              Are you sure you want to log out? You will stop receiving new booking requests until you log back in.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setLogoutModalOpen(false)}
                style={{ flex: 1, padding: '12px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '12px', fontWeight: '800', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setLogoutModalOpen(false);
                  localStorage.removeItem('partnerToken');
                  localStorage.removeItem('partnerUser');
                  toast.success('Logged out successfully');
                  window.location.href = '/partner/login';
                }}
                style={{ flex: 1, padding: '12px', background: '#dc2626', color: '#ffffff', border: 'none', borderRadius: '12px', fontWeight: '800', cursor: 'pointer' }}
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}



      {/* DOCUMENT PREVIEW MODAL POPUP */}
      {previewModalData && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '24px',
            maxWidth: '680px',
            width: '100%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.35)',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#f8fafc'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ padding: '10px', borderRadius: '12px', background: '#e0f2fe', color: '#0284c7' }}>
                  <FileText size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                    {previewModalData.title}
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600' }}>
                    Identity Verification Document • {user.name || 'Service Partner'} ({user.userId || 'NRZ-P-600653'})
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewModalData(null)}
                style={{
                  background: '#e2e8f0',
                  border: 'none',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#475569'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body Preview Content */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1, background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '340px' }}>
              {previewModalData.docStatus !== 'rejected' ? (
                /* Direct Document Image Display for Verified / Approved Document */
                previewModalData.url && (previewModalData.url.startsWith('data:application/pdf') || previewModalData.url.endsWith('.pdf')) ? (
                  <iframe
                    src={previewModalData.url}
                    title={previewModalData.title}
                    style={{ width: '100%', height: '55vh', border: 'none', borderRadius: '12px' }}
                  />
                ) : (
                  <img
                    src={previewModalData.url || DEFAULT_KYC_IMAGE}
                    alt={previewModalData.title}
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = DEFAULT_KYC_IMAGE;
                    }}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '58vh',
                      objectFit: 'contain',
                      borderRadius: '12px',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                      border: '2px solid rgba(255,255,255,0.1)'
                    }}
                  />
                )
              ) : (
                /* Re-upload Prompt Box ONLY if verification failed or document rejected */
                <div style={{
                  padding: '36px 28px',
                  textAlign: 'center',
                  color: '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '16px',
                  maxWidth: '460px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  borderRadius: '20px',
                  border: '1px dashed rgba(239, 68, 68, 0.4)'
                }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171' }}>
                    <AlertTriangle size={32} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.15rem', fontWeight: '800', margin: '0 0 6px 0', color: '#ffffff' }}>
                      Verification Failed / Rejected by Admin
                    </h4>
                    <p style={{ fontSize: '0.84rem', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
                      {previewModalData.rejectionReason || 'Please upload a clear photo or document file (JPG, PNG, WEBP, PDF) to re-verify your KYC identity.'}
                    </p>
                  </div>
                  <label style={{
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: '#ffffff',
                    borderRadius: '12px',
                    fontWeight: '800',
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)'
                  }}>
                    <Upload size={18} /> Re-upload New Document
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        if (e.target.files[0]) {
                          handleFileUpload(previewModalData.docKey || 'aadhaarFront', e.target.files[0]);
                        }
                      }}
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#ffffff'
            }}>
              <div style={{ fontSize: '0.8rem', color: previewModalData.docStatus === 'rejected' ? '#dc2626' : '#16a34a', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {previewModalData.docStatus === 'rejected' ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
                {previewModalData.docStatus === 'rejected' ? 'Verification Failed - Action Required' : 'Verified Document Preview'}
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                {previewModalData.url && (
                  <a
                    href={previewModalData.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '8px 16px',
                      background: '#f1f5f9',
                      color: '#0f172a',
                      borderRadius: '10px',
                      fontSize: '0.84rem',
                      fontWeight: '700',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <ExternalLink size={14} /> Open Original
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setPreviewModalData(null)}
                  style={{
                    padding: '8px 20px',
                    background: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '0.84rem',
                    fontWeight: '800',
                    cursor: 'pointer'
                  }}
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* BANK WITHDRAWAL MODAL POPUP */}
      {/* ------------------------------------------------------------- */}
      {withdrawModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '24px', padding: '28px', maxWidth: '440px', width: '100%', border: '1px solid #e2e8f0', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0f172a', margin: 0 }}>Instant Bank Payout</h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0 0' }}>Transfer earnings directly to your bank account</p>
              </div>
              <button
                type="button"
                onClick={() => setWithdrawModalOpen(false)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={18} color="#64748b" />
              </button>
            </div>

            <form onSubmit={handleConfirmWithdrawal} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: '#f0fdf4', padding: '16px', borderRadius: '16px', border: '1px solid #bbf7d0' }}>
                <div style={{ fontSize: '0.76rem', color: '#166534', fontWeight: '700', textTransform: 'uppercase' }}>Available Wallet Balance</div>
                <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#16a34a', marginTop: '2px' }}>
                  ₹{(walletData?.walletBalance ?? user.walletBalance ?? 0).toLocaleString('en-IN')}.00
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: '800', color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Enter Amount to Withdraw (₹)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 5000"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  min="1"
                  max={walletData?.walletBalance ?? user.walletBalance ?? 0}
                  required
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '1rem', fontWeight: '800', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: '800', color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Select Bank Account
                </label>
                <div style={{ padding: '12px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '0.86rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>{walletData?.bankDetails?.bankName || 'HDFC Bank'} •••• {walletData?.bankDetails?.accountNumber ? walletData.bankDetails.accountNumber.slice(-4) : '4920'}</span>
                  <span style={{ fontSize: '0.72rem', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '10px' }}>Primary Verified</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setWithdrawModalOpen(false)}
                  style={{ flex: 1, padding: '12px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '12px', fontWeight: '800', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isWithdrawing}
                  style={{ flex: 1.5, padding: '12px', background: '#16a34a', color: '#ffffff', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  {isWithdrawing ? 'Processing...' : 'Confirm & Transfer Cash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* WALLET ADD DEPOSIT / TOP-UP MODAL POPUP */}
      {/* ------------------------------------------------------------- */}
      {depositModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '24px', padding: '28px', maxWidth: '440px', width: '100%', border: '1px solid #e2e8f0', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0f172a', margin: 0 }}>Add Deposit to Wallet</h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0 0' }}>Top-up wallet balance for platform dispatches & commission</p>
              </div>
              <button
                type="button"
                onClick={() => setDepositModalOpen(false)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={18} color="#64748b" />
              </button>
            </div>

            <form onSubmit={handleConfirmDeposit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: '#f0fdf4', padding: '16px', borderRadius: '16px', border: '1px solid #bbf7d0' }}>
                <div style={{ fontSize: '0.76rem', color: '#166534', fontWeight: '700', textTransform: 'uppercase' }}>Current Wallet Balance</div>
                <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#16a34a', marginTop: '2px' }}>
                  ₹{(walletData?.walletBalance ?? user.walletBalance ?? 0).toLocaleString('en-IN')}.00
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: '800', color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Enter Deposit Amount (₹)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 1000"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  min="1"
                  required
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '1rem', fontWeight: '800', outline: 'none' }}
                />
              </div>

              {/* Quick Preset Amount Selector Chips */}
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '8px' }}>
                  Quick Amount Select:
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {[500, 1000, 2000, 5000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setDepositAmount(String(amt))}
                      style={{
                        padding: '8px 14px',
                        background: Number(depositAmount) === amt ? '#16a34a' : '#f1f5f9',
                        color: Number(depositAmount) === amt ? '#ffffff' : '#334155',
                        border: 'none',
                        borderRadius: '10px',
                        fontSize: '0.82rem',
                        fontWeight: '800',
                        cursor: 'pointer'
                      }}
                    >
                      + ₹{amt.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: '800', color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Payment Method
                </label>
                <div style={{ padding: '12px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '0.86rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>⚡ Instant UPI / NetBanking / Razorpay</span>
                  <span style={{ fontSize: '0.72rem', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '10px' }}>0% Gateway Fee</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setDepositModalOpen(false)}
                  style={{ flex: 1, padding: '12px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '12px', fontWeight: '800', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDepositing}
                  style={{ flex: 1.5, padding: '12px', background: '#16a34a', color: '#ffffff', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  {isDepositing ? 'Processing Deposit...' : 'Confirm & Add Deposit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default PartnerProfileView;
