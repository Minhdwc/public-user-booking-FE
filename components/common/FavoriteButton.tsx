'use client';

import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';
import {
  useFavoritesSummary,
  useToggleFieldFavorite,
  useToggleVenueFavorite,
} from '@/lib/queries/favorites.query';
import { useAuthStore } from '@/lib/stores/auth-store';
import { buildLoginUrl } from '@/lib/utils/auth-action';
import { cn } from '@/lib/utils';

type FavoriteTarget =
  | { type: 'field'; id: string; name: string }
  | { type: 'venue'; id: string; name: string };

interface FavoriteButtonProps {
  target: FavoriteTarget;
  className?: string;
  iconClassName?: string;
}

export function FavoriteButton({ target, className, iconClassName }: FavoriteButtonProps) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const toggleField = useToggleFieldFavorite();
  const toggleVenue = useToggleVenueFavorite();
  const { data: summary } = useFavoritesSummary();

  const isFavorite =
    target.type === 'field'
      ? (summary?.fieldIds.includes(target.id) ?? false)
      : (summary?.venueIds.includes(target.id) ?? false);
  const isPending = toggleField.isPending || toggleVenue.isPending;

  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isHydrated || !isAuthenticated) {
      toast.message('Đăng nhập để lưu yêu thích');
      router.push(buildLoginUrl(window.location.pathname + window.location.search));
      return;
    }

    try {
      const result =
        target.type === 'field'
          ? await toggleField.mutateAsync(target.id)
          : await toggleVenue.mutateAsync(target.id);
      const label = target.type === 'field' ? 'sân' : 'cơ sở';
      toast.message(result.isFavorite ? `Đã lưu ${label}` : `Đã bỏ lưu ${label}`, {
        description: target.name,
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
