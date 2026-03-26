# Swimily Security Architecture

## Overview
This document outlines the comprehensive security implementation for Swimily, covering authentication, authorization, abuse protection, and deployment security.

---

## 1. Authentication Security

### Password Security
- **Hashing**: All passwords MUST be hashed using **Argon2id** (preferred) or **bcrypt** with work factor ≥12
- **Never** store plaintext passwords
- **Never** log passwords or include them in error messages

```typescript
// Backend implementation required (Node.js example)
import argon2 from 'argon2';

async function hashPassword(password: string): Promise<string> {
  return await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4
  });
}

async function verifyPassword(hash: string, password: string): Promise<boolean> {
  return await argon2.verify(hash, password);
}
```

### Session Management
- **JWT Tokens**: Use secure, httpOnly, sameSite cookies
- **Token Expiration**: 30 minutes for access tokens, 7 days for refresh tokens
- **Refresh Rotation**: Issue new refresh token on each use (prevents replay attacks)
- **Session Timeout**: Auto-logout after 30 minutes of inactivity

```typescript
// Backend JWT configuration
const JWT_CONFIG = {
  accessTokenExpiry: '30m',
  refreshTokenExpiry: '7d',
  issuer: 'swimily-api',
  audience: 'swimily-app',
  algorithm: 'RS256' // Use asymmetric encryption
};
```

### Email Verification
- **Required**: Users must verify email before full access
- **Token Expiration**: Verification tokens expire after 24 hours
- **Resend Limit**: Max 3 verification emails per hour per user

### Password Reset
- **Token Security**: Single-use tokens, expire after 1 hour
- **Rate Limiting**: Max 3 reset requests per hour per email
- **Invalidation**: Old tokens invalidate on password change
- **Notification**: Send email alert when password is changed

### Login Attempt Protection
- **Rate Limiting**: Max 5 failed attempts per email per 15 minutes
- **Progressive Delays**: Exponential backoff after failed attempts
- **Account Lockout**: Temporary lock after 10 failed attempts (30 min)
- **Logging**: All login attempts (success/failure) logged with IP, timestamp, user agent

---

## 2. Authorization & Access Control

### Ownership Verification
**CRITICAL**: Every data access MUST verify user owns the resource

```typescript
// Backend middleware example
async function verifyOwnership(req, res, next) {
  const { userId } = req.auth; // From verified JWT
  const { resourceId } = req.params;
  
  const resource = await db.query(
    'SELECT user_id FROM resources WHERE id = $1',
    [resourceId]
  );
  
  if (!resource || resource.user_id !== userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  next();
}
```

### IDOR Prevention
- **Never** expose sequential IDs in URLs
- Use **UUIDs** for all resource identifiers
- **Always** verify ownership before CRUD operations
- Implement **row-level security** in database

### API Endpoints Security

| Endpoint | Method | Ownership Check | Rate Limit |
|----------|--------|----------------|------------|
| `/api/practices` | GET | ✅ User's practices only | 100/min |
| `/api/practices/:id` | GET/PUT/DELETE | ✅ Verify user_id matches | 100/min |
| `/api/records` | GET | ✅ User's records only | 100/min |
| `/api/ai/generate` | POST | ✅ User authenticated | 10/day free, unlimited premium |
| `/api/profile` | GET/PUT | ✅ Own profile only | 100/min |

### Database Security
```sql
-- PostgreSQL Row-Level Security Example
ALTER TABLE practices ENABLE ROW LEVEL SECURITY;

CREATE POLICY practices_isolation ON practices
  USING (user_id = current_setting('app.user_id')::uuid);

-- Prevent horizontal privilege escalation
CREATE POLICY practices_owner_only ON practices
  FOR ALL
  USING (user_id = current_setting('app.user_id')::uuid)
  WITH CHECK (user_id = current_setting('app.user_id')::uuid);
```

---

## 3. Deployment Security

### HTTPS Enforcement
```nginx
# Nginx configuration
server {
  listen 80;
  server_name swimily.app;
  return 301 https://$server_name$request_uri;
}

server {
  listen 443 ssl http2;
  server_name swimily.app;
  
  ssl_certificate /path/to/cert.pem;
  ssl_certificate_key /path/to/key.pem;
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_ciphers HIGH:!aNULL:!MD5;
  
  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
}
```

