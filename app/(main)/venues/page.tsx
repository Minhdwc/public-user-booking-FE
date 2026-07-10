import { Suspense } from 'react';
import { VenuesPageContent } from '@/components/venue/VenuesPageContent';
import { Skeleton } from '@/components/ui/skeleton';

export default function VenuesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Suspense
        fallback={
          <div className="space-y-6">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-full" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="aspect-[4/3] w-full rounded-xl" />
              ))}
            </div>
          </div>
        }
      >
        <VenuesPageContent />
      </Suspense>
    </div>
  );
}
