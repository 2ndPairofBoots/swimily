import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { toast } from 'sonner';
import Card from '../components/Card';
import Logo from '../components/Logo';
import Button from '../components/Button';
import { authService } from '../lib/auth';

export default function PasswordResetConfirm() {
  const location = useLocation();
  const navigate = useNavigate();

  const token = new URLSearchParams(location.search).get('token') ?? '';
  const [newPassword, setNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!token) {
      toast.error('Missing reset token');
      return;
    }
    if (!newPassword) {
      toast.error('Enter a new password');
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.resetPassword(token, newPassword);
      toast.success('Password updated!', { description: 'You can now sign in.' });
      navigate('/login', { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Password reset failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] dark:bg-[#111111] light:bg-[#FAFAFA]">
      <div className="px-6 pt-16 pb-6">
        <div className="flex items-center justify-between mb-6">
          <Logo size="sm" />
          <Link to="/login" className="text-sm font-semibold text-cyan-500 hover:text-cyan-400">
            Back to sign in
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-white light:text-gray-900 tracking-tight">Reset password</h1>
        <p className="text-sm text-gray-400 light:text-gray-600 mt-2">
          Enter a new password to complete the reset.
        </p>
      </div>

      <div className="px-6">
        <Card className="p-6">
          <div className="space-y-4">
            <div className="bg-black/30 light:bg-gray-50 rounded-xl p-4 border border-white/10">
              <p className="text-xs text-gray-400 light:text-gray-600 font-bold uppercase tracking-wider mb-2">
                Token
              </p>
              <p className="text-xs text-gray-400 light:text-gray-600 font-mono break-all">
                {token ? `${token.slice(0, 10)}…` : 'Missing token'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 light:text-gray-600 uppercase tracking-wider mb-2">
                New password
              </label>
              <input
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                type="password"
                autoComplete="new-password"
                className="w-full px-4 py-3 bg-black/40 light:bg-gray-100 border border-white/10 light:border-gray-300 rounded-xl text-white light:text-gray-900 font-bold focus:ring-2 focus:ring-cyan-500"
                placeholder="At least 12 characters"
              />
            </div>

            <Button onClick={handleConfirm} fullWidth size="lg" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Updating…' : 'Update password'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

