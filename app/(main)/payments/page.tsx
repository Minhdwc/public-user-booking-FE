import { Suspense } from 'react';
import { PaymentsResultContent } from '@/components/payment/PaymentsResultContent';
import { Skeleton } from '@/components/ui/skeleton';

export default function PaymentsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <Suspense fallback={<Skeleton className="h-48 w-full" />}>
        <PaymentsResultContent />
      </Suspense>
    </div>
  );
}
