export const ACCESS_TOKEN_KEY = 'accessToken';
export const REFRESH_TOKEN_KEY = 'refreshToken';
export const THEME_KEY = 'theme';

export const ALLOWED_STORAGE_KEYS = [ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, THEME_KEY] as const;

export const LEGACY_STORAGE_KEYS = [
  'access_token',
  'refresh_token',
  'sportbooking-theme',
  'auth_user',
  'crp:venues:onboarding:done',
  'erp:venues-onboarding-done',
] as const;

export const LEGACY_COOKIE_NAMES = ['access_token', 'refresh_token', 'auth_user'] as const;
