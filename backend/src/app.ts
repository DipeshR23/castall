import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/env.js';
import { logger } from './logger/pino.js';
import { setupSocketHandlers } from './sockets/index.js';
import healthRouter from './routes/health.js';
import { roomService } from './services/roomService.js';

const allowedOrigins = [config.frontendUrl, 'http://localhost:5173', 'http://localhost:5177'];

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
};

const app = express();

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use('/health', healthRouter);

const server = createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
  },
});

setupSocketHandlers(io);

const PORT = config.port;

server.listen(PORT, () => {
  logger.info(`Server listening on port ${PORT}`);
  logger.info(`Environment: ${config.nodeEnv}`);
});

setInterval(() => {
  try {
    const expired = roomService.expireOldRooms();
    if (expired.length > 0) {
      logger.info({ expiredCount: expired.length }, 'Expired old rooms');
    }
    roomService.cleanup();
  } catch (error) {
    logger.error({ error }, 'Room maintenance interval error');
  }
}, 60 * 1000);

export { app, server, io };
