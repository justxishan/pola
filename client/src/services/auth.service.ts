import { api } from './api';

export const AuthService = {
  requestOtp: async (email: string, role?: string) => {
    return api.post('/auth/request-otp', { email, role });
  },

  verifyOtp: async (email: string, otp: string, role?: string) => {
    return api.post('/auth/verify-otp', { email, otpCode: otp, role });
  },

  googleLogin: async (idToken: string, role?: string) => {
    return api.post('/auth/google', { idToken, role });
  },

  selectRole: async (role: string) => {
    return api.post('/auth/select-role', { role });
  },

  uploadKyc: async (formData: FormData) => {
    return api.post('/auth/kyc', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  getMe: async () => {
    return api.get('/auth/me');
  },

  updateProfile: async (data: any) => {
    return api.patch('/auth/profile', data);
  },
};
