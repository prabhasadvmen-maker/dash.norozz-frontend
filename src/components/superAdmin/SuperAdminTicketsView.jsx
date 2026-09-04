import React, { useState, useEffect } from 'react';
import {
  Headphones,
  Search,
  Filter,
  RefreshCw,
  X,
  Trash2,
  Send,
  Building2,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageSquare
} from 'lucide-react';
import { superAdminService } from '../../services/superAdmin.service.js';
import { cityService } from '../../services/city.service.js';
import { toast } from '../../utils/toast.js';

const SuperAdminTicketsView = () => {
  const [tickets, setTickets] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cityFilter, setCityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Ticket Modal State
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const [newStatus, setNewStatus] = useState('Open');
  const [updating, setUpdating] = useState(false);

  const fetchCities = () => {
    cityService.getActiveCities()
      .then((res) => {
        const list = res.data?.data || res.data || [];
        if (Array.isArray(list)) setCities(list);
      })
      .catch(() => {});
  };

  const fetchTickets = () => {
    setLoading(true);
    superAdminService
      .getTickets({ city: cityFilter, status: statusFilter, search: searchQuery })
      .then((res) => {
        const list = res.data?.data || res.data || [];
        setTickets(Array.isArray(list) ? list : []);
      })
      .catch((err) => {
        console.error('Error fetching tickets:', err);
        toast.error('Failed to load support tickets');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCities();
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [cityFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTickets();
  };

  const handleOpenModal = (ticket) => {
    setSelectedTicket(ticket);
    setAdminNote(ticket.adminNote || '');
    setNewStatus(ticket.status || 'Open');
  };

  const handleUpdateTicket = async () => {
    if (!selectedTicket) return;
    setUpdating(true);
    try {
      await superAdminService.updateTicketStatus(selectedTicket._id, {
        status: newStatus,
        adminNote: adminNote,
        resolvedBy: 'Super Admin HQ'
      });
      toast.success(`Ticket #${selectedTicket.ticketId} updated successfully`);
      setSelectedTicket(null);
      fetchTickets();
    } catch (err) {
      toast.error('Failed to update ticket');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteTicket = async (id) => {
    if (!window.confirm('Are you sure you want to delete this support ticket?')) return;
    try {
      await superAdminService.deleteTicket(id);
      toast.success('Ticket deleted successfully');
      fetchTickets();
    } catch (err) {
      toast.error('Failed to delete ticket');
    }
  };

  // Stats calculation
  const totalCount = tickets.length;
  const openCount = tickets.filter(t => t.status === 'Open').length;
  const inProgressCount = tickets.filter(t => t.status === 'In Progress').length;
  const resolvedCount = tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Banner & Stats */}
      <div style={{ background: '#ffffff', borderRadius: '24px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: '900', margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Headphones size={26} color="#2563eb" /> Central Support Tickets & Complaint Resolution Center
            </h2>
            <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '4px 0 0 0' }}>
              Monitor and resolve all customer and partner support tickets across all platform cities.
            </p>
          </div>
          <button
            onClick={fetchTickets}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px', background: '#f1f5f9', border: '1px solid #cbd5e1', cursor: 'pointer', fontSize: '0.84rem', fontWeight: '700', color: '#334155' }}
          >
            <RefreshCw size={15} /> Refresh
          </button>
        </div>

        {/* 4 Stat Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Total Tickets</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0f172a', marginTop: '4px' }}>{totalCount}</div>
          </div>

          <div style={{ background: '#fee2e2', padding: '16px', borderRadius: '14px', border: '1px solid #fca5a5' }}>
            <div style={{ fontSize: '0.78rem', color: '#991b1b', fontWeight: '800', textTransform: 'uppercase' }}>Open Tickets</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#dc2626', marginTop: '4px' }}>{openCount}</div>
          </div>

          <div style={{ background: '#fffbe8', padding: '16px', borderRadius: '14px', border: '1px solid #fde68a' }}>
            <div style={{ fontSize: '0.78rem', color: '#92400e', fontWeight: '800', textTransform: 'uppercase' }}>In Progress</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#d97706', marginTop: '4px' }}>{inProgressCount}</div>
          </div>

          <div style={{ background: '#dcfce7', padding: '16px', borderRadius: '14px', border: '1px solid #86efac' }}>
            <div style={{ fontSize: '0.78rem', color: '#166534', fontWeight: '800', textTransform: 'uppercase' }}>Resolved / Closed</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#15803d', marginTop: '4px' }}>{resolvedCount}</div>
          </div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: '6px', background: '#ffffff', padding: '4px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
            {['all', 'Open', 'In Progress', 'Resolved'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  background: statusFilter === st ? '#2563eb' : 'transparent',
                  color: statusFilter === st ? '#ffffff' : '#64748b',
                  fontWeight: statusFilter === st ? '800' : '600',
                  fontSize: '0.84rem',
                  cursor: 'pointer'
                }}
              >
                {st === 'all' ? 'All' : st}
              </button>
            ))}
          </div>

          {/* City Filter Dropdown */}
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            style={{ padding: '8px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.86rem', outline: 'none', background: '#ffffff', fontWeight: '700' }}
          >
            <option value="all">🌍 All Cities</option>
            {cities.map((c) => (
              <option key={c._id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} style={{ position: 'relative', width: '320px' }}>
          <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search Ticket ID, Customer, Phone or City..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '10px 14px 10px 42px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.86rem', outline: 'none', background: '#ffffff' }}
          />
        </form>
      </div>

      {/* Tickets Table */}
      <div style={{ background: '#ffffff', borderRadius: '24px', border: '1px solid #e2e8f0', padding: '20px', overflowX: 'auto' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading support tickets...</div>
        ) : tickets.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            <Headphones size={36} color="#cbd5e1" style={{ marginBottom: '10px' }} />
            <div>No support tickets found matching your filter criteria.</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: '0.76rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '12px 14px' }}>Ticket ID</th>
                <th style={{ padding: '12px 14px' }}>Customer / Contact</th>
                <th style={{ padding: '12px 14px' }}>City Jurisdiction</th>
                <th style={{ padding: '12px 14px' }}>Category & Subject</th>
                <th style={{ padding: '12px 14px' }}>Priority</th>
                <th style={{ padding: '12px 14px' }}>Status</th>
                <th style={{ padding: '12px 14px' }}>Created Date</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => {
                const isResolved = ticket.status === 'Resolved' || ticket.status === 'Closed';
                const isInProgress = ticket.status === 'In Progress';
                return (
                  <tr
                    key={ticket._id}
                    style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.15s ease' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '14px', fontWeight: '900', color: '#2563eb' }}>
                      #{ticket.ticketId}
                    </td>

                    <td style={{ padding: '14px' }}>
                      <div style={{ fontWeight: '800', color: '#0f172a' }}>{ticket.userName || 'Customer'}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{ticket.userPhone || ticket.userEmail || 'No contact'}</div>
                    </td>

                    <td style={{ padding: '14px' }}>
                      <span style={{ fontSize: '0.78rem', background: '#eff6ff', color: '#1d4ed8', padding: '3px 10px', borderRadius: '8px', fontWeight: '800' }}>
                        📍 {ticket.city || 'Delhi NCR'}
                      </span>
                    </td>

                    <td style={{ padding: '14px', maxWidth: '260px' }}>
                      <span style={{ fontSize: '0.72rem', background: '#e2e8f0', padding: '2px 8px', borderRadius: '6px', fontWeight: '700', color: '#334155' }}>
                        {ticket.category}
                      </span>
                      <div style={{ fontWeight: '700', color: '#0f172a', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ticket.subject}
                      </div>
                    </td>

                    <td style={{ padding: '14px' }}>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: '800',
                        padding: '3px 8px',
                        borderRadius: '8px',
                        background: ticket.priority === 'High' || ticket.priority === 'Urgent' ? '#fee2e2' : '#f1f5f9',
                        color: ticket.priority === 'High' || ticket.priority === 'Urgent' ? '#991b1b' : '#475569'
                      }}>
                        {ticket.priority || 'Medium'}
                      </span>
                    </td>

                    <td style={{ padding: '14px' }}>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: '800',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        background: isResolved ? '#dcfce7' : isInProgress ? '#fef3c7' : '#fee2e2',
                        color: isResolved ? '#15803d' : isInProgress ? '#b45309' : '#b91c1c'
                      }}>
                        {ticket.status.toUpperCase()}
                      </span>
                    </td>

                    <td style={{ padding: '14px', fontSize: '0.8rem', color: '#64748b' }}>
                      {new Date(ticket.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>

                    <td style={{ padding: '14px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleOpenModal(ticket)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            border: '1px solid #2563eb',
                            background: '#eff6ff',
                            color: '#1d4ed8',
                            fontWeight: '800',
                            fontSize: '0.78rem',
                            cursor: 'pointer'
                          }}
                        >
                          Inspect & Reply
                        </button>
                        <button
                          onClick={() => handleDeleteTicket(ticket._id)}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '8px',
                            border: '1px solid #fee2e2',
                            background: '#fff5f5',
                            color: '#dc2626',
                            cursor: 'pointer'
                          }}
                          title="Delete Ticket"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Ticket Response & Status Modal */}
      {selectedTicket && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '24px', width: '100%', maxWidth: '640px', padding: '28px', border: '1px solid #e2e8f0', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: '900', color: '#2563eb' }}>#{selectedTicket.ticketId}</span>
                  <span style={{ fontSize: '0.78rem', background: '#e2e8f0', padding: '3px 8px', borderRadius: '6px', fontWeight: '700' }}>{selectedTicket.category}</span>
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: '#0f172a', margin: '6px 0 0 0' }}>{selectedTicket.subject}</h3>
              </div>
              <button onClick={() => setSelectedTicket(null)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '10px', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={18} color="#64748b" />
              </button>
            </div>

            {/* Ticket Info Card */}
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0', marginBottom: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.84rem' }}>
              <div>
                <div style={{ color: '#64748b', fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: '700' }}>Customer Name</div>
                <div style={{ fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>{selectedTicket.userName || 'Customer'}</div>
              </div>
              <div>
                <div style={{ color: '#64748b', fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: '700' }}>Phone / Email</div>
                <div style={{ fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>{selectedTicket.userPhone || selectedTicket.userEmail || 'N/A'}</div>
              </div>
              <div>
                <div style={{ color: '#64748b', fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: '700' }}>City Location</div>
                <div style={{ fontWeight: '800', color: '#2563eb', marginTop: '2px' }}>📍 {selectedTicket.city || 'Delhi NCR'}</div>
              </div>
              <div>
                <div style={{ color: '#64748b', fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: '700' }}>Booking Reference</div>
                <div style={{ fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>{selectedTicket.bookingId || 'None'}</div>
              </div>
            </div>

            {/* Customer Complaint Description */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#334155', display: 'block', marginBottom: '6px' }}>Detailed Customer Description</label>
              <div style={{ background: '#ffffff', padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.88rem', color: '#334155', lineHeight: '1.6' }}>
                {selectedTicket.description}
              </div>
            </div>

            {/* Status & Priority Selection */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#334155', display: 'block', marginBottom: '6px' }}>Update Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', background: '#fff' }}
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#334155', display: 'block', marginBottom: '6px' }}>Priority Level</label>
                <select
                  value={selectedTicket.priority || 'Medium'}
                  disabled
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.88rem', background: '#f8fafc' }}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
            </div>

            {/* Admin Response Note */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#334155', display: 'block', marginBottom: '6px' }}>Super Admin Resolution Reply / Note</label>
              <textarea
                rows={4}
                placeholder="Write official resolution notes to reply to customer..."
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', resize: 'vertical' }}
              />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontWeight: '700', fontSize: '0.88rem', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateTicket}
                disabled={updating}
                style={{ padding: '10px 24px', borderRadius: '10px', border: 'none', background: '#2563eb', color: '#ffffff', fontWeight: '800', fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Send size={16} /> Save Resolution & Update
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default SuperAdminTicketsView;
