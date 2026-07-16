import { IEntityImage, IField, IVenue } from '@/lib/api/types';

export function toImageUrls(images?: IEntityImage[]): string[] {
  if (!images?.length) return [];
  return [...images]
    .sort((a, b) => {
      if (a.isThumbnail !== b.isThumbnail) return a.isThumbnail ? -1 : 1;
      return a.position - b.position;
    })
    .map((image) => image.url);
}

export function mapVenue(venue: IVenue): IVenue {
  return {
    ...venue,
    images: toImageUrls(venue.venueImages),
    fields: venue.fields?.map(mapField),
  };
}

export function mapField(field: IField): IField {
  return {
    ...field,
    images: toImageUrls(field.fieldImages),
    venue: field.venue ? mapVenue({ ...field.venue, fields: undefined }) : field.venue,
  };
}
