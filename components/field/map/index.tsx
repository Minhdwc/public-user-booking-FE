'use client';

import dynamic from 'next/dynamic';
import type { VenueMapPoint } from '@/components/field/map/venue-marker-dialog';
import type { ICourtWithSport } from '@/lib/api/types';

interface MapViewProps {
  fields: ICourtWithSport[];
  selectedFieldId?: string | null;
  favoriteVenueIds?: string[];
  userLocation?: [number, number] | null;
  onUserLocationChange?: (location: [number, number]) => void;
  onSelectField?: (fieldId: string) => void;
  onVenueClick?: (venue: VenueMapPoint) => void;
}

const MapViewImpl = dynamic(() => import('./MapViewImpl').then((mod) => mod.MapViewImpl), {
  ssr: false,
});

export function MapView(props: MapViewProps) {
  return <MapViewImpl {...props} />;
}
