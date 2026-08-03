import { Suspense } from 'react';
import { VerifyEmailContent } from '@/components/features/auth/VerifyEmailContent';
import { Skeleton } from '@/components/ui/skeleton';

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-10 w-48 mx-auto" />
          <Skeleton className="h-48 w-full rounded-lg" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
