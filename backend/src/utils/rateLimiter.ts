import { MAX_ROOMS_PER_HOUR, RATE_LIMIT_WINDOW_MS } from '../constants/index.js';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

export class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();

  check(socketId: string): boolean {
    const now = Date.now();
    const entry = this.limits.get(socketId);

    if (!entry || now > entry.resetAt) {
      this.limits.set(socketId, {
        count: 1,
        resetAt: now + RATE_LIMIT_WINDOW_MS,
      });
      return true;
    }

    if (entry.count >= MAX_ROOMS_PER_HOUR) {
      return false;
    }

    entry.count++;
    return true;
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.limits) {
      if (now > entry.resetAt) {
        this.limits.delete(key);
      }
    }
  }
}

export const rateLimiter = new RateLimiter();
