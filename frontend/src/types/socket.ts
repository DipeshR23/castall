import type { Socket } from 'socket.io-client';

export interface ServerToClientEvents {
  'room-created': (data: { roomCode: string; expiresIn: number }) => void;
  'room-joined': () => void;
  'room-invalid': (data: { code: string; message: string }) => void;
  'room-expired': () => void;
  'room-full': () => void;
  'room-reset': () => void;
  'presentation-request': (data: { deviceName: string }) => void;
  'accept-request': (data: { approved: boolean; sessionToken?: string }) => void;
  'webrtc-offer': (data: { sdp: string; sessionToken: string }) => void;
  'webrtc-answer': (data: { sdp: string; sessionToken: string }) => void;
  'ice-candidate': (data: { candidate: string; sdpMid: string; sdpMLineIndex: number; sessionToken: string }) => void;
  'start-sharing': () => void;
  'stop-sharing': () => void;
  'disconnect-session': () => void;
  'connection-lost': (data: { message: string }) => void;
  'reconnecting': () => void;
  'reconnected': () => void;
  error: (data: { code: string; message: string }) => void;
}

export interface ClientToServerEvents {
  'create-room': (payload: Record<string, never>, callback: (response: { success: true; data: { roomCode: string; expiresIn: number } } | { success: false; code: string; message: string }) => void) => void;
  'join-room': (payload: { roomCode: string; deviceName: string }, callback: (response: { success: true } | { success: false; code: string; message: string }) => void) => void;
  'presentation-request': () => void;
  'accept-request': (payload: Record<string, never>, callback: (response: { success: true; sessionToken: string } | { success: false; code: string; message: string }) => void) => void;
  'reject-request': (payload: Record<string, never>, callback?: (response: { success: true } | { success: false; code: string; message: string }) => void) => void;
  'start-sharing': (payload: Record<string, never>, callback?: (response: { success: true } | { success: false; code: string; message: string }) => void) => void;
  'stop-sharing': (payload: Record<string, never>, callback?: (response: { success: true } | { success: false; code: string; message: string }) => void) => void;
  'disconnect-session': (payload: Record<string, never>, callback?: (response: { success: true } | { success: false; code: string; message: string }) => void) => void;
  'webrtc-offer': (payload: { sdp: string; sessionToken: string }, callback: (error?: string) => void) => void;
  'webrtc-answer': (payload: { sdp: string; sessionToken: string }, callback: (error?: string) => void) => void;
  'ice-candidate': (payload: { candidate: string; sdpMid: string; sdpMLineIndex: number; sessionToken: string }, callback: (error?: string) => void) => void;
}

export type CastAllSocket = Socket<ServerToClientEvents, ClientToServerEvents>;
