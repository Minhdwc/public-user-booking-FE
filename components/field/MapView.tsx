'use client';

import dynamic from 'next/dynamic';
import type { Field, Sport } from '@/lib/api/types';

interface MapViewProps {
  fields: (Field & { sport: Sport })[];
  selectedFieldId?: string | null;
  favoriteFieldIds?: string[];
  onSelectField?: (fieldId: string) => void;
}

const MapViewImpl = dynamic(
  () => import('./MapViewImpl').then((mod) => mod.MapViewImpl),
  { ssr: false },
);

export function MapView(props: MapViewProps) {
  return <MapViewImpl {...props} />;
}
