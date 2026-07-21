'use client';

import { FormEvent, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { Pagination } from '@/components/common/Pagination';
import { SearchBar } from '@/components/common/SearchBar';
import { SportFilterChips } from '@/components/common/SportFilterChips';
import { FieldCard } from '@/components/field/FieldCard';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { getFieldsPage } from '@/lib/api/fields';
import { getSports } from '@/lib/api/sports';
import { getVenues } from '@/lib/api/venues';

const PAGE_SIZE = 12;

export function FieldsPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const search = searchParams.get('search') ?? '';
  const sportId = searchParams.get('sport');
  const venueId = searchParams.get('venue');
  const minPrice = searchParams.get('minPrice') ?? '';
  const maxPrice = searchParams.get('maxPrice') ?? '';
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
    queryKey: ['venues', 'filter-options'],
    queryFn: () => getVenues({ limit: 100 }),
  });

  const fieldsQuery = useQuery({
    queryKey: ['fields', 'page', { search, sportId, venueId, minPrice, maxPrice, page }],
    queryFn: () =>
      getFieldsPage({
        search: search || undefined,
        sportId: sportId || undefined,
        venueId: venueId || undefined,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        page,
        limit: PAGE_SIZE,
      }),
  });

  const fields = fieldsQuery.data?.data ?? [];
  const total = fieldsQuery.data?.total ?? 0;
  const hasNext = page * PAGE_SIZE < total;
  const hasFilters = Boolean(search || sportId || venueId || minPrice || maxPrice);
  const venueOptions = useMemo(() => venuesQuery.data ?? [], [venuesQuery.data]);

  const handlePriceSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    updateParams({
      minPrice: String(formData.get('minPrice') ?? '').trim() || null,
      maxPrice: String(formData.get('maxPrice') ?? '').trim() || null,
      page: null,
    });
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Đặt sân"
        title="Danh sách sân"
        description="Lọc theo môn, cơ sở và khoảng giá để tìm sân phù hợp nhất."
      />

      <div className="surface-card space-y-5 p-5 sm:p-6">
        <SearchBar
          defaultValue={search}
          placeholder="Tìm theo tên sân..."
          onSubmit={(query) =>
            updateParams({
              search: query || null,
              page: null,
            })
          }
        />

        <div className="grid gap-3 lg:grid-cols-[1fr_1fr_auto]">
          <select
            value={venueId ?? ''}
            onChange={(event) =>
              updateParams({
                venue: event.target.value || null,
                page: null,
              })
            }
            className="h-11 rounded-xl border border-border/70 bg-card px-3 text-sm shadow-sm"
          >
            <option value="">Tất cả cơ sở</option>
            {venueOptions.map((venue) => (
              <option key={venue.id} value={venue.id}>
                {venue.name}
              </option>
            ))}
          </select>

          <form key={`${minPrice}-${maxPrice}`} onSubmit={handlePriceSubmit} className="flex gap-2">
            <Input
              name="minPrice"
              type="number"
              min={0}
              defaultValue={minPrice}
              placeholder="Giá từ"
              className="h-11 rounded-xl"
            />
            <Input
              name="maxPrice"
              type="number"
              min={0}
              defaultValue={maxPrice}
              placeholder="Giá đến"
              className="h-11 rounded-xl"
            />
            <Button type="submit" variant="outline" className="h-11 rounded-xl bg-card">
              Lọc giá
            </Button>
          </form>
        </div>

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

      {fieldsQuery.isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-44 w-full rounded-2xl" />
          ))}
        </div>
      ) : null}

      {fieldsQuery.isError ? (
        <ErrorState
          message={
            fieldsQuery.error instanceof Error
              ? fieldsQuery.error.message
              : 'Không thể tải danh sách sân'
          }
          onRetry={() => fieldsQuery.refetch()}
        />
      ) : null}

      {!fieldsQuery.isLoading && !fieldsQuery.isError && fields.length === 0 ? (
        <EmptyState
          title="Không tìm thấy sân"
          description={
            hasFilters
              ? 'Thử đổi từ khóa hoặc bộ lọc khác.'
              : 'Hiện chưa có sân nào trong hệ thống.'
          }
          actionLabel={hasFilters ? 'Xóa bộ lọc' : undefined}
          onAction={hasFilters ? () => router.push('/fields') : undefined}
        />
      ) : null}

      {fields.length > 0 ? (
        <>
          <div className="space-y-4">
            {fields
              .filter((field) => field.sport)
              .map((field) => (
                <FieldCard
                  key={field.id}
                  field={{ ...field, sport: field.sport! }}
                  showVenueLink
                  venueName={field.venue?.name}
                />
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
