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
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { catalogService } from '../services/catalog.service.js';
import { cityService } from '../services/city.service.js';
import { toast } from '../utils/toast.js';

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

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [activeLat, activeLng],
        zoom: coords?.lat ? 14 : defaultCityCoords.zoom,
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
      }).addTo(map);

      const circle = L.circle([activeLat, activeLng], {
        color: '#16a34a',
        fillColor: '#22c55e',
        fillOpacity: 0.25,
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
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [city]);

  // Update map view & marker pin in real-time when coords change
  useEffect(() => {
    if (coords?.lat && coords?.lng && mapInstanceRef.current) {
      const cLat = Number(coords.lat);
      const cLng = Number(coords.lng);
      mapInstanceRef.current.setView([cLat, cLng], 14);
      if (markerInstanceRef.current) {
        markerInstanceRef.current.setLatLng([cLat, cLng]);
        markerInstanceRef.current.bindPopup(`<b>Selected Position</b><br>Lat: ${cLat.toFixed(4)}, Lng: ${cLng.toFixed(4)}`).openPopup();
      }
      if (circleInstanceRef.current) {
        circleInstanceRef.current.setLatLng([cLat, cLng]);
      }
    }
  }, [coords?.lat, coords?.lng]);

  // Update dynamic circle radius in real-time when slider moves
  useEffect(() => {
    if (circleInstanceRef.current) {
      circleInstanceRef.current.setRadius(radiusKm * 1000);
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.fitBounds(circleInstanceRef.current.getBounds(), { padding: [20, 20] });
        } catch {
          // ignore map fitBounds exception if unmounted
        }
      }
    }
  }, [radiusKm]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '210px', borderRadius: '18px', overflow: 'hidden', border: '2px solid #bbf7d0', boxShadow: '0 4px 14px rgba(22, 163, 74, 0.12)', marginBottom: '18px' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%', zIndex: 1, cursor: 'crosshair' }} />
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '12px',
        background: 'rgba(15, 23, 42, 0.75)',
        color: '#ffffff',
        backdropFilter: 'blur(6px)',
        padding: '5px 10px',
        borderRadius: '20px',
        fontSize: '0.7rem',
        fontWeight: '700',
        zIndex: 10,
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        📍 Tap map to select location manually
      </div>
      <div style={{
        position: 'absolute',
        top: '12px',
        right: '12px',
        background: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(6px)',
        padding: '6px 12px',
        borderRadius: '12px',
        fontSize: '0.78rem',
        fontWeight: '800',
        color: '#15803d',
        border: '1px solid #bbf7d0',
        zIndex: 1000,
        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
      }}>
        📍 Active Coverage: {radiusKm} km
      </div>
    </div>
  );
};

