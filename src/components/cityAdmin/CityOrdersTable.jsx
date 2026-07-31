import React from 'react';
import { ShoppingBag, Clock, CheckCircle2, AlertCircle, Eye, MapPin, Search } from 'lucide-react';

const CityOrdersTable = ({ selectedCity }) => {
  const cityOrders = [
    {
      id: 'DEL-9912',
      customer: 'Aarav Gupta',
      service: 'AC Jet Deep Cleaning',
      partner: 'Rajesh Kumar (Active)',
      locality: 'Connaught Place, Delhi',
      amount: '₹1,299',
      status: 'In Progress',
      time: 'Today, 03:15 PM'
    },
    {
      id: 'DEL-9911',
      customer: 'Simran Kaur',
      service: 'Full Home Deep Cleaning',
      partner: 'CleanPro Services',
      locality: 'South Extension, Delhi',
      amount: '₹4,499',
      status: 'Completed',
      time: 'Today, 01:30 PM'
    },
    {
      id: 'DEL-9910',
      customer: 'Nikhil Saxena',
      phone: '+91 98112 33445',
      service: 'Tap Leakage & Pipe Repair',
      partner: 'Amitabh Verma',
      locality: 'Dwarka Sector 10, Delhi',
      amount: '₹699',
      status: 'Completed',
      time: 'Today, 11:00 AM'
    },
    {
      id: 'DEL-9909',
      customer: 'Meera Chawla',
      service: 'Salon Glow Facial',
      partner: 'Priya Sharma',
      locality: 'Vasant Kunj, Delhi',
      amount: '₹2,199',
      status: 'Pending Partner',
      time: 'Today, 05:00 PM'
    },
    {
      id: 'DEL-9908',
      customer: 'Rahul Verma',
      service: 'Washing Machine Inspection',
      partner: 'Unassigned',
      locality: 'Rohini Sector 7, Delhi',
      amount: '₹499',
      status: 'Cancelled',
      time: 'Yesterday'
    },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return <span className="badge badge-success"><CheckCircle2 size={12} /> COMPLETED</span>;
      case 'In Progress':
        return <span className="badge badge-blue"><Clock size={12} /> IN PROGRESS</span>;
      case 'Pending Partner':
        return <span className="badge badge-warning"><Clock size={12} /> PENDING DISPATCH</span>;
      default:
        return <span className="badge badge-danger"><AlertCircle size={12} /> CANCELLED</span>;
    }
  };

  return (
    <div className="mui-card" style={{ padding: '26px' }}>
      
      {/* Table Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingBag size={22} color="#2563eb" /> Live City Orders Dispatch ({selectedCity || 'Delhi NCR'})
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Real-time local customer orders & technician assignments
          </p>
        </div>

        <div style={{ position: 'relative', width: '260px' }}>
          <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search city orders..."
            style={{ paddingLeft: '36px', padding: '8px 12px 8px 36px', fontSize: '0.82rem' }}
          />
        </div>
      </div>

      {/* Orders Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              <th style={{ padding: '12px 14px' }}>ORDER ID</th>
              <th style={{ padding: '12px 14px' }}>CUSTOMER</th>
              <th style={{ padding: '12px 14px' }}>SERVICE</th>
              <th style={{ padding: '12px 14px' }}>ASSIGNED PARTNER</th>
              <th style={{ padding: '12px 14px' }}>LOCALITY</th>
              <th style={{ padding: '12px 14px' }}>AMOUNT</th>
              <th style={{ padding: '12px 14px' }}>STATUS</th>
              <th style={{ padding: '12px 14px' }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {cityOrders.map((order) => (
              <tr key={order.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '14px', fontWeight: '800', color: 'var(--accent-blue)', fontSize: '0.85rem' }}>
                  {order.id}
                </td>
                <td style={{ padding: '14px', fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                  {order.customer}
                </td>
                <td style={{ padding: '14px', fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                  {order.service}
                </td>
                <td style={{ padding: '14px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  {order.partner}
                </td>
                <td style={{ padding: '14px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={12} color="#2563eb" /> {order.locality}
                  </div>
                </td>
                <td style={{ padding: '14px', fontWeight: '800', color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                  {order.amount}
                </td>
                <td style={{ padding: '14px' }}>
                  {getStatusBadge(order.status)}
                </td>
                <td style={{ padding: '14px' }}>
                  <button className="btn btn-secondary btn-sm" title="View Order Details">
                    <Eye size={14} color="#7c3aed" /> Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default CityOrdersTable;
