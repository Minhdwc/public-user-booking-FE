import apiClient from '@/lib/api/client';
import { PaginatedResult } from '@/lib/api/response';
import { CreateReviewPayload, IReview, ListParams, ReviewEligibility } from '@/lib/api/types';

export const reviewService = {
  getReviews: (params?: ListParams & { venueId?: string }) =>
    apiClient.get('/reviews', { params }) as Promise<PaginatedResult<IReview> | IReview[]>,

  getReview: (id: string) => apiClient.get(`/reviews/${id}`) as Promise<IReview>,

  createReview: (body: CreateReviewPayload) => apiClient.post('/reviews', body) as Promise<IReview>,

  getReviewEligibility: (venueId: string) =>
    apiClient.get('/reviews/eligibility/check', {
      params: { venueId },
    }) as Promise<ReviewEligibility>,

  updateReview: (id: string, body: { rating?: number; comment?: string | null }) =>
    apiClient.patch(`/reviews/${id}`, body) as Promise<IReview>,

  deleteReview: (id: string) => apiClient.delete(`/reviews/${id}`) as Promise<IReview>,
};
