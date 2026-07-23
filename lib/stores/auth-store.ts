import { create } from 'zustand';
import type { User } from '@/lib/api/types';
import {
  clearPersistedTokens,
  migrateLegacyStorage,
  persistTokens,
  readTokensFromStorage,
} from '@/lib/storage/local-storage';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  /** False until stored tokens are validated (or absent). Prevents socket using expired tokens. */
  isSessionReady: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  updateUser: (user: User) => void;
  clearAuth: () => void;
  hydrateFromStorage: () => void;
}

export { readTokensFromStorage };

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isHydrated: false,
  isSessionReady: false,

  setAuth: (user, accessToken, refreshToken) => {
    persistTokens(accessToken, refreshToken);
    set({
      user,
      accessToken,
      refreshToken,
      isAuthenticated: true,
      isHydrated: true,
      isSessionReady: true,
    });
  },

  setTokens: (accessToken, refreshToken) => {
    persistTokens(accessToken, refreshToken);
    set({ accessToken, refreshToken, isAuthenticated: true });
  },

  updateUser: (user) => {
    set({ user });
  },

  clearAuth: () => {
    clearPersistedTokens();
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isHydrated: true,
      isSessionReady: true,
    });
  },

  hydrateFromStorage: () => {
    const { accessToken, refreshToken } = readTokensFromStorage();
    const hasStoredSession = Boolean(accessToken && refreshToken);

    set({
      user: null,
      accessToken,
      refreshToken,
      isAuthenticated: hasStoredSession,
      isHydrated: true,
      isSessionReady: !hasStoredSession,
    });
  },
}));

export function getAuthState() {
  return useAuthStore.getState();
}

if (typeof window !== 'undefined') {
  migrateLegacyStorage();
  useAuthStore.getState().hydrateFromStorage();
}
