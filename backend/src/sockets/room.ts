import type { Socket } from 'socket.io';
import { roomService } from '../services/roomService.js';
import { logger } from '../logger/pino.js';
import { validateRoomCode, sanitizeDeviceName, validateSessionToken, validateSDP, validateICECandidate } from '../utils/validation.js';
import { RoomStatus } from '../types/room.js';

function errorResponse(code: string, message: string) {
  return { success: false, code, message };
}

export function registerRoomHandlers(socket: Socket) {
  socket.on('create-room', async (_payload, callback) => {
    try {
      const result = roomService.createRoom(socket.id);
      socket.join(result.roomCode);
      if (typeof callback === 'function') {
        callback({
          success: true,
          data: result,
        });
      }
    } catch (error) {
      logger.error({ error }, 'Failed to create room');
      const message = error instanceof Error ? error.message : 'Failed to create room';
      const code = message === 'RATE_LIMIT_EXCEEDED' ? 'RATE_LIMIT_EXCEEDED' : 'CREATE_ROOM_FAILED';
      if (typeof callback === 'function') {
        callback(errorResponse(code, code === 'RATE_LIMIT_EXCEEDED' ? 'Too many room creations. Please try again later.' : message));
      }
    }
  });

  socket.on('join-room', async (payload, callback) => {
    try {
      const { roomCode, deviceName } = payload;
      
      if (!roomCode || !deviceName) {
        callback(errorResponse('ROOM_INVALID', 'Room code and device name are required.'));
        return;
      }

      const sanitizedCode = roomCode.trim().toUpperCase();
      const sanitizedName = sanitizeDeviceName(deviceName);

      if (!validateRoomCode(sanitizedCode)) {
        callback(errorResponse('ROOM_INVALID', 'Invalid room code format.'));
        return;
      }

      const room = roomService.getRoomByCode(sanitizedCode);
      if (!room) {
        callback(errorResponse('ROOM_NOT_FOUND', 'Room not found.'));
        return;
      }

      roomService.joinRoom(sanitizedCode, socket.id, sanitizedName);
      
      socket.join(sanitizedCode);
      
      const updatedRoom = roomService.getRoomByCode(sanitizedCode);
      if (updatedRoom?.host?.connected) {
        socket.to(sanitizedCode).emit('presentation-request', {
          deviceName: sanitizedName,
        });
      }

      callback({
        success: true,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to join room';
      const code = error instanceof Error ? (error as Error).message : 'JOIN_FAILED';
      callback(errorResponse(code, message));
    }
  });

  socket.on('accept-request', async (_payload, callback) => {
    try {
      const room = roomService.getRoomByHostSocketId(socket.id);
      if (!room) {
        callback(errorResponse('ROOM_NOT_FOUND', 'Room not found.'));
        return;
      }

      const result = roomService.approveRequest(room.roomCode);
      
      socket.to(room.roomCode).emit('accept-request', {
        approved: true,
        sessionToken: result.sessionToken,
      });

      callback({
        success: true,
        sessionToken: result.sessionToken,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to accept request';
      const code = error instanceof Error ? (error as Error).message : 'ACCEPT_FAILED';
      callback(errorResponse(code, message));
    }
  });

  socket.on('reject-request', async (_payload, callback) => {
    try {
      const room = roomService.getRoomByHostSocketId(socket.id);
      if (!room) {
        callback(errorResponse('ROOM_NOT_FOUND', 'Room not found.'));
        return;
      }

      roomService.rejectRequest(room.roomCode);
      
      socket.to(room.roomCode).emit('accept-request', {
        approved: false,
      });

      callback({
        success: true,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to reject request';
      const code = error instanceof Error ? (error as Error).message : 'REJECT_FAILED';
      callback(errorResponse(code, message));
    }
  });

  socket.on('start-sharing', async (_payload, callback) => {
    try {
      const room = roomService.getRoomByHostSocketId(socket.id) || roomService.getRoomByPresenterSocketId(socket.id);
      if (!room) {
        callback(errorResponse('ROOM_NOT_FOUND', 'Room not found.'));
        return;
      }

      if (room.status !== RoomStatus.APPROVED && room.status !== RoomStatus.STREAMING) {
        callback(errorResponse('ROOM_INVALID', 'Room is not approved for sharing.'));
        return;
      }

      roomService.startStreaming(room.roomCode);
      
      socket.to(room.roomCode).emit('start-sharing');

      callback({
        success: true,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to start sharing';
      const code = error instanceof Error ? (error as Error).message : 'START_SHARING_FAILED';
      callback(errorResponse(code, message));
    }
  });

  socket.on('stop-sharing', async (_payload, callback) => {
    try {
      const room = roomService.getRoomByHostSocketId(socket.id) || roomService.getRoomByPresenterSocketId(socket.id);
      if (!room) {
        callback(errorResponse('ROOM_NOT_FOUND', 'Room not found.'));
        return;
      }

      if (room.status !== RoomStatus.STREAMING && room.status !== RoomStatus.APPROVED) {
        callback(errorResponse('ROOM_INVALID', 'Room is not currently streaming.'));
        return;
      }

      roomService.endSession(room.roomCode);
      
      socket.to(room.roomCode).emit('stop-sharing');

      callback({
        success: true,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to stop sharing';
      const code = error instanceof Error ? (error as Error).message : 'STOP_SHARING_FAILED';
      callback(errorResponse(code, message));
    }
  });

  socket.on('disconnect-session', async (_payload, callback) => {
    try {
      const room = roomService.getRoomByHostSocketId(socket.id) || roomService.getRoomByPresenterSocketId(socket.id);
      if (!room) {
        callback(errorResponse('ROOM_NOT_FOUND', 'Room not found.'));
        return;
      }

      if (room.status !== RoomStatus.STREAMING && room.status !== RoomStatus.APPROVED) {
        callback(errorResponse('ROOM_INVALID', 'Room is not in an active session.'));
        return;
      }

      roomService.endSession(room.roomCode);
      
      socket.to(room.roomCode).emit('disconnect-session');

      callback({
        success: true,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to disconnect session';
      const code = error instanceof Error ? (error as Error).message : 'DISCONNECT_FAILED';
      callback(errorResponse(code, message));
    }
  });

  socket.on('webrtc-offer', async (payload, callback) => {
    try {
      const { sdp, sessionToken } = payload;
      
      if (!sdp || !sessionToken || !validateSDP(sdp) || !validateSessionToken(sessionToken)) {
        logger.warn({ payload: 'webrtc-offer', reason: 'invalid payload' }, 'webrtc-offer rejected');
        callback('Invalid payload');
        return;
      }

      const room = roomService.getRoomByPresenterSocketId(socket.id);
      if (!room || !roomService.validateSessionToken(room.roomCode, sessionToken)) {
        logger.warn({ payload: 'webrtc-offer', reason: 'invalid session token' }, 'webrtc-offer rejected');
        callback('Invalid session token');
        return;
      }

      logger.info({ roomCode: room.roomCode, sessionToken: sessionToken.slice(0, 8) + '...' }, 'Forwarding webrtc-offer to room');
      socket.to(room.roomCode).emit('webrtc-offer', {
        sdp,
        sessionToken,
      });

      callback();
    } catch (error) {
      logger.error({ error }, 'Failed to forward webrtc-offer');
      callback(error instanceof Error ? error.message : 'Failed to forward offer');
    }
  });

  socket.on('webrtc-answer', async (payload, callback) => {
    try {
      const { sdp, sessionToken } = payload;
      
      if (!sdp || !sessionToken || !validateSDP(sdp) || !validateSessionToken(sessionToken)) {
        logger.warn({ payload: 'webrtc-answer', reason: 'invalid payload' }, 'webrtc-answer rejected');
        callback('Invalid payload');
        return;
      }

      const room = roomService.getRoomByHostSocketId(socket.id);
      if (!room || !roomService.validateSessionToken(room.roomCode, sessionToken)) {
        logger.warn({ payload: 'webrtc-answer', reason: 'invalid session token' }, 'webrtc-answer rejected');
        callback('Invalid session token');
        return;
      }

      logger.info({ roomCode: room.roomCode, sessionToken: sessionToken.slice(0, 8) + '...' }, 'Forwarding webrtc-answer to room');
      socket.to(room.roomCode).emit('webrtc-answer', {
        sdp,
        sessionToken,
      });

      callback();
    } catch (error) {
      logger.error({ error }, 'Failed to forward webrtc-answer');
      callback(error instanceof Error ? error.message : 'Failed to forward answer');
    }
  });

  socket.on('ice-candidate', async (payload, callback) => {
    try {
      const { candidate, sdpMid, sdpMLineIndex, sessionToken } = payload;
      
      if (!candidate || !sdpMid || sdpMLineIndex === undefined || !sessionToken || !validateICECandidate(candidate) || !validateSessionToken(sessionToken)) {
        logger.warn({ payload: 'ice-candidate', reason: 'invalid payload' }, 'ice-candidate rejected');
        callback('Invalid payload');
        return;
      }

      const room = roomService.getRoomByPresenterSocketId(socket.id) || roomService.getRoomByHostSocketId(socket.id);
      if (!room || !roomService.validateSessionToken(room.roomCode, sessionToken)) {
        logger.warn({ payload: 'ice-candidate', reason: 'invalid session token' }, 'ice-candidate rejected');
        callback('Invalid session token');
        return;
      }

      logger.info({ roomCode: room.roomCode, sessionToken: sessionToken.slice(0, 8) + '...' }, 'Forwarding ice-candidate to room');
      socket.to(room.roomCode).emit('ice-candidate', {
        candidate,
        sdpMid,
        sdpMLineIndex,
        sessionToken,
      });

      callback();
    } catch (error) {
      logger.error({ error }, 'Failed to forward ice-candidate');
      callback(error instanceof Error ? error.message : 'Failed to forward ICE candidate');
    }
  });
}
