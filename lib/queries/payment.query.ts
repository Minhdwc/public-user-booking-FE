'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { unwrapList } from '@/lib/api/response';
import { CreatePaymentPayload, ListParams } from '@/lib/api/types';
import { paymentService } from '@/lib/service';

export const paymentKeys = {
  all: ['payments'] as const,
  lists: () => [...paymentKeys.all, 'list'] as const,
  list: (params: ListParams = {}) => [...paymentKeys.lists(), params] as const,
  details: () => [...paymentKeys.all, 'detail'] as const,
  detail: (id: string) => [...paymentKeys.details(), id] as const,
};

export const usePayments = (params?: ListParams) =>
  useQuery({
    queryKey: paymentKeys.list(params ?? {}),
    queryFn: async () => unwrapList(await paymentService.getPayments({ limit: 100, ...params })),
  });

export const usePayment = (id: string) =>
  useQuery({
    queryKey: paymentKeys.detail(id),
    queryFn: () => paymentService.getPayment(id),
    enabled: Boolean(id),
  });

export const useCreatePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreatePaymentPayload) => paymentService.createPayment(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
    },
  });
};

export const useCreateVnpayUrl = () =>
  useMutation({
    mutationFn: (paymentId: string) => paymentService.createVnpayUrl(paymentId),
  });
