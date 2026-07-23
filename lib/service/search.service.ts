import apiClient from '@/lib/api/client';
import { PaginatedResult } from '@/lib/api/response';
import { IVenue, ListParams } from '@/lib/api/types';

export type SearchSuggestion = {
  type: 'popular' | 'venue';
  label: string;
  count?: number;
  venueId?: string;
  location?: string;
};

export type PopularSearchItem = {
  query: string;
  count: number;
};

export const searchService = {
  searchVenues: (params?: ListParams & { q?: string }) =>
    apiClient.get('/search/venues', { params }) as Promise<PaginatedResult<IVenue> | IVenue[]>,

  getPopular: (limit = 8) =>
    apiClient.get('/search/popular', { params: { limit } }) as Promise<PopularSearchItem[]>,

  getSuggestions: (q = '', limit = 8) =>
    apiClient.get('/search/suggestions', { params: { q, limit } }) as Promise<SearchSuggestion[]>,

  getRecentlyViewed: () => apiClient.get('/search/recently-viewed') as Promise<IVenue[]>,
};
