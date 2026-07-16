import { getSafeRedirectPath } from '@/lib/utils/redirect';

/** Build login URL; after auth user returns to `returnPath` (browse free, auth only for actions). */
export function buildLoginUrl(returnPath?: string | null) {
  const redirect = getSafeRedirectPath(returnPath, '/');
  if (redirect === '/') return '/login';
  return `/login?redirect=${encodeURIComponent(redirect)}`;
}

export function buildRegisterUrl(returnPath?: string | null) {
  const redirect = getSafeRedirectPath(returnPath, '/');
  if (redirect === '/') return '/register';
  return `/register?redirect=${encodeURIComponent(redirect)}`;
}

/** Preserve booking draft across login. */
export function buildFieldBookingReturnPath(
  fieldId: string,
  draft?: { date?: string; timeslotId?: string },
) {
  const params = new URLSearchParams();
  if (draft?.date) params.set('date', draft.date);
  if (draft?.timeslotId) params.set('timeslotId', draft.timeslotId);
  const query = params.toString();
  return query ? `/fields/${fieldId}?${query}` : `/fields/${fieldId}`;
}
