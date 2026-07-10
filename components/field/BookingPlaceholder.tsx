import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const PLACEHOLDER_SLOTS = ['06:00', '07:00', '08:00', '09:00', '17:00', '18:00', '19:00', '20:00'];

export function BookingPlaceholder() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Đặt sân</CardTitle>
        <CardDescription>
          Chọn ngày và khung giờ — logic đặt sân thật sẽ có ở Phase 4
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="booking-date">Ngày chơi</Label>
          <Input id="booking-date" type="date" disabled />
        </div>

        <div className="space-y-2">
          <Label>Khung giờ</Label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {PLACEHOLDER_SLOTS.map((slot) => (
              <Button key={slot} type="button" variant="outline" disabled className="w-full">
                {slot}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-10 w-full" />
        </div>

        <Button disabled className="w-full">
          Đặt sân (sắp ra mắt)
        </Button>
      </CardContent>
    </Card>
  );
}
