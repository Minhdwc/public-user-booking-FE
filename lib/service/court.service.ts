import apiClient from '@/lib/api/client';
import { PaginatedResult } from '@/lib/api/response';
import { CourtListParams, ICourt, ICourtAvailability } from '@/lib/api/types';

export const courtService = {
  getCourts: (params?: CourtListParams, limit: number = 10, page: number = 1) =>
    apiClient.get('/courts', { params: { ...params, limit, page } }) as Promise<
      PaginatedResult<ICourt> | ICourt[]
    >,

  getCourt: (id: string) => apiClient.get(`/courts/${id}`) as Promise<ICourt>,

  getAvailability: (id: string, date: string) =>
    apiClient.get(`/courts/${id}/availability`, {
      params: { date },
    }) as Promise<ICourtAvailability>,
};
