export function formatPrice(price: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatShortPrice(price: number) {
  if (price >= 1_000_000) return `${(price / 1_000_000).toFixed(1)}tr`;
  return `${Math.round(price / 1000)}k`;
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date));
}
