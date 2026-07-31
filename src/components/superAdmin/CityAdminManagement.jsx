import React, { useState } from 'react';
import { Building2, Plus, KeyRound, MapPin, Power, Search, Edit3, Trash2 } from 'lucide-react';
import CityAdminModal from './CityAdminModal';
import { useSuperAdmin } from '../../hooks/useSuperAdmin.js';

const CityAdminManagement = () => {
  const { cityAdmins, createCityAdmin, updateCityAdminStatus, deleteCityAdmin } = useSuperAdmin();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit' | 'resetPassword'
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const displayAdmins = cityAdmins;

  const filteredAdmins = displayAdmins.filter(
    (a) =>
      a.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.assignedCity?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenCreate = () => {
    setSelectedAdmin(null);
    setModalMode('create');
    setModalOpen(true);
  };

  const handleOpenEdit = (admin) => {
    setSelectedAdmin(admin);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleOpenResetPassword = (admin) => {
    setSelectedAdmin(admin);
    setModalMode('resetPassword');
    setModalOpen(true);
  };

  const handleToggleStatus = async (admin) => {
    const newStatus = admin.status === 'active' ? 'inactive' : 'active';
    await updateCityAdminStatus({ id: admin._id, status: newStatus });
  };

  const handleModalSubmit = async (formData, adminId, mode) => {
    if (mode === 'create') {
      await createCityAdmin(formData);
    }
    setModalOpen(false);
  };

  return (
    <div className="mui-card" style={{ padding: '26px' }}>
      
      {/* Header Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 size={22} color="#7c3aed" /> City Admins & Operational Coverage
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Create City Admins, assign operational cities, reset passwords, and manage access rights
          </p>
        </div>

        <button onClick={handleOpenCreate} className="btn btn-primary">
          <Plus size={16} /> Create City Admin
        </button>
      </div>

      {/* Search Input */}
      <div style={{ position: 'relative', width: '300px', marginBottom: '20px' }}>
        <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
        <input
          type="text"
          className="form-input"
          placeholder="Filter by admin name or city..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ paddingLeft: '36px', fontSize: '0.85rem' }}
        />
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              <th style={{ padding: '12px 14px' }}>ADMIN NAME</th>
              <th style={{ padding: '12px 14px' }}>OFFICIAL EMAIL</th>
              <th style={{ padding: '12px 14px' }}>ASSIGNED CITY</th>
              <th style={{ padding: '12px 14px' }}>STATUS</th>
              <th style={{ padding: '12px 14px' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredAdmins.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No City Admins found. Click 'Create City Admin' to add one.
                </td>
              </tr>
            ) : (
              filteredAdmins.map((admin) => {
                const isActive = admin.status === 'active';
                return (
                  <tr key={admin._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '14px', fontWeight: '800', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                      {admin.name}
                    </td>
                    <td style={{ padding: '14px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {admin.email}
                    </td>
                    <td style={{ padding: '14px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#2563eb', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={14} color="#2563eb" /> {admin.assignedCity || admin.city || 'Delhi NCR'}
                      </span>
                    </td>
                    <td style={{ padding: '14px' }}>
                      <span className={`badge ${isActive ? 'badge-success' : 'badge-danger'}`}>
                        {isActive ? 'ACTIVE' : 'DISABLED'}
                      </span>
                    </td>
                    <td style={{ padding: '14px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleOpenEdit(admin)}
                          className="btn btn-secondary btn-sm"
                          title="Assign City & Edit"
                        >
                          <Edit3 size={14} color="#2563eb" /> Assign City
                        </button>
                        
                        <button
                          onClick={() => handleOpenResetPassword(admin)}
                          className="btn btn-secondary btn-sm"
                          title="Reset Admin Password"
                        >
                          <KeyRound size={14} color="#7c3aed" /> Reset Pass
                        </button>

                        <button
                          onClick={() => handleToggleStatus(admin)}
                          className={`btn btn-sm ${isActive ? 'btn-danger' : 'btn-primary'}`}
                          title={isActive ? 'Disable Admin' : 'Enable Admin'}
                          style={{ padding: '6px 10px' }}
                        >
                          <Power size={14} /> {isActive ? 'Disable' : 'Enable'}
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

      {/* Modal */}
      <CityAdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={selectedAdmin}
        mode={modalMode}
      />

    </div>
  );
};

export default CityAdminManagement;
