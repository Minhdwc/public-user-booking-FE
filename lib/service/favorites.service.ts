import apiClient from '@/lib/api/client';

export type FavoritesSummary = {
  venueIds: string[];
};

export type ToggleFavoriteResponse = FavoritesSummary & {
  isFavorite: boolean;
};

export const favoritesService = {
  getSummary: () => apiClient.get('/favorites') as Promise<FavoritesSummary>,

  toggleVenue: (venueId: string) =>
    apiClient.post(`/favorites/venues/${venueId}/toggle`) as Promise<ToggleFavoriteResponse>,
};
