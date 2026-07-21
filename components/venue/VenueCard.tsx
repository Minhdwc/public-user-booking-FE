import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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

  return (
    <Link href={`/venues/${venue.id}`} className="group block h-full">
      <Card className="h-full overflow-hidden rounded-2xl border-border/70 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          {coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverImage}
              alt={venue.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <ImagePlaceholder className="h-full w-full" />
          )}
          {minPrice !== null ? (
            <span className="absolute bottom-3 left-3 rounded-full bg-card/95 px-3 py-1 text-xs font-semibold text-primary shadow-sm backdrop-blur">
              Từ {formatPrice(minPrice)}/giờ
            </span>
          ) : null}
        </div>
        <CardContent className="space-y-3 p-5">
          <div>
            <h3 className="line-clamp-1 text-lg font-semibold text-heading group-hover:text-primary">
              {venue.name}
            </h3>
            <p className="mt-1.5 flex items-start gap-1.5 text-sm text-muted-foreground">
              <MapPin className="mt-0.5 size-4 shrink-0" />
              <span className="line-clamp-2">{venue.location}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
              {venue.fields?.length ?? 0} sân
            </span>
          </div>

          {sports.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {sports.slice(0, 3).map((sport) => (
                <span
                  key={sport.id}
                  className="rounded-full border border-border/70 bg-muted/50 px-2.5 py-0.5 text-xs text-muted-foreground"
                >
                  {sport.name}
                </span>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </Link>
  );
}
