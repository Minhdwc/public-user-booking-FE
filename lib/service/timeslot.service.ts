import apiClient from '@/lib/api/client';
import { PaginatedResult } from '@/lib/api/response';
import { ITimeslot, ListParams } from '@/lib/api/types';

export const timeslotService = {
  getTimeslots: (params?: ListParams) =>
    apiClient.get('/timeslots', {
      params,
    }) as Promise<PaginatedResult<ITimeslot> | ITimeslot[]>,

  getTimeslot: (id: string) => apiClient.get(`/timeslots/${id}`) as Promise<ITimeslot>,
};
