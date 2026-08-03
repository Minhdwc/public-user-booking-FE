import { Suspense } from 'react';
import { RequireAuth } from '@/components/features/auth/RequireAuth';
import { PageShell } from '@/components/layout/PageShell';
import { BookingsPageContent } from '@/components/features/booking/BookingsPageContent';

export default function BookingsPage() {
  return (
    <PageShell size="md">
      <Suspense fallback={null}>
        <RequireAuth>
          <BookingsPageContent />
        </RequireAuth>
      </Suspense>
    </PageShell>
  );
}
