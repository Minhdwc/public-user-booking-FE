'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { createBooking } from '@/lib/api/bookings';
import { ApiError } from '@/lib/api/errors';
import { getFieldAvailability } from '@/lib/api/fields';
import { useAuthStore } from '@/lib/stores/auth-store';
import type { ITimeslot } from '@/lib/types';
import {
  buildFieldBookingReturnPath,
  buildLoginUrl,
} from '@/lib/utils/auth-action';
import { cn } from '@/lib/utils';

interface BookingPanelProps {
  fieldId: string;
  fieldName: string;
  price: number;
}

function todayLocalIsoDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatSlotTime(value: string) {
  const match = value.match(/T(\d{2}:\d{2})/);
  if (match) return match[1];
  if (/^\d{2}:\d{2}/.test(value)) return value.slice(0, 5);
  return value;
}

export function BookingPanel({ fieldId, fieldName, price }: BookingPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  const draftDate = searchParams.get('date');
  const draftTimeslotId = searchParams.get('timeslotId');

  const [date, setDate] = useState(draftDate || todayLocalIsoDate);
  const [selectedTimeslotId, setSelectedTimeslotId] = useState<string | null>(draftTimeslotId);

  useEffect(() => {
    if (draftDate) setDate(draftDate);
    if (draftTimeslotId) setSelectedTimeslotId(draftTimeslotId);
  }, [draftDate, draftTimeslotId]);

  const availabilityQuery = useQuery({
    queryKey: ['fields', fieldId, 'availability', date],
    queryFn: () => getFieldAvailability(fieldId, date),
    enabled: Boolean(fieldId && date),
  });

  const createMutation = useMutation({
    mutationFn: createBooking,
    onSuccess: async () => {
      toast.success('Đặt sân thành công');
      setSelectedTimeslotId(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['fields', fieldId, 'availability'] }),
        queryClient.invalidateQueries({ queryKey: ['bookings'] }),
      ]);
      router.push('/bookings');
    },
    onError: (error) => {
      const message = error instanceof ApiError ? error.message : 'Không thể đặt sân';
      toast.error(message);
    },
  });

  const timeslots = availabilityQuery.data?.timeslots ?? [];
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

    // Browse freely — only require auth when placing the booking
    if (!isAuthenticated) {
      toast.message('Đăng nhập để tiếp tục đặt sân');
      goLoginToContinue();
      return;
    }

    createMutation.mutate({
      fieldId,
      timeslotId: selectedTimeslotId,
      date,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Đặt sân</CardTitle>
        <CardDescription>
          Chọn ngày và khung giờ cho {fieldName}.
          {!isAuthenticated && isHydrated
            ? ' Bạn xem lịch tự do — đăng nhập khi sẵn sàng đặt.'
            : null}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="booking-date">Ngày chơi</Label>
          <Input
            id="booking-date"
            type="date"
            min={todayLocalIsoDate()}
            value={date}
            onChange={(event) => {
              setDate(event.target.value);
              setSelectedTimeslotId(null);
            }}
          />
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
          className="w-full"
          disabled={createMutation.isPending || availabilityQuery.isLoading || !isHydrated}
          onClick={handleSubmit}
        >
          {!isHydrated
            ? 'Đang tải...'
            : createMutation.isPending
              ? 'Đang đặt...'
              : !isAuthenticated
                ? 'Đăng nhập để đặt sân'
                : 'Đặt sân'}
        </Button>
      </CardContent>
    </Card>
  );
}
