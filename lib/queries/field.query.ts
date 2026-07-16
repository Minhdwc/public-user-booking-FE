'use client';

import { useQuery } from '@tanstack/react-query';

import { mapField } from '@/lib/api/mappers';
import { unwrapList } from '@/lib/api/response';
import { FieldListParams } from '@/lib/api/types';
import { fieldService } from '@/lib/service';

export const fieldKeys = {
  all: ['fields'] as const,
  lists: () => [...fieldKeys.all, 'list'] as const,
  list: (params: FieldListParams = {}) => [...fieldKeys.lists(), params] as const,
  details: () => [...fieldKeys.all, 'detail'] as const,
  detail: (id: string) => [...fieldKeys.details(), id] as const,
  availability: (id: string, date: string) =>
    [...fieldKeys.detail(id), 'availability', date] as const,
};

export const useFields = (params?: FieldListParams) =>
  useQuery({
    queryKey: fieldKeys.list(params ?? {}),
    queryFn: async () => {
      const payload = await fieldService.getFields({ limit: 100, ...params });
      return unwrapList(payload).map(mapField);
    },
  });

export const useField = (id: string) =>
  useQuery({
    queryKey: fieldKeys.detail(id),
    queryFn: async () => mapField(await fieldService.getField(id)),
    enabled: Boolean(id),
  });

export const useFieldAvailability = (fieldId: string, date: string) =>
  useQuery({
    queryKey: fieldKeys.availability(fieldId, date),
    queryFn: () => fieldService.getAvailability(fieldId, date),
    enabled: Boolean(fieldId && date),
  });
