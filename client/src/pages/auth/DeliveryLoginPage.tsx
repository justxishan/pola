import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AgroviaAuthLayout } from '@/components/templates/AgroviaAuthLayout';
import { GoogleSignInButton } from '@/components/molecules/GoogleSignInButton';
import { AuthService } from '@/services/auth.service';
import { Role } from '@pola/shared';
import { Truck, Mail, ArrowRight, ShieldCheck, Radar, Navigation } from 'lucide-react';
import toast from 'react-hot-toast';

export const DeliveryLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid driver or fleet email');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      const res: any = await AuthService.requestOtp(email.trim().toLowerCase(), Role.DELIVERY_INDIVIDUAL);
      toast.success(res.message || '6-digit driver code sent!');

      if (res.devOtp) {
        toast(`[DEV MODE] Verification Code: ${res.devOtp}`, { icon: '🔑', duration: 7000 });
      }

      navigate(
        `/auth/verify?email=${encodeURIComponent(email.trim().toLowerCase())}&role=${Role.DELIVERY_INDIVIDUAL}`
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
      portalId="delivery"
      title="Delivery Fleet Sign In"
      subtitle="Access GPS radius radar, accept farm-to-hub trips, and withdraw daily LankaPay earnings."
      badgeContent={
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border border-yellow-400/30 bg-yellow-500/20 text-yellow-300">
          <Truck className="w-3.5 h-3.5" />
          <span>Courier & Fleet Portal</span>
        </div>
      }
      footerContent={
        <div className="space-y-2">
          <p className="text-slate-300">
            Looking for another portal?{' '}
            <a href="/portals" className="underline font-bold text-yellow-300 hover:text-white transition-colors">
              View all 4 Portals
            </a>
          </p>
          <p className="text-slate-400 text-[11px]">
            GPS-tracked agritech logistics with instant proof-of-delivery OTP release.
          </p>
        </div>
      }
    >
      <form onSubmit={handleRequestOtp} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-200 mb-1.5 tracking-wide">
            Registered Courier Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              placeholder="e.g. driver@pola.lk"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError('');
              }}
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:border-yellow-400 focus:bg-white/15 transition-all"
              autoFocus
              required
            />
          </div>
          {error && <p className="text-xs text-rose-400 mt-1 font-medium">{error}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 px-6 rounded-2xl bg-yellow-400 hover:bg-yellow-300 active:scale-[0.99] text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/25 transition-all cursor-pointer disabled:opacity-60"
        >
          {isLoading ? (
            <span className="inline-block animate-spin w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full" />
          ) : (
            <>
              <span>Get Driver Security Code</span>
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
          role={Role.DELIVERY_INDIVIDUAL}
          onSuccess={(user, isNewUser) => {
            if (isNewUser && !user.onboardingCompleted) {
              navigate('/delivery/onboarding');
            } else {
              navigate('/delivery/dashboard');
            }
          }}
        />
      </div>

      <div className="flex items-center justify-center gap-2 text-xs text-slate-300 pt-1">
        <Radar className="w-4 h-4 text-yellow-400 shrink-0" />
        <span>Instant GPS Radar Matching • Daily LankaPay Direct Payouts</span>
      </div>
    </AgroviaAuthLayout>
  );
};
