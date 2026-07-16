import apiClient from '@/lib/api/client';
import { PaginatedResult } from '@/lib/api/response';
import { IVenue, VenueListParams } from '@/lib/api/types';

export const venueService = {
  getVenues: (params?: VenueListParams) =>
    apiClient.get('/venues', { params }) as Promise<PaginatedResult<IVenue> | IVenue[]>,

  getVenue: (id: string) => apiClient.get(`/venues/${id}`) as Promise<IVenue>,
};
