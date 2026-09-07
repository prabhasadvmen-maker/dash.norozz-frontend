import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  MapPin,
  FileText,
  Upload,
  CreditCard,
  Grid,
  Check,
  Search,
  Plus,
  Building,
  Sparkles,
  CheckCircle2,
  Loader2,
  AlertCircle,
  LogOut,
  User,
  Navigation as NavigationIcon,
  Award,
  Trash2,
  X,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { authService } from '../services/auth.service.js';
import { catalogService } from '../services/catalog.service.js';
import { cityService } from '../services/city.service.js';
import { geoapifyService } from '../services/geoapify.service.js';
import { toast } from '../utils/toast.js';
import { kycService } from '../services/kyc.service.js';

const DEFAULT_SCHEDULE = [
  { day: 'Monday', isOpen: true, openTime: '09:00 AM', closeTime: '07:00 PM' },
  { day: 'Tuesday', isOpen: true, openTime: '09:00 AM', closeTime: '07:00 PM' },
  { day: 'Wednesday', isOpen: true, openTime: '09:00 AM', closeTime: '07:00 PM' },
  { day: 'Thursday', isOpen: true, openTime: '09:00 AM', closeTime: '07:00 PM' },
  { day: 'Friday', isOpen: true, openTime: '09:00 AM', closeTime: '07:00 PM' },
  { day: 'Saturday', isOpen: true, openTime: '10:00 AM', closeTime: '05:00 PM' },
  { day: 'Sunday', isOpen: false, openTime: '09:00 AM', closeTime: '07:00 PM' },
];



const CITY_COORDINATES = {
  'Delhi NCR': { lat: 28.6139, lng: 77.2090, zoom: 11 },
  'Bengaluru': { lat: 12.9716, lng: 77.5946, zoom: 11 },
  'Mumbai': { lat: 19.0760, lng: 72.8777, zoom: 11 },
  'Hyderabad': { lat: 17.3850, lng: 78.4867, zoom: 11 },
  'Pune': { lat: 18.5204, lng: 73.8567, zoom: 11 },
  'Jaipur': { lat: 26.9124, lng: 75.7873, zoom: 11 },
};

const REAL_LOCALITIES_BY_CITY = {
  'Delhi NCR': [
    'Connaught Place (Central Delhi)',
    'South Extension Part 1 & 2',
    'Dwarka Sector 10-14 (West Delhi)',
    'Noida Sector 18 & 62 (GB Nagar)',
    'Gurugram Cyber City & DLF Phase 3',
    'Indirapuram & Vaishali (Ghaziabad)',
    'Hauz Khas & Green Park (South Delhi)',
    'Lajpat Nagar & Defense Colony',
    'Rohini Sector 7 & Pitampura',
    'Saket District Centre & Pushp Vihar',
    'Vasant Kunj & Chattarpur',
    'Greater Noida Omega 1 & Pari Chowk',
  ],
  'Bengaluru': [
    'HSR Layout Sector 1-7',
    'Koramangala 4th & 5th Block',
    'Bellandur Outer Ring Road',
    'BTM Layout Stage 2',
    'Indiranagar 100ft Road',
    'Whitefield ITPB Main Road',
    'Electronic City Phase 1',
    'Marathahalli Junction',
    'Jayanagar 4th Block',
    'JP Nagar 6th Phase',
    'Banashankari 3rd Stage',
    'Hebbal Near Outer Ring Road',
  ],
  'Mumbai': [
    'Bandra West & Pali Hill',
    'Andheri East & MIDC Industrial Hub',
    'Powai Hiranandani Gardens',
    'Juhu Beach Area & Vile Parle',
    'Lower Parel & Worli Seaface',
    'Thane West & Pokhran Road',
    'Vashi & Nerul (Navi Mumbai)',
    'Malad West & Mindspace Complex',
    'Goregaon East & Oberoi Garden City',
    'Borivali West & Shimpoli',
  ],
  'Hyderabad': [
    'Gachibowli Financial District',
    'HITECH City & Madhapur Cyber Towers',
    'Banjara Hills Road No. 12',
    'Jubilee Hills Checkpost Area',
    'Kukatpally KPHB Colony',
    'Kondapur Botanical Garden Area',
    'Begumpet & Somajiguda',
    'Miyapur X Roads & Bachupally',
  ],
  'Pune': [
    'Viman Nagar & Kalyani Nagar',
    'Koregaon Park Main Road',
    'Baner & Balewadi High Street',
    'Kharadi EON IT Park',
    'Wakad & Hinjawadi Phase 1',
    'Aundh & ITI Road',
    'Kothrud & Karve Nagar',
    'Hadapsar & Magarpatta City',
  ],
  'Jaipur': [
    'Malviya Nagar & Gaurav Tower',
    'C Scheme & Ashok Nagar',
    'Vaishali Nagar Amrapali Circle',
    'Mansarovar VT Road',
    'Raja Park & Tilak Nagar',
    'Jagatpura Near SKIT',
    'Tonk Road & Gopalpura Bypass',
  ],
};

// Interactive Real Leaflet Map Component with Dynamic Circle Radius & Live Location Pin & Map Click Setter
const InteractiveServiceMap = ({ city = 'Delhi NCR', radiusKm = 8, coords = null, onSelectLocation = null }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const circleInstanceRef = useRef(null);
  const markerInstanceRef = useRef(null);
  const onSelectLocationRef = useRef(onSelectLocation);

  useEffect(() => {
    onSelectLocationRef.current = onSelectLocation;
  }, [onSelectLocation]);

  const defaultCityCoords = CITY_COORDINATES[city] || CITY_COORDINATES['Delhi NCR'];
  const activeLat = coords?.lat ? Number(coords.lat) : defaultCityCoords.lat;
  const activeLng = coords?.lng ? Number(coords.lng) : defaultCityCoords.lng;

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Fix default Leaflet icon paths
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    let resizeObserver = null;
    let timer = null;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [activeLat, activeLng],
        zoom: coords?.lat ? 14 : defaultCityCoords.zoom,
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer(geoapifyService.getTileUrl('osm-bright'), {
        maxZoom: 19,
        attribution: '&copy; Geoapify &copy; OpenStreetMap',
      }).addTo(map);

      const circle = L.circle([activeLat, activeLng], {
        color: '#16a34a',
        fillColor: '#22c55e',
        fillOpacity: 0.22,
        weight: 2.5,
        radius: radiusKm * 1000,
      }).addTo(map);

      const marker = L.marker([activeLat, activeLng])
        .addTo(map)
        .bindPopup(`<b>${coords?.lat ? 'Selected Location' : `${city} Hub`}</b><br>Radius: ${radiusKm} km`);

      // Allow clicking on map to set position manually
      map.on('click', (e) => {
        if (onSelectLocationRef.current) {
          onSelectLocationRef.current(e.latlng.lat, e.latlng.lng);
        }
      });

      mapInstanceRef.current = map;
      circleInstanceRef.current = circle;
      markerInstanceRef.current = marker;

      // Force recalculation of container size after DOM layout settles
      timer = setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 250);

      if (typeof ResizeObserver !== 'undefined' && mapContainerRef.current) {
        resizeObserver = new ResizeObserver(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        });
        resizeObserver.observe(mapContainerRef.current);
      }
    } else {
      mapInstanceRef.current.invalidateSize();
    }

    return () => {
      if (timer) clearTimeout(timer);
      if (resizeObserver) resizeObserver.disconnect();
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.off();
          mapInstanceRef.current.remove();
        } catch (e) {
          console.warn('Map cleanup error:', e);
        }
        mapInstanceRef.current = null;
        circleInstanceRef.current = null;
        markerInstanceRef.current = null;
      }
    };
  }, [city]);

  // Update map view & marker pin in real-time when coords change
  useEffect(() => {
    if (coords?.lat && coords?.lng && mapInstanceRef.current) {
      const cLat = Number(coords.lat);
      const cLng = Number(coords.lng);
      try {
        const map = mapInstanceRef.current;
        if (map && map._container) {
          map.invalidateSize();
          map.setView([cLat, cLng], 13);
          if (markerInstanceRef.current) {
            markerInstanceRef.current.setLatLng([cLat, cLng]);
            markerInstanceRef.current.bindPopup(`<b>Selected Position</b><br>Lat: ${cLat.toFixed(4)}, Lng: ${cLng.toFixed(4)}`);
          }
          if (circleInstanceRef.current) {
            circleInstanceRef.current.setLatLng([cLat, cLng]);
          }
        }
      } catch (err) {
        console.warn('Map update warning:', err);
      }
    }
  }, [coords?.lat, coords?.lng]);

  // Update dynamic circle radius in real-time when slider moves
  useEffect(() => {
    if (circleInstanceRef.current) {
      try {
        circleInstanceRef.current.setRadius(radiusKm * 1000);
        if (mapInstanceRef.current && mapInstanceRef.current._container) {
          mapInstanceRef.current.fitBounds(circleInstanceRef.current.getBounds(), { padding: [20, 20] });
        }
      } catch {
        // ignore map fitBounds exception if unmounted
      }
    }
  }, [radiusKm]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '230px', borderRadius: '18px', overflow: 'hidden', border: '2px solid #bbf7d0', boxShadow: '0 4px 14px rgba(22, 163, 74, 0.12)', marginBottom: '18px' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%', zIndex: 1, cursor: 'crosshair' }} />
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        right: '10px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '8px',
        zIndex: 400,
        pointerEvents: 'none',
        flexWrap: 'wrap'
      }}>
        <div style={{
          background: 'rgba(15, 23, 42, 0.85)',
          color: '#ffffff',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          padding: '5px 10px',
          borderRadius: '20px',
          fontSize: '0.72rem',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          whiteSpace: 'nowrap',
          maxWidth: '100%',
        }}>
          📍 Tap map to set location pin
        </div>
        <div style={{
          background: 'rgba(255, 255, 255, 0.94)',
          color: '#15803d',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          padding: '5px 10px',
          borderRadius: '12px',
          fontSize: '0.75rem',
          fontWeight: '800',
          border: '1px solid #bbf7d0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          whiteSpace: 'nowrap',
        }}>
          📍 Active Coverage: {radiusKm} km
        </div>
      </div>
    </div>
  );
};

// Helper to calculate exact onboarding step based on currentUser DB progress
const getInitialStepFromUser = (user) => {
  if (!user) return 1;

  // Step 1: Location Access (Requires explicit GPS permission / saved coordinates)
  const isLocationSaved = Boolean(
    user.isLocationSaved ||
    (user.locationCoordinates?.lat && user.locationCoordinates?.lng)
  );
  if (!isLocationSaved) return 1;

  // Step 2: Select Category
  const isCategorySelected = Boolean(
    user.isCategorySelected ||
    (user.categories && user.categories.length > 0) ||
    (user.offeredServices && user.offeredServices.length > 0)
  );
  if (!isCategorySelected) return 2;

  // Step 3: Select Skills
  const isSkillsSelected = Boolean(
    user.isSkillsSelected ||
    user.isSkillsUpdated ||
    (user.skills && user.skills.length > 0)
  );
  if (!isSkillsSelected) return 3;

  // Step 4: Service Area & Radius
  const isServiceAreaSet = Boolean(
    user.isServiceAreaSet ||
    (user.localities && user.localities.length > 0)
  );
  if (!isServiceAreaSet) return 4;

  // Step 5: Document Upload
  const isDocsUploaded = Boolean(user.isDocumentsUploaded);
  if (!isDocsUploaded) return 5;

  // Step 6: Registration & Fees (One-Time Onboarding Fee)
  const isOnboardingFeePaid = Boolean(user.isOnboardingFeePaid);
  if (!isOnboardingFeePaid) return 6;

  return 6;
};

