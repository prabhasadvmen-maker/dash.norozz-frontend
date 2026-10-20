import { useEffect, useState } from 'react';
import { Clock, Loader2, Save } from 'lucide-react';
import { partnerService } from '../../services/partner.service.js';
import { toast } from '../../utils/toast.js';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const defaultSchedule = () =>
  DAYS.map((day) => ({ day, isOpen: day !== 'Sunday', openTime: '09:00 AM', closeTime: '07:00 PM' }));

// "09:00 AM" <-> "09:00" for <input type="time">
const to24 = (t = '') => {
  const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(t.trim());
  if (!m) return t;
  let h = Number(m[1]) % 12;
  if (m[3].toUpperCase() === 'PM') h += 12;
  return `${String(h).padStart(2, '0')}:${m[2]}`;
};
const to12 = (t = '') => {
  const m = /^(\d{2}):(\d{2})$/.exec(t);
  if (!m) return t;
  const h = Number(m[1]);
  return `${String(h % 12 || 12).padStart(2, '0')}:${m[2]} ${h >= 12 ? 'PM' : 'AM'}`;
};

const PartnerAvailabilityView = ({ isOnline, onToggleOnlineClick }) => {
  const [schedule, setSchedule] = useState(defaultSchedule());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    partnerService.getAvailability()
      .then((res) => {
        const saved = res?.data?.workingHours;
        if (active && Array.isArray(saved) && saved.length > 0) {
          setSchedule(DAYS.map((day) => saved.find((d) => d.day === day) || { day, isOpen: false, openTime: '09:00 AM', closeTime: '07:00 PM' }));
        }
      })
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const update = (day, patch) =>
    setSchedule((prev) => prev.map((d) => (d.day === day ? { ...d, ...patch } : d)));

  const save = async () => {
    setSaving(true);
    try {
      await partnerService.updateAvailability({ workingHours: schedule });
      toast.success('Working hours saved successfully');
    } catch {
      // axios interceptor already shows the error toast
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mui-card" style={{ padding: '26px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Loader2 size={18} className="spin" /> Loading availability...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="mui-card" style={{ padding: '22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontWeight: 800 }}>You are currently {isOnline ? 'ONLINE' : 'OFFLINE'}</div>
          <div style={{ fontSize: '0.84rem', color: '#64748b' }}>Online technicians receive instant booking dispatches.</div>
        </div>
        <button type="button" onClick={onToggleOnlineClick} className="btn btn-primary btn-sm">
          {isOnline ? 'Go Offline' : 'Go Online'}
        </button>
      </div>

      <div className="mui-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={20} color="#2563eb" /> Weekly Working Hours
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {schedule.map((d) => (
            <div key={d.day} style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '140px', fontWeight: 700 }}>
                <input type="checkbox" checked={d.isOpen} onChange={(e) => update(d.day, { isOpen: e.target.checked })} />
                {d.day}
              </label>
              {d.isOpen ? (
                <>
                  <input type="time" value={to24(d.openTime)} onChange={(e) => update(d.day, { openTime: to12(e.target.value) })} />
                  <span>to</span>
                  <input type="time" value={to24(d.closeTime)} onChange={(e) => update(d.day, { closeTime: to12(e.target.value) })} />
                </>
              ) : (
                <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Day off</span>
              )}
            </div>
          ))}
        </div>
        <button type="button" onClick={save} disabled={saving} className="btn btn-primary" style={{ marginTop: '18px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          {saving ? <Loader2 size={16} className="spin" /> : <Save size={16} />} Save Working Hours
        </button>
      </div>
    </div>
  );
};

export default PartnerAvailabilityView;
