import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  X,
  Landmark,
  AlertTriangle,
  Lock,
  Loader2,
  RefreshCw,
  Inbox,
  ChevronLeft,
  ChevronRight,
  Award,
} from 'lucide-react';
import { partnerService } from '../../services/partner.service.js';
import { payWithGateway } from '../../utils/razorpay.js';
import { toast } from '../../utils/toast.js';

const PAGE_SIZE = 10;
const DEPOSIT_PRESETS = [500, 1000, 2000, 5000];

const money = (value, decimals = false) =>
  `₹${Number(value || 0).toLocaleString('en-IN', decimals ? { minimumFractionDigits: 2, maximumFractionDigits: 2 } : { maximumFractionDigits: 2 })}`;

const compactMoney = (value) => {
  const n = Number(value || 0);
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}k`;
  return `₹${n}`;
};

const card = { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 1px 3px rgba(15,23,42,0.04)' };

// "+12%" / "-5%" / "0%" strings from the API -> chip
const ChangeChip = ({ text, versus }) => {
  const value = String(text || '0%');
  const up = value.startsWith('+') && value !== '+0%';
  const down = value.startsWith('-');
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: '600', color: '#64748b' }}>
      <span style={{ padding: '3px 10px', borderRadius: '9999px', fontWeight: '800', background: up ? '#f0fdf4' : down ? '#fef2f2' : '#f1f5f9', color: up ? '#15803d' : down ? '#b91c1c' : '#64748b' }}>
        {value}
      </span>
      vs {versus}
    </span>
  );
};

// Bars are scaled to the largest value in the series, so any amount fits the chart
const BarChart = ({ items, height = 160, highlightLast = false }) => {
  const max = Math.max(...items.map((i) => i.value), 0);
  const hasData = max > 0;
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', height: `${height}px`, borderBottom: '1px solid #e2e8f0', padding: '0 4px' }}>
        {items.map((item, idx) => {
          const barHeight = hasData ? Math.max((item.value / max) * (height - 28), item.value > 0 ? 6 : 3) : 3;
          const isHighlight = highlightLast ? idx === items.length - 1 : item.value === max && hasData;
          return (
            <div key={`${item.label}-${idx}`} style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%', gap: '4px' }}>
              {item.value > 0 && <span style={{ fontSize: '0.68rem', fontWeight: '700', color: '#475569' }}>{compactMoney(item.value)}</span>}
              <div
                title={`${item.label}: ${money(item.value)}`}
                style={{ width: '100%', maxWidth: '36px', height: `${barHeight}px`, borderRadius: '6px 6px 0 0', background: item.value > 0 ? (isHighlight ? '#059669' : '#a7f3d0') : '#e2e8f0' }}
              />
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: '10px', padding: '8px 4px 0' }}>
        {items.map((item, idx) => (
          <span key={`${item.label}-${idx}`} style={{ flex: 1, textAlign: 'center', fontSize: '0.74rem', fontWeight: '600', color: '#64748b' }}>{item.label}</span>
        ))}
      </div>
      {!hasData && <div style={{ textAlign: 'center', fontSize: '0.8rem', color: '#94a3b8', marginTop: '10px' }}>No earnings recorded for this period yet.</div>}
    </div>
  );
};

const Modal = ({ title, subtitle, onClose, children }) => {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        style={{ background: '#ffffff', borderRadius: '18px', padding: '24px', width: '100%', maxWidth: '440px', boxShadow: '0 24px 48px rgba(15,23,42,0.25)' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>{title}</h3>
            {subtitle && <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '3px 0 0 0' }}>{subtitle}</p>}
          </div>
          <button type="button" onClick={onClose} aria-label="Close" style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: '#f1f5f9', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <X size={16} color="#475569" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

const inputStyle = { width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '1rem', fontWeight: '700', outline: 'none', boxSizing: 'border-box' };

const PartnerWalletView = ({ currentUser, isApproved = true, onNavigateTab, onUpdateUser }) => {
  const queryClient = useQueryClient();
  const [timeframe, setTimeframe] = useState('overview'); // overview | daily | weekly | monthly
  const [txnFilter, setTxnFilter] = useState('all'); // all | Credit | Debit
  const [page, setPage] = useState(1);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [depositing, setDepositing] = useState(false);

  const walletQuery = useQuery({
    queryKey: ['partner', 'wallet'],
    queryFn: () => partnerService.getWallet(),
    enabled: isApproved,
    staleTime: 30 * 1000,
  });
  const earningsQuery = useQuery({
    queryKey: ['partner', 'earnings'],
    queryFn: () => partnerService.getEarnings(),
    enabled: isApproved,
    staleTime: 60 * 1000,
  });

  const wallet = walletQuery.data?.data || null;
  const earnings = earningsQuery.data?.data || null;

  const balance = Number(wallet?.walletBalance ?? currentUser?.walletBalance ?? 0);
  const bank = wallet?.bankDetails || {};
  const hasBank = Boolean(bank.accountNumber || bank.upiId);
  const bankLabel = bank.accountNumber
    ? `${bank.bankName || 'Bank account'} •••• ${String(bank.accountNumber).slice(-4)}`
    : bank.upiId
      ? `UPI ${bank.upiId}`
      : '';

  const transactions = useMemo(() => wallet?.transactions || [], [wallet]);
  const filteredTxns = useMemo(
    () => (txnFilter === 'all' ? transactions : transactions.filter((t) => t.type === txnFilter)),
    [transactions, txnFilter]
  );
  const totalPages = Math.max(1, Math.ceil(filteredTxns.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const pageTxns = filteredTxns.slice(pageStart, pageStart + PAGE_SIZE);

  const withdrawMutation = useMutation({
    mutationFn: (amount) => partnerService.requestWithdrawal(amount),
    onSuccess: (res) => {
      // Server error messages are already toasted by the axios interceptor; this is the success path only
      toast.success(res?.data?.message || res?.message || 'Withdrawal request submitted.');
      const newBalance = res?.data?.walletBalance;
      if (onUpdateUser && newBalance !== undefined) onUpdateUser({ ...currentUser, walletBalance: newBalance });
      setWithdrawOpen(false);
      setWithdrawAmount('');
      queryClient.invalidateQueries({ queryKey: ['partner'] });
    },
  });

  const handleWithdraw = (e) => {
    e.preventDefault();
    const amount = Number(withdrawAmount);
    if (!Number.isFinite(amount) || amount <= 0) return toast.error('Enter a valid withdrawal amount.');
    if (amount > balance) return toast.error(`Insufficient balance. Available: ${money(balance, true)}`);
    withdrawMutation.mutate(amount);
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    const amount = Number(depositAmount);
    if (!Number.isFinite(amount) || amount <= 0) return toast.error('Enter a valid deposit amount.');
    setDepositing(true);
    try {
      await payWithGateway({ type: 'wallet_recharge', amount, user: currentUser, description: 'NOROZZ partner wallet top-up' });
      toast.success(`${money(amount)} added to your wallet.`);
      setDepositOpen(false);
      setDepositAmount('');
      const fresh = await queryClient.fetchQuery({ queryKey: ['partner', 'wallet'], queryFn: () => partnerService.getWallet(), staleTime: 0 });
      const newBalance = fresh?.data?.walletBalance;
      if (onUpdateUser && newBalance !== undefined) onUpdateUser({ ...currentUser, walletBalance: newBalance });
      queryClient.invalidateQueries({ queryKey: ['partner'] });
    } catch (err) {
      // Gateway/cancel problems are Error instances; API failures are plain objects already toasted by axios
      if (err instanceof Error) toast.error(err.message);
    } finally {
      setDepositing(false);
    }
  };

  const refresh = () => {
    walletQuery.refetch();
    earningsQuery.refetch();
  };

  if (!isApproved) {
    return (
      <div style={{ ...card, padding: '40px 24px', textAlign: 'center', maxWidth: '560px' }}>
        <Lock size={32} color="#d97706" style={{ marginBottom: '10px' }} />
        <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: '#0f172a' }}>Wallet unlocks after KYC approval</h3>
        <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '6px 0 0 0' }}>Once your documents are verified by the City Admin, your earnings and payouts will appear here.</p>
      </div>
    );
  }

  const loadingWallet = walletQuery.isLoading;
  const periodTabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'daily', label: 'Today' },
    { key: 'weekly', label: 'This Week' },
    { key: 'monthly', label: 'This Month' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1100px' }}>
      {/* Balance hero */}
      <div style={{ background: 'linear-gradient(135deg, #064e3b 0%, #047857 60%, #059669 100%)', borderRadius: '18px', padding: '26px 28px', color: '#ffffff', boxShadow: '0 10px 28px rgba(5,150,105,0.22)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '18px' }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.9, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Wallet size={16} /> Available Balance
            </div>
            <div style={{ fontSize: '2.6rem', fontWeight: '800', letterSpacing: '-1px', marginTop: '6px', lineHeight: 1.1 }}>
              {loadingWallet ? '…' : money(balance, true)}
            </div>
            <div style={{ marginTop: '10px', fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {hasBank ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.14)', padding: '4px 12px', borderRadius: '9999px' }}>
                  <Landmark size={14} /> Payouts to {bankLabel}
                </span>
              ) : (
                <>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(254,240,138,0.18)', color: '#fef08a', padding: '4px 12px', borderRadius: '9999px' }}>
                    <AlertTriangle size={14} /> No bank account linked
                  </span>
                  <button type="button" onClick={() => onNavigateTab?.('bankDetails')} style={{ background: 'none', border: 'none', color: '#ffffff', textDecoration: 'underline', fontWeight: '700', cursor: 'pointer', fontSize: '0.84rem' }}>
                    Add bank details
                  </button>
                </>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setWithdrawOpen(true)}
              disabled={balance <= 0}
              title={balance <= 0 ? 'No balance available to withdraw' : undefined}
              style={{ padding: '11px 20px', background: '#ffffff', color: '#047857', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.9rem', cursor: balance <= 0 ? 'not-allowed' : 'pointer', opacity: balance <= 0 ? 0.7 : 1, display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <ArrowUpRight size={17} /> Withdraw
            </button>
            <button
              type="button"
              onClick={() => setDepositOpen(true)}
              style={{ padding: '11px 18px', background: 'rgba(255,255,255,0.16)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.35)', borderRadius: '10px', fontWeight: '700', fontSize: '0.88rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={16} /> Add Money
            </button>
          </div>
        </div>

        <div style={{ marginTop: '22px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.22)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
          {[
            { label: 'Security Deposit', value: wallet?.securityDeposit },
            { label: 'Pending Withdrawals', value: wallet?.pendingClearance },
            { label: 'Lifetime Earned', value: wallet?.totalEarned },
          ].map((s) => (
            <div key={s.label}>
              <div style={{ fontSize: '0.72rem', opacity: 0.8, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</div>
              <div style={{ fontSize: '1.15rem', fontWeight: '800', marginTop: '2px' }}>{loadingWallet ? '…' : money(s.value)}</div>
            </div>
          ))}
        </div>
      </div>

      {walletQuery.isError && (
        <div role="alert" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', padding: '12px 16px', borderRadius: '12px', background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', fontSize: '0.86rem', fontWeight: '600' }}>
          <span>Could not load your wallet. Balances shown may be out of date.</span>
          <button type="button" onClick={refresh} style={{ padding: '5px 14px', borderRadius: '8px', border: '1px solid #fca5a5', background: '#ffffff', color: '#b91c1c', fontWeight: '700', cursor: 'pointer' }}>Retry</button>
        </div>
      )}

      {/* Earnings insights */}
      <div style={{ ...card, padding: '22px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
          <h3 style={{ fontSize: '1.02rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Earnings Insights</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '10px', padding: '3px', border: '1px solid #e2e8f0' }}>
              {periodTabs.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTimeframe(t.key)}
                  aria-pressed={timeframe === t.key}
                  style={{ padding: '7px 14px', borderRadius: '8px', border: 'none', background: timeframe === t.key ? '#ffffff' : 'transparent', color: timeframe === t.key ? '#047857' : '#64748b', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer', boxShadow: timeframe === t.key ? '0 1px 3px rgba(15,23,42,0.1)' : 'none', whiteSpace: 'nowrap' }}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <button type="button" onClick={refresh} aria-label="Refresh wallet" title="Refresh" style={{ width: '36px', height: '36px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#ffffff', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
              <RefreshCw size={15} className={walletQuery.isFetching || earningsQuery.isFetching ? 'spin' : ''} />
            </button>
          </div>
        </div>

        {earningsQuery.isLoading ? (
          <div style={{ height: '200px', borderRadius: '12px', background: '#f8fafc' }} />
        ) : earningsQuery.isError || !earnings ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#64748b', fontSize: '0.88rem' }}>Earnings data is not available right now.</div>
        ) : (
          <>
            {timeframe === 'overview' && (
              <>
                <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Last 7 months</div>
                <BarChart highlightLast items={(earnings.overview?.monthlyTrend || []).map((m) => ({ label: m.month, value: m.val }))} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginTop: '18px' }}>
                  {[
                    { label: 'Total Jobs', value: Number(earnings.overview?.totalJobs ?? 0).toLocaleString('en-IN') },
                    { label: 'Average / Job', value: money(earnings.overview?.avgPerJob) },
                    { label: 'Total Earned', value: money(earnings.overview?.totalEarned) },
                  ].map((s) => (
                    <div key={s.label} style={{ background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '12px', padding: '14px 16px' }}>
                      <div style={{ fontSize: '0.74rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</div>
                      <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>{s.value}</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {timeframe === 'daily' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#64748b' }}>Earned today</div>
                    <div style={{ fontSize: '1.9rem', fontWeight: '800', color: '#047857' }}>{money(earnings.daily?.totalEarnedToday)}</div>
                  </div>
                  <ChangeChip text={earnings.daily?.percentageChange} versus="yesterday" />
                </div>
                <BarChart items={(earnings.daily?.hourlyActivity || []).map((h) => ({ label: h.hour, value: h.val }))} height={140} />
                <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '18px 0 8px' }}>Jobs completed today</div>
                {(earnings.daily?.completedJobs || []).length === 0 ? (
                  <div style={{ color: '#94a3b8', fontSize: '0.86rem', padding: '8px 0' }}>No jobs completed today yet.</div>
                ) : (
                  (earnings.daily.completedJobs).map((j, i) => (
                    <div key={`${j.id}-${i}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderTop: i === 0 ? 'none' : '1px solid #f1f5f9' }}>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#0f172a' }}>{j.serviceName}</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{j.customerName} • {j.time} • {j.id}</div>
                      </div>
                      <div style={{ fontWeight: '800', color: '#047857' }}>+ {money(j.amount)}</div>
                    </div>
                  ))
                )}
              </>
            )}

            {timeframe === 'weekly' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#64748b' }}>Earned this week</div>
                    <div style={{ fontSize: '1.9rem', fontWeight: '800', color: '#047857' }}>{money(earnings.weekly?.totalEarnedWeek)}</div>
                  </div>
                  <ChangeChip text={earnings.weekly?.percentageChange} versus="last week" />
                </div>
                <BarChart items={(earnings.weekly?.dailyBreakdown || []).map((d) => ({ label: d.day, value: d.val }))} />
                <div style={{ marginTop: '18px', display: 'flex', alignItems: 'center', gap: '12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '14px 16px' }}>
                  <Award size={22} color="#16a34a" />
                  <div>
                    <div style={{ fontWeight: '800', color: '#14532d', fontSize: '0.92rem' }}>Busiest day: {earnings.weekly?.busiestDay || 'None'}</div>
                    <div style={{ fontSize: '0.8rem', color: '#166534' }}>{earnings.weekly?.busiestDayDetails}</div>
                  </div>
                </div>
              </>
            )}

            {timeframe === 'monthly' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#64748b' }}>Earned this month</div>
                    <div style={{ fontSize: '1.9rem', fontWeight: '800', color: '#047857' }}>{money(earnings.monthly?.totalEarnedMonth)}</div>
                  </div>
                  <ChangeChip text={earnings.monthly?.percentageChange} versus="last month" />
                </div>
                <BarChart items={(earnings.monthly?.weeklyBreakdown || []).map((w) => ({ label: w.week, value: w.val }))} height={140} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginTop: '18px' }}>
                  {[
                    { label: 'Average / Week', value: money(earnings.monthly?.avgWeeklyEarned) },
                    { label: 'Active Days', value: `${earnings.monthly?.activeDays ?? 0} days` },
                  ].map((s) => (
                    <div key={s.label} style={{ background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '12px', padding: '14px 16px' }}>
                      <div style={{ fontSize: '0.74rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</div>
                      <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>{s.value}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Transaction ledger */}
      <div style={{ ...card, padding: '22px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.02rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Transaction History</h3>
          <div style={{ display: 'flex', gap: '6px' }}>
            {[{ k: 'all', l: 'All' }, { k: 'Credit', l: 'Credits' }, { k: 'Debit', l: 'Debits' }].map((f) => (
              <button
                key={f.k}
                type="button"
                onClick={() => { setTxnFilter(f.k); setPage(1); }}
                aria-pressed={txnFilter === f.k}
                style={{ padding: '6px 14px', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', border: `1px solid ${txnFilter === f.k ? '#059669' : '#e2e8f0'}`, background: txnFilter === f.k ? '#ecfdf5' : '#ffffff', color: txnFilter === f.k ? '#047857' : '#475569' }}
              >
                {f.l}
              </button>
            ))}
          </div>
        </div>

        <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '720px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', color: '#475569', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '800', borderBottom: '1px solid #e2e8f0' }}>
                {['Sr. No.', 'Date', 'Description', 'Category', 'Status'].map((h) => (
                  <th key={h} style={{ padding: '12px 10px', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
                <th style={{ padding: '12px 10px', textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {loadingWallet ? (
                <tr><td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}><Loader2 size={16} className="spin" style={{ verticalAlign: 'middle', marginRight: '8px' }} />Loading transactions…</td></tr>
              ) : pageTxns.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '40px 16px', textAlign: 'center', color: '#64748b' }}>
                    <Inbox size={28} color="#cbd5e1" style={{ display: 'block', margin: '0 auto 8px' }} />
                    <div style={{ fontWeight: '700' }}>{transactions.length === 0 ? 'No transactions yet' : 'No transactions match this filter'}</div>
                    {transactions.length === 0 && <div style={{ fontSize: '0.8rem', marginTop: '2px' }}>Completed job payouts will be credited here automatically.</div>}
                  </td>
                </tr>
              ) : (
                pageTxns.map((t, idx) => {
                  const credit = t.type === 'Credit';
                  const status = t.status || 'Completed';
                  const statusStyle = status === 'Pending' ? { bg: '#fffbeb', fg: '#b45309' } : status === 'Failed' ? { bg: '#fef2f2', fg: '#b91c1c' } : { bg: '#f0fdf4', fg: '#15803d' };
                  return (
                    <tr key={t.transactionId || t._id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 10px', color: '#64748b', fontWeight: '700', fontSize: '0.86rem' }}>{pageStart + idx + 1}</td>
                      <td style={{ padding: '12px 10px', fontSize: '0.82rem', color: '#334155', whiteSpace: 'nowrap' }}>
                        {t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                      <td style={{ padding: '12px 10px' }}>
                        <div style={{ fontWeight: '700', fontSize: '0.88rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {credit ? <ArrowDownLeft size={15} color="#16a34a" /> : <ArrowUpRight size={15} color="#dc2626" />}
                          {t.title || t.category || (credit ? 'Wallet credit' : 'Wallet debit')}
                        </div>
                        {t.transactionId && <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'monospace', marginTop: '2px' }}>{t.transactionId}</div>}
                      </td>
                      <td style={{ padding: '12px 10px', fontSize: '0.82rem', color: '#475569' }}>{t.category || '—'}</td>
                      <td style={{ padding: '12px 10px' }}>
                        <span style={{ padding: '3px 10px', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: '700', background: statusStyle.bg, color: statusStyle.fg }}>{status}</span>
                      </td>
                      <td style={{ padding: '12px 10px', textAlign: 'right', fontWeight: '800', fontSize: '0.92rem', color: credit ? '#15803d' : '#dc2626', whiteSpace: 'nowrap' }}>
                        {credit ? '+' : '−'} {money(t.amount, true)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {filteredTxns.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginTop: '14px' }}>
            <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: '600' }}>
              Showing {pageStart + 1}–{Math.min(pageStart + PAGE_SIZE, filteredTxns.length)} of {filteredTxns.length}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button type="button" onClick={() => setPage(safePage - 1)} disabled={safePage <= 1} aria-label="Previous page" style={{ width: '34px', height: '34px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#ffffff', cursor: safePage <= 1 ? 'default' : 'pointer', opacity: safePage <= 1 ? 0.45 : 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChevronLeft size={16} />
              </button>
              <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#334155', minWidth: '84px', textAlign: 'center' }}>Page {safePage} of {totalPages}</span>
              <button type="button" onClick={() => setPage(safePage + 1)} disabled={safePage >= totalPages} aria-label="Next page" style={{ width: '34px', height: '34px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#ffffff', cursor: safePage >= totalPages ? 'default' : 'pointer', opacity: safePage >= totalPages ? 0.45 : 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Withdraw modal */}
      {withdrawOpen && (
        <Modal title="Withdraw to Bank" subtitle="Your request is reviewed and then paid out to your account." onClose={() => !withdrawMutation.isPending && setWithdrawOpen(false)}>
          <form onSubmit={handleWithdraw} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '14px 16px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#166534', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Available balance</div>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#047857' }}>{money(balance, true)}</div>
            </div>

            {hasBank ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '0.86rem', fontWeight: '700', color: '#0f172a' }}>
                <Landmark size={16} color="#475569" /> {bankLabel}
              </div>
            ) : (
              <div style={{ padding: '12px 14px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', fontSize: '0.84rem', color: '#92400e', fontWeight: '600' }}>
                Add a bank account or UPI ID before requesting a withdrawal.{' '}
                <button type="button" onClick={() => { setWithdrawOpen(false); onNavigateTab?.('bankDetails'); }} style={{ background: 'none', border: 'none', color: '#b45309', fontWeight: '800', textDecoration: 'underline', cursor: 'pointer', padding: 0 }}>
                  Add now
                </button>
              </div>
            )}

            <div>
              <label htmlFor="wallet-withdraw-amount" style={{ fontSize: '0.82rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>Amount (₹)</label>
              <input
                id="wallet-withdraw-amount"
                type="number"
                inputMode="decimal"
                min="1"
                max={balance}
                step="0.01"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="Enter amount"
                required
                autoFocus
                style={inputStyle}
              />
              <button type="button" onClick={() => setWithdrawAmount(String(balance))} style={{ marginTop: '6px', background: 'none', border: 'none', color: '#047857', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer', padding: 0 }}>
                Withdraw full balance
              </button>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" onClick={() => setWithdrawOpen(false)} disabled={withdrawMutation.isPending} style={{ flex: 1, padding: '11px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
              <button type="submit" disabled={withdrawMutation.isPending || !hasBank} style={{ flex: 1.5, padding: '11px', background: '#059669', color: '#ffffff', border: 'none', borderRadius: '10px', fontWeight: '800', cursor: !hasBank ? 'not-allowed' : 'pointer', opacity: !hasBank ? 0.55 : 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                {withdrawMutation.isPending && <Loader2 size={15} className="spin" />}
                {withdrawMutation.isPending ? 'Submitting…' : 'Request Withdrawal'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add money modal */}
      {depositOpen && (
        <Modal title="Add Money to Wallet" subtitle="Pay securely online. The amount is credited after payment is verified." onClose={() => !depositing && setDepositOpen(false)}>
          <form onSubmit={handleDeposit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '14px 16px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#166534', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Current balance</div>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#047857' }}>{money(balance, true)}</div>
            </div>

            <div>
              <label htmlFor="wallet-deposit-amount" style={{ fontSize: '0.82rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>Amount (₹)</label>
              <input id="wallet-deposit-amount" type="number" inputMode="decimal" min="1" step="1" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} placeholder="Enter amount" required autoFocus style={inputStyle} />
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
                {DEPOSIT_PRESETS.map((amt) => (
                  <button key={amt} type="button" onClick={() => setDepositAmount(String(amt))} style={{ padding: '7px 14px', borderRadius: '9999px', border: `1px solid ${Number(depositAmount) === amt ? '#059669' : '#e2e8f0'}`, background: Number(depositAmount) === amt ? '#ecfdf5' : '#ffffff', color: Number(depositAmount) === amt ? '#047857' : '#334155', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer' }}>
                    ₹{amt.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" onClick={() => setDepositOpen(false)} disabled={depositing} style={{ flex: 1, padding: '11px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
              <button type="submit" disabled={depositing} style={{ flex: 1.5, padding: '11px', background: '#059669', color: '#ffffff', border: 'none', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                {depositing && <Loader2 size={15} className="spin" />}
                {depositing ? 'Processing…' : 'Proceed to Pay'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default PartnerWalletView;
