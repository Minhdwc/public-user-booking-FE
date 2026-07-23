import { unwrapList } from '@/lib/api/response';
import type { ReviewWithRelations } from '@/lib/api/types';
import { reviewService } from '@/lib/service';

export async function getReviews(): Promise<ReviewWithRelations[]> {
  return unwrapList(await reviewService.getReviews({ limit: 200 }));
}

export async function getReviewsByVenueId(venueId: string): Promise<ReviewWithRelations[]> {
  return unwrapList(await reviewService.getReviews({ venueId, limit: 200 }));
}
