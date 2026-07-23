import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { FavoriteButton } from '@/components/common/FavoriteButton';
import type { VenueWithFields } from '@/lib/api/types';
import { formatPrice } from '@/lib/utils/format';
import { getMinFieldPrice, getVenueSports } from '@/lib/utils/venue';
import { ImagePlaceholder } from '@/components/common/ImagePlaceholder';

interface VenueCardProps {
  venue: VenueWithFields;
}

export function VenueCard({ venue }: VenueCardProps) {
  const coverImage = venue.images?.[0];
  const sports = getVenueSports(venue.fields ?? []);
  const minPrice = getMinFieldPrice(venue.fields ?? []);
  const amenities = venue.amenities ?? [];

  return (
    <Link href={`/venues/${venue.id}`} className="group block h-full">
      <div className="flex h-full flex-col overflow-hidden rounded-md border border-border/70 bg-card shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-md">
        <div className="relative h-72 overflow-hidden bg-muted">
          {coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverImage}
              alt={venue.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <ImagePlaceholder className="h-full w-full" />
          )}

          <FavoriteButton
            target={{ type: 'venue', id: venue.id, name: venue.name }}
            className="absolute right-3 top-3 inline-flex size-9 items-center justify-center rounded-md border border-white/30 bg-black/20 text-white backdrop-blur-sm transition-colors hover:bg-black/40 hover:text-white"
            iconClassName="text-white"
          />

          {minPrice !== null ? (
            <div className="absolute bottom-3 left-3 rounded-md border border-white/20 bg-white/90 px-3 py-1.5 text-sm font-semibold text-foreground backdrop-blur-sm">
              {formatPrice(minPrice)} <span className="text-xs font-normal text-muted-foreground">/giờ</span>
            </div>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col p-5">
          <h3 className="line-clamp-1 text-lg font-semibold text-foreground group-hover:text-primary">
            {venue.name}
          </h3>
          <p className="mt-2 flex items-start gap-1.5 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 size-4 shrink-0" />
            <span className="line-clamp-2">{venue.location}</span>
          </p>

          <div className="mt-auto flex items-center justify-between border-t border-border/40 pt-4">
            <div className="flex flex-wrap items-center gap-1.5">
              {sports.slice(0, 2).map((sport) => (
                <span
                  key={sport.id}
                  className="border border-border/50 bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                >
                  {sport.name}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                {venue.fields?.length ?? 0} sân
              </span>
              {amenities.slice(0, 2).map((amenity) => (
                <span
                  key={amenity.id}
                  className="inline-flex size-7 items-center justify-center border border-border/50 bg-muted text-muted-foreground"
                  title={amenity.name}
                >
                  <span className="text-xs font-medium uppercase">{amenity.name.slice(0, 1)}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
