import { getSocket } from './socket.js';

export const roomService = {
  createRoom(): Promise<{ roomCode: string; expiresIn: number }> {
    return new Promise((resolve, reject) => {
      const socket = getSocket();
      
      if (!socket.connected) {
        reject(new Error('Socket not connected'));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Request timeout. Please try again.'));
      }, 10000);

      socket.emit('create-room', {}, (response) => {
        clearTimeout(timeout);
        if (response.success) {
          resolve(response.data);
        } else {
          reject(new Error(response.message));
        }
      });
    });
  },

  joinRoom(roomCode: string, deviceName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const socket = getSocket();
      
      if (!socket.connected) {
        reject(new Error('Socket not connected'));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Request timeout. Please try again.'));
      }, 10000);

      socket.emit('join-room', { roomCode, deviceName }, (response) => {
        clearTimeout(timeout);
        if (response.success) {
          resolve();
        } else {
          reject(new Error(response.message));
        }
      });
    });
  },

  acceptRequest(): Promise<{ sessionToken: string }> {
    return new Promise((resolve, reject) => {
      const socket = getSocket();
      
      if (!socket.connected) {
        reject(new Error('Socket not connected'));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Request timeout. Please try again.'));
      }, 10000);

      socket.emit('accept-request', {}, (response) => {
        clearTimeout(timeout);
        if (response.success) {
          resolve({ sessionToken: response.sessionToken });
        } else {
          reject(new Error(response.message));
        }
      });
    });
  },

  rejectRequest(): void {
    const socket = getSocket();
    socket.emit('reject-request', {}, () => {});
  },

  startSharing(): void {
    const socket = getSocket();
    socket.emit('start-sharing', {}, () => {});
  },

  stopSharing(): void {
    const socket = getSocket();
    socket.emit('stop-sharing', {}, () => {});
  },

  disconnectSession(): void {
    const socket = getSocket();
    socket.emit('disconnect-session', {}, () => {});
  },

  sendOffer(sdp: string, sessionToken: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const socket = getSocket();
      socket.emit('webrtc-offer', { sdp, sessionToken }, (error?: string) => {
        if (error) reject(new Error(error));
        else resolve();
      });
    });
  },

  sendAnswer(sdp: string, sessionToken: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const socket = getSocket();
      socket.emit('webrtc-answer', { sdp, sessionToken }, (error?: string) => {
        if (error) reject(new Error(error));
        else resolve();
      });
    });
  },

  sendIceCandidate(candidate: string, sdpMid: string, sdpMLineIndex: number, sessionToken: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const socket = getSocket();
      socket.emit('ice-candidate', { candidate, sdpMid, sdpMLineIndex, sessionToken }, (error?: string) => {
        if (error) reject(new Error(error));
        else resolve();
      });
    });
  },
};
