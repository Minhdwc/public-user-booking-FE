'use client';

import { useQuery } from '@tanstack/react-query';

import { unwrapList } from '@/lib/api/response';
import { ListParams } from '@/lib/api/types';
import { paymentMethodService } from '@/lib/service';

export const paymentMethodKeys = {
  all: ['payment-methods'] as const,
  lists: () => [...paymentMethodKeys.all, 'list'] as const,
  list: (params: ListParams = {}) => [...paymentMethodKeys.lists(), params] as const,
  details: () => [...paymentMethodKeys.all, 'detail'] as const,
  detail: (id: string) => [...paymentMethodKeys.details(), id] as const,
};

export const usePaymentMethods = (params?: ListParams) =>
  useQuery({
    queryKey: paymentMethodKeys.list(params ?? {}),
    queryFn: async () => {
      const items = unwrapList(
        await paymentMethodService.getPaymentMethods({ limit: 100, ...params }),
      );
      return items.filter((item) => item.isActive);
    },
  });

export const usePaymentMethod = (id: string) =>
  useQuery({
    queryKey: paymentMethodKeys.detail(id),
    queryFn: () => paymentMethodService.getPaymentMethod(id),
    enabled: Boolean(id),
  });
