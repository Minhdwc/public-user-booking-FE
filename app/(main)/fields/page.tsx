import { Suspense } from 'react';
import { PageShell } from '@/components/layout/PageShell';
import { FieldsPageContent } from '@/components/field/FieldsPageContent';
import { Skeleton } from '@/components/ui/skeleton';

export default function FieldsPage() {
  return (
    <PageShell>
      <Suspense
        fallback={
          <div className="space-y-6">
            <Skeleton className="h-12 w-64" />
            <Skeleton className="h-36 w-full rounded-2xl" />
            <Skeleton className="h-44 w-full rounded-2xl" />
          </div>
        }
      >
        <FieldsPageContent />
      </Suspense>
    </PageShell>
  );
}
