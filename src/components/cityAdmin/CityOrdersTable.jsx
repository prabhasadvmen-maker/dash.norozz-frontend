import React from 'react';
import { ShoppingBag, Clock, CheckCircle2, AlertCircle, Eye, MapPin, Search, Loader2 } from 'lucide-react';
import { useCityAdmin } from '../../hooks/useCityAdmin.js';

const CityOrdersTable = ({ selectedCity }) => {
  const { bookings, isLoading } = useCityAdmin(selectedCity);

  const getStatusBadge = (status) => {
    const statusLower = (status || '').toLowerCase();
    if (statusLower === 'completed' || statusLower === 'confirmed') {
      return <span className="badge badge-success"><CheckCircle2 size={12} /> COMPLETED</span>;
    }
    if (statusLower === 'in progress' || statusLower === 'assigned') {
      return <span className="badge badge-blue"><Clock size={12} /> IN PROGRESS</span>;
    }
    if (statusLower === 'pending') {
      return <span className="badge badge-warning"><Clock size={12} /> PENDING DISPATCH</span>;
    }
    return <span className="badge badge-danger"><AlertCircle size={12} /> CANCELLED</span>;
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

      {/* Loading State */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          <Loader2 size={24} className="spin" style={{ display: 'inline-block' }} />
          <p style={{ marginTop: '12px' }}>Loading orders...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          <ShoppingBag size={32} style={{ opacity: 0.5, marginBottom: '12px' }} />
          <p>No orders in {selectedCity} yet</p>
        </div>
      ) : (
        /* Orders Table */
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
              {bookings.map((order) => (
                <tr key={order._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '14px', fontWeight: '800', color: 'var(--accent-blue)', fontSize: '0.85rem' }}>
                    {order.bookingId || order._id?.substring(0, 8)}
                  </td>
                  <td style={{ padding: '14px', fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                    {order.customer?.name || 'Customer'}
                  </td>
                  <td style={{ padding: '14px', fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                    {order.service?.name || 'Service'}
                  </td>
                  <td style={{ padding: '14px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {order.partner?.name || 'Unassigned'}
                  </td>
                  <td style={{ padding: '14px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={12} color="#2563eb" /> {order.address?.city || selectedCity}
                    </div>
                  </td>
                  <td style={{ padding: '14px', fontWeight: '800', color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                    ₹{Number(order.totalAmount || order.amount || 0).toLocaleString()}
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
      )}

    </div>
  );
};

export default CityOrdersTable;
