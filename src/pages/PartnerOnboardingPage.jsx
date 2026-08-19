import React, { useState, useEffect, useRef } from 'react';
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
  Clock,
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
import { partnerService } from '../services/partner.service.js';

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
  'AC & Appliance Repair': ['Split AC Install', 'Gas Refilling', 'Deep Cleaning', 'Inverter AC Repair', 'Compressor Check', 'Maintenance'],
  'Cleaning & Pest Control': ['Bathroom Deep Scrub', 'Kitchen Degreasing', 'Sofa Shampooing', 'Cockroach Gel Treatment', 'Balcony Wash', 'Full Home Polish'],
  'Plumbing, Electrical & Carpentry': ['Tap & Mixer Fix', 'RO Purifier Filter Service', 'Switch & Fuse Repair', 'Fan & Chandelier Mount', 'Door Lock Fitting', 'Water Heater Repair'],
  'Salon & Beauty for Women': ['O3+ Glow Facial', 'Rica Waxing', 'Spa Pedicure', 'Hair Spa', 'De-Tan Cleanup', 'Bridal Makeup'],
  "Men's Salon & Grooming": ['Fade Haircut', 'Beard Shaping', 'Hot Towel Shave', 'Head Massage', 'Hair Color', 'Facial Scrub'],
  'Home Painting & Decor': ['Accent Wall Paint', 'Wall Waterproofing', 'Damp Treatment', 'Stencil Design', 'POP Repair', 'Emulsion Coating'],
};

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

// Interactive Real Leaflet Map Component with Dynamic Circle Radius & Live Location Pin
const InteractiveServiceMap = ({ city = 'Delhi NCR', radiusKm = 8, coords = null }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const circleInstanceRef = useRef(null);
  const markerInstanceRef = useRef(null);

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
        .bindPopup(`<b>${coords?.lat ? 'Your Current GPS Location' : `${city} Hub`}</b><br>Radius: ${radiusKm} km`);

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
        markerInstanceRef.current.bindPopup(`<b>Your Detected GPS Position</b><br>Lat: ${cLat.toFixed(4)}, Lng: ${cLng.toFixed(4)}`).openPopup();
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
        } catch (e) {}
      }
    }
  }, [radiusKm]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '210px', borderRadius: '18px', overflow: 'hidden', border: '2px solid #bbf7d0', boxShadow: '0 4px 14px rgba(22, 163, 74, 0.12)', marginBottom: '18px' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%', zIndex: 1 }} />
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

