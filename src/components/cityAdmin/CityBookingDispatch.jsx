import React, { useState } from 'react';
import { CalendarCheck, UserCheck, MapPin, XCircle, Settings } from 'lucide-react';
import { useCityAdmin } from '../../hooks/useCityAdmin.js';

const CityBookingDispatch = ({ assignedCity = 'Delhi NCR' }) => {
  const { bookings, partners, assignBooking, cancelBooking } = useCityAdmin();
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedPartnerId, setSelectedPartnerId] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [activeDropdownId, setActiveDropdownId] = useState(null);

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
    <div style={{
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '20px',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
      padding: '26px'
    }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CalendarCheck size={22} color="#7c3aed" /> Live Service Booking Dispatch ({assignedCity})
          </h3>
          <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>
            Assign incoming customer service requests to verified local partners and field technicians.
          </p>
        </div>
      </div>

      {/* Table Container */}
      <div style={{ overflowX: 'auto', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#ffffff', width: '100%' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', tableLayout: 'auto' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <th style={{ padding: '12px 8px', fontWeight: '800', whiteSpace: 'nowrap', textAlign: 'center', width: '45px' }}>SR NO.</th>
              <th style={{ padding: '12px 10px', fontWeight: '800', whiteSpace: 'nowrap', width: '95px' }}>BOOKING REF</th>
              <th style={{ padding: '12px 10px', fontWeight: '800', whiteSpace: 'nowrap' }}>CUSTOMER</th>
              <th style={{ padding: '12px 10px', fontWeight: '800', whiteSpace: 'nowrap' }}>SERVICE REQUEST</th>
              <th style={{ padding: '12px 10px', fontWeight: '800', whiteSpace: 'nowrap' }}>LOCALITY</th>
              <th style={{ padding: '12px 10px', fontWeight: '800', whiteSpace: 'nowrap' }}>TECHNICIAN</th>
              <th style={{ padding: '12px 10px', fontWeight: '800', whiteSpace: 'nowrap', width: '75px' }}>AMOUNT</th>
              <th style={{ padding: '12px 10px', fontWeight: '800', whiteSpace: 'nowrap', width: '85px' }}>STATUS</th>
              <th style={{ padding: '12px 12px', fontWeight: '800', whiteSpace: 'nowrap', textAlign: 'center', minWidth: '70px', width: '70px' }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ padding: '32px', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
                  No service bookings found in {assignedCity} dispatch queue.
                </td>
              </tr>
            ) : (
              bookings.map((o, idx) => {
                let rawPartnerName = o.partner?.name || o.partner?.agencyName || 'Unassigned';
                rawPartnerName = rawPartnerName.replace(/\([0-9a-fA-F]{24}\)/g, '').trim();
                const isUnassigned = !o.partner || rawPartnerName.toLowerCase() === 'unassigned';

                return (
                  <tr key={o._id} style={{ borderBottom: '1px solid #f1f5f9', background: '#ffffff' }}>
                    <td style={{ padding: '12px 8px', fontWeight: '700', color: '#64748b', fontSize: '0.82rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      {idx + 1}
                    </td>
                    <td style={{ padding: '12px 10px', fontWeight: '800', color: '#2563eb', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                      {o.bookingNumber || o._id.substring(0, 8).toUpperCase()}
                    </td>
                    <td style={{ padding: '12px 10px', fontWeight: '800', fontSize: '0.84rem', color: '#0f172a', whiteSpace: 'nowrap', maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis' }} title={o.customer?.name}>
                      {o.customer?.name || 'Ananya Deshmukh'}
                    </td>
                    <td style={{ padding: '12px 10px', fontWeight: '700', fontSize: '0.82rem', color: '#0f172a', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={o.packageName || o.packageSnapshot?.title || (typeof o.service === 'object' ? o.service?.name : o.serviceName)}>
                      {o.packageName || o.packageSnapshot?.title || (typeof o.service === 'object' ? o.service?.name : o.serviceName || 'Service Package')}
                    </td>
                    <td style={{ padding: '12px 10px', fontSize: '0.8rem', fontWeight: '600', color: '#334155', whiteSpace: 'nowrap', maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <MapPin size={11} color="#2563eb" style={{ display: 'inline', marginRight: '3px' }} />
                      {o.address?.city || assignedCity}
                    </td>
                    <td style={{ padding: '12px 10px', fontSize: '0.8rem', fontWeight: '700', color: isUnassigned ? '#ef4444' : '#0f172a', whiteSpace: 'nowrap', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis' }} title={rawPartnerName}>
                      {isUnassigned ? 'Unassigned' : rawPartnerName}
                    </td>
                    <td style={{ padding: '12px 10px', fontWeight: '800', color: '#059669', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                      ₹{o.totalAmount || o.financialSnapshot?.customerPayable || o.amount || 599}
                    </td>
                    <td style={{ padding: '12px 10px', whiteSpace: 'nowrap' }}>
                      <span className={`badge ${o.status === 'Pending' ? 'badge-warning' : o.status === 'Assigned' ? 'badge-purple' : 'badge-blue'}`} style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                        {(o.status || 'PENDING').toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '12px 12px', textAlign: 'center', whiteSpace: 'nowrap', minWidth: '70px', width: '70px' }}>
                      <div style={{ position: 'relative', display: 'inline-block' }} onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => setActiveDropdownId(activeDropdownId === o._id ? null : o._id)}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            background: activeDropdownId === o._id ? '#e2e8f0' : '#f1f5f9',
                            border: '1px solid #cbd5e1',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            color: '#334155',
                            margin: '0 auto'
                          }}
                          title="Booking Actions"
                        >
                          <Settings size={16} />
                        </button>

                        {activeDropdownId === o._id && (
                          <div style={{
                            position: 'absolute',
                            right: 0,
                            top: '38px',
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.12)',
                            padding: '6px',
                            zIndex: 9999,
                            minWidth: '160px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px'
                          }}>
                            <button
                              type="button"
                              onClick={() => { setActiveDropdownId(null); handleOpenAssign(o); }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 10px',
                                fontSize: '0.8rem',
                                fontWeight: '700',
                                color: '#2563eb',
                                background: 'transparent',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                textAlign: 'left',
                                width: '100%'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = '#eff6ff'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              <UserCheck size={14} color="#2563eb" /> Assign Technician
                            </button>

                            <button
                              type="button"
                              onClick={() => { setActiveDropdownId(null); handleOpenCancel(o); }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 10px',
                                fontSize: '0.8rem',
                                fontWeight: '700',
                                color: '#dc2626',
                                background: 'transparent',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                textAlign: 'left',
                                width: '100%'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              <XCircle size={14} color="#dc2626" /> Cancel Booking
                            </button>
                          </div>
                        )}
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
              <div><strong>Package:</strong> {selectedOrder.packageName || selectedOrder.packageSnapshot?.title || selectedOrder.serviceName}</div>
              {selectedOrder.packageSnapshot?.duration && (
                <div><strong>Duration:</strong> {selectedOrder.packageSnapshot.duration}</div>
              )}
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
