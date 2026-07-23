'use client';

import { useQuery } from '@tanstack/react-query';
import { BackLink } from '@/components/common/BackLink';
import { BookingPanel } from '@/components/field/detail/booking-panel';
import { FieldInfo } from '@/components/field/detail/info';
import { ReviewList } from '@/components/review/ReviewList';
import { WriteReviewDialog } from '@/components/review/WriteReviewDialog';
import { ErrorState } from '@/components/common/ErrorState';
import { Skeleton } from '@/components/ui/skeleton';
import { getFieldById } from '@/lib/api/fields';
import { getReviewsByVenueId } from '@/lib/api/reviews';

interface FieldDetailContentProps {
  fieldId: string;
}

export function FieldDetailContent({ fieldId }: FieldDetailContentProps) {
  const fieldQuery = useQuery({
    queryKey: ['fields', fieldId],
    queryFn: () => getFieldById(fieldId),
  });

  const venueId = fieldQuery.data?.venueId ?? fieldQuery.data?.venue?.id ?? '';

  const reviewsQuery = useQuery({
    queryKey: ['reviews', 'venue', venueId],
    queryFn: () => getReviewsByVenueId(venueId),
    enabled: Boolean(venueId),
  });

  if (fieldQuery.isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="aspect-video w-full rounded-2xl" />
        <div className="grid gap-3 sm:grid-cols-3">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  if (fieldQuery.isError || !fieldQuery.data) {
    return (
      <ErrorState
        title="Không tìm thấy sân"
        message={
          fieldQuery.error instanceof Error
            ? fieldQuery.error.message
            : 'Sân không tồn tại hoặc đã bị ẩn'
        }
        onRetry={() => fieldQuery.refetch()}
      />
    );
  }

  return (
    <div className="space-y-10 pb-8">
      <BackLink
        href={fieldQuery.data.venue ? `/venues/${fieldQuery.data.venue.id}` : '/fields'}
        label={`Quay lại ${fieldQuery.data.venue?.name ?? 'danh sách sân'}`}
      />

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_400px] xl:items-start xl:gap-10">
        <FieldInfo field={fieldQuery.data} />

        <div className="xl:sticky xl:top-24">
          <BookingPanel
            fieldId={fieldQuery.data.id}
            fieldName={fieldQuery.data.name}
            price={fieldQuery.data.price}
          />
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
        <div className="flex flex-col gap-3 border-b border-border/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Cộng đồng</p>
            <h2 className="text-lg font-bold text-foreground">Đánh giá từ người chơi</h2>
          </div>
          {venueId ? (
            <WriteReviewDialog venueId={venueId} returnPath={`/fields/${fieldId}`} />
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
}
