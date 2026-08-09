const getIceServers = (): RTCConfiguration['iceServers'] => {
  const servers: RTCConfiguration['iceServers'] = [];
  
  const stunServer = import.meta.env.VITE_STUN_SERVER || 'stun:stun.l.google.com:19302';
  servers.push({ urls: stunServer });

  const turnServer = import.meta.env.VITE_TURN_SERVER;
  const turnUsername = import.meta.env.VITE_TURN_USERNAME;
  const turnPassword = import.meta.env.VITE_TURN_PASSWORD;

  if (turnServer && turnUsername && turnPassword) {
    servers.push({
      urls: turnServer,
      username: turnUsername,
      credential: turnPassword,
    });
  }

  return servers;
};

export class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private iceCandidateHandler: ((candidate: RTCIceCandidateInit) => void) | null = null;
  private iceCandidateBuffer: RTCIceCandidateInit[] = [];
  private remoteDescriptionSet = false;

  constructor(private iceServers: RTCConfiguration['iceServers']) {}

  createPeerConnection(): RTCPeerConnection {
    if (this.peerConnection) {
      this.cleanup();
    }

    this.peerConnection = new RTCPeerConnection({
      iceServers: this.iceServers,
    });

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.iceCandidateHandler?.(event.candidate.toJSON());
      }
    };

    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection?.connectionState;
      if (state === 'failed') {
        this.cleanup();
      }
    };

    return this.peerConnection;
  }

  setIceCandidateHandler(handler: (candidate: RTCIceCandidateInit) => void) {
    this.iceCandidateHandler = handler;
  }

  async acquireLocalStream(): Promise<MediaStream> {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      throw new Error('Screen sharing is not supported in this browser. Please use Chrome or Edge on Android, or Chrome on desktop.');
    }

    try {
      this.localStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 },
        },
        audio: true,
      });
    } catch (error) {
      console.warn('[webrtc] getDisplayMedia with audio failed, retrying without audio:', error);
      this.localStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 },
        },
      });
    }

    const videoTrack = this.localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.onended = () => {
        this.cleanup();
      };
    }

    return this.localStream;
  }

  async createOffer(): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection || !this.localStream) {
      throw new Error('Peer connection or local stream not initialized');
    }

    this.localStream.getTracks().forEach((track) => {
      this.peerConnection!.addTrack(track, this.localStream!);
    });

    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    return offer;
  }

  async createAnswer(): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    return answer;
  }

  async setRemoteDescription(sdp: string): Promise<void> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp }));
    this.remoteDescriptionSet = true;
    this.flushIceCandidateBuffer();
  }

  async setRemoteOffer(sdp: string): Promise<void> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp }));
    this.remoteDescriptionSet = true;
    this.flushIceCandidateBuffer();
  }

  private flushIceCandidateBuffer(): void {
    if (!this.peerConnection || this.iceCandidateBuffer.length === 0) return;
    const candidates = [...this.iceCandidateBuffer];
    this.iceCandidateBuffer = [];
    for (const candidate of candidates) {
      const candidateStr = candidate.candidate ?? '';
      const sdpMid = candidate.sdpMid ?? '';
      const sdpMLineIndex = candidate.sdpMLineIndex ?? 0;
      this.addIceCandidate(candidateStr, sdpMid, sdpMLineIndex).catch(() => {
        // Ignore buffered candidate failures; they may be stale
      });
    }
  }

  async addIceCandidate(candidate: string, sdpMid: string, sdpMLineIndex: number): Promise<void> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }
    if (!this.remoteDescriptionSet) {
      this.iceCandidateBuffer.push({ candidate, sdpMid, sdpMLineIndex });
      return;
    }
    try {
      await this.peerConnection.addIceCandidate({
        candidate,
        sdpMid,
        sdpMLineIndex,
      });
    } catch (error) {
      console.error('Failed to add ICE candidate', error);
      throw error;
    }
  }

  getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  getPeerConnection(): RTCPeerConnection | null {
    return this.peerConnection;
  }

  cleanup(): void {
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    this.remoteStream = null;
    this.iceCandidateHandler = null;
    this.iceCandidateBuffer = [];
    this.remoteDescriptionSet = false;
  }
}

const iceServers = getIceServers();

export const webrtcService = new WebRTCService(iceServers);
