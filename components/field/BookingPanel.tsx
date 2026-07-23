'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { createBooking } from '@/lib/api/bookings';
import { createVnpayUrl, getOrCreatePendingPayment, payWithSavedMethod } from '@/lib/api/payments';
import { ApiError } from '@/lib/api/errors';
import { getFieldAvailability } from '@/lib/api/fields';
import { unwrapList } from '@/lib/api/response';
import { IUserPaymentMethod } from '@/lib/api/types';
import { userPaymentMethodService } from '@/lib/service';
import { useAuthStore } from '@/lib/stores/auth-store';
import { ITimeslot } from '@/lib/types';
import { buildFieldBookingReturnPath, buildLoginUrl } from '@/lib/utils/auth-action';
import { cn } from '@/lib/utils';

interface BookingPanelProps {
  fieldId: string;
  fieldName: string;
  price: number;
}

type SubmitPhase = 'idle' | 'holding' | 'paying';
type CheckoutMode = 'saved' | 'vnpay';

const methodLabels: Record<IUserPaymentMethod['type'], string> = {
  bank_transfer: 'Chuyển khoản',
  momo: 'MoMo',
  zalopay: 'ZaloPay',
  vnpay: 'VNPay',
};

function todayLocalIsoDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const weekdayLabels = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

function next7Days() {
  const now = new Date();
  const days = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(now);
    date.setDate(now.getDate() + i);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const value = `${year}-${month}-${day}`;
    days.push({
      value,
      weekday: weekdayLabels[date.getDay()],
      dayMonth: `${date.getDate()}/${date.getMonth() + 1}`,
      isToday: i === 0,
    });
  }
  return days;
}

function formatSlotTime(value: string) {
  const match = value.match(/T(\d{2}:\d{2})/);
  if (match) return match[1];
  if (/^\d{2}:\d{2}/.test(value)) return value.slice(0, 5);
  return value;
}

function formatSavedMethod(method: IUserPaymentMethod) {
  const parts = [method.provider, method.maskedNumber].filter(Boolean);
  return parts.join(' · ') || methodLabels[method.type];
}

