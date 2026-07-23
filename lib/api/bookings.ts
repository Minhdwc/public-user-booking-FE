import { unwrapList } from '@/lib/api/response';
import type { CreateBookingPayload, IBooking } from '@/lib/api/types';
import { bookingService } from '@/lib/service';

export async function listMyBookings(): Promise<IBooking[]> {
  return unwrapList(await bookingService.getBookings({ limit: 100 }));
}

export async function getBookingById(id: string): Promise<IBooking> {
  return bookingService.getBooking(id);
}

export async function createBooking(payload: CreateBookingPayload): Promise<IBooking> {
  return bookingService.createBooking(payload);
}

export async function cancelBooking(id: string): Promise<IBooking> {
  return bookingService.cancelBooking(id);
}
