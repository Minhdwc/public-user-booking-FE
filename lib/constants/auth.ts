/** Cookie names — readable by middleware (MVP: non-httpOnly; upgrade to httpOnly + BFF later). */
export const ACCESS_TOKEN_COOKIE = 'access_token';
export const REFRESH_TOKEN_COOKIE = 'refresh_token';
export const USER_COOKIE = 'auth_user';

export const COOKIE_OPTIONS = {
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};
