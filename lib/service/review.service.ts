import apiClient from '@/lib/api/client';
import { PaginatedResult } from '@/lib/api/response';
import { CreateReviewPayload, IReview, ListParams } from '@/lib/api/types';

export const reviewService = {
  getReviews: (params?: ListParams) =>
    apiClient.get('/reviews', { params }) as Promise<PaginatedResult<IReview> | IReview[]>,

  getReview: (id: string) => apiClient.get(`/reviews/${id}`) as Promise<IReview>,

  createReview: (body: CreateReviewPayload) =>
    apiClient.post('/reviews', body) as Promise<IReview>,

  updateReview: (id: string, body: { rating?: number; comment?: string | null }) =>
    apiClient.patch(`/reviews/${id}`, body) as Promise<IReview>,

  deleteReview: (id: string) => apiClient.delete(`/reviews/${id}`) as Promise<IReview>,
};