// Helper to calculate exact onboarding step based on currentUser DB progress
const getInitialStepFromUser = (user) => {
  if (!user) return 1;

  // Step 1: Location Access
  const isLocationSaved = Boolean(
    user.isLocationSaved ||
    user.locationCoordinates?.lat ||
    (user.address && user.assignedCity)
  );
  if (!isLocationSaved) return 1;

  // Step 2: Document Upload
  const isDocsUploaded = Boolean(
    user.isDocumentsUploaded ||
    (user.documents?.aadhaarFront && user.documents?.aadhaarBack)
  );
  if (!isDocsUploaded) return 2;

  // Step 3: Select Categories
  const isCategorySelected = Boolean(
    user.isCategorySelected ||
    (user.categories && user.categories.length > 0) ||
    user.category
  );
  if (!isCategorySelected) return 3;

  // Step 4: Select Skills
  const isSkillsSelected = Boolean(
    user.isSkillsSelected ||
    (user.skills && user.skills.length > 0)
  );
  if (!isSkillsSelected) return 4;

  // Step 5: Service Area & Radius
  const isServiceAreaSet = Boolean(
    user.isServiceAreaSet ||
    (user.serviceRadiusKm && user.localities && user.localities.length > 0)
  );
  if (!isServiceAreaSet) return 5;

  // Step 6: Working Hours
  const isWorkingHoursSet = Boolean(
    user.isWorkingHoursSet ||
    (user.workingHours && user.workingHours.length > 0)
  );
  if (!isWorkingHoursSet) return 6;

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
    updatePartnerProfile,
    updateUser,
    isLoggingIn,
  } = useAuth();

  // Step state with double-fallback: localStorage cache -> currentUser DB progress calculation -> default 1
  const [step, setStep] = useState(() => {
    const savedStep = localStorage.getItem('partner_onboarding_step');
    if (savedStep && !isNaN(Number(savedStep))) {
      const parsed = Number(savedStep);
      if (parsed >= 1 && parsed <= 6) return parsed;
    }
    return getInitialStepFromUser(currentUser);
  });
  const [subStep, setSubStep] = useState('list'); // 'list' | 'aadhaar' | 'generic'

  // Persist current step to localStorage
  useEffect(() => {
    if (step) {
      localStorage.setItem('partner_onboarding_step', step.toString());
    }
  }, [step]);

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
          if (!editCity) setEditCity(list[0]._id);
        }
      })
      .catch((err) => console.warn('Active cities fetch warning:', err));
  }, []);

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

  const [activeGenericDoc, setActiveGenericDoc] = useState('panDoc');
  const [showGenericModal, setShowGenericModal] = useState(false);

  // Category State (Supports Multi-Selection by Category ObjectId)
  const [selectedCategories, setSelectedCategories] = useState(
    currentUser?.categories?.length ? currentUser.categories : (currentUser?.category ? [currentUser.category] : [])
  );
  const [category, setCategory] = useState(currentUser?.category || '');
  const [categoriesList, setCategoriesList] = useState([]);
  const [searchCatQuery, setSearchCatQuery] = useState('');

  // Toggle category ObjectId selection
  const handleToggleCategory = (catObj) => {
    const catId = catObj._id || catObj.id || catObj.name;
    if (selectedCategories.includes(catId)) {
      const updated = selectedCategories.filter((id) => id !== catId);
      setSelectedCategories(updated);
      if (category === catId) {
        setCategory(updated[0] || '');
      }
    } else {
      const updated = [...selectedCategories, catId];
      setSelectedCategories(updated);
      if (!category) {
        setCategory(catId);
      }
    }
  };

  // Skills & Experience State (Dynamic Skills based on Selected Categories)
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
  const [certificateTitle, setCertificateTitle] = useState('');
  const [certifications, setCertifications] = useState(currentUser?.certifications || []);

  // Fetch Dynamic Skills for Selected Categories from Super Admin API using Category IDs
  useEffect(() => {
    if (step !== 4) return;
    const loadCategorySkills = async () => {
      setLoadingSkills(true);
      try {
        const rawCats = selectedCategories.length > 0
          ? selectedCategories
          : (category ? [category] : (currentUser?.categories || (currentUser?.category ? [currentUser.category] : [])));

        const catIds = rawCats.map((c) => (typeof c === 'object' && c?._id ? c._id : c));
        const categoriesParam = catIds.join(',');

        const res = await catalogService.getSkills({ categories: categoriesParam });
        const fetchedSkills = res.data?.data || res.data || [];

        if (Array.isArray(fetchedSkills)) {
          setCategorySkills(fetchedSkills);
          setSkills((prevSkills) => {
            const validOnly = prevSkills.filter((s) => typeof s === 'string' && Boolean(s.match(/^[0-9a-fA-F]{24}$/)));
            if (!validOnly.length && fetchedSkills.length > 0) {
              return fetchedSkills.slice(0, 3).map((sk) => String(sk._id || sk.id));
            }
            return validOnly;
          });
        }
      } catch (err) {
        console.warn('Failed to fetch category skills from server:', err);
      } finally {
        setLoadingSkills(false);
      }
    };
    loadCategorySkills();
  }, [step, selectedCategories, category, currentUser]);

  // Service Area S  // Helper to resolve human-readable city name from ObjectId or object
  const getCityName = (cityVal) => {
    if (!cityVal) return 'Delhi NCR';
    if (typeof cityVal === 'object' && cityVal?.name) return cityVal.name;
    const found = activeCitiesList.find((c) => String(c._id) === String(cityVal) || c.name === cityVal);
    if (found) return found.name;
    return typeof cityVal === 'string' && !cityVal.match(/^[0-9a-fA-F]{24}$/) ? cityVal : 'Delhi NCR';
  };

  const displayCityName = getCityName(currentUser?.assignedCity || currentUser?.city);
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
    const numPoints = Math.min(12, Math.max(2, Math.round(radiusKm / 2)));
    const offsets = [{ lat: cLat, lng: cLng }];

    for (let i = 1; i < numPoints; i++) {
      const angle = (i * 2 * Math.PI) / (numPoints - 1);
      const dist = (0.35 + (i % 3) * 0.25) * rDeg;
      const dLat = dist * Math.cos(angle);
      const dLng = dist * Math.sin(angle);
      offsets.push({ lat: cLat + dLat, lng: cLng + dLng });
    }

    Promise.all(
      offsets.map((pt) =>
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pt.lat}&lon=${pt.lng}&zoom=14`)
          .then((r) => r.json())
          .catch(() => null)
      )
    ).then((results) => {
      const locNames = [];
      results.forEach((data) => {
        if (data?.address) {
          const addr = data.address;
          const name =
            addr.suburb ||
            addr.neighbourhood ||
            addr.residential ||
            addr.subdistrict ||
            addr.town ||
            addr.city_district ||
            addr.village ||
            addr.county;
          if (name) {
            const formatted = `${name} (${displayCityName})`;
            if (!locNames.includes(formatted)) {
              locNames.push(formatted);
            }
          }
        }
      });

      if (locNames.length > 0) {
        setDynamicNearbyLocalities(locNames);
        setSelectedLocalities((prev) => {
          const cleanPrev = displayCityName === 'Delhi NCR'
            ? prev
            : prev.filter((p) => !p.includes('Delhi NCR') && !REAL_LOCALITIES_BY_CITY['Delhi NCR'].includes(p));
          return Array.from(new Set([...locNames, ...cleanPrev]));
        });
      }
      setLoadingNearbyLocs(false);
    });
  };

  useEffect(() => {
    if (step !== 5) return;
    const coordsObj = deviceCoords || currentUser?.locationCoordinates;
    if (coordsObj?.lat && coordsObj?.lng && !dynamicNearbyLocalities.length) {
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

    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${rLat}&lon=${rLng}`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.display_name) {
          setDeviceAddress(data.display_name);
        } else {
          setDeviceAddress(`Pinned Location (${rLat}, ${rLng})`);
        }
      })
      .catch(() => {
        setDeviceAddress(`Pinned Location (${rLat}, ${rLng})`);
      });

    if (step === 5) {
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

      let detectedAddr = `${workCity} (Location: ${lat.toFixed(4)}, ${lng.toFixed(4)})`;
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
        );
        const data = await res.json();
        if (data?.display_name) {
          detectedAddr = data.display_name;
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
          return;
        }
      } catch (ipErr) {
        console.warn('IP Geolocation fallback failed:', ipErr);
      }

      // Fallback Tier 2: Use Selected Work City Default Coordinates
      const defaultCoords = CITY_COORDINATES[workCity] || CITY_COORDINATES['Delhi NCR'] || { lat: 28.6139, lng: 77.2090 };
      await handleLocationSuccess(defaultCoords.lat, defaultCoords.lng, 'City Center');
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

  // STEP 1 Submit: Save Location to Database on Continue Click & Move to Document Upload Page
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
      setStep(2); // Move to Document Upload Page!
      setSubStep('list');
    } catch (err) {
      console.error('Failed to save location to DB:', err);
      setError(err.message || 'Failed to save location to database. Please try again.');
    }
  };

  // STEP 2: Submit All Attached Documents in Single FormData Request to R2
  const handleStep2DocsSubmit = async () => {
    setError('');
    setSuccessMsg('');

    try {
      const keys = Object.keys(documentFiles);
      if (keys.length > 0) {
        const formData = new FormData();
        keys.forEach((key) => {
          if (documentFiles[key]) {
            formData.append(key, documentFiles[key]);
          }
        });

        setSuccessMsg('Uploading all attached documents to Cloudflare R2 storage... ⏳');
        await saveOnboardingDocuments(formData);
      } else {
        await saveOnboardingDocuments({});
      }

      setSuccessMsg('✅ Documents saved successfully! Proceeding to Category Selection...');
      setStep(3); // Go to Select Service Category Page!
      setSubStep('list');
    } catch (err) {
      console.error('Batch Document Upload Error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to upload documents');
    }
  };

  // STEP 3: Submit Selected Service Category ObjectIds (categories array)
  const handleStep3CategorySubmit = async () => {
    setError('');
    setSuccessMsg('');

    if (!selectedCategories.length && !category) {
      setError('Please select at least one service category to proceed');
      return;
    }

    try {
      const categoriesPayload = selectedCategories.length > 0 ? selectedCategories : [category];
      await saveOnboardingCategory({ categories: categoriesPayload });
      setStep(4); // Go to Step 4: Skills & Experience Page!
    } catch (err) {
      setError(err.message || 'Failed to save service categories');
    }
  };

  // STEP 4: Submit Skills & Experience
  const handleStep4SkillsSubmit = async () => {
    setError('');
    setSuccessMsg('');
    try {
      const validSkillIds = skills.filter((s) => typeof s === 'string' && Boolean(s.match(/^[0-9a-fA-F]{24}$/)));
      await saveOnboardingSkills({ experience, skills: validSkillIds, certifications });
      setStep(5); // Go to Step 5: Service Area Page!
    } catch (err) {
      setError(err.message || 'Failed to save skills and experience');
    }
  };

  // STEP 5: Submit Service Area
  const handleStep5AreaSubmit = async () => {
    setError('');
    setSuccessMsg('');
    try {
      await saveOnboardingServiceArea({ workRadius, localities: selectedLocalities });
      setStep(6); // Go to Step 6: Working Hours Page!
    } catch (err) {
      setError(err.message || 'Failed to save service area');
    }
  };

  // STEP 6: Submit Working Hours & Direct Dashboard Entry!
  const handleStep6Submit = async () => {
    setError('');
    setSuccessMsg('');
    try {
      await saveOnboardingWorkingHours({ workingHours });
      setSuccessMsg('🎉 Onboarding Complete! Redirecting to Partner Dashboard...');
      setTimeout(() => {
        if (onFinishOnboarding) {
          onFinishOnboarding();
        }
      }, 800);
    } catch (err) {
      setError(err.message || 'Failed to save working hours');
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
              { id: 2, label: '2. Docs' },
              { id: 3, label: '3. Category' },
              { id: 4, label: '4. Skills' },
              { id: 5, label: '5. Area' },
              { id: 6, label: '6. Hours' },
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
        {/* STEP 2A: UPLOAD DOCUMENTS LIST PAGE (upload-documents) */}
        {/* ============================================================ */}
        {step === 2 && subStep === 'list' && (
          <div style={{ padding: '18px 24px 28px 24px' }}>
            <div style={{ margin: '0 0 16px 0' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                IDENTITY VERIFICATION
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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: '14px', border: (documents.aadhaarFront && documents.aadhaarBack) ? '1.5px solid #16a34a' : '1.5px solid #e2e8f0', background: (documents.aadhaarFront && documents.aadhaarBack) ? '#f0fdf4' : '#f8fafc' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: (documents.aadhaarFront && documents.aadhaarBack) ? '#dcfce7' : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShieldCheck size={20} color={(documents.aadhaarFront && documents.aadhaarBack) ? '#16a34a' : '#64748b'} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0f172a' }}>Aadhaar Card (Required)</div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>JPEG or PNG up to 5MB</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSubStep('aadhaar')}
                  style={{ padding: '6px 14px', borderRadius: '20px', border: (documents.aadhaarFront && documents.aadhaarBack) ? 'none' : '1px solid #16a34a', background: (documents.aadhaarFront && documents.aadhaarBack) ? '#16a34a' : '#ffffff', color: (documents.aadhaarFront && documents.aadhaarBack) ? '#ffffff' : '#16a34a', fontWeight: '700', fontSize: '0.78rem', cursor: 'pointer' }}
                >
                  {(documents.aadhaarFront && documents.aadhaarBack) ? 'Uploaded ✓' : 'Upload'}
                </button>
              </div>

              {/* 2. Driving License */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: '14px', border: documents.drivingLicenseDoc ? '1.5px solid #16a34a' : '1.5px solid #e2e8f0', background: documents.drivingLicenseDoc ? '#f0fdf4' : '#f8fafc' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: documents.drivingLicenseDoc ? '#dcfce7' : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={20} color={documents.drivingLicenseDoc ? '#16a34a' : '#64748b'} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0f172a' }}>Driving License</div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>JPEG or PNG up to 5MB</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { setActiveGenericDoc('drivingLicenseDoc'); setShowGenericModal(true); }}
                  style={{ padding: '6px 14px', borderRadius: '20px', border: documents.drivingLicenseDoc ? 'none' : '1px solid #16a34a', background: documents.drivingLicenseDoc ? '#16a34a' : '#ffffff', color: documents.drivingLicenseDoc ? '#ffffff' : '#16a34a', fontWeight: '700', fontSize: '0.78rem', cursor: 'pointer' }}
                >
                  {documents.drivingLicenseDoc ? 'Uploaded ✓' : 'Upload'}
                </button>
              </div>

              {/* 3. PAN Card */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: '14px', border: documents.panDoc ? '1.5px solid #16a34a' : '1.5px solid #e2e8f0', background: documents.panDoc ? '#f0fdf4' : '#f8fafc' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: documents.panDoc ? '#dcfce7' : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CreditCard size={20} color={documents.panDoc ? '#16a34a' : '#64748b'} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0f172a' }}>PAN Card</div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Required for tax reporting</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { setActiveGenericDoc('panDoc'); setShowGenericModal(true); }}
                  style={{ padding: '6px 14px', borderRadius: '20px', border: documents.panDoc ? 'none' : '1px solid #16a34a', background: documents.panDoc ? '#16a34a' : '#ffffff', color: documents.panDoc ? '#ffffff' : '#16a34a', fontWeight: '700', fontSize: '0.78rem', cursor: 'pointer' }}
                >
                  {documents.panDoc ? 'Uploaded ✓' : 'Upload'}
                </button>
              </div>

              {/* 4. Passport Size Photo */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: '14px', border: documents.passportPhoto ? '1.5px solid #16a34a' : '1.5px solid #e2e8f0', background: documents.passportPhoto ? '#f0fdf4' : '#f8fafc' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: documents.passportPhoto ? '#dcfce7' : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={20} color={documents.passportPhoto ? '#16a34a' : '#64748b'} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0f172a' }}>Passport Size Photo</div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Clear face photo for ID Card</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { setActiveGenericDoc('passportPhoto'); setShowGenericModal(true); }}
                  style={{ padding: '6px 14px', borderRadius: '20px', border: documents.passportPhoto ? 'none' : '1px solid #16a34a', background: documents.passportPhoto ? '#16a34a' : '#ffffff', color: documents.passportPhoto ? '#ffffff' : '#16a34a', fontWeight: '700', fontSize: '0.78rem', cursor: 'pointer' }}
                >
                  {documents.passportPhoto ? 'Uploaded ✓' : 'Upload'}
                </button>
              </div>

              {/* 5. Bank Passbook / Cheque */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: '14px', border: documents.bankPassbookDoc ? '1.5px solid #16a34a' : '1.5px solid #e2e8f0', background: documents.bankPassbookDoc ? '#f0fdf4' : '#f8fafc' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: documents.bankPassbookDoc ? '#dcfce7' : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Building size={20} color={documents.bankPassbookDoc ? '#16a34a' : '#64748b'} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0f172a' }}>Bank Passbook / Cheque</div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>For directly transferring payouts</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { setActiveGenericDoc('bankPassbookDoc'); setShowGenericModal(true); }}
                  style={{ padding: '6px 14px', borderRadius: '20px', border: documents.bankPassbookDoc ? 'none' : '1px solid #16a34a', background: documents.bankPassbookDoc ? '#16a34a' : '#ffffff', color: documents.bankPassbookDoc ? '#ffffff' : '#16a34a', fontWeight: '700', fontSize: '0.78rem', cursor: 'pointer' }}
                >
                  {documents.bankPassbookDoc ? 'Uploaded ✓' : 'Upload'}
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
                onClick={() => setStep(1)}
                style={{ flex: 1, padding: '14px', borderRadius: '14px', background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', fontSize: '0.88rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <ArrowLeft size={16} /> Back
              </button>
              <button
                type="button"
                onClick={handleStep2DocsSubmit}
                disabled={isLoggingIn}
                style={{ flex: 1.5, padding: '14px', borderRadius: '14px', background: '#16a34a', color: '#ffffff', border: 'none', fontSize: '0.94rem', fontWeight: '700', cursor: 'pointer', boxShadow: '0 8px 20px rgba(22, 163, 74, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                {isLoggingIn ? <Loader2 size={18} className="spin" /> : <>Continue <ArrowRight size={16} /></>}
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 2B: UPLOAD AADHAAR CARD PAGE (upload-aadhaar-card) */}
        {/* ============================================================ */}
        {step === 2 && subStep === 'aadhaar' && (
          <div style={{ padding: '18px 24px 28px 24px' }}>
            <div style={{ margin: '0 0 16px 0' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                Upload Aadhaar Card
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.82rem', marginTop: '4px', margin: 0 }}>
                Upload clear photos of both sides of your Aadhaar Card for identity verification.
              </p>
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

        {/* ============================================================ */}
        {/* STEP 3: SELECT SERVICE CATEGORY PAGE */}
        {/* ============================================================ */}
        {step === 3 && (
          <div style={{ padding: '18px 24px 28px 24px' }}>
            <div style={{ margin: '0 0 16px 0' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                Select Categories
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.82rem', marginTop: '4px', margin: 0 }}>
                Select one or more active categories ({selectedCategories.length} selected)
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

            {/* Super Admin Active Category Cards Grid (Multi-Select by ObjectId) */}
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
                const isSelected = selectedCategories.includes(catIdentifier) || selectedCategories.includes(cat.name) || category === catIdentifier || category === cat.name;
                return (
                  <div
                    key={catIdentifier}
                    onClick={() => handleToggleCategory(cat)}
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
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: isSelected ? '#16a34a' : '#e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s',
                    }}>
                      <Check size={12} color={isSelected ? '#ffffff' : '#94a3b8'} />
                    </div>

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
                onClick={() => setStep(2)}
                style={{ flex: 1, padding: '14px', borderRadius: '14px', background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', fontSize: '0.88rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <ArrowLeft size={16} /> Back
              </button>
              <button
                type="button"
                onClick={handleStep3CategorySubmit}
                disabled={isLoggingIn}
                style={{ flex: 1.5, padding: '14px', borderRadius: '14px', background: '#16a34a', color: '#ffffff', border: 'none', fontSize: '0.94rem', fontWeight: '700', cursor: 'pointer', boxShadow: '0 8px 20px rgba(22, 163, 74, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                {isLoggingIn ? <Loader2 size={18} className="spin" /> : <>Continue <ArrowRight size={16} /></>}
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 4: SKILLS & EXPERIENCE PAGE */}
        {/* ============================================================ */}
        {step === 4 && (
          <div style={{ padding: '18px 24px 28px 24px' }}>
            <div style={{ margin: '0 0 16px 0' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                Skills & Experience
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.82rem', marginTop: '4px', margin: 0 }}>
                Highlight experience level & skills for {category || 'selected category'}
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

            {/* Select Your Special Skills (Dynamic Category Skills from Super Admin API) */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155' }}>
                  Select Your Special Skills
                </label>
                {loadingSkills && <span style={{ fontSize: '0.75rem', color: '#16a34a' }}>Loading category skills... ⏳</span>}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {categorySkills.map((sk) => {
                  const skillId = sk._id || sk.id || sk;
                  const skillName = sk.name || sk;
                  const isSelected = skills.includes(skillId);
                  return (
                    <button
                      key={skillId}
                      type="button"
                      onClick={() => handleToggleSkill(skillId)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '20px',
                        border: isSelected ? '2px solid #16a34a' : '1px solid #cbd5e1',
                        background: isSelected ? '#16a34a' : '#ffffff',
                        color: isSelected ? '#ffffff' : '#475569',
                        fontWeight: '700',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: isSelected ? '0 4px 10px rgba(22, 163, 74, 0.2)' : 'none',
                      }}
                    >
                      {isSelected && <Check size={14} color="#ffffff" />}
                      {skillName}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Certifications (Optional) */}
            <div style={{ marginBottom: '22px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                Certifications (Optional)
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="+ Add Professional Certificate"
                  value={certificateTitle}
                  onChange={(e) => setCertificateTitle(e.target.value)}
                  style={{ flex: 1, padding: '10px 12px', borderRadius: '12px', border: '1.5px dashed #bbf7d0', background: '#f0fdf4', fontSize: '0.86rem', outline: 'none' }}
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
                onClick={handleStep4SkillsSubmit}
                disabled={isLoggingIn}
                style={{ flex: 1.5, padding: '14px', borderRadius: '14px', background: '#16a34a', color: '#ffffff', border: 'none', fontSize: '0.94rem', fontWeight: '700', cursor: 'pointer', boxShadow: '0 8px 20px rgba(22, 163, 74, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                {isLoggingIn ? <Loader2 size={18} className="spin" /> : <>Continue <ArrowRight size={16} /></>}
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 5: SERVICE AREA SELECTION PAGE */}
        {/* ============================================================ */}
        {step === 5 && (
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
                  ...(REAL_LOCALITIES_BY_CITY[displayCityName] || []),
                ]))
                  .filter((loc) => displayCityName === 'Delhi NCR' || (!loc.includes('Delhi NCR') && !REAL_LOCALITIES_BY_CITY['Delhi NCR'].includes(loc)))
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
                onClick={() => setStep(4)}
                style={{ flex: 1, padding: '14px', borderRadius: '14px', background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', fontSize: '0.88rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <ArrowLeft size={16} /> Back
              </button>
              <button
                type="button"
                onClick={handleStep5AreaSubmit}
                disabled={isLoggingIn}
                style={{ flex: 1.5, padding: '14px', borderRadius: '14px', background: '#16a34a', color: '#ffffff', border: 'none', fontSize: '0.94rem', fontWeight: '700', cursor: 'pointer', boxShadow: '0 8px 20px rgba(22, 163, 74, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                {isLoggingIn ? <Loader2 size={18} className="spin" /> : <>Continue <ArrowRight size={16} /></>}
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 6: WORKING HOURS SETUP PAGE */}
        {/* ============================================================ */}
        {step === 6 && (
          <div style={{ padding: '18px 24px 28px 24px' }}>
            <div style={{ margin: '0 0 14px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                  Working Hours
                </h2>
                <p style={{ color: '#64748b', fontSize: '0.82rem', marginTop: '2px', margin: 0 }}>
                  Set Weekly Schedule
                </p>
              </div>
              <button
                type="button"
                onClick={handleApplyHoursToAll}
                style={{ background: '#dcfce7', border: 'none', color: '#15803d', padding: '6px 12px', borderRadius: '10px', fontSize: '0.76rem', fontWeight: '700', cursor: 'pointer' }}
              >
                Apply to All
              </button>
            </div>

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
                      {sch.openTime} to {sch.closeTime}
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.76rem', color: '#94a3b8', fontStyle: 'italic' }}>Off Day</span>
                  )}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
              <button
                type="button"
                onClick={() => setStep(5)}
                style={{ flex: 1, padding: '14px', borderRadius: '14px', background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', fontSize: '0.88rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <ArrowLeft size={16} /> Back
              </button>
              <button
                type="button"
                onClick={handleStep6Submit}
                disabled={isLoggingIn}
                style={{
                  flex: 1.5,
                  padding: '14px',
                  borderRadius: '14px',
                  background: '#16a34a',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.94rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  boxShadow: '0 8px 20px rgba(22, 163, 74, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                {isLoggingIn ? <Loader2 size={18} className="spin" /> : <>Save & Complete 🎉</>}
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
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Full Name</label>
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
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Email Address</label>
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
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Date of Birth</label>
                    <input
                      type="date"
                      value={editDob}
                      onChange={(e) => setEditDob(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '12px', border: '1.5px solid #cbd5e1', fontSize: '0.86rem', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Gender</label>
                    <select
                      value={editGender}
                      onChange={(e) => setEditGender(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '12px', border: '1.5px solid #cbd5e1', fontSize: '0.86rem', outline: 'none', background: '#ffffff' }}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Assigned City</label>
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

      </div>
    </div>
  );
};

export default PartnerOnboardingPage;
