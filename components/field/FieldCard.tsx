import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Field, Sport } from '@/lib/api/types';
import { formatPrice } from '@/lib/utils/format';
import { ImagePlaceholder } from '@/components/common/ImagePlaceholder';

interface FieldCardProps {
  field: Field & { sport: Sport };
  showVenueLink?: boolean;
  venueName?: string;
}

export function FieldCard({ field, showVenueLink = false, venueName }: FieldCardProps) {
  const coverImage = field.images?.[0];

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        <div className="aspect-video w-full shrink-0 bg-muted sm:w-48 md:w-56">
          {coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverImage} alt={field.name} className="h-full w-full object-cover" />
          ) : (
            <ImagePlaceholder className="h-full w-full" />
          )}
        </div>
        <CardContent className="flex flex-1 flex-col justify-between gap-4 p-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold">{field.name}</h3>
              <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium">
                {field.sport.name}
              </span>
            </div>
            {field.description ? (
              <p className="line-clamp-2 text-sm text-muted-foreground">{field.description}</p>
            ) : null}
            {showVenueLink && venueName ? (
              <p className="text-sm text-muted-foreground">Thuộc {venueName}</p>
            ) : null}
            <p className="text-base font-semibold text-primary">
              {formatPrice(field.price)}
              <span className="text-sm font-normal text-muted-foreground"> / giờ</span>
            </p>
          </div>
          <Button asChild className="w-full sm:w-auto">
            <Link href={`/fields/${field.id}`}>Xem chi tiết & Đặt sân</Link>
          </Button>
        </CardContent>
      </div>
    </Card>
  );
}
