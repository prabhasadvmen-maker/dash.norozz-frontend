import React from 'react';
import { Search, Shield, ShieldOff, Edit3, Trash2, Crown, UserCheck, UserX, ShieldCheck } from 'lucide-react';

const AdminTable = ({
  admins,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onEditAdmin,
  onStatusToggle,
  onDeleteAdmin,
  currentUser
}) => {

  const getRoleBadge = (role) => {
    if (role === 'superadmin') {
      return <span className="badge badge-superadmin"><Crown size={12} /> SUPER ADMIN</span>;
    }
    return <span className="badge badge-admin"><ShieldCheck size={12} /> ADMIN</span>;
  };

  const getStatusPill = (status) => {
    if (status === 'active') {
      return (
        <span className="badge badge-active">
          <span className="dot-pulse dot-pulse-active" style={{ marginRight: '4px' }}></span> ACTIVE
        </span>
      );
    }
    return (
      <span className="badge badge-blocked">
        <span className="dot-pulse dot-pulse-blocked" style={{ marginRight: '4px' }}></span> BLOCKED
      </span>
    );
  };

  return (
    <div className="glass-panel" style={{ padding: '26px' }}>
      
      {/* Table Controls */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        marginBottom: '22px'
      }}>
        <div style={{ position: 'relative', minWidth: '280px', flex: '1' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search admins by name or email..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{ paddingLeft: '44px', borderRadius: 'var(--radius-md)' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            style={{ width: '150px', padding: '9px 14px', fontSize: '0.85rem' }}
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="blocked">Blocked Only</option>
          </select>
        </div>
      </div>

      {/* Admin Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              <th style={{ padding: '14px 18px' }}>ADMIN DETAILS</th>
              <th style={{ padding: '14px 18px' }}>ROLE</th>
              <th style={{ padding: '14px 18px' }}>STATUS</th>
              <th style={{ padding: '14px 18px' }}>LAST ACTIVITY</th>
              <th style={{ padding: '14px 18px' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {admins.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                  No Admin accounts found matching filter criteria.
                </td>
              </tr>
            ) : (
              admins.map((admin) => {
                const isSelf = currentUser?.id === admin._id || currentUser?._id === admin._id;

                return (
                  <tr
                    key={admin._id}
                    style={{
                      borderBottom: '1px solid var(--glass-border)',
                    }}
                  >
                    {/* Admin Profile */}
                    <td style={{ padding: '16px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '50%',
                          background: admin.role === 'superadmin' ? 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)' : 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '800',
                          color: '#fff',
                          boxShadow: '0 0 18px rgba(99,102,241,0.35)',
                          border: '2px solid rgba(255,255,255,0.2)'
                        }}>
                          {admin.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                            {admin.name} {isSelf && <span style={{ color: '#c084fc', fontSize: '0.75rem', marginLeft: '4px' }}>(You)</span>}
                          </div>
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                            {admin.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td style={{ padding: '16px 18px' }}>
                      {getRoleBadge(admin.role)}
                    </td>

                    {/* Status */}
                    <td style={{ padding: '16px 18px' }}>
                      {getStatusPill(admin.status)}
                    </td>

                    {/* Last Login */}
                    <td style={{ padding: '16px 18px', fontSize: '0.82rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                      {admin.lastLogin ? new Date(admin.lastLogin).toLocaleString() : 'Never logged in'}
                    </td>

                    {/* CRUD Actions */}
                    <td style={{ padding: '16px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        
                        {/* Edit Action */}
                        <button
                          onClick={() => onEditAdmin(admin)}
                          className="btn btn-secondary btn-sm"
                          title="Edit Admin Details"
                        >
                          <Edit3 size={14} color="#a5b4fc" /> Edit
                        </button>

                        {/* Status Toggle */}
                        <button
                          onClick={() => onStatusToggle(admin._id, admin.status === 'active' ? 'blocked' : 'active')}
                          disabled={isSelf}
                          className={`btn btn-sm ${admin.status === 'active' ? 'btn-warning' : 'btn-success'}`}
                          title={admin.status === 'active' ? 'Block Admin' : 'Unblock Admin'}
                        >
                          {admin.status === 'active' ? <ShieldOff size={14} /> : <Shield size={14} />}
                        </button>

                        {/* Delete Admin */}
                        <button
                          onClick={() => onDeleteAdmin(admin._id, admin.name)}
                          disabled={isSelf}
                          className="btn btn-danger btn-sm"
                          title="Delete Admin"
                        >
                          <Trash2 size={14} />
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

    </div>
  );
};

export default AdminTable;
