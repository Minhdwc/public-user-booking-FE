import apiClient from '@/lib/api/client';
import { PaginatedResult } from '@/lib/api/response';
import { CreateBookingPayload, IBooking, ListParams } from '@/lib/api/types';

export const bookingService = {
  getBookings: (params?: ListParams) =>
    apiClient.get('/bookings', { params }) as Promise<PaginatedResult<IBooking> | IBooking[]>,

  getBooking: (id: string) => apiClient.get(`/bookings/${id}`) as Promise<IBooking>,

  createBooking: (body: CreateBookingPayload) =>
    apiClient.post('/bookings', body) as Promise<IBooking>,

  updateBookingStatus: (id: string, status: 'confirmed' | 'completed' | 'cancelled') =>
    apiClient.patch(`/bookings/${id}`, { status }) as Promise<IBooking>,

  cancelBooking: (id: string) => bookingService.updateBookingStatus(id, 'cancelled'),
};