### Environment Variables
**NEVER** commit secrets to repository. Use environment variables:

```bash
# .env (NEVER commit this file)
DATABASE_URL=postgresql://user:pass@host:5432/swimily
JWT_SECRET=<randomly-generated-256-bit-key>
JWT_REFRESH_SECRET=<different-random-key>
SMTP_API_KEY=<sendgrid-or-ses-key>
ENCRYPTION_KEY=<aes-256-key-for-sensitive-data>
STRIPE_SECRET_KEY=<stripe-key-for-premium>
```

```typescript
// Backend env validation
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  NODE_ENV: z.enum(['development', 'production', 'test']),
});

const env = envSchema.parse(process.env);
```

### Database Access Restrictions
- **Never** expose database directly to internet
- Use **private VPC** or **firewall rules**
- Database user should have **minimum required privileges**
- **Separate read/write users** where possible
- Enable **SSL/TLS** for database connections

```typescript
// Database connection with SSL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync('/path/to/ca-cert.pem').toString(),
  },
  max: 20,
  idleTimeoutMillis: 30000,
});
```

### Security Logging
```typescript
// Backend logging service
import winston from 'winston';

const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'security.log' }),
  ],
});

function logSecurityEvent(event: string, details: object) {
  securityLogger.info({
    timestamp: new Date().toISOString(),
    event,
    ...details,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });
}

// Log critical events
logSecurityEvent('login_attempt', { email, success: true });
logSecurityEvent('api_error', { endpoint, statusCode: 500 });
logSecurityEvent('suspicious_activity', { reason: 'multiple_failed_logins' });
```

### Security Headers
```typescript
// Express.js helmet configuration
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
}));
```

---

## 4. Abuse Protection & Rate Limiting

### Rate Limiting Implementation
```typescript
// Backend rate limiter (using Redis)
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

const limiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:',
  }),
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);
```

### Endpoint-Specific Limits

```typescript
// Login endpoint - strict limit
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  skipSuccessfulRequests: true,
  message: 'Too many login attempts, please try again later.',
});

app.post('/api/auth/login', loginLimiter, loginHandler);

// AI generation - daily limit
const aiLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: async (req) => {
    const user = await getUserById(req.auth.userId);
    return user.isPremium ? 1000 : 10; // 10 free, 1000 premium
  },
  message: 'Daily AI generation limit reached. Upgrade to Premium.',
});

app.post('/api/ai/generate', aiLimiter, aiGenerateHandler);

// Account creation - prevent spam
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 accounts per IP per hour
  message: 'Too many accounts created from this IP.',
});

app.post('/api/auth/register', registerLimiter, registerHandler);
```

### Bot Protection
- **CAPTCHA**: Require on login after 2 failed attempts
- **Fingerprinting**: Track device/browser fingerprints
- **Behavior Analysis**: Detect automated patterns (e.g., too-fast form submissions)
- **Honeypot Fields**: Hidden form fields that bots fill but humans don't

---

## 5. Frontend Security Best Practices

### Input Sanitization
```typescript
// Already implemented in /src/app/lib/security.ts
import { securityManager } from './lib/security';

const sanitizedInput = securityManager.sanitizeInput(userInput);
```

### XSS Prevention
- **Never** use `dangerouslySetInnerHTML`
- **Always** sanitize user-generated content
- React escapes content by default - maintain this
- Validate all inputs client-side AND server-side

### CSRF Protection
```typescript
// Frontend: Include CSRF token in requests
import { generateCSRFToken } from './lib/security';

const csrfToken = generateCSRFToken();

fetch('/api/endpoint', {
  method: 'POST',
  headers: {
    'X-CSRF-Token': csrfToken,
  },
  body: JSON.stringify(data),
});
```

### Secure Data Storage
- **Never** store sensitive data in localStorage
- Use **sessionStorage** for temporary auth tokens
- **Never** store passwords or API keys client-side
- Clear sensitive data on logout

---

## 6. Secrets Management Checklist

