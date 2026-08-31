import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AgroviaAuthLayout } from '@/components/templates/AgroviaAuthLayout';
import { OtpInput } from '@/components/molecules/OtpInput';
import { AuthService } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';
import { ArrowLeft, RotateCcw, ShieldCheck, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export const VerifyOtpPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const email = searchParams.get('email') || '';
  const role = searchParams.get('role') || '';
  const redirectUrl = searchParams.get('redirect') || '';

  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [timer, setTimer] = useState(60);

  const { setAuth } = useAuthStore();

  const getPortalId = (): 'customer' | 'farmer' | 'delivery' | 'admin' => {
    if (role.startsWith('farmer') || role === 'collector') return 'farmer';
    if (role.startsWith('delivery')) return 'delivery';
    if (role.startsWith('admin')) return 'admin';
    return 'customer';
  };

  const portalId = getPortalId();

  useEffect(() => {
    if (!email) {
      navigate('/portals');
      return;
    }

    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [email]);

  const handleVerify = async (codeToVerify?: string) => {
    const code = (codeToVerify || otp).trim();
    if (code.length !== 6) {
      toast.error('Please enter all 6 digits');
      return;
    }

    try {
      setIsLoading(true);
      setError(false);
      const res: any = await AuthService.verifyOtp(email, code, role || undefined);

      if (res.success && res.data) {
        setAuth(res.data.user, res.data.token);
        toast.success(res.message || 'Authentication successful!');

        // If an explicit destination redirect URL was passed, navigate there
        if (redirectUrl && !redirectUrl.includes('onboarding')) {
          navigate(redirectUrl);
          return;
        }

        const isNewUser = res.data.isNewUser;
        const onboardingCompleted = res.data.user?.onboardingCompleted;
        const userRole = res.data.user.role || role;

        // If newly registered user and onboarding not completed, start onboarding
        if (isNewUser && !onboardingCompleted) {
          if (userRole?.startsWith('farmer') || userRole === 'collector') {
            navigate('/farmer/onboarding');
          } else if (userRole?.startsWith('delivery')) {
            navigate('/delivery/onboarding');
          } else if (userRole?.startsWith('admin')) {
            navigate('/admin/dashboard');
          } else {
            navigate('/customer/onboarding');
          }
        } else {
          // Returning user signing in: Directly open active dashboard / marketplace
          if (userRole?.startsWith('farmer') || userRole === 'collector') {
            navigate('/farmer/dashboard');
          } else if (userRole?.startsWith('delivery')) {
            navigate('/delivery/dashboard');
          } else if (userRole?.startsWith('admin')) {
            navigate('/admin/dashboard');
          } else {
            navigate('/');
          }
        }
      }
    } catch (err: any) {
      setError(true);
      toast.error(err.message || 'Invalid or expired OTP code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    try {
      const res: any = await AuthService.requestOtp(email, role || undefined);
      setTimer(60);
      setOtp('');
      setError(false);
      toast.success('New 6-digit code sent to your email!');
      if (res.devOtp) {
        toast(`[DEV MODE] Verification Code: ${res.devOtp}`, { icon: '🔑', duration: 7000 });
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to resend code');
    }
  };

  return (
    <AgroviaAuthLayout
      portalId={portalId}
      title="Verify 6-Digit Code"
      subtitle={`Enter the one-time security code sent to ${email}`}
      badgeContent={
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border border-white/20 bg-white/10 text-lime-300">
          <Lock className="w-3.5 h-3.5" />
          <span>Security Handshake</span>
        </div>
      }
      footerContent={
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to email sign in</span>
        </button>
      }
    >
      <div className="space-y-6">
        <div className="bg-black/30 p-4 rounded-2xl border border-white/10">
          <OtpInput
            length={6}
            value={otp}
            onChange={(newOtp) => {
              setOtp(newOtp);
              if (error) setError(false);
              if (newOtp.length === 6) {
                handleVerify(newOtp);
              }
            }}
            error={error}
            disabled={isLoading}
          />
        </div>

        <button
          type="button"
          disabled={otp.length !== 6 || isLoading}
          onClick={() => handleVerify()}
          className="w-full py-3.5 px-6 rounded-2xl bg-lime-400 hover:bg-lime-300 active:scale-[0.99] text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-lime-500/25 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="inline-block animate-spin w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full" />
          ) : (
            <span>Verify & Enter Portal →</span>
          )}
        </button>

        <div className="text-center pt-1">
          {timer > 0 ? (
            <p className="text-xs text-slate-300">
              Resend code in <span className="font-bold text-lime-300">{timer}s</span>
            </p>
          ) : (
            <button
              onClick={handleResend}
              className="text-xs font-bold text-lime-300 hover:text-lime-200 inline-flex items-center gap-1.5 cursor-pointer underline"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Resend Code Now
            </button>
          )}
        </div>
      </div>
    </AgroviaAuthLayout>
  );
};
