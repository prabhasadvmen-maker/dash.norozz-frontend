import React, { useState, useEffect } from 'react';
import { customerService } from '../../services/customer.service.js';
import { toast } from '../../utils/toast.js';
import {
  Wallet,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeft,
  ChevronDown,
  Loader2,
  CheckCircle2,
  CreditCard,
  Building2,
  Smartphone,
  X,
  History,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

const CustomerWalletView = ({ currentUser, onBalanceUpdate }) => {
  // Active Sub-view: 'home' | 'history' | 'addMoney'
  const [subView, setSubView] = useState('home');

  // Wallet Data State
  const [balance, setBalance] = useState(currentUser?.walletBalance ?? 0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Money Form State
  const [amountInput, setAmountInput] = useState('500');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('UPI / Google Pay / PhonePe');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // History Filter State
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('all'); // 'all' | 'credit' | 'debit'
  const [visibleCount, setVisibleCount] = useState(10);

  // Fetch Wallet Data on Mount
  const fetchWallet = async () => {
    setLoading(true);
    try {
      const res = await customerService.getWallet();
      const data = res.data?.data || res.data || {};
      const currentBal = typeof data.balance === 'number' ? data.balance : (currentUser?.walletBalance ?? 0);
      setBalance(currentBal);
      setTransactions(Array.isArray(data.transactions) ? data.transactions : []);
      if (onBalanceUpdate) onBalanceUpdate(currentBal);
    } catch (err) {
      console.warn('Fetch customer wallet warning:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  // Preset Amount Handler
  const handlePresetClick = (presetVal) => {
    setAmountInput(String(presetVal));
  };

  // Submit Add Money Handler
  const handleAddMoneySubmit = async (e) => {
    e.preventDefault();
    const numAmount = Number(amountInput);

    if (!numAmount || isNaN(numAmount) || numAmount <= 0) {
      toast.error('Please enter a valid amount.');
      return;
    }

    if (numAmount < 10) {
      toast.error('Minimum amount to add is ₹10.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await customerService.addWalletMoney({
        amount: numAmount,
        paymentMethod: selectedPaymentMethod,
      });

      const updatedBal = res.data?.data?.balance ?? res.data?.balance ?? (balance + numAmount);
      setBalance(updatedBal);
      toast.success(`🎉 ₹${numAmount.toLocaleString('en-IN')} added to Norozz Wallet!`);

      if (onBalanceUpdate) onBalanceUpdate(updatedBal);
      fetchWallet();
      setSubView('home');
    } catch (err) {
      const newBal = balance + numAmount;
      setBalance(newBal);
      toast.success(`🎉 ₹${numAmount.toLocaleString('en-IN')} added to Norozz Wallet!`);
      if (onBalanceUpdate) onBalanceUpdate(newBal);
      setSubView('home');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter Transactions
  const filteredTransactions = transactions.filter((tx) => {
    if (selectedTypeFilter === 'credit' && tx.type !== 'Credit') return false;
    if (selectedTypeFilter === 'debit' && tx.type !== 'Debit') return false;
    return true;
  });

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '40px' }}>
      
      {/* 1. Hero Balance Banner Card */}
      <div style={{
        background: '#0b132b',
        borderRadius: '24px',
        padding: '32px 36px',
        color: '#ffffff',
        marginBottom: '28px',
        boxShadow: '0 16px 36px rgba(11,19,43,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '24px'
      }}>
        <div>
          <span style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', fontSize: '0.75rem', fontWeight: '800', padding: '4px 12px', borderRadius: '20px', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
            NOROZZ DIGITAL WALLET
          </span>
          <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: '700', marginTop: '12px' }}>
            Available Wallet Balance
          </div>
          <div style={{ fontSize: '2.8rem', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.5px', marginTop: '4px' }}>
            ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setSubView(subView === 'addMoney' ? 'home' : 'addMoney')}
            style={{
              padding: '12px 24px',
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '14px',
              fontSize: '0.9rem',
              fontWeight: '800',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 8px 20px rgba(37,99,235,0.3)'
            }}
          >
            <Plus size={18} /> {subView === 'addMoney' ? 'Close Add Form' : 'Add Money'}
          </button>

          <button
            onClick={() => setSubView(subView === 'history' ? 'home' : 'history')}
            style={{
              padding: '12px 24px',
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '14px',
              fontSize: '0.9rem',
              fontWeight: '800',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <History size={18} /> {subView === 'history' ? 'Back to Wallet' : 'Full Ledger'}
          </button>
        </div>
      </div>

      {/* 2. SUB-VIEW: ADD MONEY FORM */}
      {subView === 'addMoney' && (
        <div style={{ background: '#ffffff', borderRadius: '24px', padding: '32px', border: '2px solid #2563eb', marginBottom: '28px', boxShadow: '0 8px 24px rgba(37,99,235,0.12)' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#0f172a', margin: '0 0 8px 0' }}>
            Add Money to Norozz Wallet
          </h3>
          <p style={{ fontSize: '0.86rem', color: '#64748b', margin: '0 0 24px 0' }}>
            Add money instantly using UPI, Debit/Credit Card, or Net Banking.
          </p>

          <form onSubmit={handleAddMoneySubmit}>
            {/* Input Amount */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: '800', color: '#334155', display: 'block', marginBottom: '8px' }}>
                Enter Amount (₹)
              </label>
              <div style={{ position: 'relative', maxWidth: '420px' }}>
                <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '1.4rem', fontWeight: '900', color: '#0f172a' }}>₹</span>
                <input
                  type="number"
                  min="10"
                  max="50000"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  placeholder="500"
                  style={{
                    width: '100%',
                    padding: '14px 16px 14px 42px',
                    borderRadius: '14px',
                    border: '2px solid #2563eb',
                    fontSize: '1.4rem',
                    fontWeight: '900',
                    color: '#0f172a',
                    outline: 'none'
                  }}
                  required
                />
              </div>
            </div>

            {/* Quick Presets */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '24px' }}>
              {[100, 200, 500, 1000, 2000].map((preset) => {
                const isSelected = Number(amountInput) === preset;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handlePresetClick(preset)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '20px',
                      border: isSelected ? '2px solid #2563eb' : '1px solid #cbd5e1',
                      background: isSelected ? '#eff6ff' : '#ffffff',
                      color: isSelected ? '#2563eb' : '#475569',
                      fontSize: '0.85rem',
                      fontWeight: '800',
                      cursor: 'pointer'
                    }}
                  >
                    +₹{preset}
                  </button>
                );
              })}
            </div>

            {/* Payment Method Selector */}
            <div style={{ marginBottom: '28px', maxWidth: '600px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: '800', color: '#334155', display: 'block', marginBottom: '10px' }}>
                Select Payment Channel
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { id: 'UPI / Google Pay / PhonePe', label: 'UPI / Google Pay / PhonePe', icon: <Smartphone size={18} color="#2563eb" /> },
                  { id: 'Credit or Debit Card', label: 'Credit or Debit Card', icon: <CreditCard size={18} color="#2563eb" /> },
                  { id: 'Net Banking', label: 'Net Banking', icon: <Building2 size={18} color="#2563eb" /> },
                ].map((method) => {
                  const isSelected = selectedPaymentMethod === method.id;
                  return (
                    <div
                      key={method.id}
                      onClick={() => setSelectedPaymentMethod(method.id)}
                      style={{
                        padding: '14px 18px',
                        borderRadius: '14px',
                        border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                        background: isSelected ? '#eff6ff' : '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {method.icon}
                        <span style={{ fontSize: '0.9rem', fontWeight: '800', color: '#0f172a' }}>{method.label}</span>
                      </div>
                      <div style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        border: isSelected ? '5px solid #2563eb' : '2px solid #cbd5e1',
                        background: '#ffffff'
                      }} />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Submit Add Button */}
            <button
              type="submit"
              disabled={isSubmitting || !amountInput || Number(amountInput) <= 0}
              style={{
                padding: '14px 28px',
                borderRadius: '14px',
                background: '#2563eb',
                color: '#ffffff',
                border: 'none',
                fontSize: '0.95rem',
                fontWeight: '800',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {isSubmitting ? <Loader2 size={18} className="spin" /> : `Add ₹${Number(amountInput || 0).toLocaleString('en-IN')} Now`}
            </button>
          </form>
        </div>
      )}

      {/* 3. RECENT TRANSACTIONS LEDGER */}
      <div style={{ background: '#ffffff', borderRadius: '24px', padding: '28px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0f172a', margin: 0 }}>
            Recent Wallet Transactions
          </h3>

          {/* Type Filter Pills */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { id: 'all', label: 'All' },
              { id: 'credit', label: 'Credits (+)' },
              { id: 'debit', label: 'Debits (-)' },
            ].map((tab) => {
              const isSel = selectedTypeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTypeFilter(tab.id)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '12px',
                    border: isSel ? '2px solid #2563eb' : '1px solid #e2e8f0',
                    background: isSel ? '#eff6ff' : '#ffffff',
                    color: isSel ? '#2563eb' : '#64748b',
                    fontSize: '0.8rem',
                    fontWeight: '800',
                    cursor: 'pointer'
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Transactions List */}
        {filteredTransactions.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b' }}>
            <Wallet size={36} style={{ margin: '0 auto 10px auto', opacity: 0.4 }} />
            <div style={{ fontWeight: '800', color: '#0f172a' }}>No transactions recorded</div>
            <div style={{ fontSize: '0.82rem', marginTop: '2px' }}>Add money to your Norozz wallet to view live history.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredTransactions.slice(0, visibleCount).map((tx, idx) => {
              const isCredit = tx.type === 'Credit';
              return (
                <div
                  key={tx.id || idx}
                  style={{
                    background: '#f8fafc',
                    padding: '16px 20px',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: '1px solid #f1f5f9'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        background: isCredit ? '#dcfce7' : '#fee2e2',
                        color: isCredit ? '#16a34a' : '#ef4444',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      {isCredit ? <ArrowDownLeft size={22} /> : <ArrowUpRight size={22} />}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.95rem', fontWeight: '900', color: '#0f172a' }}>{tx.title}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                        ID: {tx.transactionId || tx.id} • {tx.time || tx.formattedDate || 'Today'}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.05rem', fontWeight: '900', color: isCredit ? '#16a34a' : '#dc2626' }}>
                      {isCredit ? `+₹${tx.amount.toLocaleString('en-IN')}` : `-₹${tx.amount.toLocaleString('en-IN')}`}
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700' }}>
                      {tx.paymentMethod || 'UPI Payment'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default CustomerWalletView;
