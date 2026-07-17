'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { ErrorState } from '@/components/common/ErrorState';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cancelBooking, listMyBookings } from '@/lib/api/bookings';
import { createVnpayUrl, getOrCreatePendingPayment } from '@/lib/api/payments';
import { ApiError } from '@/lib/api/errors';
import { useCountdown } from '@/lib/hooks/useCountdown';
import { IBookingWithRelations } from '@/lib/types';
import { cn } from '@/lib/utils';

function formatSlotTime(value: string) {
  const match = value.match(/T(\d{2}:\d{2})/);
  if (match) return match[1];
  if (/^\d{2}:\d{2}/.test(value)) return value.slice(0, 5);
  return value;
}

function formatBookingDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('vi-VN');
}

function statusLabel(status: string) {
  switch (status) {
    case 'pending':
      return 'Đang giữ chỗ';
    case 'confirmed':
      return 'Đã xác nhận';
    case 'cancelled':
      return 'Đã hủy';
    case 'completed':
      return 'Hoàn thành';
    default:
      return status;
  }
}

function statusClass(status: string) {
  switch (status) {
    case 'pending':
      return 'bg-amber-100 text-amber-900';
    case 'confirmed':
      return 'bg-emerald-100 text-emerald-900';
    case 'cancelled':
      return 'bg-slate-100 text-slate-700';
    case 'completed':
      return 'bg-blue-100 text-blue-900';
    default:
      return 'bg-muted text-muted-foreground';
  }
}

function canCancel(booking: IBookingWithRelations) {
  return booking.status === 'pending' || booking.status === 'confirmed';
}

function isHoldActive(booking: IBookingWithRelations) {
  if (booking.status !== 'pending' || !booking.expiresAt) return false;
  return new Date(booking.expiresAt).getTime() > Date.now();
}

function PendingBookingActions({
  booking,
  onCancel,
  cancelPending,
}: {
  booking: IBookingWithRelations;
  onCancel: () => void;
  cancelPending: boolean;
}) {
  const { formatted, isExpired } = useCountdown(booking.expiresAt);
  const didRefetch = useRef(false);
  const queryClient = useQueryClient();
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!isExpired || didRefetch.current) return;
    didRefetch.current = true;
    void queryClient.invalidateQueries({ queryKey: ['bookings'] });
  }, [isExpired, queryClient]);

  const continuePay = async () => {
    setPaying(true);
    try {
      const payment = await getOrCreatePendingPayment(booking.id);
      const { paymentUrl } = await createVnpayUrl(payment.id);
      toast.message('Đang chuyển đến VNPay...');
      window.location.href = paymentUrl;
    } catch (error) {
      setPaying(false);
      const message = error instanceof ApiError ? error.message : 'Không thể tiếp tục thanh toán';
      toast.error(message);
    }
  };

  return (
    <div className="flex flex-col gap-2 sm:items-end">
      {!isExpired ? (
        <p className="text-sm font-medium text-amber-800">Còn {formatted} để thanh toán</p>
      ) : (
        <p className="text-sm text-muted-foreground">Đang đồng bộ trạng thái hết hạn...</p>
      )}
      <div className="flex gap-2">
        <Button asChild variant="outline">
          <Link href={`/fields/${booking.fieldId}`}>Xem sân</Link>
        </Button>
        {!isExpired ? (
          <Button disabled={paying} onClick={() => void continuePay()}>
            {paying ? 'Đang chuyển...' : 'Tiếp tục thanh toán'}
          </Button>
        ) : null}
        {canCancel(booking) ? (
          <Button variant="destructive" disabled={cancelPending} onClick={onCancel}>
            Hủy lịch
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export function BookingsPageContent() {
  const queryClient = useQueryClient();

  const bookingsQuery = useQuery({
    queryKey: ['bookings', 'mine'],
    queryFn: listMyBookings,
    refetchInterval: 20_000,
  });

  const cancelMutation = useMutation({
    mutationFn: cancelBooking,
    onSuccess: async () => {
      toast.success('Đã hủy đặt sân');
      await queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
    onError: (error) => {
      const message = error instanceof ApiError ? error.message : 'Không thể hủy đặt sân';
      toast.error(message);
    },
  });

  if (bookingsQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (bookingsQuery.isError) {
    return (
      <ErrorState
        title="Không tải được lịch đặt sân"
        message={
          bookingsQuery.error instanceof Error ? bookingsQuery.error.message : 'Vui lòng thử lại'
        }
        onRetry={() => bookingsQuery.refetch()}
      />
    );
  }

  const bookings = bookingsQuery.data ?? [];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Lịch đặt sân của tôi</h1>
        <p className="text-muted-foreground">
          Theo dõi giữ chỗ, thanh toán và hủy các lịch đặt sân của bạn
        </p>
      </div>

      {bookings.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Chưa có lịch đặt</CardTitle>
            <CardDescription>Hãy tìm sân và đặt khung giờ phù hợp</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/venues">Tìm sân ngay</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{booking.field?.name ?? 'Sân'}</CardTitle>
                  <CardDescription>
                    {[booking.field?.venue?.name, booking.field?.sport?.name]
                      .filter(Boolean)
                      .join(' · ') || '—'}
                  </CardDescription>
                </div>
                <span
                  className={cn(
                    'rounded-full px-2.5 py-1 text-xs font-medium',
                    statusClass(booking.status),
                  )}
                >
                  {statusLabel(booking.status)}
                </span>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1 text-sm">
                  <p>
                    Ngày: <span className="font-medium">{formatBookingDate(booking.date)}</span>
                  </p>
                  <p>
                    Giờ:{' '}
                    <span className="font-medium">
                      {booking.timeslot
                        ? `${formatSlotTime(booking.timeslot.startTime)}–${formatSlotTime(booking.timeslot.endTime)}`
                        : '—'}
                    </span>
                  </p>
                  <p>
                    Giá:{' '}
                    <span className="font-medium">
                      {(booking.amount ?? booking.field?.price ?? 0).toLocaleString('vi-VN')} đ
                    </span>
                  </p>
                </div>

                {isHoldActive(booking) ||
                (booking.status === 'pending' && booking.expiresAt) ? (
                  <PendingBookingActions
                    booking={booking}
                    cancelPending={cancelMutation.isPending}
                    onCancel={() => cancelMutation.mutate(booking.id)}
                  />
                ) : (
                  <div className="flex gap-2">
                    <Button asChild variant="outline">
                      <Link href={`/fields/${booking.fieldId}`}>Xem sân</Link>
                    </Button>
                    {canCancel(booking) ? (
                      <Button
                        variant="destructive"
                        disabled={cancelMutation.isPending}
                        onClick={() => cancelMutation.mutate(booking.id)}
                      >
                        Hủy lịch
                      </Button>
                    ) : null}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
