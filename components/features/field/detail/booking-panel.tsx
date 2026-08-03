'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { FilterSelect } from '@/components/features/common/FilterSelect';
import { createBooking } from '@/lib/api/bookings';
import { getCourtAvailability } from '@/lib/api/courts';
import { ApiError } from '@/lib/api/errors';
import { IAvailabilitySlot } from '@/lib/api/types';
import { useAuthStore } from '@/lib/stores/auth-store';
import { buildCourtBookingReturnPath, buildLoginUrl } from '@/lib/utils/auth-action';
import { isSlotSelectable, next7DaysVn, todayIsoDateVn } from '@/lib/utils/booking-time';
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

const todayLocalIsoDate = () => todayIsoDateVn();

const next7Days = () => next7DaysVn();

const formatSlotTime = (value: string) => {
  const match = value.match(/T(\d{2}:\d{2})/);
  if (match) return match[1];
  if (/^\d{2}:\d{2}/.test(value)) return value.slice(0, 5);
  return value;
};

const slotKey = (slot: SelectedSlot) => `${slot.startTime}|${slot.endTime}`;

export const BookingPanel = ({ courtId, courtName, basePriceVnd }: BookingPanelProps) => {
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

  const visibleSlots = useMemo(
    () =>
      slots.filter((slot: IAvailabilitySlot) => {
        const isPast = slot.status === 'past' || !isSlotSelectable(date, slot);
        return !isPast;
      }),
    [date, slots],
  );

  const handleSelectSlot = (slot: IAvailabilitySlot) => {
    if (!isSlotSelectable(date, slot)) return;

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

    if (!isSlotSelectable(date, { ...selectedSlot, status: 'available' })) {
      toast.error('Khung giờ đã qua, vui lòng chọn khung giờ khác');
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
  const days = useMemo(() => next7Days(), []);

  const handleSelectDate = (value: string) => {
    setDateOverride(value);
    setSlotOverride(null);
  };

  return (
    <Card className="overflow-hidden border-border/70 shadow-md">
      <CardHeader className="border-b border-border/60 bg-muted/20 pb-4">
        <CardTitle className="text-xl">Đặt sân</CardTitle>
        <CardDescription>
          Chọn ngày và khung giờ trống. Sau khi giữ chỗ, bạn có {holdMinutes} phút để thanh toán.
          {!isAuthenticated && isHydrated
            ? ' Bạn có thể xem lịch trước — đăng nhập khi sẵn sàng đặt.'
            : null}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 pt-5">
        <div className="space-y-2">
          <Label>Ngày chơi</Label>

          <div className="md:hidden">
            <FilterSelect
              id="booking-date"
              value={date}
              onChange={(event) => handleSelectDate(event.target.value)}
              aria-label="Chọn ngày chơi"
            >
              {days.map((day) => (
                <option key={day.value} value={day.value}>
                  {day.isToday ? 'Hôm nay' : day.weekday} — {day.dayMonth}
                </option>
              ))}
            </FilterSelect>
          </div>

          <div className="hidden gap-2 md:grid md:grid-cols-7">
            {days.map((day) => {
              const selected = day.value === date;
              return (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => handleSelectDate(day.value)}
                  className={cn(
                    'rounded-lg border px-2 py-2 text-center transition-colors',
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
          ) : visibleSlots.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border/70 bg-muted/30 px-3 py-4 text-sm text-muted-foreground">
              Không còn khung giờ trống trong ngày này. Thử chọn ngày khác.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-7">
              {visibleSlots.map((slot: IAvailabilitySlot) => {
                const label = `${formatSlotTime(slot.startTime)}–${formatSlotTime(slot.endTime)}`;
                const isBooked = slot.status === 'booked';
                const isSelected =
                  selectedSlot &&
                  slotKey(selectedSlot) === slotKey({ ...slot, subtotal: slot.subtotal });

                return (
                  <button
                    key={slotKey({ ...slot, subtotal: slot.subtotal })}
                    type="button"
                    disabled={isBooked}
                    onClick={() => handleSelectSlot(slot)}
                    className={cn(
                      'flex min-h-11 flex-col items-center justify-center rounded-lg border px-2 py-2 text-center transition-colors',
                      isSelected
                        ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                        : isBooked
                          ? 'cursor-not-allowed border-border/60 bg-muted/40 text-muted-foreground opacity-60'
                          : 'border-border bg-card hover:border-primary/40 hover:bg-primary/5',
                    )}
                  >
                    <span className="text-sm font-semibold leading-tight">{label}</span>
                    {isBooked ? (
                      <span className="mt-0.5 text-xs font-medium uppercase tracking-wide opacity-80">
                        Hết chỗ
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-1 rounded-xl border border-border/60 bg-muted/30 px-4 py-3 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Giá dự kiến</span>
            <span className="text-lg font-bold text-primary">
              {displayPrice.toLocaleString('vi-VN')} đ
            </span>
          </div>
          {selectedSlot ? (
            <p className="text-xs text-muted-foreground">
              {formatSlotTime(selectedSlot.startTime)}–{formatSlotTime(selectedSlot.endTime)} ·{' '}
              {courtName}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">Chọn khung giờ để xem chi tiết</p>
          )}
        </div>

        <Button
          className="h-11 w-full rounded-xl text-base font-semibold shadow-sm"
          disabled={createMutation.isPending || availabilityQuery.isLoading || !isHydrated}
          onClick={handleSubmit}
        >
          {buttonLabel}
        </Button>
      </CardContent>
    </Card>
  );
};
