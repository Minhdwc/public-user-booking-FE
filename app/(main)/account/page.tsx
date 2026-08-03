import { Suspense } from 'react';
import { RequireAuth } from '@/components/features/auth/RequireAuth';
import { PageShell } from '@/components/layout/PageShell';
import { AccountPageContent } from '@/components/features/account/AccountPageContent';

export default function AccountPage() {
  return (
    <PageShell size="sm">
      <Suspense fallback={null}>
        <RequireAuth>
          <AccountPageContent />
        </RequireAuth>
      </Suspense>
    </PageShell>
  );
}
