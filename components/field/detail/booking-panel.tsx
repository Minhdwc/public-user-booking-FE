'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { createBooking } from '@/lib/api/bookings';
import { getCourtAvailability } from '@/lib/api/courts';
import { ApiError } from '@/lib/api/errors';
import { IAvailabilitySlot } from '@/lib/api/types';
import { useAuthStore } from '@/lib/stores/auth-store';
import { buildCourtBookingReturnPath, buildLoginUrl } from '@/lib/utils/auth-action';
import { cn } from '@/lib/utils';

interface BookingPanelProps {
  courtId: string;
  courtName: string;
  basePriceVnd: number;
}

type SelectedSlot = {
  startTime: string;
  endTime: string;
  subtotal: number;
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

function slotKey(slot: SelectedSlot) {
  return `${slot.startTime}|${slot.endTime}`;
}

export function BookingPanel({ courtId, courtName, basePriceVnd }: BookingPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  const draftDate = searchParams.get('date');
  const draftStartTime = searchParams.get('startTime');
  const draftEndTime = searchParams.get('endTime');

  const urlDate = draftDate || todayLocalIsoDate();
  const urlSelectedSlot: SelectedSlot | null =
    draftStartTime && draftEndTime
      ? { startTime: draftStartTime, endTime: draftEndTime, subtotal: basePriceVnd }
      : null;

  const [dateOverride, setDateOverride] = useState<string | null>(null);
  const [slotOverride, setSlotOverride] = useState<SelectedSlot | null | undefined>(undefined);

  const date = dateOverride ?? urlDate;
  const selectedSlot = slotOverride !== undefined ? slotOverride : urlSelectedSlot;

  const availabilityQuery = useQuery({
    queryKey: ['courts', courtId, 'availability', date],
    queryFn: () => getCourtAvailability(courtId, date),
    enabled: Boolean(courtId && date),
  });

  const createMutation = useMutation({
    mutationFn: async (payload: {
      courtId: string;
      date: string;
      startTime: string;
      endTime: string;
    }) =>
      createBooking({
        items: [
          {
            courtId: payload.courtId,
            date: payload.date,
            startTime: formatSlotTime(payload.startTime),
            endTime: formatSlotTime(payload.endTime),
          },
        ],
      }),
    onSuccess: async (booking) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['courts', courtId, 'availability'] }),
        queryClient.invalidateQueries({ queryKey: ['bookings'] }),
      ]);
      toast.success('Đã giữ chỗ — chuyển đến thanh toán');
      router.push(`/checkout?bookingId=${booking.id}`);
    },
    onError: (error) => {
      const message = error instanceof ApiError ? error.message : 'Không thể đặt sân';
      toast.error(message);
    },
  });

  const slots = useMemo(() => availabilityQuery.data?.slots ?? [], [availabilityQuery.data?.slots]);

  const handleSelectSlot = (slot: IAvailabilitySlot) => {
    setSlotOverride({
      startTime: slot.startTime,
      endTime: slot.endTime,
      subtotal: slot.subtotal,
    });
  };

  const goLoginToContinue = () => {
    const returnPath = buildCourtBookingReturnPath(courtId, {
      date,
      startTime: selectedSlot ? formatSlotTime(selectedSlot.startTime) : undefined,
      endTime: selectedSlot ? formatSlotTime(selectedSlot.endTime) : undefined,
    });
    router.push(buildLoginUrl(returnPath));
  };

  const handleSubmit = () => {
    if (!isHydrated) return;

    if (!selectedSlot) {
      toast.error('Vui lòng chọn khung giờ');
      return;
    }

    if (!isAuthenticated) {
      toast.message('Đăng nhập để tiếp tục đặt sân');
      goLoginToContinue();
      return;
    }

    createMutation.mutate({
      courtId,
      date,
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
    });
  };

  const holdMinutes = 10;

  const buttonLabel = (() => {
    if (!isHydrated) return 'Đang tải...';
    if (createMutation.isPending) return 'Đang giữ chỗ...';
    if (!isAuthenticated) return 'Đăng nhập để đặt sân';
    return 'Giữ chỗ & thanh toán';
  })();

  const displayPrice = selectedSlot?.subtotal ?? basePriceVnd;

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>Đặt sân</CardTitle>
        <CardDescription>
          Chọn ngày và khung giờ cho {courtName}. Sau khi giữ chỗ, bạn có {holdMinutes} phút để
          thanh toán.
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
                    setDateOverride(day.value);
                    setSlotOverride(null);
                  }}
                  className={cn(
                    'shrink-0 rounded-lg border px-3 py-2 text-left transition-colors',
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
          ) : slots.length === 0 ? (
            <p className="text-sm text-muted-foreground">Chưa có khung giờ khả dụng</p>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {slots.map((slot: IAvailabilitySlot) => {
                const label = `${formatSlotTime(slot.startTime)}–${formatSlotTime(slot.endTime)}`;
                const isBooked = slot.status === 'booked';
                const isSelected =
                  selectedSlot &&
                  slotKey(selectedSlot) === slotKey({ ...slot, subtotal: slot.subtotal });

                return (
                  <Button
                    key={slotKey({ ...slot, subtotal: slot.subtotal })}
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

        <div className="space-y-1 rounded-lg border bg-muted/40 px-3 py-2 text-sm">
          <p>
            Giá: <span className="font-medium">{displayPrice.toLocaleString('vi-VN')} đ</span>
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
          className="w-full rounded-lg shadow-sm"
          disabled={createMutation.isPending || availabilityQuery.isLoading || !isHydrated}
          onClick={handleSubmit}
        >
          {buttonLabel}
        </Button>
      </CardContent>
    </Card>
  );
}
