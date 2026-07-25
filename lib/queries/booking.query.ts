'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { unwrapList } from '@/lib/api/response';
import { CreateBookingPayload } from '@/lib/api/types';
import { bookingService } from '@/lib/service';
import { courtKeys } from '@/lib/queries/court.query';

export const bookingKeys = {
  all: ['bookings'] as const,
  lists: () => [...bookingKeys.all, 'list'] as const,
  list: (params: { page?: string; limit?: string } = {}) => [...bookingKeys.lists(), params] as const,
  mine: () => [...bookingKeys.all, 'mine'] as const,
  details: () => [...bookingKeys.all, 'detail'] as const,
  detail: (id: string) => [...bookingKeys.details(), id] as const,
};

export const useMyBookings = (params?: { page?: string; limit?: string }) =>
  useQuery({
    queryKey: bookingKeys.mine(),
    queryFn: async () => unwrapList(await bookingService.getBookings({ limit: 100, ...params })),
  });

export const useBooking = (id: string) =>
  useQuery({
    queryKey: bookingKeys.detail(id),
    queryFn: () => bookingService.getBooking(id),
    enabled: Boolean(id),
  });

export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateBookingPayload) => bookingService.createBooking(body),
    onSuccess: (booking) => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      for (const item of booking.items ?? []) {
        queryClient.invalidateQueries({
          queryKey: courtKeys.detail(item.courtId),
        });
      }
    },
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bookingService.cancelBooking(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.all });
    },
  });
};
