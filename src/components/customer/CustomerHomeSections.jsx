import { ShieldCheck, CalendarCheck, IndianRupee, Headphones, Tag } from 'lucide-react';

const TRUST_POINTS = [
  { icon: ShieldCheck, title: 'Verified Professionals', text: 'KYC-checked experts only', color: '#16a34a', bg: '#dcfce7' },
  { icon: CalendarCheck, title: 'Easy Scheduling', text: 'Pick the date and time slot you want', color: '#2563eb', bg: '#dbeafe' },
  { icon: IndianRupee, title: 'Transparent Pricing', text: 'Upfront prices, no hidden charges', color: '#d97706', bg: '#fef3c7' },
  { icon: Headphones, title: 'Support When You Need It', text: 'Help available from the app', color: '#9333ea', bg: '#f3e8ff' },
];

const offerLabel = (coupon) =>
  coupon.discountType === 'percentage'
    ? `${coupon.discountValue}% OFF${coupon.maxDiscountAmount ? ` (up to ₹${coupon.maxDiscountAmount})` : ''}`
    : `₹${coupon.discountValue} OFF`;

// offers = live coupons from the backend; the section is hidden when there are none
const CustomerHomeSections = ({ offers = [], categories = [], onApplyCoupon, onSelectCategory }) => {
  const activeOffers = (offers || []).slice(0, 6);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '36px', marginBottom: '32px' }}>
      {activeOffers.length > 0 && (
        <section>
          <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0f172a', margin: '0 0 16px 0' }}>Offers for you</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
            {activeOffers.map((coupon) => (
              <button
                key={coupon._id || coupon.code}
                type="button"
                onClick={() => onApplyCoupon?.(coupon.code)}
                style={{ textAlign: 'left', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '16px', padding: '18px 20px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '6px' }}
              >
                <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{offerLabel(coupon)}</span>
                <span style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a' }}>{coupon.title || coupon.description || 'Special offer'}</span>
                {coupon.minBookingAmount > 0 && <span style={{ fontSize: '0.78rem', color: '#64748b' }}>On bookings above ₹{coupon.minBookingAmount}</span>}
                <span style={{ marginTop: '4px', display: 'inline-flex', alignItems: 'center', gap: '6px', alignSelf: 'flex-start', fontSize: '0.78rem', fontWeight: '800', color: '#92400e', border: '1px dashed #f59e0b', borderRadius: '9999px', padding: '3px 12px' }}>
                  <Tag size={13} /> {coupon.code}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      <section style={{ background: '#ffffff', borderRadius: '20px', padding: '28px', border: '1px solid #e2e8f0' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0f172a', textAlign: 'center', margin: '0 0 22px 0' }}>Why people trust Norozz</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {TRUST_POINTS.map((point) => {
            const Icon = point.icon;
            return (
              <div key={point.title} style={{ textAlign: 'center', padding: '8px' }}>
                <span style={{ width: '46px', height: '46px', borderRadius: '12px', background: point.bg, color: point.color, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                  <Icon size={22} />
                </span>
                <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' }}>{point.title}</h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, lineHeight: 1.4 }}>{point.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      <footer style={{ background: '#0b132b', borderRadius: '20px', padding: '32px 32px 20px', color: '#ffffff' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '28px', marginBottom: '24px' }}>
          <div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', margin: '0 0 8px 0' }}>Norozz</h3>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.55, margin: 0 }}>
              Book trusted home service professionals near you, with upfront pricing.
            </p>
          </div>

          {categories.length > 0 && (
            <div>
              <h4 style={{ fontSize: '0.74rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 12px 0' }}>Services</h4>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                {categories.slice(0, 6).map((cat) => (
                  <button
                    key={cat._id || cat.name}
                    type="button"
                    onClick={() => onSelectCategory?.(cat)}
                    style={{ background: 'none', border: 'none', padding: 0, color: '#cbd5e1', fontSize: '0.84rem', cursor: 'pointer', textAlign: 'left' }}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '0.76rem', color: '#64748b' }}>
          © {new Date().getFullYear()} Norozz. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default CustomerHomeSections;
