import React, { useState, useEffect, useRef } from 'react';
import {
  Phone,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Camera,
  User,
  Mail,
  Calendar,
  Sparkles,
  CheckCircle2,
  Navigation,
  Loader2,
  AlertCircle,
  Briefcase,
  Lock,
  Building,
  FileText,
  Upload,
  CreditCard,
  Grid,
  Clock,
  Check,
  Search,
  Plus,
  Sliders,
  Award,
  ChevronRight,
  Eye,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { catalogService } from '../services/catalog.service.js';
import { cityService } from '../services/city.service.js';

const DEFAULT_SCHEDULE = [
  { day: 'Monday', isOpen: true, openTime: '09:00 AM', closeTime: '07:00 PM' },
  { day: 'Tuesday', isOpen: true, openTime: '09:00 AM', closeTime: '07:00 PM' },
  { day: 'Wednesday', isOpen: true, openTime: '09:00 AM', closeTime: '07:00 PM' },
  { day: 'Thursday', isOpen: true, openTime: '09:00 AM', closeTime: '07:00 PM' },
  { day: 'Friday', isOpen: true, openTime: '09:00 AM', closeTime: '07:00 PM' },
  { day: 'Saturday', isOpen: true, openTime: '10:00 AM', closeTime: '05:00 PM' },
  { day: 'Sunday', isOpen: false, openTime: '09:00 AM', closeTime: '07:00 PM' },
];

const SKILLS_BY_CATEGORY = {
  'AC & Appliance Repair': ['Split AC Install', 'Gas Refilling', 'Deep Jet Wash', 'Inverter AC Repair', 'Compressor Repair', 'PCB Board Repair'],
  'Cleaning & Pest Control': ['Bathroom Deep Scrub', 'Kitchen Degreasing', 'Sofa Shampooing', 'Cockroach Gel Treatment', 'Balcony Wash', 'Full Home Polish'],
  'Plumbing, Electrical & Carpentry': ['Tap & Mixer Fix', 'RO Purifier Filter Service', 'Switch & Fuse Repair', 'Fan & Chandelier Mount', 'Door Lock Fitting', 'Water Heater Repair'],
  'Salon & Beauty for Women': ['O3+ Glow Facial', 'Rica Waxing', 'Spa Pedicure', 'Hair Spa', 'De-Tan Cleanup', 'Bridal Makeup'],
  "Men's Salon & Grooming": ['Fade Haircut', 'Beard Shaping', 'Hot Towel Shave', 'Head Massage', 'Hair Color', 'Facial Scrub'],
  'Home Painting & Decor': ['Accent Wall Paint', 'Wall Waterproofing', 'Damp Treatment', 'Stencil Design', 'POP Repair', 'Emulsion Coating'],
};

const LOCALITIES_BY_CITY = {
  'Delhi NCR': ['Connaught Place', 'South Extension', 'Dwarka Sector 10', 'Noida Sector 62', 'Gurugram Cyber City', 'Indirapuram Ghaziabad'],
  'Bengaluru': ['HSR Layout Sector 1-7', 'Koramangala 4th Block', 'Bellandur Outer Ring', 'BTM Layout Stage 2', 'Indiranagar 100ft Road', 'Whitefield ITPB'],
  'Mumbai': ['Bandra West', 'Andheri East', 'Powai Hiranandani', 'Juhu Beach Area', 'Lower Parel', 'Thane West'],
  'Hyderabad': ['Gachibowli', 'HITECH City', 'Banjara Hills', 'Jubilee Hills', 'Kukatpally'],
  'Pune': ['Viman Nagar', 'Koregaon Park', 'Baner', 'Kharadi', 'Wakad'],
  'Jaipur': ['Malviya Nagar', 'C Scheme', 'Vaishali Nagar', 'Mansarovar', 'Raja Park'],
};

const PartnerAuthPage = ({ initialStep = 'phone' }) => {
  const {
    requestPartnerOtp,
    verifyPartnerOtp,
    updatePartnerProfile,
    submitPartnerKyc,
    partnerLogin,
    login,
    isLoggingIn,
  } = useAuth();

  // Active Flow Step:
  // 'phone' | 'otp' | 'create-profile' | 'location-perm' | 'location-popup'
  // 'kyc-docs-list' | 'kyc-doc-upload' | 'kyc-categories' | 'kyc-skills' | 'kyc-service-area' | 'kyc-working-hours' | 'approval-pending' | 'email-login'
  const [step, setStep] = useState(initialStep);

  // Step 1: Phone input
  const [phone, setPhone] = useState('');
  const [demoOtpCode, setDemoOtpCode] = useState('');

  // Step 2: OTP verification input (6 digits)
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  // User & Auth token memory state
  const [pendingUser, setPendingUser] = useState(null);
  const [pendingToken, setPendingToken] = useState('');

  // Step 3: Profile Details
  const [profileImage, setProfileImage] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('1995-08-15');
  const [gender, setGender] = useState('Male');
  const [workCity, setWorkCity] = useState('');
  const [activeCitiesList, setActiveCitiesList] = useState([]);
  const [category, setCategory] = useState('');
  const [categoriesList, setCategoriesList] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  useEffect(() => {
    cityService.getActiveCities()
      .then((res) => {
        const list = res.data?.data || res.data || [];
        if (Array.isArray(list) && list.length > 0) {
          setActiveCitiesList(list);
          if (!workCity) setWorkCity(list[0]._id);
        }
      })
      .catch((err) => console.warn('Active cities fetch warning:', err));
  }, []);

  // Step 4 & 5: Location State
  const [detectedAddress, setDetectedAddress] = useState('');
  const [detectingLocation, setDetectingLocation] = useState(false);

  // KYC & Work Setup Form State
  const [documents, setDocuments] = useState({
    aadhaarFront: '',
    aadhaarBack: '',
    panDoc: '',
    bankPassbookDoc: '',
    drivingLicenseDoc: '',
  });

  const [activeDocType, setActiveDocType] = useState('aadhaarFront'); // Target document being uploaded
  const [experience, setExperience] = useState('3-5 Years');
  const [skills, setSkills] = useState(['Split AC Install', 'Gas Refilling']);
  const [certificateTitle, setCertificateTitle] = useState('');
  const [certifications, setCertifications] = useState([]);
  const [workRadius, setWorkRadius] = useState(8);
  const [selectedLocalities, setSelectedLocalities] = useState([]);
  const [workingHours, setWorkingHours] = useState(DEFAULT_SCHEDULE);
  const [searchCatQuery, setSearchCatQuery] = useState('');

  // Fallback Email/Password Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Alerts
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch Categories for Profile & KYC Selection
  useEffect(() => {
    const fetchCats = async () => {
      try {
        setLoadingCategories(true);
        const res = await catalogService.getCategories();
        const list = res.data?.data || res.data || [];
        if (Array.isArray(list) && list.length > 0) {
          setCategoriesList(list);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCats();
  }, []);

  // Set default localities when work city changes
  useEffect(() => {
    const locs = LOCALITIES_BY_CITY[workCity] || LOCALITIES_BY_CITY['Delhi NCR'];
    setSelectedLocalities(locs.slice(0, 3));
  }, [workCity]);

  // Update skills list when category changes
  useEffect(() => {
    const categorySkills = SKILLS_BY_CATEGORY[category] || SKILLS_BY_CATEGORY['AC & Appliance Repair'];
    setSkills(categorySkills.slice(0, 2));
  }, [category]);

  // OTP Countdown Timer
  useEffect(() => {
    let interval = null;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // Handle OTP digit box input
  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').split('').slice(0, 6);
      const newOtp = [...otp];
      digits.forEach((d, idx) => {
        newOtp[idx] = d;
      });
      setOtp(newOtp);
      if (digits.length > 0) {
        const nextFocus = Math.min(digits.length, 5);
        otpRefs[nextFocus].current?.focus();
      }
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  // Check where partner should be directed after OTP / Profile creation based on server nextStep
  const handleEvaluatePartnerNextStep = (userObj, token, resData = {}) => {
    const nextStep = resData?.nextStep || resData?.data?.nextStep;
    const isKycSubmitted = userObj?.isKycSubmitted === true;

    if (nextStep === 'CREATE_PROFILE' || resData?.onboardingStatus?.isProfileCompleted === false) {
      setStep('create-profile');
    } else if (nextStep === 'DONE' || nextStep === 'COMPLETED') {
      login(userObj, token);
    } else if (nextStep === 'PENDING_APPROVAL' || (isKycSubmitted && userObj.kycStatus === 'pending')) {
      setStep('approval-pending');
    } else {
      // Need onboarding steps (e.g. UPLOAD_LOCATION, UPLOAD_DOCUMENTS, SELECT_CATEGORY, etc.) -> log in to render PartnerOnboardingPage
      login(userObj, token);
    }
  };

  // STEP 1: Request OTP
  const handleSendOtp = async (e) => {
    e?.preventDefault();
    setError('');
    setSuccessMsg('');

    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    try {
      const formattedPhone = cleanPhone.length === 10 ? `+91${cleanPhone}` : `+${cleanPhone}`;
      const res = await requestPartnerOtp({ phone: formattedPhone });
      const generatedOtp = res.data?.otp || res.otp;
      if (generatedOtp) {
        setDemoOtpCode(generatedOtp);
        setSuccessMsg(`OTP sent to ${formattedPhone}! (Demo OTP: ${generatedOtp})`);
      } else {
        setSuccessMsg(`OTP sent to ${formattedPhone}!`);
      }
      setTimer(30);
      setCanResend(false);
      setStep('otp');
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    }
  };

  // STEP 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    setError('');
    setSuccessMsg('');

    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      setError('Please enter complete 6-digit OTP.');
      return;
    }

    const cleanPhone = phone.trim().replace(/\D/g, '');
    const formattedPhone = cleanPhone.length === 10 ? `+91${cleanPhone}` : `+${cleanPhone}`;

    try {
      const res = await verifyPartnerOtp({ phone: formattedPhone, otp: otpCode });
      const responseData = res.data || res;
      const userObj = responseData?.user || res.user || res.data;
      const accessToken = responseData?.accessToken || res.accessToken;
      const nextStep = responseData?.nextStep || res.nextStep;
      const isProfileCompleted = responseData?.onboardingStatus?.isProfileCompleted ?? responseData?.isProfileCompleted ?? res.isProfileCompleted;

      setPendingUser(userObj);
      setPendingToken(accessToken);

      // Pre-fill profile fields if user has partial data
      if (userObj.name && !userObj.name.startsWith('Partner ')) setName(userObj.name);
      if (userObj.email && !userObj.email.startsWith('partner_')) setEmail(userObj.email);
      if (userObj.dob) setDob(userObj.dob);
      if (userObj.gender) setGender(userObj.gender);
      if (userObj.assignedCity) setWorkCity(userObj.assignedCity);
      if (userObj.profileImage) setProfileImage(userObj.profileImage);
      if (userObj.category) setCategory(userObj.category);
      if (userObj.documents) setDocuments((prev) => ({ ...prev, ...userObj.documents }));

      if (nextStep === 'CREATE_PROFILE' || !isProfileCompleted) {
        // New partner or incomplete profile -> Go to Profile Creation!
        setStep('create-profile');
      } else {
        // Profile is complete -> Evaluate next step or KYC status!
        handleEvaluatePartnerNextStep(userObj, accessToken, responseData);
      }
    } catch (err) {
      setError(err.message || 'Invalid or expired OTP code.');
    }
  };

  // STEP 3: Profile Photo Upload
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // STEP 3: Submit Profile
  const handleProfileSubmit = async (e) => {
    e?.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      const updatePayload = {
        name: name.trim(),
        email: email.trim(),
        dob,
        gender,
        assignedCity: workCity,
        profileImage,
      };

      const res = await updatePartnerProfile(updatePayload);
      const updatedUser = res.data?.user || res.user || { ...pendingUser, ...updatePayload };
      setPendingUser(updatedUser);

      // Log in to trigger PartnerOnboardingPage (Step 1: Allow Location Access)
      login(updatedUser, pendingToken);
    } catch (err) {
      setError(err.message || 'Failed to update profile. Please try again.');
    }
  };

  // STEP 4 & 5: Trigger Geolocation & Request Permission
  const handleRequestLocation = () => {
    setStep('location-popup');
  };

  const handleConfirmLocationAccess = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setStep('kyc-docs-list');
      return;
    }

    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          const addr = data.display_name || `${data.address?.suburb || 'Connaught Place'}, ${workCity}`;
          setDetectedAddress(addr);
        } catch (err) {
          setDetectedAddress(`GPS Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)} (${workCity})`);
        } finally {
          setDetectingLocation(false);
          // Check KYC status or move to Document Upload List
          handleEvaluatePartnerNextStep(pendingUser, pendingToken);
        }
      },
      (err) => {
        setDetectingLocation(false);
        handleEvaluatePartnerNextStep(pendingUser, pendingToken);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Document File Upload Handler
  const handleDocumentFileSelect = (docKey, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setDocuments((prev) => ({
        ...prev,
        [docKey]: reader.result,
        ...(docKey === 'aadhaarFront' || docKey === 'aadhaarBack' ? { aadhaarDoc: reader.result } : {}),
      }));
      setSuccessMsg(`Document uploaded successfully! 📄`);
    };
    reader.readAsDataURL(file);
  };

  // Skill Tag Toggle
  const handleToggleSkill = (skillTag) => {
    if (skills.includes(skillTag)) {
      setSkills(skills.filter((s) => s !== skillTag));
    } else {
      setSkills([...skills, skillTag]);
    }
  };

  // Locality Toggle
  const handleToggleLocality = (loc) => {
    if (selectedLocalities.includes(loc)) {
      setSelectedLocalities(selectedLocalities.filter((l) => l !== loc));
    } else {
      setSelectedLocalities([...selectedLocalities, loc]);
    }
  };

  // Working Hours Toggle
  const handleToggleDayOpen = (idx) => {
    const updated = [...workingHours];
    updated[idx].isOpen = !updated[idx].isOpen;
    setWorkingHours(updated);
  };

  const handleApplyHoursToAll = () => {
    const firstDay = workingHours[0];
    const updated = workingHours.map((d) => ({
      ...d,
      isOpen: firstDay.isOpen,
      openTime: firstDay.openTime,
      closeTime: firstDay.closeTime,
    }));
    setWorkingHours(updated);
    setSuccessMsg('Schedule applied to all days!');
  };

  // FINAL STEP 7: Submit Full KYC & Work Setup to Backend
  const handleFinalKycSubmit = async () => {
    setError('');
    setSuccessMsg('');

    try {
      const kycPayload = {
        documents,
        experience,
        skills,
        certifications,
        workRadius,
        localities: selectedLocalities,
        workingHours,
        category,
      };

      const res = await submitPartnerKyc(kycPayload);
      const updatedUser = res.data?.user || res.user || { ...pendingUser, isKycSubmitted: true, kycStatus: 'pending' };
      setPendingUser(updatedUser);

      // Move to Approval Pending Screen
      setStep('approval-pending');
    } catch (err) {
      setError(err.message || 'Failed to submit KYC. Please try again.');
    }
  };

  // Demo Quick Fill
  const handleQuickFillDemo = () => {
    setPhone('9876500000');
    setSuccessMsg('Demo partner number filled! Click Send OTP.');
  };

  // Fallback Email Login Handler
  const handleEmailLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await partnerLogin({ email: loginEmail, password: loginPassword });
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px 16px',
      background: 'linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 50%, #f1f5f9 100%)',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        background: '#ffffff',
        borderRadius: '28px',
        boxShadow: '0 20px 50px rgba(15, 23, 42, 0.12), 0 4px 12px rgba(15, 23, 42, 0.04)',
        border: '1px solid rgba(226, 232, 240, 0.8)',
        overflow: 'hidden',
        position: 'relative',
      }}>

        {/* Top Header Bar */}
        <div style={{
          padding: '18px 24px 10px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {step !== 'phone' && step !== 'approval-pending' && (
            <button
              type="button"
              onClick={() => {
                setError('');
                if (step === 'otp') setStep('phone');
                else if (step === 'create-profile') setStep('otp');
                else if (step === 'location-perm') setStep('create-profile');
                else if (step === 'location-popup') setStep('location-perm');
                else if (step === 'kyc-docs-list') setStep('location-perm');
                else if (step === 'kyc-doc-upload') setStep('kyc-docs-list');
                else if (step === 'kyc-categories') setStep('kyc-docs-list');
                else if (step === 'kyc-skills') setStep('kyc-categories');
                else if (step === 'kyc-service-area') setStep('kyc-skills');
                else if (step === 'kyc-working-hours') setStep('kyc-service-area');
                else if (step === 'email-login') setStep('phone');
              }}
              style={{
                background: '#f1f5f9',
                border: 'none',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#1e293b',
              }}
            >
              <ArrowLeft size={18} />
            </button>
          )}

          <div style={{ marginLeft: step === 'phone' || step === 'approval-pending' ? 'auto' : 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#16a34a', background: '#dcfce7', padding: '3px 10px', borderRadius: '12px' }}>
              NOROZZ PARTNER
            </span>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div style={{ margin: '0 24px 12px 24px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '10px 14px', borderRadius: '12px', fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div style={{ margin: '0 24px 12px 24px', background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '10px 14px', borderRadius: '12px', fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 1: PHONE LOGIN / SIGNUP (login-signup) */}
        {/* ============================================================ */}
        {step === 'phone' && (
          <div style={{ padding: '0 24px 28px 24px' }}>
            <div style={{ textAlign: 'center', margin: '16px 0 28px 0' }}>
              <div style={{
                width: '68px',
                height: '68px',
                margin: '0 auto 14px auto',
                borderRadius: '22px',
                background: 'linear-gradient(135deg, #16a34a 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 10px 25px rgba(22, 163, 74, 0.35)',
              }}>
                <img src="/logo.png" alt="NOROZZ" style={{ width: '42px', height: '42px', objectFit: 'contain' }} />
              </div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.3px', margin: 0 }}>
                Welcome Partner
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.86rem', marginTop: '6px', margin: 0 }}>
                Login or Sign up to access your business account
              </p>
            </div>

            <form onSubmit={handleSendOtp}>
              <div style={{ marginBottom: '22px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>
                  Enter Phone Number
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '2px solid #e2e8f0',
                  borderRadius: '14px',
                  padding: '4px 12px',
                  background: '#f8fafc',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingRight: '10px', borderRight: '1px solid #cbd5e1', fontWeight: '700', fontSize: '0.92rem', color: '#1e293b' }}>
                    <span>🇮🇳</span>
                    <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    placeholder="98765 00000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    style={{
                      flex: 1,
                      border: 'none',
                      outline: 'none',
                      padding: '12px 10px',
                      fontSize: '1rem',
                      fontWeight: '600',
                      background: 'transparent',
                      color: '#0f172a',
                    }}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '14px',
                  background: '#16a34a',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.98rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 8px 20px rgba(22, 163, 74, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                {isLoggingIn ? <Loader2 size={18} className="spin" /> : <>Send OTP <ArrowRight size={18} /></>}
              </button>
            </form>

            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <button
                type="button"
                onClick={handleQuickFillDemo}
                style={{
                  background: '#f1f5f9',
                  border: '1px border #cbd5e1',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  color: '#475569',
                  cursor: 'pointer',
                }}
              >
                ⚡ Auto-Fill Demo Partner Number
              </button>
            </div>

            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => setStep('email-login')}
                style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer' }}
              >
                Login with Email & Password instead
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 2: OTP VERIFICATION (otp-verification) */}
        {/* ============================================================ */}
        {step === 'otp' && (
          <div style={{ padding: '0 24px 28px 24px' }}>
            <div style={{ margin: '12px 0 24px 0' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                Confirm your details
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '6px', margin: 0 }}>
                Enter the 6-digit code sent to <strong style={{ color: '#0f172a' }}>+91 {phone}</strong>
              </p>
            </div>

            <form onSubmit={handleVerifyOtp}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px', marginBottom: '20px' }}>
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={otpRefs[idx]}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    style={{
                      width: '100%',
                      height: '52px',
                      borderRadius: '12px',
                      border: digit ? '2px solid #16a34a' : '2px solid #e2e8f0',
                      textAlign: 'center',
                      fontSize: '1.25rem',
                      fontWeight: '800',
                      background: digit ? '#f0fdf4' : '#f8fafc',
                      color: '#0f172a',
                      outline: 'none',
                    }}
                  />
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', fontSize: '0.84rem' }}>
                <div style={{ color: '#64748b', fontWeight: '600' }}>
                  ⏱️ 00:{timer < 10 ? `0${timer}` : timer}
                </div>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={!canResend}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: canResend ? '#16a34a' : '#94a3b8',
                    fontWeight: '700',
                    cursor: canResend ? 'pointer' : 'default',
                  }}
                >
                  Resend OTP
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '14px',
                  background: '#16a34a',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.98rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 8px 20px rgba(22, 163, 74, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                {isLoggingIn ? <Loader2 size={18} className="spin" /> : <>Verify & Proceed <ShieldCheck size={18} /></>}
              </button>
            </form>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 3: CREATE PROFILE (create-profile) */}
        {/* ============================================================ */}
        {step === 'create-profile' && (
          <div style={{ padding: '0 24px 28px 24px' }}>
            <div style={{ textAlign: 'center', margin: '10px 0 20px 0' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                Create Your Profile
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.82rem', marginTop: '4px', margin: 0 }}>
                Set up your partner details to receive service leads
              </p>
            </div>

            <form onSubmit={handleProfileSubmit}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ position: 'relative', width: '90px', height: '90px', margin: '0 auto' }}>
                  <img
                    src={profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                    alt="Profile Avatar"
                    style={{
                      width: '90px',
                      height: '90px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '3px solid #16a34a',
                      background: '#f1f5f9',
                    }}
                  />
                  <label htmlFor="avatar-upload" style={{
                    position: 'absolute',
                    bottom: '0',
                    right: '0',
                    width: '30px',
                    height: '30px',
                    background: '#16a34a',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  }}>
                    <Camera size={16} />
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    style={{ display: 'none' }}
                  />
                </div>
                <div style={{ fontSize: '0.76rem', color: '#16a34a', fontWeight: '700', marginTop: '6px' }}>
                  Upload Profile Photo
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                  Full Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Aarav Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: '100%', padding: '11px 14px', borderRadius: '12px', border: '1.5px solid #cbd5e1', fontSize: '0.92rem', outline: 'none' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                  Email Address <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="email"
                  placeholder="aarav.sharma@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '11px 14px', borderRadius: '12px', border: '1.5px solid #cbd5e1', fontSize: '0.92rem', outline: 'none' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                  Date of Birth <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  style={{ width: '100%', padding: '11px 14px', borderRadius: '12px', border: '1.5px solid #cbd5e1', fontSize: '0.92rem', outline: 'none' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  Gender <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {['Male', 'Female', 'Other'].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      style={{
                        padding: '9px',
                        borderRadius: '10px',
                        border: gender === g ? '2px solid #16a34a' : '1px solid #cbd5e1',
                        background: gender === g ? '#dcfce7' : '#ffffff',
                        color: gender === g ? '#15803d' : '#475569',
                        fontWeight: '700',
                        fontSize: '0.84rem',
                        cursor: 'pointer',
                      }}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                  Preferred Work City <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  value={workCity}
                  onChange={(e) => setWorkCity(e.target.value)}
                  style={{ width: '100%', padding: '11px 14px', borderRadius: '12px', border: '1.5px solid #cbd5e1', fontSize: '0.92rem', background: '#ffffff', outline: 'none' }}
                  required
                >
                  {activeCitiesList.length > 0 ? (
                    activeCitiesList.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name} {c.state ? `(${c.state})` : ''}
                      </option>
                    ))
                  ) : (
                    <option value="Delhi NCR">Delhi NCR</option>
                  )}
                </select>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '14px',
                  background: '#16a34a',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.98rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 8px 20px rgba(22, 163, 74, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                {isLoggingIn ? <Loader2 size={18} className="spin" /> : <>Continue <ArrowRight size={18} /></>}
              </button>
            </form>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 4 & 5: LOCATION PERMISSION & POPUP */}
        {/* ============================================================ */}
        {step === 'location-perm' && (
          <div style={{ padding: '20px 24px 28px 24px', textAlign: 'center' }}>
            <div style={{ width: '90px', height: '90px', margin: '14px auto 20px auto', borderRadius: '50%', background: '#f0fdf4', border: '2px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MapPin size={42} color="#16a34a" />
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', margin: '0 0 10px 0' }}>
              Enable Location
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.86rem', lineHeight: '1.5', margin: '0 0 28px 0' }}>
              NOROZZ requires real-time location access to match you with nearby customers in your radius.
            </p>
            <button
              type="button"
              onClick={handleRequestLocation}
              style={{ width: '100%', padding: '14px', borderRadius: '14px', background: '#16a34a', color: '#ffffff', border: 'none', fontSize: '0.98rem', fontWeight: '700', cursor: 'pointer', boxShadow: '0 8px 20px rgba(22, 163, 74, 0.3)', marginBottom: '12px' }}
            >
              Allow Location Access
            </button>
            <button
              type="button"
              onClick={() => handleEvaluatePartnerNextStep(pendingUser, pendingToken)}
              style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.86rem', fontWeight: '600', cursor: 'pointer' }}
            >
              Maybe Later
            </button>
          </div>
        )}

        {step === 'location-popup' && (
          <div style={{ padding: '24px 24px 32px 24px', textAlign: 'center' }}>
            <div style={{ background: '#ffffff', borderRadius: '20px', padding: '24px 18px', border: '1px solid #e2e8f0', boxShadow: '0 12px 30px rgba(0,0,0,0.12)' }}>
              <div style={{ height: '100px', borderRadius: '14px', background: 'linear-gradient(135deg, #bae6fd 0%, #e0f2fe 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Navigation size={38} color="#0284c7" />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: '0 0 8px 0' }}>
                Allow "NOROZZ" to use your location?
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: '1.4', margin: '0 0 18px 0' }}>
                This lets us match you with customers in your radius and guide you to work locations.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button type="button" onClick={handleConfirmLocationAccess} style={{ padding: '11px', borderRadius: '10px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', fontWeight: '700', fontSize: '0.86rem', cursor: 'pointer' }}>
                  {detectingLocation ? 'Detecting GPS...' : 'Allow While Using App'}
                </button>
                <button type="button" onClick={handleConfirmLocationAccess} style={{ padding: '11px', borderRadius: '10px', background: '#f8fafc', color: '#334155', border: '1px solid #cbd5e1', fontWeight: '600', fontSize: '0.86rem', cursor: 'pointer' }}>
                  Allow Once
                </button>
                <button type="button" onClick={() => handleEvaluatePartnerNextStep(pendingUser, pendingToken)} style={{ padding: '8px', background: 'none', border: 'none', color: '#dc2626', fontWeight: '600', fontSize: '0.82rem', cursor: 'pointer' }}>
                  Don't Allow
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STAGE 1: KYC DOCUMENT UPLOAD LIST (upload-documents) */}
        {/* ============================================================ */}
        {step === 'kyc-docs-list' && (
          <div style={{ padding: '0 24px 28px 24px' }}>
            <div style={{ margin: '10px 0 18px 0' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                IDENTITY VERIFICATION (STAGE 1 OF 5)
              </span>
              <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', margin: '4px 0 0 0' }}>
                Upload Documents
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.82rem', marginTop: '4px', margin: 0 }}>
                Upload government ID documents for instant registration approval
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>

              {/* 1. Aadhaar Card */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: '14px', border: documents.aadhaarFront ? '1.5px solid #16a34a' : '1.5px solid #e2e8f0', background: documents.aadhaarFront ? '#f0fdf4' : '#f8fafc' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: documents.aadhaarFront ? '#dcfce7' : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShieldCheck size={20} color={documents.aadhaarFront ? '#16a34a' : '#64748b'} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0f172a' }}>Aadhaar Card (Required)</div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Front & Back photo (JPG, PNG)</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { setActiveDocType('aadhaarFront'); setStep('kyc-doc-upload'); }}
                  style={{ padding: '6px 14px', borderRadius: '20px', border: documents.aadhaarFront ? 'none' : '1px solid #16a34a', background: documents.aadhaarFront ? '#16a34a' : '#ffffff', color: documents.aadhaarFront ? '#ffffff' : '#16a34a', fontWeight: '700', fontSize: '0.78rem', cursor: 'pointer' }}
                >
                  {documents.aadhaarFront ? 'Uploaded ✓' : 'Upload'}
                </button>
              </div>

              {/* 2. PAN Card */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: '14px', border: documents.panDoc ? '1.5px solid #16a34a' : '1.5px solid #e2e8f0', background: documents.panDoc ? '#f0fdf4' : '#f8fafc' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: documents.panDoc ? '#dcfce7' : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CreditCard size={20} color={documents.panDoc ? '#16a34a' : '#64748b'} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0f172a' }}>PAN Card (Tax Verification)</div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Clear photo for payouts</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { setActiveDocType('panDoc'); setStep('kyc-doc-upload'); }}
                  style={{ padding: '6px 14px', borderRadius: '20px', border: documents.panDoc ? 'none' : '1px solid #16a34a', background: documents.panDoc ? '#16a34a' : '#ffffff', color: documents.panDoc ? '#ffffff' : '#16a34a', fontWeight: '700', fontSize: '0.78rem', cursor: 'pointer' }}
                >
                  {documents.panDoc ? 'Uploaded ✓' : 'Upload'}
                </button>
              </div>

              {/* 3. Driving License */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: '14px', border: documents.drivingLicenseDoc ? '1.5px solid #16a34a' : '1.5px solid #e2e8f0', background: documents.drivingLicenseDoc ? '#f0fdf4' : '#f8fafc' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: documents.drivingLicenseDoc ? '#dcfce7' : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={20} color={documents.drivingLicenseDoc ? '#16a34a' : '#64748b'} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0f172a' }}>Driving License (Optional)</div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Photo ID for field service</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { setActiveDocType('drivingLicenseDoc'); setStep('kyc-doc-upload'); }}
                  style={{ padding: '6px 14px', borderRadius: '20px', border: documents.drivingLicenseDoc ? 'none' : '1px solid #cbd5e1', background: documents.drivingLicenseDoc ? '#16a34a' : '#ffffff', color: documents.drivingLicenseDoc ? '#ffffff' : '#475569', fontWeight: '700', fontSize: '0.78rem', cursor: 'pointer' }}
                >
                  {documents.drivingLicenseDoc ? 'Uploaded ✓' : 'Upload'}
                </button>
              </div>

              {/* 4. Bank Passbook / Cancelled Cheque */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: '14px', border: documents.bankPassbookDoc ? '1.5px solid #16a34a' : '1.5px solid #e2e8f0', background: documents.bankPassbookDoc ? '#f0fdf4' : '#f8fafc' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: documents.bankPassbookDoc ? '#dcfce7' : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Building size={20} color={documents.bankPassbookDoc ? '#16a34a' : '#64748b'} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0f172a' }}>Bank Passbook / Cheque</div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>For direct payout transfers</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { setActiveDocType('bankPassbookDoc'); setStep('kyc-doc-upload'); }}
                  style={{ padding: '6px 14px', borderRadius: '20px', border: documents.bankPassbookDoc ? 'none' : '1px solid #16a34a', background: documents.bankPassbookDoc ? '#16a34a' : '#ffffff', color: documents.bankPassbookDoc ? '#ffffff' : '#16a34a', fontWeight: '700', fontSize: '0.78rem', cursor: 'pointer' }}
                >
                  {documents.bankPassbookDoc ? 'Uploaded ✓' : 'Upload'}
                </button>
              </div>

            </div>

            <button
              type="button"
              onClick={() => setStep('kyc-categories')}
              style={{ width: '100%', padding: '14px', borderRadius: '14px', background: '#16a34a', color: '#ffffff', border: 'none', fontSize: '0.98rem', fontWeight: '700', cursor: 'pointer', boxShadow: '0 8px 20px rgba(22, 163, 74, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              Continue to Category Selection <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* ============================================================ */}
        {/* STAGE 2: DOCUMENT UPLOAD MODAL/VIEW (upload-aadhaar-card) */}
        {/* ============================================================ */}
        {step === 'kyc-doc-upload' && (
          <div style={{ padding: '0 24px 28px 24px' }}>
            <div style={{ margin: '10px 0 20px 0' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                Upload {activeDocType === 'aadhaarFront' ? 'Aadhaar Card' : activeDocType === 'panDoc' ? 'PAN Card' : activeDocType === 'bankPassbookDoc' ? 'Bank Passbook' : 'Driving License'}
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.82rem', marginTop: '4px', margin: 0 }}>
                Upload clear photo of document for instant partner verification
              </p>
            </div>

            {/* Front Side Drop Zone */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                {activeDocType === 'aadhaarFront' ? 'Front Side Photo' : 'Document Image / PDF'}
              </div>
              <label htmlFor="doc-file-input" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '140px', borderRadius: '16px', border: '2px dashed #bbf7d0', background: '#f0fdf4', cursor: 'pointer', padding: '16px', textAlign: 'center' }}>
                {documents[activeDocType] ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={32} color="#16a34a" />
                    <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#15803d' }}>File Attached Successfully!</span>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Tap to replace file</span>
                  </div>
                ) : (
                  <>
                    <Upload size={28} color="#16a34a" style={{ marginBottom: '6px' }} />
                    <span style={{ fontSize: '0.86rem', fontWeight: '700', color: '#16a34a' }}>Tap to upload document</span>
                    <span style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '2px' }}>JPG, PNG or PDF (max 5MB)</span>
                  </>
                )}
                <input
                  id="doc-file-input"
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => handleDocumentFileSelect(activeDocType, e.target.files?.[0])}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            {/* Back Side (Aadhaar specific) */}
            {activeDocType === 'aadhaarFront' && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  Back Side Photo
                </div>
                <label htmlFor="doc-back-input" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '130px', borderRadius: '16px', border: '2px dashed #e2e8f0', background: '#f8fafc', cursor: 'pointer', padding: '16px', textAlign: 'center' }}>
                  {documents.aadhaarBack ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 size={32} color="#16a34a" />
                      <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#15803d' }}>Back Side Attached!</span>
                    </div>
                  ) : (
                    <>
                      <Upload size={26} color="#64748b" style={{ marginBottom: '6px' }} />
                      <span style={{ fontSize: '0.84rem', fontWeight: '700', color: '#334155' }}>Tap to upload back side</span>
                      <span style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '2px' }}>JPG or PNG</span>
                    </>
                  )}
                  <input
                    id="doc-back-input"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleDocumentFileSelect('aadhaarBack', e.target.files?.[0])}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
            )}

            {/* Guidelines */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px 14px', borderRadius: '12px', fontSize: '0.76rem', color: '#475569', marginBottom: '22px' }}>
              <div style={{ fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>📌 Document Guidelines:</div>
              • Make sure all text & photos are clearly visible.<br />
              • Avoid blurry or cropped images.<br />
              • File size must be under 5MB.
            </div>

            <button
              type="button"
              onClick={() => setStep('kyc-docs-list')}
              style={{ width: '100%', padding: '14px', borderRadius: '14px', background: '#16a34a', color: '#ffffff', border: 'none', fontSize: '0.98rem', fontWeight: '700', cursor: 'pointer', boxShadow: '0 8px 20px rgba(22, 163, 74, 0.3)' }}
            >
              Save Document & Return
            </button>
          </div>
        )}

        {/* ============================================================ */}
        {/* STAGE 3: SELECT SERVICE CATEGORY (select-service-category) */}
        {/* ============================================================ */}
        {step === 'kyc-categories' && (
          <div style={{ padding: '0 24px 28px 24px' }}>
            <div style={{ margin: '10px 0 16px 0' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                SERVICE SPECIALIZATION (STAGE 2 OF 5)
              </span>
              <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', margin: '4px 0 0 0' }}>
                Select Service Category
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.82rem', marginTop: '4px', margin: 0 }}>
                Choose the primary service category you offer
              </p>
            </div>

            {/* Category Search Input */}
            <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '8px 12px', marginBottom: '16px' }}>
              <Search size={16} color="#64748b" style={{ marginRight: '8px' }} />
              <input
                type="text"
                placeholder="Search service categories..."
                value={searchCatQuery}
                onChange={(e) => setSearchCatQuery(e.target.value)}
                style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.88rem' }}
              />
            </div>

            {/* Category Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '24px', maxHeight: '300px', overflowY: 'auto' }}>
              {(categoriesList.length > 0 ? categoriesList : [
                { name: 'AC & Appliance Repair', icon: 'Wrench' },
                { name: 'Cleaning & Pest Control', icon: 'Sparkles' },
                { name: 'Plumbing, Electrical & Carpentry', icon: 'Zap' },
                { name: 'Salon & Beauty for Women', icon: 'Sparkles' },
                { name: "Men's Salon & Grooming", icon: 'Scissors' },
                { name: 'Home Painting & Decor', icon: 'Paintbrush' },
              ]).filter((c) => c.name.toLowerCase().includes(searchCatQuery.toLowerCase())).map((cat) => {
                const isSelected = category === cat.name;
                return (
                  <div
                    key={cat.name}
                    onClick={() => setCategory(cat.name)}
                    style={{
                      padding: '14px 12px',
                      borderRadius: '16px',
                      border: isSelected ? '2px solid #16a34a' : '1.5px solid #e2e8f0',
                      background: isSelected ? '#f0fdf4' : '#ffffff',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: isSelected ? '#dcfce7' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px auto' }}>
                      <Grid size={20} color={isSelected ? '#16a34a' : '#64748b'} />
                    </div>
                    <div style={{ fontSize: '0.84rem', fontWeight: '700', color: isSelected ? '#15803d' : '#0f172a', lineHeight: '1.3' }}>
                      {cat.name}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setStep('kyc-skills')}
              style={{ width: '100%', padding: '14px', borderRadius: '14px', background: '#16a34a', color: '#ffffff', border: 'none', fontSize: '0.98rem', fontWeight: '700', cursor: 'pointer', boxShadow: '0 8px 20px rgba(22, 163, 74, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              Continue to Skills & Experience <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* ============================================================ */}
        {/* STAGE 4: SKILLS & EXPERIENCE (add-skills-experience) */}
        {/* ============================================================ */}
        {step === 'kyc-skills' && (
          <div style={{ padding: '0 24px 28px 24px' }}>
            <div style={{ margin: '10px 0 16px 0' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                EXPERIENCE & SKILLS (STAGE 3 OF 5)
              </span>
              <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', margin: '4px 0 0 0' }}>
                Skills & Experience
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.82rem', marginTop: '4px', margin: 0 }}>
                Highlight your expertise for high-rating customer matches
              </p>
            </div>

            {/* Years of Experience Dropdown */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                Years of Experience
              </label>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                style={{ width: '100%', padding: '11px 14px', borderRadius: '12px', border: '1.5px solid #cbd5e1', fontSize: '0.92rem', background: '#ffffff', outline: 'none' }}
              >
                <option value="1-2 Years">1-2 Years</option>
                <option value="3-5 Years">3-5 Years</option>
                <option value="5-8 Years">5-8 Years</option>
                <option value="8+ Years">8+ Years Experienced Expert</option>
              </select>
            </div>

            {/* Special Skills Pill Tags */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>
                Select Your Special Skills
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {(SKILLS_BY_CATEGORY[category] || SKILLS_BY_CATEGORY['AC & Appliance Repair']).map((tag) => {
                  const isSelected = skills.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleToggleSkill(tag)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '20px',
                        border: isSelected ? '2px solid #16a34a' : '1px solid #cbd5e1',
                        background: isSelected ? '#dcfce7' : '#ffffff',
                        color: isSelected ? '#15803d' : '#475569',
                        fontWeight: '700',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      {isSelected && <Check size={14} color="#16a34a" />}
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Certifications Input */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                Certifications (Optional)
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="e.g. ITI Certified / Urban Company Master"
                  value={certificateTitle}
                  onChange={(e) => setCertificateTitle(e.target.value)}
                  style={{ flex: 1, padding: '10px 12px', borderRadius: '12px', border: '1.5px solid #cbd5e1', fontSize: '0.86rem', outline: 'none' }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (certificateTitle.trim()) {
                      setCertifications([...certifications, certificateTitle.trim()]);
                      setCertificateTitle('');
                    }
                  }}
                  style={{ padding: '10px 14px', borderRadius: '12px', background: '#16a34a', color: '#ffffff', border: 'none', fontWeight: '700', fontSize: '0.82rem', cursor: 'pointer' }}
                >
                  <Plus size={16} /> Add
                </button>
              </div>
              {certifications.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                  {certifications.map((cert, idx) => (
                    <span key={idx} style={{ background: '#f1f5f9', color: '#334155', padding: '4px 10px', borderRadius: '12px', fontSize: '0.76rem', fontWeight: '600' }}>
                      🎓 {cert}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setStep('kyc-service-area')}
              style={{ width: '100%', padding: '14px', borderRadius: '14px', background: '#16a34a', color: '#ffffff', border: 'none', fontSize: '0.98rem', fontWeight: '700', cursor: 'pointer', boxShadow: '0 8px 20px rgba(22, 163, 74, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              Continue to Service Area <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* ============================================================ */}
        {/* STAGE 5: SERVICE AREA SELECTION (service-area-selection) */}
        {/* ============================================================ */}
        {step === 'kyc-service-area' && (
          <div style={{ padding: '0 24px 28px 24px' }}>
            <div style={{ margin: '10px 0 16px 0' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                LOCATION RADIUS (STAGE 4 OF 5)
              </span>
              <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', margin: '4px 0 0 0' }}>
                Service Area
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.82rem', marginTop: '4px', margin: 0 }}>
                Set your operating radius & local delivery hubs in {workCity}
              </p>
            </div>

            {/* Map Visual Box */}
            <div style={{
              height: '110px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #dcfce7 0%, #e0f2fe 100%)',
              border: '1.5px solid #bbf7d0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '18px',
              position: 'relative',
            }}>
              <MapPin size={34} color="#16a34a" />
              <div style={{ fontSize: '0.84rem', fontWeight: '800', color: '#0f172a', marginTop: '4px' }}>
                {workCity} Operational Hub
              </div>
              <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Active Radius: <strong>{workRadius} km</strong></span>
            </div>

            {/* Work Radius Slider */}
            <div style={{ marginBottom: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>
                <span>Select Work Radius</span>
                <span style={{ color: '#16a34a' }}>{workRadius} km</span>
              </div>
              <input
                type="range"
                min="2"
                max="25"
                value={workRadius}
                onChange={(e) => setWorkRadius(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#16a34a', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>
                <span>2 km</span>
                <span>12 km</span>
                <span>25 km</span>
              </div>
            </div>

            {/* Localities Toggle List */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>
                Available Localities ({selectedLocalities.length} selected)
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '150px', overflowY: 'auto' }}>
                {(LOCALITIES_BY_CITY[workCity] || LOCALITIES_BY_CITY['Delhi NCR']).map((loc) => {
                  const isChecked = selectedLocalities.includes(loc);
                  return (
                    <div
                      key={loc}
                      onClick={() => handleToggleLocality(loc)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: '12px',
                        border: isChecked ? '1.5px solid #16a34a' : '1px solid #e2e8f0',
                        background: isChecked ? '#f0fdf4' : '#f8fafc',
                        cursor: 'pointer',
                        fontSize: '0.84rem',
                        fontWeight: '600',
                        color: isChecked ? '#15803d' : '#334155',
                      }}
                    >
                      <span>📍 {loc}</span>
                      <input type="checkbox" checked={isChecked} onChange={() => {}} style={{ accentColor: '#16a34a' }} />
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep('kyc-working-hours')}
              style={{ width: '100%', padding: '14px', borderRadius: '14px', background: '#16a34a', color: '#ffffff', border: 'none', fontSize: '0.98rem', fontWeight: '700', cursor: 'pointer', boxShadow: '0 8px 20px rgba(22, 163, 74, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              Confirm Area & Set Hours <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* ============================================================ */}
        {/* STAGE 6: WORKING HOURS SETUP (working-hours-setup) */}
        {/* ============================================================ */}
        {step === 'kyc-working-hours' && (
          <div style={{ padding: '0 24px 28px 24px' }}>
            <div style={{ margin: '10px 0 14px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  SCHEDULE SETUP (STAGE 5 OF 5)
                </span>
                <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', margin: '2px 0 0 0' }}>
                  Working Hours
                </h2>
              </div>
              <button
                type="button"
                onClick={handleApplyHoursToAll}
                style={{ background: '#dcfce7', border: 'none', color: '#15803d', padding: '6px 12px', borderRadius: '10px', fontSize: '0.76rem', fontWeight: '700', cursor: 'pointer' }}
              >
                Apply to All
              </button>
            </div>

            {/* Weekly Schedule Toggles */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '22px', maxHeight: '280px', overflowY: 'auto' }}>
              {workingHours.map((sch, idx) => (
                <div
                  key={sch.day}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: '12px',
                    border: sch.isOpen ? '1.5px solid #bbf7d0' : '1px solid #e2e8f0',
                    background: sch.isOpen ? '#f0fdf4' : '#f8fafc',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="checkbox"
                      checked={sch.isOpen}
                      onChange={() => handleToggleDayOpen(idx)}
                      style={{ width: '18px', height: '18px', accentColor: '#16a34a', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '0.86rem', fontWeight: '700', color: sch.isOpen ? '#0f172a' : '#94a3b8' }}>
                      {sch.day}
                    </span>
                  </div>

                  {sch.isOpen ? (
                    <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#16a34a', background: '#ffffff', padding: '4px 10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                      {sch.openTime} - {sch.closeTime}
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.76rem', color: '#94a3b8', fontStyle: 'italic' }}>Off Day</span>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleFinalKycSubmit}
              disabled={isLoggingIn}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '14px',
                background: '#16a34a',
                color: '#ffffff',
                border: 'none',
                fontSize: '1rem',
                fontWeight: '800',
                cursor: 'pointer',
                boxShadow: '0 8px 20px rgba(22, 163, 74, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {isLoggingIn ? <Loader2 size={18} className="spin" /> : <>Submit Complete KYC & Finish <CheckCircle2 size={18} /></>}
            </button>
          </div>
        )}

        {/* ============================================================ */}
        {/* STAGE 7: APPLICATION SUBMITTED / APPROVAL PENDING (approval-pending) */}
        {/* ============================================================ */}
        {step === 'approval-pending' && (
          <div style={{ padding: '24px 24px 32px 24px', textAlign: 'center' }}>
            <div style={{
              width: '90px',
              height: '90px',
              margin: '10px auto 20px auto',
              borderRadius: '50%',
              background: '#f0fdf4',
              border: '3px solid #bbf7d0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 25px rgba(22, 163, 74, 0.2)',
            }}>
              <Clock size={46} color="#16a34a" />
            </div>

            <h2 style={{ fontSize: '1.45rem', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0' }}>
              Application Under Review
            </h2>

            <p style={{ color: '#64748b', fontSize: '0.84rem', lineHeight: '1.5', margin: '0 0 22px 0' }}>
              Our onboarding team is reviewing your documents. We'll notify you as soon as your account is verified & activated by City Admin!
            </p>

            {/* Checklist Box */}
            <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', padding: '16px', borderRadius: '16px', textWrap: 'wrap', textAlign: 'left', marginBottom: '24px' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0f172a', marginBottom: '10px' }}>
                REGISTRATION CHECKLIST STATUS:
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#15803d', fontWeight: '700', marginBottom: '8px' }}>
                <CheckCircle2 size={16} color="#16a34a" /> Profile Details Completed
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#15803d', fontWeight: '700', marginBottom: '8px' }}>
                <CheckCircle2 size={16} color="#16a34a" /> Identity KYC Documents Submitted
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#d97706', fontWeight: '700', marginBottom: '8px' }}>
                <Clock size={16} color="#d97706" /> City Admin Verification (In Progress)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#94a3b8', fontWeight: '600' }}>
                <ShieldCheck size={16} color="#94a3b8" /> Account Activation & Leads Unlocked
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (pendingUser && pendingToken) {
                  login(pendingUser, pendingToken);
                } else {
                  setStep('phone');
                }
              }}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '14px',
                background: '#16a34a',
                color: '#ffffff',
                border: 'none',
                fontSize: '0.98rem',
                fontWeight: '800',
                cursor: 'pointer',
                boxShadow: '0 8px 20px rgba(22, 163, 74, 0.35)',
              }}
            >
              Open Partner Portal (Restricted Mode)
            </button>
          </div>
        )}

        {/* ============================================================ */}
        {/* FALLBACK: EMAIL & PASSWORD LOGIN (email-login) */}
        {/* ============================================================ */}
        {step === 'email-login' && (
          <div style={{ padding: '0 24px 28px 24px' }}>
            <div style={{ margin: '12px 0 22px 0', textAlign: 'center' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                Partner Password Sign In
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.84rem', marginTop: '4px', margin: 0 }}>
                Sign in with registered email address
              </p>
            </div>

            <form onSubmit={handleEmailLoginSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                  Registered Email
                </label>
                <input
                  type="email"
                  placeholder="suresh.partner@norozz.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  style={{ width: '100%', padding: '11px 14px', borderRadius: '12px', border: '1.5px solid #cbd5e1', fontSize: '0.92rem', outline: 'none' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  style={{ width: '100%', padding: '11px 14px', borderRadius: '12px', border: '1.5px solid #cbd5e1', fontSize: '0.92rem', outline: 'none' }}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '14px',
                  background: '#16a34a',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.98rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 8px 20px rgba(22, 163, 74, 0.3)',
                }}
              >
                {isLoggingIn ? <Loader2 size={18} className="spin" /> : 'Sign In to Partner Portal'}
              </button>
            </form>

            <div style={{ marginTop: '18px', textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => setStep('phone')}
                style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer' }}
              >
                ← Back to Mobile OTP Login
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default PartnerAuthPage;
