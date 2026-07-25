import { IEntityImage, ICourt, ISport, IVenue } from '@/lib/api/types';

export function hasSport(court: ICourt): court is ICourt & { sport: ISport } {
  return court.sport != null;
}

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
  const courts = venue.courts?.map(mapCourt);
  return {
    ...venue,
    images: toImageUrls(venue.venueImages),
    courts,
  };
}

export function mapCourt(court: ICourt): ICourt {
  return {
    ...court,
    images: toImageUrls(court.courtImages),
    venue: court.venue ? mapVenue({ ...court.venue, courts: undefined }) : court.venue,
  };
}
