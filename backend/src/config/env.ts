import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const rawEnv = {
  nodeEnv: process.env.NODE_ENV,
  port: process.env.PORT,
  frontendUrl: process.env.FRONTEND_URL,
  stunServer: process.env.STUN_SERVER,
  turnServer: process.env.TURN_SERVER,
  turnUsername: process.env.TURN_USERNAME,
  turnPassword: process.env.TURN_PASSWORD,
};

const envSchema = z.object({
  nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
  port: z.coerce.number().default(3000),
  frontendUrl: z.string().url().default('http://localhost:5173'),
  stunServer: z.string().default('stun:stun.l.google.com:19302'),
  turnServer: z.string().optional(),
  turnUsername: z.string().optional(),
  turnPassword: z.string().optional(),
});

export const config = envSchema.parse(rawEnv);
