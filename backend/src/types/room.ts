export enum RoomStatus {
  CREATED = 'CREATED',
  WAITING = 'WAITING',
  REQUESTED = 'REQUESTED',
  APPROVED = 'APPROVED',
  STREAMING = 'STREAMING',
  ENDED = 'ENDED',
  EXPIRED = 'EXPIRED',
  DESTROYED = 'DESTROYED',
}

export interface HostSession {
  socketId: string;
  connected: boolean;
  browser?: string;
  platform?: string;
}

export interface PresenterSession {
  socketId: string;
  deviceName: string;
  connected: boolean;
  browser?: string;
  platform?: string;
  sessionToken?: string;
}

export interface RoomSession {
  roomId: string;
  roomCode: string;
  status: RoomStatus;
  host: HostSession;
  presenter: PresenterSession | null;
  createdAt: Date;
  expiresAt: Date;
  sessionToken: string | null;
}

export interface WebRTCPayload {
  sdp: string;
  sessionToken: string;
}

export interface ICECandidatePayload {
  candidate: string;
  sdpMid: string;
  sdpMLineIndex: number;
  sessionToken: string;
}

export interface JoinRoomPayload {
  roomCode: string;
  deviceName: string;
}

export interface RoomCreatedPayload {
  roomCode: string;
  expiresIn: number;
}

export interface CreateRoomResponse {
  roomCode: string;
  expiresIn: number;
}
