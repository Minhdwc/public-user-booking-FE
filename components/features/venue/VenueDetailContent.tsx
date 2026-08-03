'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Clock3,
  ExternalLink,
  MapPin,
  Star,
  Share,
  CheckCircle2,
  MessageSquare,
} from 'lucide-react';
import Link from 'next/link';
import { EmptyState } from '@/components/features/common/EmptyState';
import { VenueChatButton } from '@/components/features/chat/ChatPageContent';
import { ErrorState } from '@/components/features/common/ErrorState';
import { FieldCard } from '@/components/features/field/card';
import { VenueGallery } from '@/components/features/venue/VenueGallery';
import { Skeleton } from '@/components/ui/skeleton';
import { getVenueById } from '@/lib/api/venues';
import { useAuthStore } from '@/lib/stores/auth-store';
import { formatTime, formatVenueAddress } from '@/lib/utils/format';
import { ICourt } from '@/lib/api/types';
import { FavoriteButton } from '@/components/features/common/FavoriteButton';

interface VenueDetailContentProps {
  venueId: string;
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
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8 pb-12 pt-6">
        <div className="space-y-4">
          <Skeleton className="h-12 w-2/3" />
          <Skeleton className="h-6 w-1/3" />
        </div>
        <Skeleton className="aspect-video min-h-96 w-full rounded-2xl" />
        <div className="grid gap-12 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-40 w-full rounded-2xl" />
          </div>
          <div>
            <Skeleton className="min-h-80 w-full rounded-2xl" />
          </div>
        </div>
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
  const address = formatVenueAddress(data);
  const operatingHour = data.operatingHours?.[0];
  const galleryImages = data.venueImages?.map((image) => image.url) ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6 pb-20 pt-6">
      {/* 1. Top Header: Title & Meta Info (Airbnb Style) */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold leading-tight text-foreground sm:text-3xl lg:text-4xl">
          {data.name}
        </h1>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-1">
          <div className="flex flex-wrap items-center gap-x-2 text-sm font-medium text-foreground">
            {data.ratingCount ? (
              <div className="flex items-center gap-1">
                <Star className="size-4.5 fill-foreground text-foreground" />
                <span>{data.ratingAverage?.toFixed(1)}</span>
                <span className="text-foreground hover:bg-muted/50 rounded-md cursor-pointer underline decoration-foreground underline-offset-4">
                  {data.ratingCount} đánh giá
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Star className="size-4.5 opacity-50" />
                <span className="font-normal">Chưa có đánh giá</span>
              </div>
            )}

            <span className="text-muted-foreground/60 hidden sm:inline">•</span>

            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:bg-muted/50 rounded-md underline decoration-foreground underline-offset-4"
            >
              {address}
            </a>
          </div>

          <div className="flex shrink-0 items-center gap-1 -mr-2">
            <button className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted">
              <Share className="size-4.5" />
              <span className="hidden sm:inline underline decoration-foreground underline-offset-4 hover:bg-transparent">
                Chia sẻ
              </span>
            </button>
            <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted cursor-pointer">
              <FavoriteButton
                venueId={venueId}
                venueName={data.name}
                className="inline-flex size-4.5 items-center justify-center p-0"
                iconClassName="size-4.5"
              />
              <span className="hidden sm:inline underline decoration-foreground underline-offset-4 hover:bg-transparent">
                Lưu
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Gallery (Hero Image Grid) */}
      <div className="pt-2">
        <VenueGallery images={galleryImages} venueName={data.name} />
      </div>

      {/* 3. Main Content & Sidebar Grid */}
      <div className="mt-8 grid gap-x-12 gap-y-12 lg:grid-cols-7 xl:gap-x-20">
        {/* Left Column: Details (Takes up 4/7 space) */}
        <div className="space-y-8 lg:col-span-4 xl:col-span-4">
          {/* Host / Basic Info Section */}
          <section className="border-b border-border/60 pb-8 pt-2">
            <h2 className="text-xl font-semibold text-foreground tracking-tight">Cơ sở thể thao</h2>
            <div className="mt-1 flex items-center gap-1 text-base text-muted-foreground">
              {data.courts?.length ?? 0} sân đang hoạt động
              {data.amenities?.length ? ` · ${data.amenities.length} tiện ích` : ''}
            </div>
          </section>

