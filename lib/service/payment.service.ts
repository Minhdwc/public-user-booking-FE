import apiClient from '@/lib/api/client';
import { PaginatedResult } from '@/lib/api/response';
import { CreatePaymentPayload, IPayment, ListParams } from '@/lib/api/types';

export const paymentService = {
  getPayments: (params?: ListParams) =>
    apiClient.get('/payments', { params }) as Promise<PaginatedResult<IPayment> | IPayment[]>,

  getPayment: (id: string) => apiClient.get(`/payments/${id}`) as Promise<IPayment>,

  createPayment: (body: CreatePaymentPayload) =>
    apiClient.post('/payments', body) as Promise<IPayment>,

  getOrCreatePendingPayment: (bookingId: string) =>
    apiClient.post(`/payments/pending-for-booking/${bookingId}`) as Promise<IPayment>,

  createVnpayUrl: (paymentId: string) =>
    apiClient.post(`/payments/${paymentId}/vnpay-url`) as Promise<{ paymentUrl: string }>,
};
