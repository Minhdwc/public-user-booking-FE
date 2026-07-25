'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { ErrorState } from '@/components/common/ErrorState';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cancelBooking, listMyBookings } from '@/lib/api/bookings';
import { createVnpayUrl, getOrCreatePendingPayment, payWithSavedMethod } from '@/lib/api/payments';
import { ApiError } from '@/lib/api/errors';
import { unwrapList } from '@/lib/api/response';
import { IBooking, IUserPaymentMethod } from '@/lib/api/types';
import { useCountdown } from '@/lib/hooks/useCountdown';
import { userPaymentMethodService } from '@/lib/service';
import { cn } from '@/lib/utils';

const filterBookingsByTab = (bookings: IBooking[], tab: 'upcoming' | 'past' | 'cancelled') => {
  switch (tab) {
    case 'upcoming':
      return bookings.filter((booking) =>
        ['waiting_payment', 'confirmed'].includes(booking.status),
      );
    case 'past':
      return bookings.filter((booking) => booking.status === 'completed');
    case 'cancelled':
      return bookings.filter((booking) => ['cancelled', 'expired'].includes(booking.status));
    default:
      return bookings;
  }
};

const formatSlotTime = (value: string) => {
  const match = value.match(/T(\d{2}:\d{2})/);
  if (match) return match[1];
  if (/^\d{2}:\d{2}/.test(value)) return value.slice(0, 5);
  return value;
};

const formatBookingDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('vi-VN');
};

const statusLabel = (status: string) => {
  switch (status) {
    case 'waiting_payment':
      return 'Đang giữ chỗ';
    case 'confirmed':
      return 'Đã xác nhận';
    case 'cancelled':
      return 'Đã hủy';
    case 'completed':
      return 'Hoàn thành';
    case 'expired':
      return 'Hết hạn';
    default:
      return status;
  }
};

