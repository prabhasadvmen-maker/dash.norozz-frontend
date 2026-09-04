import { useState, useEffect } from 'react';
import { Gift, Users, Award, Wallet, Search, Check, Save, RefreshCw } from 'lucide-react';
import { superAdminService } from '../../services/superAdmin.service.js';
import { toast } from '../../utils/toast.js';

const SuperAdminReferralView = () => {
  const [loading, setLoading] = useState(true);
  const [referralBonusAmount, setReferralBonusAmount] = useState(500);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({
    totalReferredCount: 0,
    totalBonusPaid: 0,
    referralList: [],
  });
  const [searchQuery, setSearchQuery] = useState('');

  const fetchReferralData = async () => {
    setLoading(true);
    try {
      const res = await superAdminService.getAllReferrals();
      const data = res.data?.data || res.data || {};
      if (data.referralSettings?.referralBonusAmount !== undefined) {
        setReferralBonusAmount(data.referralSettings.referralBonusAmount);
      }
      setStats({
        totalReferredCount: data.totalReferredCount || 0,
        totalBonusPaid: data.totalBonusPaid || 0,
        referralList: data.referralList || [],
      });
    } catch (err) {
      console.error('Failed to fetch referral data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferralData();
  }, []);

  const handleSaveBonusAmount = async (e) => {
    e.preventDefault();
    const amt = Number(referralBonusAmount);
    if (isNaN(amt) || amt < 0) {
      toast.error('Please enter a valid positive bonus amount');
      return;
    }

    setSaving(true);
    try {
      await superAdminService.updateSettings({ referralBonusAmount: amt });
      toast.success(`🎉 Referral bonus updated to ₹${amt.toLocaleString('en-IN')} per signup!`);
    } catch (err) {
      toast.error('Failed to update referral bonus amount');
    } finally {
      setSaving(false);
    }
  };

  const filteredList = (stats.referralList || []).filter((item) => {
    const q = searchQuery.toLowerCase();
    const refName = (item.referredByPartner?.name || item.referredBy || '').toLowerCase();
    const techName = (item.name || '').toLowerCase();
    const techPhone = (item.phone || '').toLowerCase();
    return refName.includes(q) || techName.includes(q) || techPhone.includes(q);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Banner & Control Settings */}
      <div style={{
        background: 'linear-gradient(135deg, #701a75 0%, #a21caf 60%, #c026d3 100%)',
        borderRadius: '24px',
        padding: '28px 32px',
        color: '#ffffff',
        boxShadow: '0 16px 36px rgba(162, 28, 175, 0.25)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div style={{ maxWidth: '600px' }}>
          <span style={{
            background: 'rgba(255, 255, 255, 0.2)',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '0.78rem',
            fontWeight: '800',
            textTransform: 'uppercase',
            letterSpacing: '0.6px'
          }}>
            🎁 SUPER ADMIN REFERRAL PROGRAM MANAGER
          </span>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '900', margin: '12px 0 6px 0', letterSpacing: '-0.5px' }}>
            Configure Partner Referral Earnings
          </h2>
          <p style={{ fontSize: '0.88rem', opacity: 0.9, margin: 0, lineHeight: 1.5 }}>
            Decide how much reward partners get when their referred technician registers & completes their 1st customer booking.
          </p>
        </div>

        {/* Reward Setup Form */}
        <form onSubmit={handleSaveBonusAmount} style={{
          background: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          borderRadius: '18px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.85, fontWeight: '700' }}>
              Referral Bonus Amount (₹)
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: '900', color: '#fef08a' }}>₹</span>
              <input
                type="number"
                value={referralBonusAmount}
                onChange={(e) => setReferralBonusAmount(e.target.value)}
                min={0}
                style={{
                  background: 'transparent',
                  border: 'none',
                  borderBottom: '2px solid #fef08a',
                  color: '#ffffff',
                  fontSize: '1.4rem',
                  fontWeight: '900',
                  width: '100px',
                  outline: 'none',
                  textAlign: 'left'
                }}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            style={{
              padding: '10px 18px',
              background: '#ffffff',
              color: '#701a75',
              border: 'none',
              borderRadius: '10px',
              fontWeight: '800',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.85rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
          >
            <Save size={16} /> {saving ? 'Saving...' : 'Save Reward'}
          </button>
        </form>
      </div>

      {/* Analytics Grid Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div style={{ background: '#ffffff', borderRadius: '18px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Current Bonus Rate</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#c026d3', marginTop: '4px' }}>
            ₹{Number(referralBonusAmount).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '4px', fontWeight: '600' }}>Active Reward / Signup</div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '18px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Referred Partners</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#0f172a', marginTop: '4px' }}>
            {stats.totalReferredCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#2563eb', marginTop: '4px', fontWeight: '600' }}>Platform-wide Registrations</div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '18px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Bonus Distributed</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#16a34a', marginTop: '4px' }}>
            ₹{stats.totalBonusPaid.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '4px', fontWeight: '600' }}>Credited to Partner Wallets</div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '18px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Program Status</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#059669', marginTop: '4px' }}>
            LIVE
          </div>
          <div style={{ fontSize: '0.75rem', color: '#059669', marginTop: '4px', fontWeight: '600' }}>● Auto-Crediting Active</div>
        </div>
      </div>

      {/* Master Log Table Card */}
      <div style={{
        background: '#ffffff',
        borderRadius: '20px',
        padding: '26px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Gift size={20} color="#c026d3" /> Master Platform Referral Log ({stats.referralList.length})
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0 0 0' }}>
              List of all technicians who signed up using a partner referral code across India
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search referrer or technician..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  padding: '8px 12px 8px 36px',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  fontSize: '0.85rem',
                  outline: 'none',
                  width: '240px',
                  background: '#f8fafc'
                }}
              />
            </div>
            <button
              onClick={fetchReferralData}
              style={{
                padding: '8px 14px',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                color: '#334155',
                fontWeight: '700',
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <RefreshCw size={14} /> Refresh Log
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '30px', textAlign: 'center', color: '#64748b', fontWeight: '600' }}>Loading referral log...</div>
        ) : filteredList.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', color: '#64748b', fontWeight: '600' }}>
            No referred partners found matching your search.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '0.78rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <th style={{ padding: '12px', borderRadius: '8px 0 0 8px' }}>REFERRER PARTNER</th>
                  <th style={{ padding: '12px' }}>REFERRAL CODE USED</th>
                  <th style={{ padding: '12px' }}>JOINED USER / TECHNICIAN</th>
                  <th style={{ padding: '12px' }}>ROLE</th>
                  <th style={{ padding: '12px' }}>CONTACT</th>
                  <th style={{ padding: '12px' }}>JOIN DATE</th>
                  <th style={{ padding: '12px' }}>KYC / STATUS</th>
                  <th style={{ padding: '12px', borderRadius: '0 8px 8px 0' }}>REWARD STATUS</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.map((item) => {
                  const referrerName = item.referredByPartner?.name || 'Partner User';
                  const refCode = item.referredBy || item.referredByPartner?.referralCode || 'NRZ-REF';
                  const joinDate = item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent';
                  const isCredited = item.referralBonusStatus === 'credited';
                  const isPartner = item.role === 'partner';

                  return (
                    <tr key={item._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px', fontWeight: '800', color: '#0f172a' }}>{referrerName}</td>
                      <td style={{ padding: '12px', fontSize: '0.85rem', fontFamily: 'monospace', fontWeight: '700', color: '#701a75' }}>{refCode}</td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ fontWeight: '800', color: '#2563eb', fontSize: '0.88rem' }}>{item.name || (isPartner ? 'Technician' : 'Customer')}</div>
                        {item.userId && <div style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'monospace' }}>{item.userId}</div>}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span className={`badge ${isPartner ? 'badge-success' : 'badge-purple'}`} style={{ fontSize: '0.68rem' }}>
                          {isPartner ? 'TECHNICIAN' : 'CUSTOMER'}
                        </span>
                      </td>
                      <td style={{ padding: '12px', fontSize: '0.85rem', color: '#475569', fontWeight: '600' }}>{item.phone || item.email || 'N/A'}</td>
                      <td style={{ padding: '12px', fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>{joinDate}</td>
                      <td style={{ padding: '12px' }}>
                        <span className={`badge ${item.kycStatus === 'approved' || item.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                          {(item.kycStatus || item.status || 'active').toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '9999px',
                          fontSize: '0.78rem',
                          fontWeight: '800',
                          background: isCredited ? '#f0fdf4' : '#fffbeb',
                          color: isCredited ? '#16a34a' : '#d97706',
                          border: `1px solid ${isCredited ? '#bbf7d0' : '#fde68a'}`
                        }}>
                          {isCredited ? `✓ ₹${referralBonusAmount} Credited` : '⏳ Pending 1st Booking'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default SuperAdminReferralView;
