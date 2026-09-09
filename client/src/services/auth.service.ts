import { api } from './api';

export const AuthService = {
  requestOtp: async (email: string, role?: string) => {
    return api.post('/auth/request-otp', { email, role });
  },

  verifyOtp: async (email: string, otp: string, role?: string) => {
    return api.post('/auth/verify-otp', { email, otpCode: otp, role });
  },

  adminLogin: async (email: string, password: string) => {
    return api.post('/auth/admin-login', { email, password });
  },

  googleLogin: async (idToken: string, role?: string) => {
    return api.post('/auth/google', { idToken, role });
  },

  selectRole: async (role: string) => {
    return api.post('/auth/select-role', { role });
  },

  uploadKyc: async (formData: FormData) => {
    return api.post('/auth/kyc', formData);
  },

  getMe: async () => {
    return api.get('/auth/me');
  },

  updateProfile: async (data: any) => {
    return api.patch('/auth/profile', data);
  },

  uploadAvatar: async (formData: FormData) => {
    return api.post('/auth/profile/avatar', formData);
  },

  deleteAccount: async (reason: string, details?: string) => {
    return api.delete('/auth/account', { data: { reason, details } });
  },
};
