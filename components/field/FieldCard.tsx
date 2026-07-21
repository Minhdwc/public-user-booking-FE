import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
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
    <Card className="overflow-hidden rounded-2xl border-border/70 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-col lg:flex-row">
        <div className="relative aspect-[16/10] w-full shrink-0 bg-muted lg:w-72">
          {coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverImage} alt={field.name} className="h-full w-full object-cover" />
          ) : (
            <ImagePlaceholder className="h-full w-full" />
          )}
          <span className="absolute left-3 top-3 rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
            {field.sport.name}
          </span>
        </div>
        <CardContent className="flex flex-1 flex-col justify-between gap-5 p-5 sm:p-6">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-heading">{field.name}</h3>
            {field.description ? (
              <p className="line-clamp-2 text-sm text-muted-foreground">{field.description}</p>
            ) : null}
            {showVenueLink && venueName ? (
              <p className="text-sm text-muted-foreground">Thuộc {venueName}</p>
            ) : null}
            <p className="text-lg font-bold text-primary">
              {formatPrice(field.price)}
              <span className="text-sm font-normal text-muted-foreground"> / giờ</span>
            </p>
          </div>
          <Button asChild className="w-full rounded-full sm:w-auto">
            <Link href={`/fields/${field.id}`}>
              Xem & đặt sân
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </CardContent>
      </div>
    </Card>
  );
}
