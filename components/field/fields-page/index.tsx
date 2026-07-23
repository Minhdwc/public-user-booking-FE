'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { List, Map as MapIcon } from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { Pagination } from '@/components/common/Pagination';
import { FieldCard } from '@/components/field/card';
import { FieldFilters } from '@/components/field/fields-page/filters';
import { useFieldFilters } from '@/components/field/fields-page/useFieldFilters';
import { MapView } from '@/components/field/map';
import {
  VenueMapMarkerDialog,
  type VenueMapPoint,
} from '@/components/field/map/venue-marker-dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getFieldsPage } from '@/lib/api/fields';
import { useFavoriteVenueIds } from '@/lib/queries/favorites.query';
import type { Field, Sport } from '@/lib/api/types';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 12;

function FieldCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
      <Skeleton className="aspect-16/10 w-full rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex justify-between border-t border-border/50 pt-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function FieldsPageContent() {
  const { values, options, actions, page, hasActiveFilters } = useFieldFilters();
  const { search, sportId, venueId, minPrice, maxPrice, favoritesOnly } = values;
  const { clearFilters, updateParams } = actions;

  const [hoveredFieldId, setHoveredFieldId] = useState<string | null>(null);
  const [showMapMobile, setShowMapMobile] = useState(false);
  const [selectedMapVenue, setSelectedMapVenue] = useState<VenueMapPoint | null>(null);
  const [mapVenueDialogOpen, setMapVenueDialogOpen] = useState(false);
  const favoriteVenueIds = useFavoriteVenueIds();

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
    () =>
      (fieldsQuery.data?.data ?? [])
        .filter((field: Field) => field.sport)
        .map((field: Field & { sport: Sport }) => ({ ...field, sport: field.sport })),
    [fieldsQuery.data?.data],
  );

  const displayedFields = useMemo(() => {
    if (!favoritesOnly) return fields;
    return fields.filter((field: Field & { sport: Sport }) =>
      favoriteVenueIds.includes(field.venueId),
    );
  }, [fields, favoritesOnly, favoriteVenueIds]);

  const total = fieldsQuery.data?.total ?? 0;
  const hasNext = page * PAGE_SIZE < total;

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col lg:flex-row">
      <aside
        className={cn(
          'flex w-full shrink-0 flex-col bg-background lg:w-105 xl:w-110',
          showMapMobile ? 'hidden lg:flex' : 'flex',
        )}
      >
        <FieldFilters
          values={values}
          options={options}
          actions={actions}
          total={favoritesOnly ? displayedFields.length : total}
        />

        <div className="flex-1 overflow-y-auto bg-muted/20 px-3 py-4 sm:px-4">
          {fieldsQuery.isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <FieldCardSkeleton key={index} />
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
            <div className="flex min-h-64 items-center justify-center">
              <EmptyState
                title={favoritesOnly ? 'Chưa có sân yêu thích' : 'Không tìm thấy sân'}
                description={
                  favoritesOnly
                    ? 'Nhấn biểu tượng trái tim trên sân bạn thích để lưu lại.'
                    : 'Thử đổi từ khóa hoặc bộ lọc khác.'
                }
                actionLabel={hasActiveFilters ? 'Xóa bộ lọc' : undefined}
                onAction={hasActiveFilters ? clearFilters : undefined}
              />
            </div>
          ) : null}

          {displayedFields.length > 0 ? (
            <div className="space-y-4">
              {displayedFields.map((field: Field & { sport: Sport }) => (
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
      </aside>

      <div className={cn('relative min-h-0 flex-1 bg-muted/40', showMapMobile ? 'flex' : 'hidden lg:flex')}>
        <MapView
          fields={displayedFields}
          selectedFieldId={hoveredFieldId}
          favoriteVenueIds={favoriteVenueIds}
          onSelectField={setHoveredFieldId}
          onVenueClick={(venue) => {
            setSelectedMapVenue(venue);
            setMapVenueDialogOpen(true);
          }}
        />

        <div className="absolute bottom-5 left-1/2 z-1000 -translate-x-1/2 lg:hidden">
          <Button
            size="sm"
            className="h-11 gap-2 rounded-full px-5 shadow-xl"
            onClick={() => setShowMapMobile((prev) => !prev)}
          >
            {showMapMobile ? <List className="size-4" /> : <MapIcon className="size-4" />}
            {showMapMobile ? 'Xem danh sách' : 'Xem bản đồ'}
          </Button>
        </div>
      </div>

      <VenueMapMarkerDialog
        venue={selectedMapVenue}
        open={mapVenueDialogOpen}
        onOpenChange={setMapVenueDialogOpen}
      />
    </div>
  );
}
