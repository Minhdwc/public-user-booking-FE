'use client';

import { useQuery } from '@tanstack/react-query';

import { unwrapList } from '@/lib/api/response';
import { ListParams } from '@/lib/api/types';
import { amenityService } from '@/lib/service';

export const amenityKeys = {
  all: ['amenities'] as const,
  lists: () => [...amenityKeys.all, 'list'] as const,
  list: (params: ListParams = {}) => [...amenityKeys.lists(), params] as const,
  byVenue: (venueId: string) => [...amenityKeys.all, 'venue', venueId] as const,
  details: () => [...amenityKeys.all, 'detail'] as const,
  detail: (id: string) => [...amenityKeys.details(), id] as const,
};

export const useAmenities = (params?: ListParams) =>
  useQuery({
    queryKey: amenityKeys.list(params ?? {}),
    queryFn: async () => unwrapList(await amenityService.getAmenities({ limit: 100, ...params })),
  });

export const useAmenitiesByVenue = (venueId: string) =>
  useQuery({
    queryKey: amenityKeys.byVenue(venueId),
    queryFn: () => amenityService.getAmenitiesByVenue(venueId),
    enabled: Boolean(venueId),
  });
