'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { BookingPlaceholder } from '@/components/field/BookingPlaceholder';
import { FieldInfo } from '@/components/field/FieldInfo';
import { ReviewList } from '@/components/review/ReviewList';
import { ErrorState } from '@/components/common/ErrorState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getFieldById } from '@/lib/api/fields';
import { getReviewsByFieldId } from '@/lib/api/reviews';

interface FieldDetailContentProps {
  fieldId: string;
}

export function FieldDetailContent({ fieldId }: FieldDetailContentProps) {
  const fieldQuery = useQuery({
    queryKey: ['fields', fieldId],
    queryFn: () => getFieldById(fieldId),
  });

  const reviewsQuery = useQuery({
    queryKey: ['reviews', 'field', fieldId],
    queryFn: () => getReviewsByFieldId(fieldId),
    enabled: Boolean(fieldId),
  });

  if (fieldQuery.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="aspect-video w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
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
    <div className="space-y-10">
      <Link
        href={`/venues/${fieldQuery.data.venue.id}`}
        className="text-sm text-primary hover:underline"
      >
        ← Quay lại {fieldQuery.data.venue.name}
      </Link>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <FieldInfo field={fieldQuery.data} />
        <BookingPlaceholder />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Đánh giá từ người chơi</CardTitle>
        </CardHeader>
        <CardContent>
          {reviewsQuery.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : reviewsQuery.isError ? (
            <ErrorState
              message="Không thể tải đánh giá"
              onRetry={() => reviewsQuery.refetch()}
            />
          ) : (
            <ReviewList reviews={reviewsQuery.data ?? []} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
