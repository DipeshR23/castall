import type { Server } from 'socket.io';
import { registerRoomHandlers } from './room.js';
import { roomService } from '../services/roomService.js';
import { logger } from '../logger/pino.js';

export function setupSocketHandlers(io: Server) {
  io.on('connection', (socket) => {
    registerRoomHandlers(socket);

    socket.on('disconnect', () => {
      const room = roomService.getRoomByHostSocketId(socket.id);
      if (room) {
        roomService.endSession(room.roomCode);
        socket.to(room.roomCode).emit('connection-lost', {
          message: 'Host disconnected.',
        });
        logger.info({ roomCode: room.roomCode }, 'Host disconnected');
      }

      const presenterRoom = roomService.getRoomByPresenterSocketId(socket.id);
      if (presenterRoom) {
        socket.to(presenterRoom.roomCode).emit('connection-lost', {
          message: 'Presenter disconnected.',
        });
        logger.info({ roomCode: presenterRoom.roomCode }, 'Presenter disconnected');
      }
    });
  });
}
