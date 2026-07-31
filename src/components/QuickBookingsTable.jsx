import React from 'react';
import { CalendarCheck, MapPin, Clock, CheckCircle2, AlertCircle, Eye, Search, Filter } from 'lucide-react';

const QuickBookingsTable = () => {
  const bookings = [
    {
      id: 'UC-98214',
      customer: 'Ananya Deshmukh',
      phone: '+91 98765 43210',
      service: 'AC Deep Cleaning & Master Service',
      category: 'Appliance Repair',
      partner: 'Rajesh Kumar (Technician)',
      city: 'South Delhi, Delhi',
      date: 'Today, 04:30 PM',
      amount: '₹1,499',
      commission: '₹299 (20%)',
      status: 'In Progress'
    },
    {
      id: 'UC-98213',
      customer: 'Rohan Mehta',
      phone: '+91 98123 76543',
      service: 'Full Home Deep Cleaning (3 BHK)',
      category: 'Home Cleaning',
      partner: 'CleanPro Services',
      city: 'Bandra West, Mumbai',
      date: 'Today, 02:00 PM',
      amount: '₹4,999',
      commission: '₹999 (20%)',
      status: 'Completed'
    },
    {
      id: 'UC-98212',
      customer: 'Sneha Reddy',
      phone: '+91 97654 32109',
      service: 'Salon Glow Facial & Manicure',
      category: 'Beauty & Wellness',
      partner: 'Priya Sharma (Therapist)',
      city: 'Indiranagar, Bengaluru',
      date: 'Today, 06:00 PM',
      amount: '₹2,299',
      commission: '₹459 (20%)',
      status: 'Pending Partner'
    },
    {
      id: 'UC-98211',
      customer: 'Karan Kapoor',
      phone: '+91 99887 76655',
      service: 'Bathroom Plumbing & Tap Repair',
      category: 'Plumbing',
      partner: 'Amitabh Verma',
      city: 'Gachibowli, Hyderabad',
      date: 'Yesterday, 11:30 AM',
      amount: '₹799',
      commission: '₹159 (20%)',
      status: 'Completed'
    },
    {
      id: 'UC-98210',
      customer: 'Vikram Batra',
      phone: '+91 96543 21098',
      service: 'Sofa Shampoo & Anti-Allergen Cleaning',
      category: 'Home Cleaning',
      partner: 'Unassigned',
      city: 'Sector 62, Noida',
      date: 'Today, 08:00 PM',
      amount: '₹1,899',
      commission: '₹379 (20%)',
      status: 'Cancelled'
    },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return <span className="badge badge-success"><CheckCircle2 size={12} /> COMPLETED</span>;
      case 'In Progress':
        return <span className="badge badge-blue"><Clock size={12} /> IN PROGRESS</span>;
      case 'Pending Partner':
        return <span className="badge badge-warning"><Clock size={12} /> PENDING</span>;
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
            <CalendarCheck size={22} color="#2563eb" /> Recent Service Bookings
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Live customer service requests & dispatch status across operational cities
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button className="btn btn-secondary btn-sm">
            <Filter size={14} /> Filter Status
          </button>
        </div>
      </div>

      {/* Bookings Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              <th style={{ padding: '12px 14px' }}>BOOKING ID</th>
              <th style={{ padding: '12px 14px' }}>CUSTOMER</th>
              <th style={{ padding: '12px 14px' }}>SERVICE & CATEGORY</th>
              <th style={{ padding: '12px 14px' }}>PARTNER</th>
              <th style={{ padding: '12px 14px' }}>LOCATION</th>
              <th style={{ padding: '12px 14px' }}>AMOUNT & SHARE</th>
              <th style={{ padding: '12px 14px' }}>STATUS</th>
              <th style={{ padding: '12px 14px' }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '14px', fontWeight: '800', color: 'var(--accent-blue)', fontSize: '0.85rem' }}>
                  {booking.id}
                </td>
                <td style={{ padding: '14px' }}>
                  <div style={{ fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-primary)' }}>{booking.customer}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{booking.phone}</div>
                </td>
                <td style={{ padding: '14px' }}>
                  <div style={{ fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-primary)' }}>{booking.service}</div>
                  <span className="badge badge-purple" style={{ fontSize: '0.62rem', padding: '1px 6px', marginTop: '2px' }}>{booking.category}</span>
                </td>
                <td style={{ padding: '14px', fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                  {booking.partner}
                </td>
                <td style={{ padding: '14px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={12} color="#2563eb" /> {booking.city}
                  </div>
                </td>
                <td style={{ padding: '14px' }}>
                  <div style={{ fontWeight: '800', color: 'var(--text-primary)', fontSize: '0.88rem' }}>{booking.amount}</div>
                  <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: '700' }}>Commission: {booking.commission}</div>
                </td>
                <td style={{ padding: '14px' }}>
                  {getStatusBadge(booking.status)}
                </td>
                <td style={{ padding: '14px' }}>
                  <button className="btn btn-secondary btn-sm" title="View Booking Details">
                    <Eye size={14} color="#7c3aed" /> View
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

export default QuickBookingsTable;
