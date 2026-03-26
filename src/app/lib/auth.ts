import { securityManager, logSecurityEvent, validateOwnership } from './security';

export interface User {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

class AuthService {
  private currentUser: User | null = null;
  private authToken: string | null = null;

  async login(email: string, password: string): Promise<User> {
    try {
      securityManager.recordLoginAttempt(email);

      logSecurityEvent('login_attempt', { email }, 'info');

      const response = await this.authenticatedFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({} as any));
        const msg = (error?.error as string | undefined) ?? (error?.message as string | undefined) ?? 'Login failed';
        logSecurityEvent('login_failed', { email, reason: msg }, 'warning');
        throw new Error(msg);
      }

      const { user, token, expiresIn } = await response.json();

      this.setAuthToken(token, expiresIn);
      this.currentUser = user;
      securityManager.clearLoginAttempts(email);
      securityManager.startSession();

      logSecurityEvent('login_success', { userId: user.id }, 'info');

      return user;
    } catch (error) {
      logSecurityEvent('login_error', { email, error: String(error) }, 'error');
      throw error;
    }
  }

  async register(email: string, password: string, name: string): Promise<void> {
    const passwordValidation = securityManager.validatePassword(password);
    
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.errors.join('. '));
    }

    if (!securityManager.validateEmail(email)) {
      throw new Error('Invalid email format');
    }

    try {
      const response = await this.authenticatedFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ 
          email: email.toLowerCase().trim(), 
          password, 
          name: securityManager.sanitizeInput(name)
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({} as any));
        const msg = (error?.error as string | undefined) ?? (error?.message as string | undefined) ?? 'Registration failed';
        throw new Error(msg);
      }

      logSecurityEvent('registration_success', { email }, 'info');
    } catch (error) {
      logSecurityEvent('registration_error', { email, error: String(error) }, 'error');
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      if (this.authToken) {
        await this.authenticatedFetch('/api/auth/logout', {
          method: 'POST',
        });
      }

      logSecurityEvent('logout', { userId: this.currentUser?.id }, 'info');
    } catch (error) {
      logSecurityEvent('logout_error', { error: String(error) }, 'error');
    } finally {
      this.clearAuth();
    }
  }

  async requestPasswordReset(email: string): Promise<void> {
    try {
      const response = await this.authenticatedFetch('/api/auth/password-reset/request', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to send password reset email');
      }

      logSecurityEvent('password_reset_requested', { email }, 'info');
    } catch (error) {
      logSecurityEvent('password_reset_error', { email, error: String(error) }, 'error');
      throw error;
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const passwordValidation = securityManager.validatePassword(newPassword);
    
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.errors.join('. '));
    }

    try {
      const response = await this.authenticatedFetch('/api/auth/password-reset/confirm', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({} as any));
        const msg = (error?.error as string | undefined) ?? (error?.message as string | undefined) ?? 'Password reset failed';
        throw new Error(msg);
      }

      logSecurityEvent('password_reset_success', {}, 'info');
    } catch (error) {
      logSecurityEvent('password_reset_failed', { error: String(error) }, 'error');
      throw error;
    }
  }

  async verifyEmail(token: string): Promise<void> {
    try {
      const response = await this.authenticatedFetch('/api/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({} as any));
        const msg = (error?.error as string | undefined) ?? (error?.message as string | undefined) ?? 'Email verification failed';
        throw new Error(msg);
      }

      logSecurityEvent('email_verified', {}, 'info');
    } catch (error) {
      logSecurityEvent('email_verification_failed', { error: String(error) }, 'error');
      throw error;
    }
  }

  async refreshToken(): Promise<void> {
    try {
      const response = await this.authenticatedFetch('/api/auth/refresh', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const { token, expiresIn, user } = await response.json();
      this.setAuthToken(token, expiresIn);
      if (user) {
        this.currentUser = user;
      }
      // We might be hydrating from a cold start where sessionExpiry is unset.
      securityManager.startSession();
    } catch (error) {
      logSecurityEvent('token_refresh_failed', { error: String(error) }, 'error');
      this.clearAuth();
      throw error;
    }
  }

  getCurrentUser(): User | null {
    if (!securityManager.isSessionValid()) {
      this.clearAuth();
      return null;
    }
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null && securityManager.isSessionValid();
  }

  getAuthToken(): string | null {
    return this.authToken;
  }

  private setAuthToken(token: string, expiresIn: number): void {
    this.authToken = token;
    
    const expiryTime = Date.now() + (expiresIn * 1000);
    sessionStorage.setItem('auth_token_expiry', String(expiryTime));

    setTimeout(() => {
      this.refreshToken().catch(() => this.clearAuth());
    }, (expiresIn - 300) * 1000);
  }

  private clearAuth(): void {
    this.currentUser = null;
    this.authToken = null;
    sessionStorage.removeItem('auth_token_expiry');
    securityManager.endSession();
  }

  private async authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'same-origin',
    });

    return response;
  }

  async fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated');
    }

    if (this.currentUser) {
      securityManager.checkApiRateLimit(this.currentUser.id);
    }

    return this.authenticatedFetch(url, options);
  }

  validateResourceOwnership(resourceOwnerId: string): boolean {
    if (!this.currentUser) {
      throw new Error('Not authenticated');
    }
    return validateOwnership(this.currentUser.id, resourceOwnerId);
  }
}

export const authService = new AuthService();

export async function secureFetch(
  url: string,
  options: RequestInit = {},
  requiresOwnership?: { resourceOwnerId: string }
): Promise<Response> {
  if (requiresOwnership) {
    authService.validateResourceOwnership(requiresOwnership.resourceOwnerId);
  }

  return authService.fetchWithAuth(url, options);
}
