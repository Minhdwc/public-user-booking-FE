export const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(price);

export const formatShortPrice = (price: number) => {
  if (price >= 1_000_000) return `${(price / 1_000_000).toFixed(1)}tr`;
  return `${Math.round(price / 1000)}k`;
};

export const formatDate = (date: string) =>
  new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date));

export const formatTime = (value?: string | null) => {
  if (!value) return '—';
  return value.slice(0, 5);
};

export const formatVenueAddress = (venue: { address?: string; district?: string; city?: string }) =>
  [venue.address, venue.district, venue.city].filter(Boolean).join(', ') || 'Chưa có địa chỉ';
