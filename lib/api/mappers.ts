import { IEntityImage, ICourt, ICourtWithSport, IVenue } from '@/lib/api/types';

type VenueApiPayload = IVenue & {
  address?: string;
  district?: string;
  city?: string;
};

function buildVenueLocation(venue: VenueApiPayload) {
  if (venue.location?.trim()) return venue.location;
  return [venue.address, venue.district, venue.city].filter(Boolean).join(', ');
}

export function hasSport(court: ICourt): court is ICourtWithSport {
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

export function mapVenue(venue: VenueApiPayload): IVenue {
  const courts = venue.courts?.map(mapCourt);
  const operatingHour = venue.operatingHours?.[0];

  return {
    ...venue,
    location: buildVenueLocation(venue),
    openTime: venue.openTime ?? operatingHour?.openTime,
    closeTime: venue.closeTime ?? operatingHour?.closeTime,
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
