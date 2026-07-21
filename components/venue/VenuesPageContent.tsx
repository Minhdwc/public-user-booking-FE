'use client';

import { useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { Pagination } from '@/components/common/Pagination';
import { SearchBar } from '@/components/common/SearchBar';
import { SportFilterChips } from '@/components/common/SportFilterChips';
import { PageHeader } from '@/components/layout/PageHeader';
import { VenueCard } from '@/components/venue/VenueCard';
import { Skeleton } from '@/components/ui/skeleton';
import { getSports } from '@/lib/api/sports';
import { getVenues } from '@/lib/api/venues';

const PAGE_SIZE = 9;

export function VenuesPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const search = searchParams.get('search') ?? '';
  const sportId = searchParams.get('sport');
  const page = Math.max(1, Number(searchParams.get('page') || '1'));

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (!value) params.delete(key);
      else params.set(key, value);
    });
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const sportsQuery = useQuery({
    queryKey: ['sports'],
    queryFn: getSports,
  });

  const venuesQuery = useQuery({
    queryKey: ['venues', { search, page, limit: PAGE_SIZE }],
    queryFn: () => getVenues({ search: search || undefined, page, limit: PAGE_SIZE }),
  });

  const filteredVenues = useMemo(() => {
    const venues = venuesQuery.data ?? [];
    if (!sportId) return venues;
    return venues.filter((venue) =>
      (venue.fields ?? []).some((field) => field.sportId === sportId),
    );
  }, [venuesQuery.data, sportId]);

  const hasNext = (venuesQuery.data?.length ?? 0) === PAGE_SIZE;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Khám phá"
        title="Cơ sở thể thao"
        description="Tìm theo tên cơ sở, địa điểm hoặc môn thể thao bạn muốn chơi."
      />

      <div className="surface-card space-y-5 p-5 sm:p-6">
        <SearchBar
          defaultValue={search}
          placeholder="Nhập từ khóa tìm kiếm..."
          onSubmit={(query) =>
            updateParams({
              search: query || null,
              page: null,
            })
          }
        />
        <SportFilterChips
          sports={sportsQuery.data ?? []}
          selectedSportId={sportId}
          isLoading={sportsQuery.isLoading}
          onSelect={(id) =>
            updateParams({
              sport: id,
              page: null,
            })
          }
        />
      </div>

      {venuesQuery.isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: PAGE_SIZE }).map((_, index) => (
            <Skeleton key={index} className="aspect-[4/3] w-full rounded-2xl" />
          ))}
        </div>
      ) : null}

      {venuesQuery.isError ? (
        <ErrorState
          message={
            venuesQuery.error instanceof Error
              ? venuesQuery.error.message
              : 'Không thể tải danh sách cơ sở'
          }
          onRetry={() => venuesQuery.refetch()}
        />
      ) : null}

      {!venuesQuery.isLoading && !venuesQuery.isError && filteredVenues.length === 0 ? (
        <EmptyState
          title="Không tìm thấy cơ sở"
          description={
            search || sportId
              ? 'Thử đổi từ khóa hoặc bộ lọc môn thể thao.'
              : 'Hiện chưa có cơ sở nào trong hệ thống.'
          }
          actionLabel={search || sportId ? 'Xóa bộ lọc' : undefined}
          onAction={search || sportId ? () => router.push('/venues') : undefined}
        />
      ) : null}

      {filteredVenues.length > 0 ? (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredVenues.map((venue) => (
              <VenueCard key={venue.id} venue={venue} />
            ))}
          </div>
          <Pagination
            page={page}
            hasNext={hasNext}
            onPageChange={(nextPage) =>
              updateParams({ page: nextPage > 1 ? String(nextPage) : null })
            }
          />
        </>
      ) : null}
    </div>
  );
}
