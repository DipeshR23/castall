import { RoomManager } from '../managers/roomManager.js';
import { rateLimiter } from '../utils/rateLimiter.js';

class RoomService {
  private manager: RoomManager;

  constructor() {
    this.manager = new RoomManager();
  }

  createRoom(hostSocketId: string): { roomCode: string; expiresIn: number } {
    if (!rateLimiter.check(hostSocketId)) {
      throw new Error('RATE_LIMIT_EXCEEDED');
    }

    const room = this.manager.createRoom(hostSocketId);
    return {
      roomCode: room.roomCode,
      expiresIn: 15 * 60,
    };
  }

  joinRoom(roomCode: string, presenterSocketId: string, deviceName: string): void {
    this.manager.joinRoom(roomCode, presenterSocketId, deviceName);
  }

  approveRequest(roomCode: string): { sessionToken: string } {
    return this.manager.approveRequest(roomCode);
  }

  rejectRequest(roomCode: string): void {
    this.manager.rejectRequest(roomCode);
  }

  startStreaming(roomCode: string): void {
    this.manager.startStreaming(roomCode);
  }

  endSession(roomCode: string): void {
    this.manager.endSession(roomCode);
  }

  getRoomByCode(roomCode: string) {
    return this.manager.getRoom(roomCode);
  }

  getRoomByHostSocketId(hostSocketId: string) {
    return this.manager.getRoomByHostSocketId(hostSocketId);
  }

  getRoomByPresenterSocketId(presenterSocketId: string) {
    return this.manager.getRoomByPresenterSocketId(presenterSocketId);
  }

  isSocketInRoom(socketId: string, roomCode: string): boolean {
    return this.manager.isSocketInRoom(socketId, roomCode);
  }

  validateSessionToken(roomCode: string, sessionToken: string): boolean {
    return this.manager.validateSessionToken(roomCode, sessionToken);
  }

  expireOldRooms(): string[] {
    return this.manager.expireOldRooms();
  }

  cleanup(): void {
    this.manager.cleanup();
    rateLimiter.cleanup();
  }
}

export const roomService = new RoomService();
