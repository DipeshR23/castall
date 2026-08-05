export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly timestamp: Date;

  constructor(code: string, message: string, statusCode: number = 500) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.timestamp = new Date();
    Error.captureStackTrace(this, this.constructor);
  }
}

export class RoomNotFoundError extends AppError {
  constructor() {
    super('ROOM_NOT_FOUND', 'Room does not exist.', 404);
  }
}

export class RoomExpiredError extends AppError {
  constructor() {
    super('ROOM_EXPIRED', 'Room expired.', 410);
  }
}

export class RoomFullError extends AppError {
  constructor() {
    super('ROOM_FULL', 'Room already in use.', 409);
  }
}

export class PermissionDeniedError extends AppError {
  constructor() {
    super('PERMISSION_DENIED', 'Screen sharing permission denied.', 403);
  }
}

export class SignalingFailedError extends AppError {
  constructor() {
    super('SIGNALING_FAILED', 'Negotiation failed.', 500);
  }
}
