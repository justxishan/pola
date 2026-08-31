import { create } from 'zustand';

export interface PortalThemeConfig {
  id: 'customer' | 'farmer' | 'delivery' | 'admin';
  name: string;
  nameSi: string;
  tag: string;
  headingPrefix: string;
  headingAccent: string;
  headingSuffix?: string;
  subtitle: string;
  bgImage: string;
  primaryColorHex: string;
  primaryButtonClass: string;
  accentBadgeClass: string;
  glowColorClass: string;
  statsText: string;
  loginPath: string;
  dashboardPath: string;
}

const DEFAULT_THEMES: Record<string, PortalThemeConfig> = {
  customer: {
    id: 'customer',
    name: 'Customer & Buyer Marketplace',
    nameSi: 'පාරිභෝගික සහ වෙළඳ පිවිසුම',
    tag: 'DIRECT CONSUMER MARKET',
    headingPrefix: 'Fresh Harvest for',
    headingAccent: 'Every Home',
    subtitle: 'Order farm-fresh vegetables, heritage grains, and seasonal fruits straight from certified growers under Pola Escrow protection.',
    // High contrast crisp morning market harvest background
    bgImage: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=2400&q=85',
    primaryColorHex: '#34d399',
    primaryButtonClass: 'bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold shadow-lg shadow-emerald-500/25',
    accentBadgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
    glowColorClass: 'shadow-emerald-500/10',
    statsText: '100% Escrow Protected • 25 Districts',
    loginPath: '/customer/login',
    dashboardPath: '/',
  },
  farmer: {
    id: 'farmer',
    name: 'Farmer & Producer Network',
    nameSi: 'ගොවි සහ එකතුකරන්නන්ගේ පිවිසුම',
    tag: 'PRODUCER NETWORK',
    headingPrefix: 'Smart Farming for',
    headingAccent: 'Future Generations',
    subtitle: 'List direct harvests, eliminate middlemen, schedule village hub drop-offs, and receive guaranteed 24-hour LankaPay escrow payouts.',
    // High contrast sunlit wheat & agricultural plantation with depth of field (matching reference photo)
    bgImage: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=2400&q=85',
    primaryColorHex: '#bef264',
    primaryButtonClass: 'bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold shadow-lg shadow-lime-500/25',
    accentBadgeClass: 'bg-lime-500/20 text-lime-300 border-lime-400/30',
    glowColorClass: 'shadow-lime-500/10',
    statsText: '10k+ Certified Farmers • +35% Fair Income',
    loginPath: '/farmer/login',
    dashboardPath: '/farmer/dashboard',
  },
  delivery: {
    id: 'delivery',
    name: 'Delivery Fleet & Logistics',
    nameSi: 'බෙදාහැරීමේ රියදුරු පිවිසුම',
    tag: 'KINETIC LOGISTICS',
    headingPrefix: 'Swift Logistics for',
    headingAccent: 'Agrarian Supply',
    subtitle: 'Accept GPS radar route requests, transport fresh produce between village hubs, and withdraw daily earnings with zero friction.',
    // Scenic highland tea plantation & rural delivery transport route
    bgImage: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=2400&q=85',
    primaryColorHex: '#facc15',
    primaryButtonClass: 'bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold shadow-lg shadow-yellow-500/25',
    accentBadgeClass: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30',
    glowColorClass: 'shadow-yellow-500/10',
    statsText: '247 Village Hubs • Instant LankaPay',
    loginPath: '/delivery/login',
    dashboardPath: '/delivery/dashboard',
  },
  admin: {
    id: 'admin',
    name: 'Executive Command Center',
    nameSi: 'පරිපාලන පාලක මැදිරිය',
    tag: 'EXECUTIVE COMMAND',
    headingPrefix: 'Sovereign Governance for',
    headingAccent: 'National Agriculture',
    subtitle: 'Real-time GMV analytics, split-screen KYC document adjudication, DC logistics orchestration, and LankaPay withdrawal ledger desk.',
    // Aerial geometric agriculture plantations and high tech modern agro infrastructure
    bgImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=2400&q=85',
    primaryColorHex: '#2dd4bf',
    primaryButtonClass: 'bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold shadow-lg shadow-teal-500/25',
    accentBadgeClass: 'bg-teal-500/20 text-teal-300 border-teal-400/30',
    glowColorClass: 'shadow-teal-500/10',
    statsText: 'Internal Operations • Super Admin Only',
    loginPath: '/admin/login',
    dashboardPath: '/admin/dashboard',
  },
};

interface PortalThemeState {
  themes: Record<string, PortalThemeConfig>;
  updatePortalBgImage: (portalId: string, bgImage: string) => void;
  updatePortalTheme: (portalId: string, updates: Partial<PortalThemeConfig>) => void;
  resetToDefaults: () => void;
}

const STORAGE_KEY = 'pola_portal_themes_v1';

const getInitialThemes = (): Record<string, PortalThemeConfig> => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_THEMES, ...parsed };
    }
  } catch (e) {
    console.warn('Failed to parse portal themes from storage', e);
  }
  return DEFAULT_THEMES;
};

export const usePortalThemeStore = create<PortalThemeState>((set) => ({
  themes: getInitialThemes(),

  updatePortalBgImage: (portalId, bgImage) => {
    set((state) => {
      const current = state.themes[portalId] || DEFAULT_THEMES[portalId];
      if (!current) return state;

      const updated = {
        ...state.themes,
        [portalId]: { ...current, bgImage },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return { themes: updated };
    });
  },

  updatePortalTheme: (portalId, updates) => {
    set((state) => {
      const current = state.themes[portalId] || DEFAULT_THEMES[portalId];
      if (!current) return state;

      const updated = {
        ...state.themes,
        [portalId]: { ...current, ...updates },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return { themes: updated };
    });
  },

  resetToDefaults: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ themes: DEFAULT_THEMES });
  },
}));
