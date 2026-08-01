'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { PageHeader } from '@/components/layout/PageHeader';
import { VenueCard } from '@/components/venue/VenueCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getVenues } from '@/lib/api/venues';
import { useFavoriteVenueIds } from '@/lib/queries/favorites.query';
import { IVenue } from '@/lib/api/types';

interface FavoritesPageContentProps {
  variant?: 'page' | 'sheet';
  active?: boolean;
}

export function FavoritesPageContent({ variant = 'page', active = true }: FavoritesPageContentProps) {
  const isSheet = variant === 'sheet';
  const favoriteVenueIds = useFavoriteVenueIds();

  const venuesQuery = useQuery({
    queryKey: ['venues', 'favorites', favoriteVenueIds],
    queryFn: () => getVenues({ limit: 100 }),
    enabled: active && favoriteVenueIds.length > 0,
  });

  const favoriteVenues = (venuesQuery.data || []).filter((venue: IVenue) =>
    favoriteVenueIds.includes(venue.id),
  );

  if (favoriteVenueIds.length === 0) {
    return (
      <div className={isSheet ? 'space-y-4' : 'space-y-6'}>
        {!isSheet ? (
          <PageHeader
            eyebrow="Yêu thích"
            title="Cơ sở yêu thích"
            description="Lưu các cơ sở bạn quan tâm để xem lại nhanh."
          />
        ) : null}
        <EmptyState
          title="Chưa có cơ sở yêu thích"
          description="Nhấn biểu tượng trái tim trên thẻ cơ sở để thêm vào danh sách."
        />
        <Button asChild className="rounded-lg" size={isSheet ? 'sm' : 'default'}>
          <Link href="/venues">Khám phá cơ sở</Link>
        </Button>
      </div>
    );
  }

  if (venuesQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-80 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (venuesQuery.isError) {
    return (
      <ErrorState
        title="Không tải được cơ sở yêu thích"
        message={
          venuesQuery.error instanceof Error ? venuesQuery.error.message : 'Vui lòng thử lại'
        }
        onRetry={() => venuesQuery.refetch()}
      />
    );
  }

  return (
    <div className={isSheet ? 'space-y-4' : 'space-y-6'}>
      {!isSheet ? (
        <PageHeader
          eyebrow="Yêu thích"
          title="Cơ sở yêu thích"
          description={`${favoriteVenues.length} cơ sở đã lưu`}
        />
      ) : null}

      {favoriteVenues.length === 0 ? (
        <div className="space-y-4">
          <EmptyState
            title="Không tìm thấy cơ sở đã lưu"
            description="Một số cơ sở có thể đã ngừng hoạt động."
          />
          <Button asChild variant="outline" className="rounded-lg" size={isSheet ? 'sm' : 'default'}>
            <Link href="/venues">Xem tất cả cơ sở</Link>
          </Button>
        </div>
      ) : (
        <div className={isSheet ? 'space-y-4' : 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3'}>
          {favoriteVenues.map((venue: IVenue) => (
            <VenueCard key={venue.id} venue={venue} />
          ))}
        </div>
      )}
    </div>
  );
}
