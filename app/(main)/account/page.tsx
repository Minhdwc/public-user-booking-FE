import { Suspense } from 'react';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { PageShell } from '@/components/layout/PageShell';
import { AccountPageContent } from '@/components/account/AccountPageContent';

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
