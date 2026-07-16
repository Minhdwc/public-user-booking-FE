import { CreatePaymentPayload, IPayment } from '@/lib/api/types';
import { paymentService } from '@/lib/service';

export type { IPayment as Payment, CreatePaymentPayload };

export async function createPayment(body: CreatePaymentPayload): Promise<IPayment> {
  return paymentService.createPayment(body);
}

export async function createVnpayUrl(paymentId: string): Promise<{ paymentUrl: string }> {
  return paymentService.createVnpayUrl(paymentId);
}
