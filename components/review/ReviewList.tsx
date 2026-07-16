import { EmptyState } from '@/components/common/EmptyState';
import { getAverageRating, RatingStars } from '@/components/review/RatingStars';
import type { ReviewWithRelations } from '@/lib/api/types';
import { formatDate } from '@/lib/utils/format';

interface ReviewListProps {
  reviews: ReviewWithRelations[];
}

export function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <EmptyState
        title="Chưa có đánh giá"
        description="Sân này chưa nhận được đánh giá nào từ người dùng."
      />
    );
  }

  const average = getAverageRating(reviews.map((review) => review.rating));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <RatingStars rating={average} showValue size="md" />
        <span className="text-sm text-muted-foreground">{reviews.length} đánh giá</span>
      </div>

      <ul className="space-y-4">
        {reviews.map((review) => (
          <li key={review.id} className="rounded-xl border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-medium">{review.user?.name ?? 'Người dùng'}</p>
                <p className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</p>
              </div>
              <RatingStars rating={review.rating} size="sm" />
            </div>
            {review.comment ? (
              <p className="mt-3 text-sm text-muted-foreground">{review.comment}</p>
            ) : (
              <p className="mt-3 text-sm italic text-muted-foreground">Không có nhận xét.</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
