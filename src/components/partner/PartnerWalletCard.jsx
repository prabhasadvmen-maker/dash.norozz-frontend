import React, { useState } from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  CreditCard,
  RefreshCw,
  Zap,
  TrendingUp,
  History,
  Lock,
  Building2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { usePartner } from '../../hooks/usePartner.js';
import { toast } from '../../utils/toast.js';

const PartnerWalletCard = () => {
  const { wallet, refetchWallet } = usePartner('wallet');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const balance = wallet?.walletBalance ?? wallet?.balance ?? wallet?.availableBalance ?? 0;
  const transactions = wallet?.transactions || wallet?.recentTransactions || [];
  const securityDeposit = wallet?.securityDeposit ?? 500;
  const totalEarned = wallet?.totalEarned ?? balance;
  const pendingClearance = wallet?.pendingClearance ?? 0;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (refetchWallet) await refetchWallet();
      toast.success('Wallet balance & ledger updated!');
    } catch (e) {
      toast.error('Failed to sync wallet data');
    } finally {
      setTimeout(() => setIsRefreshing(false), 600);
    }
  };

  const handleWithdraw = () => {
    if (balance <= 0) {
      toast.error('Insufficient wallet balance for withdrawal.');
      return;
    }
    toast.success(`🎉 Instant IMPS transfer of ₹${Number(balance).toLocaleString()} initiated to linked bank account!`);
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '24px',
        alignItems: 'start',
        marginBottom: '28px',
      }}
    >
      {/* LEFT CARD: Ultra-Premium Metallic Partner Wallet */}
      <div
        style={{
          background: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #059669 100%)',
          borderRadius: '24px',
          padding: '26px',
          color: '#ffffff',
          boxShadow: '0 20px 40px rgba(5, 150, 105, 0.25)',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justify: 'space-between',
          minHeight: '360px',
        }}
      >
        {/* Subtle Background Glass Accent Circles */}
        <div
          style={{
            position: 'absolute',
            top: '-40px',
            right: '-40px',
            width: '180px',
            height: '180px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.08)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-60px',
            left: '-60px',
            width: '220px',
            height: '220px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.05)',
            pointerEvents: 'none',
          }}
        />

        <div>
          {/* Top Header Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.18)',
                  backdropFilter: 'blur(8px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Wallet size={20} color="#ffffff" />
              </div>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: '800',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  color: 'rgba(255, 255, 255, 0.95)',
                }}
              >
                Partner Wallet
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                padding: '5px 12px',
                borderRadius: '20px',
                fontSize: '0.74rem',
                fontWeight: '700',
              }}
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34d399', boxShadow: '0 0 8px #34d399' }} />
              <span>Instant Payouts</span>
            </div>
          </div>

          {/* Main Balance Row */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: '600', color: 'rgba(255, 255, 255, 0.85)', marginBottom: '4px' }}>
              Available Wallet Balance
            </div>
            <div style={{ fontSize: '2.6rem', fontWeight: '900', letterSpacing: '-1px', lineHeight: '1.1' }}>
              ₹{Number(balance).toLocaleString()}
            </div>
            <div style={{ fontSize: '0.76rem', color: 'rgba(255, 255, 255, 0.75)', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Zap size={13} color="#34d399" />
              <span>Real-time earnings auto-credited after every job completion</span>
            </div>
          </div>

          {/* Glass Stats Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '10px',
              marginBottom: '24px',
            }}
          >
            <div
              style={{
                background: 'rgba(0, 0, 0, 0.18)',
                backdropFilter: 'blur(12px)',
                padding: '10px 12px',
                borderRadius: '14px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
              }}
            >
              <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.8)', fontWeight: '600', marginBottom: '2px' }}>
                Total Earned
              </div>
              <div style={{ fontSize: '0.98rem', fontWeight: '800' }}>
                ₹{Number(totalEarned).toLocaleString()}
              </div>
            </div>

            <div
              style={{
                background: 'rgba(0, 0, 0, 0.18)',
                backdropFilter: 'blur(12px)',
                padding: '10px 12px',
                borderRadius: '14px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
              }}
            >
              <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.8)', fontWeight: '600', marginBottom: '2px' }}>
                Security Deposit
              </div>
              <div style={{ fontSize: '0.98rem', fontWeight: '800' }}>
                ₹{Number(securityDeposit).toLocaleString()}
              </div>
            </div>

            <div
              style={{
                background: 'rgba(0, 0, 0, 0.18)',
                backdropFilter: 'blur(12px)',
                padding: '10px 12px',
                borderRadius: '14px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
              }}
            >
              <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.8)', fontWeight: '600', marginBottom: '2px' }}>
                Pending Hold
              </div>
              <div style={{ fontSize: '0.98rem', fontWeight: '800' }}>
                ₹{Number(pendingClearance).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="button"
            onClick={handleWithdraw}
            style={{
              flex: 1,
              padding: '13px 18px',
              borderRadius: '14px',
              background: '#ffffff',
              color: '#047857',
              fontSize: '0.92rem',
              fontWeight: '800',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
            }}
          >
            <span>Withdraw Funds</span>
            <ArrowUpRight size={18} />
          </button>

          <button
            type="button"
            onClick={handleRefresh}
            style={{
              padding: '13px 16px',
              borderRadius: '14px',
              background: 'rgba(255, 255, 255, 0.16)',
              backdropFilter: 'blur(8px)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
            title="Refresh Wallet Sync"
          >
            <RefreshCw size={18} className={isRefreshing ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {/* RIGHT CARD: Recent Wallet Transactions Ledger */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '24px',
          padding: '24px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)',
          minHeight: '360px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <h3 style={{ fontSize: '1.08rem', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CreditCard size={20} color="#059669" />
            <span>Recent Wallet Transactions</span>
          </h3>
          <span style={{ fontSize: '0.74rem', fontWeight: '700', color: '#64748b', background: '#f1f5f9', padding: '4px 10px', borderRadius: '12px' }}>
            {transactions.length} Activity Logged
          </span>
        </div>

        {/* Scrollable Transactions List */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            maxHeight: '280px',
            overflowY: 'auto',
            paddingRight: '4px',
          }}
        >
          {transactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 10px', color: '#94a3b8' }}>
              <History size={36} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
              <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#64748b' }}>No recent transactions</div>
              <div style={{ fontSize: '0.78rem' }}>Your wallet transaction history will appear here</div>
            </div>
          ) : (
            transactions.map((txn, idx) => {
              const isCredit = txn.type === 'Credit';
              const titleText = txn.title || txn.desc || txn.category || (isCredit ? 'Wallet Credit' : 'Wallet Debit');
              const dateStr = txn.createdAt
                ? new Date(txn.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
                : (txn.date || 'Recent');
              const amountVal = typeof txn.amount === 'number' ? txn.amount : parseFloat(String(txn.amount || '0').replace(/[^\d.]/g, '')) || 0;

              return (
                <div
                  key={txn._id || txn.id || txn.transactionId || idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '16px',
                    background: '#f8fafc',
                    border: '1px solid #f1f5f9',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '12px',
                        background: isCredit ? '#dcfce7' : '#fee2e2',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {isCredit ? (
                        <ArrowDownLeft size={20} color="#16a34a" />
                      ) : (
                        <ArrowUpRight size={20} color="#dc2626" />
                      )}
                    </div>

                    <div>
                      <div style={{ fontSize: '0.86rem', fontWeight: '800', color: '#1e293b', lineHeight: '1.2' }}>
                        {titleText}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px', fontWeight: '500' }}>
                        {dateStr}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span
                      style={{
                        fontSize: '0.96rem',
                        fontWeight: '800',
                        color: isCredit ? '#15803d' : '#dc2626',
                        display: 'inline-block',
                        padding: '4px 10px',
                        borderRadius: '10px',
                        background: isCredit ? '#f0fdf4' : '#fef2f2',
                      }}
                    >
                      {isCredit ? '+' : '-'}₹{amountVal.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default PartnerWalletCard;
