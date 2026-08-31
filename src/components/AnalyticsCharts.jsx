import {
  TrendingUp,
  BarChart2,
  Award,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

const AnalyticsCharts = () => {
  const topServices = [
    { rank: 1, name: 'AC Deep Cleaning & Service', bookings: '3,420', revenue: '₹41,04,000', rating: '4.9 ⭐', color: '#10b981' },
    { rank: 2, name: 'Full Home Deep Cleaning', bookings: '2,890', revenue: '₹34,68,000', rating: '4.8 ⭐', color: '#059669' },
    { rank: 3, name: 'Salon for Women - Facial & Spa', bookings: '2,150', revenue: '₹25,80,000', rating: '4.9 ⭐', color: '#0284c7' },
    { rank: 4, name: 'Plumbing Repair & Leak Fixing', bookings: '1,840', revenue: '₹14,72,000', rating: '4.7 ⭐', color: '#06b6d4' },
    { rank: 5, name: 'Washing Machine Repair', bookings: '1,210', revenue: '₹9,68,000', rating: '4.8 ⭐', color: '#d97706' },
  ];

  const topPartners = [
    { name: 'Rajesh Sharma', profession: 'AC & Appliance Technician', city: 'Jaipur', earnings: '₹1,48,500', rating: '4.95', completed: '240' },
    { name: 'Priya Verma', profession: 'Beauty & Wellness Specialist', city: 'Delhi NCR', earnings: '₹1,26,000', rating: '4.92', completed: '198' },
    { name: 'Vikram Singh', profession: 'Master Plumber', city: 'Mumbai', earnings: '₹1,12,400', rating: '4.88', completed: '175' },
    { name: 'Suresh Kumar', profession: 'Electrician Specialist', city: 'Bengaluru', earnings: '₹98,200', rating: '4.85', completed: '152' },
  ];

  const financialTrends = [
    { month: 'Jan', revenue: 4.2, expenses: 1.1 },
    { month: 'Feb', revenue: 5.1, expenses: 1.3 },
    { month: 'Mar', revenue: 4.8, expenses: 1.2 },
    { month: 'Apr', revenue: 5.9, expenses: 1.4 },
    { month: 'May', revenue: 6.4, expenses: 1.6 },
    { month: 'Jun', revenue: 6.9, expenses: 1.7 },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
      
      {/* 1. Category Revenue Distribution */}
      <div style={{
        background: '#ffffff',
        borderRadius: '20px',
        padding: '26px',
        border: '1px solid #f0f0f0',
        boxShadow: '0 8px 26px rgba(0, 0, 0, 0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart2 size={20} color="#10b981" /> Category Revenue Distribution
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px', fontWeight: '500' }}>
              Monthly revenue share across top service categories
            </p>
          </div>
          <span style={{
            fontSize: '0.7rem',
            fontWeight: '700',
            padding: '3px 10px',
            borderRadius: '9999px',
            background: '#ecfdf5',
            color: '#047857',
            border: '1px solid #a7f3d0'
          }}>
            Live Share
          </span>
        </div>

        {/* Custom Visual Distribution Bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '14px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>
              <span>AC & Appliance Repair</span>
              <span style={{ color: '#10b981' }}>38% • ₹41.0L</span>
            </div>
            <div style={{ height: '10px', background: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden' }}>
              <div style={{ width: '38%', height: '100%', background: 'linear-gradient(90deg, #10b981, #059669)', borderRadius: '9999px' }} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>
              <span>Home Deep Cleaning</span>
              <span style={{ color: '#0284c7' }}>28% • ₹34.6L</span>
            </div>
            <div style={{ height: '10px', background: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden' }}>
              <div style={{ width: '28%', height: '100%', background: 'linear-gradient(90deg, #0284c7, #0369a1)', borderRadius: '9999px' }} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>
              <span>Beauty & Spa for Women</span>
              <span style={{ color: '#8b5cf6' }}>20% • ₹25.8L</span>
            </div>
            <div style={{ height: '10px', background: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden' }}>
              <div style={{ width: '20%', height: '100%', background: 'linear-gradient(90deg, #8b5cf6, #6d28d9)', borderRadius: '9999px' }} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>
              <span>Plumbing & Electrician</span>
              <span style={{ color: '#d97706' }}>14% • ₹18.2L</span>
            </div>
            <div style={{ height: '10px', background: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden' }}>
              <div style={{ width: '14%', height: '100%', background: 'linear-gradient(90deg, #d97706, #b45309)', borderRadius: '9999px' }} />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Platform Financial Growth Trend */}
      <div style={{
        background: '#ffffff',
        borderRadius: '20px',
        padding: '26px',
        border: '1px solid #f0f0f0',
        boxShadow: '0 8px 26px rgba(0, 0, 0, 0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={20} color="#059669" /> Platform Financial Growth Trend
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px', fontWeight: '500' }}>
              Monthly Gross Revenue vs Operating Expense (₹ Lakhs)
            </p>
          </div>
          <span style={{
            fontSize: '0.7rem',
            fontWeight: '700',
            padding: '3px 10px',
            borderRadius: '9999px',
            background: '#ffe4e6',
            color: '#be123c',
            border: '1px solid #fecdd3'
          }}>
            Live Trend
          </span>
        </div>

        {/* Visual Dual Bar Chart */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '170px', paddingTop: '20px', borderBottom: '1px solid #f1f5f9' }}>
          {financialTrends.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '130px' }}>
                {/* Revenue Bar */}
                <div style={{
                  width: '16px',
                  height: `${(item.revenue / 7) * 100}%`,
                  background: '#047857',
                  borderRadius: '4px 4px 0 0',
                  transition: 'all 0.3s ease'
                }} title={`Revenue: ₹${item.revenue}L`} />
                {/* Expenses Bar */}
                <div style={{
                  width: '10px',
                  height: `${(item.expenses / 7) * 100}%`,
                  background: '#f87171',
                  borderRadius: '4px 4px 0 0',
                  transition: 'all 0.3s ease'
                }} title={`Expenses: ₹${item.expenses}L`} />
              </div>
              <span style={{ fontSize: '0.76rem', fontWeight: '700', color: '#64748b' }}>{item.month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Top Services Ranking */}
      <div style={{
        background: '#ffffff',
        borderRadius: '20px',
        padding: '26px',
        border: '1px solid #f0f0f0',
        boxShadow: '0 8px 26px rgba(0, 0, 0, 0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={20} color="#10b981" /> Top Services Ranking
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px', fontWeight: '500' }}>
              Highest booked service categories this month
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {topServices.map((item) => (
            <div key={item.rank} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              background: '#f8fafc',
              borderRadius: '14px',
              border: '1px solid #f1f5f9'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontWeight: '800', color: item.color, fontSize: '0.9rem', width: '20px' }}>#{item.rank}</span>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0f172a' }}>{item.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.bookings} Bookings • {item.rating}</div>
                </div>
              </div>
              <span style={{ fontWeight: '800', color: '#0f172a', fontSize: '0.9rem' }}>{item.revenue}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Top Partners (Verified Professionals) */}
      <div style={{
        background: '#ffffff',
        borderRadius: '20px',
        padding: '26px',
        border: '1px solid #f0f0f0',
        boxShadow: '0 8px 26px rgba(0, 0, 0, 0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={20} color="#d97706" /> Top Partners (Service Professionals)
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px', fontWeight: '500' }}>
              Highest rated verified service partners
            </p>
          </div>
          <span style={{
            fontSize: '0.7rem',
            fontWeight: '700',
            padding: '3px 10px',
            borderRadius: '9999px',
            background: '#e6f4ea',
            color: '#047857',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <ShieldCheck size={12} /> VERIFIED
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {topPartners.map((partner, idx) => (
            <div key={idx} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              background: '#f8fafc',
              borderRadius: '14px',
              border: '1px solid #f1f5f9'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '800',
                  fontSize: '0.85rem'
                }}>
                  {partner.name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0f172a' }}>{partner.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{partner.profession} • {partner.city}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.88rem', fontWeight: '800', color: '#10b981' }}>{partner.earnings}</div>
                <div style={{ fontSize: '0.75rem', color: '#d97706', fontWeight: '700' }}>⭐ {partner.rating} ({partner.completed} Jobs)</div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default AnalyticsCharts;
