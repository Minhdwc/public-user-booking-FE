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

const emptySummary: FavoritesSummary = { venueIds: [] };

export function useFavoritesSummary() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isSessionReady = useAuthStore((state) => state.isSessionReady);

  return useQuery({
    queryKey: favoriteKeys.summary(),
    queryFn: () => favoritesService.getSummary(),
    enabled: isSessionReady && isAuthenticated,
    staleTime: 60_000,
  });
}

export function useToggleVenueFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (venueId: string) => favoritesService.toggleVenue(venueId),
    onSuccess: (data: ToggleFavoriteResponse) => {
      queryClient.setQueryData(favoriteKeys.summary(), {
        venueIds: data.venueIds,
      });
    },
  });
}

export function useFavoriteVenueIds() {
  const { data } = useFavoritesSummary();
  return data?.venueIds ?? emptySummary.venueIds;
}

export function useIsVenueFavorite(venueId: string) {
  const venueIds = useFavoriteVenueIds();
  return venueIds.includes(venueId);
}
