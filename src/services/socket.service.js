import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// Same token priority the REST client uses: the portal the user is currently on wins.
const TOKEN_KEYS = ['superadmin_token', 'cityadmin_token', 'partner_token', 'user_token', 'norozz_token'];

const getStorage = () =>
  sessionStorage.getItem('norozz_impersonation_tab') === '1' ? sessionStorage : localStorage;

const resolveToken = () => {
  const storage = getStorage();
  const path = typeof window !== 'undefined' ? window.location.pathname : '/';
  let preferred = 'user_token';
  if (path.startsWith('/partner')) preferred = 'partner_token';
  else if (path.startsWith('/super-admin')) preferred = 'superadmin_token';
  else if (path.startsWith('/city-admin')) preferred = 'cityadmin_token';
  try {
    const t = storage.getItem(preferred);
    if (t) return t;
    for (const k of TOKEN_KEYS) {
      const v = storage.getItem(k);
      if (v) return v;
    }
  } catch { /* storage unavailable */ }
  return null;
};

class SocketService {
  socket = null;

  connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 2000,
        reconnectionDelayMax: 10000,
        timeout: 10000,
        // evaluated on every (re)connect so a refreshed access token is always used
        auth: (cb) => cb({ token: resolveToken() }),
      });

      this.socket.on('connect_error', (err) => {
        console.warn('Socket connection issue:', err.message);
      });
    }
    return this.socket;
  }

  getSocket() {
    return this.socket || this.connect();
  }

  // The server identifies the partner from the access token; only the presence flag is sent.
  joinPartner({ online } = {}) {
    if (!this.socket) this.connect();
    const emit = () => this.socket.emit('join_partner', { online });
    emit();
    this.socket.off('connect', this._rejoinPartner);
    this._rejoinPartner = emit;
    this.socket.on('connect', this._rejoinPartner);
  }

  joinUser() {
    if (!this.socket) this.connect();
    const emit = () => this.socket.emit('join_user', {});
    emit();
    this.socket.off('connect', this._rejoinUser);
    this._rejoinUser = emit;
    this.socket.on('connect', this._rejoinUser);
  }

  onNewJobOffer(callback) {
    if (!this.socket) this.connect();
    this.socket.off('new_job_offer');
    this.socket.on('new_job_offer', callback);
  }

  onJobClaimed(callback) {
    if (!this.socket) this.connect();
    this.socket.off('job_claimed');
    this.socket.on('job_claimed', callback);
  }

  claimJob({ bookingId }, callback) {
    if (!this.socket) this.connect();
    this.socket.once('claim_result', (res) => {
      if (callback) callback(res);
    });
    this.socket.emit('claim_job', { bookingId });
  }

  off(event) {
    if (this.socket) this.socket.off(event);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = new SocketService();
