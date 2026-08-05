export const APP_NAME = 'CastAll';
export const TAGLINE = 'Instant Browser-Based Wireless Presentation';

export const ROOM_CODE_LENGTH = 6;
export const ROOM_EXPIRY_MINUTES = 15;
export const MAX_DEVICE_NAME_LENGTH = 50;

export const CONNECTION_STATES = {
  IDLE: 'idle',
  CONNECTING: 'connecting',
  WAITING_APPROVAL: 'waiting_approval',
  PERMISSION: 'permission',
  NEGOTIATING: 'negotiating',
  CONNECTED: 'connected',
  STREAMING: 'streaming',
  DISCONNECTED: 'disconnected',
} as const;

export const ERROR_CODES = {
  ROOM_NOT_FOUND: 'Room not found.',
  ROOM_EXPIRED: 'Room expired.',
  ROOM_FULL: 'Room already in use.',
  REQUEST_REJECTED: 'Connection rejected.',
  PERMISSION_DENIED: 'Screen sharing permission denied.',
  SIGNALING_FAILED: 'Unable to establish presentation session.',
  CONNECTION_LOST: 'Connection lost. Attempting to reconnect...',
  UNKNOWN_ERROR: 'An unexpected error occurred.',
} as const;