const PartnerOnboardingPage = ({ currentUser, onLogout, onFinishOnboarding }) => {
  const {
    saveOnboardingLocation,
    saveOnboardingDocuments,
    saveOnboardingCategory,
    saveOnboardingSkills,
    saveOnboardingServiceArea,
    saveOnboardingWorkingHours,
    isLoggingIn,
  } = useAuth();

  // Step state: 1: 'location-access' | 2: 'docs-list' | 3: 'category' | 4: 'service-area' | 5: 'working-hours'
  const [step, setStep] = useState(1);
  const [subStep, setSubStep] = useState('list'); // 'list' | 'aadhaar' | 'generic'

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

  // Category State
  const [category, setCategory] = useState(currentUser?.category || '');
  const [categoriesList, setCategoriesList] = useState([]);
  const [searchCatQuery, setSearchCatQuery] = useState('');

  // Skills & Experience State
  const [experience, setExperience] = useState(currentUser?.experience || '3-5 Years');
  const [skills, setSkills] = useState(currentUser?.skills?.length ? currentUser.skills : ['Split AC Install', 'Gas Refilling']);
  const [certificateTitle, setCertificateTitle] = useState('');
  const [certifications, setCertifications] = useState(currentUser?.certifications || []);

  // Service Area State
  const [workRadius, setWorkRadius] = useState(currentUser?.workRadius || 8);
  const [selectedLocalities, setSelectedLocalities] = useState(currentUser?.localities?.length ? currentUser.localities : []);

  // Working Hours State
  const [workingHours, setWorkingHours] = useState(currentUser?.workingHours?.length ? currentUser.workingHours : DEFAULT_SCHEDULE);

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const workCity = currentUser?.assignedCity || 'Delhi NCR';

  // Load Super Admin Categories from backend
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await catalogService.getCategories();
        const list = res.data?.data || res.data || [];
        if (Array.isArray(list) && list.length > 0) {
          setCategoriesList(list);
          if (!category) setCategory(list[0].name);
        }
      } catch (err) {
        console.error('Failed to load active categories:', err);
      }
    };
    fetchCats();
  }, []);

  // Default localities
  useEffect(() => {
    const locs = REAL_LOCALITIES_BY_CITY[workCity] || REAL_LOCALITIES_BY_CITY['Delhi NCR'];
    if (!selectedLocalities.length) {
      setSelectedLocalities(locs.slice(0, 4));
    }
  }, [workCity]);

  // Local Document Attachment Handler (Batched until Continue click)
  const handleDocumentFileSelect = (docKey, file) => {
    if (!file) return;

    // Store raw file in documentFiles state for batch upload on Continue
    setDocumentFiles((prev) => ({
      ...prev,
      [docKey]: file,
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
    reader.readAsDataURL(file);
  };

  // STEP 1: Allow Location Access Handler (Device Geolocation API)
  const handleAllowLocationAccess = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setError('');
    setSuccessMsg('');
    setIsDetectingGps(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const coordsObj = { lat: latitude, lng: longitude };
        setDeviceCoords(coordsObj);

        let detectedAddr = `${workCity} (GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          if (data?.display_name) {
            detectedAddr = data.display_name;
          }
        } catch (e) {
          console.warn('Reverse geocoding warning:', e);
        }

        setDeviceAddress(detectedAddr);

        try {
          await saveOnboardingLocation({
            latitude,
            longitude,
            address: detectedAddr,
            city: workCity,
          });
          setSuccessMsg('✅ Device location access granted & saved successfully!');
        } catch (err) {
          console.error('Failed to save location:', err);
          setError('Location detected, but failed to sync to server');
        } finally {
          setIsDetectingGps(false);
        }
      },
      (err) => {
        setIsDetectingGps(false);
        console.error('GPS error:', err);
        setError('Location permission denied or unavailable. Please enable GPS in browser.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // STEP 1 Submit: Move to Document Upload Page
  const handleStep1LocationSubmit = () => {
    setError('');
    if (!deviceCoords && !currentUser?.locationCoordinates && !deviceAddress) {
      setError('Please click "Allow Location Access" button to extract current position!');
      return;
    }
    setStep(2); // Go to Document Upload!
    setSubStep('list');
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
        await partnerService.uploadDocuments(formData);
      }

      setSuccessMsg('✅ Documents saved successfully! Proceeding to Category Selection...');
      setStep(3); // Go to Select Service Category Page!
      setSubStep('list');
    } catch (err) {
      console.error('Batch Document Upload Error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to upload documents');
    }
  };

  // STEP 3: Submit Selected Service Category
  const handleStep3CategorySubmit = async () => {
    setError('');
    setSuccessMsg('');
    if (!category) {
      setError('Please select a service category to proceed');
      return;
    }
    try {
      await saveOnboardingCategory({ category });
      setStep(4); // Go to Step 4: Skills & Experience Page!
    } catch (err) {
      setError(err.message || 'Failed to save service category');
    }
  };

  // STEP 4: Submit Skills & Experience
  const handleStep4SkillsSubmit = async () => {
    setError('');
    setSuccessMsg('');
    try {
      await saveOnboardingSkills({ experience, skills, certifications });
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
            {(step > 1 || subStep !== 'list') && (
              <button
                type="button"
                onClick={() => {
                  setError('');
                  if (subStep === 'aadhaar') setSubStep('list');
                  else setStep(step - 1);
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
              >
                <ArrowLeft size={16} />
              </button>
            )}
            <div>
              <div style={{ fontSize: '0.98rem', fontWeight: '800', color: '#0f172a' }}>
                Partner KYC Setup
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                {currentUser?.name || 'Partner Agency'} • {workCity}
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

        {/* Multi-step Progress Bar Indicator */}
        <div style={{ padding: '14px 24px 4px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', fontWeight: '800', color: '#16a34a', marginBottom: '6px' }}>
            <span>STEP {step} OF 6</span>
            <span>{step === 1 ? 'Allow Location Access' : step === 2 ? 'Upload Documents' : step === 3 ? 'Select Category' : step === 4 ? 'Skills & Experience' : step === 5 ? 'Service Area' : 'Working Hours'}</span>
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
            <InteractiveServiceMap city={workCity} radiusKm={workRadius} coords={deviceCoords} />

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

            <button
              type="button"
              onClick={handleStep1LocationSubmit}
              disabled={isLoggingIn}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '14px',
                background: (deviceCoords || deviceAddress || currentUser?.locationCoordinates) ? '#16a34a' : '#94a3b8',
                color: '#ffffff',
                border: 'none',
                fontSize: '0.98rem',
                fontWeight: '700',
                cursor: (deviceCoords || deviceAddress || currentUser?.locationCoordinates) ? 'pointer' : 'not-allowed',
                boxShadow: (deviceCoords || deviceAddress || currentUser?.locationCoordinates) ? '0 8px 20px rgba(22, 163, 74, 0.3)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              Continue to Document Upload <ArrowRight size={18} />
            </button>
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

            {/* Generic Document Upload Modal */}
            {showGenericModal && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                <div style={{ width: '100%', maxWidth: '380px', background: '#ffffff', borderRadius: '20px', padding: '22px', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: '0 0 14px 0' }}>
                    Attach {activeGenericDoc === 'panDoc' ? 'PAN Card' : activeGenericDoc === 'drivingLicenseDoc' ? 'Driving License' : activeGenericDoc === 'passportPhoto' ? 'Passport Photo' : 'Bank Passbook'}
                  </h3>

                  <label htmlFor="generic-doc-file" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '140px', borderRadius: '16px', border: '2px dashed #16a34a', background: '#f0fdf4', cursor: 'pointer', padding: '16px', textAlign: 'center', marginBottom: '16px' }}>
                    {documents[activeGenericDoc] ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle2 size={32} color="#16a34a" />
                        <span style={{ fontSize: '0.84rem', fontWeight: '700', color: '#15803d' }}>File Attached Successfully!</span>
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

            <button
              type="button"
              onClick={handleStep2DocsSubmit}
              disabled={isLoggingIn}
              style={{ width: '100%', padding: '14px', borderRadius: '14px', background: '#16a34a', color: '#ffffff', border: 'none', fontSize: '0.98rem', fontWeight: '700', cursor: 'pointer', boxShadow: '0 8px 20px rgba(22, 163, 74, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              {isLoggingIn ? <Loader2 size={18} className="spin" /> : <>Continue <ArrowRight size={18} /></>}
            </button>
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
                Select Category
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.82rem', marginTop: '4px', margin: 0 }}>
                Choose active category offering created by Super Admin
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

            {/* Super Admin Active Category Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '22px', maxHeight: '320px', overflowY: 'auto' }}>
              {(categoriesList.length > 0 ? categoriesList : [
                { name: 'AC & Appliance Repair' },
                { name: 'Cleaning & Pest Control' },
                { name: 'Plumbing, Electrical & Carpentry' },
                { name: 'Salon & Beauty for Women' },
                { name: "Men's Salon & Grooming" },
                { name: 'Home Painting & Decor' },
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
              onClick={handleStep3CategorySubmit}
              disabled={isLoggingIn}
              style={{ width: '100%', padding: '14px', borderRadius: '14px', background: '#16a34a', color: '#ffffff', border: 'none', fontSize: '0.98rem', fontWeight: '700', cursor: 'pointer', boxShadow: '0 8px 20px rgba(22, 163, 74, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              {isLoggingIn ? <Loader2 size={18} className="spin" /> : <>Continue to Skills & Experience <ArrowRight size={18} /></>}
            </button>
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

            {/* Select Your Special Skills */}
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
                        background: isSelected ? '#16a34a' : '#ffffff',
                        color: isSelected ? '#ffffff' : '#475569',
                        fontWeight: '700',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      {isSelected && <Check size={14} color="#ffffff" />}
                      {tag}
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

            <button
              type="button"
              onClick={handleStep4SkillsSubmit}
              disabled={isLoggingIn}
              style={{ width: '100%', padding: '14px', borderRadius: '14px', background: '#16a34a', color: '#ffffff', border: 'none', fontSize: '0.98rem', fontWeight: '700', cursor: 'pointer', boxShadow: '0 8px 20px rgba(22, 163, 74, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              {isLoggingIn ? <Loader2 size={18} className="spin" /> : <>Continue to Service Area <ArrowRight size={18} /></>}
            </button>
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

            {/* Interactive Leaflet Map with Real-time Dynamic Circle Radius Overlay */}
            <InteractiveServiceMap city={workCity} radiusKm={workRadius} />

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

            {/* Available Localities (Customise) Real Data */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>
                Available Localities (Customise)
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                {(REAL_LOCALITIES_BY_CITY[workCity] || REAL_LOCALITIES_BY_CITY['Delhi NCR']).map((loc) => {
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
              onClick={handleStep5AreaSubmit}
              disabled={isLoggingIn}
              style={{ width: '100%', padding: '14px', borderRadius: '14px', background: '#16a34a', color: '#ffffff', border: 'none', fontSize: '0.98rem', fontWeight: '700', cursor: 'pointer', boxShadow: '0 8px 20px rgba(22, 163, 74, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              {isLoggingIn ? <Loader2 size={18} className="spin" /> : <>Continue to Working Hours <ArrowRight size={18} /></>}
            </button>
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

            <button
              type="button"
              onClick={handleStep6Submit}
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
              {isLoggingIn ? <Loader2 size={18} className="spin" /> : <>Save Hours & Open Dashboard <CheckCircle2 size={18} /></>}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default PartnerOnboardingPage;
