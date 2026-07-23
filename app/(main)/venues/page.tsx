import { Suspense } from 'react';
import { PageShell } from '@/components/layout/PageShell';
import { VenuesPageContent } from '@/components/venue/VenuesPageContent';
import { Skeleton } from '@/components/ui/skeleton';

export default function VenuesPage() {
  return (
    <PageShell>
      <Suspense
        fallback={
          <div className="space-y-6">
            <Skeleton className="h-12 w-64" />
            <Skeleton className="h-28 w-full rounded-lg" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-72 w-full rounded-lg" />
              ))}
            </div>
          </div>
        }
      >
        <VenuesPageContent />
      </Suspense>
    </PageShell>
  );
}
