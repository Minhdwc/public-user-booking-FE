'use client';

import { useEffect, useMemo } from 'react';
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
import { searchVenuesList } from '@/lib/api/search';

const PAGE_SIZE = 9;

function findSportByQuery(query: string, sports: { id: string; name: string }[]) {
  const q = query.trim().toLowerCase();
  if (!q) return null;
  return (
    sports.find((sport) => {
      const name = sport.name.trim().toLowerCase();
      return name === q || name.includes(q) || q.includes(name);
    }) || null
  );
}

export function VenuesPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const search = searchParams.get('search') ?? '';
  const sportId = searchParams.get('sport');
  const date = searchParams.get('date');
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

  useEffect(() => {
    if (!search.trim() || !sportsQuery.data?.length) return;

    const matchedSport = findSportByQuery(search, sportsQuery.data);
    if (!matchedSport) return;

    const params = new URLSearchParams({ sport: matchedSport.id });
    if (date) params.set('date', date);
    router.replace(`/fields?${params.toString()}`);
  }, [date, router, search, sportsQuery.data]);

  const venuesQuery = useQuery({
    queryKey: ['venues', { search, page, limit: PAGE_SIZE }],
    queryFn: async () => {
      if (search.trim()) {
        return searchVenuesList({ search, page, limit: PAGE_SIZE });
      }
      return getVenues({ search: search || undefined, page, limit: PAGE_SIZE });
    },
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
          onSubmit={(query) => {
            const matchedSport = findSportByQuery(query, sportsQuery.data ?? []);
            if (matchedSport) {
              const params = new URLSearchParams({ sport: matchedSport.id });
              if (date) params.set('date', date);
              router.push(`/fields?${params.toString()}`);
              return;
            }

            updateParams({
              search: query || null,
              page: null,
            });
          }}
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
            <Skeleton key={index} className="h-72 w-full rounded-lg" />
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
