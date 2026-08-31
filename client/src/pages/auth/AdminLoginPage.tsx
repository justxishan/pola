import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AgroviaAuthLayout } from '@/components/templates/AgroviaAuthLayout';
import { GoogleSignInButton } from '@/components/molecules/GoogleSignInButton';
import { AuthService } from '@/services/auth.service';
import { Role } from '@pola/shared';
import { ShieldCheck, Mail, ArrowRight, Key, Lock, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@pola.lk');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid administrator email');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      const res: any = await AuthService.requestOtp(email.trim().toLowerCase(), Role.ADMIN_SUPER);
      toast.success(res.message || '6-digit admin security code sent!');

      if (res.devOtp) {
        toast(`[DEV MODE] Verification Code: ${res.devOtp}`, { icon: '🔑', duration: 7000 });
      }

      navigate(
        `/auth/verify?email=${encodeURIComponent(email.trim().toLowerCase())}&role=${Role.ADMIN_SUPER}&redirect=/admin/dashboard`
      );
    } catch (err: any) {
      setError(err.message || 'Failed to send admin security code');
      toast.error(err.message || 'Failed to send admin security code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AgroviaAuthLayout
      portalId="admin"
      title="Executive Command Center"
      subtitle="Authorized platform administrators, KYC compliance officers & finance desk access only."
      badgeContent={
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border border-teal-400/30 bg-teal-500/20 text-teal-300">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Internal Operations HQ</span>
        </div>
      }
      footerContent={
        <div className="space-y-2">
          <p className="text-slate-300">
            Looking for another portal?{' '}
            <a href="/portals" className="underline font-bold text-teal-300 hover:text-white transition-colors">
              View all 4 Portals
            </a>
          </p>
          <p className="text-slate-400 text-[11px]">
            Strict multi-factor authentication and role-based access control enforced.
          </p>
        </div>
      }
    >
      <form onSubmit={handleRequestOtp} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-200 mb-1.5 tracking-wide">
            Administrator Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              placeholder="admin@pola.lk"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError('');
              }}
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:border-teal-400 focus:bg-white/15 transition-all font-mono"
              autoFocus
              required
            />
          </div>
          {error && <p className="text-xs text-rose-400 mt-1 font-medium">{error}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 px-6 rounded-2xl bg-teal-400 hover:bg-teal-300 active:scale-[0.99] text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-500/25 transition-all cursor-pointer disabled:opacity-60"
        >
          {isLoading ? (
            <span className="inline-block animate-spin w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full" />
          ) : (
            <>
              <span>Send Executive Code</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="relative flex items-center justify-center my-4">
        <div className="border-t border-white/15 w-full" />
        <span className="px-3 text-[11px] text-slate-300 font-bold uppercase tracking-wider shrink-0">
          Or authorized Google SSO
        </span>
        <div className="border-t border-white/15 w-full" />
      </div>

      <div className="bg-white/95 rounded-2xl p-1.5 shadow-md">
        <GoogleSignInButton
          role={Role.ADMIN_SUPER}
          onSuccess={() => navigate('/admin/dashboard')}
        />
      </div>

      <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-300 space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-teal-300">
          <Key className="w-3.5 h-3.5" />
          <span>System Super Admin:</span>
        </div>
        <p className="font-mono text-[11px] text-slate-200">
          admin@pola.lk
        </p>
      </div>
    </AgroviaAuthLayout>
  );
};
