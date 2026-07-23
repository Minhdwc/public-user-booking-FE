'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { unwrapList } from '@/lib/api/response';
import { CreateReviewPayload, ListParams } from '@/lib/api/types';
import { reviewService } from '@/lib/service';

export const reviewKeys = {
  all: ['reviews'] as const,
  lists: () => [...reviewKeys.all, 'list'] as const,
  list: (params: ListParams = {}) => [...reviewKeys.lists(), params] as const,
  byVenue: (venueId: string) => [...reviewKeys.all, 'venue', venueId] as const,
  eligibility: (venueId: string) => [...reviewKeys.all, 'eligibility', venueId] as const,
  details: () => [...reviewKeys.all, 'detail'] as const,
  detail: (id: string) => [...reviewKeys.details(), id] as const,
};

export const useReviews = (params?: ListParams) =>
  useQuery({
    queryKey: reviewKeys.list(params ?? {}),
    queryFn: async () => unwrapList(await reviewService.getReviews({ limit: 100, ...params })),
  });

export const useReviewsByVenue = (venueId: string) =>
  useQuery({
    queryKey: reviewKeys.byVenue(venueId),
    queryFn: async () => unwrapList(await reviewService.getReviews({ venueId, limit: 200 })),
    enabled: Boolean(venueId),
  });

export const useCreateReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateReviewPayload) => reviewService.createReview(body),
    onSuccess: (review, variables) => {
      const venueId = review?.venueId ?? variables.venueId;
      queryClient.invalidateQueries({ queryKey: reviewKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reviewKeys.byVenue(venueId) });
      queryClient.invalidateQueries({ queryKey: reviewKeys.eligibility(venueId) });
    },
  });
};

export const useReviewEligibility = (venueId: string, enabled = true) =>
  useQuery({
    queryKey: reviewKeys.eligibility(venueId),
    queryFn: () => reviewService.getReviewEligibility(venueId),
    enabled: Boolean(venueId) && enabled,
  });