export function BookingPanel({ fieldId, fieldName, price }: BookingPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  const draftDate = searchParams.get('date');
  const draftTimeslotId = searchParams.get('timeslotId');

  const [date, setDate] = useState(draftDate || todayLocalIsoDate());
  const [selectedTimeslotId, setSelectedTimeslotId] = useState<string | null>(draftTimeslotId);
  const [submitPhase, setSubmitPhase] = useState<SubmitPhase>('idle');
  const [checkoutMode, setCheckoutMode] = useState<CheckoutMode>('saved');
  const [selectedMethodId, setSelectedMethodId] = useState<string>('');

  useEffect(() => {
    if (draftDate) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDate(draftDate);
    }
    if (draftTimeslotId) {
      setSelectedTimeslotId(draftTimeslotId);
    }
  }, [draftDate, draftTimeslotId]);

  const savedMethodsQuery = useQuery({
    queryKey: ['user-payment-methods'],
    queryFn: async () => unwrapList(await userPaymentMethodService.getMethods({ limit: 50 })),
    enabled: isHydrated && isAuthenticated,
  });

  const savedMethods = savedMethodsQuery.data ?? [];
  const defaultMethod =
    savedMethods.find((method: IUserPaymentMethod) => method.isDefault) ?? savedMethods[0] ?? null;

  useEffect(() => {
    if (defaultMethod && !selectedMethodId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedMethodId(defaultMethod.id);
    }
    if (savedMethods.length === 0) {
      setCheckoutMode('vnpay');
    }
  }, [defaultMethod, savedMethods.length, selectedMethodId]);

  const availabilityQuery = useQuery({
    queryKey: ['fields', fieldId, 'availability', date],
    queryFn: () => getFieldAvailability(fieldId, date),
    enabled: Boolean(fieldId && date),
  });

  const createMutation = useMutation({
    mutationFn: async (payload: {
      fieldId: string;
      timeslotId: string;
      date: string;
      mode: CheckoutMode;
      userPaymentMethodId?: string;
    }) => {
      setSubmitPhase('holding');
      const booking = await createBooking({
        fieldId: payload.fieldId,
        timeslotId: payload.timeslotId,
        date: payload.date,
      });

      try {
        setSubmitPhase('paying');
        const payment = await getOrCreatePendingPayment(booking.id);

        if (payload.mode === 'saved') {
          const result = await payWithSavedMethod(payment.id, payload.userPaymentMethodId);
          return { ok: true as const, mode: 'saved' as const, paymentId: result.paymentId };
        }

        const { paymentUrl } = await createVnpayUrl(payment.id);
        return { ok: true as const, mode: 'vnpay' as const, paymentUrl };
      } catch (error) {
        toast.error(
          error instanceof ApiError
            ? error.message
            : 'Đã giữ chỗ nhưng chưa thanh toán được, vào Lịch đặt sân để thử lại',
        );
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['fields', fieldId, 'availability'] }),
          queryClient.invalidateQueries({ queryKey: ['bookings'] }),
        ]);
        router.push('/bookings');
        return { ok: false as const };
      }
    },
    onSuccess: async (result) => {
      if (!result.ok) {
        setSubmitPhase('idle');
        return;
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['fields', fieldId, 'availability'] }),
        queryClient.invalidateQueries({ queryKey: ['bookings'] }),
      ]);

      if (result.mode === 'saved') {
        toast.success('Thanh toán thành công');
        router.push(`/payments?status=success&paymentId=${result.paymentId}`);
        return;
      }

      toast.message('Đang chuyển đến VNPay...');
      window.location.href = result.paymentUrl;
    },
    onError: (error) => {
      setSubmitPhase('idle');
      const message = error instanceof ApiError ? error.message : 'Không thể đặt sân';
      toast.error(message);
    },
  });

  const timeslots = useMemo(
    () => availabilityQuery.data?.timeslots ?? [],
    [availabilityQuery.data?.timeslots],
  );
  const selectedSlot = useMemo(
    () => timeslots.find((slot: ITimeslot) => slot.id === selectedTimeslotId) ?? null,
    [selectedTimeslotId, timeslots],
  );

  const handleSelectSlot = (slot: ITimeslot) => {
    setSelectedTimeslotId(slot.id);
  };

  const goLoginToContinue = () => {
    const returnPath = buildFieldBookingReturnPath(fieldId, {
      date,
      timeslotId: selectedTimeslotId ?? undefined,
    });
    router.push(buildLoginUrl(returnPath));
  };

  const handleSubmit = () => {
    if (!isHydrated) return;

    if (!selectedTimeslotId) {
      toast.error('Vui lòng chọn khung giờ');
      return;
    }

    if (!isAuthenticated) {
      toast.message('Đăng nhập để tiếp tục đặt sân');
      goLoginToContinue();
      return;
    }

    if (checkoutMode === 'saved' && !selectedMethodId) {
      toast.error('Chọn phương thức thanh toán đã lưu hoặc chuyển sang VNPay');
      return;
    }

    createMutation.mutate({
      fieldId,
      timeslotId: selectedTimeslotId,
      date,
      mode: checkoutMode,
      userPaymentMethodId: checkoutMode === 'saved' ? selectedMethodId : undefined,
    });
  };

  const buttonLabel = (() => {
    if (!isHydrated) return 'Đang tải...';
    if (submitPhase === 'holding') return 'Đang giữ chỗ...';
    if (submitPhase === 'paying' || createMutation.isPending) {
      return checkoutMode === 'saved' ? 'Đang thanh toán...' : 'Đang chuyển đến VNPay...';
    }
    if (!isAuthenticated) return 'Đăng nhập để đặt sân';
    return checkoutMode === 'saved' ? 'Đặt sân & thanh toán ngay' : 'Đặt sân & thanh toán VNPay';
  })();

  return (
    <Card className="rounded-md border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>Đặt sân</CardTitle>
        <CardDescription>
          Chọn ngày và khung giờ cho {fieldName}. Sau khi đặt, bạn có 15 phút để thanh toán.
          {!isAuthenticated && isHydrated
            ? ' Bạn xem lịch tự do — đăng nhập khi sẵn sàng đặt.'
            : null}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label>Ngày chơi</Label>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {next7Days().map((day) => {
              const selected = day.value === date;
              return (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => {
                    setDate(day.value);
                    setSelectedTimeslotId(null);
                  }}
                  className={cn(
                    'shrink-0 rounded-md border px-3 py-2 text-left transition-colors',
                    selected
                      ? 'chip-active border-primary'
                      : 'border-border bg-card hover:border-primary/50 hover:bg-muted',
                  )}
                >
                  <span
                    className={cn(
                      'block text-xs uppercase',
                      selected ? 'text-primary-foreground' : 'text-muted-foreground',
                    )}
                  >
                    {day.isToday ? 'Hôm nay' : day.weekday}
                  </span>
                  <span
                    className={cn(
                      'block text-sm font-semibold',
                      selected ? 'text-primary-foreground' : 'text-foreground',
                    )}
                  >
                    {day.dayMonth}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Khung giờ</Label>
          {availabilityQuery.isLoading ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-full" />
              ))}
            </div>
          ) : availabilityQuery.isError ? (
            <p className="text-sm text-destructive">
              {availabilityQuery.error instanceof Error
                ? availabilityQuery.error.message
                : 'Không tải được khung giờ'}
            </p>
          ) : timeslots.length === 0 ? (
            <p className="text-sm text-muted-foreground">Chưa có khung giờ khả dụng</p>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {timeslots.map((slot: ITimeslot) => {
                const label = `${formatSlotTime(slot.startTime)}–${formatSlotTime(slot.endTime)}`;
                const isBooked = slot.status === 'booked';
                const isSelected = slot.id === selectedTimeslotId;

                return (
                  <Button
                    key={slot.id}
                    type="button"
                    variant={isSelected ? 'default' : 'outline'}
                    disabled={isBooked}
                    className={cn('w-full px-2 text-xs', isBooked && 'opacity-50')}
                    onClick={() => handleSelectSlot(slot)}
                  >
                    {isBooked ? `${label} (hết)` : label}
                  </Button>
                );
              })}
            </div>
          )}
        </div>

        {isAuthenticated && isHydrated ? (
          <div className="space-y-3 rounded-md border bg-muted/40 px-3 py-3">
            <Label>Thanh toán</Label>
            {savedMethodsQuery.isLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : savedMethods.length > 0 ? (
              <>
                <div className="flex flex-col gap-2">
                  <label className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="checkout-mode"
                      checked={checkoutMode === 'saved'}
                      onChange={() => setCheckoutMode('saved')}
                    />
                    Dùng phương thức đã lưu (demo, không qua VNPay)
                  </label>
                  {checkoutMode === 'saved' ? (
                    <select
                      value={selectedMethodId}
                      onChange={(event) => setSelectedMethodId(event.target.value)}
                      className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                    >
                      {savedMethods.map((method: IUserPaymentMethod) => (
                        <option key={method.id} value={method.id}>
                          {formatSavedMethod(method)}
                          {method.isDefault ? ' (mặc định)' : ''}
                        </option>
                      ))}
                    </select>
                  ) : null}
                  <label className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="checkout-mode"
                      checked={checkoutMode === 'vnpay'}
                      onChange={() => setCheckoutMode('vnpay')}
                    />
                    Thanh toán qua VNPay sandbox
                  </label>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Chưa có phương thức đã lưu.{' '}
                <Link href="/account" className="text-primary underline">
                  Thêm trong Tài khoản
                </Link>{' '}
                hoặc dùng VNPay sandbox.
              </p>
            )}
          </div>
        ) : null}

        <div className="space-y-1 rounded-md border bg-muted/40 px-3 py-2 text-sm">
          <p>
            Giá: <span className="font-medium">{price.toLocaleString('vi-VN')} đ</span>
          </p>
          {selectedSlot ? (
            <p className="text-muted-foreground">
              Đã chọn {formatSlotTime(selectedSlot.startTime)}–
              {formatSlotTime(selectedSlot.endTime)}
            </p>
          ) : (
            <p className="text-muted-foreground">Chưa chọn khung giờ</p>
          )}
        </div>

        <Button
          className="w-full rounded-md shadow-sm"
          disabled={createMutation.isPending || availabilityQuery.isLoading || !isHydrated}
          onClick={handleSubmit}
        >
          {buttonLabel}
        </Button>
      </CardContent>
    </Card>
  );
}
