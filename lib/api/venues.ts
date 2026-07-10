import apiClient from './client';
import type { GetVenuesParams, VenueWithFields } from './types';

export async function getVenues(params: GetVenuesParams = {}): Promise<VenueWithFields[]> {
  const { search, page = 1, limit = 10 } = params;
  return apiClient.get('/venues', {
    params: {
      search: search || undefined,
      page,
      limit,
    },
  });
}

export async function getVenueById(id: string): Promise<VenueWithFields> {
  return apiClient.get(`/venues/${id}`);
}
