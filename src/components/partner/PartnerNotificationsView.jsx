import { useEffect, useState } from 'react';
import { Bell, Loader2 } from 'lucide-react';
import { partnerService } from '../../services/partner.service.js';

const PartnerNotificationsView = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    partnerService.getNotifications()
      .then((res) => active && setItems(Array.isArray(res?.data) ? res.data : []))
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  return (
    <div className="mui-card" style={{ padding: '24px' }}>
      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Bell size={20} color="#2563eb" /> Notifications
      </h3>
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Loader2 size={18} className="spin" /> Loading...</div>
      ) : items.length === 0 ? (
        <p style={{ fontSize: '0.88rem', color: '#64748b' }}>You're all caught up.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {items.map((n) => (
            <div key={n.id} style={{ padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
              <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{n.title}</div>
              <div style={{ fontSize: '0.84rem', color: '#475569' }}>{n.message}</div>
              {n.createdAt && (
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>{new Date(n.createdAt).toLocaleString()}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PartnerNotificationsView;
