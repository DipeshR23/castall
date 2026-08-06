import { Router } from 'express';

const router = Router();

router.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

router.get('/version', (_req, res) => {
  res.json({
    version: '1.0.0',
    name: 'castall-backend',
  });
});

export default router;
