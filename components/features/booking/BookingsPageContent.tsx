'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { ErrorState } from '@/components/features/common/ErrorState';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cancelBooking, listMyBookings } from '@/lib/api/bookings';
import { createVnpayUrl, getOrCreatePendingPayment, payWithSavedMethod } from '@/lib/api/payments';
import { ApiError } from '@/lib/api/errors';
import { unwrapList } from '@/lib/api/response';
import { IBooking, IUserPaymentMethod } from '@/lib/api/types';
import { useCountdown } from '@/lib/hooks/useCountdown';
import { userPaymentMethodService } from '@/lib/service';
import { cn } from '@/lib/utils';
import { CalendarX2, MapPin, Clock, Ticket, ReceiptText } from 'lucide-react';

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

  // Format to something like "T4, 25 thg 10"
  const weekday = new Intl.DateTimeFormat('vi-VN', { weekday: 'short' }).format(date);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  return `${weekday}, ${day} thg ${month}`;
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

const statusClasses = (status: string) => {
  switch (status) {
    case 'waiting_payment':
      return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20';
    case 'confirmed':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20';
    case 'cancelled':
    case 'expired':
      return 'bg-muted text-muted-foreground border-border';
    case 'completed':
      return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20';
    default:
      return 'bg-muted text-muted-foreground border-border';
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
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between w-full pt-4 border-t border-border/60 mt-4">
      <div className="flex items-center gap-2">
        {!isExpired ? (
          <div className="flex items-center gap-1.5 rounded-full bg-amber-100/50 px-3 py-1 text-sm font-medium text-amber-800 dark:bg-amber-500/10 dark:text-amber-400">
            <Clock className="size-4" />
            <span>Còn {formatted} để thanh toán</span>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">Đang cập nhật trạng thái...</span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {canCancel(booking) ? (
          <Button
            variant="ghost"
            className="rounded-xl px-4 font-medium text-muted-foreground hover:text-foreground"
            disabled={cancelPending}
            onClick={onCancel}
          >
            Hủy lịch
          </Button>
        ) : null}

        {!isExpired ? (
          <>
            {defaultSavedMethod ? (
              <Button
                variant="outline"
                className="rounded-xl font-medium"
                disabled={paying}
                onClick={() => void continuePayWithSaved()}
              >
                {paying && payingMode === 'saved' ? 'Đang xử lý...' : 'Thẻ đã lưu'}
              </Button>
            ) : null}
            <Button
              className="rounded-xl font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
              disabled={paying}
              onClick={() => void continuePayWithVnpay()}
            >
              {paying && payingMode === 'vnpay' ? 'Đang chuyển...' : 'Thanh toán ngay'}
            </Button>
          </>
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
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-12 w-full max-w-md" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (bookingsQuery.isError) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <ErrorState
          title="Không tải được lịch đặt sân"
          message={
            bookingsQuery.error instanceof Error ? bookingsQuery.error.message : 'Vui lòng thử lại'
          }
          onRetry={() => bookingsQuery.refetch()}
        />
      </div>
    );
  }

  const tabItems: { id: 'upcoming' | 'past' | 'cancelled'; label: string }[] = [
    { id: 'upcoming', label: 'Sắp tới' },
    { id: 'past', label: 'Đã đặt' },
    { id: 'cancelled', label: 'Đã hủy' },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Lịch đặt sân
        </h1>

        {/* Underline Tabs */}
        <div className="border-b border-border flex gap-6 overflow-x-auto no-scrollbar">
          {tabItems.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap pb-3 text-sm font-medium transition-colors border-b-2 cursor-pointer ${
                  isActive
                    ? 'border-foreground text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="pt-2">
        {!bookings?.length ? (
          // Empty State - No bookings at all
          <div className="flex flex-col items-center justify-center rounded-3xl border border-border/50 bg-card py-20 px-6 text-center shadow-sm">
            <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Ticket className="size-10" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-foreground">Bạn chưa có lịch đặt nào</h3>
            <p className="mb-8 max-w-sm text-muted-foreground">
              Hãy bắt đầu hành trình thể thao của bạn bằng cách tìm kiếm và đặt sân ngay hôm nay.
            </p>
            <Button
              asChild
              size="lg"
              className="rounded-xl px-8 font-semibold shadow-sm transition-transform hover:scale-105 active:scale-95"
            >
              <Link href="/venues">Tìm sân ngay</Link>
            </Button>
          </div>
        ) : filteredBookings.length === 0 ? (
          // Empty State - Empty Tab
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border py-16 px-6 text-center">
            <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <CalendarX2 className="size-8" />
            </div>
            <h3 className="mb-2 text-lg font-medium text-foreground">
              Không có lịch trong mục này
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Bạn không có lịch đặt sân nào ở trạng thái "
              {tabItems.find((t) => t.id === activeTab)?.label.toLowerCase()}".
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredBookings.map((booking: IBooking) => {
              const primaryItem = getPrimaryItem(booking);
              const isHold =
                isHoldActive(booking) ||
                (booking.status === 'waiting_payment' && booking.expiresAt);

              return (
                <div
                  key={booking.id}
                  className="group relative flex flex-col rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm transition-all hover:shadow-md"
                >
                  {/* Top: Status Badge & Code */}
                  <div className="mb-4 flex items-center justify-between">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
                        statusClasses(booking.status),
                      )}
                    >
                      {statusLabel(booking.status)}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground">
                      Mã: <span className="uppercase tracking-wider">{booking.bookingCode}</span>
                    </span>
                  </div>

                  {/* Body: Venue & Time Info */}
                  <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
                    <div className="space-y-1.5">
                      <h3 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                        {primaryItem?.court?.venue?.name ?? 'Cơ sở thể thao'}
                      </h3>

                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                        <MapPin className="size-3.5 shrink-0" />
                        <span>{primaryItem?.court?.name ?? 'Sân'}</span>
                        {primaryItem?.court?.sport?.name && (
                          <>
                            <span>·</span>
                            <span>{primaryItem.court.sport.name}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-start sm:items-end gap-1 rounded-xl bg-muted/50 p-3 sm:bg-transparent sm:p-0">
                      <div className="text-sm font-medium text-foreground">
                        {primaryItem ? formatBookingDate(primaryItem.date) : '—'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {primaryItem
                          ? `${formatSlotTime(primaryItem.startTime)} – ${formatSlotTime(primaryItem.endTime)}`
                          : '—'}
                      </div>
                      <div className="mt-1 text-base font-semibold text-foreground">
                        {(booking.finalAmount ?? primaryItem?.subtotal ?? 0).toLocaleString(
                          'vi-VN',
                        )}{' '}
                        đ
                      </div>
                    </div>
                  </div>

                  {/* Bottom Actions */}
                  {isHold ? (
                    <PendingBookingActions
                      booking={booking}
                      cancelPending={cancelMutation.isPending}
                      onCancel={() => cancelMutation.mutate(booking.id)}
                    />
                  ) : (
                    <div className="mt-5 flex items-center justify-end gap-3 border-t border-border/60 pt-4">
                      {canCancel(booking) && (
                        <Button
                          variant="ghost"
                          className="rounded-xl px-4 font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
                          disabled={cancelMutation.isPending}
                          onClick={() => cancelMutation.mutate(booking.id)}
                        >
                          Hủy lịch
                        </Button>
                      )}
                      <Button
                        asChild
                        variant="secondary"
                        className="rounded-xl font-medium shadow-sm"
                      >
                        <Link
                          href={`/courts/${primaryItem?.courtId ?? ''}`}
                          className="flex items-center gap-1.5"
                        >
                          <ReceiptText className="size-4" />
                          Xem chi tiết sân
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
