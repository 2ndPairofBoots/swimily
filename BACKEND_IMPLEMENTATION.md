# Swimily Backend Implementation Guide

This document provides the complete backend implementation needed to securely support the Swimily frontend.

## Technology Stack

**Recommended Stack:**
- **Runtime**: Node.js 20+ with TypeScript
- **Framework**: Express.js or Fastify
- **Database**: PostgreSQL 15+ with pgcrypto extension
- **ORM**: Prisma or Drizzle
- **Authentication**: JWT with RS256
- **Caching/Rate Limiting**: Redis
- **Email**: SendGrid or AWS SES
- **File Storage**: AWS S3 or Cloudflare R2
- **Hosting**: Railway, Render, or AWS ECS

---

## 1. Database Schema

```sql
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  email_verification_token VARCHAR(255),
  email_verification_expires TIMESTAMP,
  password_reset_token VARCHAR(255),
  password_reset_expires TIMESTAMP,
  is_premium BOOLEAN DEFAULT FALSE,
  premium_expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP,
  login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP
);

-- Sessions table
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Practices table
CREATE TABLE practices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_yards INTEGER NOT NULL,
  total_time INTEGER,
  course VARCHAR(10) NOT NULL CHECK (course IN ('SCY', 'LCM')),
  focus VARCHAR(50),
  intensity VARCHAR(20),
  notes TEXT,
  xp_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Practice sets table
CREATE TABLE practice_sets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  practice_id UUID NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
  set_order INTEGER NOT NULL,
  distance INTEGER NOT NULL,
  reps INTEGER NOT NULL,
  interval VARCHAR(20),
  stroke VARCHAR(50),
  effort VARCHAR(20),
  notes TEXT
);

-- Personal records table
CREATE TABLE personal_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event VARCHAR(50) NOT NULL,
  course VARCHAR(10) NOT NULL CHECK (course IN ('SCY', 'LCM')),
  time_seconds DECIMAL(10, 2) NOT NULL,
  goal_time_seconds DECIMAL(10, 2),
  fina_points INTEGER,
  meet_name VARCHAR(255),
  meet_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, event, course)
);

-- Meets table
CREATE TABLE meets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  location VARCHAR(255),
  meet_type VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI generation tracking (for rate limiting)
CREATE TABLE ai_generations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  generation_type VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Security audit log
CREATE TABLE security_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  event_type VARCHAR(100) NOT NULL,
  event_details JSONB,
  ip_address INET,
  user_agent TEXT,
  severity VARCHAR(20) DEFAULT 'info',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_practices_user_date ON practices(user_id, date DESC);
CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);
CREATE INDEX idx_personal_records_user ON personal_records(user_id);
CREATE INDEX idx_security_logs_user ON security_logs(user_id);
CREATE INDEX idx_security_logs_created ON security_logs(created_at DESC);
CREATE INDEX idx_ai_generations_user_created ON ai_generations(user_id, created_at);

-- Row-level security
ALTER TABLE practices ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE meets ENABLE ROW LEVEL SECURITY;

CREATE POLICY practices_isolation ON practices
  FOR ALL
  USING (user_id = current_setting('app.user_id')::uuid)
  WITH CHECK (user_id = current_setting('app.user_id')::uuid);

CREATE POLICY records_isolation ON personal_records
  FOR ALL
  USING (user_id = current_setting('app.user_id')::uuid)
  WITH CHECK (user_id = current_setting('app.user_id')::uuid);

CREATE POLICY meets_isolation ON meets
  FOR ALL
  USING (user_id = current_setting('app.user_id')::uuid)
  WITH CHECK (user_id = current_setting('app.user_id')::uuid);
```

---

## 2. Authentication Endpoints

