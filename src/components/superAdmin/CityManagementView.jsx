import { useState, useEffect } from 'react';
import { MapPin, Plus, Power, Search, Trash2, Edit3, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { cityService } from '../../services/city.service.js';
import { toast } from '../../utils/toast.js';

const CityManagementView = () => {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
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
    <div className="mui-card" style={{ padding: '26px' }}>
      
      {/* Header Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={22} color="#0284c7" /> Dynamic City Operations & Coverage ({cities.length})
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Manage active operational cities. These cities dynamically populate across City Admin creation, Partner onboarding, and customer apps.
          </p>
        </div>

        <button onClick={handleOpenCreate} className="btn btn-primary">
          <Plus size={16} /> Add New City
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ position: 'relative', width: '300px', marginBottom: '20px' }}>
        <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
        <input
          type="text"
          className="form-input"
          placeholder="Search city name or state..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ paddingLeft: '36px', fontSize: '0.85rem' }}
        />
      </div>

      {/* Cities Table */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Loader2 size={24} className="spin" style={{ margin: '0 auto 10px auto' }} />
          Loading dynamic cities list...
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                <th style={{ padding: '12px 14px' }}>CITY NAME</th>
                <th style={{ padding: '12px 14px' }}>STATE / REGION</th>
                <th style={{ padding: '12px 14px' }}>COUNTRY</th>
                <th style={{ padding: '12px 14px' }}>STATUS</th>
                <th style={{ padding: '12px 14px' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredCities.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No operational cities found. Click 'Add New City' to create one.
                  </td>
                </tr>
              ) : (
                filteredCities.map((city) => {
                  const isActive = city.status === 'active';
                  return (
                    <tr key={city._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '14px', fontWeight: '800', fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <MapPin size={15} color="#0284c7" /> {city.name}
                        </span>
                      </td>
                      <td style={{ padding: '14px', fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                        {city.state || 'N/A'}
                      </td>
                      <td style={{ padding: '14px', fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                        {city.country || 'India'}
                      </td>
                      <td style={{ padding: '14px' }}>
                        <span className={`badge ${isActive ? 'badge-success' : 'badge-danger'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          {isActive ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                          {isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td style={{ padding: '14px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => handleOpenEdit(city)} className="btn btn-secondary btn-sm" title="Edit City">
                            <Edit3 size={14} color="#2563eb" /> Edit
                          </button>
                          <button
                            onClick={() => handleToggleStatus(city)}
                            className={`btn btn-sm ${isActive ? 'btn-danger' : 'btn-primary'}`}
                            title={isActive ? 'Deactivate City' : 'Activate City'}
                            style={{ padding: '6px 10px' }}
                          >
                            <Power size={14} /> {isActive ? 'Disable' : 'Enable'}
                          </button>
                          <button onClick={() => handleDelete(city)} className="btn btn-danger btn-sm" title="Delete City" style={{ padding: '6px 10px' }}>
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
      )}

      {/* CREATE / EDIT CITY MODAL */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '28px', maxWidth: '440px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={20} color="#0284c7" /> {editingCity ? `Edit City: ${editingCity.name}` : 'Add New Operational City'}
            </h3>

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
