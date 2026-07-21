import apiClient from '@/lib/api/client';
import { PaginatedResult } from '@/lib/api/response';
import {
  CreateUserPaymentMethodPayload,
  IUserPaymentMethod,
  ListParams,
  UpdateUserPaymentMethodPayload,
} from '@/lib/api/types';

export const userPaymentMethodService = {
  getMethods: (params?: ListParams) =>
    apiClient.get('/user-payment-methods', { params }) as Promise<
      PaginatedResult<IUserPaymentMethod> | IUserPaymentMethod[]
    >,

  createMethod: (body: CreateUserPaymentMethodPayload) =>
    apiClient.post('/user-payment-methods', body) as Promise<IUserPaymentMethod>,

  updateMethod: (id: string, body: UpdateUserPaymentMethodPayload) =>
    apiClient.patch(`/user-payment-methods/${id}`, body) as Promise<IUserPaymentMethod>,

  deleteMethod: (id: string) =>
    apiClient.delete(`/user-payment-methods/${id}`) as Promise<IUserPaymentMethod>,
};