### POST /api/auth/register
```typescript
import argon2 from 'argon2';
import { z } from 'zod';
import { sendVerificationEmail } from '../services/email';
import { logSecurityEvent } from '../services/logging';

const registerSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(12),
  name: z.string().min(2).max(100),
});

export async function register(req, res) {
  try {
    const { email, password, name } = registerSchema.parse(req.body);
    
    const existingUser = await db.users.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    const passwordHash = await argon2.hash(password);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    const user = await db.users.create({
      data: {
        email,
        password_hash: passwordHash,
        name,
        email_verification_token: verificationToken,
        email_verification_expires: verificationExpires,
      },
    });
    
    await sendVerificationEmail(email, verificationToken);
    
    logSecurityEvent('user_registered', { userId: user.id, email }, req);
    
    res.status(201).json({ 
      message: 'Registration successful. Please check your email to verify your account.' 
    });
  } catch (error) {
    logSecurityEvent('registration_failed', { error: error.message }, req, 'error');
    res.status(400).json({ error: 'Registration failed' });
  }
}
```

### POST /api/auth/login
```typescript
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { readFileSync } from 'fs';

const privateKey = readFileSync(process.env.JWT_PRIVATE_KEY_PATH);
const publicKey = readFileSync(process.env.JWT_PUBLIC_KEY_PATH);

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    
    const user = await db.users.findUnique({ where: { email } });
    
    if (!user) {
      await logSecurityEvent('login_failed', { email, reason: 'user_not_found' }, req, 'warning');
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    if (user.locked_until && user.locked_until > new Date()) {
      const minutesRemaining = Math.ceil((user.locked_until - new Date()) / 60000);
      return res.status(429).json({ 
        error: `Account locked. Try again in ${minutesRemaining} minutes.` 
      });
    }
    
    const validPassword = await argon2.verify(user.password_hash, password);
    
    if (!validPassword) {
      await db.users.update({
        where: { id: user.id },
        data: { 
          login_attempts: user.login_attempts + 1,
          locked_until: user.login_attempts >= 9 
            ? new Date(Date.now() + 30 * 60 * 1000) 
            : null
        },
      });
      
      await logSecurityEvent('login_failed', { 
        userId: user.id, 
        email, 
        attempts: user.login_attempts + 1 
      }, req, 'warning');
      
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    if (!user.email_verified) {
      return res.status(403).json({ 
        error: 'Please verify your email before logging in.' 
      });
    }
    
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email },
      privateKey,
      { 
        algorithm: 'RS256', 
        expiresIn: '30m',
        issuer: 'swimily-api',
        audience: 'swimily-app'
      }
    );
    
    const refreshToken = crypto.randomBytes(64).toString('hex');
    const refreshTokenHash = await argon2.hash(refreshToken);
    
    await db.sessions.create({
      data: {
        user_id: user.id,
        refresh_token_hash: refreshTokenHash,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
      },
    });
    
    await db.users.update({
      where: { id: user.id },
      data: { 
        login_attempts: 0, 
        locked_until: null,
        last_login_at: new Date()
      },
    });
    
    await logSecurityEvent('login_success', { userId: user.id }, req);
    
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    
    res.json({
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
  } catch (error) {
    await logSecurityEvent('login_error', { error: error.message }, req, 'error');
    res.status(500).json({ error: 'Login failed' });
  }
}
```

### POST /api/auth/refresh
```typescript
export async function refreshToken(req, res) {
  try {
    const { refreshToken } = req.cookies;
    
    if (!refreshToken) {
      return res.status(401).json({ error: 'No refresh token provided' });
    }
    
    const sessions = await db.sessions.findMany({
      where: { expires_at: { gt: new Date() } },
      include: { user: true },
    });
    
    let validSession = null;
    for (const session of sessions) {
      const isValid = await argon2.verify(session.refresh_token_hash, refreshToken);
      if (isValid) {
        validSession = session;
        break;
      }
    }
    
    if (!validSession) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }
    
    const newAccessToken = jwt.sign(
      { userId: validSession.user.id, email: validSession.user.email },
      privateKey,
      { algorithm: 'RS256', expiresIn: '30m' }
    );
    
    const newRefreshToken = crypto.randomBytes(64).toString('hex');
    const newRefreshTokenHash = await argon2.hash(newRefreshToken);
    
    await db.sessions.update({
      where: { id: validSession.id },
      data: { 
        refresh_token_hash: newRefreshTokenHash,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      },
    });
    
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    
    res.json({ token: newAccessToken, expiresIn: 1800 });
  } catch (error) {
    res.status(500).json({ error: 'Token refresh failed' });
  }
}
```

