import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/components/templates/AuthLayout';
import { Input } from '@/components/atoms/Input';
import { Button } from '@/components/atoms/Button';
import { AuthService } from '@/services/auth.service';
import { Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      await AuthService.requestOtp(email.trim().toLowerCase());
      toast.success('6-digit security code sent to your email!');
      navigate(`/auth/verify?email=${encodeURIComponent(email.trim().toLowerCase())}`);
    } catch (err: any) {
      setError(err.message || 'Failed to send security code');
      toast.error(err.message || 'Failed to send security code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome to Pola"
      subtitle="Sign in or register with your email or Google account"
      footerContent={
        <p>
          By signing in, you agree to Pola's{' '}
          <a href="#" className="underline font-semibold text-emerald-600">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="underline font-semibold text-emerald-600">
            Privacy Policy
          </a>
          .
        </p>
      }
    >
      <form onSubmit={handleRequestOtp} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          placeholder="e.g. farmer@pola.lk"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError('');
          }}
          error={error}
          leftIcon={<Mail className="w-4 h-4" />}
          autoFocus
          required
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          className="w-full"
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Continue with Email OTP
        </Button>
      </form>

      <div className="relative flex items-center justify-center my-4">
        <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
        <span className="bg-white dark:bg-slate-900 px-3 text-xs text-slate-400 font-medium uppercase tracking-wider shrink-0">
          Or instant sign in
        </span>
        <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
      </div>

      {/* Google OAuth Button */}
      <Button
        type="button"
        variant="outline"
        size="md"
        onClick={() => {
          toast('Google Sign-In is initialized via your Google OAuth Client ID');
        }}
        className="w-full"
        leftIcon={
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.99 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
        }
      >
        Sign in with Google
      </Button>

      <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 pt-2">
        <ShieldCheck className="w-4 h-4 text-emerald-600" />
        <span>Passwordless secure 6-digit code authentication</span>
      </div>
    </AuthLayout>
  );
};
