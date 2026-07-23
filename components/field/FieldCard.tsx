import Link from 'next/link';
import { MapPin, Star } from 'lucide-react';
import { FavoriteButton } from '@/components/common/FavoriteButton';
import type { Field, Sport } from '@/lib/api/types';
import { formatPrice } from '@/lib/utils/format';
import { ImagePlaceholder } from '@/components/common/ImagePlaceholder';
import { cn } from '@/lib/utils';

interface FieldCardProps {
  field: Field & { sport: Sport };
  isSelected?: boolean;
  onHover?: (fieldId: string | null) => void;
}

function getMockRating(fieldId: string) {
  const hash = fieldId.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const rating = 4 + (hash % 10) / 10;
  const reviewCount = 50 + (hash % 200);
  return { rating, reviewCount };
}

export function FieldCard({ field, isSelected, onHover }: FieldCardProps) {
  const coverImage = field.images?.[0];
  const { rating, reviewCount } = getMockRating(field.id);

  return (
    <Link
      href={`/fields/${field.id}`}
      className={cn(
        'group flex gap-4 border border-border/70 bg-card p-3 transition-all hover:shadow-md',
        isSelected && 'border-primary ring-1 ring-primary/30',
      )}
      onMouseEnter={() => onHover?.(field.id)}
      onMouseLeave={() => onHover?.(null)}
    >
      <div className="relative shrink-0 overflow-hidden rounded-md bg-muted">
        <div className="h-24 w-32 sm:h-28 sm:w-40">
          {coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverImage} alt={field.name} className="h-full w-full object-cover" />
          ) : (
            <ImagePlaceholder className="h-full w-full" />
          )}
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div className="space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 text-base font-semibold text-foreground group-hover:text-primary sm:text-lg">
              {field.name}
            </h3>
            <FavoriteButton target={{ type: 'field', id: field.id, name: field.name }} />
          </div>

          <p className="inline-flex items-center gap-1 text-xs text-muted-foreground sm:text-sm">
            <MapPin className="size-3.5" />
            <span className="line-clamp-1">{field.venue?.location ?? 'Chưa có địa chỉ'}</span>
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {field.sport.name}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-500">
              <Star className="size-3.5 fill-amber-400 text-amber-400" />
              {rating.toFixed(1)} ({reviewCount})
            </span>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <p className="text-base font-bold text-primary sm:text-lg">
            {formatPrice(field.price)}
            <span className="text-xs font-normal text-muted-foreground">/giờ</span>
          </p>
          <span className="inline-flex h-8 items-center justify-center rounded-md bg-foreground px-3 text-xs font-medium text-background">
            Đặt ngay
          </span>
        </div>
      </div>
    </Link>
  );
}
