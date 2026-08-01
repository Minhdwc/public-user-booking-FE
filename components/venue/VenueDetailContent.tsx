'use client';

import { useQuery } from '@tanstack/react-query';
import { Clock3, ExternalLink, MapPin, Sparkles, Star } from 'lucide-react';
import { BackLink } from '@/components/common/BackLink';
import { EmptyState } from '@/components/common/EmptyState';
import { VenueChatButton } from '@/components/chat/ChatPageContent';
import { ErrorState } from '@/components/common/ErrorState';
import { FieldCard } from '@/components/field/card';
import { VenueGallery } from '@/components/venue/VenueGallery';
import { Skeleton } from '@/components/ui/skeleton';
import { getVenueById } from '@/lib/api/venues';
import { useAuthStore } from '@/lib/stores/auth-store';
import { formatTime } from '@/lib/utils/format';
import { ICourt } from '@/lib/api/types';

interface VenueDetailContentProps {
  venueId: string;
}

function VenueRating({ average, count }: { average?: number; count?: number }) {
  if (!count) {
    return <span className="text-sm text-muted-foreground">Chưa có đánh giá</span>;
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
      <Star className="size-4 fill-amber-400 text-amber-400" />
      <span className="font-semibold text-foreground">{average?.toFixed(1)}</span>
      <span>({count} đánh giá)</span>
    </span>
  );
}

export function VenueDetailContent({ venueId }: VenueDetailContentProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['venues', venueId],
    queryFn: () => getVenueById(venueId),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="aspect-video w-full rounded-lg" />
        <Skeleton className="h-40 w-full rounded-lg" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <ErrorState
        title="Không tìm thấy cơ sở"
        message={error instanceof Error ? error.message : 'Cơ sở không tồn tại hoặc đã bị ẩn'}
        onRetry={() => refetch()}
      />
    );
  }

  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${data.latitude},${data.longitude}`;

  return (
    <div className="space-y-10">
      <div className="space-y-4">
        <BackLink href="/venues" label="Quay lại danh sách cơ sở" />
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Cơ sở</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {data.name}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
            <p className="flex items-start gap-2 text-muted-foreground">
              <MapPin className="mt-0.5 size-4 shrink-0" />
              {data.location}
            </p>
            <VenueRating average={data.ratingAverage} count={data.ratingCount} />
          </div>
          {isHydrated && isAuthenticated ? (
            <div className="mt-4">
              <VenueChatButton venueId={venueId} />
            </div>
          ) : null}
        </div>

        <VenueGallery images={data.images ?? []} venueName={data.name} />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Clock3 className="size-4 text-primary" />
              Giờ hoạt động
            </div>
            {data.openTime && data.closeTime ? (
              <>
                <p className="mt-2 text-sm text-muted-foreground">
                  {formatTime(data.openTime)} – {formatTime(data.closeTime)}
                </p>
                {data.restStartTime && data.restEndTime ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Nghỉ trưa: {formatTime(data.restStartTime)} – {formatTime(data.restEndTime)}
                  </p>
                ) : null}
              </>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">Chưa cập nhật giờ hoạt động</p>
            )}
          </div>

          <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm sm:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <MapPin className="size-4 text-primary" />
                Vị trí
              </div>
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                Mở Google Maps
                <ExternalLink className="size-3.5" />
              </a>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{data.location}</p>
          </div>
        </div>

        {data.amenities?.length ? (
          <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Sparkles className="size-4 text-primary" />
              Tiện ích
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {data.amenities.map((amenity) => (
                <span
                  key={amenity.id}
                  className="rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs font-medium text-foreground"
                >
                  {amenity.name}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {data.description ? (
          <p className="max-w-3xl leading-relaxed text-muted-foreground">{data.description}</p>
        ) : (
          <p className="text-sm text-muted-foreground">Chưa có mô tả cho cơ sở này.</p>
        )}
      </div>

      <section className="space-y-5">
        <div>
          <h2 className="text-xl font-bold text-foreground">Danh sách sân</h2>
          <p className="text-sm text-muted-foreground">
            {data.courts?.length ?? 0} sân đang hoạt động
          </p>
        </div>

        {!data.courts?.length ? (
          <EmptyState
            title="Chưa có sân hoạt động"
            description="Cơ sở này chưa có sân nào sẵn sàng để đặt."
          />
        ) : (
          <div className="space-y-4">
            {data.courts
              .filter((court: ICourt) => court.sport)
              .map((court: ICourt) => (
                <FieldCard key={court.id} field={{ ...court, sport: court.sport! }} />
              ))}
          </div>
        )}
      </section>
    </div>
  );
}
