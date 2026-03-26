import { Router } from 'express';
import argon2 from 'argon2';
import cookieParser from 'cookie-parser';
import crypto from 'crypto';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { pool } from '../storage/db';
import { requireAuth } from '../middleware/auth';
import { rateLimitByUser } from '../middleware/rateLimit';

const authRouter = Router();

function getPrivateKey() {
  const fromPath = process.env.JWT_PRIVATE_KEY_PATH;
  if (fromPath) return fs.readFileSync(fromPath, 'utf8');
  const inline = process.env.JWT_PRIVATE_KEY;
  if (inline) return inline;
  throw new Error('Missing JWT_PRIVATE_KEY_PATH (or JWT_PRIVATE_KEY)');
}

const registerSchema = z.object({
  email: z.string().email().transform((v) => v.toLowerCase().trim()),
  password: z.string().min(12),
  name: z.string().min(2).max(100),
});

const loginSchema = z.object({
  email: z.string().email().transform((v) => v.toLowerCase().trim()),
  password: z.string().min(1),
});

const verifyEmailSchema = z.object({
  token: z.string().min(1).max(512),
});

const passwordResetRequestSchema = z.object({
  email: z.string().email().transform((v) => v.toLowerCase().trim()),
});

const passwordResetConfirmSchema = z.object({
  token: z.string().min(1).max(512),
  newPassword: z.string().min(12),
});

authRouter.post(
  '/register',
  rateLimitByUser({ windowMs: 60_000, max: 10, keyPrefix: 'auth_register' }),
  async (req, res) => {
  try {
    const { email, password, name } = registerSchema.parse(req.body);

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
    });

    // For MVP/dev: mark as verified so onboarding can proceed.
    const userResult = await pool.query(
      `INSERT INTO users (email, password_hash, name, email_verified)
       VALUES ($1, $2, $3, true)
       RETURNING id, email, name, email_verified, created_at`,
      [email, passwordHash, name]
    );

    const user = userResult.rows[0];
    return res.status(201).json({
      message: 'Registration successful. Please sign in.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.email_verified,
        createdAt: user.created_at,
      },
    });
  } catch (err) {
    return res.status(400).json({
      error: err instanceof Error ? err.message : 'Registration failed',
    });
  }
  }
);

