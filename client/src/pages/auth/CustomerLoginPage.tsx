import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AgroviaAuthLayout } from '@/components/templates/AgroviaAuthLayout';
import { Input } from '@/components/atoms/Input';
import { Button } from '@/components/atoms/Button';
import { GoogleSignInButton } from '@/components/molecules/GoogleSignInButton';
import { AuthService } from '@/services/auth.service';
import { Role } from '@pola/shared';
import { ShoppingBag, Mail, ArrowRight, ShieldCheck, CheckCircle2, ArrowUpRight } from 'lucide-react';
import toast from 'react-hot-toast';

export const CustomerLoginPage: React.FC = () => {
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
      const res: any = await AuthService.requestOtp(email.trim().toLowerCase(), Role.CUSTOMER_B2C);
      toast.success(res.message || '6-digit security code sent to your email!');

      if (res.devOtp) {
        toast(`[DEV MODE] Verification Code: ${res.devOtp}`, { icon: '🔑', duration: 7000 });
      }

      const searchParams = new URLSearchParams(window.location.search);
      const redirectParam = searchParams.get('redirect');
      const redirectQuery = redirectParam ? `&redirect=${encodeURIComponent(redirectParam)}` : '';

      navigate(
        `/auth/verify?email=${encodeURIComponent(email.trim().toLowerCase())}&role=${Role.CUSTOMER_B2C}${redirectQuery}`
      );
    } catch (err: any) {
      setError(err.message || 'Failed to send security code');
      toast.error(err.message || 'Failed to send security code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AgroviaAuthLayout
      portalId="customer"
      title="Buyer & Consumer Sign In"
      subtitle="Direct access to verified farmer harvests with 100% LankaPay escrow delivery guarantee."
      badgeContent={
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border border-emerald-400/30 bg-emerald-500/20 text-emerald-300">
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Customer & B2B Portal</span>
        </div>
      }
      footerContent={
        <div className="space-y-2">
          <p className="text-slate-300">
            Need producer or courier tools?{' '}
            <a href="/portals" className="underline font-bold text-emerald-300 hover:text-white transition-colors">
              Browse 4 Portals
            </a>
          </p>
          <p className="text-slate-400 text-[11px]">
            By signing in, you agree to Pola Escrow Terms & Conditions.
          </p>
        </div>
      }
    >
      <form onSubmit={handleRequestOtp} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-200 mb-1.5 tracking-wide">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              placeholder="e.g. buyer@gmail.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError('');
              }}
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:border-emerald-400 focus:bg-white/15 transition-all"
              autoFocus
              required
            />
          </div>
          {error && <p className="text-xs text-rose-400 mt-1 font-medium">{error}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 px-6 rounded-2xl bg-emerald-400 hover:bg-emerald-300 active:scale-[0.99] text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer disabled:opacity-60"
        >
          {isLoading ? (
            <span className="inline-block animate-spin w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full" />
          ) : (
            <>
              <span>Continue with Email OTP</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="relative flex items-center justify-center my-4">
        <div className="border-t border-white/15 w-full" />
        <span className="px-3 text-[11px] text-slate-300 font-bold uppercase tracking-wider shrink-0">
          Or instant SSO
        </span>
        <div className="border-t border-white/15 w-full" />
      </div>

      <div className="bg-white/95 rounded-2xl p-1.5 shadow-md">
        <GoogleSignInButton
          role={Role.CUSTOMER_B2C}
          onSuccess={(user, isNewUser) => {
            const searchParams = new URLSearchParams(window.location.search);
            const redirectParam = searchParams.get('redirect');

            if (redirectParam) {
              navigate(redirectParam);
            } else if (isNewUser && !user.onboardingCompleted) {
              navigate('/customer/onboarding');
            } else {
              navigate('/');
            }
          }}
        />
      </div>

      <div className="flex items-center justify-center gap-2 text-xs text-slate-300 pt-1">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>100% Escrow Protection • 6-Digit Delivery OTP</span>
      </div>
    </AgroviaAuthLayout>
  );
};
