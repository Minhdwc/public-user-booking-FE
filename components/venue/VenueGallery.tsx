import { ImageGallery } from '@/components/common/ImageGallery';

interface VenueGalleryProps {
  images: string[];
  venueName: string;
}

export function VenueGallery({ images, venueName }: VenueGalleryProps) {
  return <ImageGallery images={images} alt={venueName} />;
}
