import apiClient from '@/lib/api/client';

export type FavoritesSummary = {
  fieldIds: string[];
  venueIds: string[];
};

export type ToggleFavoriteResponse = FavoritesSummary & {
  isFavorite: boolean;
};

export const favoritesService = {
  getSummary: () => apiClient.get('/favorites') as Promise<FavoritesSummary>,

  toggleField: (fieldId: string) =>
    apiClient.post(`/favorites/fields/${fieldId}/toggle`) as Promise<ToggleFavoriteResponse>,

  toggleVenue: (venueId: string) =>
    apiClient.post(`/favorites/venues/${venueId}/toggle`) as Promise<ToggleFavoriteResponse>,
};
