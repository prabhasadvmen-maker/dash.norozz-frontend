import React from 'react';
import { Search, Filter, Shield, ShieldOff, Trash2, UserCheck, ShieldAlert, UserX, Crown } from 'lucide-react';

const UserTable = ({
  users,
  searchQuery,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  statusFilter,
  onStatusFilterChange,
  onRoleChange,
  onStatusToggle,
  onDeleteUser,
  currentUser
}) => {
  const getRoleBadge = (role) => {
    switch (role) {
      case 'superadmin':
        return <span className="badge badge-superadmin"><Crown size={12} /> SUPER ADMIN</span>;
      case 'admin':
        return <span className="badge badge-admin"><Shield size={12} /> ADMIN</span>;
      default:
        return <span className="badge badge-user">USER</span>;
    }
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
        <div style={{ position: 'relative', minWidth: '260px', flex: '1' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{ paddingLeft: '44px' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Filter size={14} color="var(--text-muted)" />
            <select
              className="form-select"
              value={roleFilter}
              onChange={(e) => onRoleFilterChange(e.target.value)}
              style={{ width: '140px', padding: '9px 12px', fontSize: '0.85rem' }}
            >
              <option value="all">All Roles</option>
              <option value="superadmin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>

          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            style={{ width: '130px', padding: '9px 12px', fontSize: '0.85rem' }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              <th style={{ padding: '14px 18px' }}>USER DETAILS</th>
              <th style={{ padding: '14px 18px' }}>ROLE</th>
              <th style={{ padding: '14px 18px' }}>STATUS</th>
              <th style={{ padding: '14px 18px' }}>ROLE CONTROL</th>
              <th style={{ padding: '14px 18px' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                  No users found matching current filters.
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const isSelf = currentUser?.id === user._id || currentUser?._id === user._id;

                return (
                  <tr
                    key={user._id}
                    style={{
                      borderBottom: '1px solid var(--glass-border)',
                    }}
                  >
                    {/* User Info */}
                    <td style={{ padding: '16px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: user.role === 'superadmin' ? 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)' : 'var(--bg-surface-elevated)',
                          border: '1px solid var(--glass-border)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '800',
                          color: '#fff',
                          fontSize: '0.9rem'
                        }}>
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                            {user.name} {isSelf && <span style={{ color: '#c084fc', fontSize: '0.75rem', marginLeft: '4px' }}>(You)</span>}
                          </div>
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td style={{ padding: '16px 18px' }}>
                      {getRoleBadge(user.role)}
                    </td>

                    {/* Status */}
                    <td style={{ padding: '16px 18px' }}>
                      {getStatusPill(user.status)}
                    </td>

                    {/* Change Role Dropdown */}
                    <td style={{ padding: '16px 18px' }}>
                      <select
                        className="form-select"
                        value={user.role}
                        onChange={(e) => onRoleChange(user._id, e.target.value)}
                        disabled={isSelf}
                        style={{ width: '135px', padding: '6px 10px', fontSize: '0.8rem' }}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        <option value="superadmin">Super Admin</option>
                      </select>
                    </td>

                    {/* Action Buttons */}
                    <td style={{ padding: '16px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        
                        {/* Status Toggle */}
                        <button
                          onClick={() => onStatusToggle(user._id, user.status === 'active' ? 'blocked' : 'active')}
                          disabled={isSelf}
                          className={`btn btn-sm ${user.status === 'active' ? 'btn-warning' : 'btn-success'}`}
                          title={user.status === 'active' ? 'Block Account' : 'Unblock Account'}
                        >
                          {user.status === 'active' ? <ShieldOff size={14} /> : <Shield size={14} />}
                        </button>

                        {/* Delete User */}
                        <button
                          onClick={() => onDeleteUser(user._id, user.name)}
                          disabled={isSelf}
                          className="btn btn-danger btn-sm"
                          title="Delete Account"
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

export default UserTable;
