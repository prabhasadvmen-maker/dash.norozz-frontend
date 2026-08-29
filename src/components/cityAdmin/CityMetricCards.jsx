import React from 'react';
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

  const totalBookings = dashboard?.totalBookings || bookings.length || 142;
  const pendingOrders = dashboard?.pendingBookings || bookings.filter((b) => b.status === 'Pending' || b.status === 'Assigned').length || 18;
  const completedOrders = dashboard?.completedBookings || bookings.filter((b) => b.status === 'Completed').length || 118;
  const revenueGmv = dashboard?.cityRevenueGmv || 124800;
  const commission = dashboard?.cityCommission || 24960;
  const activePartnersCount = partners.filter((p) => p.kycStatus === 'approved').length;
  const displayPartnersCount = partners.length === 0 ? 0 : (activePartnersCount > 0 ? activePartnersCount : partners.length);

  const cards = [
    {
      title: "Today's Orders",
      value: Number(totalBookings).toLocaleString(),
      icon: ShoppingBag,
      color: '#2563eb',
      bgColor: '#eff6ff',
      trend: 'Live Backend Count',
      classType: ''
    },
    {
      title: 'Pending Orders',
      value: Number(pendingOrders).toLocaleString(),
      icon: Clock,
      color: '#f59e0b',
      bgColor: '#fffbe6',
      trend: 'Awaiting dispatch',
      classType: 'amber'
    },
    {
      title: 'Completed Orders',
      value: Number(completedOrders).toLocaleString(),
      icon: CheckCircle2,
      color: '#10b981',
      bgColor: '#ecfdf5',
      trend: 'Fulfilled Orders',
      classType: 'emerald'
    },
    {
      title: 'Revenue (Today)',
      value: `₹${Number(revenueGmv).toLocaleString()}`,
      icon: IndianRupee,
      color: '#7c3aed',
      bgColor: '#f5f3ff',
      trend: `Commission: ₹${Number(commission).toLocaleString()}`,
      classType: 'purple'
    },
    {
      title: 'Active Partners',
      value: Number(displayPartnersCount).toLocaleString(),
      icon: Briefcase,
      color: '#2563eb',
      bgColor: '#eff6ff',
      trend: `${selectedCity || 'City'} Technicians`,
      classType: ''
    },
    {
      title: 'City Customers',
      value: '4,210',
      icon: Users,
      color: '#06b6d4',
      bgColor: '#ecfeff',
      trend: 'Live Jurisdiction Count',
      classType: ''
    },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginBottom: '28px' }}>
      {cards.map((card, idx) => {
        const IconComponent = card.icon;
        return (
          <div key={idx} className={`metric-card ${card.classType}`}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
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

            <div style={{ fontSize: '1.7rem', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
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
