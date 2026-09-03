import { create } from 'zustand';
import { Role } from '@pola/shared';

export interface UserProfile {
  _id: string;
  fullName?: string;
  email: string;
  phone?: string;
  role: Role;
  kycStatus: string;
  avatarUrl?: string;
  addresses?: any[];
  bankDetails?: any;
  preferredLanguage?: 'en' | 'si' | 'ta';
  themePreference?: 'light' | 'dark' | 'system';
  assignedHubId?: string;
}

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: UserProfile, token: string) => void;
  updateUser: (user: Partial<UserProfile>) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

const savedToken = localStorage.getItem('pola_token');
const savedUser = localStorage.getItem('pola_user');

export const useAuthStore = create<AuthState>((set) => ({
  user: savedUser ? JSON.parse(savedUser) : null,
  token: savedToken,
  isAuthenticated: !!savedToken,
  isLoading: false,

  setAuth: (user, token) => {
    localStorage.setItem('pola_token', token);
    localStorage.setItem('pola_user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },

  updateUser: (updatedFields) => {
    set((state) => {
      if (!state.user) return state;
      const updatedUser = { ...state.user, ...updatedFields };
      localStorage.setItem('pola_user', JSON.stringify(updatedUser));
      return { user: updatedUser };
    });
  },

  logout: () => {
    localStorage.removeItem('pola_token');
    localStorage.removeItem('pola_user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  setLoading: (isLoading) => set({ isLoading }),
}));
