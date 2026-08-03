'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { List, Map as MapIcon } from 'lucide-react';
import { toast } from 'sonner';
import { EmptyState } from '@/components/features/common/EmptyState';
import { ErrorState } from '@/components/features/common/ErrorState';
import { Pagination } from '@/components/features/common/Pagination';
import { FieldCard } from '@/components/features/field/card';
import { FieldFilters } from '@/components/features/field/fields-page/filters';
import { useFieldFilters } from '@/components/features/field/fields-page/useFieldFilters';
import { MapView } from '@/components/features/field/map';
import {
  VenueMapMarkerDialog,
  type VenueMapPoint,
} from '@/components/features/field/map/venue-marker-dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getCourtsPage } from '@/lib/api/courts';
import { useUserLocation } from '@/lib/hooks/use-user-location';
import { useFavoriteVenueIds } from '@/lib/queries/favorites.query';
import { ICourtWithSport } from '@/lib/api/types';
import { formatDistanceKm, getCourtDistanceKm } from '@/lib/utils/geo';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 12;
const NEAR_ME_FETCH_LIMIT = 100;

const FieldCardSkeleton = () => (
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

const sortCourtsByDistance = (
  courts: ICourtWithSport[],
  userLocation: { latitude: number; longitude: number },
) =>
  [...courts].sort((a, b) => {
    const distanceA = getCourtDistanceKm(a, userLocation) ?? Number.POSITIVE_INFINITY;
    const distanceB = getCourtDistanceKm(b, userLocation) ?? Number.POSITIVE_INFINITY;
    return distanceA - distanceB;
  });

export const FieldsPageContent = () => {
  const { values, options, actions, page, hasActiveFilters } = useFieldFilters();
  const { search, sportId, venueId, minPrice, maxPrice, favoritesOnly, nearMe } = values;
  const { clearFilters, updateParams } = actions;
  const {
    location,
    status: locationStatus,
    error: locationError,
    requestLocation,
    applyLocation,
  } = useUserLocation();

  const [hoveredFieldId, setHoveredFieldId] = useState<string | null>(null);
  const [showMapMobile, setShowMapMobile] = useState(false);
  const [selectedMapVenue, setSelectedMapVenue] = useState<VenueMapPoint | null>(null);
  const [mapVenueDialogOpen, setMapVenueDialogOpen] = useState(false);
  const favoriteVenueIds = useFavoriteVenueIds();

  useEffect(() => {
    if (nearMe && locationStatus === 'idle') {
      requestLocation();
    }
  }, [nearMe, locationStatus, requestLocation]);

  useEffect(() => {
    if (locationStatus === 'error' && nearMe) {
      toast.error(locationError ?? 'Không thể lấy vị trí của bạn');
      updateParams({ near: null, page: null });
    }
  }, [locationError, locationStatus, nearMe, updateParams]);

  const fieldsQuery = useQuery({
    queryKey: [
      'courts',
      'page',
      {
        search,
        sportId,
        venueId,
        minPrice,
        maxPrice,
        mode: nearMe ? 'near' : 'paged',
        page: nearMe ? 1 : page,
      },
    ],
    queryFn: () =>
      getCourtsPage(
        {
          search: search || undefined,
          sportId: sportId || undefined,
          venueId: venueId || undefined,
          minPrice: minPrice || undefined,
          maxPrice: maxPrice || undefined,
        },
        nearMe ? NEAR_ME_FETCH_LIMIT : PAGE_SIZE,
        nearMe ? 1 : page,
      ),
    enabled: !nearMe || locationStatus === 'success',
  });

  const fields = useMemo(
    () =>
      (fieldsQuery.data?.data ?? []).filter(
        (court): court is ICourtWithSport => court.sport != null,
      ),
    [fieldsQuery.data?.data],
  );

  const filteredFields = useMemo(() => {
    if (!favoritesOnly) return fields;
    return fields.filter((court) => favoriteVenueIds.includes(court.venueId));
  }, [fields, favoritesOnly, favoriteVenueIds]);

  const sortedFields = useMemo(() => {
    if (!nearMe || !location) return filteredFields;
    return sortCourtsByDistance(filteredFields, location);
  }, [filteredFields, location, nearMe]);

  const displayedFields = useMemo(() => {
    if (!nearMe) return sortedFields;
    const start = (page - 1) * PAGE_SIZE;
    return sortedFields.slice(start, start + PAGE_SIZE);
  }, [nearMe, page, sortedFields]);

  const distanceByCourtId = useMemo(() => {
    if (!nearMe || !location) return new Map<string, string>();
    return new Map<string, string>(
      sortedFields
        .map((court) => {
          const distanceKm = getCourtDistanceKm(court, location);
          return distanceKm == null ? null : ([court.id, formatDistanceKm(distanceKm)] as const);
        })
        .filter(
          (entry: readonly [string, string] | null): entry is readonly [string, string] =>
            entry != null,
        ),
    );
  }, [location, nearMe, sortedFields]);

  const total = nearMe ? sortedFields.length : (fieldsQuery.data?.total ?? 0);
  const hasNext = nearMe ? page * PAGE_SIZE < sortedFields.length : page * PAGE_SIZE < total;
  const isLocating = nearMe && locationStatus === 'locating';
  const userMapLocation = location
    ? ([location.latitude, location.longitude] as [number, number])
    : null;

  const handleNearMeToggle = () => {
    if (nearMe) {
      updateParams({ near: null, page: null });
      return;
    }
    updateParams({ near: '1', page: null });
    requestLocation();
  };

  const handleUserLocationChange = (coords: [number, number]) => {
    applyLocation({ latitude: coords[0], longitude: coords[1] });
    if (!nearMe) {
      updateParams({ near: '1', page: null });
    }
  };

  const isLoadingList = isLocating || fieldsQuery.isLoading;

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-col lg:flex-row">
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
          total={total}
          locating={isLocating}
          onNearMeToggle={handleNearMeToggle}
        />

        <div className="flex-1 overflow-y-auto bg-muted/20 px-3 py-4 sm:px-4">
          {isLoadingList ? (
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

          {!isLoadingList && !fieldsQuery.isError && displayedFields.length === 0 ? (
            <div className="flex min-h-64 items-center justify-center">
              <EmptyState
                title={favoritesOnly ? 'Chưa có sân yêu thích' : 'Không tìm thấy sân'}
                description={
                  favoritesOnly
                    ? 'Nhấn biểu tượng trái tim trên sân bạn thích để lưu lại.'
                    : nearMe
                      ? 'Không có sân nào gần vị trí hiện tại. Thử tắt "Gần tôi" hoặc đổi bộ lọc.'
                      : 'Thử đổi từ khóa hoặc bộ lọc khác.'
                }
                actionLabel={hasActiveFilters ? 'Xóa bộ lọc' : undefined}
                onAction={hasActiveFilters ? clearFilters : undefined}
              />
            </div>
          ) : null}

          {displayedFields.length > 0 ? (
            <div className="space-y-4">
              {displayedFields.map((court) => (
                <FieldCard
                  key={court.id}
                  field={court}
                  isSelected={hoveredFieldId === court.id}
                  onHover={setHoveredFieldId}
                  distanceLabel={distanceByCourtId.get(court.id)}
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

      <div
        className={cn(
          'relative min-h-0 flex-1 bg-muted/40',
          showMapMobile ? 'flex' : 'hidden lg:flex',
        )}
      >
        <MapView
          fields={nearMe ? sortedFields : filteredFields}
          selectedFieldId={hoveredFieldId}
          favoriteVenueIds={favoriteVenueIds}
          userLocation={userMapLocation}
          onUserLocationChange={handleUserLocationChange}
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
};
