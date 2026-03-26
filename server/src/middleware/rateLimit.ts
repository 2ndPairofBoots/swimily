import type { Request, Response, NextFunction } from 'express';

type RateLimitOptions = {
  windowMs: number;
  max: number;
  keyPrefix: string;
};

type Bucket = {
  count: number;
  resetTime: number;
};

const buckets = new Map<string, Bucket>();

function getUserKey(req: Request): string {
  return String((req as any).auth?.userId ?? req.ip ?? 'anonymous');
}

export function rateLimitByUser(options: RateLimitOptions) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userKey = getUserKey(req);
    const key = `${options.keyPrefix}:${userKey}`;

    const now = Date.now();
    const bucket = buckets.get(key);

    if (!bucket || now > bucket.resetTime) {
      buckets.set(key, { count: 1, resetTime: now + options.windowMs });
      return next();
    }

    if (bucket.count >= options.max) {
      const retryAfterSeconds = Math.max(1, Math.ceil((bucket.resetTime - now) / 1000));
      return res.status(429).json({
        error: 'Rate limit exceeded',
        retryAfterSeconds,
      });
    }

    bucket.count += 1;
    buckets.set(key, bucket);
    return next();
  };
}

