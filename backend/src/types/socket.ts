import type { Server, Socket } from 'socket.io';
import type { JoinRoomPayload, RoomCreatedPayload } from './room.js';

export interface SocketEvents {
  'create-room': {
    handler: (callback: (response: { success: true; data: RoomCreatedPayload } | { success: false; error: string }) => void) => void;
  };
  'join-room': {
    handler: (payload: JoinRoomPayload, callback: (response: { success: true } | { success: false; code: string; message: string }) => void) => void;
  };
  'presentation-request': {
    handler: () => void;
  };
  'accept-request': {
    handler: (callback: (response: { success: true; sessionToken: string } | { success: false; error: string }) => void) => void;
  };
  'reject-request': {
    handler: () => void;
  };
  'start-sharing': {
    handler: () => void;
  };
  'stop-sharing': {
    handler: () => void;
  };
  'disconnect-session': {
    handler: () => void;
  };
  'webrtc-offer': {
    handler: (payload: { sdp: string; sessionToken: string }, callback: (error?: string) => void) => void;
  };
  'webrtc-answer': {
    handler: (payload: { sdp: string; sessionToken: string }, callback: (error?: string) => void) => void;
  };
  'ice-candidate': {
    handler: (payload: { candidate: string; sdpMid: string; sdpMLineIndex: number; sessionToken: string }, callback: (error?: string) => void) => void;
  };
}

export interface AuthenticatedSocket extends Socket {
  roomCode?: string;
  sessionToken?: string;
  role?: 'host' | 'presenter';
}

export type SocketIOServer = Server<SocketEvents, SocketEvents>;