          {/* Description Section */}
          <section className="border-b border-border/60 pb-10 pt-2">
            {data.description ? (
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <p className="whitespace-pre-line leading-relaxed text-foreground/90 text-base">
                  {data.description}
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground italic bg-muted/30 p-6 rounded-xl border border-border/50">
                Chưa có thông tin mô tả chi tiết.
              </p>
            )}
          </section>

          {/* Amenities Section */}
          {data.amenities?.length ? (
            <section className="border-b border-border/60 pb-10 pt-2">
              <h2 className="mb-6 text-xl font-semibold text-foreground tracking-tight">
                Nơi này có những gì cho bạn
              </h2>
              <ul className="grid grid-cols-1 gap-y-4 sm:grid-cols-2">
                {data.amenities.map((amenity) => (
                  <li key={amenity.id} className="flex items-center gap-4 text-foreground">
                    <CheckCircle2 className="size-6 shrink-0 text-foreground" strokeWidth={1.5} />
                    <span className="text-base text-foreground/90">{amenity.name}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {/* Courts Section */}
          <section className="pt-2">
            <div className="mb-6 flex items-baseline justify-between">
              <h2 className="text-xl font-semibold text-foreground tracking-tight">
                Danh sách sân
              </h2>
            </div>

            {!data.courts?.length ? (
              <EmptyState
                title="Chưa có sân hoạt động"
                description="Cơ sở này chưa có sân nào sẵn sàng để đặt lúc này."
              />
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">
                {data.courts
                  .filter((court: ICourt) => court.sport)
                  .map((court: ICourt) => (
                    <FieldCard key={court.id} field={{ ...court, sport: court.sport! }} />
                  ))}
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Sticky Booking / Info Card (Takes up 3/7 space) */}
        <div className="relative lg:col-span-3 xl:col-span-3">
          <div className="sticky top-28 w-full xl:w-11/12 xl:ml-auto">
            {/* Premium Info Card (Airbnb shadow style) */}
            <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-lg">
              <div className="space-y-6">
                {/* Header of card */}
                <div>
                  <h3 className="text-xl font-semibold text-foreground tracking-tight">Liên hệ</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Sắp xếp lịch chơi của bạn ngay hôm nay.
                  </p>
                </div>

                {/* Operating Hours */}
                <div className="flex items-start gap-4">
                  <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center text-foreground">
                    <Clock3 className="size-4.5" strokeWidth={2} />
                  </div>
                  <div>
                    <h4 className="font-medium text-base text-foreground">Giờ hoạt động</h4>
                    {operatingHour?.openTime && operatingHour?.closeTime ? (
                      <div className="mt-1">
                        <p className="text-sm text-muted-foreground">
                          {formatTime(operatingHour.openTime)} –{' '}
                          {formatTime(operatingHour.closeTime)}
                        </p>
                        {data.restStartTime && data.restEndTime ? (
                          <p className="text-sm text-muted-foreground mt-0.5">
                            Nghỉ: {formatTime(data.restStartTime)} – {formatTime(data.restEndTime)}
                          </p>
                        ) : null}
                      </div>
                    ) : (
                      <p className="mt-1 text-sm text-muted-foreground">Chưa cập nhật</p>
                    )}
                  </div>
                </div>

                {/* Location snippet */}
                <div className="flex items-start gap-4">
                  <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center text-foreground">
                    <MapPin className="size-4.5" strokeWidth={2} />
                  </div>
                  <div>
                    <h4 className="font-medium text-base text-foreground">Địa chỉ</h4>
                    <p className="mt-1 text-sm leading-snug text-muted-foreground">{address}</p>
                    <a
                      href={mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 text-sm font-medium underline underline-offset-4 decoration-foreground transition-colors hover:text-foreground inline-flex items-center gap-1.5"
                    >
                      Hiển thị bản đồ
                      <ExternalLink className="size-3.5" />
                    </a>
                  </div>
                </div>

                {/* Main Action Button */}
                <div className="pt-2">
                  {isHydrated && isAuthenticated ? (
                    <div className="w-full">
                      <VenueChatButton venueId={venueId} label="Nhắn tin cơ sở" />
                    </div>
                  ) : (
                    <div className="w-full">
                      <Link
                        href="/login"
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3.5 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                      >
                        <MessageSquare className="size-4.5" />
                        Đăng nhập để liên hệ
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
