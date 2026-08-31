import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  IndianRupee,
  Briefcase,
  Users,
} from 'lucide-react';
import { useCityAdmin } from '../../hooks/useCityAdmin.js';

const CityMetricCards = ({ selectedCity }) => {
  const { dashboard, partners, bookings, isLoading } = useCityAdmin();

  const totalBookings = dashboard?.totalBookings !== undefined ? dashboard.totalBookings : bookings.length;
  const pendingOrders = dashboard?.pendingBookings !== undefined ? dashboard.pendingBookings : bookings.filter((b) => ['pending', 'Pending', 'assigned', 'Assigned'].includes(b.status)).length;
  const completedOrders = dashboard?.completedBookings !== undefined ? dashboard.completedBookings : bookings.filter((b) => ['completed', 'Completed', 'confirmed', 'Confirmed'].includes(b.status)).length;

  let revenueGmv = dashboard?.cityRevenueGmv;
  if (revenueGmv === undefined || revenueGmv === null) {
    revenueGmv = bookings.reduce((sum, b) => sum + (Number(b.totalAmount || b.financialSnapshot?.customerPayable || b.amount) || 0), 0);
  }
  const commission = dashboard?.cityCommission !== undefined ? dashboard.cityCommission : Math.round(revenueGmv * 0.20);

  const activePartnersCount = partners.filter((p) => (p.kycStatus || '').toLowerCase() === 'approved').length;
  const displayPartnersCount = partners.length;
  const cityCustomersCount = dashboard?.metrics?.cityCustomers !== undefined ? dashboard.metrics.cityCustomers : (dashboard?.cityCustomers || 0);

  const cards = [
    {
      title: "Today's Orders",
      value: Number(totalBookings).toLocaleString(),
      icon: ShoppingBag,
      color: '#2563eb',
      bgColor: '#eff6ff',
      trend: 'Live Backend Count',
    },
    {
      title: 'Pending Orders',
      value: Number(pendingOrders).toLocaleString(),
      icon: Clock,
      color: '#f59e0b',
      bgColor: '#fffbe6',
      trend: 'Awaiting dispatch',
    },
    {
      title: 'Completed Orders',
      value: Number(completedOrders).toLocaleString(),
      icon: CheckCircle2,
      color: '#10b981',
      bgColor: '#ecfdf5',
      trend: 'Fulfilled Orders',
    },
    {
      title: 'Revenue (Today)',
      value: `₹${Number(revenueGmv).toLocaleString()}`,
      icon: IndianRupee,
      color: '#7c3aed',
      bgColor: '#f5f3ff',
      trend: `Commission: ₹${Number(commission).toLocaleString()}`,
    },
    {
      title: 'Active Partners',
      value: Number(activePartnersCount > 0 ? activePartnersCount : displayPartnersCount).toLocaleString(),
      icon: Briefcase,
      color: '#2563eb',
      bgColor: '#eff6ff',
      trend: `${selectedCity || 'City'} Technicians`,
    },
    {
      title: 'City Customers',
      value: Number(cityCustomersCount).toLocaleString(),
      icon: Users,
      color: '#06b6d4',
      bgColor: '#ecfeff',
      trend: 'Live Jurisdiction Count',
    },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginBottom: '28px' }}>
      {cards.map((card, idx) => {
        const IconComponent = card.icon;
        return (
          <div
            key={idx}
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
              transition: 'transform 0.2s ease, boxShadow 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {card.title}
              </span>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: card.bgColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <IconComponent size={20} color={card.color} />
              </div>
            </div>

            <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.5px' }}>
              {isLoading ? '...' : card.value}
            </div>

            <div style={{ fontSize: '0.74rem', color: card.color, fontWeight: '700', marginTop: '6px' }}>
              {card.trend}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CityMetricCards;
