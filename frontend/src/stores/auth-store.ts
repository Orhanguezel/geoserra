import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser } from '@/lib/api';
import { authMe, authLogout } from '@/lib/api';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  hydrated: boolean;

  setAuth: (user: AuthUser, token: string) => void;
  clearAuth: () => void;
  refreshMe: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      hydrated: false,

      setAuth: (user, token) => set({ user, token, hydrated: true }),

      clearAuth: () => set({ user: null, token: null }),

      refreshMe: async () => {
        try {
          const res = await authMe();
          set({ user: res.user, hydrated: true });
        } catch {
          get().clearAuth();
          set({ hydrated: true });
        }
      },

      logout: async () => {
        try { await authLogout(); } catch { /* ignore */ }
        get().clearAuth();
      },
    }),
    {
      name: 'geoserra-auth',
      partialize: (s) => ({ user: s.user, token: s.token }),
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);
