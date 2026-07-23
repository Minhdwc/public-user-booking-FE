'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  favoritesService,
  type FavoritesSummary,
  type ToggleFavoriteResponse,
} from '@/lib/service/favorites.service';
import { useAuthStore } from '@/lib/stores/auth-store';

export const favoriteKeys = {
  all: ['favorites'] as const,
  summary: () => [...favoriteKeys.all, 'summary'] as const,
};

const emptySummary: FavoritesSummary = { fieldIds: [], venueIds: [] };

export function useFavoritesSummary() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  return useQuery({
    queryKey: favoriteKeys.summary(),
    queryFn: () => favoritesService.getSummary(),
    enabled: isHydrated && isAuthenticated,
    staleTime: 60_000,
  });
}

export function useToggleFieldFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fieldId: string) => favoritesService.toggleField(fieldId),
    onSuccess: (data: ToggleFavoriteResponse) => {
      queryClient.setQueryData(favoriteKeys.summary(), {
        fieldIds: data.fieldIds,
        venueIds: data.venueIds,
      });
    },
  });
}

export function useToggleVenueFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (venueId: string) => favoritesService.toggleVenue(venueId),
    onSuccess: (data: ToggleFavoriteResponse) => {
      queryClient.setQueryData(favoriteKeys.summary(), {
        fieldIds: data.fieldIds,
        venueIds: data.venueIds,
      });
    },
  });
}

export function useFavoriteFieldIds() {
  const { data } = useFavoritesSummary();
  return data?.fieldIds ?? emptySummary.fieldIds;
}

export function useFavoriteVenueIds() {
  const { data } = useFavoritesSummary();
  return data?.venueIds ?? emptySummary.venueIds;
}

export function useIsFieldFavorite(fieldId: string) {
  const fieldIds = useFavoriteFieldIds();
  return fieldIds.includes(fieldId);
}

export function useIsVenueFavorite(venueId: string) {
  const venueIds = useFavoriteVenueIds();
  return venueIds.includes(venueId);
}
