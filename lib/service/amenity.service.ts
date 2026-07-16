import apiClient from '@/lib/api/client';
import { PaginatedResult } from '@/lib/api/response';
import { IAmenity, ListParams } from '@/lib/api/types';

export const amenityService = {
  getAmenities: (params?: ListParams) =>
    apiClient.get('/amenities', { params }) as Promise<PaginatedResult<IAmenity> | IAmenity[]>,

  getAmenitiesByVenue: (venueId: string) =>
    apiClient.get(`/amenities/venue/${venueId}`) as Promise<IAmenity[]>,

  getAmenity: (id: string) => apiClient.get(`/amenities/${id}`) as Promise<IAmenity>,
};
