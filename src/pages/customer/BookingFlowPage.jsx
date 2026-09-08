import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  ArrowLeft,
  Calendar,
  Clock,
  CreditCard,
  CheckCircle2,
  MapPin,
  Tag,
  ChevronRight,
  Plus,
  ShieldCheck,
  Home,
  Briefcase,
  Smartphone,
  Landmark,
  Building,
  Loader2,
  Star,
  Navigation,
  Layers,
  Compass
} from 'lucide-react';
import { useBookings } from '../../hooks/useBookings.js';
import { useCustomer } from '../../hooks/useCustomer.js';
import { useAuth } from '../../hooks/useAuth.js';
import { customerService } from '../../services/customer.service.js';
import { catalogService } from '../../services/catalog.service.js';
import { paymentService } from '../../services/payment.service.js';
import { geoapifyService } from '../../services/geoapify.service.js';
import { toast } from '../../utils/toast.js';

// Dedicated Leaflet Map Picker Component for Doorstep Address Selection
const AddressMapPicker = ({ onLocationSelect, onMapReady, onLocateGps, isLocating = false }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerInstanceRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    if (!mapContainerRef.current) return;

    // Reset Leaflet DOM ID if re-mounting
    if (mapContainerRef.current._leaflet_id) {
      mapContainerRef.current._leaflet_id = null;
    }

    try {
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const defaultLat = 26.0494; // Nizamabad / Azamgarh coords
      const defaultLng = 83.0565;

      const map = L.map(mapContainerRef.current, {
        center: [defaultLat, defaultLng],
        zoom: 15,
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer(geoapifyService.getTileUrl('osm-bright'), {
        maxZoom: 19,
        attribution: '&copy; Geoapify &copy; OpenStreetMap',
      }).addTo(map);

      const customPinIcon = L.divIcon({
        className: 'custom-doorstep-pin',
        html: `<div style="
          position: relative;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            width: 32px;
            height: 32px;
            border-radius: 50% 50% 50% 0;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 6px 16px rgba(16, 185, 129, 0.45), 0 2px 6px rgba(0,0,0,0.5);
            border: 2px solid #ffffff;
          ">
            <div style="
              width: 12px;
              height: 12px;
              border-radius: 50%;
              background: #ffffff;
              box-shadow: inset 0 1px 3px rgba(0,0,0,0.25);
            "></div>
          </div>
        </div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 32],
      });

      const marker = L.marker([defaultLat, defaultLng], {
        draggable: true,
        icon: customPinIcon,
      }).addTo(map);

      const updateAddressFromLatLng = async (lat, lng) => {
        try {
          const data = await geoapifyService.reverseGeocode(lat, lng);
          if (data?.formatted && onLocationSelect && isMounted) {
            onLocationSelect(data.formatted, data.city || 'Doorstep Location', lat, lng);
          }
        } catch (err) {
          console.warn('Map pin geocoding warning:', err);
        }
      };

      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        updateAddressFromLatLng(lat, lng);
      });

      marker.on('dragend', () => {
        const { lat, lng } = marker.getLatLng();
        updateAddressFromLatLng(lat, lng);
      });

      mapInstanceRef.current = map;
      markerInstanceRef.current = marker;

      if (onMapReady) {
        onMapReady(map, marker);
      }

      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 300);

    } catch (err) {
      console.error('Leaflet Map initialization error:', err);
    }

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (_) {}
        mapInstanceRef.current = null;
        markerInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div
      style={{
        height: '190px',
        width: '100%',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
        position: 'relative',
        zIndex: 1,
        background: '#0b131e'
      }}
    >
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          zIndex: 2
        }}
      />

      {/* Floating GPS Location Button on Map View */}
      {onLocateGps && (
        <button
          type="button"
          onClick={onLocateGps}
          disabled={isLocating}
          style={{
            position: 'absolute',
            bottom: '12px',
            right: '12px',
            zIndex: 400,
            background: 'rgba(11, 19, 30, 0.92)',
            border: '1.5px solid #10b981',
            borderRadius: '12px',
            padding: '8px 14px',
            color: '#10b981',
            fontWeight: '800',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: isLocating ? 'wait' : 'pointer',
            boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
          }}
        >
          {isLocating ? (
            <>
              <Loader2 size={15} className="spin" />
              <span>Locating GPS...</span>
            </>
          ) : (
            <>
              <Navigation size={15} fill="#10b981" />
              <span>Use Current Location</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};

const BookingFlowPage = ({ service, currentUser, onBackToServices, onNavigateToBookings, appliedStarterPack }) => {
  const { createBooking, payBooking } = useBookings();
  const { addresses, refetchCustomer } = useCustomer();
  const { updateUser } = useAuth();

  // Active full page step: 'choose_package' | 'select_address' | 'add_address' | 'booking_summary' | 'apply_coupon' | 'payment' | 'finding_partner' | 'booking_confirmed'
  const [currentStep, setCurrentStep] = useState('choose_package');

  // Package Data (Loaded Live from Backend Service object)
  const [packageList, setPackageList] = useState([]);
  const [selectedPackageIndex, setSelectedPackageIndex] = useState(1);
  const [selectedPackageId, setSelectedPackageId] = useState(service?.packageId || service?.package?._id || service?.selectedPackage?._id || null);

  // Address Data (Loaded Live from Backend Customer Profile)
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [savingAddress, setSavingAddress] = useState(false);
  const [detectingCurrentLocation, setDetectingCurrentLocation] = useState(false);

  // New Address Form State
  const [newAddressLabel, setNewAddressLabel] = useState('Home');
  const [newFullAddress, setNewFullAddress] = useState('');
  const [newFloorApt, setNewFloorApt] = useState('');
  const [newLandmark, setNewLandmark] = useState('');
  const [newCity, setNewCity] = useState(currentUser?.city || 'Delhi NCR');

  // Date & Time Slot State
  const [selectedDate, setSelectedDate] = useState('Sat, March 15, 2025');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('10:30 AM');
  const [isSlotPickerOpen, setIsSlotPickerOpen] = useState(false);

  const availableDates = [
    'Sat, March 15, 2025',
    'Sun, March 16, 2025',
    'Mon, March 17, 2025',
    'Tue, March 18, 2025'
  ];

  const availableTimeSlots = [
    '09:00 AM',
    '10:30 AM',
    '02:00 PM',
    '05:00 PM',
    '07:00 PM'
  ];

  // Platform Fee State
  const [customerPlatformFeePercent, setCustomerPlatformFeePercent] = useState(5);

  useEffect(() => {
    customerService.getSystemSettings()
      .then((res) => {
        const settingsData = res.data?.data || res.data || {};
        if (settingsData.customerPlatformFeePercent !== undefined) {
          setCustomerPlatformFeePercent(Number(settingsData.customerPlatformFeePercent));
        }
      })
      .catch((err) => console.warn('Fetch system settings warning:', err));
  }, []);

  // Coupon State - NO AUTO APPLY
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponsList, setCouponsList] = useState([]);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const res = await customerService.getOffers();
        const list = res.data?.data || res.data || [];
        setCouponsList(Array.isArray(list) ? list : []);
      } catch (err) {
        console.warn('Failed to load live coupons:', err);
      }
    };
    fetchCoupons();
  }, []);

  // Payment Method State
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('UPI');

  // Order Confirmation Data
  const [loading, setLoading] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  // Initialize Packages from Backend Service data or Live API call
  useEffect(() => {
    const serviceId = service?._id || service?.serviceId;

    const processPackages = (rawList) => {
      if (!Array.isArray(rawList) || rawList.length === 0) return false;

      const formatted = rawList.map((pkg, idx) => {
        const pkgPrice = pkg.finalPrice !== undefined ? pkg.finalPrice : (pkg.price || 599);
        return {
          id: pkg._id || String(idx),
          _id: pkg._id,
          title: pkg.title || `Package ${idx + 1}`,
          price: pkgPrice,
          formattedPrice: `₹${pkgPrice.toLocaleString()}`,
          duration: pkg.duration || service?.duration || '45 mins',
          features: Array.isArray(pkg.features) && pkg.features.length > 0 ? pkg.features : ['Professional service delivery', '30-day post-service warranty', 'Certified & verified technician'],
          isPopular: Boolean(pkg.isPopular || pkg.isRecommended)
        };
      });

      setPackageList(formatted);

      // Auto-Select Logic: Priority 1 - Match selectedPackageId (if user or previous page selected a package)
      const targetPackageId = selectedPackageId || service?.packageId || service?.package?._id || service?.selectedPackage?._id;
      if (targetPackageId) {
        const foundIdx = formatted.findIndex((p) => String(p.id) === String(targetPackageId) || String(p._id) === String(targetPackageId));
        if (foundIdx !== -1) {
          setSelectedPackageIndex(foundIdx);
          return true;
        }
      }

      // Priority 2: Otherwise select recommended/popular or first package
      const popIdx = formatted.findIndex((p) => p.isPopular);
      const defaultIdx = popIdx !== -1 ? popIdx : 0;
      setSelectedPackageIndex(defaultIdx);
      if (formatted[defaultIdx]) {
        setSelectedPackageId(formatted[defaultIdx]._id || formatted[defaultIdx].id);
      }
      return true;
    };

    // Priority 1: Check if packages array was passed in service object
    if (service && Array.isArray(service.packages) && service.packages.length > 0) {
      const success = processPackages(service.packages);
      if (success) return;
    }

    // Priority 2: If serviceId exists, fetch live packages from backend API
    if (serviceId) {
      catalogService
        .getServicePackages(serviceId)
        .then((res) => {
          const list = res.data?.data || res.data || [];
          const activeList = Array.isArray(list) ? list.filter((p) => p.status === 'active') : [];
          const success = processPackages(activeList);
          if (!success) createFallbackPackages();
        })
        .catch((err) => {
          console.warn('Fetch packages warning in BookingFlowPage:', err);
          createFallbackPackages();
        });
    } else {
      createFallbackPackages();
    }

    function createFallbackPackages() {
      const basePrice = service?.finalPrice || service?.price || 1499;
      const serviceName = service?.name || service?.title || 'Service';
      
      const fallbacks = [
        {
          id: 'basic',
          title: `${serviceName} (Basic)`,
          price: Math.max(299, Math.round(basePrice * 0.7)),
          formattedPrice: `₹${Math.max(299, Math.round(basePrice * 0.7)).toLocaleString()}`,
          features: ['Essential service coverage', 'Verified professional', 'Standard completion update'],
          isPopular: false
        },
        {
          id: 'standard',
          title: `${serviceName} (Standard)`,
          price: basePrice,
          formattedPrice: `₹${basePrice.toLocaleString()}`,
          features: ['Complete deep service & inspection', '30-day post-service warranty', 'High pressure equipment & sterilisation'],
          isPopular: true
        },
        {
          id: 'premium',
          title: `${serviceName} (Premium)`,
          price: Math.round(basePrice * 1.5),
          formattedPrice: `₹${Math.round(basePrice * 1.5).toLocaleString()}`,
          features: ['Comprehensive maximum coverage', 'Senior/experienced technician', 'Priority support & premium treatment'],
          isPopular: false
        }
      ];

      setPackageList(fallbacks);
      setSelectedPackageIndex(1);
    }
  }, [service?._id, service?.serviceId, service?.name]);

  // Load Saved Addresses Live from Backend Customer Profile
  const addressesCount = addresses?.length || 0;
  const userAddressStr = currentUser?.address || '';

  useEffect(() => {
    if (addresses && addresses.length > 0) {
      const formatted = addresses.map((a, idx) => ({
        id: a._id || String(idx + 1),
        label: a.title || (idx === 0 ? 'Home' : 'Office'),
        address: `${a.addressLine || a.street || ''}, ${a.city || 'Delhi NCR'}`,
        type: (a.title || '').toLowerCase().includes('office') ? 'office' : 'home'
      }));
      setSavedAddresses(formatted);
      setSelectedAddressId((prev) => prev || formatted[0].id);
    } else if (userAddressStr) {
      const defaultUserAddr = [{
        id: 'user_profile_addr',
        label: 'Home',
        address: userAddressStr,
        type: 'home'
      }];
      setSavedAddresses((prev) => (prev.length > 0 ? prev : defaultUserAddr));
      setSelectedAddressId((prev) => prev || 'user_profile_addr');
    }
  }, [addressesCount, userAddressStr]);

  const currentPackage = packageList[selectedPackageIndex] || packageList[1] || packageList[0] || { title: 'Standard Deep Clean', price: 1499, formattedPrice: '₹1,499' };
  const activeAddressObj = savedAddresses.find((a) => a.id === selectedAddressId) || savedAddresses[0] || { address: currentUser?.address || 'Please add delivery address' };

  // Calculations: Selected package price takes HIGHEST priority!
  const baseSubtotal = currentPackage?.price || service?.finalPrice || service?.price || 799;
  const subtotal = appliedStarterPack ? Number(appliedStarterPack.offerPrice || 139) : baseSubtotal;
  const platformFee = Math.round(subtotal * (customerPlatformFeePercent / 100));
  const couponDiscountVal = appliedCoupon ? (appliedCoupon.discountAmount ?? (appliedCoupon.discount || 0)) : 0;
  const totalAmount = Math.max(0, subtotal + platformFee - couponDiscountVal);

  // Leaflet Map References for Select Address Step
  const activeMapRef = useRef(null);
  const activeMarkerRef = useRef(null);

  // Add Address Handler with LIVE Backend Persistence
  const handleAddNewAddress = async () => {
    if (!newFullAddress.trim()) {
      toast.error('Please enter full address');
      return;
    }
    setSavingAddress(true);
    try {
      const fullCombined = `${newFullAddress}${newFloorApt ? ', ' + newFloorApt : ''}${newLandmark ? ' (Near ' + newLandmark + ')' : ''}`;

      // Call Backend API to persist address on customer user profile in MongoDB
      const res = await customerService.addAddress({
        title: newAddressLabel,
        addressLine: fullCombined,
        city: newCity || 'Delhi NCR',
        pincode: '110001',
        isDefault: true
      });

      if (refetchCustomer) refetchCustomer();

      const newAddrId = res?.addresses ? res.addresses[res.addresses.length - 1]?._id : String(Date.now());
      const newObj = {
        id: newAddrId || String(Date.now()),
        label: newAddressLabel,
        address: fullCombined,
        type: newAddressLabel.toLowerCase()
      };

      setSavedAddresses((prev) => [...prev, newObj]);
      setSelectedAddressId(newObj.id);
      setCurrentStep('select_address');
      toast.success('Address saved to your backend profile!');
    } catch (err) {
      console.warn('Backend address save notice:', err);
      // Fallback local state sync
      const fullCombined = `${newFullAddress}${newFloorApt ? ', ' + newFloorApt : ''}${newLandmark ? ' (Near ' + newLandmark + ')' : ''}`;
      const newObj = {
        id: String(Date.now()),
        label: newAddressLabel,
        address: fullCombined,
        type: newAddressLabel.toLowerCase()
      };
      setSavedAddresses((prev) => [...prev, newObj]);
      setSelectedAddressId(newObj.id);
      setCurrentStep('select_address');
      toast.success('Address added!');
    } finally {
      setSavingAddress(false);
    }
  };

  // Live GPS Current Location Detection Handler with Form Auto-Fill
  const handleDetectCurrentLocation = async () => {
    if (detectingCurrentLocation) return;
    setDetectingCurrentLocation(true);

    const applyDetectedAddress = (geoData, fullAddr, city, lat = null, lng = null) => {
      const newAddrObj = {
        id: `current_loc_${Date.now()}`,
        label: newAddressLabel || 'Current Location',
        address: fullAddr,
        city: city || 'Delhi NCR',
        type: 'home',
        locationCoordinates: lat && lng ? { lat: Number(lat), lng: Number(lng) } : null,
      };

      setSavedAddresses((prev) => [newAddrObj, ...prev.filter((a) => !a.id.startsWith('current_loc_'))]);
      setSelectedAddressId(newAddrObj.id);

      // Auto-fill form input fields on Add New Address screen cleanly without pincode/country
      const isPincode = (str) => /^\d{5,6}$/.test(String(str || '').trim());
      const isCountryOrState = (str) => /^(india|in|up|uttar pradesh)$/i.test(String(str || '').trim());

      let cleanFull = (fullAddr || '').replace(/,?\s*\d{5,6}/g, '').replace(/,?\s*India$/i, '').trim();
      if (!cleanFull || cleanFull === 'UP' || cleanFull === 'India') cleanFull = city ? `${city}, UP` : 'Nizamabad, UP';

      setNewFullAddress(cleanFull);
      if (city) setNewCity(city);

      let bldg = geoData?.addressLine1;
      if (!bldg || isPincode(bldg) || isCountryOrState(bldg)) {
        bldg = geoData?.addressLine2 && !isPincode(geoData.addressLine2) && !isCountryOrState(geoData.addressLine2)
          ? geoData.addressLine2
          : `${city || 'Doorstep'} Premises`;
      }

      let lmark = geoData?.addressLine2 && !isCountryOrState(geoData.addressLine2) && !isPincode(geoData.addressLine2)
        ? `Near ${geoData.addressLine2}`
        : `Near ${city || 'Main Market'}`;

      setNewFloorApt(bldg);
      setNewLandmark(lmark);

      if (lat && lng && activeMapRef.current && activeMarkerRef.current) {
        activeMapRef.current.flyTo([lat, lng], 16);
        activeMarkerRef.current.setLatLng([lat, lng]);
      }

      toast.success(`📍 Location detected & address fields auto-filled!`);
    };

    const tryIpFallback = async () => {
      try {
        const ipRes = await fetch('https://ipapi.co/json/').then((r) => r.json());
        if (ipRes && (ipRes.city || ipRes.region || ipRes.latitude)) {
          const city = ipRes.city || ipRes.region || 'Delhi NCR';
          const state = ipRes.region || '';
          const country = ipRes.country_name || 'India';
          const fullAddr = `${city}${state ? `, ${state}` : ''}, ${country}`;
          const lat = Number(ipRes.latitude) || 28.6139;
          const lng = Number(ipRes.longitude) || 77.2090;
          applyDetectedAddress({ addressLine1: city, addressLine2: state }, fullAddr, city, lat, lng);
          return true;
        }
      } catch (err) {
        console.warn('IP geolocation fallback notice:', err);
      }
      return false;
    };

    if (!navigator.geolocation) {
      const success = await tryIpFallback();
      if (!success) toast.error('Geolocation is not supported by your browser.');
      setDetectingCurrentLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          const data = await geoapifyService.reverseGeocode(lat, lng);
          const formattedAddress = data?.formatted || `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
          const city = data?.city || 'Current Location';

          applyDetectedAddress(data, formattedAddress, city, lat, lng);
        } catch (err) {
          console.error('Reverse Geocoding Error:', err);
          const success = await tryIpFallback();
          if (!success) toast.error('Failed to resolve address coordinates.');
        } finally {
          setDetectingCurrentLocation(false);
        }
      },
      async (err) => {
        console.warn('GPS location access notice:', err);
        const success = await tryIpFallback();
        if (!success) toast.error('Please allow location access to auto-detect your address.');
        setDetectingCurrentLocation(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Live API Coupon Application Handler
  const handleApplyCoupon = async (cInput) => {
    const targetCode = typeof cInput === 'object' ? cInput.code : (cInput || couponCodeInput);
    if (!targetCode || !targetCode.trim()) {
      toast.error('Please enter a valid coupon code.');
      return;
    }

    setApplyingCoupon(true);
    try {
      const currentCatId = service?.category?._id || service?.category || service?.categoryId;
      const currentSrvId = service?._id || service?.serviceId;

      const res = await customerService.applyCoupon({
        code: targetCode.trim(),
        bookingAmount: subtotal,
        categoryId: currentCatId,
        serviceId: currentSrvId,
      });

      const resData = res.data?.data || res.data;
      if (resData?.coupon || resData?.applied) {
        const couponResult = resData.coupon || resData;
        setAppliedCoupon(couponResult);
        toast.success(res.data?.message || `Coupon '${couponResult.code}' applied successfully!`);
        setCouponCodeInput('');
        setCurrentStep('booking_summary');
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to apply coupon';
      toast.error(errMsg);
    } finally {
      setApplyingCoupon(false);
    }
  };

  // Start Payment & Searching Partner Radar Handler
  const handleStartPaymentAndFindingPartner = async () => {
    const isWalletMethod = selectedPaymentMethod === 'Wallets' || selectedPaymentMethod === 'Wallet';

    // 1. If Wallet payment method is selected, strictly check current customer wallet balance first
    if (isWalletMethod) {
      setLoading(true);
      let currentBal = currentUser?.walletBalance ?? 0;
      try {
        const walletRes = await customerService.getWallet();
        const data = walletRes.data?.data || walletRes.data || {};
        if (typeof data.balance === 'number') {
          currentBal = data.balance;
        }
      } catch (err) {
        console.warn('Wallet balance check notice:', err);
      }

      if (currentBal < totalAmount) {
        setLoading(false);
        toast.error(
          `❌ Insufficient NOROZZ Wallet Balance!\nYour available balance is ₹${currentBal}, but total amount is ₹${totalAmount}.\nPlease add money to your wallet or select another payment method.`,
          { duration: 6000 }
        );
        return; // STOP! Stay on 'payment' step, DO NOT create booking or switch step!
      }
    }

    // 2. Wallet balance is sufficient (or another payment method selected)
    setCurrentStep('finding_partner');
    setLoading(true);

    try {
      const res = await createBooking({
        category: service?.category?._id || service?.category || '65f0a0000000000000000001',
        service: service?.serviceId || service?._id || '65f0a0000000000000000002',
        packageId: service?.packageId || service?.package?._id || currentPackage?._id || null,
        packageName: service?.packageName || currentPackage?.title || service?.name || service?.title || 'Standard Service',
        addressTitle: activeAddressObj.label || 'Home',
        addressLine: activeAddressObj.address,
        city: activeAddressObj.city || currentUser?.city || 'Azamgarh',
        pincode: activeAddressObj.pincode || '110001',
        locationCoordinates: activeAddressObj.locationCoordinates || {
          lat: 26.0494,
          lng: 83.0565
        },
        bookingDate: new Date(),
        timeSlot: `${selectedDate} • ${selectedTimeSlot}`,
        amount: totalAmount,
        discountAmount: couponDiscountVal,
        couponCode: appliedCoupon?.code || null,
        paymentMethod: isWalletMethod ? 'Wallet' : selectedPaymentMethod
      });

      const backendBooking = res.data || res.booking || res;
      const finalBookingRef = backendBooking.bookingId || backendBooking.bookingNumber || `#NZ-${Math.floor(1000 + Math.random() * 9000)}`;

      if (backendBooking._id) {
        if (isWalletMethod) {
          if (backendBooking.paymentStatus !== 'paid') {
            try {
              const payRes = await paymentService.walletPay({
                bookingId: backendBooking._id,
                amount: totalAmount,
              });
              const payData = payRes.data?.data || payRes.data || {};
              const newWalletBal = typeof payData.walletBalance === 'number' ? payData.walletBalance : (currentUser?.walletBalance - totalAmount);
              if (updateUser) {
                updateUser({ walletBalance: Math.max(0, newWalletBal) });
              }
              toast.success(payRes.data?.message || `🎉 ₹${totalAmount} deducted from NOROZZ Wallet!`);
            } catch (wErr) {
              console.warn('Wallet pay fallback notice:', wErr);
            }
          } else {
            if (updateUser && typeof currentUser?.walletBalance === 'number') {
              updateUser({ walletBalance: Math.max(0, currentUser.walletBalance - totalAmount) });
            }
            toast.success(`🎉 ₹${totalAmount} paid successfully via NOROZZ Wallet!`);
          }
        } else {
          try {
            await payBooking({ id: backendBooking._id, paymentMethod: selectedPaymentMethod });
          } catch (e) {
            console.warn('Payment API call:', e);
          }
        }
      }

      setConfirmedOrder({
        bookingId: finalBookingRef,
        serviceTitle: service?.name || service?.title || 'Full Home Deep Cleaning',
        packageName: currentPackage.title,
        dateAndTime: `${selectedDate} • ${selectedTimeSlot}`,
        address: activeAddressObj.address,
        amount: totalAmount
      });

      setTimeout(() => {
        setLoading(false);
        setCurrentStep('booking_confirmed');
      }, 2500);

    } catch (err) {
      console.warn('Backend order payment error / fallback notice:', err);
      const errMsg = err.response?.data?.message || err.message || '';
      
      if (isWalletMethod && (errMsg.includes('Insufficient') || errMsg.includes('balance'))) {
        setLoading(false);
        setCurrentStep('payment');
        toast.error(errMsg || 'Insufficient wallet balance for payment.');
        return;
      }

      const mockRef = `#NZ-${Math.floor(2000 + Math.random() * 8000)}`;
      setConfirmedOrder({
        bookingId: mockRef,
        serviceTitle: service?.name || service?.title || 'Full Home Deep Cleaning',
        packageName: currentPackage.title,
        dateAndTime: `${selectedDate} • ${selectedTimeSlot}`,
        address: activeAddressObj.address,
        amount: totalAmount
      });

      setTimeout(() => {
        setLoading(false);
        setCurrentStep('booking_confirmed');
      }, 2500);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0b131e', color: '#ffffff', paddingBottom: '40px' }}>
      
      {/* Full Page Container Layout */}
      <div style={{ maxWidth: '520px', margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>

        {/* ========================================================================= */}
        {/* STEP 1: CHOOSE PACKAGE (Full Page View)                                   */}
        {/* ========================================================================= */}
        {currentStep === 'choose_package' && (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            {/* Header Navbar */}
            <div style={{ padding: '24px 20px 16px 20px', display: 'flex', alignItems: 'center', gap: '14px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <button
                type="button"
                onClick={onBackToServices}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '38px',
                  height: '38px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  cursor: 'pointer'
                }}
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: '#ffffff' }}>
                  Choose Package
                </h2>
                <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '2px 0 0 0' }}>
                  {service?.name || 'Home Deep Cleaning'} • Select tier
                </p>
              </div>
            </div>

            {/* Scrollable Package Options */}
            <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {packageList.map((pkg, index) => {
                const isSelected = selectedPackageIndex === index;

                return (
                  <div
                    key={pkg.id}
                    onClick={() => {
                      setSelectedPackageIndex(index);
                      setSelectedPackageId(pkg._id || pkg.id);
                    }}
                    style={{
                      position: 'relative',
                      background: isSelected ? '#111f30' : '#141d2b',
                      border: isSelected ? '2px solid #10b981' : '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '20px',
                      padding: '22px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: isSelected ? '0 10px 30px -8px rgba(16, 185, 129, 0.3)' : 'none'
                    }}
                  >
                    {pkg.isPopular && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '-12px',
                          left: '20px',
                          background: '#10b981',
                          color: '#042f1a',
                          fontSize: '0.68rem',
                          fontWeight: '900',
                          padding: '4px 12px',
                          borderRadius: '9999px',
                          letterSpacing: '0.6px',
                          textTransform: 'uppercase'
                        }}
                      >
                        MOST POPULAR
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#ffffff', margin: 0 }}>
                        {pkg.title}
                      </h3>
                      <span style={{ fontSize: '1.35rem', fontWeight: '900', color: '#ffffff' }}>
                        {pkg.formattedPrice}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {pkg.features.map((feat, fIdx) => (
                        <div key={fIdx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: '#94a3b8' }}>
                          <span style={{ color: '#64748b', fontSize: '1.2rem', lineHeight: 1 }}>•</span>
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Full-width Sticky Action Button */}
            <div style={{ padding: '20px', position: 'sticky', bottom: 0, background: '#0b131e', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <button
                type="button"
                onClick={() => setCurrentStep('select_address')}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#ffffff',
                  fontWeight: '800',
                  fontSize: '1rem',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)'
                }}
              >
                Continue with {currentPackage.title.split(' ')[0]}
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: SELECT ADDRESS (Full Page View matching Mockup)                   */}
        {/* ========================================================================= */}
        {currentStep === 'select_address' && (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            {/* Header Navbar */}
            <div style={{ padding: '20px 20px 14px 20px', display: 'flex', alignItems: 'center', gap: '14px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <button
                type="button"
                onClick={() => setCurrentStep('choose_package')}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '38px',
                  height: '38px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  cursor: 'pointer'
                }}
              >
                <ArrowLeft size={20} />
              </button>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: '#ffffff' }}>
                Select Address
              </h2>
            </div>

            <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Live Interactive Leaflet Map Box */}
              <AddressMapPicker
                onLocateGps={handleDetectCurrentLocation}
                isLocating={detectingCurrentLocation}
                onLocationSelect={(fullAddr, city, lat, lng) => {
                  const newAddrObj = {
                    id: `pin_loc_${Date.now()}`,
                    label: 'Use Current Location',
                    address: fullAddr,
                    city: city || 'Delhi NCR',
                    type: 'home',
                    locationCoordinates: lat && lng ? { lat: Number(lat), lng: Number(lng) } : null
                  };
                  setSavedAddresses((prev) => [newAddrObj, ...prev.filter((a) => a.id !== newAddrObj.id)]);
                  setSelectedAddressId(newAddrObj.id);
                  setNewFullAddress(fullAddr);
                  if (city) setNewCity(city);
                }}
                onMapReady={(map, marker) => {
                  activeMapRef.current = map;
                  activeMarkerRef.current = marker;
                }}
              />

              {/* Saved Addresses Section */}
              <div>
                <h3 style={{ fontSize: '0.98rem', fontWeight: '800', color: '#ffffff', marginBottom: '14px' }}>
                  Saved Addresses
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Primary "Use Current Location" Card Item */}
                  <div
                    onClick={handleDetectCurrentLocation}
                    style={{
                      background: selectedAddressId?.startsWith('current_loc_') || selectedAddressId === 'use_current_location' ? 'rgba(16, 185, 129, 0.12)' : '#141d2b',
                      border: selectedAddressId?.startsWith('current_loc_') || selectedAddressId === 'use_current_location' ? '1.5px solid #10b981' : '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '20px',
                      padding: '16px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      cursor: detectingCurrentLocation ? 'wait' : 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: selectedAddressId?.startsWith('current_loc_') ? '0 4px 20px rgba(16, 185, 129, 0.15)' : 'none'
                    }}
                  >
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '14px',
                        background: 'rgba(16, 185, 129, 0.18)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#10b981',
                        flexShrink: 0
                      }}
                    >
                      {detectingCurrentLocation ? <Loader2 size={20} className="spin" /> : <Navigation size={20} color="#10b981" />}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.98rem', fontWeight: '800', color: '#ffffff', marginBottom: '2px' }}>
                        Use Current Location
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.35, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {detectingCurrentLocation ? 'Detecting GPS coordinates & address...' : (newFullAddress || currentUser?.address || 'Tap to detect exact GPS location')}
                      </div>
                    </div>

                    <div
                      style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        border: (selectedAddressId?.startsWith('current_loc_') || selectedAddressId === 'use_current_location') ? '2px solid #10b981' : '2px solid #334155',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      {(selectedAddressId?.startsWith('current_loc_') || selectedAddressId === 'use_current_location') && (
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
                      )}
                    </div>
                  </div>
                  {/* Saved User Profile Address Cards (Home, Office, etc.) */}
                  {savedAddresses
                    .filter(
                      (addr) =>
                        !addr.id.startsWith('current_loc_') &&
                        !addr.id.startsWith('pin_loc_') &&
                        addr.label !== 'Use Current Location' &&
                        addr.label !== 'Current Location'
                    )
                    .map((addr) => {
                    const isSelected = selectedAddressId === addr.id;
                    const isCurrentLoc = addr.id.startsWith('current_loc_') || addr.id.startsWith('pin_loc_') || addr.label === 'Use Current Location';

                    return (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        style={{
                          background: isSelected ? 'rgba(16, 185, 129, 0.08)' : '#141d2b',
                          border: isSelected ? '1.5px solid #10b981' : '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: '20px',
                          padding: '16px 18px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '14px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          boxShadow: isSelected ? '0 4px 20px rgba(16, 185, 129, 0.15)' : 'none'
                        }}
                      >
                        <div
                          style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '14px',
                            background: isSelected ? 'rgba(16, 185, 129, 0.18)' : 'rgba(255, 255, 255, 0.05)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#10b981',
                            flexShrink: 0
                          }}
                        >
                          {isCurrentLoc ? (
                            <Navigation size={20} color="#10b981" />
                          ) : addr.type === 'office' ? (
                            <Briefcase size={20} color="#10b981" />
                          ) : (
                            <Home size={20} color="#10b981" />
                          )}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.98rem', fontWeight: '800', color: '#ffffff', marginBottom: '2px' }}>
                            {isCurrentLoc ? 'Use Current Location' : addr.label}
                          </div>
                          <div style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.35, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {addr.address}
                          </div>
                        </div>

                        <div
                          style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            border: isSelected ? '2px solid #10b981' : '2px solid #334155',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          {isSelected && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />}
                        </div>
                      </div>
                    );
                  })}

                  {/* Add New Address Dashed Card */}
                  <div
                    onClick={() => setCurrentStep('add_address')}
                    style={{
                      border: '1.5px dashed #10b981',
                      borderRadius: '20px',
                      padding: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      color: '#10b981',
                      fontWeight: '800',
                      fontSize: '0.95rem',
                      cursor: 'pointer',
                      background: 'rgba(16, 185, 129, 0.04)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Plus size={20} color="#10b981" />
                    <span>Add New Address</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Sticky Action Button */}
            <div style={{ padding: '20px', position: 'sticky', bottom: 0, background: '#0b131e', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <button
                type="button"
                onClick={() => setCurrentStep('booking_summary')}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#ffffff',
                  fontWeight: '800',
                  fontSize: '1rem',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)'
                }}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2.5: ADD NEW ADDRESS (Full Page View matching Mockup)                */}
        {/* ========================================================================= */}
        {currentStep === 'add_address' && (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            {/* Header Navbar */}
            <div style={{ padding: '20px 20px 14px 20px', display: 'flex', alignItems: 'center', gap: '14px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <button
                type="button"
                onClick={() => setCurrentStep('select_address')}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '38px',
                  height: '38px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  cursor: 'pointer'
                }}
              >
                <ArrowLeft size={20} />
              </button>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: '#ffffff' }}>
                Add New Address
              </h2>
            </div>

            <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Interactive Leaflet Map Box */}
              <AddressMapPicker
                onLocateGps={handleDetectCurrentLocation}
                isLocating={detectingCurrentLocation}
                onLocationSelect={(fullAddr, city, lat, lng) => {
                  let cleanFull = (fullAddr || '').replace(/,?\s*\d{5,6}/g, '').replace(/,?\s*India$/i, '').trim();
                  if (!cleanFull || cleanFull === 'UP' || cleanFull === 'India') cleanFull = city ? `${city}, UP` : 'Nizamabad, UP';
                  setNewFullAddress(cleanFull);
                  if (city) setNewCity(city);
                }}
                onMapReady={(map, marker) => {
                  activeMapRef.current = map;
                  activeMarkerRef.current = marker;
                }}
              />

              {/* Address Label Selector */}
              <div>
                <label style={{ fontSize: '0.86rem', fontWeight: '700', color: '#94a3b8', display: 'block', marginBottom: '10px' }}>
                  Address Label
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {[
                    { label: 'Home', icon: <Home size={16} /> },
                    { label: 'Office', icon: <Briefcase size={16} /> },
                    { label: 'Current', icon: <MapPin size={16} /> }
                  ].map((item) => {
                    const active = newAddressLabel === item.label;
                    return (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => {
                          setNewAddressLabel(item.label);
                          if (item.label === 'Current') {
                            handleDetectCurrentLocation();
                          }
                        }}
                        style={{
                          flex: 1,
                          padding: '12px 14px',
                          borderRadius: '9999px',
                          background: active ? 'rgba(16, 185, 129, 0.15)' : '#141d2b',
                          border: active ? '1.5px solid #10b981' : '1px solid rgba(255, 255, 255, 0.1)',
                          color: active ? '#10b981' : '#94a3b8',
                          fontWeight: '800',
                          fontSize: '0.88rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Full Address Input */}
              <div>
                <label style={{ fontSize: '0.86rem', fontWeight: '700', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>
                  Full Address
                </label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={18} color="#10b981" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    value={newFullAddress}
                    onChange={(e) => setNewFullAddress(e.target.value)}
                    placeholder="91 Orchard St, New York, NY 10002"
                    style={{
                      width: '100%',
                      padding: '16px 16px 16px 48px',
                      borderRadius: '16px',
                      background: '#141d2b',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#ffffff',
                      fontSize: '0.92rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Floor / Flat / Building No. Input */}
              <div>
                <label style={{ fontSize: '0.86rem', fontWeight: '700', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>
                  Floor / Flat / Building No.
                </label>
                <div style={{ position: 'relative' }}>
                  <Layers size={18} color="#64748b" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    value={newFloorApt}
                    onChange={(e) => setNewFloorApt(e.target.value)}
                    placeholder="e.g. 4th Floor, Apt 4B"
                    style={{
                      width: '100%',
                      padding: '16px 16px 16px 48px',
                      borderRadius: '16px',
                      background: '#141d2b',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#ffffff',
                      fontSize: '0.92rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Landmark Input */}
              <div>
                <label style={{ fontSize: '0.86rem', fontWeight: '700', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>
                  Landmark
                </label>
                <div style={{ position: 'relative' }}>
                  <Compass size={18} color="#64748b" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    value={newLandmark}
                    onChange={(e) => setNewLandmark(e.target.value)}
                    placeholder="e.g. Next to Orchard Cafe"
                    style={{
                      width: '100%',
                      padding: '16px 16px 16px 48px',
                      borderRadius: '16px',
                      background: '#141d2b',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#ffffff',
                      fontSize: '0.92rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Bottom Sticky Action Button */}
            <div style={{ padding: '20px', position: 'sticky', bottom: 0, background: '#0b131e', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <button
                type="button"
                onClick={handleAddNewAddress}
                disabled={savingAddress}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#ffffff',
                  fontWeight: '800',
                  fontSize: '1rem',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {savingAddress ? <Loader2 size={18} className="spin" /> : 'Save Address'}
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: BOOKING SUMMARY (Full Page View)                                  */}
        {/* ========================================================================= */}
        {currentStep === 'booking_summary' && (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            {/* Header Navbar */}
            <div style={{ padding: '24px 20px 16px 20px', display: 'flex', alignItems: 'center', gap: '14px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <button
                type="button"
                onClick={() => setCurrentStep('select_address')}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '38px',
                  height: '38px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  cursor: 'pointer'
                }}
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: '#ffffff' }}>
                  Booking Summary
                </h2>
                <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '2px 0 0 0' }}>
                  Review package details
                </p>
              </div>
            </div>

            <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Service Preview Card */}
              <div
                style={{
                  background: '#141d2b',
                  borderRadius: '20px',
                  padding: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}
              >
                <div
                  style={{
                    width: '70px',
                    height: '70px',
                    borderRadius: '14px',
                    background: service?.thumbnail ? `url(${service.thumbnail}) center/cover` : 'linear-gradient(135deg, #10b981 0%, #0284c7 100%)',
                    flexShrink: 0
                  }}
                />
                <div>
                  <span
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      color: '#94a3b8',
                      fontSize: '0.65rem',
                      fontWeight: '800',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      textTransform: 'uppercase'
                    }}
                  >
                    HOME CLEANING
                  </span>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#ffffff', margin: '4px 0 2px 0' }}>
                    {service?.name || service?.title || 'Premium Deep Cleaning'}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Star size={13} fill="#f59e0b" color="#f59e0b" />
                    <span style={{ color: '#f59e0b', fontWeight: '700' }}>4.9</span>
                    <span>(124 reviews)</span>
                  </div>
                </div>
              </div>

              {/* Date & Time Picker Card */}
              <div
                onClick={() => setIsSlotPickerOpen(!isSlotPickerOpen)}
                style={{
                  background: '#141d2b',
                  borderRadius: '18px',
                  padding: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <Calendar size={20} color="#10b981" />
                  <div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700' }}>Date & Time</div>
                    <div style={{ fontSize: '0.92rem', fontWeight: '800', color: '#ffffff', marginTop: '2px' }}>
                      {selectedDate} • {selectedTimeSlot}
                    </div>
                  </div>
                </div>
                <ChevronRight size={20} color="#64748b" />
              </div>

              {/* Date & Time Slot Dropdown Drawer */}
              {isSlotPickerOpen && (
                <div style={{ background: '#111927', padding: '18px', borderRadius: '18px', border: '1px solid #10b981' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#10b981', marginBottom: '10px' }}>
                    Select Booking Date
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                    {availableDates.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setSelectedDate(d)}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '10px',
                          background: selectedDate === d ? '#10b981' : '#1a2638',
                          color: selectedDate === d ? '#042f1a' : '#ffffff',
                          fontWeight: '800',
                          fontSize: '0.78rem',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        {d}
                      </button>
                    ))}
                  </div>

                  <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#10b981', marginBottom: '10px' }}>
                    Select Preferred Time Slot
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {availableTimeSlots.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => { setSelectedTimeSlot(t); setIsSlotPickerOpen(false); }}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '10px',
                          background: selectedTimeSlot === t ? '#10b981' : '#1a2638',
                          color: selectedTimeSlot === t ? '#042f1a' : '#ffffff',
                          fontWeight: '800',
                          fontSize: '0.78rem',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Apply Coupon Code Card */}
              <div
                onClick={() => setCurrentStep('apply_coupon')}
                style={{
                  background: '#141d2b',
                  borderRadius: '18px',
                  padding: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <Tag size={20} color="#10b981" />
                  <span style={{ fontSize: '0.95rem', fontWeight: '800', color: '#ffffff' }}>
                    {appliedCoupon ? `Coupon (${appliedCoupon.code}) Applied` : 'Apply Coupon Code'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {appliedCoupon && (
                    <span style={{ fontSize: '0.82rem', color: '#10b981', fontWeight: '800' }}>
                      -₹{couponDiscountVal}
                    </span>
                  )}
                  <ChevronRight size={20} color="#64748b" />
                </div>
              </div>

              {/* Payment Breakdown (Transparent Customer Platform Fee) */}
              <div style={{ marginTop: '10px' }}>
                <h3 style={{ fontSize: '0.92rem', fontWeight: '700', color: '#94a3b8', marginBottom: '12px' }}>
                  Payment & Fee Breakdown
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                    <span>Service Price</span>
                    <span style={{ color: '#ffffff', fontWeight: '800' }}>₹{subtotal.toLocaleString()}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                    <span>Customer Platform Fee ({customerPlatformFeePercent}%)</span>
                    <span style={{ color: '#38bdf8', fontWeight: '800' }}>+ ₹{platformFee.toLocaleString()}</span>
                  </div>

                  {couponDiscountVal > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981' }}>
                      <span>Discount ({appliedCoupon.code})</span>
                      <span style={{ fontWeight: '800' }}>- ₹{couponDiscountVal.toLocaleString()}</span>
                    </div>
                  )}

                  <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.08)', margin: '6px 0' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: '900' }}>
                    <span style={{ color: '#ffffff' }}>Final Payable Amount</span>
                    <span style={{ color: '#10b981' }}>₹{totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Sticky Action Button */}
            <div style={{ padding: '20px', position: 'sticky', bottom: 0, background: '#0b131e', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <button
                type="button"
                onClick={() => setCurrentStep('payment')}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#ffffff',
                  fontWeight: '800',
                  fontSize: '1rem',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)'
                }}
              >
                ₹{totalAmount.toLocaleString()} • Proceed to Pay
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: APPLY COUPON (Full Page View)                                     */}
        {/* ========================================================================= */}
        {currentStep === 'apply_coupon' && (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            {/* Header Navbar */}
            <div style={{ padding: '24px 20px 16px 20px', display: 'flex', alignItems: 'center', gap: '14px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <button
                type="button"
                onClick={() => setCurrentStep('booking_summary')}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '38px',
                  height: '38px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  cursor: 'pointer'
                }}
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: '#ffffff' }}>
                  Apply Coupon
                </h2>
                <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '2px 0 0 0' }}>
                  Save extra on your order
                </p>
              </div>
            </div>

            <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Promo Code Input Form */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <input
                  type="text"
                  value={couponCodeInput}
                  onChange={(e) => setCouponCodeInput(e.target.value)}
                  placeholder="Enter promo code"
                  style={{
                    flex: 1,
                    padding: '14px 16px',
                    borderRadius: '14px',
                    background: '#141d2b',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                    fontSize: '0.92rem',
                    outline: 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleApplyCoupon(couponCodeInput || 'FIRST30')}
                  style={{
                    padding: '14px 22px',
                    borderRadius: '14px',
                    background: '#10b981',
                    color: '#042f1a',
                    fontWeight: '900',
                    fontSize: '0.92rem',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Apply
                </button>
              </div>

              {/* Available Coupons */}
              <div>
                <h3 style={{ fontSize: '0.92rem', fontWeight: '700', color: '#94a3b8', marginBottom: '14px' }}>
                  Available Coupons
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {couponsList.map((c) => (
                    <div
                      key={c.code}
                      style={{
                        background: '#141d2b',
                        border: '1px dashed rgba(16, 185, 129, 0.4)',
                        borderRadius: '18px',
                        padding: '18px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '1.05rem', fontWeight: '900', color: '#10b981', letterSpacing: '0.5px' }}>
                          {c.code}
                        </span>
                        <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#10b981' }}>
                          {c.badgeText}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#ffffff', marginBottom: '4px' }}>
                        {c.title}
                      </div>

                      {c.applicableCategory ? (
                        <div style={{ fontSize: '0.72rem', color: '#60a5fa', marginBottom: '6px', fontWeight: '800' }}>
                          📁 Valid on {typeof c.applicableCategory === 'object' ? c.applicableCategory.name : 'selected category'} services only
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: '6px', fontWeight: '500' }}>
                          🌐 Valid on all services
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{c.subtitle}</span>
                        <button
                          type="button"
                          onClick={() => handleApplyCoupon(c)}
                          style={{
                            background: 'rgba(16, 185, 129, 0.15)',
                            color: '#10b981',
                            border: 'none',
                            padding: '6px 14px',
                            borderRadius: '10px',
                            fontWeight: '900',
                            fontSize: '0.78rem',
                            cursor: 'pointer'
                          }}
                        >
                          APPLY
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 5: PAYMENT (Full Page View)                                          */}
        {/* ========================================================================= */}
        {currentStep === 'payment' && (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            {/* Header Navbar */}
            <div style={{ padding: '24px 20px 16px 20px', display: 'flex', alignItems: 'center', gap: '14px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <button
                type="button"
                onClick={() => setCurrentStep('booking_summary')}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '38px',
                  height: '38px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  cursor: 'pointer'
                }}
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: '#ffffff' }}>
                  Payment
                </h2>
                <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '2px 0 0 0' }}>
                  Choose preferred payment option
                </p>
              </div>
            </div>

            <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '22px' }}>
              {/* Amount Payable Box */}
              <div
                style={{
                  background: '#141d2b',
                  borderRadius: '20px',
                  padding: '20px',
                  textAlign: 'center',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}
              >
                <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: '700', marginBottom: '2px' }}>
                  Amount to Pay
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '900', color: '#ffffff' }}>
                  ₹{totalAmount.toLocaleString()}
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <h3 style={{ fontSize: '0.92rem', fontWeight: '700', color: '#94a3b8', marginBottom: '14px' }}>
                  Select Payment Method
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {[
                    { id: 'UPI', label: 'UPI (Google Pay / PhonePe)', icon: <Smartphone size={20} /> },
                    { id: 'Card', label: 'Credit / Debit Card', icon: <CreditCard size={20} /> },
                    { id: 'NetBanking', label: 'Net Banking', icon: <Landmark size={20} /> },
                    { id: 'Wallets', label: 'Wallets', icon: <Tag size={20} /> }
                  ].map((pm) => {
                    const isSelected = selectedPaymentMethod === pm.id;
                    return (
                      <div
                        key={pm.id}
                        onClick={() => setSelectedPaymentMethod(pm.id)}
                        style={{
                          background: isSelected ? '#111f30' : '#141d2b',
                          border: isSelected ? '2px solid #10b981' : '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: '18px',
                          padding: '18px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <span style={{ color: isSelected ? '#10b981' : '#64748b' }}>{pm.icon}</span>
                          <span style={{ fontSize: '0.95rem', fontWeight: '800', color: '#ffffff' }}>
                            {pm.label}
                          </span>
                        </div>

                        <div
                          style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            border: isSelected ? '2px solid #10b981' : '2px solid #475569',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {isSelected && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 100% Safe Badge */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.82rem', color: '#10b981', marginTop: '8px' }}>
                <ShieldCheck size={18} />
                <span>100% Safe & Secure Payments</span>
              </div>
            </div>

            {/* Bottom Sticky Action Button */}
            <div style={{ padding: '20px', position: 'sticky', bottom: 0, background: '#0b131e', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <button
                type="button"
                onClick={handleStartPaymentAndFindingPartner}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#ffffff',
                  fontWeight: '800',
                  fontSize: '1rem',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)'
                }}
              >
                Pay ₹{totalAmount.toLocaleString()}
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 6: FINDING SERVICE PARTNER RADAR (Full Page View)                    */}
        {/* ========================================================================= */}
        {currentStep === 'finding_partner' && (
          <div
            style={{
              padding: '60px 24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#10b981', marginBottom: '2px', letterSpacing: '0.5px' }}>
              Norozz
            </div>
            <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '56px' }}>
              Home Deep Cleaning
            </div>

            {/* Pulsing Sonar Radar Wave Rings */}
            <div
              style={{
                position: 'relative',
                width: '180px',
                height: '180px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '56px'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  border: '1.5px solid rgba(16, 185, 129, 0.25)',
                  animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite'
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: '24px',
                  borderRadius: '50%',
                  border: '1.5px solid rgba(16, 185, 129, 0.4)'
                }}
              />
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: '#10b981',
                  boxShadow: '0 0 40px #10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Loader2 size={28} color="#042f1a" className="spin" />
              </div>
            </div>

            <h2 style={{ fontSize: '1.35rem', fontWeight: '900', color: '#ffffff', marginBottom: '8px' }}>
              Finding your service partner...
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', maxWidth: '300px', lineHeight: 1.5, margin: '0 0 48px 0' }}>
              This usually takes 30-60 seconds. We are searching for the best expert near you.
            </p>

            <button
              type="button"
              onClick={() => setCurrentStep('payment')}
              style={{
                background: 'transparent',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#ef4444',
                padding: '12px 28px',
                borderRadius: '14px',
                fontWeight: '800',
                fontSize: '0.88rem',
                cursor: 'pointer'
              }}
            >
              Cancel Request
            </button>

            <style>{`
              @keyframes ping {
                75%, 100% {
                  transform: scale(1.35);
                  opacity: 0;
                }
              }
            `}</style>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 7: BOOKING CONFIRMED SUCCESS (Full Page View)                        */}
        {/* ========================================================================= */}
        {currentStep === 'booking_confirmed' && (
          <div
            style={{
              padding: '48px 24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              textAlign: 'center'
            }}
          >
            {/* Success Checkmark Ring */}
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '2px solid #10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10b981',
                marginBottom: '24px',
                boxShadow: '0 0 30px rgba(16, 185, 129, 0.4)'
              }}
            >
              <CheckCircle2 size={44} />
            </div>

            <h2 style={{ fontSize: '1.6rem', fontWeight: '900', color: '#ffffff', margin: '0 0 8px 0' }}>
              Booking Confirmed!
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#64748b', margin: '0 0 18px 0' }}>
              Your deep cleaning has been successfully scheduled.
            </p>

            <span
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#10b981',
                fontSize: '0.82rem',
                fontWeight: '800',
                padding: '6px 16px',
                borderRadius: '9999px',
                marginBottom: '28px',
                display: 'inline-block'
              }}
            >
              Booking ID: {confirmedOrder?.bookingId || '#NZ-2847'}
            </span>

            {/* Summary Details Card */}
            <div
              style={{
                width: '100%',
                background: '#141d2b',
                borderRadius: '20px',
                padding: '20px',
                textAlign: 'left',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                marginBottom: '32px',
                fontSize: '0.88rem'
              }}
            >
              <div style={{ fontWeight: '900', color: '#ffffff', fontSize: '1.05rem', marginBottom: '10px' }}>
                {confirmedOrder?.serviceTitle || 'Full Home Deep Cleaning'}
              </div>
              <div style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Calendar size={16} color="#10b981" />
                <span>{confirmedOrder?.dateAndTime || 'Sat, March 15 • 10:30 AM'}</span>
              </div>
              <div style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={16} color="#10b981" />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {confirmedOrder?.address || '91 Orchard St, New York, NY 10002'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <button
                type="button"
                onClick={onNavigateToBookings}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#ffffff',
                  fontWeight: '900',
                  fontSize: '1rem',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)'
                }}
              >
                Track Booking
              </button>

              <button
                type="button"
                onClick={onBackToServices}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '16px',
                  background: 'transparent',
                  color: '#94a3b8',
                  fontWeight: '800',
                  fontSize: '1rem',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  cursor: 'pointer'
                }}
              >
                Back to Home
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default BookingFlowPage;
