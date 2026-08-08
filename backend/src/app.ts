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

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
  })
);

app.use(express.json());
app.use('/health', healthRouter);
app.use('/', healthRouter);

const server = createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: config.frontendUrl,
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
  const expired = roomService.expireOldRooms();
  if (expired.length > 0) {
    logger.info({ expiredCount: expired.length }, 'Expired old rooms');
  }
  roomService.cleanup();
}, 60 * 1000);

export { app, server, io };
