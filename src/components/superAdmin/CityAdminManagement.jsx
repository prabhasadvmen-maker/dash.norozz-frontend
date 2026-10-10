import { useState, useEffect } from 'react';
import { Building2, Plus, KeyRound, MapPin, Power, Search, Edit3, LogIn, Loader2, Settings, Trash2 } from 'lucide-react';
import CityAdminModal from './CityAdminModal';
import { useSuperAdmin } from '../../hooks/useSuperAdmin.js';
import { cityService } from '../../services/city.service.js';
import { useAuthContext } from '../../contexts/AuthContext.jsx';
import { toast } from '../../utils/toast.js';

const CityAdminManagement = () => {
  const { cityAdmins, createCityAdmin, updateCityAdminStatus, impersonateCityAdmin, deleteCityAdmin, cityAdminsLoading, cityAdminsError } = useSuperAdmin();
  const { login, loginNewTab } = useAuthContext();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit' | 'resetPassword'
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [citiesMap, setCitiesMap] = useState({});
  const [loggingInId, setLoggingInId] = useState(null);
  const [activeDropdownId, setActiveDropdownId] = useState(null);

  useEffect(() => {
    cityService
      .getActiveCities()
      .then((res) => {
        const list = res.data?.data || res.data || [];
        if (Array.isArray(list)) {
          const map = {};
          list.forEach((c) => {
            if (c._id && c.name) map[String(c._id)] = c.name;
          });
          setCitiesMap(map);
        }
      })
      .catch((err) => console.warn('City map fetch warning:', err));
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = () => setActiveDropdownId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const getCityName = (admin) => {
    const raw = admin.assignedCity || admin.city || '';
    if (typeof raw === 'object' && raw?.name) return raw.name;
    if (typeof raw === 'string') {
      if (citiesMap[raw]) return citiesMap[raw];
      if (!raw.match(/^[0-9a-fA-F]{24}$/)) return raw;
    }
    return 'Delhi NCR';
  };

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
    const newStatus = admin.status === 'active' ? 'blocked' : 'active';
    await updateCityAdminStatus({ id: admin._id, status: newStatus });
  };

  const handleDeleteAdmin = async (admin) => {
    if (window.confirm(`Are you sure you want to permanently delete City Admin '${admin.name}' (${admin.email})?`)) {
      try {
        await deleteCityAdmin(admin._id);
      } catch (err) {
        console.error('Failed to delete city admin:', err);
      }
    }
  };

  const handleDirectLogin = async (admin) => {
    if (admin.status !== 'active') {
      toast.error('Cannot login into a disabled City Admin account.');
      return;
    }

    setLoggingInId(admin._id);
    try {
      const res = await impersonateCityAdmin(admin._id);
      console.log('[IMP] raw res:', res);

      // axiosInstance returns response.data directly
      // Backend sendSuccess wraps as { statusCode, success, message, data: { user, accessToken } }
      const responseData = res?.data ?? res;
      console.log('[IMP] responseData:', responseData);

      const targetUser = responseData?.user || responseData?.admin;
      const token = responseData?.accessToken || responseData?.token;
      console.log('[IMP] targetUser:', targetUser, '| token:', token ? token.slice(0, 20) + '...' : null);

      if (!targetUser || !token) {
        toast.error('Impersonation failed: token or user missing from server response');
        return;
      }

      const newTab = loginNewTab(targetUser, token);
      if (!newTab) {
        toast.error('Popup blocked! Please allow popups for this site and try again.');
        return;
      }
      toast.success(`City Admin portal opened in new tab for ${targetUser.name || admin.name}`);
    } catch (err) {
      console.error('[IMP] City Admin direct login error:', err);
      toast.error(err?.message || 'Failed to login as City Admin');
    } finally {
      setLoggingInId(null);
    }
  };

  const handleModalSubmit = async (formData, adminId, mode) => {
    if (mode === 'create') {
      await createCityAdmin(formData);
    }
    setModalOpen(false);
  };

  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '20px',
      padding: '26px',
      border: '1px solid #f0f0f0',
      boxShadow: '0 8px 26px rgba(0, 0, 0, 0.03)'
    }}>
      
      {/* Header Controls */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px', gap: '16px', flexWrap: 'nowrap' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 size={22} color="#10b981" /> City Admins & Operational Coverage
          </h3>
          <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '4px', fontWeight: '500', lineHeight: '1.4' }}>
            Create City Admins, assign operational cities, reset passwords, and manage access rights
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '10px 20px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '12px',
            fontWeight: '700',
            fontSize: '0.88rem',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap',
            flexShrink: 0
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          <Plus size={18} /> Create City Admin
        </button>
      </div>

      {/* Search Input */}
      <div style={{ position: 'relative', width: '320px', marginBottom: '20px' }}>
        <Search size={16} color="#64748b" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
        <input
          type="text"
          placeholder="Filter by admin name or city..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 14px 10px 38px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            fontSize: '0.86rem',
            outline: 'none',
            color: '#0f172a',
            fontWeight: '600'
          }}
        />
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '0.78rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <th style={{ padding: '12px 14px', borderRadius: '8px 0 0 8px' }}>ADMIN NAME</th>
              <th style={{ padding: '12px 14px' }}>OFFICIAL EMAIL</th>
              <th style={{ padding: '12px 14px' }}>ASSIGNED CITY</th>
              <th style={{ padding: '12px 14px' }}>STATUS</th>
              <th style={{ padding: '12px 14px' }}>PORTAL ACCESS</th>
              <th style={{ padding: '12px 14px', borderRadius: '0 8px 8px 0', textAlign: 'center' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {cityAdminsLoading ? (
              <tr>
                <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                  <Loader2 size={20} className="spin" style={{ display: 'inline-block', marginRight: '8px' }} />
                  Loading city admins...
                </td>
              </tr>
            ) : cityAdminsError ? (
              <tr>
                <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#dc2626', fontWeight: '600' }}>
                  Error: {cityAdminsError?.message || 'Failed to load city admins. Check console.'}
                </td>
              </tr>
            ) : filteredAdmins.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontWeight: '600' }}>
                  No City Admins found. Click 'Create City Admin' to add one.
                </td>
              </tr>
            ) : (
              filteredAdmins.map((admin) => {
                const isActive = admin.status === 'active';
                return (
                  <tr key={admin._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px', fontWeight: '800', fontSize: '0.92rem', color: '#0f172a' }}>
                      {admin.name}
                    </td>
                    <td style={{ padding: '14px', fontSize: '0.86rem', fontWeight: '600', color: '#475569' }}>
                      {admin.email}
                    </td>
                    <td style={{ padding: '14px' }}>
                      <span style={{ fontSize: '0.86rem', fontWeight: '700', color: '#2563eb', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={14} color="#2563eb" /> {getCityName(admin)}
                      </span>
                    </td>
                    <td style={{ padding: '14px' }}>
                      <span className={`badge ${isActive ? 'badge-success' : 'badge-danger'}`}>
                        {isActive ? 'ACTIVE' : 'DISABLED'}
                      </span>
                    </td>

                    {/* Dedicated PORTAL ACCESS Column */}
                    <td style={{ padding: '14px' }}>
                      <button
                        onClick={() => handleDirectLogin(admin)}
                        disabled={loggingInId === admin._id || !isActive}
                        style={{
                          background: isActive ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : '#cbd5e1',
                          color: '#ffffff',
                          fontWeight: '800',
                          borderRadius: '8px',
                          border: 'none',
                          padding: '6px 14px',
                          boxShadow: isActive ? '0 2px 8px rgba(16, 185, 129, 0.35)' : 'none',
                          cursor: isActive ? 'pointer' : 'not-allowed',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.82rem'
                        }}
                        title={isActive ? `Directly login into ${admin.name}'s City Admin portal` : 'Cannot login to disabled admin'}
                      >
                        {loggingInId === admin._id ? (
                          <Loader2 size={14} className="spin" />
                        ) : (
                          <LogIn size={14} />
                        )}
                        Login
                      </button>
                    </td>

                    {/* Dedicated ACTIONS Column (Only Gear Icon) */}
                    <td style={{ padding: '14px', textAlign: 'center' }}>
                      <div style={{ position: 'relative', display: 'inline-block' }} onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setActiveDropdownId(activeDropdownId === admin._id ? null : admin._id)}
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '10px',
                            background: activeDropdownId === admin._id ? '#e2e8f0' : '#f1f5f9',
                            border: '1px solid #cbd5e1',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            color: '#334155'
                          }}
                          title="City Admin Actions"
                        >
                          <Settings size={18} />
                        </button>

                          {activeDropdownId === admin._id && (
                            <div style={{
                              position: 'absolute',
                              right: 0,
                              top: '42px',
                              background: '#ffffff',
                              border: '1px solid #e2e8f0',
                              borderRadius: '12px',
                              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.12)',
                              padding: '6px',
                              zIndex: 50,
                              minWidth: '190px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '4px'
                            }}>
                              <button
                                onClick={() => { setActiveDropdownId(null); handleDirectLogin(admin); }}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  padding: '8px 12px',
                                  fontSize: '0.82rem',
                                  fontWeight: '700',
                                  color: '#059669',
                                  background: 'transparent',
                                  border: 'none',
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  textAlign: 'left',
                                  width: '100%'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#ecfdf5'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                              >
                                <LogIn size={15} color="#059669" /> Login as City Admin
                              </button>

                              <button
                                onClick={() => { setActiveDropdownId(null); handleOpenEdit(admin); }}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  padding: '8px 12px',
                                  fontSize: '0.82rem',
                                  fontWeight: '700',
                                  color: '#2563eb',
                                  background: 'transparent',
                                  border: 'none',
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  textAlign: 'left',
                                  width: '100%'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#eff6ff'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                              >
                                <Edit3 size={15} color="#2563eb" /> Assign City & Edit
                              </button>

                            <button
                              onClick={() => { setActiveDropdownId(null); handleOpenResetPassword(admin); }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 12px',
                                fontSize: '0.82rem',
                                fontWeight: '700',
                                color: '#7c3aed',
                                background: 'transparent',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                textAlign: 'left',
                                width: '100%'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = '#f5f3ff'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              <KeyRound size={15} color="#7c3aed" /> Reset Password
                            </button>

                            <div style={{ height: '1px', background: '#f1f5f9', margin: '2px 0' }} />

                            <button
                              onClick={() => { setActiveDropdownId(null); handleToggleStatus(admin); }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 12px',
                                fontSize: '0.82rem',
                                fontWeight: '700',
                                color: isActive ? '#d97706' : '#16a34a',
                                background: 'transparent',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                textAlign: 'left',
                                width: '100%'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = isActive ? '#fffbebfb' : '#f0fdf4'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              <Power size={15} color={isActive ? '#d97706' : '#16a34a'} /> {isActive ? 'Disable Admin' : 'Enable Admin'}
                            </button>

                            <button
                              onClick={() => { setActiveDropdownId(null); handleDeleteAdmin(admin); }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 12px',
                                fontSize: '0.82rem',
                                fontWeight: '700',
                                color: '#dc2626',
                                background: 'transparent',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                textAlign: 'left',
                                width: '100%'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              <Trash2 size={15} color="#dc2626" /> Delete City Admin
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
