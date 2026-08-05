import { customAlphabet } from 'nanoid';
import { ROOM_CODE_LENGTH, SESSION_TOKEN_LENGTH } from '../constants/index.js';

const roomCodeAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const tokenAlphabet = '0123456789abcdef';

export const generateRoomCode = (): string => {
  const nanoid = customAlphabet(roomCodeAlphabet, ROOM_CODE_LENGTH);
  return nanoid();
};

export const generateSessionToken = (): string => {
  const nanoid = customAlphabet(tokenAlphabet, SESSION_TOKEN_LENGTH);
  return nanoid();
};

export const generateRoomId = (): string => {
  const nanoid = customAlphabet(tokenAlphabet, 21);
  return nanoid();
};