const statusClass = (status: string) => {
  switch (status) {
    case 'waiting_payment':
      return 'status-pending';
    case 'confirmed':
      return 'status-confirmed';
    case 'cancelled':
      return 'status-cancelled';
    case 'completed':
      return 'status-completed';
    case 'expired':
      return 'status-cancelled';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

const canCancel = (booking: IBooking) => {
  return booking.status === 'waiting_payment' || booking.status === 'confirmed';
};

const isHoldActive = (booking: IBooking) => {
  if (booking.status !== 'waiting_payment' || !booking.expiresAt) return false;
  return new Date(booking.expiresAt).getTime() > Date.now();
};

const getPrimaryItem = (booking: IBooking) => {
  return booking.items?.[0];
};

function PendingBookingActions({
  booking,
  onCancel,
  cancelPending,
}: {
  booking: IBooking;
  onCancel: () => void;
  cancelPending: boolean;
}) {
  const { formatted, isExpired } = useCountdown(booking.expiresAt);
  const didRefetch = useRef(false);
  const queryClient = useQueryClient();
  const [paying, setPaying] = useState(false);
  const [payingMode, setPayingMode] = useState<'saved' | 'vnpay' | null>(null);

  const savedMethodsQuery = useQuery({
    queryKey: ['user-payment-methods'],
    queryFn: async () => unwrapList(await userPaymentMethodService.getMethods({ limit: 50 })),
  });

  const defaultSavedMethod =
    savedMethodsQuery.data?.find((method: IUserPaymentMethod) => method.isDefault) ??
    savedMethodsQuery.data?.[0];

  useEffect(() => {
    if (!isExpired || didRefetch.current) return;
    didRefetch.current = true;
    void queryClient.invalidateQueries({ queryKey: ['bookings'] });
  }, [isExpired, queryClient]);

  const continuePayWithSaved = async () => {
    setPaying(true);
    setPayingMode('saved');
    try {
      const payment = await getOrCreatePendingPayment(booking.id);
      const result = await payWithSavedMethod(payment.id, defaultSavedMethod?.id);
      toast.success('Thanh toán thành công');
      await queryClient.invalidateQueries({ queryKey: ['bookings'] });
      window.location.href = `/booking/success?paymentId=${result.paymentId}`;
    } catch (error) {
      setPaying(false);
      setPayingMode(null);
      const message = error instanceof ApiError ? error.message : 'Không thể thanh toán';
      toast.error(message);
    }
  };

  const continuePayWithVnpay = async () => {
    setPaying(true);
    setPayingMode('vnpay');
    try {
      const payment = await getOrCreatePendingPayment(booking.id);
      const { paymentUrl } = await createVnpayUrl(payment.id);
      toast.message('Đang chuyển đến VNPay...');
      window.location.href = paymentUrl;
    } catch (error) {
      setPaying(false);
      setPayingMode(null);
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
        <Button asChild variant="outline" className="rounded-lg">
          <Link href={`/courts/${getPrimaryItem(booking)?.courtId ?? ''}`}>Xem sân</Link>
        </Button>
        {!isExpired ? (
          <>
            <Button asChild className="rounded-lg">
              <Link href={`/checkout?bookingId=${booking.id}`}>Thanh toán</Link>
            </Button>
            {defaultSavedMethod ? (
              <Button
                className="rounded-lg"
                disabled={paying}
                onClick={() => void continuePayWithSaved()}
              >
                {paying && payingMode === 'saved' ? 'Đang thanh toán...' : 'Thanh toán đã lưu'}
              </Button>
            ) : null}
            <Button
              variant={defaultSavedMethod ? 'outline' : 'default'}
              className="rounded-lg"
              disabled={paying}
              onClick={() => void continuePayWithVnpay()}
            >
              {paying && payingMode === 'vnpay' ? 'Đang chuyển...' : 'Thanh toán VNPay'}
            </Button>
          </>
        ) : null}
        {canCancel(booking) ? (
          <Button
            variant="destructive"
            className="rounded-lg"
            disabled={cancelPending}
            onClick={onCancel}
          >
            Hủy lịch
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export function BookingsPageContent() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');

  const bookingsQuery = useQuery({
    queryKey: ['bookings', 'mine'],
    queryFn: listMyBookings,
    refetchOnWindowFocus: true,
    refetchInterval: (query) => {
      const items = query.state.data ?? [];
      const hasPendingHold = items.some((booking) => isHoldActive(booking));
      return hasPendingHold ? 5_000 : 20_000;
    },
  });

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        void queryClient.invalidateQueries({ queryKey: ['bookings'] });
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [queryClient]);

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

  const bookings = bookingsQuery.data;
  const filteredBookings = useMemo(
    () => filterBookingsByTab(bookings ?? [], activeTab),
    [bookings, activeTab],
  );

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

  const tabItems: { id: 'upcoming' | 'past' | 'cancelled'; label: string }[] = [
    { id: 'upcoming', label: 'Sắp tới' },
    { id: 'past', label: 'Đã chơi' },
    { id: 'cancelled', label: 'Đã hủy' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Quản lý"
        title="Lịch đặt sân của tôi"
        description="Theo dõi giữ chỗ, thanh toán và hủy các lịch đặt sân của bạn."
      />

      <div className="flex flex-wrap gap-2">
        {tabItems.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'outline'}
            size="sm"
            className="rounded-lg"
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {!bookings?.length ? (
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>Chưa có lịch đặt</CardTitle>
            <CardDescription>Hãy tìm sân và đặt khung giờ phù hợp</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="rounded-lg">
              <Link href="/venues">Tìm sân ngay</Link>
            </Button>
          </CardContent>
        </Card>
      ) : filteredBookings.length === 0 ? (
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>Không có lịch trong mục này</CardTitle>
            <CardDescription>Thử chọn tab khác hoặc đặt sân mới.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="rounded-lg">
              <Link href="/courts">Tìm sân ngay</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking: IBooking) => {
            const primaryItem = getPrimaryItem(booking);
            return (
              <Card key={booking.id} className="border-border/70 shadow-sm">
                <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{primaryItem?.court?.name ?? 'Sân'}</CardTitle>
                    <CardDescription>
                      {[
                        primaryItem?.court?.venue?.name,
                        primaryItem?.court?.sport?.name,
                        booking.bookingCode,
                      ]
                        .filter(Boolean)
                        .join(' · ') || '—'}
                    </CardDescription>
                  </div>
                  <span className={cn('status-badge', statusClass(booking.status))}>
                    {statusLabel(booking.status)}
                  </span>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1 text-sm">
                    <p>
                      Ngày:{' '}
                      <span className="font-medium">
                        {primaryItem ? formatBookingDate(primaryItem.date) : '—'}
                      </span>
                    </p>
                    <p>
                      Giờ:{' '}
                      <span className="font-medium">
                        {primaryItem
                          ? `${formatSlotTime(primaryItem.startTime)}–${formatSlotTime(primaryItem.endTime)}`
                          : '—'}
                      </span>
                    </p>
                    <p>
                      Giá:{' '}
                      <span className="font-medium">
                        {(booking.finalAmount ?? primaryItem?.subtotal ?? 0).toLocaleString(
                          'vi-VN',
                        )}{' '}
                        đ
                      </span>
                    </p>
                  </div>

                  {isHoldActive(booking) ||
                  (booking.status === 'waiting_payment' && booking.expiresAt) ? (
                    <PendingBookingActions
                      booking={booking}
                      cancelPending={cancelMutation.isPending}
                      onCancel={() => cancelMutation.mutate(booking.id)}
                    />
                  ) : (
                    <div className="flex gap-2">
                      <Button asChild variant="outline" className="rounded-lg">
                        <Link href={`/courts/${primaryItem?.courtId ?? ''}`}>Xem sân</Link>
                      </Button>
                      {canCancel(booking) ? (
                        <Button
                          variant="destructive"
                          className="rounded-lg"
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
            );
          })}
        </div>
      )}
    </div>
  );
}
