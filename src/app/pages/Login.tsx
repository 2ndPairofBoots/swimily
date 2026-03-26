import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import Card from '../components/Card';
import Logo from '../components/Logo';
import Button from '../components/Button';
import { authService } from '../lib/auth';
import { securityManager } from '../lib/security';
import { useUser } from '../contexts/UserContext';
import { ageNumberToString, fetchOwnProfile } from '../lib/profile';

export default function Login() {
  const navigate = useNavigate();
  const { updateProfile, updatePreferences, updateNotifications } = useUser();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const trimmedEmail = email.toLowerCase().trim();
    if (!trimmedEmail) {
      toast.error('Enter your email');
      return;
    }

    if (!securityManager.validateEmail(trimmedEmail)) {
      toast.error('Enter a valid email address');
      return;
    }

    if (!password) {
      toast.error('Enter your password');
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.login(trimmedEmail, password);
      toast.success('Welcome back!', { description: 'Signed in successfully.' });

      // If onboarding isn't complete, route there; otherwise go straight to the app.
      const { profile, preferences, notifications, onboardingComplete } = await fetchOwnProfile();

      updateProfile({
        name: profile?.name ?? '',
        team: profile?.team ?? '',
        email: profile?.email ?? trimmedEmail,
        age: ageNumberToString(profile?.age),
        gender: profile?.gender ?? 'M',
        isPremium: profile?.isPremium ?? false,
      });

      updatePreferences({
        preferredCourse: preferences.preferredCourse ?? 'SCY',
        units: preferences.units ?? 'yards',
        haptics: preferences.haptics ?? true,
        analytics: preferences.analytics ?? true,
      });

      updateNotifications({
        pushEnabled: notifications.pushEnabled ?? true,
        emailEnabled: notifications.emailEnabled ?? true,
        practiceReminders: notifications.practiceReminders ?? true,
        achievements: notifications.achievements ?? true,
        weeklyReports: notifications.weeklyReports ?? true,
        meetReminders: notifications.meetReminders ?? true,
        prAlerts: notifications.prAlerts ?? true,
      });

      // onboardingComplete=true => go to app; false => send to onboarding
      navigate(onboardingComplete ? '/' : '/onboarding');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] dark:bg-[#111111] light:bg-[#FAFAFA]">
      <div className="px-6 pt-16 pb-6">
        <div className="flex items-center justify-between mb-6">
          <Logo size="sm" />
          <Link to="/register" className="text-sm font-semibold text-cyan-500 hover:text-cyan-400">
            Create account
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-white light:text-gray-900 tracking-tight">Sign in</h1>
        <p className="text-sm text-gray-400 light:text-gray-600 mt-2">
          Use your email and password to continue.
        </p>
      </div>

      <div className="px-6">
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 light:text-gray-600 uppercase tracking-wider mb-2">
                Email
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                autoComplete="email"
                inputMode="email"
                className="w-full px-4 py-3 bg-black/40 light:bg-gray-100 border border-white/10 light:border-gray-300 rounded-xl text-white light:text-gray-900 font-bold focus:ring-2 focus:ring-cyan-500"
                placeholder="you@domain.com"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 light:text-gray-600 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="w-full px-4 py-3 bg-black/40 light:bg-gray-100 border border-white/10 light:border-gray-300 rounded-xl text-white light:text-gray-900 font-bold focus:ring-2 focus:ring-cyan-500 pr-24"
                  placeholder="••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-2 text-xs font-semibold rounded-lg bg-white/10 light:bg-gray-900/5 text-cyan-300 hover:bg-white/20 light:hover:bg-gray-900/10 transition-colors"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <Button type="submit" variant="primary" size="lg" fullWidth disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </Button>

            <div className="text-center">
              <Link
                to="/password-reset"
                className="text-xs font-semibold text-cyan-500 hover:text-cyan-400"
              >
                Forgot password?
              </Link>
            </div>

            <div className="text-center pt-2">
              <Link to="/register" className="text-sm font-semibold text-cyan-500 hover:text-cyan-400">
                New here? Create an account
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

