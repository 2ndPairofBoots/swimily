import fs from 'fs';
import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';

function getPublicKey() {
  const fromPath = process.env.JWT_PUBLIC_KEY_PATH;
  if (fromPath) return fs.readFileSync(fromPath, 'utf8');
  const inline = process.env.JWT_PUBLIC_KEY;
  if (inline) return inline;
  throw new Error('Missing JWT_PUBLIC_KEY_PATH (or JWT_PUBLIC_KEY)');
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = header.substring(7);

  try {
    const decoded = jwt.verify(token, getPublicKey(), {
      algorithms: ['RS256'],
      issuer: process.env.JWT_ISSUER ?? 'swimily-api',
      audience: process.env.JWT_AUDIENCE ?? 'swimily-app',
    }) as jwt.JwtPayload & { userId?: string; email?: string };

    if (!decoded.userId) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    (req as any).auth = {
      userId: decoded.userId,
      email: decoded.email ?? null,
    };
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

