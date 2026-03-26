export const SECURITY_CONFIG = {
  SESSION_TIMEOUT: 30 * 60 * 1000,
  MAX_LOGIN_ATTEMPTS: 5,
  LOGIN_ATTEMPT_WINDOW: 15 * 60 * 1000,
  PASSWORD_MIN_LENGTH: 12,
  RATE_LIMIT_REQUESTS: 100,
  RATE_LIMIT_WINDOW: 60 * 1000,
  AI_GENERATION_LIMIT: 10,
  AI_GENERATION_WINDOW: 24 * 60 * 60 * 1000,
};

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class SecurityManager {
  private loginAttempts: Map<string, RateLimitEntry> = new Map();
  private apiCalls: Map<string, RateLimitEntry> = new Map();
  private aiGenerations: Map<string, RateLimitEntry> = new Map();
  private sessionExpiry: number | null = null;

  checkRateLimit(
    identifier: string,
    type: 'login' | 'api' | 'ai',
    limit: number,
    window: number
  ): { allowed: boolean; remaining: number; resetTime: number } {
    const store = type === 'login' 
      ? this.loginAttempts 
      : type === 'api' 
      ? this.apiCalls 
      : this.aiGenerations;

    const now = Date.now();
    const entry = store.get(identifier);

    if (!entry || now > entry.resetTime) {
      const resetTime = now + window;
      store.set(identifier, { count: 1, resetTime });
      return { allowed: true, remaining: limit - 1, resetTime };
    }

    if (entry.count >= limit) {
      return { 
        allowed: false, 
        remaining: 0, 
        resetTime: entry.resetTime 
      };
    }

    entry.count++;
    return { 
      allowed: true, 
      remaining: limit - entry.count, 
      resetTime: entry.resetTime 
    };
  }

  recordLoginAttempt(email: string): boolean {
    const result = this.checkRateLimit(
      email,
      'login',
      SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS,
      SECURITY_CONFIG.LOGIN_ATTEMPT_WINDOW
    );

    if (!result.allowed) {
      const minutesRemaining = Math.ceil((result.resetTime - Date.now()) / 60000);
      throw new Error(
        `Too many login attempts. Please try again in ${minutesRemaining} minutes.`
      );
    }

    return true;
  }

  clearLoginAttempts(email: string): void {
    this.loginAttempts.delete(email);
  }

  checkApiRateLimit(userId: string): boolean {
    const result = this.checkRateLimit(
      userId,
      'api',
      SECURITY_CONFIG.RATE_LIMIT_REQUESTS,
      SECURITY_CONFIG.RATE_LIMIT_WINDOW
    );

    if (!result.allowed) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    return true;
  }

  checkAIGenerationLimit(userId: string): boolean {
    const result = this.checkRateLimit(
      userId,
      'ai',
      SECURITY_CONFIG.AI_GENERATION_LIMIT,
      SECURITY_CONFIG.AI_GENERATION_WINDOW
    );

    if (!result.allowed) {
      throw new Error('Daily AI generation limit reached. Upgrade to Premium for unlimited access.');
    }

    return true;
  }

  startSession(): void {
    this.sessionExpiry = Date.now() + SECURITY_CONFIG.SESSION_TIMEOUT;
    this.scheduleSessionCheck();
  }

  isSessionValid(): boolean {
    if (!this.sessionExpiry) return false;
    return Date.now() < this.sessionExpiry;
  }

  extendSession(): void {
    if (this.isSessionValid()) {
      this.sessionExpiry = Date.now() + SECURITY_CONFIG.SESSION_TIMEOUT;
    }
  }

  endSession(): void {
    this.sessionExpiry = null;
  }

  private scheduleSessionCheck(): void {
    setTimeout(() => {
      if (!this.isSessionValid()) {
        this.handleSessionExpiry();
      }
    }, SECURITY_CONFIG.SESSION_TIMEOUT);
  }

  private handleSessionExpiry(): void {
    this.endSession();
    window.location.href = '/login?reason=session_expired';
  }

  validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < SECURITY_CONFIG.PASSWORD_MIN_LENGTH) {
      errors.push(`Password must be at least ${SECURITY_CONFIG.PASSWORD_MIN_LENGTH} characters`);
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return { valid: errors.length === 0, errors };
  }

  sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '')
      .trim()
      .slice(0, 1000);
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

export const securityManager = new SecurityManager();

export function sanitizeHtml(html: string): string {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

export function generateCSRFToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export function validateOwnership(userId: string, resourceOwnerId: string): boolean {
  if (userId !== resourceOwnerId) {
    throw new Error('Unauthorized: You do not own this resource');
  }
  return true;
}

export function logSecurityEvent(
  event: string,
  details: Record<string, any>,
  level: 'info' | 'warning' | 'error' = 'info'
): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    level,
    details: {
      ...details,
      userAgent: navigator.userAgent,
      url: window.location.href,
    },
  };

  console.log(`[SECURITY ${level.toUpperCase()}]`, logEntry);
}
