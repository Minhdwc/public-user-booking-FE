'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { ErrorState } from '@/components/common/ErrorState';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cancelBooking, getBookingById } from '@/lib/api/bookings';
import { createVnpayUrl, getOrCreatePendingPayment, payWithSavedMethod } from '@/lib/api/payments';
import { ApiError } from '@/lib/api/errors';
import { unwrapList } from '@/lib/api/response';
import { IUserPaymentMethod } from '@/lib/api/types';
import { useCountdown } from '@/lib/hooks/useCountdown';
import { userPaymentMethodService } from '@/lib/service';

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

export function CheckoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const bookingId = searchParams.get('bookingId') ?? '';
  const [paying, setPaying] = useState(false);
  const didExpireRef = useRef(false);

  const bookingQuery = useQuery({
    queryKey: ['bookings', bookingId],
    queryFn: () => getBookingById(bookingId),
    enabled: Boolean(bookingId),
    refetchInterval: 5_000,
  });

  const booking = bookingQuery.data;
  const { formatted, isExpired } = useCountdown(booking?.expiresAt);

  const savedMethodsQuery = useQuery({
    queryKey: ['user-payment-methods'],
    queryFn: async () => unwrapList(await userPaymentMethodService.getMethods({ limit: 50 })),
  });

  const defaultSavedMethod =
    savedMethodsQuery.data?.find((method: IUserPaymentMethod) => method.isDefault) ??
    savedMethodsQuery.data?.[0];

  useEffect(() => {
    if (!isExpired || didExpireRef.current) return;
    didExpireRef.current = true;
    void queryClient.invalidateQueries({ queryKey: ['bookings'] });
    toast.error('Giữ chỗ đã hết hạn');
  }, [isExpired, queryClient]);

  const cancelMutation = useMutation({
    mutationFn: () => cancelBooking(bookingId),
    onSuccess: async () => {
      toast.success('Đã hủy giữ chỗ');
      await queryClient.invalidateQueries({ queryKey: ['bookings'] });
      router.push('/bookings');
    },
    onError: (error) => {
      const message = error instanceof ApiError ? error.message : 'Không thể hủy đặt sân';
      toast.error(message);
    },
  });

  const payWithVnpay = async () => {
    if (!bookingId) return;
    setPaying(true);
    try {
      const payment = await getOrCreatePendingPayment(bookingId);
      const { paymentUrl } = await createVnpayUrl(payment.id);
      toast.message('Đang chuyển đến VNPay...');
      window.location.href = paymentUrl;
    } catch (error) {
      setPaying(false);
      const message = error instanceof ApiError ? error.message : 'Không thể tiếp tục thanh toán';
      toast.error(message);
    }
  };

  const payWithSaved = async () => {
    if (!bookingId) return;
    setPaying(true);
    try {
      const payment = await getOrCreatePendingPayment(bookingId);
      const result = await payWithSavedMethod(payment.id, defaultSavedMethod?.id);
      toast.success('Thanh toán thành công');
      await queryClient.invalidateQueries({ queryKey: ['bookings'] });
      router.push(`/booking/success?paymentId=${result.paymentId}`);
    } catch (error) {
      setPaying(false);
      const message = error instanceof ApiError ? error.message : 'Không thể thanh toán';
      toast.error(message);
    }
  };

  if (!bookingId) {
    return (
      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>Thiếu thông tin đặt sân</CardTitle>
          <CardDescription>Quay lại trang sân để chọn khung giờ và đặt lại.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="rounded-lg">
            <Link href="/courts">Tìm sân</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (bookingQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    );
  }

  if (bookingQuery.isError || !booking) {
    return (
      <ErrorState
        title="Không tải được thông tin đặt sân"
        message={
          bookingQuery.error instanceof Error ? bookingQuery.error.message : 'Vui lòng thử lại'
        }
        onRetry={() => bookingQuery.refetch()}
      />
    );
  }

  const primaryItem = booking.items?.[0];
  const holdMinutes = Math.floor(600 / 60);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Thanh toán"
        title="Xác nhận & thanh toán"
        description={`Hoàn tất thanh toán trong ${holdMinutes} phút để giữ chỗ.`}
      />

      <Card className="border-border/70 shadow-sm">
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div>
            <CardTitle>{primaryItem?.court?.name ?? 'Sân'}</CardTitle>
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
          {!isExpired && booking.status === 'waiting_payment' ? (
            <div className="rounded-lg bg-amber-50 px-3 py-2 text-center dark:bg-amber-950/40">
              <p className="text-xs font-medium uppercase tracking-wide text-amber-800 dark:text-amber-200">
                Còn lại
              </p>
              <p className="text-xl font-bold tabular-nums text-amber-900 dark:text-amber-100">
                {formatted}
              </p>
            </div>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-4">
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
              Tổng tiền:{' '}
              <span className="text-lg font-bold text-primary">
                {(booking.finalAmount ?? primaryItem?.subtotal ?? 0).toLocaleString('vi-VN')} đ
              </span>
            </p>
          </div>

          {booking.status !== 'waiting_payment' || isExpired ? (
            <p className="text-sm text-muted-foreground">
              {isExpired
                ? 'Giữ chỗ đã hết hạn. Vui lòng đặt lại khung giờ mới.'
                : 'Đơn đặt này không còn chờ thanh toán.'}
            </p>
          ) : null}

          <div className="flex flex-col gap-2 sm:flex-row">
            {booking.status === 'waiting_payment' && !isExpired ? (
              <>
                {defaultSavedMethod ? (
                  <Button
                    className="rounded-lg"
                    disabled={paying}
                    onClick={() => void payWithSaved()}
                  >
                    {paying ? 'Đang thanh toán...' : 'Thanh toán đã lưu'}
                  </Button>
                ) : null}
                <Button
                  variant={defaultSavedMethod ? 'outline' : 'default'}
                  className="rounded-lg"
                  disabled={paying}
                  onClick={() => void payWithVnpay()}
                >
                  {paying ? 'Đang chuyển...' : 'Thanh toán VNPay'}
                </Button>
              </>
            ) : null}
            <Button asChild variant="outline" className="rounded-lg">
              <Link href={`/courts/${primaryItem?.courtId ?? ''}`}>Quay lại sân</Link>
            </Button>
            {booking.status === 'waiting_payment' ? (
              <Button
                variant="destructive"
                className="rounded-lg"
                disabled={cancelMutation.isPending}
                onClick={() => cancelMutation.mutate()}
              >
                Hủy giữ chỗ
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
