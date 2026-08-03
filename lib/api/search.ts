import { unwrapList, unwrapPage } from '@/lib/api/response';
import { searchService } from '@/lib/service/search.service';
import type { GetVenuesParams, VenueWithFields } from '@/lib/api/types';

export async function searchVenuesList(params: GetVenuesParams = {}): Promise<VenueWithFields[]> {
  const payload = await searchService.searchVenues({
    q: params.search,
    page: params.page ?? 1,
    limit: params.limit ?? 10,
  });

  return unwrapList(payload);
}

export async function searchVenuesPage(params: GetVenuesParams = {}) {
  const payload = await searchService.searchVenues({
    q: params.search,
    page: params.page ?? 1,
    limit: params.limit ?? 10,
  });

  return unwrapPage(payload);
}

export async function getPopularSearches(limit = 8) {
  return searchService.getPopular(limit);
}

export async function getSearchSuggestions(q = '', limit = 8) {
  return searchService.getSuggestions(q, limit);
}

export async function getRecentlyViewedVenues(): Promise<VenueWithFields[]> {
  const payload = await searchService.getRecentlyViewed();
  return payload ?? [];
}
