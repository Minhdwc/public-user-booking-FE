import Link from 'next/link';
import { MapPin, Star } from 'lucide-react';
import { FavoriteButton } from '@/components/common/FavoriteButton';
import { IVenue } from '@/lib/api/types';
import { formatPrice } from '@/lib/utils/format';
import { ImagePlaceholder } from '@/components/common/ImagePlaceholder';

export function VenueCard({ venue }: { venue: IVenue }) {
  const coverImage = venue.images?.[0];
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
      className="group block overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-lg"
    >
      <div className="relative aspect-16/10 overflow-hidden bg-muted">
        {coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverImage}
            alt={venue.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <ImagePlaceholder className="h-full w-full rounded-none border-0" />
        )}

        <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />

        <FavoriteButton
          venueId={venue.id}
          venueName={venue.name}
          className="absolute right-3 top-3 inline-flex size-9 items-center justify-center rounded-full border border-white/30 bg-black/25 text-white backdrop-blur-sm transition-colors hover:bg-black/40"
          iconClassName="text-white"
        />

        {minPrice !== null ? (
          <div className="absolute bottom-3 left-3 rounded-xl bg-white/95 px-3 py-1.5 text-sm font-bold text-primary shadow-sm backdrop-blur-sm">
            {formatPrice(minPrice)}
            <span className="text-xs font-normal text-muted-foreground">/giờ</span>
          </div>
        ) : null}
      </div>

      <div className="space-y-3 p-4">
        <div>
          <h3 className="line-clamp-1 text-base font-semibold text-foreground group-hover:text-primary">
            {venue.name}
          </h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" />
            <span className="line-clamp-2">{venue.location || 'Chưa có địa chỉ'}</span>
          </p>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border/50 pt-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {sports.slice(0, 2).map((sport) => (
              <span
                key={sport.id}
                className="rounded-full border border-border/50 bg-muted/80 px-2.5 py-0.5 text-xs text-muted-foreground"
              >
                {sport.name}
              </span>
            ))}
            <span className="text-xs text-muted-foreground">{courts.length} sân</span>
          </div>

          {hasRating ? (
            <span className="inline-flex items-center gap-1 text-sm font-medium text-amber-600">
              <Star className="size-4 fill-amber-400 text-amber-400" />
              {venue.ratingAverage!.toFixed(1)}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">Chưa có đánh giá</span>
          )}
        </div>
      </div>
    </Link>
  );
}
