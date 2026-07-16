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
      <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
        <div className="aspect-[16/10] overflow-hidden bg-muted">
          {coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverImage}
              alt={venue.name}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <ImagePlaceholder className="h-full w-full" />
          )}
        </div>
        <CardContent className="space-y-3 p-4">
          <div>
            <h3 className="line-clamp-1 text-lg font-semibold group-hover:text-primary">
              {venue.name}
            </h3>
            <p className="mt-1 flex items-start gap-1 text-sm text-muted-foreground">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              <span className="line-clamp-2">{venue.location}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="rounded-full bg-secondary px-2.5 py-1 font-medium">
              {venue.fields?.length ?? 0} sân
            </span>
            {minPrice !== null ? (
              <span className="text-muted-foreground">Từ {formatPrice(minPrice)}/giờ</span>
            ) : null}
          </div>

          {sports.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {sports.map((sport) => (
                <span
                  key={sport.id}
                  className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground"
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
