import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  MapPin,
  Calendar,
  Clock,
  CreditCard,
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2
} from 'lucide-react';
import { useBookings } from '../../hooks/useBookings.js';
import { useCustomer } from '../../hooks/useCustomer.js';

const BookingModal = ({ isOpen, onClose, initialService, onBookingConfirmed }) => {
  const { createBooking } = useBookings();
  const { addresses } = useCustomer();
  const [step, setStep] = useState(1); // Steps 1 to 7

  // Form Selections
  const [selectedCategory, setSelectedCategory] = useState(initialService?.category || 'AC & Appliance Repair');
  const [selectedPackage, setSelectedPackage] = useState(initialService?.title || 'AC Foam Jet Deep Cleaning');
  const [packagePrice, setPackagePrice] = useState(initialService?.price || '₹599');
  const [selectedAddress, setSelectedAddress] = useState(addresses[0]?.street || 'Sector C, Pocket 2, Vasant Kunj, Delhi NCR');
  const [selectedDate, setSelectedDate] = useState('2026-07-28');
  const [selectedTime, setSelectedTime] = useState('04:30 PM');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [loading, setLoading] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);

  if (!isOpen) return null;

  const categories = [
    'AC & Appliance Repair',
    'Home Deep Cleaning',
    'Salon for Women',
    'Plumbing & Leakage'
  ];

  const packages = [
    { title: 'AC Foam Jet Deep Cleaning', price: '₹599', duration: '45 mins' },
    { title: 'AC Gas Top Up & Leak Check', price: '₹1,299', duration: '60 mins' },
    { title: 'Full Home Deep Cleaning 3BHK', price: '₹4,499', duration: '4 hrs' },
    { title: 'Bathroom Tap Repair', price: '₹299', duration: '30 mins' }
  ];

  const addressList = addresses.length > 0 
    ? addresses.map(a => `${a.street}, ${a.city}`)
    : [
        'Sector C, Pocket 2, Vasant Kunj, Delhi NCR',
        'Tower B, DLF Cyber City, Gurugram',
        'D-14, South Extension Part 2, New Delhi'
      ];

  const dates = [
    '2026-07-28',
    '2026-07-29',
    '2026-07-30'
  ];

  const timeSlots = [
    '09:00 AM',
    '12:00 PM',
    '04:30 PM',
    '06:30 PM'
  ];

  const paymentMethods = [
    'UPI',
    'Credit Card',
    'Wallet',
    'Cash After Service'
  ];

  const handleNextStep = async () => {
    if (step < 6) {
      setStep(step + 1);
    } else if (step === 6) {
      // Process Payment & Complete Booking via live backend API
      setLoading(true);
      try {
        const rawPrice = Number(packagePrice.replace(/[^0-9]/g, '')) || 599;
        const res = await createBooking({
          categoryName: selectedCategory,
          serviceName: selectedPackage,
          packageTitle: selectedPackage,
          finalPrice: rawPrice,
          address: {
            street: selectedAddress,
            city: 'Delhi NCR',
            state: 'Delhi',
            zipCode: '110070',
          },
          bookingDate: selectedDate,
          bookingTimeSlot: selectedTime,
          paymentMethod,
        });

        const orderData = res.data || {
          bookingNumber: 'BK-10029',
          serviceName: selectedPackage,
          finalPrice: rawPrice,
        };

        setCreatedOrder(orderData);
        setStep(7); // Booking Confirmation
        if (onBookingConfirmed) onBookingConfirmed(orderData);
      } catch (err) {
        // Handled by global interceptor / toast
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '28px', maxWidth: '540px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#2563eb', letterSpacing: '0.6px' }}>
              STEP {step} OF 7
            </span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: '2px 0 0 0' }}>
              {step === 1 && '1. Choose Service Category'}
              {step === 2 && '2. Select Service Package'}
              {step === 3 && '3. Select Service Address'}
              {step === 4 && '4. Schedule Service Date'}
              {step === 5 && '5. Schedule Time Slot'}
              {step === 6 && '6. Choose Payment Method'}
              {step === 7 && '7. Booking Confirmed! 🎉'}
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Step Indicator Bar */}
        {step < 7 && (
          <div style={{ display: 'flex', gap: '4px', marginBottom: '22px' }}>
            {[1, 2, 3, 4, 5, 6, 7].map((s) => (
              <div
                key={s}
                style={{
                  flex: 1,
                  height: '4px',
                  borderRadius: '9999px',
                  background: step >= s ? '#2563eb' : '#e2e8f0',
                  transition: 'background 0.3s ease'
                }}
              />
            ))}
          </div>
        )}

        {/* STEP 1: CHOOSE SERVICE */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {categories.map((cat, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: `2px solid ${selectedCategory === cat ? '#2563eb' : 'var(--border-light)'}`,
                  background: selectedCategory === cat ? '#eff6ff' : '#ffffff',
                  fontWeight: '700',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span>{cat}</span>
                {selectedCategory === cat && <Check size={18} color="#2563eb" />}
              </div>
            ))}
          </div>
        )}

        {/* STEP 2: SELECT PACKAGE */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {packages.map((pkg, idx) => (
              <div
                key={idx}
                onClick={() => { setSelectedPackage(pkg.title); setPackagePrice(pkg.price); }}
                style={{
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: `2px solid ${selectedPackage === pkg.title ? '#2563eb' : 'var(--border-light)'}`,
                  background: selectedPackage === pkg.title ? '#eff6ff' : '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontWeight: '800', fontSize: '0.92rem' }}>{pkg.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{pkg.duration} • 30-Day Guarantee</div>
                </div>
                <div style={{ fontWeight: '800', fontSize: '1rem', color: '#10b981' }}>{pkg.price}</div>
              </div>
            ))}
          </div>
        )}

        {/* STEP 3: SELECT ADDRESS */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {addressList.map((addr, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedAddress(addr)}
                style={{
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: `2px solid ${selectedAddress === addr ? '#2563eb' : 'var(--border-light)'}`,
                  background: selectedAddress === addr ? '#eff6ff' : '#ffffff',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <MapPin size={18} color="#2563eb" style={{ flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{addr}</span>
                {selectedAddress === addr && <Check size={18} color="#2563eb" />}
              </div>
            ))}
          </div>
        )}

        {/* STEP 4: SCHEDULE DATE */}
        {step === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {dates.map((d, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedDate(d)}
                style={{
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: `2px solid ${selectedDate === d ? '#2563eb' : 'var(--border-light)'}`,
                  background: selectedDate === d ? '#eff6ff' : '#ffffff',
                  fontSize: '0.88rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <Calendar size={18} color="#7c3aed" />
                <span style={{ flex: 1 }}>{d}</span>
                {selectedDate === d && <Check size={18} color="#2563eb" />}
              </div>
            ))}
          </div>
        )}

        {/* STEP 5: SCHEDULE TIME */}
        {step === 5 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {timeSlots.map((t, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedTime(t)}
                style={{
                  padding: '14px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: `2px solid ${selectedTime === t ? '#2563eb' : 'var(--border-light)'}`,
                  background: selectedTime === t ? '#eff6ff' : '#ffffff',
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  textAlign: 'center',
                  cursor: 'pointer'
                }}
              >
                <Clock size={16} color="#2563eb" style={{ marginBottom: '4px' }} />
                <div>{t}</div>
              </div>
            ))}
          </div>
        )}

        {/* STEP 6: PAYMENT METHOD */}
        {step === 6 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ padding: '14px', background: '#f8fafc', borderRadius: 'var(--radius-md)', marginBottom: '10px', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>Package Amount:</span>
                <span style={{ fontWeight: '800' }}>{packagePrice}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981', fontWeight: '700' }}>
                <span>Taxes & Safety Fee:</span>
                <span>FREE (NOROZZ PLUS)</span>
              </div>
            </div>

            {paymentMethods.map((pm, idx) => (
              <div
                key={idx}
                onClick={() => setPaymentMethod(pm)}
                style={{
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: `2px solid ${paymentMethod === pm ? '#2563eb' : 'var(--border-light)'}`,
                  background: paymentMethod === pm ? '#eff6ff' : '#ffffff',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <CreditCard size={18} color="#2563eb" />
                <span style={{ flex: 1 }}>{pm}</span>
                {paymentMethod === pm && <Check size={18} color="#2563eb" />}
              </div>
            ))}
          </div>
        )}

        {/* STEP 7: BOOKING CONFIRMATION */}
        {step === 7 && createdOrder && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              background: '#ecfdf5',
              color: '#10b981',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              border: '2px solid #a7f3d0'
            }}>
              <CheckCircle2 size={40} />
            </div>

            <h3 style={{ fontSize: '1.35rem', fontWeight: '800', marginBottom: '4px' }}>
              Booking Confirmed! 🎉
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Booking Ref: <strong>{createdOrder.bookingNumber || createdOrder._id}</strong>
            </p>

            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: 'var(--radius-md)', textAlign: 'left', fontSize: '0.82rem', marginBottom: '24px' }}>
              <div><strong>Service:</strong> {createdOrder.serviceName || selectedPackage}</div>
              <div><strong>Date & Time:</strong> {createdOrder.bookingDate || selectedDate} at {createdOrder.bookingTimeSlot || selectedTime}</div>
              <div><strong>Address:</strong> {selectedAddress}</div>
              <div><strong>Amount Paid:</strong> <span style={{ color: '#10b981', fontWeight: '800' }}>₹{createdOrder.finalPrice || packagePrice}</span></div>
            </div>

            <button className="btn btn-primary" onClick={onClose} style={{ width: '100%', padding: '12px' }}>
              View in My Bookings
            </button>
          </div>
        )}

        {/* Next / Back Controls */}
        {step < 7 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
            {step > 1 ? (
              <button className="btn btn-secondary" onClick={() => setStep(step - 1)}>
                <ArrowLeft size={16} /> Back
              </button>
            ) : <div />}

            <button className="btn btn-primary" disabled={loading} onClick={handleNextStep}>
              {loading ? <Loader2 size={16} className="spin" /> : step === 6 ? 'Pay & Confirm Order' : <>Next Step <ArrowRight size={16} /></>}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default BookingModal;
