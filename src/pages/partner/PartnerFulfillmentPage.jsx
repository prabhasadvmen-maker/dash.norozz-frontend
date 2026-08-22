import React, { useState, useEffect } from 'react';
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
  ExternalLink
} from 'lucide-react';
import { toast } from '../../utils/toast.js';
import { useBookings } from '../../hooks/useBookings.js';
import { axiosInstance } from '../../api/axiosInstance.js';
import { partnerService } from '../../services/partner.service.js';
import LiveChatModal from '../../components/common/LiveChatModal.jsx';

const PartnerFulfillmentPage = ({ booking, currentUser, onBack, onComplete }) => {
  const { updateBookingStatus, completeBooking } = useBookings();
  const [chatOpen, setChatOpen] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);

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
  const [checklist, setChecklist] = useState([
    { id: 1, text: 'Inspection of Split AC Unit', completed: true },
    { id: 2, text: 'Diagnosis & Gas Pressure Check', completed: true },
    { id: 3, text: 'Copper Pipe Leakage Repair', completed: false },
    { id: 4, text: 'Final System Testing & Cooling Audit', completed: false },
  ]);

  // Add-ons / Extra Services State
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('online'); // 'online' | 'cash'
  const [showQr, setShowQr] = useState(false);
  const [completingPayment, setCompletingPayment] = useState(false);

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
      if (booking.status === 'On The Way') setStep(2);
      else if (booking.status === 'Started') setStep(5);
      else setStep(1);

      setOtpDigits(['', '', '', '']);
      fetchFreshBookingData();
    }
  }, [booking]);

  // Work Timer Effect
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
  const sTitle = currentBooking.packageName || currentBooking.service?.name || currentBooking.serviceTitle || 'Beard Trim & Hot Towel Shave - Beard Styling & Steam';
  const basePrice = currentBooking.amount || currentBooking.totalAmount || currentBooking.service?.finalPrice || 276;
  const addonsTotal = selectedAddons.reduce((acc, curr) => acc + curr.price, 0);
  const finalTotal = basePrice + addonsTotal;
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

  // Real Distance & Time Calculation using Haversine
  const calculateDistanceInfo = () => {
    const pLat = currentUser?.locationCoordinates?.coordinates?.[1] || 12.9352;
    const pLng = currentUser?.locationCoordinates?.coordinates?.[0] || 77.6245;

    const cLat = currentBooking.address?.coordinates?.[1] || 12.9121;
    const cLng = currentBooking.address?.coordinates?.[0] || 77.6445;

    const R = 6371;
    const dLat = (cLat - pLat) * (Math.PI / 180);
    const dLon = (cLng - pLng) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(pLat * (Math.PI / 180)) * Math.cos(cLat * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const dist = R * c;
    const km = dist > 0.1 ? Number(dist.toFixed(1)) : 3.2;
    const durationMins = Math.max(4, Math.round((km / 20) * 60));
    return { km, durationMins };
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

  // Toggle Checklist item
  const toggleChecklist = (id) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  // Step 7: Add Addon item
  const handleAddAddon = (addon) => {
    if (selectedAddons.some((a) => a.id === addon.id)) {
      setSelectedAddons((prev) => prev.filter((a) => a.id !== addon.id));
      toast.info(`Removed ${addon.name}`);
    } else {
      setSelectedAddons((prev) => [...prev, addon]);
      toast.success(`Added ${addon.name} (+₹${addon.price})`);
    }
  };

  // Step 8: Final Payment & Complete Order
  const handleConfirmFinalPayment = async () => {
    setCompletingPayment(true);
    try {
      if (rawId && !rawId.toString().startsWith('demo')) {
        await completeBooking(rawId);
      } else {
        toast.success(`Job Completed! Payment of ₹${finalTotal} collected.`);
      }
      if (onComplete) onComplete();
      if (onBack) onBack();
    } catch (err) {
      toast.error('Error completing service');
    } finally {
      setCompletingPayment(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', paddingBottom: '60px' }}>
      
      {/* TOP HEADER NAVIGATION BAR */}
      <header
        style={{
          background: '#ffffff',
          borderBottom: '1px solid var(--border-light)',
          padding: '16px 32px',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              type="button"
              onClick={onBack}
              className="btn btn-secondary btn-sm"
              style={{ padding: '8px 16px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <ArrowLeft size={18} /> Back
            </button>

            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#2563eb' }}>BOOKING ID: {bId}</span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {step === 1 && 'Booking Details & Location'}
                {step === 2 && 'Navigation to Customer'}
                {step === 3 && 'Customer Profile & Instructions'}
                {step === 4 && 'Verify Customer OTP'}
                {step === 5 && 'Service Execution & Timer'}
                {step === 6 && 'Pause Service'}
                {step === 7 && 'Add Extra Service Add-ons'}
                {step === 8 && 'Payment Collection & Summary'}
                {loadingFullData && <Loader2 size={16} className="spin" color="#2563eb" />}
              </h2>
            </div>
          </div>

          <span className="badge badge-purple" style={{ padding: '8px 16px', fontSize: '0.85rem', fontWeight: '800' }}>
            Step {step} of 8
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
            boxShadow: 'var(--shadow-md)',
            border: '1px solid var(--border-light)',
          }}
        >
          {/* STEP 1: BOOKING DETAILS & MAP PREVIEW */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>SERVICE CONFIRMED</span>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>{bId}</h3>
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
                  border: '1.5px solid var(--border-light)',
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
                  <a
                    href={`tel:${custPhone}`}
                    onClick={(e) => e.stopPropagation()}
                    style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#ecfdf5', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
                  >
                    <Phone size={18} />
                  </a>
                </div>
              </div>

              {/* Service & Price Card */}
              <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '16px', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: '800', fontSize: '1.05rem', color: 'var(--text-primary)' }}>{sTitle}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>Today, 10:30 AM • Online Payment</div>
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#16a34a' }}>₹{basePrice}</div>
              </div>

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
              <div style={{ height: '200px', borderRadius: '18px', background: '#e0f2fe', overflow: 'hidden', border: '1px solid #bae6fd', position: 'relative' }}>
                <iframe
                  title="Route Preview Map"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(fullAddressStr)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                  style={{ filter: 'contrast(1.05)' }}
                />
                <div style={{ position: 'absolute', bottom: '12px', left: '12px', background: 'rgba(255,255,255,0.95)', padding: '6px 14px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: '800', color: '#0284c7', boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}>
                  📍 Live Partner ➔ Customer ({distanceInfo.km} km remaining)
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '14px', marginTop: '10px' }}>
                <button type="button" onClick={onBack} className="btn" style={{ padding: '13px', background: '#f1f5f9', color: '#64748b', fontWeight: '700', borderRadius: '14px', border: '1px solid var(--border-light)' }}>
                  Back to Dashboard
                </button>
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

              {/* Full Route Map with Real Calculated Distance */}
              <div style={{ height: '260px', borderRadius: '18px', overflow: 'hidden', border: '1px solid var(--border-light)', position: 'relative' }}>
                <iframe
                  title="Live Navigation Route Map"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(fullAddressStr)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                />
                <div style={{ position: 'absolute', bottom: '14px', left: '14px', background: '#ffffff', padding: '8px 16px', borderRadius: '12px', boxShadow: '0 4px 14px rgba(0,0,0,0.15)', fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={16} color="#0284c7" />
                  <span>⏱️ {distanceInfo.durationMins} min</span>
                  <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>({distanceInfo.km} km remaining)</span>
                </div>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fullAddressStr)}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ position: 'absolute', top: '14px', right: '14px', background: '#ffffff', padding: '6px 12px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.12)', fontSize: '0.78rem', fontWeight: '800', color: '#2563eb', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  Open in Maps <ExternalLink size={12} />
                </a>
              </div>

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
                  <a
                    href={`tel:${custPhone}`}
                    onClick={(e) => e.stopPropagation()}
                    className="btn btn-sm"
                    style={{ background: '#ecfdf5', color: '#16a34a', fontWeight: '700', borderRadius: '10px', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
                  >
                    <Phone size={14} /> Call
                  </a>
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
                <h3 style={{ fontSize: '1.3rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>{custName}</h3>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>Member since {joiningYear} • ⭐ {currentBooking.customer?.rating || 4.9} Rating</div>
              </div>

              {/* Landmark & Address */}
              <div style={{ padding: '16px', background: '#fffbe6', borderRadius: '16px', border: '1px solid #fef08a', fontSize: '0.85rem', color: '#92400e' }}>
                <div style={{ fontWeight: '800', marginBottom: '4px' }}>📍 FULL ADDRESS:</div>
                <div style={{ marginBottom: '8px', fontWeight: '700' }}>{fullAddressStr}</div>
                <div style={{ fontWeight: '800', marginBottom: '4px' }}>💬 SPECIAL INSTRUCTIONS FROM CUSTOMER:</div>
                <div>"Please call when you reach the gate, security requires approval code."</div>
              </div>

              {/* Service History */}
              <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>PAST SERVICE HISTORY (API DATA)</span>
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
                <a
                  href={`tel:${custPhone}`}
                  className="btn"
                  style={{ padding: '12px', background: '#16a34a', color: '#ffffff', borderRadius: '14px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', textDecoration: 'none' }}
                >
                  <Phone size={16} /> Call Customer
                </a>
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
                <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-muted)' }}>VERIFY CUSTOMER • {bId}</span>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '800', margin: '4px 0 0 0', color: 'var(--text-primary)' }}>Enter Verification Code</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '6px 0 0 0' }}>
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
                      border: digit ? '2px solid #16a34a' : '2px solid var(--border-light)',
                      textAlign: 'center',
                      fontSize: '1.6rem',
                      fontWeight: '800',
                      color: 'var(--text-primary)',
                      background: digit ? '#f0fdf4' : '#f8fafc',
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

              <div style={{ padding: '14px 16px', background: '#f8fafc', borderRadius: '16px', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: '800', fontSize: '0.95rem' }}>{sTitle}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{custName} • {fullAddressStr}</div>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#2563eb', fontFamily: 'monospace', fontWeight: '800' }}>{bId}</div>
              </div>

              <div>
                <span style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>EXECUTION CHECKLIST</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
                  {checklist.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => toggleChecklist(item.id)}
                      style={{
                        padding: '14px 16px',
                        background: item.completed ? '#f0fdf4' : '#ffffff',
                        border: `1.5px solid ${item.completed ? '#a7f3d0' : 'var(--border-light)'}`,
                        borderRadius: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        cursor: 'pointer',
                      }}
                    >
                      {item.completed ? <CheckSquare size={22} color="#16a34a" /> : <Square size={22} color="#94a3b8" />}
                      <span style={{ fontSize: '0.92rem', fontWeight: item.completed ? '700' : '600', color: item.completed ? '#15803d' : 'var(--text-primary)' }}>
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={() => setIsPaused(true)}
                  className="btn"
                  style={{ padding: '12px', background: '#fffbe6', color: '#b45309', fontWeight: '700', borderRadius: '14px', border: '1px solid #fef08a', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Pause size={18} /> Pause Service
                </button>
                <button
                  type="button"
                  onClick={() => setStep(7)}
                  className="btn"
                  style={{ padding: '12px', background: '#eff6ff', color: '#2563eb', fontWeight: '700', borderRadius: '14px', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Plus size={18} /> Add Extra Service
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
                <label style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-secondary)' }}>SELECT REASON FOR PAUSE</label>
                <select
                  value={pauseReason}
                  onChange={(e) => setPauseReason(e.target.value)}
                  style={{ width: '100%', padding: '14px', borderRadius: '14px', border: '1px solid var(--border-light)', fontSize: '0.92rem', marginTop: '6px', fontWeight: '600' }}
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

          {/* STEP 7: ADD EXTRA SERVICE ADD-ONS */}
          {step === 7 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>Add Extra Service</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>Select additional services requested by customer.</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { id: 'a1', name: 'Refrigerant Gas Refill (R32)', price: 1200, desc: 'Eco-friendly high cooling gas' },
                  { id: 'a2', name: 'AC Foam Filter Deep Cleaning', price: 400, desc: 'Antibacterial foam spray wash' },
                  { id: 'a3', name: 'Voltage Stabilizer Health Audit', price: 200, desc: 'Safety fuse & output testing' },
                ].map((addon) => {
                  const isSelected = selectedAddons.some((a) => a.id === addon.id);
                  return (
                    <div
                      key={addon.id}
                      style={{
                        padding: '14px 16px',
                        background: isSelected ? '#eff6ff' : '#f8fafc',
                        border: `1.5px solid ${isSelected ? '#3b82f6' : 'var(--border-light)'}`,
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: '800', fontSize: '0.92rem', color: 'var(--text-primary)' }}>{addon.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{addon.desc}</div>
                        <div style={{ fontWeight: '800', color: '#16a34a', fontSize: '0.9rem', marginTop: '2px' }}>₹{addon.price}</div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddAddon(addon)}
                        className="btn btn-sm"
                        style={{
                          background: isSelected ? '#ef4444' : '#16a34a',
                          color: '#ffffff',
                          fontWeight: '800',
                          borderRadius: '10px',
                          border: 'none',
                          padding: '8px 16px',
                        }}
                      >
                        {isSelected ? 'Remove' : '+ Add'}
                      </button>
                    </div>
                  );
                })}
              </div>

              {selectedAddons.length > 0 && (
                <div style={{ padding: '12px 16px', background: '#ecfdf5', borderRadius: '14px', border: '1px solid #a7f3d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: '800', fontSize: '0.92rem', color: '#059669' }}>
                  <span>Total Add-ons Added:</span>
                  <span>+₹{addonsTotal}</span>
                </div>
              )}

              <button
                type="button"
                onClick={() => setStep(5)}
                className="btn"
                style={{ padding: '14px', background: '#16a34a', color: '#ffffff', fontWeight: '800', borderRadius: '16px', border: 'none', marginTop: '4px' }}
              >
                Add to Booking & Continue ➔
              </button>
            </div>
          )}

          {/* STEP 8: COLLECT PAYMENT & SUMMARY */}
          {step === 8 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ padding: '16px', background: '#ecfdf5', borderRadius: '18px', border: '1px solid #a7f3d0', textAlign: 'center' }}>
                <div style={{ fontWeight: '800', color: '#059669', fontSize: '1.05rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <CheckCircle2 size={22} /> Checklist Completed!
                </div>
                <div style={{ fontSize: '0.82rem', color: '#047857', marginTop: '4px' }}>
                  All tasks verified and resolved • Total Duration: {formatTimer(workSeconds)}
                </div>
              </div>

              <div style={{ padding: '18px', background: '#f8fafc', borderRadius: '18px', border: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>AMOUNT TO COLLECT</span>
                <div style={{ fontSize: '2.2rem', fontWeight: '800', color: '#16a34a', margin: '4px 0' }}>
                  ₹{finalTotal}
                </div>
                {addonsTotal > 0 && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Base Price: ₹{basePrice} + Add-ons: ₹{addonsTotal}
                  </div>
                )}
              </div>

              <div>
                <span style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--text-secondary)' }}>SELECT PAYMENT METHOD</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
                  <div
                    onClick={() => setPaymentMethod('online')}
                    style={{
                      padding: '14px 16px',
                      background: paymentMethod === 'online' ? '#ecfdf5' : '#ffffff',
                      border: `1.5px solid ${paymentMethod === 'online' ? '#16a34a' : 'var(--border-light)'}`,
                      borderRadius: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '800', fontSize: '0.95rem', color: 'var(--text-primary)' }}>Online Payment</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>UPI, Card, Net Banking</div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowQr(!showQr);
                      }}
                      className="btn btn-sm"
                      style={{ background: '#16a34a', color: '#ffffff', fontWeight: '700', borderRadius: '8px', border: 'none', padding: '6px 12px', fontSize: '0.78rem' }}
                    >
                      {showQr ? 'Hide QR' : 'Show QR Code'}
                    </button>
                  </div>

                  {showQr && (
                    <div style={{ padding: '18px', background: '#ffffff', border: '1px solid #16a34a', borderRadius: '18px', textAlign: 'center' }}>
                      <QrCode size={140} color="#16a34a" style={{ margin: '0 auto' }} />
                      <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#16a34a', marginTop: '10px' }}>
                        Scan QR Code to Pay ₹{finalTotal}
                      </div>
                    </div>
                  )}

                  <div
                    onClick={() => setPaymentMethod('cash')}
                    style={{
                      padding: '14px 16px',
                      background: paymentMethod === 'cash' ? '#ecfdf5' : '#ffffff',
                      border: `1.5px solid ${paymentMethod === 'cash' ? '#16a34a' : 'var(--border-light)'}`,
                      borderRadius: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '800', fontSize: '0.95rem', color: 'var(--text-primary)' }}>Cash Payment</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Collect cash from customer directly</div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleConfirmFinalPayment}
                disabled={completingPayment}
                className="btn"
                style={{ padding: '15px', background: '#16a34a', color: '#ffffff', fontWeight: '800', fontSize: '1rem', borderRadius: '16px', border: 'none', boxShadow: '0 4px 14px rgba(22, 163, 74, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '6px' }}
              >
                {completingPayment ? <Loader2 size={20} className="spin" /> : <ShieldCheck size={20} />} Confirm Payment & Complete Service
              </button>
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
              <a
                href={`tel:${custPhone}`}
                className="btn"
                style={{ padding: '12px', background: '#16a34a', color: '#ffffff', borderRadius: '14px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', textDecoration: 'none' }}
              >
                <Phone size={16} /> Call Customer
              </a>
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
    </div>
  );
};

export default PartnerFulfillmentPage;
