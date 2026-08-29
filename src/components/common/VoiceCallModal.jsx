import React, { useState, useEffect, useRef } from 'react';
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  User,
  ShieldCheck,
  PhoneCall,
  Loader2,
  X
} from 'lucide-react';
import { socketService } from '../../services/socket.service.js';
import { toast } from '../../utils/toast.js';

const VoiceCallModal = ({
  isOpen,
  onClose,
  bookingId,
  remoteUserName = 'Service Partner',
  role = 'customer',
  isIncoming = false,
  socket
}) => {
  const activeSocket = socket || socketService.getSocket();

  const [callState, setCallState] = useState(isIncoming ? 'incoming' : 'ringing');
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(true);

  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const timerRef = useRef(null);

  // Clean up WebRTC peer connection & media stream
  const cleanupCall = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
  };

  // Format Duration seconds into mm:ss
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  // Initialize WebRTC PeerConnection
  const initWebRTC = async () => {
    try {
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });
      pcRef.current = pc;

      // Get Microphone Audio
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      localStreamRef.current = stream;

      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      // Relay ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate && activeSocket) {
          activeSocket.emit('voice:signal', {
            bookingId,
            signal: { type: 'ice-candidate', candidate: event.candidate }
          });
        }
      };

      // Play Remote Audio Stream
      pc.ontrack = (event) => {
        if (remoteAudioRef.current && event.streams[0]) {
          remoteAudioRef.current.srcObject = event.streams[0];
          remoteAudioRef.current.play().catch((err) => console.warn('Audio play error:', err));
        }
      };

      return pc;
    } catch (err) {
      console.error('Microphone access or WebRTC error:', err);
      toast.error('Could not access microphone for voice call');
      setCallState('ended');
      return null;
    }
  };

  // Start Call Outgoing
  const startOutgoingCall = async () => {
    if (!activeSocket || !bookingId) return;
    setCallState('ringing');

    activeSocket.emit('voice:call:initiate', {
      bookingId,
      callerName: role === 'customer' ? 'Customer' : 'Service Partner',
      callerRole: role
    });

    const pc = await initWebRTC();
    if (!pc) return;

    // Create SDP Offer
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    activeSocket.emit('voice:signal', {
      bookingId,
      signal: { type: 'offer', sdp: pc.localDescription }
    });
  };

  // Accept Incoming Call
  const handleAcceptCall = async () => {
    if (!activeSocket || !bookingId) return;

    activeSocket.emit('voice:call:accept', {
      bookingId,
      calleeName: role === 'customer' ? 'Customer' : 'Service Partner'
    });

    setCallState('connected');
    startDurationTimer();

    const pc = await initWebRTC();
    if (!pc) return;

    // Listen for SDP Offer
    activeSocket.emit('voice:signal:ready', { bookingId });
  };

  // Reject Incoming Call
  const handleRejectCall = () => {
    if (activeSocket && bookingId) {
      activeSocket.emit('voice:call:reject', { bookingId, reason: 'Call rejected' });
    }
    setCallState('ended');
    cleanupCall();
    onClose();
  };

  // End Active Call
  const handleEndCall = () => {
    if (activeSocket && bookingId) {
      activeSocket.emit('voice:call:end', { bookingId });
    }
    setCallState('ended');
    cleanupCall();
    toast.info('📞 Call ended');
    setTimeout(() => onClose(), 800);
  };

  // Toggle Mute Microphone
  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  };

  // Timer for Call Duration
  const startDurationTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setDuration(0);
    timerRef.current = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);
  };

  // Sync callState & start outgoing call whenever modal opens
  useEffect(() => {
    if (isOpen) {
      const initialState = isIncoming ? 'incoming' : 'ringing';
      setCallState(initialState);
      setDuration(0);
      setIsMuted(false);

      if (!isIncoming) {
        startOutgoingCall();
      }
    }
  }, [isOpen, isIncoming]);

  // Socket Signal Listeners
  useEffect(() => {
    if (!isOpen || !activeSocket) return;

    const handleCallAccepted = (data) => {
      const isMatch = !data?.bookingId || String(data.bookingId) === String(bookingId) || String(data.conversationId) === String(bookingId);
      if (isMatch) {
        setCallState('connected');
        startDurationTimer();
        toast.success('📞 Call connected!');
      }
    };

    const handleCallRejected = (data) => {
      const isMatch = data?.bookingId && (String(data.bookingId) === String(bookingId) || String(data.conversationId) === String(bookingId));
      if (isMatch) {
        setCallState('ended');
        cleanupCall();
        toast.error('❌ User declined the call');
        setTimeout(() => onClose(), 1000);
      }
    };

    const handleCallEnded = (data) => {
      const isMatch = data?.bookingId && (String(data.bookingId) === String(bookingId) || String(data.conversationId) === String(bookingId));
      if (isMatch) {
        setCallState('ended');
        cleanupCall();
        toast.info('📴 Call ended');
        setTimeout(() => onClose(), 800);
      }
    };

    const handleVoiceSignal = async (data) => {
      if (!data || !data.signal) return;
      const isMatch = !data.bookingId || String(data.bookingId) === String(bookingId) || String(data.conversationId) === String(bookingId);
      if (!isMatch) return;

      const { signal } = data;
      const pc = pcRef.current;

      if (!pc) return;

      try {
        if (signal.type === 'offer') {
          await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          activeSocket.emit('voice:signal', {
            bookingId,
            signal: { type: 'answer', sdp: pc.localDescription }
          });
        } else if (signal.type === 'answer') {
          await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
        } else if (signal.type === 'ice-candidate' && signal.candidate) {
          await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
        }
      } catch (err) {
        console.warn('WebRTC signal handling error:', err);
      }
    };

    activeSocket.on(`voice:call:accepted:${bookingId}`, handleCallAccepted);
    activeSocket.on(`voice:call:rejected:${bookingId}`, handleCallRejected);
    activeSocket.on(`voice:call:ended:${bookingId}`, handleCallEnded);
    activeSocket.on('voice:call:accepted', handleCallAccepted);
    activeSocket.on('voice:call:rejected', handleCallRejected);
    activeSocket.on('voice:call:ended', handleCallEnded);
    activeSocket.on('voice:signal', handleVoiceSignal);

    return () => {
      activeSocket.off(`voice:call:accepted:${bookingId}`, handleCallAccepted);
      activeSocket.off(`voice:call:rejected:${bookingId}`, handleCallRejected);
      activeSocket.off(`voice:call:ended:${bookingId}`, handleCallEnded);
      activeSocket.off('voice:call:accepted', handleCallAccepted);
      activeSocket.off('voice:call:rejected', handleCallRejected);
      activeSocket.off('voice:call:ended', handleCallEnded);
      activeSocket.off('voice:signal', handleVoiceSignal);
      cleanupCall();
    };
  }, [isOpen, bookingId, activeSocket, isIncoming]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      {/* Hidden HTML Audio element for Playing Remote Voice */}
      <audio ref={remoteAudioRef} autoPlay style={{ display: 'none' }} />

      {/* Voice Call Dark Modal Card */}
      <div style={{
        background: '#0b132b',
        width: '90%',
        maxWidth: '380px',
        borderRadius: '28px',
        padding: '36px 24px',
        color: '#ffffff',
        textAlign: 'center',
        boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
        border: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px'
      }}>
        
        {/* Top Header Badge */}
        <div style={{
          background: 'rgba(37, 99, 235, 0.2)',
          color: '#60a5fa',
          border: '1px solid rgba(96, 165, 250, 0.3)',
          padding: '4px 14px',
          borderRadius: '20px',
          fontSize: '0.75rem',
          fontWeight: '800',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <ShieldCheck size={14} /> NOROZZ ENCRYPTED VOICE CALL
        </div>

        {/* Pulsing Avatar Container */}
        <div style={{ position: 'relative', margin: '12px 0' }}>
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
            color: '#ffffff',
            fontSize: '2.5rem',
            fontWeight: '900',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: callState === 'connected' ? '0 0 30px rgba(37,99,235,0.6)' : '0 0 20px rgba(255,255,255,0.2)',
            border: '4px solid #ffffff'
          }}>
            {remoteUserName.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* User Info & Status Text */}
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '900', margin: '0 0 6px 0', color: '#ffffff' }}>
            {remoteUserName}
          </h2>
          <div style={{ fontSize: '0.9rem', color: callState === 'connected' ? '#4ade80' : '#94a3b8', fontWeight: '700' }}>
            {callState === 'incoming' && '📞 Incoming Voice Call...'}
            {callState === 'ringing' && '🔔 Ringing...'}
            {callState === 'connected' && `🟢 In Call (${formatTime(duration)})`}
            {callState === 'ended' && '🔴 Call Ended'}
          </div>
        </div>

        {/* Controls Grid */}
        {callState === 'incoming' ? (
          /* Incoming Call Accept / Reject Buttons */
          <div style={{ display: 'flex', gap: '20px', width: '100%', justifyContent: 'center', marginTop: '12px' }}>
            <button
              onClick={handleRejectCall}
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#ef4444',
                color: '#ffffff',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 8px 20px rgba(239, 68, 68, 0.4)'
              }}
              title="Decline Call"
            >
              <PhoneOff size={24} />
            </button>

            <button
              onClick={handleAcceptCall}
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#22c55e',
                color: '#ffffff',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 8px 20px rgba(34, 197, 94, 0.4)'
              }}
              title="Accept Call"
            >
              <Phone size={24} />
            </button>
          </div>
        ) : (
          /* Active / Outgoing Call Controls */
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '12px' }}>
            {/* Mute Button */}
            <button
              onClick={toggleMute}
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: isMuted ? '#ef4444' : 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
            </button>

            {/* End Call Button */}
            <button
              onClick={handleEndCall}
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                background: '#ef4444',
                color: '#ffffff',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 8px 25px rgba(239, 68, 68, 0.45)'
              }}
              title="End Call"
            >
              <PhoneOff size={28} />
            </button>

            {/* Speaker Button */}
            <button
              onClick={() => setIsSpeaker(!isSpeaker)}
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: isSpeaker ? 'rgba(37, 99, 235, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                color: isSpeaker ? '#60a5fa' : '#ffffff',
                border: '1px solid rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title="Toggle Speaker"
            >
              {isSpeaker ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default VoiceCallModal;
