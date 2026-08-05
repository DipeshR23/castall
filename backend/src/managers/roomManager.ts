import { RoomStatus, type RoomSession } from '../types/room.js';
import { generateRoomCode, generateRoomId, generateSessionToken } from '../utils/codeGenerator.js';
import { ROOM_EXPIRY_MS } from '../constants/index.js';
import { logger } from '../logger/pino.js';

export class RoomManager {
  private rooms: Map<string, RoomSession> = new Map();
  private codeIndex: Map<string, string> = new Map();

  createRoom(hostSocketId: string, hostBrowser?: string, hostPlatform?: string): RoomSession {
    const roomCode = this.generateUniqueCode();
    const roomId = generateRoomId();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ROOM_EXPIRY_MS);

    const room: RoomSession = {
      roomId,
      roomCode,
      status: RoomStatus.WAITING,
      host: {
        socketId: hostSocketId,
        connected: true,
        browser: hostBrowser,
        platform: hostPlatform,
      },
      presenter: null,
      createdAt: now,
      expiresAt,
      sessionToken: null,
    };

    this.rooms.set(roomCode, room);
    this.codeIndex.set(roomCode, roomCode);

    logger.info({ roomCode, roomId }, 'Room created');

    return room;
  }

  getRoom(roomCode: string): RoomSession | undefined {
    return this.rooms.get(roomCode);
  }

  getRoomByHostSocketId(hostSocketId: string): RoomSession | undefined {
    for (const room of this.rooms.values()) {
      if (room.host.socketId === hostSocketId) {
        return room;
      }
    }
    return undefined;
  }

  joinRoom(roomCode: string, presenterSocketId: string, deviceName: string, browser?: string, platform?: string): RoomSession {
    const room = this.rooms.get(roomCode);
    if (!room) {
      throw new Error('ROOM_NOT_FOUND');
    }
    if (room.status === RoomStatus.EXPIRED) {
      throw new Error('ROOM_EXPIRED');
    }
    if (room.presenter && room.presenter.connected) {
      throw new Error('ROOM_FULL');
    }
    if (new Date() > room.expiresAt) {
      room.status = RoomStatus.EXPIRED;
      throw new Error('ROOM_EXPIRED');
    }
    if (room.status !== RoomStatus.WAITING) {
      throw new Error('ROOM_INVALID');
    }

    room.presenter = {
      socketId: presenterSocketId,
      deviceName,
      connected: true,
      browser,
      platform,
    };
    room.status = RoomStatus.REQUESTED;

    logger.info({ roomCode, deviceName }, 'Presenter joined');

    return room;
  }

  approveRequest(roomCode: string): { sessionToken: string } {
    const room = this.rooms.get(roomCode);
    if (!room || !room.presenter) {
      throw new Error('ROOM_NOT_FOUND');
    }
    if (room.status !== RoomStatus.REQUESTED) {
      throw new Error('ROOM_INVALID');
    }

    const sessionToken = generateSessionToken();
    room.sessionToken = sessionToken;
    if (room.presenter) {
      room.presenter.sessionToken = sessionToken;
    }
    room.status = RoomStatus.APPROVED;

    logger.info({ roomCode }, 'Request approved');

    return { sessionToken };
  }

  rejectRequest(roomCode: string): void {
    const room = this.rooms.get(roomCode);
    if (!room) {
      throw new Error('ROOM_NOT_FOUND');
    }

    room.presenter = null;
    room.status = RoomStatus.WAITING;

    logger.info({ roomCode }, 'Request rejected');
  }

  validateSessionToken(roomCode: string, sessionToken: string): boolean {
    const room = this.rooms.get(roomCode);
    if (!room || !room.presenter) {
      return false;
    }
    return room.presenter.sessionToken === sessionToken && room.sessionToken === sessionToken;
  }

  getRoomByPresenterSocketId(presenterSocketId: string): RoomSession | undefined {
    for (const room of this.rooms.values()) {
      if (room.presenter?.socketId === presenterSocketId) {
        return room;
      }
    }
    return undefined;
  }

  isSocketInRoom(socketId: string, roomCode: string): boolean {
    const room = this.rooms.get(roomCode);
    if (!room) return false;
    return room.host.socketId === socketId || room.presenter?.socketId === socketId;
  }

  startStreaming(roomCode: string): void {
    const room = this.rooms.get(roomCode);
    if (!room) {
      throw new Error('ROOM_NOT_FOUND');
    }
    room.status = RoomStatus.STREAMING;
    logger.info({ roomCode }, 'Streaming started');
  }

  endSession(roomCode: string): void {
    const room = this.rooms.get(roomCode);
    if (!room) {
      return;
    }

    room.status = RoomStatus.ENDED;
    room.presenter = null;
    room.sessionToken = null;

    logger.info({ roomCode }, 'Session ended');
  }

  destroyRoom(roomCode: string): void {
    const room = this.rooms.get(roomCode);
    if (!room) {
      return;
    }

    room.status = RoomStatus.DESTROYED;
    this.rooms.delete(roomCode);
    this.codeIndex.delete(roomCode);

    logger.info({ roomCode }, 'Room destroyed');
  }

  expireOldRooms(): string[] {
    const now = new Date();
    const expired: string[] = [];

    for (const [code, room] of this.rooms) {
      if (now > room.expiresAt && room.status === RoomStatus.WAITING) {
        room.status = RoomStatus.EXPIRED;
        expired.push(code);
        logger.info({ roomCode: code }, 'Room expired');
      }
    }

    return expired;
  }

  cleanup(): void {
    for (const [code, room] of this.rooms) {
      if (room.status === RoomStatus.ENDED || room.status === RoomStatus.EXPIRED || room.status === RoomStatus.DESTROYED) {
        this.rooms.delete(code);
        this.codeIndex.delete(code);
      }
    }
  }

  private generateUniqueCode(): string {
    let code: string;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      code = generateRoomCode();
      attempts++;
    } while (this.codeIndex.has(code) && attempts < maxAttempts);

    if (attempts >= maxAttempts) {
      throw new Error('Failed to generate unique room code');
    }

    return code;
  }
}
