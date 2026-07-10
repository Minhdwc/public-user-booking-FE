export function normalizeVnPhone(phone: string): string {
  const trimmed = phone.trim();
  if (trimmed.startsWith('+84')) return trimmed;
  if (trimmed.startsWith('84')) return `+${trimmed}`;
  if (trimmed.startsWith('0')) return `+84${trimmed.slice(1)}`;
  return trimmed;
}
