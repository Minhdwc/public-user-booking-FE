'use client';

import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';
import { useFavoritesSummary, useToggleVenueFavorite } from '@/lib/queries/favorites.query';
import { useAuthStore } from '@/lib/stores/auth-store';
import { buildLoginUrl } from '@/lib/utils/auth-action';
import { cn } from '@/lib/utils';

interface FavoriteButtonProps {
  venueId: string;
  venueName: string;
  className?: string;
  iconClassName?: string;
}

export function FavoriteButton({ venueId, venueName, className, iconClassName }: FavoriteButtonProps) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const toggleVenue = useToggleVenueFavorite();
  const { data: summary } = useFavoritesSummary();

  const isFavorite = summary?.venueIds.includes(venueId) ?? false;
  const isPending = toggleVenue.isPending;

  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isHydrated || !isAuthenticated) {
      toast.message('Đăng nhập để lưu yêu thích');
      router.push(buildLoginUrl(window.location.pathname + window.location.search));
      return;
    }

    try {
      const result = await toggleVenue.mutateAsync(venueId);
      toast.message(result.isFavorite ? 'Đã lưu cơ sở' : 'Đã bỏ lưu cơ sở', {
        description: venueName,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể cập nhật yêu thích';
      toast.error(message);
    }
  };

  return (
    <button
      type="button"
      onClick={(event) => void handleClick(event)}
      disabled={isPending}
      className={cn(
        'shrink-0 text-muted-foreground transition-colors hover:text-primary disabled:opacity-60',
        className,
      )}
      aria-label={isFavorite ? 'Bỏ lưu' : 'Lưu yêu thích'}
      aria-pressed={isFavorite}
    >
      <Heart
        className={cn('size-4', isFavorite && 'fill-primary text-primary', iconClassName)}
      />
    </button>
  );
}
