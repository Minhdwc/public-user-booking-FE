import { unwrapList } from '@/lib/api/response';
import type { CreateBookingPayload, IBooking } from '@/lib/api/types';
import { bookingService } from '@/lib/service';

export async function listMyBookings(): Promise<IBooking[]> {
  return unwrapList(await bookingService.getBookings({ limit: 100 }));
}

export async function getBookingById(id: string): Promise<IBooking> {
  return bookingService.getBooking(id);
}

export async function createBooking(
  payload: CreateBookingPayload | Partial<IBooking>,
): Promise<IBooking> {
  return bookingService.createBooking({
    fieldId: payload.fieldId!,
    timeslotId: payload.timeslotId!,
    date: payload.date!,
  });
}

export async function cancelBooking(id: string): Promise<IBooking> {
  return bookingService.cancelBooking(id);
}
