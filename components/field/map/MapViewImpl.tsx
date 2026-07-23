'use client';

import { useEffect, useMemo, useState } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapControls } from '@/components/field/map/MapControls';
import type { VenueMapPoint } from '@/components/field/map/venue-marker-dialog';
import type { Field, Sport } from '@/lib/api/types';

interface MapViewImplProps {
  fields: (Field & { sport: Sport })[];
  selectedFieldId?: string | null;
  favoriteVenueIds?: string[];
  onSelectField?: (fieldId: string) => void;
  onVenueClick?: (venue: VenueMapPoint) => void;
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function groupFieldsByVenue(fields: (Field & { sport: Sport })[]): VenueMapPoint[] {
  const venueMap = new Map<string, VenueMapPoint>();

  for (const field of fields) {
    const venue = field.venue;
    if (venue?.latitude === undefined || venue?.longitude === undefined) continue;

    const existing = venueMap.get(field.venueId);
    if (existing) {
      existing.fields.push(field);
      continue;
    }

    venueMap.set(field.venueId, {
      venueId: field.venueId,
      name: venue.name,
      location: venue.location,
      latitude: venue.latitude,
      longitude: venue.longitude,
      fields: [field],
    });
  }

  return Array.from(venueMap.values());
}

function ChangeView({ target, zoom }: { target: [number, number]; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(target, zoom ?? map.getZoom());
  }, [target, zoom, map]);
  return null;
}

function FitVenueBounds({ venues }: { venues: VenueMapPoint[] }) {
  const map = useMap();

  useEffect(() => {
    if (venues.length === 0) return;
    const bounds = L.latLngBounds(
      venues.map((venue) => [venue.latitude, venue.longitude] as [number, number]),
    );
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
  }, [venues, map]);

  return null;
}

const pinSvg = `
  <svg width="32" height="38" viewBox="0 0 32 38" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 0C7.2 0 0 7.2 0 16c0 11.8 16 22 16 22s16-10.2 16-22C32 7.2 24.8 0 16 0z" fill="currentColor"/>
    <circle cx="16" cy="15" r="6" fill="white"/>
  </svg>
`;

function createVenueIcon(venueName: string, isSelected: boolean, isFavorite: boolean) {
  const classes = [
    'venue-pin',
    isSelected ? 'venue-pin-active' : '',
    isFavorite && !isSelected ? 'venue-pin-favorite' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return L.divIcon({
    className: 'custom-leaflet-div-icon',
    html: `
      <div class="${classes}">
        <div class="venue-pin-label">${escapeHtml(venueName)}</div>
        <div class="venue-pin-marker">
          ${pinSvg}
        </div>
      </div>
    `,
    iconSize: [140, 64],
    iconAnchor: [70, 58],
  });
}

const userLocationIcon = L.divIcon({
  className: 'custom-leaflet-div-icon',
  html: '<div class="user-location-marker"><span class="user-location-marker-dot"></span></div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

export function MapViewImpl({
  fields,
  selectedFieldId,
  favoriteVenueIds = [],
  onSelectField,
  onVenueClick,
}: MapViewImplProps) {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  const venuePoints = useMemo(() => groupFieldsByVenue(fields), [fields]);
  const favoriteSet = useMemo(() => new Set(favoriteVenueIds), [favoriteVenueIds]);

  const selectedVenueId = useMemo(() => {
    if (!selectedFieldId) return null;
    return fields.find((field) => field.id === selectedFieldId)?.venueId ?? null;
  }, [fields, selectedFieldId]);

  const selectedCenter = useMemo(() => {
    if (!selectedVenueId) return null;
    const selected = venuePoints.find((venue) => venue.venueId === selectedVenueId);
    if (!selected) return null;
    return [selected.latitude, selected.longitude] as [number, number];
  }, [selectedVenueId, venuePoints]);

  const defaultCenter = useMemo(() => {
    if (venuePoints.length === 0) return [10.7769, 106.7009] as [number, number];
    const lat = venuePoints.reduce((sum, venue) => sum + venue.latitude, 0) / venuePoints.length;
    const lng = venuePoints.reduce((sum, venue) => sum + venue.longitude, 0) / venuePoints.length;
    return [lat, lng] as [number, number];
  }, [venuePoints]);

  const handleMarkerClick = (venue: VenueMapPoint) => {
    onSelectField?.(venue.fields[0]?.id);
    onVenueClick?.(venue);
  };

  return (
    <MapContainer center={defaultCenter} zoom={13} className="h-full w-full" scrollWheelZoom>
      {!selectedCenter ? <FitVenueBounds venues={venuePoints} /> : null}
      {selectedCenter ? <ChangeView target={selectedCenter} zoom={15} /> : null}

      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapControls onLocationFound={setUserLocation} />

      {userLocation ? <Marker position={userLocation} icon={userLocationIcon} /> : null}

      {venuePoints.map((venue) => {
        const isSelected = venue.venueId === selectedVenueId;
        const isFavorite = favoriteSet.has(venue.venueId);

        return (
          <Marker
            key={venue.venueId}
            position={[venue.latitude, venue.longitude]}
            icon={createVenueIcon(venue.name, isSelected, isFavorite)}
            eventHandlers={{
              click: (event) => {
                L.DomEvent.stopPropagation(event);
                handleMarkerClick(venue);
              },
            }}
          />
        );
      })}
    </MapContainer>
  );
}
