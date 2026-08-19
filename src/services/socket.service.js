import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  socket = null;

  connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
      });

      this.socket.on('connect', () => {
        console.log('⚡ Connected to NOROZZ Real-Time Dispatch Socket Network:', this.socket.id);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('🔌 Disconnected from Socket Network:', reason);
      });
    }
    return this.socket;
  }

  getSocket() {
    if (!this.socket) {
      return this.connect();
    }
    return this.socket;
  }

  joinPartner({ partnerId, category, city }) {
    if (!this.socket) this.connect();
    this.socket.emit('join_partner', { partnerId, category, city });
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

  claimJob({ bookingId, partnerId }, callback) {
    if (!this.socket) this.connect();

    this.socket.once('claim_result', (res) => {
      if (callback) callback(res);
    });

    this.socket.emit('claim_job', { bookingId, partnerId });
  }

  off(event) {
    if (this.socket) {
      this.socket.off(event);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = new SocketService();
