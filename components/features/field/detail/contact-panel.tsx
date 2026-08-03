'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Clock3, ExternalLink, MapPin, MessageSquare } from 'lucide-react';
import { VenueChatButton } from '@/components/features/chat/ChatPageContent';
import { IVenue } from '@/lib/api/types';
import { useAuthStore } from '@/lib/stores/auth-store';
import { buildLoginUrl } from '@/lib/utils/auth-action';
import { formatTime, formatVenueAddress } from '@/lib/utils/format';
import { cn } from '@/lib/utils';

type FieldContactPanelProps = {
  venue: IVenue;
  className?: string;
};

export const FieldContactPanel = ({ venue, className }: FieldContactPanelProps) => {
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const address = formatVenueAddress(venue);
  const operatingHour = venue.operatingHours?.[0];
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${venue.latitude},${venue.longitude}`;

  return (
    <div className={cn('rounded-2xl border border-border/70 bg-card p-6 shadow-md', className)}>
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold tracking-tight text-foreground">Liên hệ</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Hỏi thêm về {venue.name} hoặc đặt lịch qua tin nhắn.
          </p>
        </div>

        <div className="space-y-4 text-sm">
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
            <div>
              <p className="font-medium text-foreground">{venue.name}</p>
              <p className="mt-1 leading-relaxed text-muted-foreground">{address}</p>
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
              >
                Xem bản đồ
                <ExternalLink className="size-3.5" />
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock3 className="mt-0.5 size-4 shrink-0 text-primary" />
            <div>
              <p className="font-medium text-foreground">Giờ hoạt động</p>
              {operatingHour?.openTime && operatingHour?.closeTime ? (
                <p className="mt-1 text-muted-foreground">
                  {formatTime(operatingHour.openTime)} – {formatTime(operatingHour.closeTime)}
                </p>
              ) : (
                <p className="mt-1 text-muted-foreground">Chưa cập nhật</p>
              )}
            </div>
          </div>
        </div>

        <div className="pt-1">
          {isHydrated && isAuthenticated ? (
            <VenueChatButton
              venueId={venue.id}
              label="Liên hệ"
              className="h-11 w-full rounded-xl"
            />
          ) : (
            <Link
              href={buildLoginUrl(pathname)}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <MessageSquare className="size-4" />
              Đăng nhập để liên hệ
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
