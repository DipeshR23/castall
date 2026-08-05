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

export interface Room {
  roomId: string;
  roomCode: string;
  status: RoomStatus;
  hostSocketId: string;
  presenterSocketId: string | null;
  createdAt: Date;
  expiresAt: Date;
  sessionToken: string | null;
}

export interface CreateRoomResponse {
  roomCode: string;
  expiresIn: number;
}

export interface JoinRoomPayload {
  roomCode: string;
  deviceName: string;
}

export interface PresentationRequestPayload {
  deviceName: string;
}

export interface AcceptRequestResponse {
  success: true;
  sessionToken: string;
}

export interface RejectRequestResponse {
  success: false;
  approved: false;
}

export interface StartSharingPayload {
  success: true;
}
