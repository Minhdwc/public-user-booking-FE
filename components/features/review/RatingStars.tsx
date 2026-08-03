import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingStarsProps {
  rating: number;
  max?: number;
  size?: 'sm' | 'md';
  showValue?: boolean;
  className?: string;
}

export function RatingStars({
  rating,
  max = 5,
  size = 'md',
  showValue = false,
  className,
}: RatingStarsProps) {
  const iconSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {Array.from({ length: max }).map((_, index) => {
        const filled = index < Math.round(rating);
        return (
          <Star
            key={index}
            className={cn(
              iconSize,
              filled ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/40',
            )}
          />
        );
      })}
      {showValue ? (
        <span className="ml-1 text-sm text-muted-foreground">{rating.toFixed(1)}</span>
      ) : null}
    </div>
  );
}

export function getAverageRating(ratings: number[]) {
  if (ratings.length === 0) return 0;
  return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
}
