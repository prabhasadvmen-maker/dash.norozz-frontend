import { useState, useEffect } from 'react';
import { X, Building2, Mail, Lock, User, MapPin, Phone, KeyRound, Loader2, Eye, EyeOff } from 'lucide-react';
import { cityService } from '../../services/city.service.js';

const CityAdminModal = ({ isOpen, onClose, onSubmit, initialData, mode }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [assignedCity, setAssignedCity] = useState(initialData?.assignedCity || initialData?.city || '');
  const [activeCities, setActiveCities] = useState([]);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const status = initialData?.status || 'active';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isResetPasswordMode = mode === 'resetPassword';
  const isEditMode = mode === 'edit' || Boolean(initialData);

  useEffect(() => {
    if (!isOpen) return;
    cityService
      .getActiveCities()
      .then((res) => {
        const list = res.data?.data || res.data || [];
        if (Array.isArray(list) && list.length > 0) {
          setActiveCities(list);
          if (!assignedCity && !initialData) {
            setAssignedCity(list[0]._id);
          }
        }
      })
      .catch((err) => console.warn('Active cities fetch warning:', err));
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isResetPasswordMode) {
        if (!password || password.length < 6) {
          setError('Please enter a new password (min 6 chars)');
          setLoading(false);
          return;
        }
        await onSubmit({ password }, initialData._id, 'resetPassword');
      } else if (isEditMode) {
        await onSubmit({ name, email, phone, assignedCity, status }, initialData._id, 'edit');
      } else {
        await onSubmit({ name, email, phone, assignedCity, password, status, role: 'admin' }, null, 'create');
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '28px' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isResetPasswordMode ? <KeyRound size={20} color="#7c3aed" /> : <Building2 size={20} color="#2563eb" />}
            {isResetPasswordMode ? `Reset Password: ${initialData?.name}` : isEditMode ? 'Edit City Admin & Assign City' : 'Create New City Admin'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{ background: 'var(--accent-rose-light)', color: 'var(--accent-rose)', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          
          {/* RESET PASSWORD MODE */}
          {isResetPasswordMode ? (
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">New Admin Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Enter new password (min 6 chars)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  style={{ paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)'
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          ) : (
            /* CREATE / EDIT MODE */
            <>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={14} /> Admin Full Name
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Vikramaditya Singh"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Mail size={14} /> Official Email
                  </label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="cityadmin@norozz.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Phone size={14} /> Mobile Phone
                  </label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="+91 98123 45678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              {/* ASSIGN CITY DROPDOWN */}
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={14} color="#2563eb" /> Assign Operational City
                </label>
                <select
                  className="form-select"
                  value={assignedCity}
                  onChange={(e) => setAssignedCity(e.target.value)}
                >
                  {activeCities.length > 0 ? (
                    activeCities.map((cityObj) => (
                      <option key={cityObj._id} value={cityObj._id}>
                        {cityObj.name} {cityObj.state ? `(${cityObj.state})` : ''}
                      </option>
                    ))
                  ) : (
                    <option value="Delhi NCR">Delhi NCR</option>
                  )}
                </select>
              </div>

              {!isEditMode && (
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Lock size={14} /> Admin Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-input"
                      placeholder="Minimum 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      style={{ paddingRight: '40px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <Loader2 size={16} className="spin" /> : isResetPasswordMode ? 'Reset Password' : isEditMode ? 'Save Changes' : 'Create City Admin'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default CityAdminModal;
