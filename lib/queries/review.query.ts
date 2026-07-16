'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { unwrapList } from '@/lib/api/response';
import { CreateReviewPayload, ListParams } from '@/lib/api/types';
import { reviewService } from '@/lib/service';

export const reviewKeys = {
  all: ['reviews'] as const,
  lists: () => [...reviewKeys.all, 'list'] as const,
  list: (params: ListParams = {}) => [...reviewKeys.lists(), params] as const,
  byField: (fieldId: string) => [...reviewKeys.all, 'field', fieldId] as const,
  details: () => [...reviewKeys.all, 'detail'] as const,
  detail: (id: string) => [...reviewKeys.details(), id] as const,
};

export const useReviews = (params?: ListParams) =>
  useQuery({
    queryKey: reviewKeys.list(params ?? {}),
    queryFn: async () => unwrapList(await reviewService.getReviews({ limit: 100, ...params })),
  });

export const useReviewsByField = (fieldId: string) =>
  useQuery({
    queryKey: reviewKeys.byField(fieldId),
    queryFn: async () => {
      const reviews = unwrapList(await reviewService.getReviews({ limit: 200 }));
      return reviews.filter((review) => review.fieldId === fieldId);
    },
    enabled: Boolean(fieldId),
  });

export const useCreateReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateReviewPayload) => reviewService.createReview(body),
    onSuccess: (review) => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reviewKeys.byField(review.fieldId) });
    },
  });
};
