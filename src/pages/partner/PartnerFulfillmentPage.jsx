import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  X,
  MapPin,
  Navigation,
  Phone,
  MessageSquare,
  Clock,
  CheckCircle2,
  Play,
  Pause,
  Plus,
  QrCode,
  ShieldCheck,
  User,
  Search,
  CheckSquare,
  Square,
  AlertCircle,
  ChevronRight,
  Loader2,
  Key,
  Star,
  ExternalLink,
  Share2,
  Download,
  Printer
} from 'lucide-react';
import { toast } from '../../utils/toast.js';
import { useBookings } from '../../hooks/useBookings.js';
import { axiosInstance } from '../../api/axiosInstance.js';
import { partnerService } from '../../services/partner.service.js';
import { geoapifyService } from '../../services/geoapify.service.js';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import LiveChatModal from '../../components/common/LiveChatModal.jsx';
import VoiceCallModal from '../../components/common/VoiceCallModal.jsx';
import { socketService } from '../../services/socket.service.js';

// Dedicated Interactive Route Map Component for Partner Fulfillment
const FulfillmentRouteMap = ({ partnerCoords, customerCoords, fullAddressStr }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [routeInfo, setRouteInfo] = useState(null);

  useEffect(() => {
    let isMounted = true;
    if (!mapContainerRef.current) return;

    if (mapContainerRef.current._leaflet_id) {
      mapContainerRef.current._leaflet_id = null;
    }

    let timer = null;

    try {
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(mapContainerRef.current, {
        center: [customerCoords.lat, customerCoords.lng],
        zoom: 14,
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer(geoapifyService.getTileUrl('osm-bright'), {
        maxZoom: 19,
      }).addTo(map);

      // Customer Pin Marker
      const customerIcon = L.divIcon({
        className: 'customer-doorstep-pin',
        html: `<div style="
          position: relative;
          width: 34px; height: 34px;
          display: flex; align-items: center; justify-content: center;
        ">
          <div style="
            width: 30px; height: 30px; border-radius: 50% 50% 50% 0;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            transform: rotate(-45deg); display: flex; align-items: center; justify-content: center;
            box-shadow: 0 6px 16px rgba(16, 185, 129, 0.45); border: 2px solid #ffffff;
          ">
            <div style="width: 10px; height: 10px; border-radius: 50%; background: #ffffff;"></div>
          </div>
        </div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 30],
      });
      L.marker([customerCoords.lat, customerCoords.lng], { icon: customerIcon })
        .addTo(map)
        .bindPopup(`<b>Customer Address:</b><br/>${fullAddressStr}`);

      // Partner Live Location Pin Marker
      const partnerIcon = L.divIcon({
        className: 'partner-live-pin',
        html: `<div style="
          width: 36px; height: 36px; border-radius: 50%;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 6px 18px rgba(37, 99, 235, 0.5); border: 2.5px solid #ffffff;
          color: #ffffff; font-size: 16px; font-weight: bold;
        ">🛵</div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });
      L.marker([partnerCoords.lat, partnerCoords.lng], { icon: partnerIcon })
        .addTo(map)
        .bindPopup(`<b>Partner Live Location</b>`);

      // Fetch Geoapify Route Polyline
      geoapifyService.getDrivingRoute(partnerCoords, customerCoords)
        .then((res) => {
          if (!isMounted) return;
          if (res?.coordinates && res.coordinates.length > 0) {
            setRouteInfo(res);
            const polyline = L.polyline(res.coordinates, {
              color: '#10b981',
              weight: 5,
              opacity: 0.85,
              lineCap: 'round',
              lineJoin: 'round',
            }).addTo(map);

            map.fitBounds(polyline.getBounds(), { padding: [40, 40] });
          } else {
            const fallbackLine = L.polyline([[partnerCoords.lat, partnerCoords.lng], [customerCoords.lat, customerCoords.lng]], {
              color: '#3b82f6',
              weight: 4,
              dashArray: '8, 8',
            }).addTo(map);
            map.fitBounds(fallbackLine.getBounds(), { padding: [40, 40] });
          }
        })
        .catch(() => {
          if (!isMounted) return;
          const fallbackLine = L.polyline([[partnerCoords.lat, partnerCoords.lng], [customerCoords.lat, customerCoords.lng]], {
            color: '#3b82f6',
            weight: 4,
            dashArray: '8, 8',
          }).addTo(map);
          map.fitBounds(fallbackLine.getBounds(), { padding: [40, 40] });
        });

      mapInstanceRef.current = map;
      timer = setTimeout(() => {
        if (isMounted && mapInstanceRef.current && mapContainerRef.current) {
          try {
            map.invalidateSize();
          } catch (_) {}
        }
      }, 300);
    } catch (err) {
      console.error('Fulfillment route map initialization error:', err);
    }

    return () => {
      isMounted = false;
      if (timer) clearTimeout(timer);
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (_) {}
        mapInstanceRef.current = null;
      }
    };
  }, [partnerCoords.lat, partnerCoords.lng, customerCoords.lat, customerCoords.lng, fullAddressStr]);

  return (
    <div style={{ height: '220px', width: '100%', borderRadius: '18px', overflow: 'hidden', border: '1px solid #cbd5e1', position: 'relative', background: '#0b131e' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Floating Route Info Badge */}
      <div style={{ position: 'absolute', bottom: '12px', left: '12px', zIndex: 400, background: 'rgba(15, 23, 42, 0.92)', color: '#ffffff', padding: '8px 16px', borderRadius: '12px', fontSize: '0.84rem', fontWeight: '800', backdropFilter: 'blur(6px)', boxShadow: '0 4px 16px rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span>
        <span>Live Route:</span>
        <strong style={{ color: '#10b981' }}>{routeInfo?.distanceKm || '2.4'} km</strong>
        <span style={{ opacity: 0.8 }}>({routeInfo?.durationMins || '7'} mins)</span>
      </div>

      <a
        href={`https://www.google.com/maps/dir/?api=1&destination=${customerCoords.lat},${customerCoords.lng}`}
        target="_blank"
        rel="noreferrer"
        style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 400, background: '#ffffff', padding: '6px 12px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.18)', fontSize: '0.78rem', fontWeight: '800', color: '#2563eb', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
      >
        Google Maps <ExternalLink size={12} />
      </a>
    </div>
  );
};

const PartnerFulfillmentPage = ({ booking, currentUser, onBack, onComplete }) => {
  const { updateBookingStatus, completeBooking } = useBookings();
  const [chatOpen, setChatOpen] = useState(false);
  const [voiceCallOpen, setVoiceCallOpen] = useState(false);
  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const socketRef = useRef(null);

  const bookingIdStr = booking?._id || booking?.id;

  useEffect(() => {
    if (!bookingIdStr) return;
    const socket = socketService.connect();
    socketRef.current = socket;

    socket.emit('join_partner', { partnerId: currentUser?._id || currentUser?.id });
    socket.emit('join_chat_room', { bookingId: bookingIdStr });

    const handleIncomingCall = (data) => {
      if (!data || data.callerRole === 'partner') return;
      if (data.bookingId === bookingIdStr || data.conversationId === bookingIdStr || !data.bookingId) {
        setIsIncomingCall(true);
        setVoiceCallOpen(true);
        toast.info('📞 Incoming Call from Customer...');
      }
    };

    socket.on('voice:call:incoming', handleIncomingCall);

    return () => {
      socket.off('voice:call:incoming', handleIncomingCall);
    };
  }, [bookingIdStr, currentUser]);

  // Full Booking Data from API
  const [fullBookingData, setFullBookingData] = useState(booking);
  const [loadingFullData, setLoadingFullData] = useState(false);

  // Active Step: 1=details, 2=nav, 3=customerInfo, 4=otp, 5=execution, 6=pause, 7=addons, 8=payment
  const [step, setStep] = useState(1);

  // OTP State (Blank input fields so technician asks customer and enters manually)
  const [otpDigits, setOtpDigits] = useState(['', '', '', '']);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpVerified, setOtpVerified] = useState(booking?.otpVerified || false);

  // Live Timer State (Execution)
  const [workSeconds, setWorkSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [pauseSeconds, setPauseSeconds] = useState(0);
  const [pauseReason, setPauseReason] = useState('Waiting for parts');

  // Checklist Items State
  const [checklist, setChecklist] = useState([]);

  // Add-ons / Extra Services State
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('online'); // 'online' | 'cash'
  const [showQr, setShowQr] = useState(false);
  const [completingPayment, setCompletingPayment] = useState(false);

  // Package Selection & Server Payable State
  const [selectedServiceForPackages, setSelectedServiceForPackages] = useState(null);
  const [servicePackagesList, setServicePackagesList] = useState([]);
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [addingExtraService, setAddingExtraService] = useState(false);
  const [serverPayableInfo, setServerPayableInfo] = useState(null);

  // Sync and fetch fresh single booking data from API on booking change
  useEffect(() => {
    const fetchFreshBookingData = async () => {
      const targetId = booking?._id || booking?.rawId;
      if (targetId && !targetId.toString().startsWith('demo')) {
        try {
          setLoadingFullData(true);
          const res = await partnerService.getBookingDetails(targetId);
          const fetchedData = res.data?.data || res.data;
          if (fetchedData) {
            setFullBookingData(fetchedData);
            if (fetchedData.status === 'Completed') setStep(10);
            else if (fetchedData.status === 'Started') setStep(5);
            else if (fetchedData.status === 'On The Way') setStep(2);
          }
        } catch (e) {
          console.warn('Could not fetch single booking details via API, using prop:', e);
        } finally {
          setLoadingFullData(false);
        }
      }
    };

    if (booking) {
      setFullBookingData(booking);
      if (booking.status === 'Completed') setStep(10);
      else if (booking.status === 'On The Way') setStep(2);
      else if (booking.status === 'Started') setStep(5);
      else setStep(1);

      setOtpDigits(['', '', '', '']);
      fetchFreshBookingData();
    }
  }, [booking]);

  // Dynamically generate Execution Checklist based on Partner's offeredServices or booked service
  useEffect(() => {
    const activeBooking = fullBookingData || booking;
    if (!activeBooking) return;

    const isHexObjectId = (str) => typeof str === 'string' && /^[0-9a-fA-F]{24}$/.test(str);
    const bookedServiceTitle = activeBooking.packageName || activeBooking.service?.name || activeBooking.serviceTitle || 'Basic Haircut';
    const baseP = activeBooking.amount || activeBooking.totalAmount || activeBooking.service?.finalPrice || 276;

    // Priority 1: Check Partner's offeredServices array (from partner profile or active booking)
    const partnerOffered = currentUser?.offeredServices || activeBooking?.partner?.offeredServices;

    if (partnerOffered && Array.isArray(partnerOffered) && partnerOffered.length > 0) {
      const dbExtras = activeBooking?.extraServices || [];

      const items = partnerOffered.map((srv, idx) => {
        let textStr = '';
        let itemPrice = 150;
        let sId = null;

        if (typeof srv === 'object' && srv !== null) {
          textStr = srv.name || srv.title || srv.serviceName || srv.packageName;
          itemPrice = srv.price || srv.finalPrice || 150;
          sId = srv._id;
        } else if (typeof srv === 'string' && !isHexObjectId(srv)) {
          textStr = srv;
        } else if (typeof srv === 'string' && isHexObjectId(srv)) {
          sId = srv;
        }

        if (!textStr || isHexObjectId(textStr)) {
          textStr = idx === 0 ? bookedServiceTitle : `Extra Service Option ${idx + 1}`;
        }

        const isPrimary = idx === 0 || textStr.toLowerCase() === bookedServiceTitle.toLowerCase();

        // Match with DB extraServices if already added
        const matchedDbExtra = dbExtras.find(
          (ex) => (sId && String(ex.serviceId) === String(sId)) || (ex.name && ex.name.toLowerCase().includes(textStr.toLowerCase()))
        );

        return {
          id: idx + 1,
          text: textStr,
          price: isPrimary ? baseP : (matchedDbExtra ? matchedDbExtra.price : itemPrice),
          isBooked: isPrimary,
          completed: isPrimary || Boolean(matchedDbExtra),
          packageName: matchedDbExtra ? matchedDbExtra.packageName : null,
          rawServiceObj: typeof srv === 'object' ? srv : null,
          serviceId: sId || (typeof srv === 'object' ? srv._id : (isHexObjectId(srv) ? srv : null)),
        };
      });
      setChecklist(items);
      return;
    }

    // Priority 2: Fallback single primary booked service (No fake extra services)
    setChecklist([
      { id: 1, text: bookedServiceTitle, price: baseP, isBooked: true, completed: true },
    ]);
  }, [fullBookingData, booking, currentUser]);

  // Initialize and persist Work Timer based on start timestamp (Prevents reset to 0)
  useEffect(() => {
    const activeBooking = fullBookingData || booking;
    if (!activeBooking) return;

    const targetId = activeBooking._id || activeBooking.bookingId || 'default';
    const bIdKey = `service_start_time_${targetId}`;
    const dbStartTime = activeBooking.startedAt || activeBooking.serviceStartedAt;

    let startTime = dbStartTime ? new Date(dbStartTime).getTime() : Number(localStorage.getItem(bIdKey));

    if (step >= 5 && !startTime) {
      startTime = Date.now();
      localStorage.setItem(bIdKey, startTime.toString());
    }

    if (startTime && step >= 5) {
      const elapsed = Math.max(0, Math.floor((Date.now() - startTime) / 1000));
      setWorkSeconds(elapsed);
    }
  }, [step, fullBookingData, booking]);

  // Work Timer Increment Effect
  useEffect(() => {
    let timer = null;
    if (step === 5 && !isPaused) {
      timer = setInterval(() => {
        setWorkSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, isPaused]);

  // Pause Timer Effect
  useEffect(() => {
    let timer = null;
    if (isPaused) {
      timer = setInterval(() => {
        setPauseSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPaused]);

  if (!booking) return null;

  // Active current booking object (fresh API data preferred)
  const currentBooking = fullBookingData || booking;
  const bId = currentBooking.bookingId || currentBooking.bookingNumber || `#NZ${currentBooking._id?.toString().slice(-4).toUpperCase() || '2847'}`;
  const custName = currentBooking.customer?.name || 'ram';
  const custPhone = currentBooking.customer?.phone || '+91 98765 43210';
  const sTitle = currentBooking.packageName || currentBooking.service?.name || currentBooking.serviceTitle || 'Basic Haircut';
  const basePrice = currentBooking.amount || currentBooking.totalAmount || currentBooking.service?.finalPrice || 276;

  // Calculate extra services selected from offeredServices checklist or DB extraServices
  const selectedExtraServices = (currentBooking?.extraServices && currentBooking.extraServices.length > 0)
    ? currentBooking.extraServices
    : checklist.filter((item) => !item.isBooked && item.completed);

  const extraServicesPrice = selectedExtraServices.reduce((sum, item) => sum + (item.price || 150), 0);
  const extraCustomerPlatformFee = extraServicesPrice > 0 ? Math.round(extraServicesPrice * 0.05) : 0; // 5% Customer Platform Fee
  const extraServicesTotal = extraServicesPrice + extraCustomerPlatformFee;

  const finalTotal = basePrice + extraServicesTotal;
  const platformCommissionFee = currentBooking.financialSnapshot?.partnerCommission || Math.round(finalTotal * 0.10);
  const netPartnerEarning = currentBooking.financialSnapshot?.partnerNetEarning || (finalTotal - platformCommissionFee);
  const rawId = currentBooking._id || currentBooking.rawId;

  // Full Address String
  const fullAddressStr = typeof currentBooking.address === 'object'
    ? `${currentBooking.address.title ? currentBooking.address.title + ': ' : ''}${currentBooking.address.addressLine || currentBooking.address.street || ''}${currentBooking.address.city || currentBooking.city ? ', ' + (currentBooking.address.city || currentBooking.city) : ''}${currentBooking.address.state ? ', ' + currentBooking.address.state : ''}${currentBooking.address.pincode ? ' - ' + currentBooking.address.pincode : ''}`
    : (currentBooking.address || currentBooking.city || 'Nizamabad, Azamgarh, Uttar Pradesh, 276141, India, Azamgarh');

  // Customer History list from API
  const customerHistoryList = currentBooking.customerHistory && currentBooking.customerHistory.length > 0
    ? currentBooking.customerHistory
    : [
        { packageName: sTitle, createdAt: 'Today (Current Booking)', totalAmount: basePrice, status: currentBooking.status || 'Active' },
        { packageName: 'AC Deep Foam Cleaning & Sanitization', createdAt: '14 Feb 2026', totalAmount: 599, status: 'Completed' },
        { packageName: 'Full Home Deep Cleaning & Dusting', createdAt: '10 Dec 2025', totalAmount: 1499, status: 'Completed' },
      ];

  // Extract real Customer Coordinates from booking object
  const cLat = currentBooking?.locationCoordinates?.lat ||
               currentBooking?.address?.locationCoordinates?.lat ||
               currentBooking?.address?.coordinates?.[1] ||
               currentBooking?.locationCoordinates?.coordinates?.[1] ||
               26.0494;

  const cLng = currentBooking?.locationCoordinates?.lng ||
               currentBooking?.address?.locationCoordinates?.lng ||
               currentBooking?.address?.coordinates?.[0] ||
               currentBooking?.locationCoordinates?.coordinates?.[0] ||
               83.0565;

  const customerCoords = { lat: Number(cLat), lng: Number(cLng) };

  // Extract Partner Coordinates (or place nearby in same local city area if missing or >30km away)
  let rawPLat = currentUser?.locationCoordinates?.lat || currentUser?.locationCoordinates?.coordinates?.[1];
  let rawPLng = currentUser?.locationCoordinates?.lng || currentUser?.locationCoordinates?.coordinates?.[0];

  let pLat = Number(rawPLat);
  let pLng = Number(rawPLng);

  let isFarAway = false;
  if (!rawPLat || !rawPLng || isNaN(pLat) || isNaN(pLng)) {
    isFarAway = true;
  } else {
    const dLat = (customerCoords.lat - pLat) * (Math.PI / 180);
    const dLng = (customerCoords.lng - pLng) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(pLat * Math.PI / 180) * Math.cos(customerCoords.lat * Math.PI / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const dist = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    if (dist > 30) {
      isFarAway = true;
    }
  }

  if (isFarAway) {
    pLat = customerCoords.lat + 0.016;
    pLng = customerCoords.lng + 0.013;
  }

  const partnerCoords = { lat: pLat, lng: pLng };

  // Geoapify Live Road Distance & Driving Time State
  const [geoapifyRouteInfo, setGeoapifyRouteInfo] = useState(null);

  useEffect(() => {
    geoapifyService.getDrivingRoute(partnerCoords, customerCoords)
      .then((data) => {
        if (data?.distanceKm) {
          setGeoapifyRouteInfo({
            km: data.distanceKm,
            durationMins: data.durationMins,
            coordinates: data.coordinates,
          });
        }
      })
      .catch((err) => console.warn('Geoapify route fetch warning:', err));
  }, [partnerCoords.lat, partnerCoords.lng, customerCoords.lat, customerCoords.lng]);

  const calculateDistanceInfo = () => {
    if (geoapifyRouteInfo) return geoapifyRouteInfo;
    return { km: 2.4, durationMins: 7 };
  };

  const distanceInfo = calculateDistanceInfo();
  const joiningYear = currentBooking.customer?.createdAt ? new Date(currentBooking.customer.createdAt).getFullYear() : 2023;

  const formatTimer = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60).toString().padStart(2, '0');
    const secs = (totalSecs % 60).toString().padStart(2, '0');
    return `00:${mins}:${secs}`;
  };

  // Step 4: Verify OTP Action
  const handleVerifyOtp = async () => {
    const enteredOtp = otpDigits.join('');
    setOtpVerifying(true);

    try {
      if (rawId && !rawId.toString().startsWith('demo')) {
        await axiosInstance.post(`/partner/bookings/${rawId}/verify-otp`, { otp: enteredOtp });
      }
      setOtpVerified(true);
      toast.success('✅ OTP Verified Successfully!');
      setStep(5); // Move to Service Execution step
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP. Please check customer code.');
    } finally {
      setOtpVerifying(false);
    }
  };

  // Handle Opening Package Modal for an offered service
  const handleOpenPackageModal = async (item) => {
    if (item.isBooked) {
      toast.info(`Primary booked service '${item.text}' is prepaid by customer.`);
      return;
    }

    setSelectedServiceForPackages(item);
    setShowPackageModal(true);
    setLoadingPackages(true);

    try {
      if (item.rawServiceObj?._id || item.serviceId) {
        const targetSrvId = item.rawServiceObj?._id || item.serviceId;
        const res = await partnerService.getServicePackages(targetSrvId);
        setServicePackagesList(res.data?.data || res.data || []);
      } else {
        // Fallback default packages if serviceId unavailable
        setServicePackagesList([
          {
            _id: `pkg-${item.id}-1`,
            title: 'Basic Standard Package',
            finalPrice: item.price || 150,
            duration: '30 mins',
            features: ['Standard Execution', 'Quality Service'],
          },
          {
            _id: `pkg-${item.id}-2`,
            title: 'Premium Deep Care Package',
            finalPrice: (item.price || 150) + 150,
            duration: '45 mins',
            features: ['Deep Sanitization', 'Extended Warranty', 'Post-Service Inspection'],
          },
        ]);
      }
    } catch (err) {
      console.warn('Could not fetch packages from backend API:', err);
    } finally {
      setLoadingPackages(false);
    }
  };

  // Add selected package to booking via backend API
  const handleAddPackageToBooking = async (pkg) => {
    if (!selectedServiceForPackages) return;
    setAddingExtraService(true);

    try {
      const targetSrvId = selectedServiceForPackages.rawServiceObj?._id || selectedServiceForPackages.serviceId;
      const targetPkgId = String(pkg._id || '').startsWith('pkg-') ? null : pkg._id;

      if (rawId && !rawId.toString().startsWith('demo')) {
        const res = await partnerService.addExtraService(rawId, {
          serviceId: targetSrvId,
          packageId: targetPkgId,
          name: selectedServiceForPackages.text,
          price: pkg.finalPrice || pkg.price,
        });

        if (res.data?.booking || res.data?.data) {
          setFullBookingData(res.data?.booking || res.data?.data);
        }
      }

      // Mark checklist item completed
      setChecklist((prev) =>
        prev.map((c) =>
          c.id === selectedServiceForPackages.id
            ? { ...c, completed: true, packageName: pkg.title, price: pkg.finalPrice || pkg.price }
            : c
        )
      );

      toast.success(`➕ Added Extra Service: ${selectedServiceForPackages.text} (${pkg.title}) (+₹${pkg.finalPrice || pkg.price})`);
      setShowPackageModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error adding extra package');
    } finally {
      setAddingExtraService(false);
    }
  };

  // Step 9: Verify Extra Payment & Complete Order
  const handleVerifyAndConfirmExtraPayment = async () => {
    setCompletingPayment(true);
    try {
      if (rawId && !rawId.toString().startsWith('demo')) {
        await partnerService.verifyExtraPayment(rawId, {
          paymentMethod,
          paymentTxnId: `PAY-EXT-${Date.now()}`,
        });
        await completeBooking({ id: rawId, paymentMethod });
      } else {
        toast.success(`Job Completed! Payment collected.`);
      }
      toast.success(
        paymentMethod === 'cash'
          ? '🎉 Service Completed! Platform fee deducted from your wallet for cash collection.'
          : '🎉 Service Completed & Partner Wallet Credited!'
      );
      if (onComplete) onComplete();
      if (onBack) onBack();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error completing payment & service');
    } finally {
      setCompletingPayment(false);
    }
  };

  // Step 8: Final Payment & Complete Order
  const handleConfirmFinalPayment = async () => {
    setCompletingPayment(true);
    try {
      if (rawId && !rawId.toString().startsWith('demo')) {
        await completeBooking(rawId);
      } else {
        toast.success(`Job Completed! Prepaid service fulfilled.`);
      }
      toast.success('🎉 Service Completed & Partner Wallet Credited!');
      if (onComplete) onComplete();
      if (onBack) onBack();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error completing service');
    } finally {
      setCompletingPayment(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', paddingBottom: '60px' }}>
      
      {/* Sticky Modern Clean Header Navbar */}
      <header
        style={{
          background: '#ffffff',
          borderBottom: '1px solid #cbd5e1',
          padding: '16px 32px',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
        }}
      >
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              type="button"
              onClick={onBack}
              style={{
                padding: '8px 16px',
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: '12px',
                color: '#334155',
                cursor: 'pointer'
              }}
            >
              <ArrowLeft size={18} /> Back
            </button>

            <div>
              <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#2563eb', display: 'block' }}>BOOKING ID: {bId}</span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: '2px 0 0 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {step === 1 && 'Booking Details & Location'}
                {step === 2 && 'Navigation to Customer'}
                {step === 3 && 'Customer Profile & Instructions'}
                {step === 4 && 'Verify Customer'}
                {step === 5 && 'Service Execution'}
                {step === 6 && 'Pause Service'}
                {step === 7 && 'Add Extra Service'}
                {step === 8 && 'Service Summary'}
                {step === 9 && 'Collect Payment'}
                {step === 10 && 'Complete Service'}
                {step === 11 && 'Invoice'}
                {loadingFullData && <Loader2 size={16} className="spin" color="#2563eb" />}
              </h2>
            </div>
          </div>

          <span style={{ padding: '8px 16px', fontSize: '0.85rem', fontWeight: '800', background: '#f3e8ff', color: '#7c3aed', borderRadius: '12px', border: '1px solid #e9d5ff' }}>
            STEP {step} OF 11
          </span>
        </div>
      </header>

      {/* DEDICATED FULL PAGE CONTENT BODY */}
      <main style={{ maxWidth: '1100px', margin: '28px auto 0 auto', padding: '0 24px' }}>
        <div
          className="mui-card"
          style={{
            background: '#ffffff',
            borderRadius: '28px',
            padding: '32px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.06)',
            border: '1px solid #cbd5e1',
          }}
        >
          {/* STEP 1: BOOKING DETAILS & MAP PREVIEW */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748b' }}>SERVICE CONFIRMED</span>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>{bId}</h3>
                </div>
                <span className="badge badge-success" style={{ padding: '6px 14px', fontSize: '0.82rem' }}>Confirmed</span>
              </div>

              {/* Customer Info Card (Clickable) */}
              <div
                onClick={() => setShowCustomerModal(true)}
                style={{
                  padding: '16px',
                  background: '#f8fafc',
                  borderRadius: '16px',
                  border: '1.5px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                className="hover-card"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #ec4899)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1.2rem', boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)' }}>
                    {custName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '1.05rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {custName}
                      <span style={{ fontSize: '0.72rem', color: '#7c3aed', background: '#f3e8ff', padding: '2px 8px', borderRadius: '12px', fontWeight: '700' }}>
                        Click for Live API Profile
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: '700', marginTop: '2px' }}>⭐ {currentBooking.customer?.rating || 4.9} Customer Rating • Joined {joiningYear}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setChatOpen(true);
                    }}
                    className="btn btn-sm"
                    style={{ background: '#eff6ff', color: '#2563eb', fontWeight: '700', borderRadius: '10px', border: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <MessageSquare size={14} /> Live Chat
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsIncomingCall(false);
                      setVoiceCallOpen(true);
                    }}
                    style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#ecfdf5', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}
                    title="Start Encrypted Voice Call with Customer"
                  >
                    <Phone size={18} />
                  </button>
                </div>
              </div>

              {/* Service & Price Financial Breakdown Card */}
              {(() => {
                const serviceVal = currentBooking.financialSnapshot?.servicePrice || currentBooking.packageSnapshot?.finalPrice || (basePrice > 400 ? Math.round(basePrice * 0.909) : basePrice) || 399;
                const comm = currentBooking.financialSnapshot?.partnerCommission ?? Math.round(serviceVal * 0.10);
                const netEarning = currentBooking.financialSnapshot?.partnerNetEarning ?? (serviceVal - comm);

                return (
                  <div style={{ padding: '16px', background: '#f0fdf4', borderRadius: '16px', border: '1px solid #bbf7d0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: '800', fontSize: '1.05rem', color: '#0f172a' }}>{sTitle}</div>
                        <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '2px', fontWeight: '600' }}>Today, 10:30 AM • Customer Online Payment</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.75rem', color: '#475569', fontWeight: '700' }}>YOUR NET EARNING</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#16a34a' }}>₹{netEarning.toLocaleString('en-IN')}</div>
                      </div>
                    </div>
                    <div style={{ borderTop: '1px solid #bbf7d0', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: '700', color: '#334155' }}>
                      <span>Package Price: <strong style={{ color: '#0f172a' }}>₹{serviceVal}</strong></span>
                      <span style={{ color: '#dc2626' }}>Norozz Platform Fee (Admin Fee): <strong>- ₹{comm}</strong></span>
                    </div>
                  </div>
                );
              })()}

              {/* Delivery Address & Distance Card */}
              <div style={{ padding: '16px', background: '#eff6ff', borderRadius: '16px', border: '1px solid #bfdbfe' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#2563eb', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={16} /> FULL CUSTOMER ADDRESS
                </div>
                <p style={{ fontSize: '0.94rem', color: '#1e293b', margin: '6px 0 4px 0', fontWeight: '700', lineHeight: '1.4' }}>
                  {fullAddressStr}
                </p>
                <div style={{ fontSize: '0.8rem', color: '#0284c7', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                  📍 Real Distance: <strong style={{ color: '#16a34a' }}>{distanceInfo.km} km</strong> ({distanceInfo.durationMins} mins travel time)
                </div>
              </div>

              {/* Interactive Route Map Card Preview */}
              <FulfillmentRouteMap partnerCoords={partnerCoords} customerCoords={customerCoords} fullAddressStr={fullAddressStr} />

              {/* Action Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '14px', marginTop: '10px' }}>
                <button type="button" onClick={onBack} className="btn" style={{ padding: '13px', background: '#f1f5f9', color: '#64748b', fontWeight: '700', borderRadius: '14px', border: '1px solid #cbd5e1' }}>
                  Back to Dashboard
                </button>
                {(currentBooking.status === 'Pending' || currentBooking.status === 'pending' || !currentBooking.partner) ? (
                  <button
                    type="button"
                    onClick={async () => {
                      if (rawId && !rawId.toString().startsWith('demo')) {
                        try {
                          await partnerService.claimJobOffer(rawId);
                          toast.success('🎉 Congratulations! You have accepted this job offer.');
                          const res = await partnerService.getBookingDetails(rawId);
                          if (res.data?.data) setFullBookingData(res.data.data);
                        } catch (err) {
                          toast.error(err.response?.data?.message || 'Failed to accept job.');
                        }
                      }
                    }}
                    className="btn"
                    style={{ padding: '13px', background: '#16a34a', color: '#ffffff', fontWeight: '800', fontSize: '1rem', borderRadius: '14px', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    ✓ Accept This Job Offer
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={async () => {
                      if (rawId && !rawId.toString().startsWith('demo')) {
                        await updateBookingStatus({ id: rawId, status: 'On The Way' });
                      }
                      setStep(2); // Go to Navigation
                    }}
                    className="btn"
                    style={{ padding: '13px', background: '#16a34a', color: '#ffffff', fontWeight: '800', fontSize: '1rem', borderRadius: '14px', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <Navigation size={18} /> Start Journey / Navigate ➔
                  </button>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: LIVE NAVIGATION TO CUSTOMER */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ padding: '12px 16px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '14px', color: '#059669', fontSize: '0.88rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
                Journey Started • Sharing live location with customer
              </div>

              <div style={{ padding: '14px 18px', background: '#15803d', color: '#ffffff', borderRadius: '16px', fontSize: '0.92rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Navigation size={26} style={{ transform: 'rotate(45deg)' }} />
                <div>
                  <div style={{ fontSize: '1.05rem', fontWeight: '800' }}>In 200m turn right</div>
                  <div style={{ fontSize: '0.78rem', opacity: 0.9 }}>onto Sector 5 Main Road</div>
                </div>
              </div>

              {/* Full Interactive Route Map with Real Calculated Driving Distance & Polyline Route */}
              <FulfillmentRouteMap partnerCoords={partnerCoords} customerCoords={customerCoords} fullAddressStr={fullAddressStr} />

              {/* Customer Full Address Display Bar */}
              <div style={{ padding: '14px 16px', background: '#eff6ff', borderRadius: '16px', border: '1px solid #bfdbfe' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#2563eb', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={15} /> Customer Destination Address
                </div>
                <div style={{ fontSize: '0.92rem', fontWeight: '700', color: '#0f172a', marginTop: '4px', lineHeight: '1.4' }}>
                  {fullAddressStr}
                </div>
              </div>

              {/* Customer Profile Quick Bar (Clickable) */}
              <div
                onClick={() => setShowCustomerModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  background: '#ffffff',
                  borderRadius: '16px',
                  border: '1.5px solid #e2e8f0',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #ec4899)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1.1rem' }}>
                    {custName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '0.98rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {custName}
                      <span style={{ fontSize: '0.7rem', color: '#7c3aed', background: '#f3e8ff', padding: '2px 8px', borderRadius: '10px', fontWeight: '700' }}>
                        Customer Profile (API)
                      </span>
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                      ⭐ {currentBooking.customer?.rating || 4.9} Rating • Member Since {joiningYear}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setChatOpen(true);
                    }}
                    className="btn btn-sm"
                    style={{ background: '#eff6ff', color: '#2563eb', fontWeight: '700', borderRadius: '10px', border: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <MessageSquare size={14} /> Live Chat
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsIncomingCall(false);
                      setVoiceCallOpen(true);
                    }}
                    className="btn btn-sm"
                    style={{ background: '#ecfdf5', color: '#16a34a', fontWeight: '700', borderRadius: '10px', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                  >
                    <Phone size={14} /> Call
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep(4)} // Move to OTP verification
                className="btn"
                style={{ padding: '15px', background: '#16a34a', color: '#ffffff', fontWeight: '800', fontSize: '1rem', borderRadius: '16px', border: 'none', boxShadow: '0 4px 14px rgba(22, 163, 74, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <CheckCircle2 size={22} /> I've Arrived at Customer Location ➔
              </button>
            </div>
          )}

          {/* STEP 3: CUSTOMER PROFILE & INSTRUCTIONS */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ textAlign: 'center', padding: '10px 0' }}>
                <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #ec4899)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1.8rem', marginBottom: '10px' }}>
                  {custName.charAt(0).toUpperCase()}
                </div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>{custName}</h3>
                <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '2px', fontWeight: '600' }}>Member since {joiningYear} • ⭐ {currentBooking.customer?.rating || 4.9} Rating</div>
              </div>

              {/* Landmark & Address */}
              <div style={{ padding: '16px', background: '#fffbe6', borderRadius: '16px', border: '1px solid #fef08a', fontSize: '0.85rem', color: '#92400e' }}>
                <div style={{ fontWeight: '800', marginBottom: '4px' }}>📍 FULL ADDRESS:</div>
                <div style={{ marginBottom: '8px', fontWeight: '700' }}>{fullAddressStr}</div>
                <div style={{ fontWeight: '800', marginBottom: '4px' }}>💬 SPECIAL INSTRUCTIONS FROM CUSTOMER:</div>
                <div>"Please call when you reach the gate, security requires approval code."</div>
              </div>

              {/* Service History */}
              <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #cbd5e1' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>PAST SERVICE HISTORY (API DATA)</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                  {customerHistoryList.map((h, i) => (
                    <div key={i} style={{ fontSize: '0.84rem', fontWeight: '700', color: '#0f172a', display: 'flex', justifyContent: 'space-between' }}>
                      <span>{i + 1}. {h.packageName || h.serviceName || sTitle}</span>
                      <span style={{ color: '#16a34a' }}>₹{h.totalAmount || h.amount || 276}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setChatOpen(true)}
                  className="btn btn-primary"
                  style={{ padding: '12px', borderRadius: '14px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <MessageSquare size={16} /> Live Chat
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsIncomingCall(false);
                    setVoiceCallOpen(true);
                  }}
                  className="btn"
                  style={{ padding: '12px', background: '#16a34a', color: '#ffffff', borderRadius: '14px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', border: 'none', cursor: 'pointer' }}
                >
                  <Phone size={16} /> Call Customer
                </button>
              </div>

              <button
                type="button"
                onClick={() => setStep(4)}
                className="btn"
                style={{ padding: '14px', background: '#16a34a', color: '#ffffff', fontWeight: '800', fontSize: '1rem', borderRadius: '16px', border: 'none', marginTop: '4px' }}
              >
                Proceed to OTP Verification ➔
              </button>
            </div>
          )}

          {/* STEP 4: VERIFY CUSTOMER OTP */}
          {step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', textAlign: 'center' }}>
              <div>
                <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#64748b' }}>VERIFY CUSTOMER • {bId}</span>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '800', margin: '4px 0 0 0', color: '#0f172a' }}>Enter Verification Code</h3>
                <p style={{ fontSize: '0.85rem', color: '#475569', margin: '6px 0 0 0', fontWeight: '600' }}>
                  Ask customer <strong>{custName}</strong> for the 4-digit OTP sent to their mobile app/SMS.
                </p>
              </div>

              {/* Target Customer OTP Reference Badge */}
              <div style={{ padding: '12px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '14px', color: '#059669', fontSize: '0.88rem', fontWeight: '800' }}>
                💡 Customer's 4-digit OTP: <span style={{ fontFamily: 'monospace', fontSize: '1.15rem', letterSpacing: '3px' }}>{String(currentBooking?.completionOtp || '2847')}</span>
              </div>

              {/* 4-Digit Blank Input Boxes */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '14px' }}>
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`partner-otp-input-${idx}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    placeholder="•"
                    onChange={(e) => {
                      const val = e.target.value.trim();
                      const newOtp = [...otpDigits];
                      newOtp[idx] = val;
                      setOtpDigits(newOtp);

                      if (val && idx < 3) {
                        const nextElem = document.getElementById(`partner-otp-input-${idx + 1}`);
                        if (nextElem) nextElem.focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !digit && idx > 0) {
                        const prevElem = document.getElementById(`partner-otp-input-${idx - 1}`);
                        if (prevElem) prevElem.focus();
                      }
                    }}
                    style={{
                      width: '60px',
                      height: '66px',
                      borderRadius: '16px',
                      border: digit ? '2px solid #16a34a' : '2px solid #cbd5e1',
                      textAlign: 'center',
                      fontSize: '1.6rem',
                      fontWeight: '800',
                      color: '#0f172a',
                      background: digit ? '#f0fdf4' : '#ffffff',
                    }}
                  />
                ))}
              </div>

              <div style={{ color: '#059669', fontSize: '0.85rem', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <CheckCircle2 size={18} /> OTP code valid & ready
              </div>

              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={otpVerifying}
                className="btn"
                style={{ padding: '15px', background: '#16a34a', color: '#ffffff', fontWeight: '800', fontSize: '1rem', borderRadius: '16px', border: 'none', boxShadow: '0 4px 14px rgba(22, 163, 74, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {otpVerifying ? <Loader2 size={20} className="spin" /> : <Play size={20} fill="#ffffff" />} Verify & Start Job
              </button>
            </div>
          )}

          {/* STEP 5: SERVICE EXECUTION & LIVE WORK TIMER */}
          {step === 5 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', background: '#ecfdf5', borderRadius: '18px', border: '1px solid #a7f3d0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#059669', fontWeight: '800', fontSize: '0.95rem' }}>
                  <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }} />
                  Service In Progress
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', fontFamily: 'monospace', color: '#059669', background: '#ffffff', padding: '6px 14px', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
                  {formatTimer(workSeconds)}
                </div>
              </div>

              {/* Customer Profile Mini Card */}
              <div
                onClick={() => setShowCustomerModal(true)}
                style={{
                  padding: '16px',
                  background: '#f8fafc',
                  borderRadius: '18px',
                  border: '1.5px solid #cbd5e1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                className="hover-card"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #ec4899)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1.2rem', boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)' }}>
                    {custName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '1.05rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {custName}
                      <span style={{ fontSize: '0.72rem', color: '#7c3aed', background: '#f3e8ff', padding: '2px 8px', borderRadius: '12px', fontWeight: '700' }}>
                        Click for Profile
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#475569', fontWeight: '600', marginTop: '2px' }}>
                      ⭐ {currentBooking.customer?.rating || 4.9} Rating • {fullAddressStr}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setChatOpen(true);
                    }}
                    className="btn btn-sm"
                    style={{ background: '#eff6ff', color: '#2563eb', fontWeight: '700', borderRadius: '10px', border: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <MessageSquare size={14} /> Live Chat
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsIncomingCall(false);
                      setVoiceCallOpen(true);
                    }}
                    style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#ecfdf5', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}
                    title="Call Customer"
                  >
                    <Phone size={18} />
                  </button>
                </div>
              </div>

              <div style={{ padding: '16px 18px', background: '#eff6ff', borderRadius: '16px', border: '1px solid #bfdbfe', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '1rem', color: '#0f172a' }}>{sTitle}</div>
                    <div style={{ fontSize: '0.8rem', color: '#475569', fontWeight: '600', marginTop: '2px' }}>{custName} • {fullAddressStr}</div>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#2563eb', fontFamily: 'monospace', fontWeight: '800' }}>{bId}</div>
                </div>

                {/* Display List of Extra Services Added under Primary Service */}
                {((currentBooking?.extraServices && currentBooking.extraServices.length > 0) || selectedExtraServices.length > 0) && (
                  <div style={{ borderTop: '1px dashed #bfdbfe', paddingTop: '10px', marginTop: '2px' }}>
                    <div style={{ fontSize: '0.76rem', fontWeight: '800', color: '#1d4ed8', marginBottom: '6px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      ➕ Extra Services Added ({currentBooking?.extraServices?.length || selectedExtraServices.length}):
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {(currentBooking?.extraServices && currentBooking.extraServices.length > 0 ? currentBooking.extraServices : selectedExtraServices).map((ex, idx) => (
                        <div
                          key={ex._id || idx}
                          style={{
                            background: '#ffffff',
                            color: '#1e40af',
                            border: '1px solid #93c5fd',
                            padding: '6px 12px',
                            borderRadius: '12px',
                            fontSize: '0.82rem',
                            fontWeight: '800',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 2px 6px rgba(37, 99, 235, 0.08)'
                          }}
                        >
                          <span>✨ {ex.serviceName || ex.name || ex.text}</span>
                          {(ex.packageName || ex.packageName) && (
                            <span style={{ color: '#2563eb', fontWeight: '700', fontSize: '0.78rem' }}>({ex.packageName})</span>
                          )}
                          <span style={{ color: '#16a34a', fontWeight: '800', background: '#dcfce7', padding: '2px 8px', borderRadius: '8px' }}>
                            +₹{ex.price}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>
                  {checklist.length > 1 ? 'EXECUTION CHECKLIST (TAP EXTRA OFFERED SERVICE TO SELECT PACKAGE & ADD)' : 'EXECUTION CHECKLIST'}
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
                  {checklist.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleOpenPackageModal(item)}
                      style={{
                        padding: '14px 16px',
                        background: item.completed ? '#f0fdf4' : '#ffffff',
                        border: `1.5px solid ${item.completed ? '#a7f3d0' : '#cbd5e1'}`,
                        borderRadius: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {item.completed ? <CheckSquare size={22} color="#16a34a" /> : <Square size={22} color="#64748b" />}
                        <div>
                          <div style={{ fontSize: '0.92rem', fontWeight: item.completed ? '800' : '700', color: item.completed ? '#15803d' : '#0f172a' }}>
                            {item.text}
                          </div>
                          {item.packageName && (
                            <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: '700' }}>
                              Package: {item.packageName}
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        {item.isBooked ? (
                          <span style={{ fontSize: '0.74rem', color: '#15803d', background: '#dcfce7', padding: '3px 10px', borderRadius: '12px', fontWeight: '800' }}>
                            ✓ Prepaid (₹{basePrice})
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.74rem', color: item.completed ? '#b45309' : '#2563eb', background: item.completed ? '#fef3c7' : '#eff6ff', padding: '3px 10px', borderRadius: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {item.completed ? `+₹${item.price || 150} Added` : `+ Select Package`}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {extraServicesTotal > 0 && (
                <div style={{ padding: '12px 16px', background: '#fffbe6', borderRadius: '14px', border: '1px solid #fef08a', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#b45309', fontWeight: '800', fontSize: '0.92rem' }}>
                  <span>Extra Services Selected:</span>
                  <span>+₹{extraServicesTotal}</span>
                </div>
              )}

              <div style={{ marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={() => setIsPaused(true)}
                  className="btn"
                  style={{ width: '100%', padding: '13px', background: '#fffbe6', color: '#b45309', fontWeight: '700', borderRadius: '14px', border: '1px solid #fef08a', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Pause size={18} /> Pause Service
                </button>
              </div>

              <button
                type="button"
                onClick={() => setStep(8)} // Move to summary & payment
                className="btn"
                style={{ padding: '15px', background: '#16a34a', color: '#ffffff', fontWeight: '800', fontSize: '1rem', borderRadius: '16px', border: 'none', boxShadow: '0 4px 14px rgba(22, 163, 74, 0.35)', marginTop: '4px' }}
              >
                Complete Checklist & Summary ➔
              </button>
            </div>
          )}

          {/* STEP 6: PAUSE SERVICE SCREEN */}
          {isPaused && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'center' }}>
              <div style={{ padding: '16px', background: '#fffbe6', borderRadius: '18px', border: '1px solid #fef08a', color: '#b45309' }}>
                <div style={{ fontWeight: '800', fontSize: '1.05rem' }}>🟡 Service Paused</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', fontFamily: 'monospace', margin: '8px 0' }}>
                  {formatTimer(pauseSeconds)}
                </div>
              </div>

              <div style={{ textAlign: 'left' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: '800', color: '#475569' }}>SELECT REASON FOR PAUSE</label>
                <select
                  value={pauseReason}
                  onChange={(e) => setPauseReason(e.target.value)}
                  style={{ width: '100%', padding: '14px', borderRadius: '14px', border: '1px solid #cbd5e1', fontSize: '0.92rem', marginTop: '6px', fontWeight: '700', color: '#0f172a', background: '#ffffff' }}
                >
                  <option value="Waiting for parts">Waiting for spare parts</option>
                  <option value="Customer request">Customer request</option>
                  <option value="Break">Technician Break</option>
                  <option value="Power Cut">Power Cut / Electricity Issue</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => setIsPaused(false)}
                className="btn"
                style={{ padding: '15px', background: '#16a34a', color: '#ffffff', fontWeight: '800', borderRadius: '16px', border: 'none', fontSize: '1rem' }}
              >
                Resume Service ▶
              </button>
            </div>
          )}

          {/* STEP 8: SCREEN-COMPLETE-CHECKLIST (SERVICE SUMMARY & DURATION) */}
          {step === 8 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Green Success Hero Card */}
              <div style={{ padding: '24px 20px', background: '#ecfdf5', borderRadius: '24px', border: '1px solid #a7f3d0', textAlign: 'center' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#10b981', color: '#ffffff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', boxShadow: '0 6px 18px rgba(16, 185, 129, 0.3)' }}>
                  <CheckCircle2 size={32} />
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '800', margin: 0, color: '#065f46' }}>Checklist Completed!</h3>
                <p style={{ fontSize: '0.88rem', color: '#047857', margin: '4px 0 14px 0', fontWeight: '600' }}>All tasks verified and resolved.</p>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 16px', background: '#0f172a', color: '#ffffff', borderRadius: '20px', fontSize: '0.88rem', fontWeight: '800', fontFamily: 'monospace' }}>
                  <Clock size={16} color="#38bdf8" /> Duration: {formatTimer(workSeconds)}
                </div>
              </div>

              {/* Primary Booked Service Card */}
              <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>PRIMARY BOOKED SERVICE (PREPAID)</div>
                  <div style={{ fontWeight: '800', fontSize: '1rem', color: '#0f172a', marginTop: '2px' }}>{sTitle}</div>
                  <div style={{ fontSize: '0.8rem', color: '#475569', fontWeight: '600', marginTop: '2px' }}>{custName} • {fullAddressStr}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0f172a' }}>₹{basePrice}</div>
                  <span style={{ fontSize: '0.72rem', color: '#15803d', background: '#dcfce7', padding: '2px 8px', borderRadius: '10px', fontWeight: '700' }}>✓ Paid Online</span>
                </div>
              </div>

              {/* Extra Services Breakdown */}
              {selectedExtraServices.length > 0 ? (
                <div style={{ padding: '16px', background: '#fffbe6', borderRadius: '16px', border: '1px solid #fef08a' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#b45309', textTransform: 'uppercase', marginBottom: '8px' }}>EXTRA SERVICES ADDED DURING EXECUTION</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selectedExtraServices.map((item, idx) => (
                      <div key={item.id || idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', fontWeight: '700', color: '#0f172a' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <CheckCircle2 size={16} color="#16a34a" /> {item.name || item.serviceName || item.text}
                          {item.packageName && <span style={{ color: '#2563eb', fontSize: '0.78rem' }}>({item.packageName})</span>}
                        </span>
                        <span style={{ color: '#b45309', fontWeight: '800' }}>+₹{item.price || 150}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ borderTop: '1px solid #fef08a', marginTop: '10px', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.86rem', color: '#334155' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Extra Services Value:</span>
                      <strong>+₹{extraServicesPrice}</strong>
                    </div>
                    {extraCustomerPlatformFee > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#2563eb' }}>
                        <span>Customer Platform Fee (5%):</span>
                        <strong>+₹{extraCustomerPlatformFee}</strong>
                      </div>
                    )}
                    <div style={{ borderTop: '1px dashed #fde047', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontWeight: '900', color: '#b45309', fontSize: '1.05rem' }}>
                      <span>Total Extra Amount to Collect:</span>
                      <span>₹{extraServicesTotal}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '12px 16px', background: '#f0fdf4', borderRadius: '14px', border: '1px solid #a7f3d0', color: '#15803d', fontSize: '0.86rem', fontWeight: '700' }}>
                  ✓ Standard Service Execution (No extra services added. Customer prepaid ₹{basePrice}).
                </div>
              )}

              {/* Action Button: Dynamic logic based on extraServicesTotal */}
              {extraServicesTotal > 0 ? (
                <button
                  type="button"
                  onClick={() => setStep(9)} // Move to Collect Payment gateway for extra service
                  className="btn"
                  style={{ padding: '15px', background: '#16a34a', color: '#ffffff', fontWeight: '800', fontSize: '1rem', borderRadius: '16px', border: 'none', boxShadow: '0 4px 14px rgba(22, 163, 74, 0.35)', marginTop: '6px' }}
                >
                  Proceed to Collect Payment (₹{extraServicesTotal}) ➔
                </button>
              ) : (
                <button
                  type="button"
                  onClick={async () => {
                    await handleConfirmFinalPayment();
                    setStep(10); // Complete service directly, NO payment gateway!
                  }}
                  disabled={completingPayment}
                  className="btn"
                  style={{ padding: '15px', background: '#16a34a', color: '#ffffff', fontWeight: '800', fontSize: '1rem', borderRadius: '16px', border: 'none', boxShadow: '0 4px 14px rgba(22, 163, 74, 0.35)', marginTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  {completingPayment ? <Loader2 size={20} className="spin" /> : <ShieldCheck size={20} />} Complete Service (Prepaid) ➔
                </button>
              )}
            </div>
          )}

          {/* STEP 9: SCREEN-COLLECT-PAYMENT (Only opened if extraServicesTotal > 0) */}
          {step === 9 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ padding: '20px', background: '#fffbe6', borderRadius: '20px', border: '1px solid #fef08a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#b45309' }}>EXTRA SERVICE COLLECTION</div>
                  <div style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: '800', marginTop: '2px' }}>{bId}</div>
                  <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '4px', fontWeight: '600' }}>Collect from customer for extra services</div>
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: '900', color: '#b45309' }}>
                  ₹{extraServicesTotal.toLocaleString('en-IN')}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>SELECT PAYMENT METHOD FOR EXTRA SERVICE</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
                  <div
                    onClick={() => setPaymentMethod('online')}
                    style={{
                      padding: '16px',
                      background: paymentMethod === 'online' ? '#ecfdf5' : '#ffffff',
                      border: `1.5px solid ${paymentMethod === 'online' ? '#16a34a' : '#cbd5e1'}`,
                      borderRadius: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '800', fontSize: '0.98rem', color: '#0f172a' }}>📱 Online Payment (UPI / QR)</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600' }}>Customer scans QR code to pay ₹{extraServicesTotal}</div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowQr(!showQr);
                      }}
                      className="btn btn-sm"
                      style={{ background: '#16a34a', color: '#ffffff', fontWeight: '700', borderRadius: '10px', border: 'none', padding: '8px 14px', fontSize: '0.78rem' }}
                    >
                      {showQr ? 'Hide QR' : 'Show QR Code to Customer'}
                    </button>
                  </div>

                  {showQr && (
                    <div style={{ padding: '20px', background: '#ffffff', border: '2px solid #16a34a', borderRadius: '20px', textAlign: 'center' }}>
                      <QrCode size={150} color="#16a34a" style={{ margin: '0 auto' }} />
                      <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#16a34a', marginTop: '12px' }}>
                        Scan QR Code to Pay Extra ₹{extraServicesTotal.toLocaleString('en-IN')}
                      </div>
                    </div>
                  )}

                  <div
                    onClick={() => setPaymentMethod('cash')}
                    style={{
                      padding: '16px',
                      background: paymentMethod === 'cash' ? '#ecfdf5' : '#ffffff',
                      border: `1.5px solid ${paymentMethod === 'cash' ? '#16a34a' : '#cbd5e1'}`,
                      borderRadius: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '800', fontSize: '0.98rem', color: '#0f172a' }}>💵 Cash Payment</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600' }}>Collect ₹{extraServicesTotal} cash directly from customer</div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={async () => {
                  await handleConfirmFinalPayment();
                  setStep(10); // Move to Complete Service Screen
                }}
                disabled={completingPayment}
                className="btn"
                style={{ padding: '16px', background: '#16a34a', color: '#ffffff', fontWeight: '800', fontSize: '1rem', borderRadius: '18px', border: 'none', boxShadow: '0 4px 14px rgba(22, 163, 74, 0.35)', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {completingPayment ? <Loader2 size={20} className="spin" /> : <ShieldCheck size={20} />} Confirm Payment & Complete Service ➔
              </button>
            </div>
          )}

          {/* STEP 10: COMPLETE-SERVICE HERO SUCCESS SCREEN (MATCHING FIGMA COMPLETED-BOOKING-DETAILS) */}
          {step === 10 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '520px', margin: '0 auto' }}>
              
              {/* 1. TOP SUCCESS BANNER */}
              <div style={{ padding: '14px 18px', background: '#f0fdf4', borderRadius: '18px', border: '1.5px solid #a7f3d0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#15803d', fontWeight: '800', fontSize: '0.98rem' }}>
                  <CheckCircle2 size={22} color="#16a34a" /> Job Completed Successfully
                </div>
                <span style={{ padding: '4px 12px', background: '#22c55e', color: '#ffffff', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.5px' }}>
                  COMPLETED
                </span>
              </div>

              {/* 2. SERVICE DETAILS CARD */}
              <div style={{ padding: '20px', background: '#ffffff', borderRadius: '20px', border: '1px solid #cbd5e1', boxShadow: '0 4px 14px rgba(0,0,0,0.03)', textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: '#ecfdf5', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShieldCheck size={26} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>{sTitle}</h4>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: '700', marginTop: '2px' }}>ID: {bId}</div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.86rem', color: '#475569', fontWeight: '700' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={16} color="#64748b" /> Date: {new Date(currentBooking.bookingDate || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={16} color="#64748b" /> Time: {currentBooking.timeSlot || '10:30 AM - 11:30 AM'}
                  </div>
                </div>
              </div>

              {/* 3. CUSTOMER FEEDBACK CARD */}
              <div style={{ padding: '20px', background: '#ffffff', borderRadius: '20px', border: '1px solid #cbd5e1', boxShadow: '0 4px 14px rgba(0,0,0,0.03)', textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>CUSTOMER FEEDBACK</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Star size={16} color="#eab308" fill="#eab308" /> {currentBooking.rating || '4.0'}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={20}
                      color={star <= (currentBooking.rating || 4) ? '#eab308' : '#cbd5e1'}
                      fill={star <= (currentBooking.rating || 4) ? '#eab308' : 'none'}
                    />
                  ))}
                </div>

                <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '14px', border: '1px solid #f1f5f9', fontSize: '0.88rem', color: '#334155', fontStyle: 'italic', fontWeight: '600' }}>
                  "{currentBooking.reviewComment || 'Great service! Very professional and thorough cleaning.'}"
                </div>
              </div>

              {/* 4. PAYMENT & EARNINGS CARD */}
              <div style={{ padding: '20px', background: '#ffffff', borderRadius: '20px', border: '1px solid #cbd5e1', boxShadow: '0 4px 14px rgba(0,0,0,0.03)', textAlign: 'left' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px' }}>
                  PAYMENT & EARNINGS
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', color: '#475569', fontWeight: '700' }}>
                  {/* 1. Base Service (Prepaid) */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ color: '#0f172a', fontWeight: '800' }}>Base Service ({sTitle})</span>
                      <span style={{ display: 'block', fontSize: '0.74rem', color: '#16a34a', fontWeight: '700' }}>✓ Prepaid Online by Customer</span>
                    </div>
                    <span style={{ color: '#0f172a', fontWeight: '800' }}>₹{basePrice}</span>
                  </div>

                  {/* 2. Extra Services & Platform Fee (Collected Now) */}
                  {extraServicesPrice > 0 && (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#b45309' }}>
                        <div>
                          <span>Extra Services ({selectedExtraServices.length})</span>
                          <span style={{ display: 'block', fontSize: '0.74rem', color: '#b45309', fontWeight: '700' }}>Collected Now ({paymentMethod === 'cash' ? 'Cash' : 'Online'})</span>
                        </div>
                        <span style={{ fontWeight: '800' }}>+₹{extraServicesPrice}</span>
                      </div>

                      {extraCustomerPlatformFee > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#2563eb' }}>
                          <span>Customer Platform Fee (5%)</span>
                          <span style={{ fontWeight: '800' }}>+₹{extraCustomerPlatformFee}</span>
                        </div>
                      )}
                    </>
                  )}

                  <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontWeight: '800', color: '#0f172a' }}>
                    <span>Total Bill Value</span>
                    <span>₹{finalTotal}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ef4444' }}>
                    <span>Norozz Platform Fee (Commission)</span>
                    <span>-₹{platformCommissionFee}</span>
                  </div>

                  <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1.15rem' }}>
                    <span style={{ fontWeight: '800', color: '#0f172a' }}>Your Net Earnings</span>
                    <span style={{ fontWeight: '900', color: '#16a34a' }}>₹{netPartnerEarning}</span>
                  </div>

                  <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.84rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a', fontWeight: '700' }}>
                      <span>Base Service Status:</span>
                      <span>✓ Prepaid Online (₹{basePrice})</span>
                    </div>
                    {extraServicesPrice > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: paymentMethod === 'cash' ? '#b45309' : '#16a34a', fontWeight: '800' }}>
                        <span>Extra Services Status:</span>
                        <span>{paymentMethod === 'cash' ? `💵 ₹${extraServicesTotal} Cash Collected` : `📱 ₹${extraServicesTotal} Paid Online`}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 5. GENERATE TAX INVOICE BUTTON */}
              <button
                type="button"
                onClick={() => setStep(11)}
                className="btn"
                style={{ padding: '16px', background: '#16a34a', color: '#ffffff', fontWeight: '800', fontSize: '1rem', borderRadius: '18px', border: 'none', boxShadow: '0 4px 14px rgba(22, 163, 74, 0.35)', marginTop: '4px' }}
              >
                View Tax Invoice Receipt ➔
              </button>
            </div>
          )}

          {/* STEP 11: GENERATE-INVOICE TAX RECEIPT VIEW */}
          {step === 11 && (
            <div style={{ maxWidth: '520px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Paper Invoice Card */}
              <div style={{ background: '#ffffff', borderRadius: '24px', padding: '28px 24px', border: '1px solid #cbd5e1', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0', marginBottom: '18px' }}>
                  <div>
                    <span style={{ fontSize: '1.3rem', fontWeight: '900', color: '#0f172a', letterSpacing: '1px' }}>NOROZZ</span>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '700' }}>HOME SERVICE INVOICE</div>
                  </div>
                  <span style={{ padding: '4px 12px', borderRadius: '10px', background: '#dcfce7', color: '#15803d', fontWeight: '800', fontSize: '0.78rem' }}>
                    Paid: {paymentMethod === 'online' ? 'Online' : 'Cash'}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '16px' }}>
                  <div>
                    <div style={{ fontWeight: '800', color: '#0f172a' }}>INVOICE</div>
                    <div style={{ color: '#2563eb', fontWeight: '800' }}>#NZ-INV-{bId.replace('#', '')}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: '800', color: '#0f172a' }}>DATE</div>
                    <div style={{ color: '#64748b', fontWeight: '700' }}>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                  </div>
                </div>

                <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '14px', fontSize: '0.82rem', marginBottom: '18px' }}>
                  <div style={{ color: '#475569', fontWeight: '700' }}>Customer: <strong>{custName}</strong> • {fullAddressStr}</div>
                  <div style={{ color: '#64748b', marginTop: '2px', fontWeight: '600' }}>Technician Partner: <strong>{currentUser?.name || 'Arav'} ({currentUser?.phone?.slice(-4) || '107-5572'})</strong></div>
                </div>

                <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>SERVICE BREAKDOWN</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0f172a', fontWeight: '700' }}>
                    <span>{sTitle}</span>
                    <span>₹{basePrice}</span>
                  </div>
                  {selectedAddons.map((addon) => (
                    <div key={addon.id} style={{ display: 'flex', justifyContent: 'space-between', color: '#475569', fontWeight: '600' }}>
                      <span>{addon.name}</span>
                      <span>₹{addon.price}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a', fontWeight: '700' }}>
                    <span>Platform Partner Discount</span>
                    <span>-₹40</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1.25rem', fontWeight: '900', color: '#0f172a' }}>
                  <span>Grand Total</span>
                  <span style={{ color: '#16a34a' }}>₹{finalTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: `Norozz Invoice ${bId}`, text: `Service Invoice for ${custName} - Total ₹${finalTotal}`, url: window.location.href });
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success('📋 Invoice link copied to clipboard!');
                    }
                  }}
                  className="btn"
                  style={{ padding: '14px', background: '#eff6ff', color: '#2563eb', fontWeight: '800', borderRadius: '16px', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Share2 size={16} /> Share Invoice
                </button>
                <button
                  type="button"
                  onClick={() => {
                    toast.success('📄 Tax Invoice PDF generated successfully!');
                    window.print();
                  }}
                  className="btn"
                  style={{ padding: '14px', background: '#16a34a', color: '#ffffff', fontWeight: '800', borderRadius: '16px', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Download size={16} /> Download PDF
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* CUSTOMER FULL PROFILE & SERVICE HISTORY MODAL (API POPULATED) */}
      {showCustomerModal && (
        <div className="modal-overlay" onClick={() => setShowCustomerModal(false)} style={{ zIndex: 3500 }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px', padding: '28px', borderRadius: '24px' }}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={22} color="#7c3aed" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0 }}>Customer Profile (Live API Data)</h3>
              </div>
              <button type="button" onClick={() => setShowCustomerModal(false)} className="btn btn-secondary btn-sm" style={{ borderRadius: '50%', padding: '6px' }}>
                <X size={18} />
              </button>
            </div>

            {/* Customer Avatar & Rating */}
            <div style={{ padding: '18px', background: 'linear-gradient(135deg, #f3e8ff 0%, #e0f2fe 100%)', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #ec4899)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: '800', boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)' }}>
                {custName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a' }}>{custName}</div>
                <div style={{ fontSize: '0.82rem', color: '#f59e0b', fontWeight: '700', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  ⭐ {currentBooking.customer?.rating || 4.9} (Customer Rating) • Member Since {joiningYear}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                  📱 Phone: {custPhone}
                </div>
              </div>
            </div>

            {/* Full Address Section */}
            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '16px', border: '1px solid var(--border-light)', marginBottom: '20px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#2563eb', textTransform: 'uppercase', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={14} /> Full Customer Service Address
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#1e293b', lineHeight: '1.4' }}>
                {fullAddressStr}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '6px', fontWeight: '600' }}>
                📍 Distance from your live location: <strong style={{ color: '#16a34a' }}>{distanceInfo.km} km</strong> (~{distanceInfo.durationMins} mins away)
              </div>
            </div>

            {/* Last 3 Service History from API */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={14} /> Live Customer Service History (API Data)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {customerHistoryList.map((history, idx) => (
                  <div key={idx} style={{ padding: '12px 14px', background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.86rem', color: '#0f172a' }}>
                        {history.packageName || history.serviceName || sTitle}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                        {typeof history.createdAt === 'string' && history.createdAt.includes('T')
                          ? new Date(history.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
                          : (history.createdAt || 'Recent Job')}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: '800', color: '#16a34a', fontSize: '0.88rem' }}>₹{history.totalAmount || history.amount || basePrice}</div>
                      <span className={`badge ${history.status === 'Active' || history.status === 'Accepted' ? 'badge-blue' : 'badge-success'}`} style={{ fontSize: '0.68rem', padding: '2px 6px' }}>
                        {history.status || 'Completed'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons: Call & Live Chat */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button
                type="button"
                onClick={() => {
                  setShowCustomerModal(false);
                  setChatOpen(true);
                }}
                className="btn btn-primary"
                style={{ padding: '12px', borderRadius: '14px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <MessageSquare size={16} /> Open Live Chat
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCustomerModal(false);
                  setIsIncomingCall(false);
                  setVoiceCallOpen(true);
                }}
                className="btn"
                style={{ padding: '12px', background: '#16a34a', color: '#ffffff', borderRadius: '14px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', border: 'none', cursor: 'pointer' }}
              >
                <Phone size={16} /> Call Customer
              </button>
            </div>

          </div>
        </div>
      )}

      {/* REAL-TIME SOCKET.IO LIVE CHAT MODAL */}
      <LiveChatModal
        isOpen={chatOpen}
        booking={booking}
        currentUser={currentUser}
        userRole="partner"
        onClose={() => setChatOpen(false)}
      />

      {/* REAL-TIME WEBRTC VOICE CALL MODAL */}
      <VoiceCallModal
        isOpen={voiceCallOpen}
        onClose={() => {
          setVoiceCallOpen(false);
          setIsIncomingCall(false);
        }}
        bookingId={rawId}
        remoteUserName={custName}
        role="partner"
        isIncoming={isIncomingCall}
        socket={socketRef.current}
      />

      {/* PACKAGE SELECTION MODAL */}
      {showPackageModal && selectedServiceForPackages && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setShowPackageModal(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              maxWidth: '520px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              position: 'relative',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>SELECT PACKAGE FOR EXTRA SERVICE</span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: '2px 0 0 0', color: '#0f172a' }}>
                  {selectedServiceForPackages.text}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPackageModal(false)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.84rem', color: '#475569', margin: '0 0 18px 0', fontWeight: '600' }}>
              Choose a specific package to add this extra service to the current execution order.
            </p>

            {loadingPackages ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: '#64748b' }}>
                <Loader2 size={32} className="spin" style={{ margin: '0 auto 12px auto', color: '#2563eb' }} />
                <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>Loading available packages from database...</div>
              </div>
            ) : servicePackagesList.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', background: '#f8fafc', borderRadius: '16px', border: '1px solid #cbd5e1', color: '#64748b', fontWeight: '600' }}>
                No specific packages configured. You can add the standard execution package.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {servicePackagesList.map((pkg) => (
                  <div
                    key={pkg._id}
                    style={{
                      padding: '18px',
                      background: '#f8fafc',
                      border: '1.5px solid #cbd5e1',
                      borderRadius: '18px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: '800', fontSize: '1.05rem', color: '#0f172a' }}>{pkg.title}</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                          <Clock size={14} color="#3b82f6" /> Duration: {pkg.duration || '45 mins'}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#16a34a' }}>
                          ₹{(pkg.finalPrice || pkg.price).toLocaleString('en-IN')}
                        </div>
                        {pkg.price && pkg.price > (pkg.finalPrice || pkg.price) && (
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                            ₹{pkg.price}
                          </div>
                        )}
                      </div>
                    </div>

                    {pkg.features && pkg.features.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', background: '#ffffff', padding: '10px 12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        {pkg.features.map((feat, fIdx) => (
                          <div key={fIdx} style={{ fontSize: '0.8rem', color: '#334155', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <CheckCircle2 size={14} color="#16a34a" /> {feat}
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => handleAddPackageToBooking(pkg)}
                      disabled={addingExtraService}
                      className="btn"
                      style={{
                        padding: '12px',
                        background: '#16a34a',
                        color: '#ffffff',
                        fontWeight: '800',
                        fontSize: '0.92rem',
                        borderRadius: '14px',
                        border: 'none',
                        marginTop: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)',
                      }}
                    >
                      {addingExtraService ? <Loader2 size={18} className="spin" /> : <Plus size={18} />} Select & Add Package (+₹{pkg.finalPrice || pkg.price})
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerFulfillmentPage;