authRouter.post(
  '/login',
  rateLimitByUser({ windowMs: 60_000, max: 20, keyPrefix: 'auth_login' }),
  async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const userResult = await pool.query(
      `SELECT id, email, name, password_hash, email_verified, created_at
       FROM users
       WHERE email = $1`,
      [email]
    );

    const user = userResult.rows[0];
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.email_verified) {
      return res.status(403).json({ error: 'Please verify your email before logging in.' });
    }

    const validPassword = await argon2.verify(user.password_hash, password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const accessToken = jwt.sign(
      { userId: user.id, email: user.email },
      getPrivateKey(),
      {
        algorithm: 'RS256',
        expiresIn: '30m',
        issuer: process.env.JWT_ISSUER ?? 'swimily-api',
        audience: process.env.JWT_AUDIENCE ?? 'swimily-app',
      }
    );

    const refreshToken = crypto.randomBytes(64).toString('hex');
    const refreshTokenHash = await argon2.hash(refreshToken);
    const refreshTokenSha256 = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await pool.query(
      `INSERT INTO sessions (user_id, refresh_token_hash, refresh_token_sha256, expires_at, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [user.id, refreshTokenHash, refreshTokenSha256, expiresAt, req.ip, req.headers['user-agent'] ?? null]
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.email_verified,
        createdAt: user.created_at,
      },
      token: accessToken,
      expiresIn: 1800,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Login failed' });
  }
  }
);

authRouter.post(
  '/refresh',
  rateLimitByUser({ windowMs: 60_000, max: 30, keyPrefix: 'auth_refresh' }),
  async (req, res) => {
  try {
    // CSRF hardening for refresh-cookie flow.
    // If APP_ORIGIN is set, require Origin/Referer to match it.
    const allowedOrigin = process.env.APP_ORIGIN;
    if (allowedOrigin) {
      const originHeader = req.headers.origin;
      let refererOrigin: string | null = null;
      const referer = req.headers.referer;
      if (referer) {
        try {
          refererOrigin = new URL(String(referer)).origin;
        } catch {
          refererOrigin = null;
        }
      }
      const providedOrigin = originHeader ?? refererOrigin;
      if (!providedOrigin || providedOrigin !== allowedOrigin) {
        return res.status(403).json({ error: 'CSRF origin mismatch' });
      }
    }

    const refreshToken = req.cookies?.refreshToken as string | undefined;
    if (!refreshToken) {
      return res.status(401).json({ error: 'No refresh token provided' });
    }

    // Fast path: lookup by sha256 (no argon2 verify loop)
    const refreshTokenSha256 = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const directSessionRes = await pool.query(
      `SELECT id, user_id
       FROM sessions
       WHERE refresh_token_sha256 = $1 AND expires_at > NOW()
       LIMIT 1`,
      [refreshTokenSha256]
    );

    let validSessionUserId: string | null = directSessionRes.rows[0]?.user_id ?? null;
    let validSessionId: string | null = directSessionRes.rows[0]?.id ?? null;

    const sessionsResult = await pool.query(
      `SELECT s.id, s.user_id, s.refresh_token_hash
       FROM sessions s
       WHERE s.expires_at > NOW()`
    );

    // Legacy fallback: scan + argon2 verify (older sessions created before sha256 column existed)
    if (!validSessionUserId || !validSessionId) {
      for (const session of sessionsResult.rows) {
        const isValid = await argon2.verify(session.refresh_token_hash, refreshToken);
        if (isValid) {
          validSessionUserId = session.user_id;
          validSessionId = session.id;
          break;
        }
      }
    }

    if (!validSessionUserId || !validSessionId) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const userResult = await pool.query(
      `SELECT id, email, name, email_verified, created_at
       FROM users
       WHERE id = $1`,
      [validSessionUserId]
    );
    const user = userResult.rows[0];

    const newAccessToken = jwt.sign(
      { userId: user.id, email: user.email },
      getPrivateKey(),
      { algorithm: 'RS256', expiresIn: '30m' }
    );

    const newRefreshToken = crypto.randomBytes(64).toString('hex');
    const newRefreshTokenHash = await argon2.hash(newRefreshToken);
    const newRefreshTokenSha256 = crypto.createHash('sha256').update(newRefreshToken).digest('hex');
    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await pool.query(
      `UPDATE sessions
       SET refresh_token_hash = $1, refresh_token_sha256 = $2, expires_at = $3
       WHERE id = $4`,
      [newRefreshTokenHash, newRefreshTokenSha256, newExpiresAt, validSessionId]
    );

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.email_verified,
        createdAt: user.created_at,
      },
      token: newAccessToken,
      expiresIn: 1800,
    });
  } catch {
    return res.status(500).json({ error: 'Token refresh failed' });
  }
  }
);

authRouter.post(
  '/logout',
  rateLimitByUser({ windowMs: 60_000, max: 30, keyPrefix: 'auth_logout' }),
  requireAuth,
  async (req, res) => {
  try {
    const userId = (req as any).auth?.userId as string | undefined;
    if (userId) {
      await pool.query('DELETE FROM sessions WHERE user_id = $1', [userId]);
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return res.status(204).send();
  } catch {
    return res.status(500).json({ error: 'Logout failed' });
  }
  }
);

authRouter.post(
  '/verify-email',
  rateLimitByUser({ windowMs: 60_000, max: 10, keyPrefix: 'verify_email' }),
  async (req, res) => {
    try {
      const body = verifyEmailSchema.parse(req.body);
      const maybeEmail = body.token.toLowerCase().trim();

      // MVP shortcut: if the token looks like an email, mark that user's email as verified.
      if (maybeEmail.includes('@')) {
        await pool.query(
          'UPDATE users SET email_verified = true, updated_at = NOW() WHERE email = $1',
          [maybeEmail]
        );
      }

      return res.status(200).json({ message: 'Email verified' });
    } catch (err) {
      return res.status(400).json({
        error: err instanceof Error ? err.message : 'Verify email failed',
      });
    }
  }
);

authRouter.post(
  '/password-reset/request',
  rateLimitByUser({ windowMs: 60_000, max: 5, keyPrefix: 'password_reset_request' }),
  async (req, res) => {
    try {
      const body = passwordResetRequestSchema.parse(req.body);

      const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [body.email]);
      const user = userResult.rows[0];

      // Avoid account enumeration.
      if (!user) {
        return res.status(200).json({ message: 'If your account exists, a reset link was sent.' });
      }

      const token = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await pool.query(
        `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
         VALUES ($1, $2, $3)`,
        [user.id, tokenHash, expiresAt]
      );

      const isDev = process.env.NODE_ENV !== 'production';
      return res.status(200).json({
        message: 'Password reset requested.',
        ...(isDev ? { token } : {}),
      });
    } catch (err) {
      return res.status(400).json({
        error: err instanceof Error ? err.message : 'Password reset request failed',
      });
    }
  }
);

authRouter.post(
  '/password-reset/confirm',
  rateLimitByUser({ windowMs: 60_000, max: 5, keyPrefix: 'password_reset_confirm' }),
  async (req, res) => {
    try {
      const body = passwordResetConfirmSchema.parse(req.body);

      const tokenHash = crypto.createHash('sha256').update(body.token).digest('hex');

      const tokenResult = await pool.query(
        `SELECT id, user_id, expires_at
         FROM password_reset_tokens
         WHERE token_hash = $1`,
        [tokenHash]
      );

      const tokenRow = tokenResult.rows[0];
      if (!tokenRow) return res.status(400).json({ error: 'Invalid or expired token' });
      if (new Date(tokenRow.expires_at) < new Date()) {
        await pool.query('DELETE FROM password_reset_tokens WHERE id = $1', [tokenRow.id]);
        return res.status(400).json({ error: 'Invalid or expired token' });
      }

      const passwordHash = await argon2.hash(body.newPassword, {
        type: argon2.argon2id,
      });

      await pool.query('BEGIN');
      try {
        await pool.query(
          'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
          [passwordHash, tokenRow.user_id]
        );
        await pool.query('DELETE FROM password_reset_tokens WHERE id = $1', [tokenRow.id]);
        await pool.query('COMMIT');
      } catch {
        await pool.query('ROLLBACK');
        throw new Error('Failed to reset password');
      }

      return res.status(200).json({ message: 'Password reset successful.' });
    } catch (err) {
      return res.status(400).json({
        error: err instanceof Error ? err.message : 'Password reset failed',
      });
    }
  }
);

export { authRouter };

