import {
  User,
  Briefcase,
  MapPin,
  CheckCircle2,
  Landmark,
  FileText,
  Gift,
  ChevronRight,
  Pencil,
  Phone,
  Mail,
  CalendarDays,
  Star,
  Clock3,
} from 'lucide-react';
import { formatAddress } from '../../utils/formatAddress.js';

const DOC_KEYS = ['aadhaarFront', 'aadhaarBack', 'panDoc', 'drivingLicenseDoc', 'bankPassbookDoc', 'passportPhoto'];

const card = { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 1px 3px rgba(15,23,42,0.04)' };

const formatDate = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const hasValue = (v) => v !== undefined && v !== null && String(v).trim() !== '';

const Row = ({ icon: Icon, label, value, last }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', padding: '12px 0', borderBottom: last ? 'none' : '1px solid #f1f5f9' }}>
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.85rem', fontWeight: '600', flexShrink: 0 }}>
      {Icon && <Icon size={15} color="#94a3b8" />} {label}
    </span>
    {hasValue(value) ? (
      <span style={{ color: '#0f172a', fontSize: '0.88rem', fontWeight: '700', textAlign: 'right', wordBreak: 'break-word' }}>{value}</span>
    ) : (
      <span style={{ color: '#94a3b8', fontSize: '0.84rem', fontWeight: '600', fontStyle: 'italic' }}>Not provided</span>
    )}
  </div>
);

const CardHeader = ({ icon: Icon, tint, color, title, action }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
    <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
      <span style={{ width: '34px', height: '34px', borderRadius: '10px', background: tint, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={17} color={color} />
      </span>
      {title}
    </h3>
    {action}
  </div>
);

const Chip = ({ children, bg, fg, border }) => (
  <span style={{ background: bg, color: fg, border: `1px solid ${border}`, padding: '4px 12px', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
    {children}
  </span>
);

const ShortcutTile = ({ icon: Icon, tint, color, title, subtitle, warn, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    style={{ ...card, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '14px', textAlign: 'left', cursor: 'pointer', width: '100%', borderColor: warn ? '#fde68a' : '#e2e8f0', background: warn ? '#fffbeb' : '#ffffff' }}
  >
    <span style={{ width: '42px', height: '42px', borderRadius: '12px', background: tint, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={20} color={color} />
    </span>
    <span style={{ flex: 1, minWidth: 0 }}>
      <span style={{ display: 'block', fontWeight: '800', fontSize: '0.92rem', color: '#0f172a' }}>{title}</span>
      <span style={{ display: 'block', fontSize: '0.8rem', color: warn ? '#b45309' : '#64748b', fontWeight: '600', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{subtitle}</span>
    </span>
    <ChevronRight size={18} color="#94a3b8" />
  </button>
);

const PartnerProfileOverview = ({
  user,
  categoryNames = [],
  offeredServices = [],
  cityName = '',
  referralCode = '',
  referralBonus = null,
  onSwitchTab,
}) => {
  const bank = user.bankDetails || {};
  const hasBank = Boolean(bank.accountNumber || bank.upiId);
  const docs = user.documents || {};
  const uploadedDocs = DOC_KEYS.filter((k) => hasValue(typeof docs[k] === 'object' ? docs[k]?.url : docs[k]) || (k === 'aadhaarFront' && hasValue(docs.aadhaarDoc))).length;
  const kycApproved = user.kycStatus === 'approved';
  const localities = Array.isArray(user.localities) ? user.localities.filter(Boolean) : [];

  // Profile completeness: every item is a real field the partner can fill in
  const checklist = [
    { label: 'Profile photo', done: hasValue(user.profileImage), tab: 'edit' },
    { label: 'Email address', done: hasValue(user.email), tab: 'edit' },
    { label: 'Date of birth', done: hasValue(user.dob), tab: 'edit' },
    { label: 'Gender', done: hasValue(user.gender), tab: 'edit' },
    { label: 'Work experience', done: hasValue(user.experience), tab: 'edit' },
    { label: 'Address', done: hasValue(formatAddress(user.address)), tab: 'edit' },
    { label: 'Service localities', done: localities.length > 0, tab: 'edit' },
    { label: 'Bank / UPI details', done: hasBank, tab: 'bank' },
    { label: 'KYC documents', done: uploadedDocs >= 4 || kycApproved, tab: 'documents' },
  ];
  const doneCount = checklist.filter((c) => c.done).length;
  const percent = Math.round((doneCount / checklist.length) * 100);
  const missing = checklist.filter((c) => !c.done);

  const bankSubtitle = bank.accountNumber
    ? `${bank.bankName || 'Bank account'} •••• ${String(bank.accountNumber).slice(-4)}`
    : bank.upiId
      ? `UPI: ${bank.upiId}`
      : 'Not added yet — needed for payouts';

  const kycSubtitle = kycApproved
    ? `Verified${uploadedDocs ? ` • ${uploadedDocs} documents on file` : ''}`
    : user.kycStatus === 'rejected'
      ? 'Rejected — re-upload your documents'
      : uploadedDocs
        ? `Under review • ${uploadedDocs} of ${DOC_KEYS.length} uploaded`
        : 'Upload your Aadhaar, PAN and bank proof';

  const rating = Number(user.averageRating);
  const hasRating = Number.isFinite(rating) && rating > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Profile completeness */}
      {percent < 100 && (
        <div style={{ ...card, padding: '20px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '10px' }}>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a' }}>Complete your profile</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '500', marginTop: '2px' }}>
                {doneCount} of {checklist.length} steps done. A complete profile builds customer trust.
              </div>
            </div>
            <span style={{ fontSize: '1.4rem', fontWeight: '800', color: percent >= 70 ? '#059669' : '#d97706' }}>{percent}%</span>
          </div>
          <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${percent}%`, background: percent >= 70 ? '#059669' : '#f59e0b', borderRadius: '4px', transition: 'width 0.4s ease' }} />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '14px' }}>
            {missing.map((m) => (
              <button
                key={m.label}
                type="button"
                onClick={() => onSwitchTab?.(m.tab)}
                style={{ padding: '5px 12px', borderRadius: '9999px', border: '1px dashed #cbd5e1', background: '#f8fafc', color: '#334155', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer' }}
              >
                + {m.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* At-a-glance stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        {[
          { icon: kycApproved ? CheckCircle2 : Clock3, label: 'KYC Status', value: kycApproved ? 'Approved' : (user.kycStatus || 'Pending').replace(/^./, (c) => c.toUpperCase()), color: kycApproved ? '#059669' : '#d97706' },
          { icon: Star, label: 'Customer Rating', value: hasRating ? `${rating.toFixed(1)} / 5` : 'No ratings yet', color: hasRating ? '#d97706' : '#94a3b8' },
          { icon: CalendarDays, label: 'Member Since', value: formatDate(user.createdAt) || '—', color: '#2563eb' },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} style={{ ...card, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <Icon size={22} color={s.color} />
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</div>
                <div style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', marginTop: '1px' }}>{s.value}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px', alignItems: 'start' }}>
        {/* Personal */}
        <div style={{ ...card, padding: '22px 24px' }}>
          <CardHeader
            icon={User}
            tint="#e0f2fe"
            color="#0284c7"
            title="Personal Information"
            action={
              <button type="button" onClick={() => onSwitchTab?.('edit')} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#2563eb', background: '#eff6ff', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer' }}>
                <Pencil size={13} /> Edit
              </button>
            }
          />
          <Row icon={User} label="Full name" value={user.name} />
          <Row icon={Phone} label="Mobile" value={user.phone} />
          <Row icon={Mail} label="Email" value={user.email} />
          <Row icon={CalendarDays} label="Date of birth" value={formatDate(user.dob)} />
          <Row label="Gender" value={user.gender} />
          <Row icon={MapPin} label="Address" value={formatAddress(user.address)} last />
        </div>

        {/* Service */}
        <div style={{ ...card, padding: '22px 24px' }}>
          <CardHeader icon={Briefcase} tint="#dcfce7" color="#16a34a" title="Service & Work Area" />

          <div style={{ padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ color: '#64748b', fontSize: '0.82rem', fontWeight: '600', marginBottom: '8px' }}>Service categories</div>
            {categoryNames.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {categoryNames.map((name) => (
                  <Chip key={name} bg="#e0f2fe" fg="#0369a1" border="#bae6fd"><Briefcase size={13} /> {name}</Chip>
                ))}
              </div>
            ) : (
              <span style={{ color: '#94a3b8', fontSize: '0.84rem', fontStyle: 'italic' }}>No category assigned yet</span>
            )}
          </div>

          <div style={{ padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ color: '#64748b', fontSize: '0.82rem', fontWeight: '600', marginBottom: '8px' }}>Specializations</div>
            {offeredServices.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {offeredServices.map((name) => (
                  <Chip key={name} bg="#f0fdf4" fg="#15803d" border="#bbf7d0"><CheckCircle2 size={13} /> {name}</Chip>
                ))}
              </div>
            ) : (
              <span style={{ color: '#94a3b8', fontSize: '0.84rem', fontStyle: 'italic' }}>All services in your category are enabled</span>
            )}
          </div>

          <Row label="Base city" value={cityName} />
          <Row label="Work experience" value={user.experience} />
          <Row label="Operating radius" value={hasValue(user.workRadius) ? `${user.workRadius} km` : ''} />

          <div style={{ paddingTop: '12px' }}>
            <div style={{ color: '#64748b', fontSize: '0.82rem', fontWeight: '600', marginBottom: '8px' }}>Service localities</div>
            {localities.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {localities.map((loc) => (
                  <Chip key={loc} bg="#f8fafc" fg="#334155" border="#e2e8f0"><MapPin size={12} color="#0284c7" /> {loc}</Chip>
                ))}
              </div>
            ) : (
              <button type="button" onClick={() => onSwitchTab?.('edit')} style={{ background: 'none', border: 'none', padding: 0, color: '#2563eb', fontSize: '0.84rem', fontWeight: '700', cursor: 'pointer' }}>
                + Add the areas you serve
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Shortcuts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
        <ShortcutTile icon={Landmark} tint="#ecfdf5" color="#059669" title="Bank Account & UPI" subtitle={bankSubtitle} warn={!hasBank} onClick={() => onSwitchTab?.('bank')} />
        <ShortcutTile icon={FileText} tint="#e0f2fe" color="#0284c7" title="KYC Documents" subtitle={kycSubtitle} warn={!kycApproved && user.kycStatus === 'rejected'} onClick={() => onSwitchTab?.('documents')} />
        <ShortcutTile
          icon={Gift}
          tint="#fae8ff"
          color="#c026d3"
          title="Refer & Earn"
          subtitle={referralCode ? `Code: ${referralCode}${referralBonus ? ` • Earn ₹${referralBonus} per partner` : ''}` : 'Invite technicians and earn rewards'}
          onClick={() => onSwitchTab?.('referral')}
        />
      </div>
    </div>
  );
};

export default PartnerProfileOverview;