---

## 3. Middleware

### Authentication Middleware
```typescript
export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.substring(7);
    
    const decoded = jwt.verify(token, publicKey, {
      algorithms: ['RS256'],
      issuer: 'swimily-api',
      audience: 'swimily-app'
    });
    
    req.auth = { userId: decoded.userId, email: decoded.email };
    
    await db.query('SET app.user_id = $1', [decoded.userId]);
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
}
```

### Ownership Verification
```typescript
export function verifyOwnership(resourceType: string) {
  return async (req, res, next) => {
    try {
      const resourceId = req.params.id;
      const { userId } = req.auth;
      
      const resource = await db[resourceType].findUnique({
        where: { id: resourceId },
      });
      
      if (!resource) {
        return res.status(404).json({ error: 'Resource not found' });
      }
      
      if (resource.user_id !== userId) {
        await logSecurityEvent('unauthorized_access_attempt', {
          userId,
          resourceType,
          resourceId,
        }, req, 'warning');
        
        return res.status(403).json({ error: 'Forbidden' });
      }
      
      next();
    } catch (error) {
      res.status(500).json({ error: 'Authorization check failed' });
    }
  };
}
```

### Rate Limiting
```typescript
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export const apiLimiter = rateLimit({
  store: new RedisStore({ client: redis, prefix: 'rl:api:' }),
  windowMs: 60 * 1000,
  max: 100,
  message: 'Too many requests',
  standardHeaders: true,
});

export const loginLimiter = rateLimit({
  store: new RedisStore({ client: redis, prefix: 'rl:login:' }),
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  message: 'Too many login attempts',
});

export const aiLimiter = async (req, res, next) => {
  const { userId } = req.auth;
  
  const user = await db.users.findUnique({ where: { id: userId } });
  
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentGenerations = await db.ai_generations.count({
    where: {
      user_id: userId,
      created_at: { gt: oneDayAgo },
    },
  });
  
  const limit = user.is_premium ? 1000 : 10;
  
  if (recentGenerations >= limit) {
    return res.status(429).json({ 
      error: 'Daily AI generation limit reached' 
    });
  }
  
  next();
};
```

---

## 4. API Endpoints

### Practices
```typescript
// GET /api/practices
app.get('/api/practices', authenticate, async (req, res) => {
  const { userId } = req.auth;
  
  const practices = await db.practices.findMany({
    where: { user_id: userId },
    include: { practice_sets: true },
    orderBy: { date: 'desc' },
  });
  
  res.json(practices);
});

// POST /api/practices
app.post('/api/practices', authenticate, async (req, res) => {
  const { userId } = req.auth;
  const practiceData = req.body;
  
  const practice = await db.practices.create({
    data: {
      ...practiceData,
      user_id: userId,
    },
  });
  
  res.status(201).json(practice);
});

// DELETE /api/practices/:id
app.delete('/api/practices/:id', 
  authenticate, 
  verifyOwnership('practices'), 
  async (req, res) => {
    await db.practices.delete({ where: { id: req.params.id } });
    res.status(204).send();
  }
);
```

---

## 5. Deployment Configuration

### Nginx
```nginx
server {
  listen 443 ssl http2;
  server_name api.swimily.app;

  ssl_certificate /etc/letsencrypt/live/swimily.app/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/swimily.app/privkey.pem;
  
  location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
  }
}
```

### Docker
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

---

## Next Steps

1. Set up PostgreSQL database
2. Implement authentication endpoints
3. Add ownership verification to all resources
4. Configure rate limiting with Redis
5. Set up email service (SendGrid/SES)
6. Deploy to production with HTTPS
7. Configure monitoring and logging
8. Run security audit
9. Perform penetration testing

This backend will provide enterprise-grade security for Swimily.
