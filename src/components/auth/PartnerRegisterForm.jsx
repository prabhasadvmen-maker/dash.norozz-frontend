import React, { useState, useEffect } from 'react';
import { Briefcase, User, Mail, Phone, MapPin, Grid, Lock, ArrowRight, Loader2, FileText } from 'lucide-react';
import { catalogService } from '../../services/catalog.service.js';

const PartnerRegisterForm = ({ onPartnerSubmitted }) => {
  const [agencyName, setAgencyName] = useState('');
  const [category, setCategory] = useState('');
  const [categoriesList, setCategoriesList] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [city, setCity] = useState('Delhi NCR');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [license, setLicense] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const res = await catalogService.getCategories();
        const fetched = res.data?.data || res.data || [];
        if (Array.isArray(fetched) && fetched.length > 0) {
          setCategoriesList(fetched);
          setCategory(fetched[0].name);
        }
      } catch (err) {
        console.error('Failed to fetch categories in PartnerRegisterForm:', err);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const displayName = agencyName.trim() || (ownerName ? `${ownerName} (${category || 'Service Partner'})` : '');

    setTimeout(() => {
      setLoading(false);
      onPartnerSubmitted({
        name: ownerName,
        agencyName: displayName,
        category,
        city,
        ownerName,
        email,
        phone,
        license,
        status: 'pending' // Initial status
      });
    }, 800);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* 1. Technician Name & Mobile Phone */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <User size={14} /> Technician / Partner Full Name
          </label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Ramesh Sharma"
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Phone size={14} /> Mobile Phone Number
          </label>
          <input
            type="tel"
            className="form-input"
            placeholder="+91 98765 43210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
      </div>

      {/* 2. Primary Skill Category & Operational City */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Grid size={14} /> Profession / Skill Specialty
          </label>
          <select
            className="form-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={loadingCategories}
          >
            {loadingCategories ? (
              <option value="">Loading service categories...</option>
            ) : categoriesList.length > 0 ? (
              categoriesList.map((cat) => (
                <option key={cat._id || cat.id || cat.slug || cat.name} value={cat.name}>
                  {cat.name}
                </option>
              ))
            ) : (
              <>
                <option value="AC & Appliance Repair">AC & Appliance Repair Technician</option>
                <option value="Home Deep Cleaning">Home Deep Cleaning Professional</option>
                <option value="Plumbing & Leak Repair">Plumbing & Pipe Specialist</option>
                <option value="Electrician & Wiring">Electrician & Wiring Expert</option>
                <option value="Women Salon & Spa">Beautician & Spa Therapist</option>
              </>
            )}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={14} /> Operational City
          </label>
          <select className="form-select" value={city} onChange={(e) => setCity(e.target.value)}>
            <option value="Delhi NCR">Delhi NCR</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Bengaluru">Bengaluru</option>
            <option value="Hyderabad">Hyderabad</option>
          </select>
        </div>
      </div>

      {/* 3. Email & Password */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Mail size={14} /> Email Address
          </label>
          <input
            type="email"
            className="form-input"
            placeholder="tech.ramesh@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Lock size={14} /> Account Password
          </label>
          <input
            type="password"
            className="form-input"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
      </div>

      {/* 4. Business / Brand Display Name (Optional) */}
      <div className="form-group" style={{ marginBottom: '20px' }}>
        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Briefcase size={14} /> Business / Brand Display Name (Optional)
        </label>
        <input
          type="text"
          className="form-input"
          placeholder="e.g. Ramesh AC Expert (Leave blank to use your name & skill)"
          value={agencyName}
          onChange={(e) => setAgencyName(e.target.value)}
        />
      </div>

      <button
        type="submit"
        className="btn btn-primary"
        disabled={loading}
        style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}
      >
        {loading ? (
          <>
            <Loader2 size={16} className="spin" /> Registering Service Technician Account...
          </>
        ) : (
          <>
            Register as Service Technician <ArrowRight size={16} />
          </>
        )}
      </button>
    </form>
  );
};

export default PartnerRegisterForm;
