import { Suspense } from 'react';
import { PageShell } from '@/components/layout/PageShell';
import { BookingsPageContent } from '@/components/booking/BookingsPageContent';

export default function BookingsPage() {
  return (
    <PageShell size="md">
      <Suspense fallback={null}>
        <BookingsPageContent />
      </Suspense>
    </PageShell>
  );
}
