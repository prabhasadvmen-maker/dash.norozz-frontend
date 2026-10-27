import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, MapPin, Briefcase, FileText, ShieldCheck, CreditCard, Camera, UploadCloud,
  CheckCircle2, Printer, ArrowLeft, Loader2, Check, X
} from 'lucide-react';
import { partnerHiringService, errorMessage } from '../services/partnerHiring.service.js';
import { toast } from '../utils/toast.js';
import './PartnerHiringPage.css';

const REGISTRATION_FEE = 499;
const RESEND_SECONDS = 45;
const CHECKOUT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

const loadCheckout = () =>
  new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = CHECKOUT_SRC;
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error('Could not load the payment window. Check your connection.'));
    document.body.appendChild(script);
  });

const openCheckout = (payment, prefill) =>
  new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      key: payment.keyId,
      order_id: payment.orderId,
      amount: payment.amount,
      currency: payment.currency,
      name: 'NOROZZ',
      description: 'Partner Registration Fee',
      prefill,
      theme: { color: '#10b981' },
      handler: (r) => resolve({ paymentId: r.razorpay_payment_id, signature: r.razorpay_signature }),
      modal: { ondismiss: () => reject(new Error('Payment cancelled')) },
    });
    rzp.on('payment.failed', (r) => reject(new Error(r?.error?.description || 'Payment failed')));
    rzp.open();
  });

const emptyOtp = { sent: false, code: '', verified: false, busy: false, cooldown: 0 };

const SERVICE_CATEGORIES = ['Driver Care', 'Nanny Care', 'Baby Care', 'Personal Care'];
const WORK_TYPES = ['Full-time', 'Part-time', 'Live-in'];
const GENDERS = ['Male', 'Female', 'Other'];
const ID_TYPES = ['Aadhaar Card', 'PAN Card', 'Voter ID', 'Passport'];
const PAYMENT_METHODS = ['UPI', 'Debit / Credit Card', 'Net Banking', 'Wallet'];
const STATES = [
  'Andhra Pradesh', 'Bihar', 'Chhattisgarh', 'Delhi', 'Gujarat', 'Haryana', 'Himachal Pradesh',
  'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Punjab',
  'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

const SKILLS_BY_CATEGORY = {
  'Driver Care': ['Car Driving', 'Outstation Trips', 'Night Driving', 'Senior Citizen Care', 'Route Knowledge'],
  'Nanny Care': ['Child Care', 'Meal Preparation', 'Homework Help', 'First Aid', 'Elderly Support'],
  'Baby Care': ['Newborn Care', 'Infant Feeding', 'Baby Massage', 'Sleep Training', 'Hygiene & Bathing'],
  'Personal Care': ['Patient Care', 'Elderly Companion', 'Physiotherapy Assist', 'Bedside Care', 'Medication Reminders']
};

const SECTIONS = [
  { id: 'personal', label: 'Personal Details' },
  { id: 'address', label: 'Address Details' },
  { id: 'service', label: 'Service Details' },
  { id: 'documents', label: 'Documents' },
  { id: 'consent', label: 'Consent' },
  { id: 'payment', label: 'Payment' }
];

const initialForm = {
  fullName: '', mobile: '', email: '', dob: '', gender: '', photo: null,
  house: '', street: '', city: '', state: '', pin: '',
  sameAddress: true,
  permHouse: '', permStreet: '', permCity: '', permState: '', permPin: '',
  category: '', experience: '', skills: [], workType: '',
  idType: '', idProof: null, addressProof: null, drivingLicence: null,
  acceptTerms: false, acceptPrivacy: false, acceptRefund: false,
  paymentMethod: ''
};

const Field = ({ label, required, error, children, full }) => (
  <div className={`ph-field${full ? ' full' : ''}`}>
    <label className="ph-label">{label}{required && <i> *</i>}</label>
    {children}
    {error && <span className="ph-err">{error}</span>}
  </div>
);

const FileUpload = ({ label, required, file, onChange, error, hint = 'JPG, PNG or PDF · max 5 MB' }) => {
  const ref = useRef(null);
  return (
    <Field label={label} required={required} error={error}>
      <div className={`ph-upload${file ? ' has' : ''}${error ? ' err' : ''}`} onClick={() => ref.current?.click()}>
        {file ? <CheckCircle2 size={22} /> : <UploadCloud size={22} />}
        <div style={{ minWidth: 0 }}>
          <b>{file ? file.name : 'Click to upload'}</b>
          <small>{file ? `${(file.size / 1024).toFixed(0)} KB` : hint}</small>
        </div>
        {file && (
          <button
            type="button"
            className="x"
            aria-label="Remove file"
            onClick={(e) => { e.stopPropagation(); onChange(null); if (ref.current) ref.current.value = ''; }}
          >
            <X size={16} />
          </button>
        )}
        <input ref={ref} type="file" accept="image/*,.pdf" hidden onChange={(e) => onChange(e.target.files?.[0] || null)} />
      </div>
    </Field>
  );
};

const SectionCard = ({ id, icon: Icon, title, subtitle, children }) => (
  <section id={id} className="ph-card">
    <div className="ph-card-head">
      <div className="ph-card-icon"><Icon size={20} /></div>
      <div>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
    </div>
    {children}
  </section>
);

const OtpBox = ({ otp, valid, onSend, onChange, onVerify }) => {
  if (otp.verified) {
    return <span className="ph-verified"><CheckCircle2 size={14} /> Verified</span>;
  }
  return (
    <div className="ph-otp">
      {otp.sent && (
        <>
          <input
            className="ph-input"
            inputMode="numeric"
            maxLength={6}
            placeholder="Enter 6-digit OTP"
            value={otp.code}
            onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))}
          />
          <button type="button" className="ph-btn" disabled={otp.busy || otp.code.length !== 6} onClick={onVerify}>
            Verify
          </button>
        </>
      )}
      <button type="button" className="ph-btn" disabled={otp.busy || otp.cooldown > 0 || !valid} onClick={onSend}>
        {otp.busy && !otp.sent ? <Loader2 size={14} className="spin" /> : null}
        {otp.cooldown > 0 ? `Resend in ${otp.cooldown}s` : otp.sent ? 'Resend OTP' : 'Send OTP'}
      </button>
    </div>
  );
};