### ✅ Frontend (Current Implementation)
- [x] No API keys in code
- [x] No database credentials
- [x] No authentication secrets
- [x] No hardcoded tokens
- [x] `.env` files in `.gitignore`

### ⚠️ Backend (Required Implementation)
- [ ] Use environment variables for all secrets
- [ ] Rotate secrets regularly (quarterly minimum)
- [ ] Use secret management service (AWS Secrets Manager, HashiCorp Vault, etc.)
- [ ] Never log secrets
- [ ] Encrypt secrets at rest
- [ ] Use different secrets for dev/staging/production

---

## 7. Monitoring & Incident Response

### Security Monitoring
```typescript
// Backend monitoring
import { monitoring } from './services/monitoring';

// Alert on suspicious patterns
if (failedLoginAttempts > 10) {
  monitoring.alert('high_failed_logins', { email, count: failedLoginAttempts });
}

if (apiRequestRate > 1000) {
  monitoring.alert('unusual_traffic', { userId, rate: apiRequestRate });
}

if (errorRate > 0.05) {
  monitoring.alert('high_error_rate', { endpoint, rate: errorRate });
}
```

### Incident Response Plan
1. **Detect**: Automated alerts for security events
2. **Contain**: Automatic rate limiting, temporary locks
3. **Investigate**: Review logs, identify attack vector
4. **Remediate**: Patch vulnerability, force password resets if needed
5. **Notify**: Inform affected users within 72 hours (GDPR compliance)

---

## 8. Compliance & Privacy

### GDPR Compliance
- **Data Minimization**: Only collect necessary data
- **Right to Erasure**: Implement account deletion
- **Data Portability**: Allow users to export their data
- **Consent**: Clear opt-in for data processing
- **Breach Notification**: 72-hour notification requirement

### Data Encryption
```typescript
// Backend encryption for sensitive fields
import crypto from 'crypto';

const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
const ALGORITHM = 'aes-256-gcm';

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
}

function decrypt(encryptedData: string): string {
  const parts = encryptedData.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];
  
  const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
```

---

## 9. Security Checklist

### Pre-Deployment
- [ ] All passwords hashed with Argon2id/bcrypt
- [ ] JWT tokens use RS256 with proper expiry
- [ ] HTTPS enforced on all endpoints
- [ ] CORS configured to allow only trusted origins
- [ ] Rate limiting on all endpoints
- [ ] Input validation on all user inputs
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (sanitized outputs)
- [ ] CSRF tokens on state-changing requests
- [ ] Security headers configured (CSP, HSTS, X-Frame-Options)
- [ ] Database has row-level security
- [ ] Secrets in environment variables only
- [ ] Security logging implemented
- [ ] Error messages don't expose sensitive info
- [ ] Account lockout on failed login attempts
- [ ] Email verification required
- [ ] Password reset tokens expire

### Post-Deployment
- [ ] Monitor security logs daily
- [ ] Set up automated alerts
- [ ] Regular security audits (quarterly)
- [ ] Penetration testing (annually)
- [ ] Dependency updates (monthly)
- [ ] Secret rotation (quarterly)
- [ ] Review access logs for anomalies
- [ ] Test incident response plan

---

## 10. Implementation Priority

### Phase 1: Critical (Deploy Week 1)
1. ✅ Frontend security utilities
2. ⚠️ Backend authentication with Argon2id
3. ⚠️ JWT with httpOnly cookies
4. ⚠️ HTTPS enforcement
5. ⚠️ Basic rate limiting

### Phase 2: Essential (Week 2)
1. ⚠️ Email verification
2. ⚠️ Password reset flow
3. ⚠️ Ownership verification on all endpoints
4. ⚠️ Security logging
5. ⚠️ Environment variable management

### Phase 3: Enhanced (Week 3-4)
1. ⚠️ Advanced rate limiting with Redis
2. ⚠️ Bot protection (CAPTCHA)
3. ⚠️ Security monitoring & alerts
4. ⚠️ Row-level security in database
5. ⚠️ Encrypted sensitive fields

---

## Contact
For security issues, contact: security@swimily.app
PGP Key: [Include public key for encrypted communications]
