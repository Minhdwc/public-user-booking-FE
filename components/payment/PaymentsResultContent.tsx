'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { createVnpayUrl } from '@/lib/api/payments';
import { ApiError } from '@/lib/api/errors';
import { paymentService } from '@/lib/service';

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

export function PaymentsResultContent() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const status = searchParams.get('status') ?? '';
  const paymentId = searchParams.get('paymentId');
  const [retrying, setRetrying] = useState(false);
  const toastedRef = useRef(false);

  const paymentQuery = useQuery({
    queryKey: ['payments', paymentId],
    queryFn: () => paymentService.getPayment(paymentId!),
    enabled: Boolean(paymentId) && (status === 'success' || status === 'failed'),
  });

  useEffect(() => {
    if (toastedRef.current || !status) return;
    toastedRef.current = true;

    if (status === 'success') {
      void queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Đặt sân thành công', {
        description: 'Thanh toán đã được xác nhận. Lịch đặt của bạn đã sẵn sàng.',
      });
      return;
    }

    if (status === 'failed') {
      toast.error('Thanh toán thất bại', {
        description: 'Bạn có thể thử lại với cùng giao dịch đang chờ.',
      });
      return;
    }

    if (status === 'amount_mismatch' || status === 'invalid' || status === 'not_found') {
      toast.error('Không xác nhận được thanh toán', {
        description: 'Vui lòng liên hệ hỗ trợ nếu tiền đã bị trừ.',
      });
    }
  }, [status, queryClient]);

  const retryMutation = useMutation({
    mutationFn: async () => {
      if (!paymentId) throw new Error('Thiếu paymentId');
      return createVnpayUrl(paymentId);
    },
    onSuccess: ({ paymentUrl }) => {
      window.location.href = paymentUrl;
    },
    onError: (error) => {
      setRetrying(false);
      const message = error instanceof ApiError ? error.message : 'Không thể tạo lại URL VNPay';
      toast.error(message);
    },
  });

  const handleRetry = () => {
    setRetrying(true);
    retryMutation.mutate();
  };

  if (status === 'success') {
    const booking = paymentQuery.data?.booking;

    return (
      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle className="text-foreground">Thanh toán thành công</CardTitle>
          <CardDescription>
            Đặt sân đã được xác nhận. Email xác nhận sẽ được gửi sau khi thanh toán thành công.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentQuery.isLoading ? (
            <Skeleton className="h-20 w-full" />
          ) : booking ? (
            (() => {
              const primaryItem = booking.items?.[0];
              return (
            <div className="space-y-1 text-sm">
              <p>
                Sân: <span className="font-medium">{primaryItem?.field?.name ?? '—'}</span>
              </p>
              <p>
                Cơ sở: <span className="font-medium">{primaryItem?.field?.venue?.name ?? '—'}</span>
              </p>
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
                Số tiền:{' '}
                <span className="font-medium">
                  {(paymentQuery.data?.amount ?? booking.finalAmount ?? 0).toLocaleString('vi-VN')} đ
                </span>
              </p>
            </div>
              );
            })()
          ) : (
            <p className="text-sm text-muted-foreground">Thanh toán đã ghi nhận thành công.</p>
          )}

          <Button asChild>
            <Link href="/bookings">Xem lịch đặt</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (status === 'failed') {
    return (
      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle className="text-foreground">Thanh toán thất bại</CardTitle>
          <CardDescription>
            Bạn có thể thử lại với cùng giao dịch đang chờ — không tạo thanh toán mới.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          {paymentId ? (
            <Button disabled={retrying || retryMutation.isPending} onClick={handleRetry}>
              {retryMutation.isPending ? 'Đang chuyển đến VNPay...' : 'Thử thanh toán lại'}
            </Button>
          ) : null}
          <Button asChild variant="outline">
            <Link href="/bookings">Về lịch đặt sân</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (status === 'amount_mismatch' || status === 'invalid' || status === 'not_found') {
    const title =
      status === 'amount_mismatch'
        ? 'Số tiền không khớp'
        : status === 'invalid'
          ? 'Chữ ký không hợp lệ'
          : 'Không tìm thấy thanh toán';

    return (
      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle className="text-foreground">{title}</CardTitle>
          <CardDescription>
            Có lỗi kỹ thuật khi xác nhận thanh toán. Vui lòng liên hệ hỗ trợ và cung cấp mã giao dịch
            nếu có.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <Link href="/bookings">Về lịch đặt sân</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle className="text-foreground">Kết quả thanh toán</CardTitle>
        <CardDescription>
          Không xác định được trạng thái từ URL. Kiểm tra lại lịch đặt sân.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild>
          <Link href="/bookings">Xem lịch đặt</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
