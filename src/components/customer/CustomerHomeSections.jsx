import React from 'react';
import { ShieldCheck, CalendarCheck, IndianRupee, Headphones, Tag, Sparkles } from 'lucide-react';

const CustomerHomeSections = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', marginBottom: '40px' }}>
      
      {/* 1. Deals and Offers Section */}
      <div>
        <h2 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#0f172a', margin: '0 0 18px 0' }}>
          Deals and Offers
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {/* Offer 1: Warm Yellow */}
          <div style={{
            background: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }}>
            <div>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: '900',
                color: '#d97706',
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
                display: 'inline-block',
                marginBottom: '8px'
              }}>
                UP TO 30% OFF
              </span>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '900', color: '#0f172a', margin: '0 0 4px 0' }}>
                Summer Special AC Servicing
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>
                Foam jet service starts at ₹499
              </p>
            </div>
          </div>

          {/* Offer 2: Mint Green */}
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }}>
            <div>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: '900',
                color: '#16a34a',
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
                display: 'inline-block',
                marginBottom: '8px'
              }}>
                FLAT ₹150 CASHBACK
              </span>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '900', color: '#0f172a', margin: '0 0 4px 0' }}>
                Deep Home Cleaning Fest
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>
                For villa & apartment deep cleaning
              </p>
            </div>
          </div>

          {/* Offer 3: Soft Pink */}
          <div style={{
            background: '#fdf2f8',
            border: '1px solid #fbcfe8',
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }}>
            <div>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: '900',
                color: '#db2777',
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
                display: 'inline-block',
                marginBottom: '8px'
              }}>
                BUY 1 GET 1 FREE
              </span>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '900', color: '#0f172a', margin: '0 0 4px 0' }}>
                Salon Premium Packages
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>
                Facials & pampering sessions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Why people trust Norozz Section */}
      <div style={{
        background: '#f8fafc',
        borderRadius: '20px',
        padding: '32px 28px',
        border: '1px solid #e2e8f0'
      }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#0f172a', textAlign: 'center', margin: '0 0 24px 0' }}>
          Why people trust Norozz
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {/* Card 1 */}
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '20px',
            textAlign: 'center',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: '#dcfce7',
              color: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px auto'
            }}>
              <ShieldCheck size={22} />
            </div>
            <h3 style={{ fontSize: '0.92rem', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' }}>
              Verified Professionals
            </h3>
            <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0, lineHeight: 1.3 }}>
              Background checked and trained experts
            </p>
          </div>

          {/* Card 2 */}
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '20px',
            textAlign: 'center',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: '#dbeafe',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px auto'
            }}>
              <CalendarCheck size={22} />
            </div>
            <h3 style={{ fontSize: '0.92rem', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' }}>
              30-Day Guarantee
            </h3>
            <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0, lineHeight: 1.3 }}>
              Free re-work if not satisfied
            </p>
          </div>

          {/* Card 3 */}
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '20px',
            textAlign: 'center',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: '#ccfbf1',
              color: '#0d9488',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px auto'
            }}>
              <IndianRupee size={22} />
            </div>
            <h3 style={{ fontSize: '0.92rem', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' }}>
              Transparent Pricing
            </h3>
            <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0, lineHeight: 1.3 }}>
              No hidden charges, upfront pricing
            </p>
          </div>

          {/* Card 4 */}
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '20px',
            textAlign: 'center',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: '#f3e8ff',
              color: '#9333ea',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px auto'
            }}>
              <Headphones size={22} />
            </div>
            <h3 style={{ fontSize: '0.92rem', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' }}>
              24/7 Premium Support
            </h3>
            <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0, lineHeight: 1.3 }}>
              Help whenever you need it
            </p>
          </div>
        </div>
      </div>

      {/* 3. Dark Navy Footer Section */}
      <footer style={{
        background: '#0b132b',
        borderRadius: '24px',
        padding: '40px 36px',
        color: '#ffffff',
        marginTop: '20px'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px', marginBottom: '32px' }}>
          <div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#ffffff', margin: '0 0 10px 0' }}>
              Norozz
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
              Norozz is your one-stop solution for all home, beauty, and maintenance needs. Fully certified and verified local experts.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '12px' }}>
              SERVICE CATEGORIES
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem', color: '#cbd5e1' }}>
              <span>AC Repair & Servicing</span>
              <span>Home Cleaning</span>
              <span>Women's Salon & Spa</span>
              <span>Appliance Services</span>
              <span>Plumbers & Electricians</span>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '12px' }}>
              COMPANY
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem', color: '#cbd5e1' }}>
              <span>About Us</span>
              <span>Careers</span>
              <span>Norozz Partners</span>
              <span>Terms & Conditions</span>
              <span>Privacy Policy</span>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '12px' }}>
              CONTACT & APP
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem', color: '#cbd5e1' }}>
              <span>Help Center</span>
              <span>Download on iOS</span>
              <span>Download on Android</span>
              <span>Partner Support</span>
            </div>
          </div>
        </div>

        <div style={{
          paddingTop: '20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '0.75rem',
          color: '#64748b'
        }}>
          <span>© 2026 Norozz Home Services Marketplace. All rights reserved.</span>
        </div>
      </footer>

    </div>
  );
};

export default CustomerHomeSections;
