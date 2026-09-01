import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Phone,
  MessageSquare,
  MapPin,
  Clock,
  CheckCircle2,
  Navigation,
  ShieldCheck,
  Key,
  UserCheck,
  AlertCircle,
  Loader2,
  Star,
  Download,
  FileText,
  Share2,
  XCircle
} from 'lucide-react';
import LiveChatModal from '../../components/common/LiveChatModal.jsx';
import PartnerProfileModal from '../../components/customer/PartnerProfileModal.jsx';
import ReviewModal from '../../components/common/ReviewModal.jsx';
import CancelBookingModal from '../../components/customer/CancelBookingModal.jsx';
import VoiceCallModal from '../../components/common/VoiceCallModal.jsx';
import { socketService } from '../../services/socket.service.js';
import { geoapifyService } from '../../services/geoapify.service.js';
import { axiosInstance } from '../../api/axiosInstance.js';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { toast } from '../../utils/toast.js';

// Dedicated Interactive Live Tracking Map for Customer App
const CustomerTrackingMap = ({ partnerCoords, customerCoords, partnerName, isAssigned, fullAddressStr }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [routeInfo, setRouteInfo] = useState(null);

  useEffect(() => {
    let isMounted = true;
    if (!mapContainerRef.current) return;

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

      const map = L.map(mapContainerRef.current, {
        center: [customerCoords.lat, customerCoords.lng],
        zoom: 14,
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer(geoapifyService.getTileUrl('osm-bright'), {
        maxZoom: 19,
      }).addTo(map);

      // Customer Doorstep Marker Pin
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
        .bindPopup(`<b>Your Address:</b><br/>${fullAddressStr}`);

      if (isAssigned) {
        // Partner Live Location Marker Pin
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
          .bindPopup(`<b>Technician (${partnerName})</b><br/>Live Location`);

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
      }

      mapInstanceRef.current = map;
      setTimeout(() => map.invalidateSize(), 300);
    } catch (err) {
      console.error('Customer tracking map error:', err);
    }

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        try { mapInstanceRef.current.remove(); } catch (_) {}
        mapInstanceRef.current = null;
      }
    };
  }, [partnerCoords.lat, partnerCoords.lng, customerCoords.lat, customerCoords.lng, isAssigned, partnerName, fullAddressStr]);

  return (
    <div style={{ height: '320px', width: '100%', borderRadius: '24px', overflow: 'hidden', border: '1px solid #cbd5e1', position: 'relative', background: '#0b131e' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Floating Route Info Badge */}
      <div style={{ position: 'absolute', bottom: '14px', left: '14px', zIndex: 400, background: 'rgba(15, 23, 42, 0.92)', color: '#ffffff', padding: '10px 18px', borderRadius: '14px', fontSize: '0.88rem', fontWeight: '800', backdropFilter: 'blur(6px)', boxShadow: '0 4px 16px rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Navigation size={18} color="#10b981" />
        {isAssigned ? (
          <span>
            Partner Live Route: <strong style={{ color: '#10b981' }}>{routeInfo?.distanceKm || '2.4'} km</strong> (~{routeInfo?.durationMins || '7'} mins ETA)
          </span>
        ) : (
          <span>Searching nearest technician within 5km...</span>
        )}
      </div>
    </div>
  );
};

const CustomerBookingTrackingPage = ({ booking, currentUser, onBack }) => {
  const [chatOpen, setChatOpen] = useState(false);
  const [partnerProfileOpen, setPartnerProfileOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [showInvoiceView, setShowInvoiceView] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [voiceCallOpen, setVoiceCallOpen] = useState(false);
  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const [liveBooking, setLiveBooking] = useState(booking);
  const [livePartnerCoords, setLivePartnerCoords] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!booking) return;
    let isMounted = true;
    const socket = socketService.connect();
    socketRef.current = socket;

    const bIdStr = booking._id || booking.id;
    socket.emit('join_user', { userId: currentUser?._id || currentUser?.id });
    if (bIdStr) {
      socket.emit('join_chat_room', { bookingId: bIdStr });
    }

    // Live Partner Location & Status Polling (Every 30 seconds)
    const fetchFreshBookingStatus = async () => {
      if (!bIdStr || bIdStr.toString().startsWith('demo')) return;
      try {
        const res = await axiosInstance.get(`/bookings/${bIdStr}`);
        const freshData = res.data?.data || res.data?.booking || res.data;
        if (freshData && isMounted) {
          setLiveBooking(freshData);
          if (freshData.partner?.locationCoordinates) {
            const lat = freshData.partner.locationCoordinates.lat || freshData.partner.locationCoordinates.coordinates?.[1];
            const lng = freshData.partner.locationCoordinates.lng || freshData.partner.locationCoordinates.coordinates?.[0];
            if (lat && lng) setLivePartnerCoords({ lat: Number(lat), lng: Number(lng) });
          }
        }
      } catch (err) {
        console.warn('Live partner polling notice:', err);
      }
    };

    fetchFreshBookingStatus();
    const intervalId = setInterval(fetchFreshBookingStatus, 30000); // 30s polling

    const handleIncomingCall = (data) => {
      if (!data || data.callerRole === 'customer') return;
      if (data.bookingId === bIdStr || data.conversationId === bIdStr || !data.bookingId) {
        setIsIncomingCall(true);
        setVoiceCallOpen(true);
        toast.info('📞 Incoming Call from Service Partner...');
      }
    };

    const handlePartnerLocationUpdate = (data) => {
      if (data?.lat && data?.lng && isMounted) {
        setLivePartnerCoords({ lat: Number(data.lat), lng: Number(data.lng) });
      }
    };

    socket.on('voice:call:incoming', handleIncomingCall);
    socket.on('partner_location_update', handlePartnerLocationUpdate);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
      socket.off('voice:call:incoming', handleIncomingCall);
      socket.off('partner_location_update', handlePartnerLocationUpdate);
    };
  }, [booking, currentUser]);

  if (!booking) return null;
  const currentBooking = liveBooking || booking;

  // Extracted Fields & Partner Assignment Check
  const bRef = booking.bookingId || booking.bookingNumber || `UC-${booking._id?.toString().slice(-6).toUpperCase() || '83547'}`;
  const sTitle = booking.packageName || booking.service?.name || booking.serviceName || booking.packageTitle || 'Service Package';
  const sAmount = booking.amount || booking.totalAmount || booking.service?.finalPrice || 599;
  const rawStatus = booking.status || 'Pending';

  const isCompleted = rawStatus === 'Completed' || rawStatus === 'completed';

  // Check if partner is actually assigned & accepted
  const isAssigned = Boolean(
    booking.partner &&
    (typeof booking.partner === 'object' ? booking.partner.name : booking.partner) &&
    rawStatus !== 'Pending'
  );

  const sStatus = isAssigned ? rawStatus : 'Pending';

  // OTP Verification & Cancellation Rules
  const isOtpVerified = Boolean(booking.otpVerified || booking.serviceStarted || sStatus === 'Started' || sStatus === 'In Progress');
  const isFinishedOrCancelled = isCompleted || sStatus === 'Cancelled' || sStatus === 'cancelled' || sStatus === 'Refunded';
  const canCancel = !isOtpVerified && !isFinishedOrCancelled;

  // 4-Digit OTP Code
  const otpCode = String(booking.completionOtp || '2847');
  const otpDigits = otpCode.length === 4 ? otpCode.split('') : ['2', '8', '4', '7'];

  // Partner Info
  const partnerObj = typeof booking.partner === 'object' ? booking.partner : null;
  const partnerName = isAssigned ? (partnerObj?.name || 'Assigned Technician') : 'Searching Partner';
  const partnerPhone = isAssigned ? (partnerObj?.phone || '') : null;
  const rawDateStr = booking.bookingDate
    ? new Date(booking.bookingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Today';

  let displaySlot = booking.timeSlot || booking.bookingTimeSlot || '10:30 AM';
  if (displaySlot.includes('•')) {
    displaySlot = displaySlot.split('•').pop().trim();
  } else if (displaySlot.includes(' at ')) {
    displaySlot = displaySlot.split(' at ').pop().trim();
  }

  const sFormattedDate = `${rawDateStr} • ${displaySlot}`;

const addressText = typeof booking.address === 'object'
    ? `${booking.address?.addressLine ? booking.address.addressLine + ', ' : ''}${booking.address?.city || booking.city || 'Delhi NCR'}`
    : (booking.address || booking.city || 'Delhi NCR');

  const primaryServicePrice = booking.packageSnapshot?.finalPrice ||
                              booking.packageSnapshot?.price ||
                              booking.service?.finalPrice ||
                              booking.service?.price ||
                              (booking.extraServices && booking.extraServices.length > 0
                                ? Math.max(0, booking.amount - booking.extraServices.reduce((s, i) => s + Number(i.price || 0), 0))
                                : booking.amount) ||
                              399;

  const extraServicesList = booking.extraServices || [];
  const extraServicesTotal = extraServicesList.reduce((sum, item) => sum + Number(item.price || 0), 0);
  const totalSubtotal = primaryServicePrice + extraServicesTotal;
  const totalPaidAmount = booking.amount || totalSubtotal;
  const basePrice = primaryServicePrice;
  const platformFee = 0;

  // Extract Customer Coordinates
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

  // Extract Live Partner Coordinates
  let pLat = livePartnerCoords?.lat || currentBooking?.partner?.locationCoordinates?.lat || currentBooking?.partner?.locationCoordinates?.coordinates?.[1];
  let pLng = livePartnerCoords?.lng || currentBooking?.partner?.locationCoordinates?.lng || currentBooking?.partner?.locationCoordinates?.coordinates?.[0];

  let isFarAway = false;
  if (!pLat || !pLng || isNaN(pLat) || isNaN(pLng)) {
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

  const activePartnerCoords = { lat: Number(pLat), lng: Number(pLng) };

  const handleDownloadInvoice = () => {
    toast.success('📄 Official Service Invoice & Payment Receipt generated!');
    window.print();
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', paddingBottom: '60px' }}>
      
      {/* TOP HEADER NAVIGATION BAR */}
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
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
              <ArrowLeft size={18} /> Back to My Bookings
            </button>

            <div>
              <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#2563eb', display: 'block' }}>BOOKING REF: {bRef}</span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: '2px 0 0 0', color: '#0f172a' }}>
                {isCompleted ? 'Service Completed & Tax Receipt' : 'Service Tracking & Live Location'}
              </h2>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {canCancel && (
              <button
                type="button"
                onClick={() => setCancelModalOpen(true)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '12px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#ef4444',
                  fontWeight: '800',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <XCircle size={16} /> Cancel Booking
              </button>
            )}

            {isOtpVerified && !isFinishedOrCancelled && (
              <span
                style={{
                  padding: '8px 14px',
                  borderRadius: '12px',
                  background: 'rgba(245, 158, 11, 0.12)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  color: '#d97706',
                  fontSize: '0.78rem',
                  fontWeight: '800',
                }}
              >
                🔒 Service In Progress (OTP Verified)
              </span>
            )}

            <span
              className={`badge ${
                isCompleted
                  ? 'badge-success'
                  : isAssigned
                  ? 'badge-purple'
                  : 'badge-warning'
              }`}
              style={{ padding: '8px 16px', fontSize: '0.85rem', fontWeight: '800' }}
            >
              {isCompleted ? 'SERVICE COMPLETED 🎉' : isAssigned ? sStatus.toUpperCase() : 'PENDING - SEARCHING FOR TECHNICIAN'}
            </span>
          </div>
        </div>
      </header>

      {/* DEDICATED FULL PAGE CONTENT BODY */}
      <main style={{ maxWidth: '1200px', margin: '28px auto 0 auto', padding: '0 24px' }}>
           {/* COMPLETED VIEW MATCHING FIGMA SCREEN 3 AND INVOICE SCREEN 8 */}
        {isCompleted ? (
          showInvoiceView ? (
            /* FIGMA SCREEN 8: INVOICE DETAILS VIEW */
            <div style={{ maxWidth: '500px', margin: '0 auto' }}>
              {/* TOP INVOICE HEADER BAR */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                <button
                  type="button"
                  onClick={() => setShowInvoiceView(false)}
                  style={{
                    background: '#ffffff',
                    border: '1px solid var(--border-light)',
                    color: '#0f172a',
                    borderRadius: '12px',
                    padding: '8px 16px',
                    fontSize: '0.85rem',
                    fontWeight: '800',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <ArrowLeft size={16} /> Back to Summary
                </button>

                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>
                  Tax Invoice
                </h3>

                <div style={{ width: '80px' }} />
              </div>

              {/* MAIN INVOICE CARD MATCHING FIGMA SCREEN 8 */}
              <div
                style={{
                  background: '#0d1322',
                  color: '#ffffff',
                  borderRadius: '28px',
                  padding: '28px 24px',
                  boxShadow: '0 25px 60px rgba(0, 0, 0, 0.45)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                {/* BRAND HEADER & INVOICE REF */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingBottom: '18px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    marginBottom: '20px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '14px',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        fontWeight: '800',
                        fontSize: '1.3rem',
                        boxShadow: '0 6px 16px rgba(16, 185, 129, 0.3)',
                      }}
                    >
                      N
                    </div>
                    <span style={{ fontSize: '1.35rem', fontWeight: '800', color: '#ffffff' }}>Norozz</span>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1rem', fontWeight: '800', color: '#ffffff', letterSpacing: '0.5px' }}>
                      #INV-{bRef}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
                      {sFormattedDate}
                    </div>
                  </div>
                </div>

                {/* BILLED TO SECTION */}
                <div style={{ marginBottom: '22px' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '6px' }}>
                    BILLED TO
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#ffffff' }}>
                    {currentUser?.name || booking.customerName || 'Rahul'}
                  </div>
                  <div style={{ fontSize: '0.84rem', color: '#cbd5e1', marginTop: '2px' }}>
                    {currentUser?.phone || booking.customerPhone || '+91 63873 XXXXX'}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '4px', lineHeight: 1.45 }}>
                    {addressText}
                  </div>
                </div>

                {/* SERVICE ITEM TABLE HEADER & ROWS */}
                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', padding: '14px 0', marginBottom: '18px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 0.8fr 1fr', fontSize: '0.76rem', fontWeight: '800', color: '#94a3b8', marginBottom: '10px' }}>
                    <span>Service Item</span>
                    <span style={{ textAlign: 'center' }}>Qty</span>
                    <span style={{ textAlign: 'right' }}>Amount</span>
                  </div>

                  {/* Primary Booked Service */}
                  <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 0.8fr 1fr', fontSize: '0.92rem', fontWeight: '700', color: '#ffffff', alignItems: 'center', marginBottom: extraServicesList.length > 0 ? '8px' : '0' }}>
                    <span style={{ lineHeight: 1.3 }}>{sTitle}</span>
                    <span style={{ textAlign: 'center', color: '#94a3b8' }}>1</span>
                    <span style={{ textAlign: 'right' }}>₹{primaryServicePrice}</span>
                  </div>

                  {/* Extra Services Added During Execution */}
                  {extraServicesList.map((item, idx) => (
                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2.2fr 0.8fr 1fr', fontSize: '0.88rem', fontWeight: '600', color: '#34d399', alignItems: 'center', marginTop: '6px' }}>
                      <span style={{ lineHeight: 1.3 }}>+ {item.name || item.serviceName || 'Extra Service'}</span>
                      <span style={{ textAlign: 'center', color: '#94a3b8' }}>1</span>
                      <span style={{ textAlign: 'right' }}>+₹{item.price}</span>
                    </div>
                  ))}
                </div>

                {/* FINANCIAL SUMMARY BREAKDOWN */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem', marginBottom: '22px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8' }}>Subtotal</span>
                    <span style={{ color: '#ffffff', fontWeight: '700' }}>₹{totalSubtotal}</span>
                  </div>

                  {booking.discount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#94a3b8' }}>Coupon Discount</span>
                      <span style={{ color: '#34d399', fontWeight: '700' }}>-₹{booking.discount}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', fontSize: '1.2rem' }}>
                    <span style={{ color: '#ffffff', fontWeight: '800' }}>Paid Total</span>
                    <span style={{ color: '#34d399', fontWeight: '800' }}>₹{totalPaidAmount}</span>
                  </div>
                </div>

                {/* PAYMENT METHOD & STATUS BADGE */}
                <div
                  style={{
                    padding: '14px 18px',
                    borderRadius: '16px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '700' }}>Payment Method</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#ffffff', marginTop: '2px' }}>
                      {booking.paymentMethod || 'UPI • GPay'}
                    </div>
                  </div>

                  <span
                    style={{
                      background: 'rgba(16, 185, 129, 0.15)',
                      color: '#34d399',
                      border: '1px solid #10b981',
                      padding: '4px 14px',
                      borderRadius: '10px',
                      fontSize: '0.75rem',
                      fontWeight: '800',
                      letterSpacing: '0.5px',
                    }}
                  >
                    SUCCESS
                  </span>
                </div>
              </div>

              {/* DOWNLOAD PDF & SHARE CTA BUTTONS */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => {
                    toast.success('📄 Tax Invoice PDF generated successfully!');
                    window.print();
                  }}
                  style={{
                    padding: '16px',
                    borderRadius: '18px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#ffffff',
                    fontWeight: '800',
                    fontSize: '0.95rem',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 6px 20px rgba(16, 185, 129, 0.35)',
                  }}
                >
                  <Download size={18} /> Download PDF
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: `Norozz Invoice #INV-${bRef}`,
                        text: `Tax Invoice for ${sTitle} on Norozz App - Total Paid ₹${sAmount}`,
                        url: window.location.href,
                      });
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success('📋 Invoice link copied to clipboard!');
                    }
                  }}
                  style={{
                    padding: '16px',
                    borderRadius: '18px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#ffffff',
                    fontWeight: '800',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <Share2 size={16} /> Share
                </button>
              </div>
            </div>
          ) : (
            /* COMPLETED SERVICE SUMMARY CARD */
            <div style={{ maxWidth: '540px', margin: '0 auto' }}>
              <div
                className="mui-card"
                style={{
                  background: 'linear-gradient(180deg, #111827 0%, #0f172a 100%)',
                  color: '#ffffff',
                  borderRadius: '32px',
                  padding: '36px 28px',
                  boxShadow: '0 25px 60px rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  textAlign: 'center',
                }}
              >
                {/* BIG GLOWING GREEN CHECK CIRCLE */}
                <div
                  style={{
                    width: '84px',
                    height: '84px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#ffffff',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 12px 30px rgba(16, 185, 129, 0.4)',
                    marginBottom: '18px',
                  }}
                >
                  <CheckCircle2 size={46} strokeWidth={2.5} />
                </div>

                <h2 style={{ fontSize: '1.75rem', fontWeight: '800', margin: 0, color: '#ffffff' }}>
                  Service Completed!
                </h2>
                <p style={{ fontSize: '0.88rem', color: '#94a3b8', margin: '6px 0 24px 0' }}>
                  Your service is completed successfully & quality audited.
                </p>

                {/* CARD 1: SERVICE SUMMARY */}
                <div
                  style={{
                    padding: '20px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '20px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    textAlign: 'left',
                    marginBottom: '18px',
                  }}
                >
                  <div style={{ fontSize: '0.74rem', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.6px', textTransform: 'uppercase', marginBottom: '12px' }}>
                    SERVICE SUMMARY
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#94a3b8', fontWeight: '600' }}>Job Type</span>
                      <span style={{ color: '#ffffff', fontWeight: '800' }}>{sTitle}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#94a3b8', fontWeight: '600' }}>Duration</span>
                      <span style={{ color: '#ffffff', fontWeight: '700' }}>{booking.service?.duration || '45 mins'}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#94a3b8', fontWeight: '600' }}>Partner</span>
                      <span
                        onClick={() => setPartnerProfileOpen(true)}
                        style={{ color: '#34d399', fontWeight: '800', cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        {partnerName}
                      </span>
                    </div>
                  </div>
                </div>

                {/* CARD 2: PAYMENT DETAILS */}
                <div
                  style={{
                    padding: '20px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '20px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    textAlign: 'left',
                    marginBottom: '24px',
                  }}
                >
                  <div style={{ fontSize: '0.74rem', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.6px', textTransform: 'uppercase', marginBottom: '12px' }}>
                    PAYMENT DETAILS
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#94a3b8' }}>Base Fare</span>
                      <span style={{ color: '#ffffff', fontWeight: '700' }}>₹{basePrice}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#94a3b8' }}>Taxes & Platform Fees</span>
                      <span style={{ color: '#ffffff', fontWeight: '700' }}>₹{platformFee}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '1.1rem' }}>
                      <span style={{ color: '#ffffff', fontWeight: '800' }}>Total Paid</span>
                      <span style={{ color: '#34d399', fontWeight: '800' }}>₹{sAmount}</span>
                    </div>
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setReviewModalOpen(true)}
                    style={{
                      padding: '16px',
                      borderRadius: '18px',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: '#ffffff',
                      fontWeight: '800',
                      fontSize: '1rem',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 6px 20px rgba(16, 185, 129, 0.35)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    <Star size={20} fill="#ffffff" color="#ffffff" /> Rate & Review Partner
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowInvoiceView(true)}
                    style={{
                      padding: '14px',
                      borderRadius: '18px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      color: '#ffffff',
                      fontWeight: '700',
                      fontSize: '0.92rem',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    <Download size={18} /> Download Tax Invoice
                  </button>
                </div>
              </div>
            </div>
          )
        ) : (
          /* LIVE TRACKING & DISPATCH VIEW */
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
              gap: '24px',
              alignItems: 'start',
            }}
          >
            {/* LEFT COLUMN: OTP & LIVE TRACKING MAP */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* 1. VERIFICATION OTP CARD / SEARCHING RADAR CARD */}
              {isAssigned ? (
                <div
                  className="mui-card"
                  style={{
                    padding: '24px',
                    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                    color: '#ffffff',
                    borderRadius: '24px',
                    boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '0.8rem', fontWeight: '800', letterSpacing: '1px', opacity: 0.9, textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <Key size={18} /> SERVICE START VERIFICATION OTP
                  </div>

                  {/* 4-Digit OTP Boxes */}
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', margin: '14px 0' }}>
                    {otpDigits.map((d, i) => (
                      <div
                        key={i}
                        style={{
                          width: '56px',
                          height: '62px',
                          borderRadius: '16px',
                          background: '#ffffff',
                          color: '#065f46',
                          fontSize: '2rem',
                          fontWeight: '800',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        }}
                      >
                        {d}
                      </div>
                    ))}
                  </div>

                  <p style={{ fontSize: '0.85rem', margin: 0, opacity: 0.95, lineHeight: '1.4', fontWeight: '600' }}>
                    🔑 Share this 4-digit OTP code with your technician (<strong>{partnerName}</strong>) upon arrival to start your service.
                  </p>
                </div>
              ) : (
                <div
                  className="mui-card"
                  style={{
                    padding: '24px',
                    background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
                    color: '#ffffff',
                    borderRadius: '24px',
                    boxShadow: '0 10px 25px rgba(37, 99, 235, 0.3)',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Loader2 size={26} className="spin" color="#ffffff" />
                    </div>
                  </div>

                  <div style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '6px' }}>
                    🔍 Searching for Nearby Verified Technicians...
                  </div>

                  <p style={{ fontSize: '0.84rem', opacity: 0.9, margin: '0 0 14px 0', lineHeight: 1.5 }}>
                    Your booking request has been broadcasted to all active certified service partners in <strong>{booking.city || 'your city'}</strong>.
                  </p>

                  <div style={{ padding: '10px 16px', background: 'rgba(255,255,255,0.15)', borderRadius: '12px', fontSize: '0.78rem', fontWeight: '700' }}>
                    🔒 Your 4-digit Start OTP will unlock automatically as soon as a partner accepts your booking request.
                  </div>
                </div>
              )}

              {/* 2. LIVE PARTNER TRACKING MAP CARD */}
              <div className="mui-card" style={{ borderRadius: '24px', overflow: 'hidden', border: '1px solid #cbd5e1', background: '#ffffff', boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}>
                <div style={{ padding: '16px 20px', background: isAssigned ? '#ecfdf5' : '#fffbe0', borderBottom: isAssigned ? '1px solid #a7f3d0' : '1px solid #fde68a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: isAssigned ? '#059669' : '#d97706', fontWeight: '800', fontSize: '0.95rem' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: isAssigned ? '#10b981' : '#f59e0b' }} />
                    {isAssigned ? (sStatus === 'On The Way' ? 'Technician is On The Way' : sStatus === 'Started' ? 'Service In Progress' : 'Technician Assigned') : 'Awaiting Partner Acceptance'}
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: '800', color: isAssigned ? '#047857' : '#b45309' }}>
                    {isAssigned ? '⏱️ ~7 mins ETA' : '⌛ Dispatch in Progress'}
                  </span>
                </div>

                {/* Embedded Live Interactive Geoapify Route Map */}
                <CustomerTrackingMap partnerCoords={activePartnerCoords} customerCoords={customerCoords} partnerName={partnerName} isAssigned={isAssigned} fullAddressStr={addressText} />
              </div>
            </div>

            {/* RIGHT COLUMN: TECHNICIAN INFO, SERVICE SUMMARY, TIMELINE */}
            <div
              className="mui-card"
              style={{
                padding: '24px',
                background: '#ffffff',
                borderRadius: '24px',
                border: '1px solid #cbd5e1',
                boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
              }}
            >
              {/* 3. ASSIGNED TECHNICIAN CONTACT CARD */}
              <div style={{ padding: '18px', background: isAssigned ? '#f8fafc' : '#fffef0', borderRadius: '18px', border: isAssigned ? '1px solid #e2e8f0' : '1px solid #fde68a', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
                <div
                  onClick={() => isAssigned && setPartnerProfileOpen(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    cursor: isAssigned ? 'pointer' : 'default',
                    transition: 'opacity 0.2s ease',
                  }}
                  title={isAssigned ? 'Click to view partner public profile & verified details' : ''}
                >
                  <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: isAssigned ? 'linear-gradient(135deg, #2563eb, #7c3aed)' : '#cbd5e1', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1.4rem' }}>
                    {isAssigned ? partnerName.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '1.05rem', color: isAssigned ? '#0f172a' : '#b45309', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {isAssigned ? partnerName : 'Searching for Nearby Partner...'}
                      {isAssigned && (
                        <span style={{ fontSize: '0.68rem', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', padding: '2px 8px', borderRadius: '10px', fontWeight: '800' }}>
                          View Profile ➔
                        </span>
                      )}
                    </div>
                    {isAssigned ? (
                      <div style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: '700', marginTop: '2px' }}>⭐ 4.9 Technician Rating (120+ Services)</div>
                    ) : (
                      <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>Will assign as soon as a partner accepts</div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => isAssigned && setChatOpen(true)}
                    disabled={!isAssigned}
                    className="btn btn-sm"
                    style={{
                      background: isAssigned ? '#eff6ff' : '#f1f5f9',
                      color: isAssigned ? '#2563eb' : '#94a3b8',
                      fontWeight: '800',
                      borderRadius: '12px',
                      border: 'none',
                      padding: '10px 16px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: isAssigned ? 'pointer' : 'not-allowed'
                    }}
                    title={isAssigned ? 'Open Live Chat' : 'Live chat will unlock after partner accepts'}
                  >
                    <MessageSquare size={16} /> Live Chat
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (!isAssigned) {
                        toast.error('Partner has not accepted the booking yet.');
                        return;
                      }
                      setIsIncomingCall(false);
                      setVoiceCallOpen(true);
                    }}
                    disabled={!isAssigned}
                    className="btn btn-sm"
                    style={{
                      background: isAssigned ? '#ecfdf5' : '#f1f5f9',
                      color: isAssigned ? '#16a34a' : '#94a3b8',
                      fontWeight: '800',
                      borderRadius: '12px',
                      border: 'none',
                      padding: '10px 16px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: isAssigned ? 'pointer' : 'not-allowed'
                    }}
                    title={isAssigned ? 'Start Real-Time Voice Call with Partner' : 'Call unlocks when partner is assigned'}
                  >
                    <Phone size={16} /> Call Partner
                  </button>
                </div>
              </div>

              {/* 4. SERVICE DETAILS SUMMARY */}
              <div style={{ padding: '18px', background: '#f8fafc', borderRadius: '18px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>BOOKED SERVICE</div>
                <div style={{ fontWeight: '800', fontSize: '1.1rem', color: '#0f172a' }}>{sTitle}</div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #e2e8f0', fontSize: '0.88rem', color: '#475569' }}>
                  <div>
                    <Clock size={16} style={{ display: 'inline', marginRight: '6px' }} />
                    {sFormattedDate}
                  </div>
                  <div style={{ fontWeight: '800', fontSize: '1.3rem', color: '#16a34a' }}>₹{sAmount}</div>
                </div>

                <div style={{ fontSize: '0.85rem', color: '#334155', marginTop: '4px', lineHeight: '1.4' }}>
                  📍 <strong>Delivery Address:</strong> {addressText}
                </div>
              </div>

              {/* 5. STATUS TIMELINE */}
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '12px' }}>SERVICE STATUS TIMELINE</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: '8px' }}>
                  {[
                    { title: 'Booking Placed & Confirmed', active: true, done: true },
                    {
                      title: isAssigned ? `Technician Assigned (${partnerName})` : 'Searching & Assigning Nearby Technician',
                      active: true,
                      done: isAssigned
                    },
                    {
                      title: 'Technician On The Way',
                      active: sStatus === 'On The Way' || sStatus === 'Started' || sStatus === 'Completed',
                      done: sStatus === 'Started' || sStatus === 'Completed'
                    },
                    {
                      title: 'Service Started (OTP Verified)',
                      active: sStatus === 'Started' || sStatus === 'Completed',
                      done: sStatus === 'Completed'
                    },
                    {
                      title: 'Service Completed & Paid',
                      active: sStatus === 'Completed',
                      done: sStatus === 'Completed'
                    },
                  ].map((t, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <CheckCircle2 size={20} color={t.done ? '#16a34a' : t.active ? (isAssigned ? '#2563eb' : '#f59e0b') : '#cbd5e1'} />
                      <span style={{ fontSize: '0.9rem', fontWeight: t.active ? '800' : '600', color: t.active ? '#0f172a' : '#64748b' }}>
                        {t.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* REAL-TIME SOCKET.IO LIVE CHAT MODAL */}
      {isAssigned && (
        <LiveChatModal
          isOpen={chatOpen}
          booking={booking}
          currentUser={currentUser}
          userRole="customer"
          onClose={() => setChatOpen(false)}
        />
      )}

      {/* PARTNER PUBLIC PROFILE MODAL */}
      <PartnerProfileModal
        isOpen={partnerProfileOpen}
        partner={booking.partner}
        partnerId={booking.partner?._id || booking.partner}
        onClose={() => setPartnerProfileOpen(false)}
      />

      {/* RATE & REVIEW MODAL (FIGMA SCREEN 4) */}
      <ReviewModal
        isOpen={reviewModalOpen}
        booking={booking}
        onClose={() => setReviewModalOpen(false)}
        onSuccess={() => {
          toast.success('Thank you for rating your service!');
        }}
      />

      {/* CANCEL BOOKING MODAL (FIGMA SCREEN 2) */}
      <CancelBookingModal
        isOpen={cancelModalOpen}
        booking={booking}
        onClose={() => setCancelModalOpen(false)}
        onSuccess={() => {
          if (onBack) onBack();
        }}
      />
      {/* REAL-TIME VOICE CALL MODAL */}
      <VoiceCallModal
        isOpen={voiceCallOpen}
        onClose={() => {
          setVoiceCallOpen(false);
          setIsIncomingCall(false);
        }}
        bookingId={booking._id || booking.id}
        remoteUserName={partnerName}
        role="customer"
        isIncoming={isIncomingCall}
        socket={socketRef.current}
      />

    </div>
  );
};

export default CustomerBookingTrackingPage;
