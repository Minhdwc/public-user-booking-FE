'use client';

import { useQuery } from '@tanstack/react-query';

import { unwrapList } from '@/lib/api/response';
import { CourtListParams } from '@/lib/api/types';
import { courtService } from '@/lib/service';

export const courtKeys = {
  all: ['courts'] as const,
  lists: () => [...courtKeys.all, 'list'] as const,
  list: (params: CourtListParams = {}) => [...courtKeys.lists(), params] as const,
  details: () => [...courtKeys.all, 'detail'] as const,
  detail: (id: string) => [...courtKeys.details(), id] as const,
  availability: (id: string, date: string) =>
    [...courtKeys.detail(id), 'availability', date] as const,
};

export const useCourts = (params?: CourtListParams) =>
  useQuery({
    queryKey: courtKeys.list(params ?? {}),
    queryFn: async () => unwrapList(await courtService.getCourts(params, 100, 1)),
  });

export const useCourt = (id: string) =>
  useQuery({
    queryKey: courtKeys.detail(id),
    queryFn: () => courtService.getCourt(id),
    enabled: Boolean(id),
  });

export const useCourtAvailability = (courtId: string, date: string) =>
  useQuery({
    queryKey: courtKeys.availability(courtId, date),
    queryFn: () => courtService.getAvailability(courtId, date),
    enabled: Boolean(courtId && date),
  });
