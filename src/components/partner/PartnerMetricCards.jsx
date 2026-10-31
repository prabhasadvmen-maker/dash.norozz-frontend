import { TrendingUp, CalendarCheck, CheckCircle2, Star } from 'lucide-react';
import { usePartner } from '../../hooks/usePartner.js';

const formatINR = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

const PartnerMetricCards = () => {
  const { dashboard, isLoading } = usePartner('dashboard');
  const metrics = dashboard?.metrics || {};

  const ratingValue = Number(metrics.rating);
  const hasRating = Number.isFinite(ratingValue) && ratingValue > 0;

  const cards = [
    {
      title: "Today's Earnings",
      value: formatINR(metrics.todayEarnings),
      subtitle: `${formatINR(metrics.monthlyEarnings)} this month`,
      icon: TrendingUp,
      color: '#059669',
      bgColor: '#ecfdf5',
    },
    {
      title: 'Active Jobs',
      value: Number(metrics.todaysJobs ?? 0).toLocaleString('en-IN'),
      subtitle: `${Number(metrics.pendingJobs ?? 0)} new request${Number(metrics.pendingJobs ?? 0) === 1 ? '' : 's'} open`,
      icon: CalendarCheck,
      color: '#2563eb',
      bgColor: '#eff6ff',
    },
    {
      title: 'Jobs Completed',
      value: Number(metrics.completedJobs ?? 0).toLocaleString('en-IN'),
      subtitle: 'All time',
      icon: CheckCircle2,
      color: '#7c3aed',
      bgColor: '#f5f3ff',
    },
    {
      title: 'Customer Rating',
      value: hasRating ? `${ratingValue.toFixed(1)} / 5` : 'No ratings yet',
      subtitle: hasRating ? 'Average of customer reviews' : 'Complete jobs to get rated',
      icon: Star,
      color: '#d97706',
      bgColor: '#fffbeb',
      small: !hasRating,
    },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '20px 22px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {card.title}
              </span>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: card.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={19} color={card.color} />
              </div>
            </div>

            {isLoading ? (
              <div style={{ height: '34px', width: '60%', borderRadius: '8px', background: '#f1f5f9' }} />
            ) : (
              <div style={{ fontSize: card.small ? '1.15rem' : '1.8rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px', lineHeight: 1.2, minHeight: '34px', display: 'flex', alignItems: 'center' }}>
                {card.value}
              </div>
            )}

            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600' }}>
              {card.subtitle}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PartnerMetricCards;
