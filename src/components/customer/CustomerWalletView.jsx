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
  const [selectedMonthFilter, setSelectedMonthFilter] = useState('all');
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

      const responseData = res.data?.data || res.data || {};
      const newBal = responseData.walletBalance ?? (balance + numAmount);
      
      setBalance(newBal);
      if (onBalanceUpdate) onBalanceUpdate(newBal);

      toast.success(responseData.message || `🎉 ₹${numAmount} added to your wallet successfully!`);
      
      // Refresh transactions list
      fetchWallet();
      
      // Switch back to wallet home view
      setSubView('home');
      setAmountInput('500');
    } catch (err) {
      console.error('Add Money Error:', err);
      const errMsg = err.response?.data?.message || err.message || 'Failed to add money. Please try again.';
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter Transactions for History View
  const filteredTransactions = transactions.filter((tx) => {
    if (selectedTypeFilter === 'credit' && tx.type !== 'Credit') return false;
    if (selectedTypeFilter === 'debit' && tx.type !== 'Debit') return false;
    return true;
  });

  // Group Transactions by dateGroup
  const groupedTransactions = filteredTransactions.reduce((acc, tx) => {
    const group = tx.dateGroup || 'EARLIER';
    if (!acc[group]) acc[group] = [];
    acc[group].push(tx);
    return acc;
  }, {});

  if (loading && transactions.length === 0) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <Loader2 size={28} className="spin" style={{ margin: '0 auto 12px auto', color: '#2563eb' }} />
        <div>Loading NOROZZ Wallet...</div>
      </div>
    );
  }

  // ==========================================
  // VIEW 3: ADD MONEY SCREEN / MODAL
  // ==========================================
  if (subView === 'addMoney') {
    return (
      <div style={{ maxWidth: '540px', margin: '0 auto', background: '#0f172a', color: '#ffffff', borderRadius: '24px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', border: '1px solid #1e293b' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <button
            type="button"
            onClick={() => setSubView('home')}
            style={{ background: '#1e293b', border: 'none', color: '#94a3b8', width: '38px', height: '38px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <ArrowLeft size={20} />
          </button>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: '#ffffff' }}>Add Money</h2>
          <div style={{ width: '38px' }} />
        </div>

        {/* Current Wallet Balance Card */}
        <div style={{ background: '#1e293b', padding: '16px 20px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', border: '1px solid #334155' }}>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: '600' }}>Current Wallet Balance</div>
            <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#10b981', marginTop: '2px' }}>₹{balance.toLocaleString('en-IN')}</div>
          </div>
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '10px', borderRadius: '12px', color: '#10b981' }}>
            <Wallet size={24} />
          </div>
        </div>

        <form onSubmit={handleAddMoneySubmit}>
          {/* Enter Amount Input */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '0.84rem', fontWeight: '700', color: '#cbd5e1', display: 'block', marginBottom: '10px' }}>
              Enter Amount
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ position: 'absolute', left: '20px', fontSize: '1.8rem', fontWeight: '800', color: '#ffffff' }}>₹</span>
              <input
                type="number"
                min="10"
                max="50000"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                placeholder="500"
                style={{
                  width: '100%',
                  background: '#020617',
                  border: '2px solid #10b981',
                  borderRadius: '16px',
                  padding: '16px 48px 16px 48px',
                  fontSize: '1.8rem',
                  fontWeight: '800',
                  color: '#ffffff',
                  outline: 'none',
                  boxShadow: '0 0 15px rgba(16, 185, 129, 0.2)'
                }}
              />
              {amountInput && (
                <button
                  type="button"
                  onClick={() => setAmountInput('')}
                  style={{ position: 'absolute', right: '16px', background: '#334155', border: 'none', color: '#94a3b8', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Quick Preset Pills */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '28px' }}>
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
                    border: isSelected ? '2px solid #10b981' : '1px solid #334155',
                    background: isSelected ? '#10b981' : '#1e293b',
                    color: isSelected ? '#ffffff' : '#cbd5e1',
                    fontSize: '0.85rem',
                    fontWeight: '800',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  +₹{preset}
                </button>
              );
            })}
          </div>

          {/* Select Payment Method */}
          <div style={{ marginBottom: '32px' }}>
            <label style={{ fontSize: '0.88rem', fontWeight: '700', color: '#cbd5e1', display: 'block', marginBottom: '12px' }}>
              Select Payment Method
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { id: 'UPI / Google Pay / PhonePe', label: 'UPI / Google Pay / PhonePe', icon: <Smartphone size={18} color="#10b981" /> },
                { id: 'Credit or Debit Card', label: 'Credit or Debit Card', icon: <CreditCard size={18} color="#3b82f6" /> },
                { id: 'Net Banking', label: 'Net Banking', icon: <Building2 size={18} color="#a855f7" /> },
              ].map((method) => {
                const isSelected = selectedPaymentMethod === method.id;
                return (
                  <div
                    key={method.id}
                    onClick={() => setSelectedPaymentMethod(method.id)}
                    style={{
                      padding: '14px 18px',
                      borderRadius: '14px',
                      border: isSelected ? '2px solid #10b981' : '1px solid #334155',
                      background: isSelected ? 'rgba(16, 185, 129, 0.08)' : '#1e293b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ background: '#0f172a', padding: '8px', borderRadius: '10px' }}>{method.icon}</div>
                      <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#ffffff' }}>{method.label}</span>
                    </div>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      border: isSelected ? '6px solid #10b981' : '2px solid #64748b',
                      background: isSelected ? '#ffffff' : 'transparent',
                      transition: 'all 0.15s ease',
                    }} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !amountInput || Number(amountInput) <= 0}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff',
              border: 'none',
              fontSize: '1.05rem',
              fontWeight: '800',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={20} className="spin" /> Processing Payment...
              </>
            ) : (
              `Add ₹${Number(amountInput || 0).toLocaleString('en-IN')}`
            )}
          </button>
        </form>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: TRANSACTIONS HISTORY SCREEN
  // ==========================================
  if (subView === 'history') {
    return (
      <div style={{ maxWidth: '640px', margin: '0 auto', background: '#0f172a', color: '#ffffff', borderRadius: '24px', padding: '24px', minHeight: '520px', border: '1px solid #1e293b' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <button
            type="button"
            onClick={() => setSubView('home')}
            style={{ background: '#1e293b', border: 'none', color: '#94a3b8', width: '38px', height: '38px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <ArrowLeft size={20} />
          </button>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: '#ffffff' }}>Transactions</h2>
          <div style={{ width: '38px' }} />
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', overflowX: 'auto', pb: '4px' }}>
          {[
            { id: 'all', label: 'All Transactions' },
            { id: 'credit', label: 'Credits (+)' },
            { id: 'debit', label: 'Debits (-)' },
          ].map((tab) => {
            const isSel = selectedTypeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedTypeFilter(tab.id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '12px',
                  border: 'none',
                  background: isSel ? '#10b981' : '#1e293b',
                  color: isSel ? '#ffffff' : '#94a3b8',
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Grouped Transactions List */}
        {Object.keys(groupedTransactions).length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b' }}>
            <History size={36} style={{ margin: '0 auto 12px auto', opacity: 0.5 }} />
            <div style={{ fontWeight: '700', color: '#94a3b8' }}>No transactions found</div>
            <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>Your wallet transaction history will appear here.</div>
          </div>
        ) : (
          Object.entries(groupedTransactions).map(([groupTitle, list]) => (
            <div key={groupTitle} style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', tracking: '0.05em', marginBottom: '12px' }}>
                {groupTitle}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {list.slice(0, visibleCount).map((tx, idx) => {
                  const isCredit = tx.type === 'Credit';
                  return (
                    <div
                      key={tx.id || idx}
                      style={{
                        background: '#1e293b',
                        padding: '16px',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        border: '1px solid #334155',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div
                          style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '50%',
                            background: isCredit ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            color: isCredit ? '#10b981' : '#ef4444',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {isCredit ? <ArrowDownLeft size={22} /> : <ArrowUpRight size={22} />}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#ffffff' }}>{tx.title}</div>
                          <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '2px' }}>
                            ID: {tx.transactionId || tx.id} • {tx.time || tx.formattedDate}
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.05rem', fontWeight: '800', color: isCredit ? '#10b981' : '#ef4444' }}>
                          {isCredit ? `+₹${tx.amount.toLocaleString('en-IN')}` : `-₹${tx.amount.toLocaleString('en-IN')}`}
                        </div>
                        <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: '600' }}>
                          {tx.paymentMethod || 'Wallet'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}

        {/* Load More Button */}
        {filteredTransactions.length > visibleCount && (
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button
              type="button"
              onClick={() => setVisibleCount((prev) => prev + 10)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#10b981',
                fontWeight: '800',
                fontSize: '0.88rem',
                cursor: 'pointer',
              }}
            >
              Load More Transactions
            </button>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // VIEW 1: WALLET MAIN HOME SCREEN
  // ==========================================
  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      
      {/* Page Title */}
      <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '16px', color: 'var(--text-primary)' }}>
        NOROZZ Wallet
      </h2>

      {/* Screen 1 Balance Card (Matching screen-1-wallet) */}
      <div
        style={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 45%, #2563eb 100%)',
          color: '#ffffff',
          borderRadius: '24px',
          padding: '28px',
          boxShadow: '0 12px 30px rgba(16, 185, 129, 0.25)',
          marginBottom: '28px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ fontSize: '0.85rem', opacity: 0.9, fontWeight: '700', marginBottom: '6px' }}>Available Balance</div>
        <div style={{ fontSize: '2.6rem', fontWeight: '800', letterSpacing: '-0.5px', marginBottom: '18px' }}>
          ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
        </div>

        {/* + Add Money Button inside card */}
        <button
          type="button"
          onClick={() => setSubView('addMoney')}
          style={{
            background: '#0f172a',
            color: '#ffffff',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '9999px',
            fontSize: '0.88rem',
            fontWeight: '800',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            transition: 'transform 0.15s ease',
          }}
        >
          <Plus size={16} color="#10b981" /> Add Money
        </button>
      </div>

      {/* Recent Transactions Section */}
      <div className="mui-card" style={{ padding: '24px', borderRadius: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
            Recent Transactions
          </h3>
          <button
            type="button"
            onClick={() => setSubView('history')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#10b981',
              fontWeight: '800',
              fontSize: '0.84rem',
              cursor: 'pointer',
            }}
          >
            See All
          </button>
        </div>

        {transactions.length === 0 ? (
          <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Wallet size={32} style={{ margin: '0 auto 8px auto', opacity: 0.4 }} />
            <div style={{ fontSize: '0.88rem', fontWeight: '700' }}>No transactions yet</div>
            <div style={{ fontSize: '0.78rem', marginTop: '2px' }}>Add money to your wallet to get started!</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {transactions.slice(0, 5).map((tx, idx) => {
              const isCredit = tx.type === 'Credit';
              return (
                <div
                  key={tx.id || idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 0',
                    borderBottom: idx === Math.min(transactions.length, 5) - 1 ? 'none' : '1px solid var(--border-light)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        background: isCredit ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                        color: isCredit ? '#10b981' : '#ef4444',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {isCredit ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-primary)' }}>{tx.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {tx.formattedDate || tx.dateGroup}
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.98rem', fontWeight: '800', color: isCredit ? '#059669' : '#dc2626' }}>
                    {isCredit ? `+₹${tx.amount.toLocaleString('en-IN')}` : `-₹${tx.amount.toLocaleString('en-IN')}`}
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
