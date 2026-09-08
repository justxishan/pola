import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AgroviaAuthLayout } from '@/components/templates/AgroviaAuthLayout';
import { AuthService } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';
import { ShieldCheck, Mail, Lock, ArrowRight, Key } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState('admin@pola.lk');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid administrator email');
      return;
    }
    if (!password) {
      setError('Please enter your administrator password');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      const res: any = await AuthService.adminLogin(email.trim().toLowerCase(), password);
      if (res.data) {
        setAuth(res.data.user, res.data.token);
        toast.success(res.message || 'Admin authentication successful');
        navigate('/admin/dashboard');
      }
    } catch (err: any) {
      const msg = err.message || 'Invalid administrator credentials';
      setError(msg);
      toast.error(msg);
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
          <p className="text-slate-400 text-[11px]">
            Strict password authentication and role-based access control enforced.
          </p>
        </div>
      }
    >
      <form onSubmit={handleLogin} className="space-y-4">
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
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-200 mb-1.5 tracking-wide">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError('');
              }}
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:border-teal-400 focus:bg-white/15 transition-all font-mono"
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
              <span>Sign In to Command Center</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

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
