export function buildLoginUrl(returnPath?: string | null) {
  const redirect =
    returnPath && returnPath.startsWith('/') && !returnPath.startsWith('//') ? returnPath : '/';
  if (redirect === '/') return '/login';
  return `/login?redirect=${encodeURIComponent(redirect)}`;
}

export function buildRegisterUrl(returnPath?: string | null) {
  const redirect =
    returnPath && returnPath.startsWith('/') && !returnPath.startsWith('//') ? returnPath : '/';
  if (redirect === '/') return '/register';
  return `/register?redirect=${encodeURIComponent(redirect)}`;
}

export function buildFieldBookingReturnPath(
  fieldId: string,
  draft?: { date?: string; startTime?: string; endTime?: string },
) {
  const params = new URLSearchParams();
  if (draft?.date) params.set('date', draft.date);
  if (draft?.startTime) params.set('startTime', draft.startTime);
  if (draft?.endTime) params.set('endTime', draft.endTime);
  const query = params.toString();
  return query ? `/fields/${fieldId}?${query}` : `/fields/${fieldId}`;
}
