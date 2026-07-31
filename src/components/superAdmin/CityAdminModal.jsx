import React, { useState, useEffect } from 'react';
import { X, Building2, Mail, Lock, User, MapPin, Phone, KeyRound, Loader2 } from 'lucide-react';

const CityAdminModal = ({ isOpen, onClose, onSubmit, initialData, mode }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [assignedCity, setAssignedCity] = useState('Delhi NCR');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('active');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isResetPasswordMode = mode === 'resetPassword';
  const isEditMode = mode === 'edit' || Boolean(initialData);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setEmail(initialData.email || '');
      setPhone(initialData.phone || '');
      setAssignedCity(initialData.assignedCity || initialData.city || 'Delhi NCR');
      setStatus(initialData.status || 'active');
      setPassword('');
    } else {
      setName('');
      setEmail('');
      setPhone('');
      setAssignedCity('Delhi NCR');
      setStatus('active');
      setPassword('');
    }
    setError('');
  }, [initialData, isOpen, mode]);

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
              <input
                type="password"
                className="form-input"
                placeholder="Enter new password (min 6 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
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
                  <option value="Delhi NCR">Delhi NCR</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Bengaluru">Bengaluru</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Chennai">Chennai</option>
                  <option value="Kolkata">Kolkata</option>
                  <option value="Pune">Pune</option>
                  <option value="Jaipur">Jaipur</option>
                  <option value="Chandigarh">Chandigarh</option>
                </select>
              </div>

              {!isEditMode && (
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Lock size={14} /> Admin Password
                  </label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
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
