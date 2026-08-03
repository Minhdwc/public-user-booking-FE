'use client';

import { useQuery } from '@tanstack/react-query';
import { BackLink } from '@/components/features/common/BackLink';
import { ImageGallery } from '@/components/features/common/ImageGallery';
import { BookingPanel } from '@/components/features/field/detail/booking-panel';
import { FieldContactPanel } from '@/components/features/field/detail/contact-panel';
import { FieldInfo } from '@/components/features/field/detail/info';
import { ReviewList } from '@/components/features/review/ReviewList';
import { WriteReviewDialog } from '@/components/features/review/WriteReviewDialog';
import { ErrorState } from '@/components/features/common/ErrorState';
import { Skeleton } from '@/components/ui/skeleton';
import { getCourtById } from '@/lib/api/courts';
import { getReviewsByVenueId } from '@/lib/api/reviews';
import type { ICourtImage } from '@/lib/api/types';

interface FieldDetailContentProps {
  courtId: string;
}

export const FieldDetailContent = ({ courtId }: FieldDetailContentProps) => {
  const courtQuery = useQuery({
    queryKey: ['courts', courtId],
    queryFn: () => getCourtById(courtId),
  });

  const venueId = courtQuery.data?.venueId || courtQuery.data?.venue?.id || '';

  const reviewsQuery = useQuery({
    queryKey: ['reviews', 'venue', venueId],
    queryFn: () => getReviewsByVenueId(venueId),
    enabled: Boolean(venueId),
  });

  if (courtQuery.isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="aspect-video w-full rounded-2xl" />
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="space-y-4">
            <Skeleton className="h-10 w-2/3" />
            <div className="grid gap-3 sm:grid-cols-3">
              <Skeleton className="h-24 rounded-2xl" />
              <Skeleton className="h-24 rounded-2xl" />
              <Skeleton className="h-24 rounded-2xl" />
            </div>
          </div>
          <Skeleton className="h-72 rounded-2xl" />
        </div>
        <Skeleton className="min-h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (courtQuery.isError || !courtQuery.data) {
    return (
      <ErrorState
        title="Không tìm thấy sân"
        message={
          courtQuery.error instanceof Error
            ? courtQuery.error.message
            : 'Sân không tồn tại hoặc đã bị ẩn'
        }
        onRetry={() => courtQuery.refetch()}
      />
    );
  }

  const court = courtQuery.data;
  const galleryImages = (court.courtImages ?? []).map((image: ICourtImage) => image.url);

  return (
    <div className="space-y-8 pb-10">
      <BackLink
        href={court.venue ? `/venues/${court.venue.id}` : '/courts'}
        label={`Quay lại ${court.venue?.name ?? 'danh sách sân'}`}
      />

      <ImageGallery images={galleryImages} alt={court.name} />

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_24rem] xl:items-start xl:gap-10">
        <FieldInfo court={court} />

        {court.venue ? (
          <div className="xl:sticky xl:top-24">
            <FieldContactPanel venue={court.venue} />
          </div>
        ) : null}
      </div>

      <BookingPanel courtId={court.id} courtName={court.name} basePriceVnd={court.basePriceVnd} />

      <section className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
        <div className="flex flex-col gap-3 border-b border-border/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Cộng đồng</p>
            <h2 className="text-lg font-bold text-foreground">Đánh giá từ người chơi</h2>
          </div>
          {venueId ? (
            <WriteReviewDialog venueId={venueId} returnPath={`/courts/${courtId}`} />
          ) : null}
        </div>

        <div className="p-5 sm:p-6">
          {reviewsQuery.isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
            </div>
          ) : reviewsQuery.isError ? (
            <ErrorState message="Không thể tải đánh giá" onRetry={() => reviewsQuery.refetch()} />
          ) : (
            <ReviewList reviews={reviewsQuery.data ?? []} />
          )}
        </div>
      </section>
    </div>
  );
};
