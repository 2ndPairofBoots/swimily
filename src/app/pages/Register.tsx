import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import Card from '../components/Card';
import Logo from '../components/Logo';
import Button from '../components/Button';
import { authService } from '../lib/auth';
import { securityManager } from '../lib/security';

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const trimmedEmail = email.toLowerCase().trim();
    if (!name.trim()) {
      toast.error('Enter your name');
      return;
    }

    if (!trimmedEmail) {
      toast.error('Enter your email');
      return;
    }

    if (!securityManager.validateEmail(trimmedEmail)) {
      toast.error('Enter a valid email address');
      return;
    }

    const passwordValidation = securityManager.validatePassword(password);
    if (!passwordValidation.valid) {
      toast.error(passwordValidation.errors.join('. '));
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.register(trimmedEmail, password, securityManager.sanitizeInput(name));
      toast.success('Account created!', {
        description: 'Check your email to verify your account before signing in.',
      });
      navigate('/login');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] dark:bg-[#111111] light:bg-[#FAFAFA]">
      <div className="px-6 pt-16 pb-6">
        <div className="flex items-center justify-between mb-6">
          <Logo size="sm" variant="wordmark" />
        </div>

        <h1 className="text-3xl font-bold text-white light:text-gray-900 tracking-tight">Create account</h1>
        <p className="text-sm text-gray-400 light:text-gray-600 mt-2">
          Make it easy to track your training.
        </p>
      </div>

      <div className="px-6">
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 light:text-gray-600 uppercase tracking-wider mb-2">
                Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                type="text"
                autoComplete="name"
                className="w-full px-4 py-3 bg-black/40 light:bg-gray-100 border border-white/10 light:border-gray-300 rounded-xl text-white light:text-gray-900 font-bold focus:ring-2 focus:ring-cyan-500"
                placeholder="Your name"
              />
            </div>

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
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                autoComplete="new-password"
                className="w-full px-4 py-3 bg-black/40 light:bg-gray-100 border border-white/10 light:border-gray-300 rounded-xl text-white light:text-gray-900 font-bold focus:ring-2 focus:ring-cyan-500"
                placeholder="Create a strong password"
              />
            </div>

            <Button type="submit" variant="primary" size="lg" fullWidth disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create account'}
            </Button>

            <div className="text-center pt-2">
              <p className="text-xs text-gray-400 light:text-gray-600">
                By continuing, you agree to the Terms & Privacy.
              </p>
              <div className="mt-2 flex items-center justify-center gap-3">
                <Link to="/terms-privacy" className="text-xs font-semibold text-cyan-500 hover:text-cyan-400">
                  View terms
                </Link>
              </div>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

