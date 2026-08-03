import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  STORAGE_KEYS,
  THEME_KEY,
} from '@/lib/constants/storage';

export const pruneLocalStorage = () => {
  if (typeof window === 'undefined') return;

  const storage = window.localStorage;
  const allowed = new Set<string>(STORAGE_KEYS);

  for (let i = storage.length - 1; i >= 0; i--) {
    const key = storage.key(i);
    if (key && !allowed.has(key)) {
      storage.removeItem(key);
    }
  }
};

export const migrateLegacyStorage = () => {
  if (typeof window === 'undefined') return;

  const storage = window.localStorage;

  const legacyAccess = storage.getItem('access_token');
  const legacyRefresh = storage.getItem('refresh_token');
  if (legacyAccess && !storage.getItem(ACCESS_TOKEN_KEY)) {
    storage.setItem(ACCESS_TOKEN_KEY, legacyAccess);
  }
  if (legacyRefresh && !storage.getItem(REFRESH_TOKEN_KEY)) {
    storage.setItem(REFRESH_TOKEN_KEY, legacyRefresh);
  }

  const legacyTheme = storage.getItem('sportbooking-theme');
  if (legacyTheme && !storage.getItem(THEME_KEY)) {
    storage.setItem(THEME_KEY, legacyTheme);
  }

  pruneLocalStorage();
};

export const readTokensFromStorage = () => {
  if (typeof window === 'undefined') {
    return { accessToken: null, refreshToken: null };
  }

  return {
    accessToken: window.localStorage.getItem(ACCESS_TOKEN_KEY),
    refreshToken: window.localStorage.getItem(REFRESH_TOKEN_KEY),
  };
};

export const persistTokens = (accessToken: string, refreshToken: string) => {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  pruneLocalStorage();
};

export const clearPersistedTokens = () => {
  if (typeof window === 'undefined') return;

  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  pruneLocalStorage();
};
