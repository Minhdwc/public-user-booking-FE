'use client';

import { useEffect, useMemo, useState } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapControls } from '@/components/field/MapControls';
import type { Field, Sport } from '@/lib/api/types';
import { formatPrice, formatShortPrice } from '@/lib/utils/format';

interface MapViewImplProps {
  fields: (Field & { sport: Sport })[];
  selectedFieldId?: string | null;
  favoriteFieldIds?: string[];
  onSelectField?: (fieldId: string) => void;
}

function ChangeView({ target, zoom }: { target: [number, number]; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(target, zoom ?? map.getZoom());
  }, [target, zoom, map]);
  return null;
}

function FitFieldBounds({ fields }: { fields: (Field & { sport: Sport })[] }) {
  const map = useMap();

  useEffect(() => {
    if (fields.length === 0) return;
    const bounds = L.latLngBounds(
      fields.map((field) => [field.venue!.latitude, field.venue!.longitude] as [number, number]),
    );
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 14 });
  }, [fields, map]);

  return null;
}

function createPriceIcon(field: Field & { sport: Sport }, isSelected: boolean, isFavorite: boolean) {
  const classes = [
    'price-marker',
    isSelected ? 'price-marker-active' : '',
    isFavorite && !isSelected ? 'price-marker-favorite' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return L.divIcon({
    className: 'custom-leaflet-div-icon',
    html: `<div class="${classes}">${formatShortPrice(field.price)}</div>`,
    iconSize: [52, 30],
    iconAnchor: [26, 30],
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
  favoriteFieldIds = [],
  onSelectField,
}: MapViewImplProps) {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  const validFields = fields.filter(
    (field) => field.venue?.latitude !== undefined && field.venue?.longitude !== undefined,
  );

  const favoriteSet = useMemo(() => new Set(favoriteFieldIds), [favoriteFieldIds]);

  const selectedCenter = useMemo(() => {
    if (!selectedFieldId) return null;
    const selected = validFields.find((field) => field.id === selectedFieldId);
    if (!selected) return null;
    return [selected.venue!.latitude, selected.venue!.longitude] as [number, number];
  }, [selectedFieldId, validFields]);

  const defaultCenter = useMemo(() => {
    if (validFields.length === 0) return [10.7769, 106.7009] as [number, number];
    const lat =
      validFields.reduce((sum, field) => sum + (field.venue?.latitude ?? 0), 0) / validFields.length;
    const lng =
      validFields.reduce((sum, field) => sum + (field.venue?.longitude ?? 0), 0) / validFields.length;
    return [lat, lng] as [number, number];
  }, [validFields]);

  return (
    <MapContainer center={defaultCenter} zoom={13} className="h-full w-full" scrollWheelZoom>
      {!selectedCenter ? <FitFieldBounds fields={validFields} /> : null}
      {selectedCenter ? <ChangeView target={selectedCenter} zoom={15} /> : null}

      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapControls onLocationFound={setUserLocation} />

      {userLocation ? (
        <Marker position={userLocation} icon={userLocationIcon}>
          <Popup>Vị trí của bạn</Popup>
        </Marker>
      ) : null}

      {validFields.map((field) => {
        const isSelected = field.id === selectedFieldId;
        const isFavorite = favoriteSet.has(field.id);

        return (
          <Marker
            key={field.id}
            position={[field.venue!.latitude, field.venue!.longitude]}
            icon={createPriceIcon(field, isSelected, isFavorite)}
            eventHandlers={{
              click: () => onSelectField?.(field.id),
            }}
          >
            <Popup>
              <div className="min-w-40 space-y-1">
                <p className="font-semibold text-foreground">{field.name}</p>
                <p className="text-sm text-muted-foreground">{field.venue?.name}</p>
                <p className="text-sm font-bold text-primary">{formatPrice(field.price)}/giờ</p>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
