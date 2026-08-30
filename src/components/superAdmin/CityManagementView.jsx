import { useState, useEffect } from 'react';
import { MapPin, Plus, Power, Search, Trash2, Edit3, CheckCircle2, XCircle, Loader2, Settings, X } from 'lucide-react';
import { cityService } from '../../services/city.service.js';
import { toast } from '../../utils/toast.js';

const CityManagementView = () => {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCity, setEditingCity] = useState(null);
  const [name, setName] = useState('');
  const [state, setState] = useState('');
  const [status, setStatus] = useState('active');
  const [submitting, setSubmitting] = useState(false);

  const loadCities = async () => {
    setLoading(true);
    try {
      const res = await cityService.getAllCities();
      const list = res.data?.data || res.data || [];
      setCities(Array.isArray(list) ? list : []);
    } catch {
      toast.error('Failed to load cities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cityService.getAllCities().then((res) => {
      const list = res.data?.data || res.data || [];
      setCities(Array.isArray(list) ? list : []);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = () => setActiveDropdownId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const handleOpenCreate = () => {
    setEditingCity(null);
    setName('');
    setState('');
    setStatus('active');
    setModalOpen(true);
  };

  const handleOpenEdit = (city) => {
    setEditingCity(city);
    setName(city.name);
    setState(city.state || '');
    setStatus(city.status || 'active');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter city name');
      return;
    }
    setSubmitting(true);
    try {
      if (editingCity) {
        await cityService.updateCity(editingCity._id, { name: name.trim(), state: state.trim(), status });
        toast.success(`City '${name.trim()}' updated successfully`);
      } else {
        await cityService.createCity({ name: name.trim(), state: state.trim(), status });
        toast.success(`New City '${name.trim()}' created successfully`);
      }
      setModalOpen(false);
      loadCities();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save city');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (city) => {
    try {
      await cityService.toggleCityStatus(city._id);
      toast.success(`City '${city.name}' status updated`);
      loadCities();
    } catch {
      toast.error('Failed to update city status');
    }
  };

  const handleDelete = async (city) => {
    if (!window.confirm(`Are you sure you want to delete '${city.name}'?`)) return;
    try {
      await cityService.deleteCity(city._id);
      toast.success(`City '${city.name}' deleted`);
      loadCities();
    } catch {
      toast.error('Failed to delete city');
    }
  };

  const filteredCities = cities.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.state && c.state.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
            <MapPin size={22} color="#10b981" /> Dynamic City Operations & Coverage ({cities.length})
          </h3>
          <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '4px', fontWeight: '500', lineHeight: '1.4' }}>
            Manage active operational cities. These cities dynamically populate across City Admin creation, Partner onboarding, and customer apps.
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
        >
          <Plus size={18} /> Add New City
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ position: 'relative', width: '320px', marginBottom: '20px' }}>
        <Search size={16} color="#64748b" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
        <input
          type="text"
          placeholder="Search city name or state..."
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

      {/* Cities Table */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
          <Loader2 size={24} className="spin" style={{ margin: '0 auto 10px auto' }} />
          Loading dynamic cities list...
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '0.78rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <th style={{ padding: '12px 14px', borderRadius: '8px 0 0 8px' }}>CITY NAME</th>
                <th style={{ padding: '12px 14px' }}>STATE / REGION</th>
                <th style={{ padding: '12px 14px' }}>COUNTRY</th>
                <th style={{ padding: '12px 14px' }}>STATUS</th>
                <th style={{ padding: '12px 14px', borderRadius: '0 8px 8px 0', textAlign: 'center' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredCities.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontWeight: '600' }}>
                    No operational cities found. Click 'Add New City' to create one.
                  </td>
                </tr>
              ) : (
                filteredCities.map((city) => {
                  const isActive = city.status === 'active';
                  const isDropdownOpen = activeDropdownId === city._id;

                  return (
                    <tr key={city._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px', fontWeight: '800', fontSize: '0.92rem', color: '#0f172a' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <MapPin size={15} color="#0284c7" /> {city.name}
                        </span>
                      </td>
                      <td style={{ padding: '14px', fontSize: '0.86rem', fontWeight: '600', color: '#475569' }}>
                        {city.state || 'N/A'}
                      </td>
                      <td style={{ padding: '14px', fontSize: '0.86rem', fontWeight: '600', color: '#475569' }}>
                        {city.country || 'India'}
                      </td>
                      <td style={{ padding: '14px' }}>
                        <span className={`badge ${isActive ? 'badge-success' : 'badge-danger'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          {isActive ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                          {isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td style={{ padding: '14px', textAlign: 'center' }}>
                        <div style={{ position: 'relative', display: 'inline-block' }} onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setActiveDropdownId(isDropdownOpen ? null : city._id)}
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '10px',
                              background: isDropdownOpen ? '#e2e8f0' : '#f1f5f9',
                              border: '1px solid #cbd5e1',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              color: '#334155'
                            }}
                            title="City Management Actions"
                          >
                            <Settings size={18} />
                          </button>

                          {isDropdownOpen && (
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
                              minWidth: '160px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '4px'
                            }}>
                              <button
                                onClick={() => { setActiveDropdownId(null); handleOpenEdit(city); }}
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
                                <Edit3 size={15} color="#2563eb" /> Edit Details
                              </button>

                              <button
                                onClick={() => { setActiveDropdownId(null); handleToggleStatus(city); }}
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
                                onMouseEnter={(e) => e.currentTarget.style.background = isActive ? '#fffbe6' : '#f0fdf4'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                              >
                                <Power size={15} color={isActive ? '#d97706' : '#16a34a'} /> {isActive ? 'Disable City' : 'Enable City'}
                              </button>

                              <div style={{ height: '1px', background: '#f1f5f9', margin: '2px 0' }} />

                              <button
                                onClick={() => { setActiveDropdownId(null); handleDelete(city); }}
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
                                <Trash2 size={15} color="#dc2626" /> Delete City
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
      )}

      {/* CREATE / EDIT CITY MODAL */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '28px', maxWidth: '440px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a' }}>
                <MapPin size={20} color="#10b981" /> {editingCity ? `Edit City: ${editingCity.name}` : 'Add New Operational City'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '50%', color: '#64748b', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">City Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Ahmedabad, Chandigarh, Lucknow"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">State / Region</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Gujarat, Punjab, Uttar Pradesh"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">Initial Status</label>
                <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="active">Active (Visible across app dropdowns)</option>
                  <option value="inactive">Inactive (Hidden)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? <Loader2 size={16} className="spin" /> : editingCity ? 'Save Changes' : 'Create City'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default CityManagementView;
