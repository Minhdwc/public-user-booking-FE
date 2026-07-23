import {
  ACCESS_TOKEN_KEY,
  ALLOWED_STORAGE_KEYS,
  LEGACY_COOKIE_NAMES,
  LEGACY_STORAGE_KEYS,
  REFRESH_TOKEN_KEY,
  THEME_KEY,
} from '@/lib/constants/storage';

function clearLegacyCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

/** Keep only accessToken, refreshToken, theme in localStorage. */
export function pruneLocalStorage() {
  if (typeof window === 'undefined') return;

  const storage = window.localStorage;
  const allowed = new Set<string>(ALLOWED_STORAGE_KEYS);

  for (let i = storage.length - 1; i >= 0; i--) {
    const key = storage.key(i);
    if (key && !allowed.has(key)) {
      storage.removeItem(key);
    }
  }
}

export function migrateLegacyStorage() {
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

  for (const key of LEGACY_STORAGE_KEYS) {
    storage.removeItem(key);
  }

  for (const name of LEGACY_COOKIE_NAMES) {
    clearLegacyCookie(name);
  }

  pruneLocalStorage();
}

export function readTokensFromStorage() {
  if (typeof window === 'undefined') {
    return { accessToken: null, refreshToken: null };
  }

  return {
    accessToken: window.localStorage.getItem(ACCESS_TOKEN_KEY),
    refreshToken: window.localStorage.getItem(REFRESH_TOKEN_KEY),
  };
}

export function persistTokens(accessToken: string, refreshToken: string) {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  pruneLocalStorage();
}

export function clearPersistedTokens() {
  if (typeof window === 'undefined') return;

  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  pruneLocalStorage();
}
