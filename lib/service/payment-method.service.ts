import apiClient from '@/lib/api/client';
import { PaginatedResult } from '@/lib/api/response';
import { IPaymentMethod, ListParams } from '@/lib/api/types';

export const paymentMethodService = {
  getPaymentMethods: (params?: ListParams) =>
    apiClient.get('/payment-methods', {
      params,
    }) as Promise<PaginatedResult<IPaymentMethod> | IPaymentMethod[]>,

  getPaymentMethod: (id: string) =>
    apiClient.get(`/payment-methods/${id}`) as Promise<IPaymentMethod>,
};
