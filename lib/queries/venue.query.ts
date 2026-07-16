'use client';

import { useQuery } from '@tanstack/react-query';

import { mapVenue } from '@/lib/api/mappers';
import { unwrapList, unwrapPage } from '@/lib/api/response';
import { VenueListParams } from '@/lib/api/types';
import { venueService } from '@/lib/service';

export const venueKeys = {
  all: ['venues'] as const,
  lists: () => [...venueKeys.all, 'list'] as const,
  list: (params: VenueListParams = {}) => [...venueKeys.lists(), params] as const,
  details: () => [...venueKeys.all, 'detail'] as const,
  detail: (id: string) => [...venueKeys.details(), id] as const,
};

export const useVenues = (params?: VenueListParams) =>
  useQuery({
    queryKey: venueKeys.list(params ?? {}),
    queryFn: async () => {
      const payload = await venueService.getVenues({ limit: 12, ...params });
      return unwrapList(payload).map(mapVenue);
    },
  });

export const useVenuesPage = (params?: VenueListParams) =>
  useQuery({
    queryKey: [...venueKeys.list(params ?? {}), 'page'] as const,
    queryFn: async () => {
      const page = unwrapPage(await venueService.getVenues({ limit: 12, ...params }));
      return { ...page, data: page.data.map(mapVenue) };
    },
  });

export const useVenue = (id: string) =>
  useQuery({
    queryKey: venueKeys.detail(id),
    queryFn: async () => mapVenue(await venueService.getVenue(id)),
    enabled: Boolean(id),
  });
