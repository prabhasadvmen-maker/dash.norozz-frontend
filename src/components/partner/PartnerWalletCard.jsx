import React from 'react';
import { Wallet, ArrowUpRight, ArrowDownLeft, ShieldCheck, CreditCard, RefreshCw } from 'lucide-react';
import { usePartner } from '../../hooks/usePartner.js';

const PartnerWalletCard = () => {
  const { wallet } = usePartner('wallet');

  const balance = wallet?.walletBalance ?? wallet?.balance ?? wallet?.availableBalance ?? 0;
  const transactions = wallet?.transactions || wallet?.recentTransactions || [];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', marginBottom: '28px' }}>
      
      {/* Wallet Balance & Instant Withdrawal Card */}
      <div
        className="mui-card"
        style={{
          padding: '24px',
          background: 'linear-gradient(135deg, #15803d 0%, #16a34a 100%)',
          color: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 10px 25px rgba(22, 163, 74, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div>
          <div style={{ fontSize: '0.86rem', fontWeight: '700', opacity: 0.9, marginBottom: '6px' }}>
            Wallet Balance
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: '800', letterSpacing: '-0.8px' }}>
            ₹{Number(balance).toLocaleString()}
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            toast.success(`Withdrawal request of ₹${Number(balance).toLocaleString()} initiated to linked bank account!`);
          }}
          className="btn"
          style={{
            background: '#ffffff',
            color: '#15803d',
            fontWeight: '800',
            fontSize: '0.92rem',
            padding: '10px 22px',
            borderRadius: '12px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        >
          Withdraw
        </button>
      </div>

      {/* Recent Wallet Transactions */}
      <div className="mui-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CreditCard size={20} color="#7c3aed" /> Recent Wallet Transactions
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {transactions.map((txn, idx) => (
            <div key={txn.id || idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: txn.type === 'Credit' ? '#ecfdf5' : '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {txn.type === 'Credit' ? <ArrowDownLeft size={16} color="#10b981" /> : <ArrowUpRight size={16} color="#ef4444" />}
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)' }}>{txn.desc || txn.type}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{txn.date || 'Recent'}</div>
                </div>
              </div>
              <span style={{ fontWeight: '800', fontSize: '0.9rem', color: txn.type === 'Credit' ? '#10b981' : '#ef4444' }}>
                {txn.amount || '₹0'}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default PartnerWalletCard;
