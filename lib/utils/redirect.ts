export function getSafeRedirectPath(redirect: string | null | undefined, fallback = '/') {
  if (!redirect) return fallback;
  if (!redirect.startsWith('/') || redirect.startsWith('//')) return fallback;
  return redirect;
}
