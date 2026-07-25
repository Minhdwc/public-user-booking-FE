import { Suspense } from 'react';
import { FieldsPageContent } from '@/components/field/fields-page';
import { Skeleton } from '@/components/ui/skeleton';

function CourtsPageSkeleton() {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col lg:flex-row">
      <aside className="flex w-full shrink-0 flex-col bg-background lg:w-105 xl:w-110">
        <div className="sticky top-0 z-10 border-b border-border/60 bg-card/95 px-4 py-5">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="mt-2 h-7 w-40" />
          <Skeleton className="mt-4 h-11 w-full rounded-xl" />
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
          </div>
        </div>
        <div className="space-y-4 px-4 py-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm"
            >
              <Skeleton className="aspect-16/10 w-full rounded-none" />
              <div className="space-y-3 p-4">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </aside>
      <div className="hidden min-h-0 flex-1 bg-muted/40 lg:block">
        <Skeleton className="size-full rounded-none" />
      </div>
    </div>
  );
}

export default function CourtsPage() {
  return (
    <Suspense fallback={<CourtsPageSkeleton />}>
      <FieldsPageContent />
    </Suspense>
  );
}
