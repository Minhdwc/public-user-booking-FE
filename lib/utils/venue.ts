export function getVenueSports(
  fields: { sport?: { id: string; name: string } | null }[] = [],
) {
  const map = new Map<string, string>();
  for (const field of fields) {
    if (!field.sport) continue;
    map.set(field.sport.id, field.sport.name);
  }
  return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
}

export function getMinFieldPrice(fields: { price: number }[] = []) {
  if (fields.length === 0) return null;
  return Math.min(...fields.map((field) => field.price));
}
