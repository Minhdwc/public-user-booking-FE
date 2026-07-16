import apiClient from '@/lib/api/client';
import { PaginatedResult } from '@/lib/api/response';
import { ISport, ListParams } from '@/lib/api/types';

export const sportService = {
  getSports: (params?: ListParams) =>
    apiClient.get('/sports', { params }) as Promise<PaginatedResult<ISport> | ISport[]>,

  getSport: (id: string) => apiClient.get(`/sports/${id}`) as Promise<ISport>,
};
