import { useEffect, useState } from 'react';
import { Bell, BellRing, BellOff, CheckCircle2, Loader2, AlertTriangle } from 'lucide-react';
import { partnerService } from '../../services/partner.service.js';
import { axiosInstance } from '../../api/axiosInstance.js';
import { toast } from '../../utils/toast.js';

const registerPushDevice = async () => {
  const { requestPermissionAndGetToken } = await import('../../firebase.js');
  const token = await requestPermissionAndGetToken();
  await axiosInstance.post('/notifications/save-token', { token });
};

const PartnerNotificationsView = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pushPermission, setPushPermission] = useState('default');
  const [enablingPush, setEnablingPush] = useState(false);
  const [deviceState, setDeviceState] = useState({ status: 'idle', error: '' });

  const runDeviceRegistration = async () => {
    setDeviceState({ status: 'registering', error: '' });
    try {
      await registerPushDevice();
      setDeviceState({ status: 'registered', error: '' });
      return true;
    } catch (err) {
      const reason = err?.response?.data?.message || err?.code || err?.message || 'Unknown error';
      setDeviceState({ status: 'failed', error: String(reason) });
      return false;
    }
  };

  useEffect(() => {
    if ('Notification' in window) {
      setPushPermission(Notification.permission);
      if (Notification.permission === 'granted') runDeviceRegistration();
    }

    let active = true;
    partnerService.getNotifications()
      .then((res) => active && setItems(Array.isArray(res?.data) ? res.data : []))
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const handleEnablePush = async () => {
    if (!('Notification' in window)) { toast.error('Push Notifications are not supported by your browser.'); return; }
    setEnablingPush(true);
    try {
      const permission = await Notification.requestPermission();
      setPushPermission(permission);
      if (permission === 'granted') {
        if (await runDeviceRegistration()) toast.success('Push Notifications Enabled! 🎉');
        else toast.error('Permission granted, but device registration failed. See reason below.');
      } else if (permission === 'denied') {
        toast.error('Notification permission blocked in browser settings.');
      }
    } catch { toast.error('Failed to request notification permissions.'); }
    finally { setEnablingPush(false); }
  };

  return (
    <div className="mui-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Push Permission Banner */}
      <div style={{ background: pushPermission === 'granted' ? '#f0fdf4' : '#fefce8', border: `1px solid ${pushPermission === 'granted' ? '#bbf7d0' : '#fde68a'}`, borderRadius: '12px', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {pushPermission === 'granted'
            ? <CheckCircle2 size={20} color="#16a34a" />
            : <AlertTriangle size={20} color="#d97706" />}
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>
              {pushPermission === 'granted' ? 'Push Alerts Active' : 'Enable Push Notifications'}
            </div>
            <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px' }}>
              {pushPermission === 'granted'
                ? deviceState.status === 'registering' ? 'Registering this device…'
                  : deviceState.status === 'registered' ? '✓ This device is registered for broadcasts'
                  : deviceState.status === 'failed' ? `⚠ Device not registered: ${deviceState.error}`
                  : 'Notifications are enabled'
                : 'Tap to receive job alerts and booking updates on this device'}
            </div>
          </div>
        </div>
        {pushPermission !== 'granted' && (
          <button onClick={handleEnablePush} disabled={enablingPush} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px', border: 'none', background: '#2563eb', color: '#fff', fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer' }}>
            {enablingPush ? <Loader2 size={15} className="spin" /> : <BellRing size={15} />}
            Enable Push
          </button>
        )}
        {pushPermission === 'granted' && deviceState.status === 'failed' && (
          <button onClick={runDeviceRegistration} style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}>Retry</button>
        )}
      </div>

      {/* Notifications Feed */}
      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Bell size={20} color="#2563eb" /> Notifications
      </h3>
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Loader2 size={18} className="spin" /> Loading...</div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px 16px', color: '#64748b' }}>
          <BellOff size={32} style={{ margin: '0 auto 10px', display: 'block', color: '#cbd5e1' }} />
          <p style={{ fontSize: '0.88rem', margin: 0 }}>You're all caught up.</p>
        </div>
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
