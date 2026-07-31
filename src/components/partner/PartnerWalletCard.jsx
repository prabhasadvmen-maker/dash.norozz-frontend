import React from 'react';
import { Wallet, ArrowUpRight, ArrowDownLeft, ShieldCheck, CreditCard, RefreshCw } from 'lucide-react';
import { usePartner } from '../../hooks/usePartner.js';

const PartnerWalletCard = () => {
  const { wallet, refetch } = usePartner();

  const balance = wallet?.balance || 18450;
  const transactions = wallet?.recentTransactions || [
    { id: 'TXN-9021', type: 'Credit', desc: 'Job Settlement', date: 'Today, 02:30 PM', amount: '+₹3,999' },
    { id: 'TXN-9020', type: 'Debit', desc: 'Bank Payout to HDFC Bank', date: 'Yesterday, 06:00 PM', amount: '-₹12,500' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', marginBottom: '28px' }}>
      
      {/* Wallet Balance & Instant Withdrawal Card */}
      <div className="mui-card" style={{ padding: '24px', background: 'var(--gradient-brand)', color: '#ffffff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: '700', opacity: 0.9, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Wallet size={18} /> Partner E-Wallet Balance
          </span>
          <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}>
            <ShieldCheck size={12} /> VERIFIED ACCOUNT
          </span>
        </div>

        <div style={{ fontSize: '2.4rem', fontWeight: '800', letterSpacing: '-0.8px', marginBottom: '8px' }}>
          ₹{Number(balance).toLocaleString()}.00
        </div>

        <div style={{ fontSize: '0.78rem', opacity: 0.85, marginBottom: '24px' }}>
          Linked Bank: HDFC Bank • Instant Payout Available
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn" style={{ background: '#ffffff', color: '#2563eb', fontWeight: '800', border: 'none', flex: 1 }}>
            <ArrowUpRight size={16} /> Withdraw to Bank
          </button>
          <button onClick={() => refetch()} className="btn" style={{ background: 'rgba(255,255,255,0.15)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.3)', flex: 1 }}>
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
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
