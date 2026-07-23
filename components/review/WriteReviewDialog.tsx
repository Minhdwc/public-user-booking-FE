'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { ApiError } from '@/lib/api/errors';
import { useCreateReview, useReviewEligibility } from '@/lib/queries/review.query';
import { useAuthStore } from '@/lib/stores/auth-store';
import { buildLoginUrl } from '@/lib/utils/auth-action';
import { cn } from '@/lib/utils';

interface WriteReviewDialogProps {
  fieldId: string;
}

export function WriteReviewDialog({ fieldId }: WriteReviewDialogProps) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const createMutation = useCreateReview();
  const eligibilityQuery = useReviewEligibility(fieldId, isHydrated && isAuthenticated);

  const handleOpen = (next: boolean) => {
    if (next && isHydrated && !isAuthenticated) {
      toast.message('Đăng nhập để viết đánh giá');
      router.push(buildLoginUrl(`/fields/${fieldId}`));
      return;
    }

    if (next && eligibilityQuery.data && !eligibilityQuery.data.canReview) {
      toast.message(eligibilityQuery.data.message ?? 'Bạn chưa thể viết đánh giá cho sân này');
      return;
    }

    setOpen(next);
    if (!next) {
      setRating(5);
      setComment('');
    }
  };

  const handleSubmit = async () => {
    try {
      await createMutation.mutateAsync({
        fieldId,
        rating,
        comment: comment.trim() || undefined,
      });
      toast.success('Đã gửi đánh giá');
      handleOpen(false);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'Không gửi được đánh giá');
    }
  };

  if (isHydrated && isAuthenticated && eligibilityQuery.isLoading) {
    return <Skeleton className="h-9 w-28 rounded-md" />;
  }

  const eligibility = eligibilityQuery.data;
  const isBlocked = isHydrated && isAuthenticated && eligibility && !eligibility.canReview;

  return (
    <div className="flex flex-col items-end gap-1">
      {isBlocked ? (
        <p className="max-w-xs text-right text-xs text-muted-foreground">{eligibility.message}</p>
      ) : null}

      <Dialog open={open} onOpenChange={handleOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline" className="rounded-md" disabled={Boolean(isBlocked)}>
            Viết đánh giá
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Viết đánh giá</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Chia sẻ trải nghiệm của bạn sau khi đã đặt và thanh toán sân thành công.
          </p>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Số sao</Label>
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, index) => {
                  const value = index + 1;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRating(value)}
                      className="rounded-md p-1.5 transition-colors hover:bg-accent"
                      aria-label={`${value} sao`}
                    >
                      <Star
                        className={cn(
                          'h-6 w-6',
                          value <= rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-muted-foreground/40',
                        )}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="review-comment">Nhận xét</Label>
              <textarea
                id="review-comment"
                rows={4}
                placeholder="Viết nhận xét (không bắt buộc)"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                className="flex min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" className="rounded-md" onClick={() => handleOpen(false)}>
              Huỷ
            </Button>
            <Button
              type="button"
              className="rounded-md"
              disabled={createMutation.isPending}
              onClick={() => void handleSubmit()}
            >
              {createMutation.isPending ? 'Đang gửi…' : 'Gửi đánh giá'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
