import { unwrapList } from '@/lib/api/response';
import type { ReviewWithRelations } from '@/lib/api/types';
import { reviewService } from '@/lib/service';

export async function getReviews(): Promise<ReviewWithRelations[]> {
  return unwrapList(await reviewService.getReviews({ limit: 200 }));
}

export async function getReviewsByFieldId(fieldId: string): Promise<ReviewWithRelations[]> {
  const reviews = await getReviews();
  return reviews.filter((review) => review.fieldId === fieldId);
}
