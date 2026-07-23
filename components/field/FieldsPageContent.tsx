'use client';

import { FormEvent, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Filter, Heart, List, Map as MapIcon } from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { Pagination } from '@/components/common/Pagination';
import { SearchBar } from '@/components/common/SearchBar';
import { SportFilterChips } from '@/components/common/SportFilterChips';
import { FieldCard } from '@/components/field/FieldCard';
import { MapView } from '@/components/field/MapView';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { getFieldsPage } from '@/lib/api/fields';
import { getSports } from '@/lib/api/sports';
import { getVenues } from '@/lib/api/venues';
import { useFavoriteFieldIds } from '@/lib/queries/favorites.query';
import { cn } from '@/lib/utils';

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
  const favoritesOnly = searchParams.get('favorites') === '1';

  const [hoveredFieldId, setHoveredFieldId] = useState<string | null>(null);
  const [showMapMobile, setShowMapMobile] = useState(false);
  const favoriteFieldIds = useFavoriteFieldIds();

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (!value) params.delete(key);
      else params.set(key, value);
    });
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const clearFilters = () => router.push('/fields');

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

  const fields = useMemo(
    () => (fieldsQuery.data?.data ?? []).filter((field) => field.sport).map((field) => ({ ...field, sport: field.sport! })),
    [fieldsQuery.data?.data],
  );
  const displayedFields = useMemo(() => {
    if (!favoritesOnly) return fields;
    return fields.filter((field) => favoriteFieldIds.includes(field.id));
  }, [fields, favoritesOnly, favoriteFieldIds]);
  const total = fieldsQuery.data?.total ?? 0;
  const hasNext = page * PAGE_SIZE < total;
  const hasFilters = Boolean(search || sportId || venueId || minPrice || maxPrice || favoritesOnly);
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
    <div className="flex h-[calc(100vh-4rem)] flex-col md:flex-row">
      {/* Sidebar */}
      <div
        className={cn(
          'flex w-full shrink-0 flex-col border-r border-border/70 bg-background md:w-2/5 lg:w-96 xl:w-104',
          showMapMobile ? 'hidden md:flex' : 'flex',
        )}
      >
        {/* Filters */}
        <div className="space-y-4 border-b border-border/70 p-4">
          <div className="flex gap-2">
            <SearchBar
              defaultValue={search}
              placeholder="Tìm khu vực hoặc tên sân..."
              onSubmit={(query) =>
                updateParams({
                  search: query || null,
                  page: null,
                })
              }
              className="flex-1"
            />
            <Button variant="outline" size="icon" className="shrink-0 rounded-md" aria-label="Bộ lọc">
              <Filter className="size-4" />
            </Button>
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

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() =>
                updateParams({
                  favorites: favoritesOnly ? null : '1',
                  page: null,
                })
              }
              className={cn(
                'inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors',
                favoritesOnly
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border/70 bg-card text-muted-foreground hover:border-primary/30 hover:bg-accent',
              )}
            >
              <Heart className={cn('size-4', favoritesOnly && 'fill-current')} />
              Yêu thích
              {favoriteFieldIds.length > 0 ? (
                <span className="rounded-md bg-background/20 px-1.5 py-0.5 text-xs">
                  {favoriteFieldIds.length}
                </span>
              ) : null}
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <p className="text-muted-foreground">
              Tìm thấy{' '}
              <span className="font-semibold text-foreground">
                {favoritesOnly ? displayedFields.length : total}
              </span>{' '}
              kết quả
            </p>
            {hasFilters ? (
              <button type="button" onClick={clearFilters} className="font-medium text-primary hover:underline">
                Xóa tất cả
              </button>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={venueId ?? ''}
              onChange={(event) =>
                updateParams({
                  venue: event.target.value || null,
                  page: null,
                })
              }
              className="h-9 rounded-md border border-border/70 bg-card px-2 text-sm shadow-sm"
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
                className="h-9 w-24 rounded-md"
              />
              <Input
                name="maxPrice"
                type="number"
                min={0}
                defaultValue={maxPrice}
                placeholder="Giá đến"
                className="h-9 w-24 rounded-md"
              />
              <Button type="submit" variant="outline" className="h-9 rounded-md bg-card">
                Lọc
              </Button>
            </form>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-4">
          {fieldsQuery.isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-36 w-full rounded-md" />
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

          {!fieldsQuery.isLoading && !fieldsQuery.isError && displayedFields.length === 0 ? (
            <EmptyState
              title={favoritesOnly ? 'Chưa có sân yêu thích' : 'Không tìm thấy sân'}
              description={
                favoritesOnly
                  ? 'Nhấn biểu tượng trái tim trên sân bạn thích để lưu lại.'
                  : hasFilters
                    ? 'Thử đổi từ khóa hoặc bộ lọc khác.'
                    : 'Hiện chưa có sân nào trong hệ thống.'
              }
              actionLabel={hasFilters ? 'Xóa bộ lọc' : undefined}
              onAction={hasFilters ? clearFilters : undefined}
            />
          ) : null}

          {displayedFields.length > 0 ? (
            <div className="space-y-4">
              {displayedFields.map((field) => (
                <FieldCard
                  key={field.id}
                  field={field}
                  isSelected={hoveredFieldId === field.id}
                  onHover={setHoveredFieldId}
                />
              ))}
              <Pagination
                page={page}
                hasNext={hasNext}
                onPageChange={(nextPage) =>
                  updateParams({ page: nextPage > 1 ? String(nextPage) : null })
                }
              />
            </div>
          ) : null}
        </div>
      </div>

      {/* Map */}
      <div className={
        'relative flex-1 bg-muted ' +
        (showMapMobile ? 'flex' : 'hidden md:flex')
      }>
        <MapView
          fields={displayedFields}
          selectedFieldId={hoveredFieldId}
          favoriteFieldIds={favoriteFieldIds}
          onSelectField={setHoveredFieldId}
        />

        {/* Mobile toggle */}
        <div className="absolute bottom-4 left-1/2 z-[1000] -translate-x-1/2 md:hidden">
          <Button
            variant="default"
            size="sm"
            className="gap-2 rounded-md shadow-lg"
            onClick={() => setShowMapMobile((prev) => !prev)}
          >
            {showMapMobile ? <List className="size-4" /> : <MapIcon className="size-4" />}
            {showMapMobile ? 'Danh sách' : 'Bản đồ'}
          </Button>
        </div>
      </div>
    </div>
  );
}
