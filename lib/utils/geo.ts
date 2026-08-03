export type GeoPoint = {
  latitude: number;
  longitude: number;
};

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

export function getDistanceKm(from: GeoPoint, to: GeoPoint): number {
  const earthRadiusKm = 6371;
  const dLat = toRadians(to.latitude - from.latitude);
  const dLon = toRadians(to.longitude - from.longitude);
  const lat1 = toRadians(from.latitude);
  const lat2 = toRadians(to.latitude);

  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatDistanceKm(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

export function getCourtDistanceKm(
  court: { venue?: { latitude?: number; longitude?: number } | null },
  from: GeoPoint,
): number | null {
  const venue = court.venue;
  if (venue?.latitude == null || venue?.longitude == null) return null;
  if (venue.latitude === 0 && venue.longitude === 0) return null;
  return getDistanceKm(from, { latitude: venue.latitude, longitude: venue.longitude });
}
