import Link from 'next/link';
import { MapPin, Star } from 'lucide-react';
import { FavoriteButton } from '@/components/features/common/FavoriteButton';
import { IVenue } from '@/lib/api/types';
import { formatPrice, formatVenueAddress } from '@/lib/utils/format';
import { ImagePlaceholder } from '@/components/features/common/ImagePlaceholder';

export function VenueCard({ venue }: { venue: IVenue }) {
  const coverImage = venue.venueImages?.[0]?.url;
  const courts = venue.courts ?? [];
  const sports = Array.from(
    new Map(
      courts.filter((court) => court.sport).map((court) => [court.sport!.id, court.sport!.name]),
    ).entries(),
  ).map(([id, name]) => ({ id, name }));
  const minPrice = courts.length ? Math.min(...courts.map((court) => court.basePriceVnd)) : null;
  const hasRating = (venue.ratingCount ?? 0) > 0 && venue.ratingAverage != null;

  return (
    <Link
      href={`/venues/${venue.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl"
    >
      <div className="relative aspect-16/10 overflow-hidden bg-muted">
        {coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverImage}
            alt={venue.name}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <ImagePlaceholder className="h-full w-full rounded-none border-0" />
        )}

        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent opacity-80 transition-opacity group-hover:opacity-90" />

        {hasRating ? (
          <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/40 px-2.5 py-1 text-xs font-semibold text-amber-300 backdrop-blur-md shadow-xs">
            <Star className="size-3.5 fill-amber-400 text-amber-400" />
            <span>{venue.ratingAverage!.toFixed(1)}</span>
            {venue.ratingCount ? (
              <span className="text-xs text-white/70">({venue.ratingCount})</span>
            ) : null}
          </div>
        ) : null}

        <FavoriteButton
          venueId={venue.id}
          venueName={venue.name}
          className="absolute right-3 top-3 inline-flex size-9 items-center justify-center rounded-full border border-white/30 bg-black/30 text-white backdrop-blur-md transition-transform duration-200 hover:scale-110 hover:bg-black/50"
          iconClassName="text-white"
        />

        {minPrice !== null ? (
          <div className="absolute bottom-3 left-3 flex items-baseline gap-1 rounded-xl border border-white/20 bg-emerald-600/90 px-3 py-1 text-sm font-extrabold text-white shadow-md backdrop-blur-md">
            <span>{formatPrice(minPrice)}</span>
            <span className="text-xs font-normal text-emerald-100">/giờ</span>
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col justify-between space-y-3 p-4">
        <div>
          <h3 className="line-clamp-1 text-base font-bold text-foreground transition-colors group-hover:text-primary">
            {venue.name}
          </h3>
          <p className="mt-1.5 flex items-start gap-1.5 text-xs text-muted-foreground">
            <MapPin className="size-3.5 shrink-0 text-primary mt-0.5" />
            <span className="line-clamp-2 leading-relaxed">{formatVenueAddress(venue)}</span>
          </p>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border/50 pt-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {sports.slice(0, 2).map((sport) => (
              <span
                key={sport.id}
                className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300"
              >
                {sport.name}
              </span>
            ))}
            {sports.length > 2 ? (
              <span className="text-xs font-medium text-muted-foreground">
                +{sports.length - 2}
              </span>
            ) : null}
          </div>

          <span className="shrink-0 text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
            {courts.length} sân
          </span>
        </div>
      </div>
    </Link>
  );
}
