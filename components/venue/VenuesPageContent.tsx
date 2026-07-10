'use client';

import { FormEvent, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { Pagination } from '@/components/common/Pagination';
import { SportFilterChips } from '@/components/common/SportFilterChips';
import { VenueCard } from '@/components/venue/VenueCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    return venues.filter((venue) => venue.fields.some((field) => field.sportId === sportId));
  }, [venuesQuery.data, sportId]);

  const hasNext = (venuesQuery.data?.length ?? 0) === PAGE_SIZE;

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const query = String(formData.get('search') ?? '').trim();
    updateParams({
      search: query || null,
      page: null,
    });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold sm:text-3xl">Tìm sân</h1>
        <p className="text-muted-foreground">
          Tìm theo tên cụm sân, địa điểm hoặc tên sân con
        </p>
      </div>

      <form key={search} onSubmit={handleSearchSubmit} className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="search"
            defaultValue={search}
            placeholder="Nhập từ khóa tìm kiếm..."
            className="pl-10"
          />
        </div>
        <Button type="submit">Tìm kiếm</Button>
      </form>

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

      {sportId ? (
        <p className="text-sm text-muted-foreground">
          Đang lọc theo môn thể thao trên trang hiện tại (client-side, tạm thời).
        </p>
      ) : null}

      {venuesQuery.isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: PAGE_SIZE }).map((_, index) => (
            <Skeleton key={index} className="aspect-[4/3] w-full rounded-xl" />
          ))}
        </div>
      ) : null}

      {venuesQuery.isError ? (
        <ErrorState
          message={
            venuesQuery.error instanceof Error
              ? venuesQuery.error.message
              : 'Không thể tải danh sách cụm sân'
          }
          onRetry={() => venuesQuery.refetch()}
        />
      ) : null}

      {!venuesQuery.isLoading && !venuesQuery.isError && filteredVenues.length === 0 ? (
        <EmptyState
          title="Không tìm thấy cụm sân"
          description={
            search || sportId
              ? 'Thử đổi từ khóa hoặc bộ lọc môn thể thao.'
              : 'Hiện chưa có cụm sân nào trong hệ thống.'
          }
          actionLabel={search || sportId ? 'Xóa bộ lọc' : undefined}
          onAction={
            search || sportId
              ? () => {
                  router.push('/venues');
                }
              : undefined
          }
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
            onPageChange={(nextPage) => updateParams({ page: nextPage > 1 ? String(nextPage) : null })}
          />
        </>
      ) : null}
    </div>
  );
}
