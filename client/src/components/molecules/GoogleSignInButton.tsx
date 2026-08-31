import React, { useEffect, useRef } from 'react';
import { AuthService } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

declare global {
  interface Window {
    google?: any;
  }
}

export interface GoogleSignInButtonProps {
  role?: string;
  onSuccess: (user: any, isNewUser?: boolean) => void;
  className?: string;
}

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '1039609194458-s3mm2bkcq0i5gcg229g64npq48ntc7gh.apps.googleusercontent.com';

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  role,
  onSuccess,
  className,
}) => {
  const { setAuth } = useAuthStore();
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Dynamically load Google GSI script if not present
    if (!document.getElementById('google-gsi-script')) {
      const script = document.createElement('script');
      script.id = 'google-gsi-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogle;
      document.body.appendChild(script);
    } else if (window.google) {
      initializeGoogle();
    }
  }, []);

  const initializeGoogle = () => {
    if (!window.google?.accounts?.id) return;

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
      auto_select: false,
    });

    if (buttonRef.current) {
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: 'outline',
        size: 'large',
        type: 'standard',
        text: 'continue_with',
        shape: 'rectangular',
        width: '100%',
      });
    }
  };

  const handleCredentialResponse = async (response: any) => {
    if (!response.credential) {
      toast.error('Google authorization failed');
      return;
    }

    try {
      const res: any = await AuthService.googleLogin(response.credential, role);
      if (res.success && res.data) {
        setAuth(res.data.user, res.data.token);
        toast.success('Google authentication successful!');
        onSuccess(res.data.user, res.data.isNewUser);
      }
    } catch (err: any) {
      toast.error(err.message || 'Google sign-in error');
    }
  };

  return (
    <div className={className}>
      <div ref={buttonRef} className="w-full flex justify-center min-h-[40px]" />
    </div>
  );
};
