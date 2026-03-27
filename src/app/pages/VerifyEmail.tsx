import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { toast } from 'sonner';
import Card from '../components/Card';
import Logo from '../components/Logo';
import Button from '../components/Button';
import { authService } from '../lib/auth';
import { securityManager } from '../lib/security';

export default function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();

  const token = new URLSearchParams(location.search).get('token') ?? '';
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error('Missing verification token');
      return;
    }

    let cancelled = false;
    (async () => {
      setIsVerifying(true);
      try {
        await authService.verifyEmail(token);
        if (cancelled) return;
        toast.success('Email verified!', { description: 'You can now sign in.' });
        navigate('/login', { replace: true });
      } catch (err) {
        if (cancelled) return;
        toast.error(err instanceof Error ? err.message : 'Email verification failed');
      } finally {
        if (!cancelled) setIsVerifying(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate, token]);

  return (
    <div className="min-h-screen bg-[#111111] dark:bg-[#111111] light:bg-[#FAFAFA]">
      <div className="px-6 pt-16 pb-6">
        <div className="flex items-center justify-between mb-6">
          <Logo size="sm" variant="wordmark" />
          <Link to="/login" className="text-sm font-semibold text-cyan-500 hover:text-cyan-400">
            Back to sign in
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-white light:text-gray-900 tracking-tight">Verify email</h1>
        <p className="text-sm text-gray-400 light:text-gray-600 mt-2">
          {isVerifying ? 'Verifying your account…' : 'Completing verification'}
        </p>
      </div>

      <div className="px-6">
        <Card className="p-6">
          <p className="text-sm text-gray-400 light:text-gray-600">
            {token
              ? `Token: ${securityManager.sanitizeInput(token).slice(0, 12)}…`
              : 'No token found in the URL.'}
          </p>
          <div className="mt-4">
            <Button fullWidth size="lg" variant="secondary" disabled={isVerifying} onClick={() => navigate('/login')}>
              Continue to login
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

