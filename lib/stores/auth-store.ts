import Cookies from 'js-cookie';
import { create } from 'zustand';
import {
  ACCESS_TOKEN_COOKIE,
  COOKIE_OPTIONS,
  REFRESH_TOKEN_COOKIE,
  USER_COOKIE,
} from '@/lib/constants/auth';
import type { User } from '@/lib/api/types';

/**
 * MVP: tokens stored in regular cookies (non-httpOnly) so middleware can read them.
 * Can upgrade to httpOnly cookies + BFF pattern when higher security is needed.
 */
interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  updateUser: (user: User) => void;
  clearAuth: () => void;
  hydrateFromCookies: () => void;
}

function persistAuth(user: User, accessToken: string, refreshToken: string) {
  Cookies.set(ACCESS_TOKEN_COOKIE, accessToken, { ...COOKIE_OPTIONS, expires: 7 });
  Cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, { ...COOKIE_OPTIONS, expires: 30 });
  Cookies.set(USER_COOKIE, JSON.stringify(user), { ...COOKIE_OPTIONS, expires: 30 });
}

function clearPersistedAuth() {
  Cookies.remove(ACCESS_TOKEN_COOKIE, { path: '/' });
  Cookies.remove(REFRESH_TOKEN_COOKIE, { path: '/' });
  Cookies.remove(USER_COOKIE, { path: '/' });
}

function readUserFromCookie(): User | null {
  const raw = Cookies.get(USER_COOKIE);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function readTokensFromCookies() {
  return {
    accessToken: Cookies.get(ACCESS_TOKEN_COOKIE) ?? null,
    refreshToken: Cookies.get(REFRESH_TOKEN_COOKIE) ?? null,
  };
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isHydrated: false,

  setAuth: (user, accessToken, refreshToken) => {
    persistAuth(user, accessToken, refreshToken);
    set({
      user,
      accessToken,
      refreshToken,
      isAuthenticated: true,
      isHydrated: true,
    });
  },

  setTokens: (accessToken, refreshToken) => {
    Cookies.set(ACCESS_TOKEN_COOKIE, accessToken, { ...COOKIE_OPTIONS, expires: 7 });
    Cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, { ...COOKIE_OPTIONS, expires: 30 });
    set({ accessToken, refreshToken, isAuthenticated: true });
  },

  updateUser: (user) => {
    const { accessToken, refreshToken } = get();
    if (accessToken && refreshToken) {
      persistAuth(user, accessToken, refreshToken);
    } else {
      Cookies.set(USER_COOKIE, JSON.stringify(user), { ...COOKIE_OPTIONS, expires: 30 });
    }
    set({ user });
  },

  clearAuth: () => {
    clearPersistedAuth();
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isHydrated: true,
    });
  },

  hydrateFromCookies: () => {
    const { accessToken, refreshToken } = readTokensFromCookies();
    const user = readUserFromCookie();

    set({
      user,
      accessToken,
      refreshToken,
      isAuthenticated: Boolean(accessToken && refreshToken),
      isHydrated: true,
    });
  },
}));

export function getAuthState() {
  return useAuthStore.getState();
}

if (typeof window !== 'undefined') {
  useAuthStore.getState().hydrateFromCookies();
}