const PartnerOnboardingPage = ({ currentUser, onLogout, onFinishOnboarding }) => {
  const {
    saveOnboardingLocation,
    saveOnboardingDocuments,
    saveOnboardingCategory,
    saveOnboardingSkills,
    saveOnboardingServiceArea,
    saveOnboardingWorkingHours,
    addCertification,
    deleteCertification,
    payOnboardingFee,
    updatePartnerProfile,
    updateUser,
    isLoggingIn,
  } = useAuth();

  // Step state with double-fallback: localStorage cache (validated against DB calculation) -> currentUser DB progress calculation
  const [step, setStep] = useState(() => {
    const calculatedStep = getInitialStepFromUser(currentUser);
    const savedUserId = localStorage.getItem('partner_onboarding_user_id');
    const savedStep = localStorage.getItem('partner_onboarding_step');
    if (savedUserId === currentUser?._id && savedStep && !isNaN(Number(savedStep))) {
      const parsed = Number(savedStep);
      if (parsed >= 1 && parsed <= 6 && parsed <= calculatedStep) return parsed;
    }
    return calculatedStep;
  });
  const [subStep, setSubStep] = useState('list'); // 'list' | 'aadhaar' | 'generic'

  // Onboarding Fee & Registration Payment State
  const [onboardingFeeInfo, setOnboardingFeeInfo] = useState({
    totalAmount: 999,
    baseRegistrationFee: 846.61,
    gstAmount: 152.39,
    currency: 'INR',
  });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('UPI');
  const [processingFeePayment, setProcessingFeePayment] = useState(false);

  useEffect(() => {
    authService.getOnboardingFee()
      .then((res) => {
        const data = res.data?.data || res.data || {};
        if (data.totalAmount) {
          setOnboardingFeeInfo(data);
        }
      })
      .catch((err) => console.warn('Onboarding fee fetch notice:', err));
  }, []);

  // Persist current step to localStorage per user
  useEffect(() => {
    if (step && currentUser?._id) {
      localStorage.setItem('partner_onboarding_step', step.toString());
      localStorage.setItem('partner_onboarding_user_id', currentUser._id);
    }
  }, [step, currentUser?._id]);

  // Profile Edit Modal State
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editName, setEditName] = useState(currentUser?.name || '');
  const [editEmail, setEditEmail] = useState(currentUser?.email || '');
  const [editDob, setEditDob] = useState(currentUser?.dob || '1995-08-15');
  const [editGender, setEditGender] = useState(currentUser?.gender || 'Male');
  const [editCity, setEditCity] = useState(currentUser?.assignedCity || currentUser?.city || '');
  const [activeCitiesList, setActiveCitiesList] = useState([]);
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    cityService.getActiveCities()
      .then((res) => {
        const list = res.data?.data || res.data || [];
        if (Array.isArray(list) && list.length > 0) {
          setActiveCitiesList(list);
          const currentCityVal = (typeof currentUser?.assignedCity === 'object' ? currentUser?.assignedCity?._id : currentUser?.assignedCity) || currentUser?.city;
          const matched = list.find((c) => String(c._id) === String(currentCityVal) || c.name.toLowerCase() === String(currentCityVal || '').toLowerCase());
          if (matched) {
            setEditCity(matched._id);
          } else if (!editCity) {
            setEditCity(list[0]._id);
          }
        }
      })
      .catch((err) => console.warn('Active cities fetch warning:', err));
  }, [currentUser?.assignedCity, currentUser?.city]);

  const handleSaveProfileEdit = async (e) => {
    e?.preventDefault();
    setError('');
    setSavingProfile(true);
    try {
      const res = await updatePartnerProfile({
        name: editName,
        email: editEmail,
        dob: editDob,
        gender: editGender,
        assignedCity: editCity,
      });
      const updatedUser = res.data?.user || res.user || { ...currentUser, name: editName, email: editEmail, dob: editDob, gender: editGender, assignedCity: editCity };
      updateUser(updatedUser);
      setSuccessMsg('✅ Profile information updated successfully!');
      setShowEditProfileModal(false);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  // Location Access State
  const [deviceCoords, setDeviceCoords] = useState(currentUser?.locationCoordinates || null);
  const [deviceAddress, setDeviceAddress] = useState(currentUser?.address || '');
  const [isDetectingGps, setIsDetectingGps] = useState(false);

  // Documents Memory & Raw File State
  const [documents, setDocuments] = useState(currentUser?.documents || {
    aadhaarFront: '',
    aadhaarBack: '',
    panDoc: '',
    passportPhoto: '',
    bankPassbookDoc: '',
    drivingLicenseDoc: '',
  });

  // Raw file objects attached locally before clicking Continue
  const [documentFiles, setDocumentFiles] = useState({});

  // Document Numbers Input State
  const [aadhaarNoInput, setAadhaarNoInput] = useState(currentUser?.documents?.aadhaarNo || '');
  const [panNoInput, setPanNoInput] = useState(currentUser?.kyc?.pan?.panNumber || '');
  const [dlNoInput, setDlNoInput] = useState('');
  const [dlDobInput, setDlDobInput] = useState(currentUser?.dob || '');
  const [bankAccountNoInput, setBankAccountNoInput] = useState(currentUser?.bankDetails?.accountNumber || '');
  const [bankIfscInput, setBankIfscInput] = useState(currentUser?.bankDetails?.ifscCode || '');
  const [bankHolderNameInput, setBankHolderNameInput] = useState(currentUser?.bankDetails?.accountHolderName || currentUser?.name || '');

  const [activeGenericDoc, setActiveGenericDoc] = useState('panDoc');
  const [showGenericModal, setShowGenericModal] = useState(false);

  // Category & Offered Services State (Step 2)
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [category, setCategory] = useState('');
  const [categoriesList, setCategoriesList] = useState([]);
  const [searchCatQuery, setSearchCatQuery] = useState('');
  const [showCategoryServicesModal, setShowCategoryServicesModal] = useState(false);
  const [selectedCategoryObj, setSelectedCategoryObj] = useState(null);
  const [categoryServices, setCategoryServices] = useState([]);
  const [offeredServices, setOfferedServices] = useState(() => {
    if (Array.isArray(currentUser?.offeredServices)) {
      return currentUser.offeredServices
        .map((s) => (typeof s === 'object' && s?._id ? String(s._id) : String(s)))
        .filter((s) => Boolean(s.match(/^[0-9a-fA-F]{24}$/)));
    }
    return [];
  });
  const [loadingCategoryServices, setLoadingCategoryServices] = useState(false);

  const handleToggleOfferedService = (serviceId) => {
    setOfferedServices((prev) => {
      if (prev.includes(serviceId)) return prev.filter((id) => id !== serviceId);
      return [...prev, serviceId];
    });
  };

  // Single-selection category handler with services modal trigger
  const handleSelectCategory = (catObj) => {
    const catId = catObj._id || catObj.id || catObj.name;
    setSelectedCategories([catId]);
    setCategory(catId);
    setSelectedCategoryObj(catObj);
    setShowCategoryServicesModal(true);
  };

  // Check if selected category requires Driving License (Driver / Cab / Delivery)
  const catObj = selectedCategoryObj || (Array.isArray(categoriesList) ? categoriesList.find((c) => String(c?._id || '') === String(category || '') || c?.slug === category || c?.name === category) : null);
  const rawCatName = catObj?.name || catObj?.title || (typeof category === 'string' ? category : '') || (typeof currentUser?.category === 'object' ? currentUser?.category?.name : currentUser?.category) || '';
  const catName = String(rawCatName || '').toLowerCase();
  const catSlug = String(catObj?.slug || '').toLowerCase();
  const isDriverCategory = Boolean(
    catName.includes('driver') ||
    catName.includes('cab') ||
    catName.includes('driving') ||
    catName.includes('chauffeur') ||
    catName.includes('vehicle') ||
    catName.includes('delivery') ||
    catSlug.includes('driver') ||
    catSlug.includes('cab') ||
    catSlug.includes('driving')
  );

  // Skills & Experience State (Dynamic Skills based on Selected Category)
  const [experience, setExperience] = useState(currentUser?.experience || '3-5 Years');
  const [skills, setSkills] = useState(() => {
    if (Array.isArray(currentUser?.skills)) {
      return currentUser.skills
        .map((s) => (typeof s === 'object' && s?._id ? String(s._id) : String(s)))
        .filter((s) => Boolean(s.match(/^[0-9a-fA-F]{24}$/)));
    }
    return [];
  });
  const [categorySkills, setCategorySkills] = useState([]);
  const [loadingSkills, setLoadingSkills] = useState(false);
  const [certifications, setCertifications] = useState(currentUser?.certifications || []);

  // Certificate Upload Modal State (Matching Add Professional Certificate UI Mockup)
  const [showCertModal, setShowCertModal] = useState(false);
  const [certTitle, setCertTitle] = useState('');
  const [certFile, setCertFile] = useState(null);
  const [certImagePreview, setCertImagePreview] = useState('');
  const certFileInputRef = useRef(null);

  const handleCertFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB limit. Please upload a smaller image.');
      return;
    }

    let processedFile = file;
    if (file.type?.startsWith('image/')) {
      processedFile = await compressImage(file);
    }
    setCertFile(processedFile);

    const reader = new FileReader();
    reader.onloadend = () => {
      setCertImagePreview(reader.result);
    };
    reader.readAsDataURL(processedFile);
  };

  const [uploadingCert, setUploadingCert] = useState(false);

  const handleSaveCertificateModal = async () => {
    if (!certImagePreview && !certTitle.trim() && !certFile) {
      toast.error('Please upload a certificate document photo or enter a certificate title');
      return;
    }

    setUploadingCert(true);
    try {
      let res;
      if (certFile) {
        const formData = new FormData();
        formData.append('certificateFile', certFile);
        if (certTitle.trim()) {
          formData.append('title', certTitle.trim());
        }
        res = await addCertification(formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        res = await addCertification({
          title: certTitle.trim() || 'Professional Certificate',
          image: certImagePreview,
        });
      }

      const updatedUser = res.data?.user || res.user;
      if (updatedUser?.certifications) {
        setCertifications(updatedUser.certifications);
      } else if (res.data?.certification || res.certification) {
        const savedCert = res.data?.certification || res.certification;
        setCertifications((prev) => [...prev, savedCert]);
      }

      setCertTitle('');
      setCertFile(null);
      setCertImagePreview('');
      setShowCertModal(false);
      toast.success('📜 Certificate uploaded & saved to database!');
    } catch (err) {
      console.error('Certificate upload error:', err);
      toast.error(err.message || 'Failed to upload certificate');
    } finally {
      setUploadingCert(false);
    }
  };

  const handleRemoveCertificate = async (indexToRemove) => {
    const certItem = certifications[indexToRemove];
    const certId = typeof certItem === 'object' ? (certItem._id || certItem.id || indexToRemove) : indexToRemove;

    try {
      const res = await deleteCertification(certId);
      const updatedUser = res.data?.user || res.user;
      if (updatedUser?.certifications) {
        setCertifications(updatedUser.certifications);
      } else {
        setCertifications((prev) => prev.filter((_, idx) => idx !== indexToRemove));
      }
      toast.success('Certificate deleted successfully from database');
    } catch (err) {
      console.warn('Backend certificate delete fallback:', err);
      setCertifications((prev) => prev.filter((_, idx) => idx !== indexToRemove));
      toast.success('Certificate removed');
    }
  };

  // Fetch Dynamic Category Services for Step 2 Modal
  useEffect(() => {
    if (!showCategoryServicesModal || (!selectedCategories.length && !category && !selectedCategoryObj)) return;
    const loadCategoryServices = async () => {
      setLoadingCategoryServices(true);
      try {
        const targetCatId = selectedCategories[0] || category || selectedCategoryObj?._id;
        const res = await catalogService.getServices({ category: targetCatId });
        let list = res.data?.data || res.data || [];

        if (!Array.isArray(list) || list.length === 0) {
          const resAll = await catalogService.getServices({});
          const allList = resAll.data?.data || resAll.data || [];
          if (Array.isArray(allList)) {
            list = allList.filter((s) => String(s.category?._id || s.category) === String(targetCatId) || String(s.category?.name || s.category) === String(selectedCategoryObj?.name));
          }
        }

        if (Array.isArray(list) && list.length > 0) {
          const formatted = list.map((s) => ({ _id: s._id, name: s.name || s.title, description: s.description || s.duration }));
          setCategoryServices(formatted);
          setOfferedServices((prev) => {
            if (!prev.length) return formatted.map((s) => String(s._id));
            return prev;
          });
        } else {
          const catName = selectedCategoryObj?.name || 'Category';
          const defaultServices = [
            { _id: `svc_std_1`, name: `${catName} Standard Service`, description: 'General service delivery & inspection' },
            { _id: `svc_std_2`, name: `Deep ${catName} Package`, description: 'Advanced specialized equipment & deep service' },
            { _id: `svc_std_3`, name: `Premium ${catName} Repair & Fix`, description: 'Full service package with warranty' },
          ];
          setCategoryServices(defaultServices);
          setOfferedServices(defaultServices.map((s) => s._id));
        }
      } catch (err) {
        console.warn('Failed to load category services:', err);
      } finally {
        setLoadingCategoryServices(false);
      }
    };
    loadCategoryServices();
  }, [showCategoryServicesModal, selectedCategories, category, selectedCategoryObj]);

  // Fetch Dynamic Skills for Step 3 Page
  useEffect(() => {
    if (step !== 3) return;
    const loadCategorySkills = async () => {
      setLoadingSkills(true);
      try {
        const targetCatId = selectedCategories[0] || category || selectedCategoryObj?._id || currentUser?.category;
        let fetchedSkills = [];
        try {
          const res = await catalogService.getSkills({ categories: targetCatId });
          fetchedSkills = res.data?.data || res.data || [];
        } catch (e) {}

        if (Array.isArray(fetchedSkills) && fetchedSkills.length > 0) {
          setCategorySkills(fetchedSkills);
          setSkills((prev) => {
            const validOnly = prev.filter((s) => typeof s === 'string' && Boolean(s.match(/^[0-9a-fA-F]{24}$/)));
            if (!validOnly.length) return fetchedSkills.map((sk) => String(sk._id || sk.id));
            return validOnly;
          });
        } else {
          const catName = selectedCategoryObj?.name || 'Technical';
          const defaultSkills = [
            { _id: `sk_1`, name: `${catName} Diagnostics`, description: 'Problem identification & safety check' },
            { _id: `sk_2`, name: `High-Precision Equipment Usage`, description: 'Certified professional tools operation' },
            { _id: `sk_3`, name: `Sanitization & Worksite Safety`, description: 'Clean post-service cleanup protocol' },
          ];
          setCategorySkills(defaultSkills);
          setSkills(defaultSkills.map((s) => s._id));
        }
      } catch (err) {
        console.warn('Failed to fetch category skills:', err);
      } finally {
        setLoadingSkills(false);
      }
    };
    loadCategorySkills();
  }, [step, selectedCategories, category, selectedCategoryObj, currentUser]);

  const [detectedCity, setDetectedCity] = useState('');

  // Helper to resolve human-readable city name from ObjectId or object
  const getCityName = (cityVal) => {
    if (!cityVal) return 'Delhi NCR';
    if (typeof cityVal === 'object' && cityVal?.name) return cityVal.name;
    const found = activeCitiesList.find((c) => String(c._id) === String(cityVal) || c.name === cityVal);
    if (found) return found.name;
    return typeof cityVal === 'string' && !cityVal.match(/^[0-9a-fA-F]{24}$/) ? cityVal : 'Delhi NCR';
  };

  const displayCityName = detectedCity || getCityName(currentUser?.assignedCity || currentUser?.city);
  const workCity = displayCityName;

  // Service Area State
  const [workRadius, setWorkRadius] = useState(currentUser?.workRadius || 8);
  const [dynamicNearbyLocalities, setDynamicNearbyLocalities] = useState([]);
  const [selectedLocalities, setSelectedLocalities] = useState(() => {
    if (currentUser?.localities?.length) return currentUser.localities;
    const preset = REAL_LOCALITIES_BY_CITY[displayCityName] || [];
    return preset.slice(0, 4);
  });

  // Working Hours State
  const [workingHours, setWorkingHours] = useState(currentUser?.workingHours?.length ? currentUser.workingHours : DEFAULT_SCHEDULE);

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [customLocalityInput, setCustomLocalityInput] = useState('');

  const [loadingNearbyLocs, setLoadingNearbyLocs] = useState(false);

  // Dynamic reverse-geocoding of localities scaled by Work Radius (2km -> 25km)
  const fetchLocalitiesForRadius = (lat, lng, radiusKm) => {
    if (!lat || !lng) return;
    const cLat = Number(lat);
    const cLng = Number(lng);
    setLoadingNearbyLocs(true);

    const rDeg = radiusKm / 111;
    const numPoints = Math.min(12, Math.max(3, Math.round(radiusKm / 2)));
    const offsets = [{ lat: cLat, lng: cLng }];

    for (let i = 1; i < numPoints; i++) {
      const angle = (i * 2 * Math.PI) / (numPoints - 1);
      const dist = (0.2 + (i % 3) * 0.25) * rDeg;
      const dLat = dist * Math.cos(angle);
      const dLng = dist * Math.sin(angle);
      offsets.push({ lat: cLat + dLat, lng: cLng + dLng });
    }

    Promise.all(
      offsets.map((pt) =>
        geoapifyService.reverseGeocode(pt.lat, pt.lng)
          .catch(() => null)
      )
    ).then((results) => {
      const locNames = [];
      results.forEach((data) => {
        if (data?.addressLine2 || data?.addressLine1 || data?.city) {
          const name = data.addressLine2 || data.addressLine1;
          const localCity = data.city || '';
          if (name) {
            const formatted = (localCity && localCity.toLowerCase() !== name.toLowerCase())
              ? `${name} (${localCity})`
              : name;

            if (!locNames.includes(formatted)) {
              locNames.push(formatted);
            }
          }
        }
      });

      if (locNames.length > 0) {
        setDynamicNearbyLocalities(locNames);
        setSelectedLocalities((prev) => {
          const customAdded = prev.filter(
            (p) => !REAL_LOCALITIES_BY_CITY['Bengaluru']?.includes(p) && !REAL_LOCALITIES_BY_CITY['Delhi NCR']?.includes(p)
          );
          return Array.from(new Set([...locNames, ...customAdded]));
        });
      }
      setLoadingNearbyLocs(false);
    });
  };

  useEffect(() => {
    if (step !== 4) return;
    const coordsObj = deviceCoords || currentUser?.locationCoordinates;
    if (coordsObj?.lat && coordsObj?.lng) {
      const timer = setTimeout(() => {
        fetchLocalitiesForRadius(coordsObj.lat, coordsObj.lng, workRadius);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // Load Super Admin Categories from backend
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await catalogService.getCategories();
        const list = res.data?.data || res.data || [];
        if (Array.isArray(list) && list.length > 0) {
          setCategoriesList(list);
          if (!selectedCategories.length) {
            const firstId = list[0]._id || list[0].id || list[0].name;
            setSelectedCategories([firstId]);
            setCategory(firstId);
          }
        }
      } catch (err) {
        console.error('Failed to load active categories:', err);
      }
    };
    fetchCats();
  }, []);



  // Helper to compress client-side images before FormData R2 upload (Prevents 413 Payload Too Large)
  const compressImage = (file, maxWidth = 1600, quality = 0.8) => {
    return new Promise((resolve) => {
      if (!file || !file.type?.startsWith('image/')) {
        resolve(file);
        return;
      }

      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target.result;
      };

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => resolve(file);
      reader.readAsDataURL(file);
    });
  };

  // Local Document Attachment Handler (Batched until Continue click, with auto compression)
  const handleDocumentFileSelect = async (docKey, file) => {
    if (!file) return;

    let processedFile = file;
    if (file.type?.startsWith('image/')) {
      processedFile = await compressImage(file);
    }

    // Store raw file in documentFiles state for batch upload on Continue
    setDocumentFiles((prev) => ({
      ...prev,
      [docKey]: processedFile,
    }));

    // Local thumbnail preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setDocuments((prev) => ({
        ...prev,
        [docKey]: reader.result,
        ...(docKey === 'aadhaarFront' || docKey === 'aadhaarBack' ? { aadhaarDoc: reader.result } : {}),
      }));
      setSuccessMsg(`📷 Photo attached for ${docKey}! Click Continue to upload all to R2.`);
    };
    reader.readAsDataURL(processedFile);
  };

  // Manual Map Pin Click Handler (Tap anywhere on Leaflet map to pin custom location)
  const handleManualMapSelectLocation = (lat, lng) => {
    const rLat = Number(Number(lat).toFixed(6));
    const rLng = Number(Number(lng).toFixed(6));
    const coordsObj = { lat: rLat, lng: rLng };
    setDeviceCoords(coordsObj);

    geoapifyService.reverseGeocode(rLat, rLng)
      .then((data) => {
        if (data?.formatted) {
          setDeviceAddress(data.formatted);
        } else {
          setDeviceAddress(`Pinned Location (${rLat}, ${rLng})`);
        }
        if (data?.city) {
          setDetectedCity(data.city);
        }
      })
      .catch(() => {
        setDeviceAddress(`Pinned Location (${rLat}, ${rLng})`);
      });

    if (step === 4) {
      fetchLocalitiesForRadius(rLat, rLng, workRadius);
    }

    toast.success('📍 Location pinned manually from map click!');
  };

  // STEP 1: Allow Location Access Handler (Production-Grade watchPosition + Fallback Strategy)
  const handleAllowLocationAccess = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setError('');
    setSuccessMsg('');
    setIsDetectingGps(true);

    let watchId = null;
    let isResolved = false;

    // Helper to process position, reverse geocode address, and update React state
    const handleLocationSuccess = async (lat, lng, sourceLabel = 'Device GPS') => {
      if (isResolved) return;
      isResolved = true;

      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
      }

      const coordsObj = { lat, lng };
      setDeviceCoords(coordsObj);

      let detectedAddr = `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
        );
        const data = await res.json();
        if (data?.display_name) {
          detectedAddr = data.display_name;
        }
        if (data?.address) {
          const cityFromGeo = data.address.city || data.address.town || data.address.district || data.address.county || data.address.state_district;
          if (cityFromGeo) setDetectedCity(cityFromGeo);
        }
      } catch (e) {
        console.warn('Reverse geocoding warning:', e);
      }

      setDeviceAddress(detectedAddr);
      setSuccessMsg(`✅ Location detected via ${sourceLabel}! Click Continue to save.`);
      setIsDetectingGps(false);
    };

    // Multi-tiered Fallback strategy if hardware GPS is unavailable or times out
    const triggerFallbackStrategy = async (reason = '') => {
      if (isResolved) return;
      console.warn(`Primary GPS acquisition failed (${reason}). Initiating fallback sequence...`);

      // Fallback Tier 1: Try IP Geolocation API
      try {
        const ipRes = await fetch('https://ipapi.co/json/').then((r) => r.json());
        if (ipRes && ipRes.latitude && ipRes.longitude) {
          await handleLocationSuccess(Number(ipRes.latitude), Number(ipRes.longitude), 'IP Geolocation');
          setSuccessMsg('📍 Location estimated via IP. Tap map to pin your exact location manually, or allow GPS in browser.');
          return;
        }
      } catch (ipErr) {
        console.warn('IP Geolocation fallback failed:', ipErr);
      }

      // Fallback Tier 2: Use Selected Work City Default Coordinates
      const defaultCoords = CITY_COORDINATES[workCity] || CITY_COORDINATES['Delhi NCR'] || { lat: 28.6139, lng: 77.2090 };
      await handleLocationSuccess(defaultCoords.lat, defaultCoords.lng, 'City Center');
      setSuccessMsg('📍 Default city center set. Tap map to pin your exact location manually.');
    };

    // Safety Timeout: 8 seconds for watchPosition to lock on
    const watchTimeout = setTimeout(() => {
      if (!isResolved) {
        console.warn('watchPosition 8s safety timeout reached. Retrying with low-accuracy...');
        if (watchId !== null) {
          navigator.geolocation.clearWatch(watchId);
          watchId = null;
        }
        navigator.geolocation.getCurrentPosition(
          (pos) => handleLocationSuccess(pos.coords.latitude, pos.coords.longitude, 'Low-Accuracy GPS'),
          (err) => triggerFallbackStrategy(err?.message || 'Timeout'),
          { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 }
        );
      }
    }, 8000);

    try {
      // Primary Acquisition: watchPosition with maximumAge allowing cached position & active stream lock
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          clearTimeout(watchTimeout);
          handleLocationSuccess(pos.coords.latitude, pos.coords.longitude, 'Device GPS');
        },
        (err) => {
          clearTimeout(watchTimeout);
          console.warn('watchPosition error:', err?.message || err);
          // High-accuracy failed (Code 2 / kCLErrorLocationUnknown): Retry with low-accuracy & maximumAge
          navigator.geolocation.getCurrentPosition(
            (pos) => handleLocationSuccess(pos.coords.latitude, pos.coords.longitude, 'Low-Accuracy GPS'),
            () => triggerFallbackStrategy(err?.message || 'Code 2 Error'),
            { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 }
          );
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    } catch (e) {
      clearTimeout(watchTimeout);
      triggerFallbackStrategy(e?.message);
    }
  };

  // STEP 1 Submit: Save Location to Database on Continue Click & Move to Select Category Page
  const handleStep1LocationSubmit = async () => {
    setError('');
    const targetLat = deviceCoords?.lat || currentUser?.locationCoordinates?.lat;
    const targetLng = deviceCoords?.lng || currentUser?.locationCoordinates?.lng;
    const targetAddr = deviceAddress || currentUser?.address;

    if (!targetLat || !targetLng || !targetAddr) {
      setError('Please click "Allow Location Access" button to extract current position first!');
      return;
    }

    try {
      await saveOnboardingLocation({
        latitude: targetLat,
        longitude: targetLng,
        address: targetAddr,
        city: workCity,
      });
      setStep(2); // Move to Step 2: Select Category Page!
    } catch (err) {
      console.error('Failed to save location to DB:', err);
      setError(err.message || 'Failed to save location to database. Please try again.');
    }
  };

  // STEP 2: Submit Single Selected Service Category and Offered Services
  const handleStep2CategorySubmit = async () => {
    setError('');
    setSuccessMsg('');

    if (!selectedCategories.length && !category) {
      setError('Please click on a service category to proceed');
      toast.error('Please select a service category');
      return;
    }

    try {
      const selectedId = selectedCategories[0] || category;
      const validServiceIds = offeredServices
        .map((s) => (typeof s === 'object' && s?._id ? String(s._id) : String(s)))
        .filter((s) => Boolean(s.match(/^[0-9a-fA-F]{24}$/)));

      const res = await saveOnboardingCategory({
        category: selectedId,
        offeredServices: validServiceIds,
      });

      const updatedUser = res.data?.user || res.user;
      if (updatedUser) {
        updateUser(updatedUser);
      }

      toast.success('✓ Category & Partner Services saved!');
      setShowCategoryServicesModal(false);
      setStep(3); // Go to Step 3: Skills & Experience Page!
    } catch (err) {
      console.error('Save category & services error:', err);
      setError(err.message || 'Failed to save service category');
    }
  };

  // STEP 3: Submit Skills & Experience
  const handleStep3SkillsSubmit = async () => {
    setError('');
    setSuccessMsg('');
    try {
      const validSkillIds = skills.filter((s) => typeof s === 'string' && Boolean(s.match(/^[0-9a-fA-F]{24}$/)));
      await saveOnboardingSkills({ experience, skills: validSkillIds, certifications });
      setStep(4); // Go to Step 4: Service Area Page!
    } catch (err) {
      setError(err.message || 'Failed to save skills and experience');
    }
  };

  // STEP 4: Submit Service Area
  const handleStep4AreaSubmit = async () => {
    setError('');
    setSuccessMsg('');
    try {
      await saveOnboardingServiceArea({ workRadius, localities: selectedLocalities });
      setStep(5); // Go to Step 5: Document Upload Page (LAST STEP)!
      setSubStep('list');
    } catch (err) {
      setError(err.message || 'Failed to save service area');
    }
  };

  // STEP 5: Submit All Attached Documents in Single FormData Request & Complete Onboarding!
  const handleStep5DocsSubmit = async () => {
    setError('');
    setSuccessMsg('');

    const hasAadhaarFront = Boolean(documents.aadhaarFront || documentFiles.aadhaarFront);
    const hasAadhaarBack = Boolean(documents.aadhaarBack || documentFiles.aadhaarBack);
    const hasPan = Boolean(documents.panDoc || documentFiles.panDoc || panNoInput);
    const hasPhoto = Boolean(documents.passportPhoto || documentFiles.passportPhoto || currentUser?.profileImage);
    const hasBank = Boolean(documents.bankPassbookDoc || documentFiles.bankPassbookDoc || bankAccountNoInput);
    const hasDl = Boolean(documents.drivingLicenseDoc || documentFiles.drivingLicenseDoc || dlNoInput);

    if (!hasAadhaarFront || !hasAadhaarBack) {
      const msg = 'Aadhaar Card is required! Please upload both Front Side and Back Side of your Aadhaar Card.';
      setError(msg);
      toast.error(msg);
      return;
    }

    if (!hasPan) {
      const msg = 'PAN Card is required! Please upload your PAN Card document or enter PAN Number.';
      setError(msg);
      toast.error(msg);
      return;
    }

    if (!hasPhoto) {
      const msg = 'Passport Size Photo is required! Please upload a clear photo.';
      setError(msg);
      toast.error(msg);
      return;
    }

    if (!hasBank) {
      const msg = 'Bank Passbook / Cheque is required! Please upload bank document or account details.';
      setError(msg);
      toast.error(msg);
      return;
    }

    if (isDriverCategory && !hasDl) {
      const msg = 'Driving License is REQUIRED for Driver / Delivery partners! Please upload your Driving License.';
      setError(msg);
      toast.error(msg);
      return;
    }

    if (aadhaarNoInput) {
      const cleanAadhaar = aadhaarNoInput.replace(/\D/g, '');
      if (cleanAadhaar.length !== 12 || /^[0-1]/.test(cleanAadhaar)) {
        const msg = 'Please enter a valid 12-digit Aadhaar Card Number (cannot start with 0 or 1).';
        setError(msg);
        toast.error(msg);
        return;
      }
    }

    try {
      const formData = new FormData();
      const keys = Object.keys(documentFiles);
      keys.forEach((key) => {
        if (documentFiles[key]) {
          formData.append(key, documentFiles[key]);
        }
      });

      // Append Document Numbers & Bank Details
      if (aadhaarNoInput) formData.append('aadhaarNo', aadhaarNoInput);
      if (panNoInput) formData.append('panNo', panNoInput);
      if (dlNoInput) formData.append('drivingLicenseNo', dlNoInput);
      if (bankAccountNoInput) formData.append('accountNumber', bankAccountNoInput);
      if (bankIfscInput) formData.append('ifscCode', bankIfscInput);
      if (bankHolderNameInput) formData.append('accountHolderName', bankHolderNameInput);

      setSuccessMsg('Uploading attached documents & verification details... ⏳');
      await saveOnboardingDocuments(formData);

      // Trigger automatic ZOOP verification checks in background if numbers present
      try {
        if (panNoInput && panNoInput.length === 10) {
          kycService.verifyPan(panNoInput).catch(() => {});
        }
        if (bankAccountNoInput && bankIfscInput) {
          kycService.verifyBankAccount({ accountNumber: bankAccountNoInput, ifscCode: bankIfscInput, accountHolderName: bankHolderNameInput }).catch(() => {});
        }
        if (dlNoInput) {
          kycService.verifyDrivingLicense(dlNoInput, dlDobInput).catch(() => {});
        }
      } catch (zErr) {
        console.warn('Background ZOOP verification trigger:', zErr);
      }

      setSuccessMsg('Documents saved! Proceeding to Registration & Fees...');
      setTimeout(() => {
        setStep(6);
        setSubStep('list');
      }, 500);
    } catch (err) {
      console.error('Batch Document Upload Error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to upload documents');
    }
  };

  // Skill Tag Toggle
  const handleToggleSkill = (tag) => {
    if (skills.includes(tag)) {
      setSkills(skills.filter((s) => s !== tag));
    } else {
      setSkills([...skills, tag]);
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
    setSuccessMsg('Applied Monday schedule to all days!');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 50%, #f1f5f9 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '24px 16px',
    }}>
      {/* Outer Card Container */}
      <div style={{
        width: '100%',
        maxWidth: '460px',
        background: '#ffffff',
        borderRadius: '28px',
        boxShadow: '0 20px 50px rgba(15, 23, 42, 0.12), 0 4px 12px rgba(15, 23, 42, 0.04)',
        border: '1px solid rgba(226, 232, 240, 0.8)',
        overflow: 'hidden',
        position: 'relative',
      }}>

        {/* Top Header & Logout */}
        <div style={{
          padding: '18px 24px 14px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #f1f5f9',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={() => {
                setError('');
                if (subStep === 'aadhaar') {
                  setSubStep('list');
                } else if (step > 1) {
                  setStep(step - 1);
                } else {
                  setShowEditProfileModal(true);
                }
              }}
              style={{
                background: '#f1f5f9',
                border: 'none',
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              title="Go back / Edit Profile"
            >
              <ArrowLeft size={16} />
            </button>

            <div>
              <div style={{ fontSize: '0.98rem', fontWeight: '800', color: '#0f172a' }}>
                Partner KYC Setup
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>{currentUser?.name || 'Partner Agency'}</span>
                <button
                  type="button"
                  onClick={() => setShowEditProfileModal(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#2563eb',
                    fontSize: '0.74rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: 0,
                  }}
                >
                  Edit Profile
                </button>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            style={{
              background: '#fef2f2',
              border: 'none',
              color: '#dc2626',
              padding: '6px 12px',
              borderRadius: '10px',
              fontSize: '0.76rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <LogOut size={13} /> Logout
          </button>
        </div>

        {/* Clickable Multi-step Interactive Progress Indicator */}
        <div style={{ padding: '14px 20px 4px 20px' }}>
          <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
            {[
              { id: 1, label: '1. Location' },
              { id: 2, label: '2. Category' },
              { id: 3, label: '3. Experience' },
              { id: 4, label: '4. Area' },
              { id: 5, label: '5. Docs' },
              { id: 6, label: '6. Fees' },
            ].map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setError('');
                  setSubStep('list');
                  setStep(s.id);
                }}
                style={{
                  flex: 1,
                  padding: '5px 1px',
                  borderRadius: '8px',
                  fontSize: '0.68rem',
                  fontWeight: '800',
                  border: step === s.id ? '2px solid #16a34a' : '1px solid #e2e8f0',
                  background: step === s.id ? '#dcfce7' : s.id < step ? '#f0fdf4' : '#ffffff',
                  color: step === s.id ? '#15803d' : s.id < step ? '#16a34a' : '#64748b',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                }}
                title={`Click to jump back to ${s.label}`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div style={{ height: '6px', width: '100%', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${(step / 6) * 100}%`,
              background: 'linear-gradient(90deg, #16a34a 0%, #059669 100%)',
              transition: 'width 0.3s ease',
            }}></div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div style={{ margin: '14px 24px 0 24px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '10px 14px', borderRadius: '12px', fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div style={{ margin: '14px 24px 0 24px', background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '10px 14px', borderRadius: '12px', fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 1: ALLOW LOCATION ACCESS PAGE (location-access) */}
        {/* ============================================================ */}
        {step === 1 && (
          <div style={{ padding: '18px 24px 28px 24px' }}>
            <div style={{ margin: '0 0 16px 0', textAlign: 'center' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: '#dcfce7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 10px auto',
                border: '2px solid #bbf7d0',
                color: '#16a34a',
              }}>
                <NavigationIcon size={28} />
              </div>
              <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                DEVICE GEOLOCATION
              </span>
              <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', margin: '2px 0 0 0' }}>
                Device Location Permission
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.82rem', marginTop: '6px', margin: 0, lineHeight: '1.4' }}>
                Allow location access to detect your current position, show active service coverage on map, and assign nearby customer job dispatches.
              </p>
            </div>

            {/* Interactive Leaflet Map Preview */}
            <InteractiveServiceMap
              city={workCity}
              radiusKm={workRadius}
              coords={deviceCoords}
              onSelectLocation={handleManualMapSelectLocation}
            />

            {/* Detected Location Card or Allow Button */}
            {deviceAddress ? (
              <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', padding: '12px 14px', borderRadius: '14px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.86rem', fontWeight: '800', color: '#15803d', marginBottom: '4px' }}>
                  <MapPin size={16} /> Current Location Detected
                </div>
                <div style={{ fontSize: '0.78rem', color: '#334155', fontWeight: '600' }}>
                  {deviceAddress}
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleAllowLocationAccess}
                disabled={isDetectingGps}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.96rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  boxShadow: '0 8px 20px rgba(22, 163, 74, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginBottom: '20px',
                }}
              >
                {isDetectingGps ? (
                  <>
                    <Loader2 size={18} className="spin" /> Detecting Current GPS Location...
                  </>
                ) : (
                  <>
                    <NavigationIcon size={18} /> Allow Location Access
                  </>
                )}
              </button>
            )}
            <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
              <button
                type="button"
                onClick={() => setShowEditProfileModal(true)}
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: '14px',
                  background: '#f1f5f9',
                  color: '#334155',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <ArrowLeft size={16} /> Edit Profile
              </button>
              <button
                type="button"
                onClick={handleStep1LocationSubmit}
                disabled={isLoggingIn}
                style={{
                  flex: 1.5,
                  padding: '14px',
                  borderRadius: '14px',
                  background: (deviceCoords || deviceAddress || currentUser?.locationCoordinates) ? '#16a34a' : '#94a3b8',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.94rem',
                  fontWeight: '700',
                  cursor: (deviceCoords || deviceAddress || currentUser?.locationCoordinates) ? 'pointer' : 'not-allowed',
                  boxShadow: (deviceCoords || deviceAddress || currentUser?.locationCoordinates) ? '0 8px 20px rgba(22, 163, 74, 0.3)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                Continue <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 2: SELECT SERVICE CATEGORY PAGE (SINGLE SELECT ONLY) */}
        {/* ============================================================ */}
        {step === 2 && (
          <div style={{ padding: '18px 24px 28px 24px' }}>
            <div style={{ margin: '0 0 16px 0' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                Select Category
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.82rem', marginTop: '4px', margin: 0 }}>
                Select your primary service category
              </p>
            </div>

            {/* Search Input */}
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

            {/* Super Admin Active Category Cards Grid (Single-Select Only) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '22px', maxHeight: '320px', overflowY: 'auto' }}>
              {(categoriesList.length > 0 ? categoriesList : [
                { _id: 'cat_ac_repair', name: 'AC & Appliance Repair' },
                { _id: 'cat_cleaning', name: 'Cleaning & Pest Control' },
                { _id: 'cat_plumbing', name: 'Plumbing, Electrical & Carpentry' },
                { _id: 'cat_women_salon', name: 'Salon & Beauty for Women' },
                { _id: 'cat_men_salon', name: "Men's Salon & Grooming" },
                { _id: 'cat_painting', name: 'Home Painting & Decor' },
              ]).filter((c) => c.name.toLowerCase().includes(searchCatQuery.toLowerCase())).map((cat) => {
                const catIdentifier = cat._id || cat.id || cat.name;
                const isSelected = selectedCategories[0] === catIdentifier || selectedCategories[0] === cat.name || category === catIdentifier || category === cat.name;
                return (
                  <div
                    key={catIdentifier}
                    onClick={() => handleSelectCategory(cat)}
                    style={{
                      position: 'relative',
                      padding: '14px 12px',
                      borderRadius: '16px',
                      border: isSelected ? '2px solid #16a34a' : '1.5px solid #e2e8f0',
                      background: isSelected ? '#f0fdf4' : '#ffffff',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.2s',
                      boxShadow: isSelected ? '0 4px 12px rgba(22, 163, 74, 0.15)' : 'none',
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

            <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{ flex: 1, padding: '14px', borderRadius: '14px', background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', fontSize: '0.88rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <ArrowLeft size={16} /> Back
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!selectedCategories.length && !category) {
                    toast.error('Please select a category first');
                    return;
                  }
                  setShowCategoryServicesModal(true);
                }}
                disabled={isLoggingIn || (!selectedCategories.length && !category)}
                style={{ flex: 1.5, padding: '14px', borderRadius: '14px', background: (!selectedCategories.length && !category) ? '#cbd5e1' : '#16a34a', color: '#ffffff', border: 'none', fontSize: '0.94rem', fontWeight: '700', cursor: (!selectedCategories.length && !category) ? 'not-allowed' : 'pointer', boxShadow: '0 8px 20px rgba(22, 163, 74, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                {isLoggingIn ? <Loader2 size={18} className="spin" /> : <>Select Services <ArrowRight size={16} /></>}
              </button>
            </div>

            {/* Category Services Selection Modal / Drawer */}
            {showCategoryServicesModal && (
              <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
                <div style={{ background: '#ffffff', borderRadius: '24px', maxWidth: '480px', width: '100%', padding: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid #e2e8f0', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0f172a', margin: 0 }}>
                        Select Services under {selectedCategoryObj?.name || 'Selected Category'}
                      </h3>
                      <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '4px 0 0 0' }}>
                        Check all specific services/specializations you offer as a partner
                      </p>
                    </div>
                    <button type="button" onClick={() => setShowCategoryServicesModal(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <X size={18} color="#64748b" />
                    </button>
                  </div>

                  {loadingCategoryServices ? (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: '#16a34a', fontWeight: '700' }}>
                      <Loader2 size={24} className="spin" style={{ margin: '0 auto 10px auto', display: 'block' }} />
                      Loading category services...
                    </div>
                  ) : (
                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px', paddingRight: '4px' }}>
                      {categoryServices.length > 0 ? (
                        categoryServices.map((svc) => {
                          const svcId = svc._id || svc.id || svc;
                          const svcName = svc.name || svc;
                          const isSelected = offeredServices.includes(svcId);
                          return (
                            <div
                              key={svcId}
                              onClick={() => handleToggleOfferedService(svcId)}
                              style={{
                                padding: '14px 16px',
                                borderRadius: '16px',
                                border: isSelected ? '2px solid #16a34a' : '1.5px solid #e2e8f0',
                                background: isSelected ? '#f0fdf4' : '#ffffff',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                transition: 'all 0.2s ease',
                              }}
                            >
                              <div>
                                <div style={{ fontSize: '0.92rem', fontWeight: '800', color: isSelected ? '#15803d' : '#0f172a' }}>
                                  {svcName}
                                </div>
                                {svc.description && (
                                  <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                                    {svc.description}
                                  </div>
                                )}
                              </div>
                              <div style={{ width: '22px', height: '22px', borderRadius: '6px', border: isSelected ? 'none' : '2px solid #cbd5e1', background: isSelected ? '#16a34a' : '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {isSelected && <Check size={14} color="#ffffff" />}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#64748b', fontSize: '0.86rem' }}>
                          All services in this category selected for your profile. Click continue to proceed.
                        </div>
                      )}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setShowCategoryServicesModal(false)}
                      style={{ flex: 1, padding: '12px', borderRadius: '12px', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', fontWeight: '700', cursor: 'pointer' }}
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleStep2CategorySubmit}
                      style={{ flex: 2, padding: '12px', borderRadius: '12px', background: '#16a34a', color: '#ffffff', border: 'none', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 14px rgba(22, 163, 74, 0.3)' }}
                    >
                      Save & Continue to Experience →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 3: SKILLS & EXPERIENCE PAGE */}
        {/* ============================================================ */}
        {step === 3 && (
          <div style={{ padding: '18px 24px 28px 24px' }}>
            <div style={{ margin: '0 0 16px 0' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                Experience & Certifications
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.82rem', marginTop: '4px', margin: 0 }}>
                Highlight your experience level & professional certifications
              </p>
            </div>

            {/* Years of Experience */}
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

            {/* Certifications (Optional) */}
            <div style={{ marginBottom: '22px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                Certifications (Optional)
              </label>
              <button
                type="button"
                onClick={() => {
                  setCertTitle('');
                  setCertFile(null);
                  setCertImagePreview('');
                  setShowCertModal(true);
                }}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '14px',
                  border: '2px dashed #bbf7d0',
                  background: '#f0fdf4',
                  color: '#16a34a',
                  fontWeight: '800',
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(22, 163, 74, 0.08)',
                }}
              >
                <Plus size={18} color="#16a34a" /> Add Professional Certificate
              </button>

              {/* Display Added Certifications List */}
              {certifications.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
                  {certifications.map((cert, idx) => {
                    const title = typeof cert === 'object' ? (cert.title || cert.name || 'Professional Certificate') : cert;
                    const imgUrl = typeof cert === 'object' ? (cert.image || cert.url) : null;
                    return (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: '#f8fafc',
                          border: '1.5px solid #e2e8f0',
                          borderRadius: '14px',
                          padding: '10px 14px',
                          gap: '12px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                          {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt={title}
                              style={{ width: '46px', height: '46px', borderRadius: '10px', objectFit: 'cover', border: '1px solid #cbd5e1' }}
                            />
                          ) : (
                            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Award size={22} />
                            </div>
                          )}
                          <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontSize: '0.86rem', fontWeight: '800', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {title}
                            </div>
                            <div style={{ fontSize: '0.74rem', color: '#16a34a', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                              <CheckCircle2 size={12} /> Certificate Attached
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveCertificate(idx)}
                          style={{
                            background: '#fee2e2',
                            color: '#ef4444',
                            border: 'none',
                            borderRadius: '50%',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            flexShrink: 0,
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
              <button
                type="button"
                onClick={() => setStep(2)}
                style={{ flex: 1, padding: '14px', borderRadius: '14px', background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', fontSize: '0.88rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <ArrowLeft size={16} /> Back
              </button>
              <button
                type="button"
                onClick={handleStep3SkillsSubmit}
                disabled={isLoggingIn}
                style={{ flex: 1.5, padding: '14px', borderRadius: '14px', background: '#16a34a', color: '#ffffff', border: 'none', fontSize: '0.94rem', fontWeight: '700', cursor: 'pointer', boxShadow: '0 8px 20px rgba(22, 163, 74, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                {isLoggingIn ? <Loader2 size={18} className="spin" /> : <>Continue <ArrowRight size={16} /></>}
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 4: SERVICE AREA SELECTION PAGE */}
        {/* ============================================================ */}
        {step === 4 && (
          <div style={{ padding: '18px 24px 28px 24px' }}>
            <div style={{ margin: '0 0 16px 0' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                Service Area
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.82rem', marginTop: '4px', margin: 0 }}>
                Set your operating radius in {workCity}
              </p>
            </div>

            {/* Interactive Leaflet Map with Real-time Dynamic Circle Radius Overlay centered on Current Position */}
            <InteractiveServiceMap
              city={workCity}
              radiusKm={workRadius}
              coords={deviceCoords || currentUser?.locationCoordinates}
              onSelectLocation={handleManualMapSelectLocation}
            />

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
                onChange={(e) => {
                  const newRad = Number(e.target.value);
                  setWorkRadius(newRad);
                  const coordsObj = deviceCoords || currentUser?.locationCoordinates;
                  if (coordsObj?.lat && coordsObj?.lng) {
                    fetchLocalitiesForRadius(coordsObj.lat, coordsObj.lng, newRad);
                  }
                }}
                style={{ width: '100%', accentColor: '#16a34a', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>
                <span>2 km</span>
                <span>12 km</span>
                <span>25 km</span>
              </div>
            </div>

            {/* Available Localities (Customise) Real Data */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', margin: 0 }}>
                  Available Localities (Customise)
                </label>
                <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {loadingNearbyLocs ? (
                    <>
                      <Loader2 size={12} className="spin" /> Updating radius localities...
                    </>
                  ) : (
                    <>📍 {dynamicNearbyLocalities.length} localities in {workRadius} km radius</>
                  )}
                </span>
              </div>

              {/* Add Custom Locality Input */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <input
                  type="text"
                  placeholder="+ Add custom nearby locality..."
                  value={customLocalityInput}
                  onChange={(e) => setCustomLocalityInput(e.target.value)}
                  style={{ flex: 1, padding: '8px 12px', borderRadius: '10px', border: '1.5px dashed #bbf7d0', background: '#f0fdf4', fontSize: '0.84rem', outline: 'none' }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customLocalityInput.trim()) {
                      const newLoc = customLocalityInput.trim();
                      if (!selectedLocalities.includes(newLoc)) {
                        setSelectedLocalities([newLoc, ...selectedLocalities]);
                      }
                      setCustomLocalityInput('');
                    }
                  }}
                  style={{ padding: '8px 12px', borderRadius: '10px', background: '#16a34a', color: '#ffffff', border: 'none', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer' }}
                >
                  + Add
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                {Array.from(new Set([
                  ...dynamicNearbyLocalities,
                  ...selectedLocalities,
                  ...(dynamicNearbyLocalities.length === 0 ? (REAL_LOCALITIES_BY_CITY[displayCityName] || []) : []),
                ]))
                  .map((loc) => {
                    const isChecked = selectedLocalities.includes(loc);
                    const isNearby = dynamicNearbyLocalities.includes(loc);
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
                        <span>
                          📍 {loc} {isNearby && <span style={{ marginLeft: '6px', fontSize: '0.7rem', background: '#dcfce7', color: '#15803d', padding: '2px 6px', borderRadius: '6px', fontWeight: '700' }}>Your Location</span>}
                        </span>
                        <input type="checkbox" checked={isChecked} onChange={() => { }} style={{ accentColor: '#16a34a' }} />
                      </div>
                    );
                  })}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
              <button
                type="button"
                onClick={() => setStep(3)}
                style={{ flex: 1, padding: '14px', borderRadius: '14px', background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', fontSize: '0.88rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <ArrowLeft size={16} /> Back
              </button>
              <button
                type="button"
                onClick={handleStep4AreaSubmit}
                disabled={isLoggingIn}
                style={{ flex: 1.5, padding: '14px', borderRadius: '14px', background: '#16a34a', color: '#ffffff', border: 'none', fontSize: '0.94rem', fontWeight: '700', cursor: 'pointer', boxShadow: '0 8px 20px rgba(22, 163, 74, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                {isLoggingIn ? <Loader2 size={18} className="spin" /> : <>Continue <ArrowRight size={16} /></>}
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 5A: UPLOAD DOCUMENTS LIST PAGE (LAST STEP BEFORE DONE) */}
        {/* ============================================================ */}
        {step === 5 && subStep === 'list' && (
          <div style={{ padding: '18px 24px 28px 24px' }}>
            <div style={{ margin: '0 0 16px 0' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                IDENTITY VERIFICATION (LAST STEP)
              </span>
              <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', margin: '2px 0 0 0' }}>
                Upload Documents
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.82rem', marginTop: '4px', margin: 0 }}>
                Please upload clear photos of original government documents for instant partner registration approval
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '22px' }}>

              {/* 1. Aadhaar Card (Required) */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: '14px', border: (documents.aadhaarFront && documents.aadhaarBack) ? '1.5px solid #16a34a' : '1.5px solid #cbd5e1', background: (documents.aadhaarFront && documents.aadhaarBack) ? '#f0fdf4' : '#ffffff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: (documents.aadhaarFront && documents.aadhaarBack) ? '#dcfce7' : '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShieldCheck size={20} color={(documents.aadhaarFront && documents.aadhaarBack) ? '#16a34a' : '#ef4444'} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0f172a' }}>
                      Aadhaar Card (Front & Back) <span style={{ color: '#ef4444', fontWeight: '800' }}>* Required</span>
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>JPEG or PNG up to 5MB</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSubStep('aadhaar')}
                  style={{ padding: '6px 14px', borderRadius: '20px', border: (documents.aadhaarFront && documents.aadhaarBack) ? 'none' : '1px solid #16a34a', background: (documents.aadhaarFront && documents.aadhaarBack) ? '#16a34a' : '#ffffff', color: (documents.aadhaarFront && documents.aadhaarBack) ? '#ffffff' : '#16a34a', fontWeight: '700', fontSize: '0.78rem', cursor: 'pointer' }}
                >
                  {(documents.aadhaarFront && documents.aadhaarBack) ? 'Uploaded ✓' : 'Upload *'}
                </button>
              </div>

              {/* 2. Driving License (Optional unless Driver category) */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: '14px', border: documents.drivingLicenseDoc ? '1.5px solid #16a34a' : isDriverCategory ? '1.5px solid #ef4444' : '1.5px solid #e2e8f0', background: documents.drivingLicenseDoc ? '#f0fdf4' : isDriverCategory ? '#fef2f2' : '#f8fafc' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: documents.drivingLicenseDoc ? '#dcfce7' : isDriverCategory ? '#fee2e2' : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={20} color={documents.drivingLicenseDoc ? '#16a34a' : isDriverCategory ? '#ef4444' : '#64748b'} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0f172a' }}>
                      Driving License {isDriverCategory ? <span style={{ color: '#ef4444', fontWeight: '800' }}>* Required (Driver Category)</span> : <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: '500' }}>(Optional)</span>}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>JPEG or PNG up to 5MB</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { setActiveGenericDoc('drivingLicenseDoc'); setShowGenericModal(true); }}
                  style={{ padding: '6px 14px', borderRadius: '20px', border: documents.drivingLicenseDoc ? 'none' : '1px solid #16a34a', background: documents.drivingLicenseDoc ? '#16a34a' : '#ffffff', color: documents.drivingLicenseDoc ? '#ffffff' : '#16a34a', fontWeight: '700', fontSize: '0.78rem', cursor: 'pointer' }}
                >
                  {documents.drivingLicenseDoc ? 'Uploaded ✓' : isDriverCategory ? 'Upload *' : 'Upload'}
                </button>
              </div>

              {/* 3. PAN Card (Required) */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: '14px', border: documents.panDoc ? '1.5px solid #16a34a' : '1.5px solid #cbd5e1', background: documents.panDoc ? '#f0fdf4' : '#ffffff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: documents.panDoc ? '#dcfce7' : '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CreditCard size={20} color={documents.panDoc ? '#16a34a' : '#ef4444'} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0f172a' }}>
                      PAN Card <span style={{ color: '#ef4444', fontWeight: '800' }}>* Required</span>
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Required for tax & payout verification</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { setActiveGenericDoc('panDoc'); setShowGenericModal(true); }}
                  style={{ padding: '6px 14px', borderRadius: '20px', border: documents.panDoc ? 'none' : '1px solid #16a34a', background: documents.panDoc ? '#16a34a' : '#ffffff', color: documents.panDoc ? '#ffffff' : '#16a34a', fontWeight: '700', fontSize: '0.78rem', cursor: 'pointer' }}
                >
                  {documents.panDoc ? 'Uploaded ✓' : 'Upload *'}
                </button>
              </div>

              {/* 4. Passport Size Photo (Required) */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: '14px', border: documents.passportPhoto ? '1.5px solid #16a34a' : '1.5px solid #cbd5e1', background: documents.passportPhoto ? '#f0fdf4' : '#ffffff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: documents.passportPhoto ? '#dcfce7' : '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={20} color={documents.passportPhoto ? '#16a34a' : '#ef4444'} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0f172a' }}>
                      Passport Size Photo <span style={{ color: '#ef4444', fontWeight: '800' }}>* Required</span>
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Clear face photo for ID Card</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { setActiveGenericDoc('passportPhoto'); setShowGenericModal(true); }}
                  style={{ padding: '6px 14px', borderRadius: '20px', border: documents.passportPhoto ? 'none' : '1px solid #16a34a', background: documents.passportPhoto ? '#16a34a' : '#ffffff', color: documents.passportPhoto ? '#ffffff' : '#16a34a', fontWeight: '700', fontSize: '0.78rem', cursor: 'pointer' }}
                >
                  {documents.passportPhoto ? 'Uploaded ✓' : 'Upload *'}
                </button>
              </div>

              {/* 5. Bank Passbook / Cheque (Required) */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: '14px', border: documents.bankPassbookDoc ? '1.5px solid #16a34a' : '1.5px solid #cbd5e1', background: documents.bankPassbookDoc ? '#f0fdf4' : '#ffffff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: documents.bankPassbookDoc ? '#dcfce7' : '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Building size={20} color={documents.bankPassbookDoc ? '#16a34a' : '#ef4444'} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0f172a' }}>
                      Bank Passbook / Cheque <span style={{ color: '#ef4444', fontWeight: '800' }}>* Required</span>
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>For directly transferring payouts</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { setActiveGenericDoc('bankPassbookDoc'); setShowGenericModal(true); }}
                  style={{ padding: '6px 14px', borderRadius: '20px', border: documents.bankPassbookDoc ? 'none' : '1px solid #16a34a', background: documents.bankPassbookDoc ? '#16a34a' : '#ffffff', color: documents.bankPassbookDoc ? '#ffffff' : '#16a34a', fontWeight: '700', fontSize: '0.78rem', cursor: 'pointer' }}
                >
                  {documents.bankPassbookDoc ? 'Uploaded ✓' : 'Upload *'}
                </button>
              </div>

            </div>

            {/* GENERIC SINGLE DOC UPLOAD MODAL */}
            {showGenericModal && (
              <div style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(15, 23, 42, 0.65)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                padding: '16px',
              }}>
                <div style={{
                  width: '100%',
                  maxWidth: '380px',
                  background: '#ffffff',
                  borderRadius: '24px',
                  padding: '22px',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                      Upload {activeGenericDoc === 'panDoc' ? 'PAN Card' : activeGenericDoc === 'passportPhoto' ? 'Passport Photo' : activeGenericDoc === 'drivingLicenseDoc' ? 'Driving License' : 'Bank Passbook'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowGenericModal(false)}
                      style={{ background: '#f1f5f9', border: 'none', width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer', fontWeight: '700' }}
                    >
                      ✕
                    </button>
                  </div>

                  {/* DOCUMENT SPECIFIC DETAILS INPUT FIELDS */}
                  {activeGenericDoc === 'panDoc' && (
                    <div style={{ marginBottom: '14px' }}>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                        PAN Card Number (10 Characters)
                      </label>
                      <input
                        type="text"
                        placeholder="Enter 10-digit PAN (e.g. ABCDE1234F)"
                        maxLength={10}
                        value={panNoInput}
                        onChange={(e) => setPanNoInput(e.target.value.toUpperCase())}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.86rem', outline: 'none', textTransform: 'uppercase' }}
                      />
                    </div>
                  )}

                  {activeGenericDoc === 'drivingLicenseDoc' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                          Driving Licence Number
                        </label>
                        <input
                          type="text"
                          placeholder="DL Number (e.g. DL-1420210089123)"
                          value={dlNoInput}
                          onChange={(e) => setDlNoInput(e.target.value.toUpperCase())}
                          style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.86rem', outline: 'none' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                          Date of Birth (DOB)
                        </label>
                        <input
                          type="date"
                          value={dlDobInput}
                          onChange={(e) => setDlDobInput(e.target.value)}
                          style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.86rem', outline: 'none' }}
                        />
                      </div>
                    </div>
                  )}

                  {activeGenericDoc === 'bankPassbookDoc' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                          Bank Account Number
                        </label>
                        <input
                          type="text"
                          placeholder="Enter Account Number"
                          value={bankAccountNoInput}
                          onChange={(e) => setBankAccountNoInput(e.target.value)}
                          style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.86rem', outline: 'none' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                          Bank IFSC Code
                        </label>
                        <input
                          type="text"
                          placeholder="Enter IFSC Code (e.g. HDFC0001234)"
                          value={bankIfscInput}
                          onChange={(e) => setBankIfscInput(e.target.value.toUpperCase())}
                          style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.86rem', outline: 'none', textTransform: 'uppercase' }}
                        />
                      </div>
                    </div>
                  )}

                  <label htmlFor="generic-doc-file" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '140px',
                    borderRadius: '16px',
                    border: documents[activeGenericDoc] ? '2px solid #16a34a' : '2px dashed #bbf7d0',
                    background: documents[activeGenericDoc] ? '#f0fdf4' : '#f8fafc',
                    cursor: 'pointer',
                    padding: '14px',
                    textAlign: 'center',
                    marginBottom: '16px',
                  }}>
                    {documents[activeGenericDoc] ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={32} color="#16a34a" />
                        <span style={{ fontSize: '0.86rem', fontWeight: '700', color: '#15803d' }}>Document Uploaded! ✓</span>
                        <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Tap to change file</span>
                      </div>
                    ) : (
                      <>
                        <Upload size={30} color="#16a34a" style={{ marginBottom: '6px' }} />
                        <span style={{ fontSize: '0.88rem', fontWeight: '700', color: '#16a34a' }}>Tap to select file / photo</span>
                        <span style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '2px' }}>JPG, PNG or PDF (max 5MB)</span>
                      </>
                    )}
                    <input
                      id="generic-doc-file"
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => handleDocumentFileSelect(activeGenericDoc, e.target.files?.[0])}
                      style={{ display: 'none' }}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => setShowGenericModal(false)}
                    style={{ width: '100%', padding: '12px', borderRadius: '12px', background: '#16a34a', color: '#ffffff', border: 'none', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer' }}
                  >
                    Done & Save Document
                  </button>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
              <button
                type="button"
                onClick={() => setStep(4)}
                style={{ flex: 1, padding: '14px', borderRadius: '14px', background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', fontSize: '0.88rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <ArrowLeft size={16} /> Back
              </button>
              <button
                type="button"
                onClick={handleStep5DocsSubmit}
                disabled={isLoggingIn}
                style={{ flex: 1.5, padding: '14px', borderRadius: '14px', background: '#16a34a', color: '#ffffff', border: 'none', fontSize: '0.94rem', fontWeight: '700', cursor: 'pointer', boxShadow: '0 8px 20px rgba(22, 163, 74, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                {isLoggingIn ? <Loader2 size={18} className="spin" /> : <>Submit & Complete 🎉</>}
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 5B: UPLOAD AADHAAR CARD PAGE (upload-aadhaar-card) */}
        {/* ============================================================ */}
        {step === 5 && subStep === 'aadhaar' && (
          <div style={{ padding: '18px 24px 28px 24px' }}>
            <div style={{ margin: '0 0 16px 0' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                Upload Aadhaar Card
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.82rem', marginTop: '4px', margin: 0 }}>
                Upload clear photos of both sides of your Aadhaar Card for identity verification.
              </p>
            </div>

            {/* 12-digit Aadhaar Number Input Field */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                Aadhaar Card Number (12 Digits)
              </label>
              <input
                type="text"
                placeholder="Enter 12-digit Aadhaar Number (e.g. 1234 5678 9012)"
                maxLength={12}
                value={aadhaarNoInput}
                onChange={(e) => setAadhaarNoInput(e.target.value.replace(/\D/g, ''))}
                style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', background: '#ffffff', fontWeight: '600' }}
              />
            </div>

            {/* Front Side Upload Drop Box */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.84rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                Front Side
              </div>
              <label htmlFor="aadhaar-front-file" style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '130px',
                borderRadius: '16px',
                border: documents.aadhaarFront ? '2px solid #16a34a' : '2px dashed #bbf7d0',
                background: documents.aadhaarFront ? '#f0fdf4' : '#f8fafc',
                cursor: 'pointer',
                padding: '14px',
                textAlign: 'center',
              }}>
                {documents.aadhaarFront ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={30} color="#16a34a" />
                    <span style={{ fontSize: '0.84rem', fontWeight: '700', color: '#15803d' }}>Front Side Uploaded! ✓</span>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Tap to change photo</span>
                  </div>
                ) : (
                  <>
                    <Upload size={26} color="#16a34a" style={{ marginBottom: '6px' }} />
                    <span style={{ fontSize: '0.86rem', fontWeight: '700', color: '#16a34a' }}>Tap to upload front side</span>
                    <span style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '2px' }}>JPG, PNG or PDF (max 5MB)</span>
                  </>
                )}
                <input
                  id="aadhaar-front-file"
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => handleDocumentFileSelect('aadhaarFront', e.target.files?.[0])}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            {/* Back Side Upload Drop Box */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ fontSize: '0.84rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                Back Side
              </div>
              <label htmlFor="aadhaar-back-file" style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '130px',
                borderRadius: '16px',
                border: documents.aadhaarBack ? '2px solid #16a34a' : '2px dashed #bbf7d0',
                background: documents.aadhaarBack ? '#f0fdf4' : '#f8fafc',
                cursor: 'pointer',
                padding: '14px',
                textAlign: 'center',
              }}>
                {documents.aadhaarBack ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={30} color="#16a34a" />
                    <span style={{ fontSize: '0.84rem', fontWeight: '700', color: '#15803d' }}>Back Side Uploaded! ✓</span>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Tap to change photo</span>
                  </div>
                ) : (
                  <>
                    <Upload size={26} color="#16a34a" style={{ marginBottom: '6px' }} />
                    <span style={{ fontSize: '0.86rem', fontWeight: '700', color: '#16a34a' }}>Tap to upload back side</span>
                    <span style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '2px' }}>JPG, PNG or PDF (max 5MB)</span>
                  </>
                )}
                <input
                  id="aadhaar-back-file"
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => handleDocumentFileSelect('aadhaarBack', e.target.files?.[0])}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            {/* Document Guidelines Box */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px 14px', borderRadius: '14px', fontSize: '0.78rem', color: '#475569', marginBottom: '22px' }}>
              <div style={{ fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>📌 Guidelines</div>
              • Make sure all details are clearly visible<br />
              • Avoid blurry or cropped images<br />
              • File size should be under 5MB
            </div>

            <button
              type="button"
              onClick={() => setSubStep('list')}
              style={{ width: '100%', padding: '14px', borderRadius: '14px', background: '#16a34a', color: '#ffffff', border: 'none', fontSize: '0.98rem', fontWeight: '700', cursor: 'pointer', boxShadow: '0 8px 20px rgba(22, 163, 74, 0.3)' }}
            >
              Continue
            </button>
          </div>
        )}

        {/* STEP 6: REGISTRATION & FEES (ONE-TIME ONBOARDING FEE) */}
        {step === 6 && (
          <div style={{ padding: '24px' }}>
            
            {/* Green Top Progress Bar Line */}
            <div style={{ height: '4px', width: '100%', background: '#16a34a', borderRadius: '4px', marginBottom: '20px' }} />

            {/* Title & Fee Header */}
            <div style={{ textAlign: 'center', marginBottom: '22px' }}>
              <div style={{
                display: 'inline-block',
                background: '#f0fdf4',
                color: '#16a34a',
                border: '1px solid #bbf7d0',
                padding: '6px 16px',
                borderRadius: '20px',
                fontSize: '0.74rem',
                fontWeight: '800',
                letterSpacing: '0.6px',
                marginBottom: '10px'
              }}>
                ONE-TIME ONBOARDING FEE
              </div>
              <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#0f172a', margin: '4px 0 6px 0', letterSpacing: '-0.5px' }}>
                ₹{onboardingFeeInfo.totalAmount || 999}
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.84rem', margin: 0, lineHeight: '1.45', padding: '0 8px' }}>
                Pay once to fully activate your partner account and start receiving local high-paying jobs.
              </p>
            </div>

            {/* What is included Card */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '20px',
              padding: '18px 20px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)',
              marginBottom: '18px'
            }}>
              <div style={{ fontSize: '0.92rem', fontWeight: '800', color: '#0f172a', marginBottom: '14px' }}>
                What is included:
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ background: '#dcfce7', borderRadius: '50%', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '2px' }}>
                    <CheckCircle2 size={16} color="#16a34a" />
                  </div>
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '0.86rem', color: '#0f172a' }}>
                      Background & Document Verification
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px', lineHeight: '1.35' }}>
                      Secure background check and government database verification.
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ background: '#dcfce7', borderRadius: '50%', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '2px' }}>
                    <CheckCircle2 size={16} color="#16a34a" />
                  </div>
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '0.86rem', color: '#0f172a' }}>
                      Professional Skill Certification
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px', lineHeight: '1.35' }}>
                      Digital badge and service certificate to boost customer trust.
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ background: '#dcfce7', borderRadius: '50%', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '2px' }}>
                    <CheckCircle2 size={16} color="#16a34a" />
                  </div>
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '0.86rem', color: '#0f172a' }}>
                      Partner Training & Support
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px', lineHeight: '1.35' }}>
                      Access to training modules and priority 24/7 partner support.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Billing Summary Box */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '20px',
              padding: '18px 20px',
              marginBottom: '20px'
            }}>
              <div style={{ fontSize: '0.92rem', fontWeight: '800', color: '#0f172a', marginBottom: '12px' }}>
                Billing Summary
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', color: '#64748b', marginBottom: '8px' }}>
                <span>Base Registration Fee</span>
                <span style={{ fontWeight: '700', color: '#334155' }}>₹{onboardingFeeInfo.baseRegistrationFee || '846.61'}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', color: '#64748b', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px dashed #cbd5e1' }}>
                <span>GST (18%)</span>
                <span style={{ fontWeight: '700', color: '#334155' }}>₹{onboardingFeeInfo.gstAmount || '152.39'}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', fontWeight: '900', color: '#0f172a' }}>
                <span>Total Amount</span>
                <span style={{ color: '#16a34a' }}>₹{onboardingFeeInfo.totalAmount || 999}.00</span>
              </div>
            </div>

            {/* Refundable Policy Badge Indicator */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontSize: '0.78rem',
              color: '#16a34a',
              fontWeight: '700',
              marginBottom: '22px'
            }}>
              <ShieldCheck size={16} color="#16a34a" /> Safe & Secure Refundable Payment Process
            </div>

            {/* Action Button */}
            <button
              type="button"
              onClick={() => setShowPaymentModal(true)}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                color: '#ffffff',
                border: 'none',
                fontSize: '1.05rem',
                fontWeight: '900',
                cursor: 'pointer',
                boxShadow: '0 8px 22px rgba(22, 163, 74, 0.35)',
                transition: 'transform 0.15s ease',
              }}
            >
              Continue to Payment
            </button>
          </div>
        )}

        {/* PAYMENT CHECKOUT MODAL FOR ONBOARDING FEE */}
        {showPaymentModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}>
            <div style={{
              width: '100%',
              maxWidth: '440px',
              background: '#ffffff',
              borderRadius: '24px',
              padding: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                  Complete Account Registration
                </h3>
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  style={{ background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontWeight: '700' }}
                >
                  ✕
                </button>
              </div>

              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '16px', padding: '14px', marginBottom: '18px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.78rem', color: '#15803d', fontWeight: '700' }}>Amount Payable</div>
                <div style={{ fontSize: '2rem', fontWeight: '900', color: '#16a34a' }}>₹{onboardingFeeInfo.totalAmount || 999}</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>One-Time Onboarding Fee (Incl. 18% GST)</div>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '800', color: '#334155', marginBottom: '8px' }}>
                  Select Payment Option
                </label>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {['UPI (GPay / PhonePe / Paytm)', 'Debit / Credit Card', 'Net Banking / Wallet'].map((method) => (
                    <div
                      key={method}
                      onClick={() => setSelectedPaymentMethod(method)}
                      style={{
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: selectedPaymentMethod === method ? '2px solid #16a34a' : '1.5px solid #cbd5e1',
                        background: selectedPaymentMethod === method ? '#f0fdf4' : '#ffffff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontWeight: '700',
                        fontSize: '0.88rem',
                        color: selectedPaymentMethod === method ? '#15803d' : '#334155',
                      }}
                    >
                      <span>{method}</span>
                      <div style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        border: selectedPaymentMethod === method ? '6px solid #16a34a' : '2px solid #94a3b8',
                      }} />
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={async () => {
                  setProcessingFeePayment(true);
                  try {
                    await payOnboardingFee({ paymentMethod: selectedPaymentMethod });
                    setShowPaymentModal(false);
                    toast.success('🎉 Registration fee paid successfully!');
                    setTimeout(() => {
                      if (onFinishOnboarding) onFinishOnboarding();
                    }, 800);
                  } catch (pErr) {
                    toast.error(pErr.message || 'Payment processing failed');
                  } finally {
                    setProcessingFeePayment(false);
                  }
                }}
                disabled={processingFeePayment}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: '800',
                  fontSize: '0.96rem',
                  cursor: processingFeePayment ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 14px rgba(22, 163, 74, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                {processingFeePayment ? (
                  <>
                    <Loader2 size={18} className="spin" color="#ffffff" />
                    Processing Payment...
                  </>
                ) : (
                  `Pay ₹${onboardingFeeInfo.totalAmount || 999} & Complete Registration`
                )}
              </button>
            </div>
          </div>
        )}

        {/* EDIT PROFILE DETAILS MODAL */}
        {showEditProfileModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}>
            <div style={{
              width: '100%',
              maxWidth: '420px',
              background: '#ffffff',
              borderRadius: '24px',
              padding: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                  Edit Profile Details
                </h3>
                <button
                  type="button"
                  onClick={() => setShowEditProfileModal(false)}
                  style={{ background: '#f1f5f9', border: 'none', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', fontWeight: '700' }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveProfileEdit}>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    Full Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Enter full name"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '12px', border: '1.5px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                    required
                  />
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    Email Address <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="name@domain.com"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '12px', border: '1.5px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                      Date of Birth <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="date"
                      value={editDob}
                      onChange={(e) => setEditDob(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '12px', border: '1.5px solid #cbd5e1', fontSize: '0.86rem', outline: 'none' }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                      Gender <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <select
                      value={editGender}
                      onChange={(e) => setEditGender(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '12px', border: '1.5px solid #cbd5e1', fontSize: '0.86rem', outline: 'none', background: '#ffffff' }}
                      required
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                    Assigned City <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '12px', border: '1.5px solid #cbd5e1', fontSize: '0.86rem', outline: 'none', background: '#ffffff' }}
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

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setShowEditProfileModal(false)}
                    style={{ flex: 1, padding: '12px', borderRadius: '12px', background: '#f1f5f9', color: '#334155', border: 'none', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingProfile}
                    style={{ flex: 1.5, padding: '12px', borderRadius: '12px', background: '#16a34a', color: '#ffffff', border: 'none', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer' }}
                  >
                    {savingProfile ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ADD PROFESSIONAL CERTIFICATE MODAL (Screen 3 in User Mockup) */}
        {showCertModal && (
          <div className="modal-overlay" onClick={() => setShowCertModal(false)} style={{ zIndex: 3000 }}>
            <div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '480px', width: '92%', padding: '24px', borderRadius: '24px', background: '#ffffff' }}
            >
              {/* Modal Header Bar with Back Arrow */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowCertModal(false)}
                  style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <ArrowLeft size={18} color="#0f172a" />
                </button>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                  Add Professional Certificate
                </h3>
              </div>

              {/* Green Progress Line Indicator */}
              <div style={{ height: '4px', width: '100%', background: '#16a34a', borderRadius: '4px', marginBottom: '14px' }} />

              <p style={{ color: '#64748b', fontSize: '0.82rem', marginTop: 0, marginBottom: '18px', lineHeight: '1.4' }}>
                Upload your professional certificates for verification and credibility.
              </p>

              {/* Certificate Title Field */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  Certificate Name / Title (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. AC Repair Master Certification"
                  value={certTitle}
                  onChange={(e) => setCertTitle(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', background: '#f8fafc' }}
                />
              </div>

              {/* Certificate Dropzone / Photo Box */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  Certificate Document / Photo
                </label>

                {certImagePreview ? (
                  <div style={{ position: 'relative', width: '100%', height: '190px', borderRadius: '16px', overflow: 'hidden', border: '2px solid #bbf7d0', background: '#0f172a' }}>
                    <img src={certImagePreview} alt="Certificate preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    <div style={{ position: 'absolute', bottom: '10px', right: '10px', display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => certFileInputRef.current?.click()}
                        style={{ background: '#16a34a', color: '#ffffff', border: 'none', padding: '6px 12px', borderRadius: '10px', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer' }}
                      >
                        Change Photo
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCertFile(null);
                          setCertImagePreview('');
                        }}
                        style={{ background: '#ef4444', color: '#ffffff', border: 'none', padding: '6px 12px', borderRadius: '10px', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer' }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => certFileInputRef.current?.click()}
                    style={{
                      border: '2px dashed #86efac',
                      background: '#f0fdf4',
                      borderRadius: '16px',
                      padding: '28px 16px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div
                      style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '50%',
                        background: '#dcfce7',
                        color: '#16a34a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 10px auto',
                        border: '1.5px solid #bbf7d0',
                      }}
                    >
                      <Upload size={24} color="#16a34a" />
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#16a34a' }}>
                      Tap to upload certificate
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '4px' }}>
                      JPG, PNG or PDF (max 5MB)
                    </div>
                  </div>
                )}

                <input
                  ref={certFileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  style={{ display: 'none' }}
                  onChange={handleCertFileSelect}
                />
              </div>

              {/* Guidelines Section (Exact Match to Mockup) */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '14px', marginBottom: '22px' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#334155', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  📋 Guidelines
                </div>
                <ul style={{ margin: 0, paddingLeft: '18px', color: '#64748b', fontSize: '0.78rem', lineHeight: '1.6' }}>
                  <li>Ensure the certificate is clearly legible</li>
                  <li>Upload only valid and recognized certificates</li>
                  <li>File size should be under 5MB</li>
                </ul>
              </div>

              {/* Submit / Continue Button */}
              <button
                type="button"
                onClick={handleSaveCertificateModal}
                disabled={uploadingCert}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: '800',
                  fontSize: '0.95rem',
                  cursor: uploadingCert ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 14px rgba(22, 163, 74, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  opacity: uploadingCert ? 0.75 : 1,
                }}
              >
                {uploadingCert ? (
                  <>
                    <Loader2 size={18} className="spin" color="#ffffff" />
                    Uploading Certificate...
                  </>
                ) : (
                  'Continue'
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default PartnerOnboardingPage;
