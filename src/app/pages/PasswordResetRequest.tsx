import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import Card from '../components/Card';
import Logo from '../components/Logo';
import Button from '../components/Button';
import { securityManager } from '../lib/security';

export default function PasswordResetRequest() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);

  const handleRequest = async () => {
    const trimmedEmail = email.toLowerCase().trim();
    if (!trimmedEmail) {
      toast.error('Enter your email');
      return;
    }
    if (!securityManager.validateEmail(trimmedEmail)) {
      toast.error('Enter a valid email address');
      return;
    }

    setIsRequesting(true);
    try {
      const res = await fetch('/api/auth/password-reset/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ email: trimmedEmail }),
      });

      const body = (await res.json().catch(() => null)) as any;
      if (!res.ok) {
        throw new Error(body?.error || 'Password reset request failed');
      }

      toast.success('Reset request submitted', { description: body?.message ?? 'Check your inbox for a reset link.' });
      setResetToken(typeof body?.token === 'string' ? body.token : null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Password reset request failed');
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] dark:bg-[#111111] light:bg-[#FAFAFA]">
      <div className="px-6 pt-16 pb-6">
        <div className="flex items-center justify-between mb-6">
          <Logo size="sm" variant="wordmark" />
          <Link to="/login" className="text-sm font-semibold text-cyan-500 hover:text-cyan-400">
            Back to sign in
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-white light:text-gray-900 tracking-tight">Reset password</h1>
        <p className="text-sm text-gray-400 light:text-gray-600 mt-2">
          Enter your email and we will send a password reset link.
        </p>
      </div>

      <div className="px-6">
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 light:text-gray-600 uppercase tracking-wider mb-2">
                Email
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                autoComplete="email"
                className="w-full px-4 py-3 bg-black/40 light:bg-gray-100 border border-white/10 light:border-gray-300 rounded-xl text-white light:text-gray-900 font-bold focus:ring-2 focus:ring-cyan-500"
                placeholder="you@domain.com"
              />
            </div>

            <Button onClick={handleRequest} fullWidth size="lg" variant="primary" disabled={isRequesting}>
              {isRequesting ? 'Requesting…' : 'Request reset'}
            </Button>

            {resetToken && (
              <div className="bg-black/40 light:bg-gray-100 border border-white/10 light:border-gray-300 rounded-xl p-4">
                <p className="text-sm font-bold text-white light:text-gray-900 mb-2">Dev token (MVP only)</p>
                <p className="text-xs text-gray-400 light:text-gray-600 font-mono break-all mb-4">{resetToken}</p>
                <Button
                  fullWidth
                  size="lg"
                  variant="secondary"
                  onClick={() => navigate(`/password-reset/confirm?token=${encodeURIComponent(resetToken)}`)}
                >
                  Continue with token
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