const StateSelect =({ value, onChange, error, field }) => (
  <select className={`ph-select${error ? ' err' : ''}`} value={value} onChange={onChange} data-field={field}>
    <option value="">Select state</option>
    {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
  </select>
);

const PartnerHiringPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [paymentStatus, setPaymentStatus] = useState('Pending');
  const [receipt, setReceipt] = useState(null);
  const [pendingApp, setPendingApp] = useState(null);
  const photoRef = useRef(null);

  const [otp, setOtp] = useState({ email: emptyOtp, mobile: emptyOtp });

  const patchOtp = (channel, patch) => setOtp((o) => ({ ...o, [channel]: { ...o[channel], ...patch } }));

  const set = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
    setPendingApp(null); // edited after a cancelled payment: create a fresh application on next submit
    // Editing a verified contact invalidates its OTP verification
    if (key === 'mobile' || key === 'email') setOtp((o) => ({ ...o, [key]: emptyOtp }));
  };

  useEffect(() => {
    if (otp.email.cooldown <= 0 && otp.mobile.cooldown <= 0) return undefined;
    const t = setInterval(() => {
      setOtp((o) => ({
        email: { ...o.email, cooldown: Math.max(0, o.email.cooldown - 1) },
        mobile: { ...o.mobile, cooldown: Math.max(0, o.mobile.cooldown - 1) }
      }));
    }, 1000);
    return () => clearInterval(t);
  }, [otp.email.cooldown > 0, otp.mobile.cooldown > 0]); // eslint-disable-line react-hooks/exhaustive-deps

  const validContact = {
    email: /^\S+@\S+\.\S+$/.test(form.email),
    mobile: /^[6-9]\d{9}$/.test(form.mobile)
  };

  const sendOtp = async (channel) => {
    patchOtp(channel, { busy: true });
    try {
      await partnerHiringService.sendOtp(channel, form[channel]);
      patchOtp(channel, { sent: true, code: '', busy: false, cooldown: RESEND_SECONDS });
      toast.success(`OTP sent to your ${channel === 'email' ? 'email' : 'mobile number'}`);
    } catch (err) {
      patchOtp(channel, { busy: false });
      toast.error(errorMessage(err));
    }
  };

  const verifyOtp = async (channel) => {
    patchOtp(channel, { busy: true });
    try {
      await partnerHiringService.verifyOtp(channel, form[channel], otp[channel].code);
      patchOtp(channel, { verified: true, busy: false });
      setErrors((e) => ({ ...e, [channel]: undefined }));
      toast.success(`${channel === 'email' ? 'Email' : 'Mobile number'} verified`);
    } catch (err) {
      patchOtp(channel, { busy: false });
      toast.error(errorMessage(err));
    }
  };

  const photoUrl = useMemo(() => (form.photo ? URL.createObjectURL(form.photo) : null), [form.photo]);
  const isDriver = form.category === 'Driver Care';

  const toggleSkill = (skill) =>
    set('skills', form.skills.includes(skill) ? form.skills.filter((s) => s !== skill) : [...form.skills, skill]);

  const pickCategory = (cat) => {
    setForm((f) => ({ ...f, category: cat, skills: [], drivingLicence: cat === 'Driver Care' ? f.drivingLicence : null }));
    setErrors((e) => ({ ...e, category: undefined, skills: undefined, drivingLicence: undefined }));
  };

  const completion = {
    personal: !!(form.fullName && otp.mobile.verified && otp.email.verified && form.dob && form.gender && form.photo),
    address: !!(form.house && form.street && form.city && form.state && form.pin &&
      (form.sameAddress || (form.permHouse && form.permStreet && form.permCity && form.permState && form.permPin))),
    service: !!(form.category && form.experience !== '' && form.skills.length && form.workType),
    documents: !!(form.idType && form.idProof && form.addressProof && (!isDriver || form.drivingLicence)),
    consent: form.acceptTerms && form.acceptPrivacy && form.acceptRefund,
    payment: paymentStatus === 'Paid'
  };
  const doneCount = Object.values(completion).filter(Boolean).length;

  const validate = () => {
    const e = {};
    const req = (k, msg = 'Required') => {
      if (!form[k] || (typeof form[k] === 'string' && !form[k].trim())) e[k] = msg;
    };
    req('fullName', 'Full name is required');
    if (!validContact.mobile) e.mobile = 'Enter a valid 10-digit mobile number';
    else if (!otp.mobile.verified) e.mobile = 'Verify your mobile number with OTP';
    if (!validContact.email) e.email = 'Enter a valid email address';
    else if (!otp.email.verified) e.email = 'Verify your email address with OTP';
    req('dob', 'Date of birth is required');
    if (form.dob) {
      const age = (Date.now() - new Date(form.dob).getTime()) / (365.25 * 24 * 3600 * 1000);
      if (age < 18) e.dob = 'You must be at least 18 years old';
    }
    req('gender', 'Select gender');
    req('photo', 'Profile photo is required');
    req('house'); req('street'); req('city'); req('state', 'Select state');
    if (!/^\d{6}$/.test(form.pin)) e.pin = 'Enter a valid 6-digit PIN code';
    if (!form.sameAddress) {
      req('permHouse'); req('permStreet'); req('permCity'); req('permState', 'Select state');
      if (!/^\d{6}$/.test(form.permPin)) e.permPin = 'Enter a valid 6-digit PIN code';
    }
    req('category', 'Select a service category');
    if (form.experience === '' || Number(form.experience) < 0) e.experience = 'Enter your work experience';
    if (!form.skills.length) e.skills = 'Select at least one skill';
    req('workType', 'Select preferred work type');
    req('idType', 'Select identity proof type');
    req('idProof', 'Upload identity proof');
    req('addressProof', 'Upload address proof');
    if (isDriver) req('drivingLicence', 'Upload driving licence');
    if (!form.acceptTerms) e.acceptTerms = true;
    if (!form.acceptPrivacy) e.acceptPrivacy = true;
    if (!form.acceptRefund) e.acceptRefund = true;
    req('paymentMethod', 'Select a payment method');
    return e;
  };

  const buildFormData = () => {
    const fd = new FormData();
    const text = {
      fullName: form.fullName.trim(), mobile: form.mobile, email: form.email.trim(), dob: form.dob,
      gender: form.gender, serviceCategory: form.category, experienceYears: form.experience,
      preferredWorkType: form.workType, identityProofType: form.idType, paymentMethod: form.paymentMethod,
      permanentSameAsCurrent: form.sameAddress, acceptTerms: form.acceptTerms,
      acceptPrivacy: form.acceptPrivacy, acceptRefund: form.acceptRefund,
      skills: JSON.stringify(form.skills),
      currentAddress: JSON.stringify({ house: form.house, street: form.street, city: form.city, state: form.state, pin: form.pin }),
      permanentAddress: JSON.stringify(form.sameAddress
        ? {}
        : { house: form.permHouse, street: form.permStreet, city: form.permCity, state: form.permState, pin: form.permPin })
    };
    Object.entries(text).forEach(([k, v]) => fd.append(k, v));
    fd.append('profilePhoto', form.photo);
    fd.append('identityProof', form.idProof);
    fd.append('addressProof', form.addressProof);
    if (isDriver) fd.append('drivingLicence', form.drivingLicence);
    return fd;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (paymentStatus === 'Processing') return;
    const e = validate();
    setErrors(e);
    const firstKey = Object.keys(e)[0];
    if (firstKey) {
      document.querySelector(`[data-field="${firstKey}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setPaymentStatus('Processing');
    try {
      // Re-use the pending application if the payment was cancelled earlier
      let app = pendingApp;
      if (!app) {
        app = await partnerHiringService.submitApplication(buildFormData());
        setPendingApp(app);
      }
      const { payment } = app;

      let proof = { paymentId: '', signature: '' };
      if (payment.mode !== 'simulated') {
        await loadCheckout();
        proof = await openCheckout(payment, { name: form.fullName, email: form.email, contact: form.mobile });
      }
      const result = await partnerHiringService.verifyPayment(app.applicationId, { orderId: payment.orderId, ...proof });
      setPaymentStatus('Paid');
      setReceipt(result);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setPaymentStatus('Pending');
      toast.error(errorMessage(err));
    }
  };

  const inp = (key, props = {}) => ({
    className: `ph-input${errors[key] ? ' err' : ''}`,
    value: form[key],
    onChange: (e) => set(key, e.target.value),
    'data-field': key,
    ...props
  });

  const digitsOnly = (key) => (e) => set(key, e.target.value.replace(/\D/g, ''));

  const Topbar = (
    <div className="ph-topbar">
      <div className="ph-brand" onClick={() => navigate('/')}>
        <img src="/logo.png" alt="Norozz" />
        <b>NOROZZ <span className="gradient-text">Partner</span></b>
      </div>
      <button type="button" className="ph-back" onClick={() => navigate('/partner/login')}>
        <ArrowLeft size={15} /> Partner Login
      </button>
    </div>
  );

  if (receipt) {
    const rows = [
      ['Receipt No.', receipt.receiptNumber],
      ['Date', new Date(receipt.paidAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })],
      ['Name', receipt.name],
      ['Mobile', `+91 ${receipt.mobile}`],
      ['Email', receipt.email],
      ['Service Category', receipt.serviceCategory],
      ['Payment Method', receipt.paymentMethod || 'Online'],
      ['Payment Status', receipt.paymentStatus],
      ['Registration Fee', `₹${receipt.amount}`]
    ];
    return (
      <div className="ph-page bg-mesh-dark">
        {Topbar}
        <div className="ph-layout single">
          <div className="ph-card ph-receipt">
            <div className="ph-success">
              <div className="ic"><Check size={32} /></div>
              <h2>Registration Successful</h2>
              <p>Your application is submitted. Our team will verify your documents and contact you shortly.</p>
            </div>
            {rows.map(([k, v]) => (
              <div className="ph-receipt-row" key={k}><span>{k}</span><span>{v}</span></div>
            ))}
            <div className="ph-noprint ph-actions">
              <button type="button" className="ph-btn" onClick={() => window.print()}>
                <Printer size={16} /> Download / Print Receipt
              </button>
              <button type="button" className="ph-btn" onClick={() => navigate('/partner/login')}>Go to Partner Login</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ph-page bg-mesh-dark">
      {Topbar}

      <div className="ph-hero">
        <span className="ph-chip"><ShieldCheck size={14} /> PARTNER HIRING</span>
        <h1>Join Norozz as a <span className="gradient-text">Service Partner</span></h1>
        <p>Complete the registration form below. Verified partners get access to trusted bookings across Driver, Nanny, Baby and Personal Care.</p>
      </div>

      <div className="ph-layout">
        <aside className="ph-steps">
          <div className="ph-progress">
            <span>{doneCount} of {SECTIONS.length} sections complete</span>
            <div className="ph-progress-bar"><div style={{ width: `${(doneCount / SECTIONS.length) * 100}%` }} /></div>
          </div>
          {SECTIONS.map((s, i) => (
            <button
              key={s.id}
              type="button"
              className={`ph-step${completion[s.id] ? ' done' : ''}`}
              onClick={() => document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth' })}
            >
              <span className="ph-step-dot">{completion[s.id] ? <Check size={14} /> : i + 1}</span>
              {s.label}
            </button>
          ))}
        </aside>

        <form className="ph-form" onSubmit={handleSubmit} noValidate>
          {/* 1. PERSONAL */}
          <SectionCard id="personal" icon={User} title="Personal Details" subtitle="Tell us about yourself">
            <div className="ph-grid">
              <Field label="Full Name" required error={errors.fullName}>
                <input {...inp('fullName', { type: 'text', placeholder: 'As per your ID proof' })} />
              </Field>
              <Field label="Mobile Number" required error={errors.mobile}>
                <div className="ph-prefix">
                  <span>+91</span>
                  <input {...inp('mobile', { type: 'tel', inputMode: 'numeric', maxLength: 10, placeholder: '98765 43210', onChange: digitsOnly('mobile') })} />
                </div>
                <OtpBox otp={otp.mobile} valid={validContact.mobile} onSend={() => sendOtp('mobile')}
                  onChange={(code) => patchOtp('mobile', { code })} onVerify={() => verifyOtp('mobile')} />
              </Field>
              <Field label="Email Address" required error={errors.email}>
                <input {...inp('email', { type: 'email', placeholder: 'you@example.com' })} />
                <OtpBox otp={otp.email} valid={validContact.email} onSend={() => sendOtp('email')}
                  onChange={(code) => patchOtp('email', { code })} onVerify={() => verifyOtp('email')} />
              </Field>
              <Field label="Date of Birth" required error={errors.dob}>
                <input {...inp('dob', { type: 'date', max: new Date().toISOString().split('T')[0] })} />
              </Field>
              <Field label="Gender" required error={errors.gender}>
                <select className={`ph-select${errors.gender ? ' err' : ''}`} value={form.gender} onChange={(e) => set('gender', e.target.value)} data-field="gender">
                  <option value="">Select gender</option>
                  {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </Field>
              <Field label="Profile Photo" required error={errors.photo}>
                <div className="ph-photo" data-field="photo">
                  <div className="ph-avatar">{photoUrl ? <img src={photoUrl} alt="Profile preview" /> : <Camera size={26} />}</div>
                  <div>
                    <button type="button" className="ph-btn" onClick={() => photoRef.current?.click()}>
                      <UploadCloud size={16} /> {form.photo ? 'Change Photo' : 'Upload Photo'}
                    </button>
                    <div className="ph-hint">Clear face photo · JPG or PNG</div>
                    <input ref={photoRef} type="file" accept="image/*" hidden onChange={(e) => set('photo', e.target.files?.[0] || null)} />
                  </div>
                </div>
              </Field>
            </div>
          </SectionCard>

          {/* 2. ADDRESS */}
          <SectionCard id="address" icon={MapPin} title="Address Details" subtitle="Your current residential address">
            <div className="ph-grid">
              <Field label="House / Flat Number" required error={errors.house}>
                <input {...inp('house', { type: 'text', placeholder: 'e.g. B-204' })} />
              </Field>
              <Field label="Street / Locality" required error={errors.street}>
                <input {...inp('street', { type: 'text', placeholder: 'Street, area, landmark' })} />
              </Field>
              <Field label="City / District" required error={errors.city}>
                <input {...inp('city', { type: 'text', placeholder: 'e.g. Gurugram' })} />
              </Field>
              <Field label="State" required error={errors.state}>
                <StateSelect value={form.state} onChange={(e) => set('state', e.target.value)} error={errors.state} field="state" />
              </Field>
              <Field label="PIN Code" required error={errors.pin}>
                <input {...inp('pin', { type: 'text', inputMode: 'numeric', maxLength: 6, placeholder: '6-digit PIN', onChange: digitsOnly('pin') })} />
              </Field>
              <div className="ph-field ph-end">
                <label className="ph-check">
                  <input type="checkbox" checked={form.sameAddress} onChange={(e) => set('sameAddress', e.target.checked)} />
                  Permanent address same as current address
                </label>
              </div>

              {!form.sameAddress && (
                <>
                  <div className="full ph-subhead">Permanent Address</div>
                  <Field label="House / Flat Number" required error={errors.permHouse}>
                    <input {...inp('permHouse', { type: 'text' })} />
                  </Field>
                  <Field label="Street / Locality" required error={errors.permStreet}>
                    <input {...inp('permStreet', { type: 'text' })} />
                  </Field>
                  <Field label="City / District" required error={errors.permCity}>
                    <input {...inp('permCity', { type: 'text' })} />
                  </Field>
                  <Field label="State" required error={errors.permState}>
                    <StateSelect value={form.permState} onChange={(e) => set('permState', e.target.value)} error={errors.permState} field="permState" />
                  </Field>
                  <Field label="PIN Code" required error={errors.permPin}>
                    <input {...inp('permPin', { type: 'text', inputMode: 'numeric', maxLength: 6, onChange: digitsOnly('permPin') })} />
                  </Field>
                </>
              )}
            </div>
          </SectionCard>

          {/* 3. SERVICE */}
          <SectionCard id="service" icon={Briefcase} title="Service Details" subtitle="What kind of work do you do?">
            <div className="ph-stack">
              <Field label="Service Category" required error={errors.category}>
                <div className="ph-cats" data-field="category">
                  {SERVICE_CATEGORIES.map((c) => (
                    <button key={c} type="button" className={`ph-cat${form.category === c ? ' on' : ''}`} onClick={() => pickCategory(c)}>{c}</button>
                  ))}
                </div>
              </Field>
              <div className="ph-grid">
                <Field label="Work Experience (years)" required error={errors.experience}>
                  <input {...inp('experience', { type: 'number', min: 0, max: 50, placeholder: 'e.g. 3' })} />
                </Field>
                <Field label="Preferred Work Type" required error={errors.workType}>
                  <div className="ph-pills" data-field="workType">
                    {WORK_TYPES.map((w) => (
                      <button key={w} type="button" className={`ph-pill${form.workType === w ? ' on' : ''}`} onClick={() => set('workType', w)}>{w}</button>
                    ))}
                  </div>
                </Field>
              </div>
              <Field label="Skills / Specialization" required error={errors.skills}>
                {form.category ? (
                  <div className="ph-pills" data-field="skills">
                    {SKILLS_BY_CATEGORY[form.category].map((s) => (
                      <button key={s} type="button" className={`ph-pill${form.skills.includes(s) ? ' on' : ''}`} onClick={() => toggleSkill(s)}>
                        {form.skills.includes(s) && <Check size={14} />} {s}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="ph-hint" data-field="skills">Select a service category to see skills.</div>
                )}
              </Field>
            </div>
          </SectionCard>

          {/* 4. DOCUMENTS */}
          <SectionCard id="documents" icon={FileText} title="Documents" subtitle="Upload clear, readable copies for verification">
            <div className="ph-grid">
              <Field label="Identity Proof Type" required error={errors.idType}>
                <select className={`ph-select${errors.idType ? ' err' : ''}`} value={form.idType} onChange={(e) => set('idType', e.target.value)} data-field="idType">
                  <option value="">Select ID type</option>
                  {ID_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
              <div data-field="idProof">
                <FileUpload label="Identity Proof Upload" required file={form.idProof} error={errors.idProof} onChange={(f) => set('idProof', f)} />
              </div>
              <div data-field="addressProof">
                <FileUpload label="Address Proof Upload" required file={form.addressProof} error={errors.addressProof} onChange={(f) => set('addressProof', f)} />
              </div>
              {isDriver && (
                <div data-field="drivingLicence">
                  <FileUpload label="Driving Licence Upload" required file={form.drivingLicence} error={errors.drivingLicence} onChange={(f) => set('drivingLicence', f)} hint="Front & back · JPG, PNG or PDF" />
                </div>
              )}
            </div>
          </SectionCard>

          {/* 5. CONSENT */}
          <SectionCard id="consent" icon={ShieldCheck} title="Consent" subtitle="Please read and accept to continue">
            <div className="ph-stack">
              <label className={`ph-check${errors.acceptTerms ? ' err' : ''}`} data-field="acceptTerms">
                <input type="checkbox" checked={form.acceptTerms} onChange={(e) => set('acceptTerms', e.target.checked)} />
                <span>I have read and agree to the <a href="/terms" target="_blank" rel="noreferrer">Terms &amp; Conditions</a>.</span>
              </label>
              <label className={`ph-check${errors.acceptPrivacy ? ' err' : ''}`} data-field="acceptPrivacy">
                <input type="checkbox" checked={form.acceptPrivacy} onChange={(e) => set('acceptPrivacy', e.target.checked)} />
                <span>I have read and accept the <a href="/privacy" target="_blank" rel="noreferrer">Privacy Policy</a>.</span>
              </label>
              <label className={`ph-check${errors.acceptRefund ? ' err' : ''}`} data-field="acceptRefund">
                <input type="checkbox" checked={form.acceptRefund} onChange={(e) => set('acceptRefund', e.target.checked)} />
                <span>I accept the <a href="/refund-policy" target="_blank" rel="noreferrer">Registration Fee &amp; Refund Policy</a>.</span>
              </label>
            </div>
          </SectionCard>

          {/* 6. PAYMENT */}
          <SectionCard id="payment" icon={CreditCard} title="Payment" subtitle="One-time registration fee">
            <div className="ph-fee">
              <div><small>Registration Fee</small><b>₹{REGISTRATION_FEE}</b></div>
              <span className={`ph-status ${paymentStatus.toLowerCase()}`}>
                {paymentStatus === 'Processing' && <Loader2 size={13} className="spin" />}
                {paymentStatus}
              </span>
            </div>
            <Field label="Payment Method" required error={errors.paymentMethod}>
              <div className="ph-pills" data-field="paymentMethod">
                {PAYMENT_METHODS.map((m) => (
                  <button key={m} type="button" className={`ph-pill${form.paymentMethod === m ? ' on' : ''}`} onClick={() => set('paymentMethod', m)}>{m}</button>
                ))}
              </div>
            </Field>
            <div className="ph-hint ph-note">Your payment receipt will be generated after a successful payment.</div>
            <button type="submit" className="ph-submit" disabled={paymentStatus === 'Processing'}>
              {paymentStatus === 'Processing'
                ? <><Loader2 size={18} className="spin" /> Processing Payment...</>
                : <>Pay ₹{REGISTRATION_FEE} &amp; Submit Registration</>}
            </button>
          </SectionCard>
        </form>
      </div>
    </div>
  );
};

export default PartnerHiringPage;
