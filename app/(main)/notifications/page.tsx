import { Suspense } from 'react';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { NotificationsPageContent } from '@/components/notifications/NotificationsPageContent';
import { PageShell } from '@/components/layout/PageShell';

export default function NotificationsPage() {
  return (
    <PageShell size="md">
      <Suspense fallback={null}>
        <RequireAuth>
          <NotificationsPageContent />
        </RequireAuth>
      </Suspense>
    </PageShell>
  );
}
