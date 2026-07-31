import React, { useState } from 'react';
import { Briefcase, User, Mail, Phone, MapPin, Grid, Lock, ArrowRight, Loader2, FileText } from 'lucide-react';

const PartnerRegisterForm = ({ onPartnerSubmitted }) => {
  const [agencyName, setAgencyName] = useState('');
  const [category, setCategory] = useState('AC & Appliance Repair');
  const [city, setCity] = useState('Delhi NCR');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [license, setLicense] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      onPartnerSubmitted({
        agencyName,
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
      <div className="form-group">
        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Briefcase size={14} /> Agency / Business Name
        </label>
        <input
          type="text"
          className="form-input"
          placeholder="e.g. CleanPro Services Agency"
          value={agencyName}
          onChange={(e) => setAgencyName(e.target.value)}
          required
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Grid size={14} /> Primary Service Category
          </label>
          <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="AC & Appliance Repair">AC & Appliance Repair</option>
            <option value="Home Deep Cleaning">Home Deep Cleaning</option>
            <option value="Women Salon & Spa">Women Salon & Spa</option>
            <option value="Plumbing & Leak Repair">Plumbing & Leak Repair</option>
            <option value="Electrician & Wiring">Electrician & Wiring</option>
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <User size={14} /> Owner / Contact Person
          </label>
          <input
            type="text"
            className="form-input"
            placeholder="Owner Full Name"
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
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
            placeholder="+91 98765 43210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Mail size={14} /> Official Email
          </label>
          <input
            type="email"
            className="form-input"
            placeholder="partner@cleanpro.com"
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

      <div className="form-group" style={{ marginBottom: '20px' }}>
        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <FileText size={14} /> GST / Trade License Number (Optional)
        </label>
        <input
          type="text"
          className="form-input"
          placeholder="e.g. 07AAAAA0000A1Z5"
          value={license}
          onChange={(e) => setLicense(e.target.value)}
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
            <Loader2 size={16} className="spin" /> Submitting Partner Application...
          </>
        ) : (
          <>
            Submit Partner Onboarding Application <ArrowRight size={16} />
          </>
        )}
      </button>
    </form>
  );
};

export default PartnerRegisterForm;
