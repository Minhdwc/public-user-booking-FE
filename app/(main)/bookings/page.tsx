import { Suspense } from 'react';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { PageShell } from '@/components/layout/PageShell';
import { BookingsPageContent } from '@/components/booking/BookingsPageContent';

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
