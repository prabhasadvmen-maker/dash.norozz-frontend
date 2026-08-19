import React, { useState } from 'react';
import { CalendarCheck, UserCheck, MapPin, XCircle } from 'lucide-react';
import { useCityAdmin } from '../../hooks/useCityAdmin.js';

const CityBookingDispatch = ({ assignedCity = 'Delhi NCR' }) => {
  const { bookings, partners, assignBooking, cancelBooking } = useCityAdmin();
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedPartnerId, setSelectedPartnerId] = useState('');
  const [cancelReason, setCancelReason] = useState('');

  const approvedPartners = partners.filter((p) => p.kycStatus === 'approved');

  const handleOpenAssign = (order) => {
    setSelectedOrder(order);
    if (approvedPartners.length > 0) {
      setSelectedPartnerId(approvedPartners[0]._id);
    }
    setAssignModalOpen(true);
  };

  const handleConfirmAssign = async (e) => {
    e.preventDefault();
    if (!selectedOrder || !selectedPartnerId) return;
    await assignBooking({ bookingId: selectedOrder._id, partnerId: selectedPartnerId });
    setAssignModalOpen(false);
  };

  const handleOpenCancel = (order) => {
    setSelectedOrder(order);
    setCancelReason('');
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    await cancelBooking({ bookingId: selectedOrder._id, reason: cancelReason });
    setCancelModalOpen(false);
  };

  return (
    <div className="mui-card" style={{ padding: '26px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CalendarCheck size={22} color="#7c3aed" /> Live Service Booking Dispatch ({assignedCity})
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Assign incoming customer service requests to verified local partners and field technicians.
          </p>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              <th style={{ padding: '12px 14px' }}>BOOKING REF</th>
              <th style={{ padding: '12px 14px' }}>CUSTOMER</th>
              <th style={{ padding: '12px 14px' }}>SERVICE REQUEST</th>
              <th style={{ padding: '12px 14px' }}>LOCALITY AREA</th>
              <th style={{ padding: '12px 14px' }}>ASSIGNED TECHNICIAN</th>
              <th style={{ padding: '12px 14px' }}>AMOUNT</th>
              <th style={{ padding: '12px 14px' }}>STATUS</th>
              <th style={{ padding: '12px 14px' }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No service bookings found in {assignedCity} dispatch queue.
                </td>
              </tr>
            ) : (
              bookings.map((o) => {
                const partnerName = o.partner?.name ? `${o.partner.name} (${o.partner.category || 'Specialist'})` : (o.partner?.agencyName || 'Unassigned');
                return (
                  <tr key={o._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '14px', fontWeight: '800', color: '#2563eb', fontSize: '0.85rem' }}>
                      {o.bookingNumber || o._id.substring(0, 8).toUpperCase()}
                    </td>
                    <td style={{ padding: '14px', fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                      {o.customer?.name || 'Ananya Deshmukh'}
                    </td>
                    <td style={{ padding: '14px', fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                      {o.serviceName || o.packageTitle || 'AC Service'}
                    </td>
                    <td style={{ padding: '14px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      <MapPin size={12} color="#2563eb" style={{ display: 'inline', marginRight: '4px' }} />
                      {o.address?.city || assignedCity}
                    </td>
                    <td style={{ padding: '14px', fontSize: '0.82rem', fontWeight: '700', color: partnerName === 'Unassigned' ? '#ef4444' : 'var(--text-primary)' }}>
                      {partnerName}
                    </td>
                    <td style={{ padding: '14px', fontWeight: '800', color: '#10b981', fontSize: '0.9rem' }}>
                      ₹{o.totalAmount || o.finalPrice || 599}
                    </td>
                    <td style={{ padding: '14px' }}>
                      <span className={`badge ${o.status === 'Pending' ? 'badge-warning' : o.status === 'Assigned' ? 'badge-purple' : 'badge-blue'}`}>
                        {o.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '14px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => handleOpenAssign(o)}
                          className="btn btn-primary btn-sm"
                          style={{ padding: '6px 10px', fontSize: '0.78rem' }}
                        >
                          <UserCheck size={14} /> Assign
                        </button>

                        <button
                          onClick={() => handleOpenCancel(o)}
                          className="btn btn-danger btn-sm"
                          style={{ padding: '6px 8px', fontSize: '0.75rem' }}
                          title="Cancel Booking"
                        >
                          <XCircle size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ASSIGN BOOKING MODAL */}
      {assignModalOpen && selectedOrder && (
        <div className="modal-overlay" onClick={() => setAssignModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '28px', maxWidth: '480px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserCheck size={20} color="#2563eb" /> Assign Booking {selectedOrder.bookingNumber || selectedOrder._id}
            </h3>

            <div style={{ padding: '14px', background: '#f8fafc', borderRadius: 'var(--radius-md)', marginBottom: '20px', fontSize: '0.85rem' }}>
              <div><strong>Customer:</strong> {selectedOrder.customer?.name || 'Customer'}</div>
              <div><strong>Service:</strong> {selectedOrder.serviceName || selectedOrder.packageTitle}</div>
              <div><strong>Jurisdiction:</strong> {assignedCity}</div>
            </div>

            <form onSubmit={handleConfirmAssign}>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">Select Verified City Technician / Service Partner</label>
                <select
                  className="form-select"
                  value={selectedPartnerId}
                  onChange={(e) => setSelectedPartnerId(e.target.value)}
                  required
                >
                  {approvedPartners.length === 0 ? (
                    <option value="">No Approved Partners Available in {assignedCity}</option>
                  ) : (
                    approvedPartners.map((p) => (
                      <option key={p._id} value={p._id}>{p.name} - {p.category || 'Technician'}</option>
                    ))
                  )}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setAssignModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={!selectedPartnerId}>Dispatch & Assign Partner</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CANCEL BOOKING MODAL */}
      {cancelModalOpen && selectedOrder && (
        <div className="modal-overlay" onClick={() => setCancelModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '28px', maxWidth: '480px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <XCircle size={20} color="#ef4444" /> Cancel Booking {selectedOrder.bookingNumber || selectedOrder._id}
            </h3>

            <form onSubmit={handleConfirmCancel}>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">Cancellation Reason</label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="e.g. Unavailability of partner or customer request"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setCancelModalOpen(false)}>Close</button>
                <button type="submit" className="btn btn-danger">Confirm Cancellation</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default CityBookingDispatch;
