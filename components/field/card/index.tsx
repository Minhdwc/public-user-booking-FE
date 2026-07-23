import Link from 'next/link';
import { ArrowRight, MapPin, Star } from 'lucide-react';
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
        'group block overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-lg',
        isSelected && 'border-primary/40 ring-2 ring-primary/20 shadow-md',
      )}
      onMouseEnter={() => onHover?.(field.id)}
      onMouseLeave={() => onHover?.(null)}
    >
      <div className="relative aspect-16/10 overflow-hidden bg-muted">
        {coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverImage}
            alt={field.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <ImagePlaceholder className="h-full w-full rounded-none border-0" />
        )}

        <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />

        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-foreground shadow-sm backdrop-blur-sm">
          {field.sport.name}
        </span>

        <FavoriteButton
          venueId={field.venueId}
          venueName={field.venue?.name ?? field.name}
          className="absolute right-3 top-3 inline-flex size-9 items-center justify-center rounded-full border border-white/30 bg-black/25 text-white backdrop-blur-sm transition-colors hover:bg-black/40"
          iconClassName="text-white"
        />

        <div className="absolute bottom-3 left-3 rounded-xl bg-white/95 px-3 py-1.5 text-sm font-bold text-primary shadow-sm backdrop-blur-sm">
          {formatPrice(field.price)}
          <span className="text-xs font-normal text-muted-foreground">/giờ</span>
        </div>
      </div>

      <div className="space-y-3 p-4">
        <div>
          <h3 className="line-clamp-1 text-base font-semibold text-foreground group-hover:text-primary">
            {field.name}
          </h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" />
            <span className="line-clamp-1">{field.venue?.name ?? 'Chưa có cơ sở'}</span>
          </p>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border/50 pt-3">
          <span className="inline-flex items-center gap-1 text-sm font-medium text-amber-600">
            <Star className="size-4 fill-amber-400 text-amber-400" />
            {rating.toFixed(1)}
            <span className="text-xs font-normal text-muted-foreground">({reviewCount})</span>
          </span>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-colors group-hover:bg-primary/90">
            Đặt sân
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
