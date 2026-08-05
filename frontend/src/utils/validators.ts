import { z } from 'zod';
import { ROOM_CODE_LENGTH, MAX_DEVICE_NAME_LENGTH } from './constants.js';

export const roomCodeSchema = z
  .string()
  .length(ROOM_CODE_LENGTH, `Room code must be exactly ${ROOM_CODE_LENGTH} characters`)
  .regex(/^[A-Z0-9]+$/i, 'Room code must be alphanumeric')
  .transform((val) => val.toUpperCase());

export const deviceNameSchema = z
  .string()
  .min(1, 'Device name is required')
  .max(MAX_DEVICE_NAME_LENGTH, `Device name must be at most ${MAX_DEVICE_NAME_LENGTH} characters`);
