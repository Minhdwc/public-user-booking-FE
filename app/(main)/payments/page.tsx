import { Suspense } from 'react';
import { PageShell } from '@/components/layout/PageShell';
import { PaymentsResultContent } from '@/components/payment/PaymentsResultContent';
import { Skeleton } from '@/components/ui/skeleton';

export default function PaymentsPage() {
  return (
    <PageShell size="sm">
      <Suspense fallback={<Skeleton className="h-48 w-full rounded-lg" />}>
        <PaymentsResultContent />
      </Suspense>
    </PageShell>
  );
}
