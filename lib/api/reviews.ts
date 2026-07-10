import apiClient from './client';
import type { ReviewWithRelations } from './types';

export async function getReviews(): Promise<ReviewWithRelations[]> {
  return apiClient.get('/reviews');
}

export async function getReviewsByFieldId(fieldId: string): Promise<ReviewWithRelations[]> {
  const reviews = await getReviews();
  return reviews.filter((review) => review.fieldId === fieldId);
}
