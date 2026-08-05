import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
  port: z.coerce.number().default(3000),
  frontendUrl: z.string().url().default('http://localhost:5173'),
  stunServer: z.string().default('stun:stun.l.google.com:19302'),
  turnServer: z.string().optional(),
  turnUsername: z.string().optional(),
  turnPassword: z.string().optional(),
});

export const config = envSchema.parse(process.env);
