import { Suspense } from 'react';

import { AccountProfilePageContent } from '@/components/account/AccountProfilePageContent';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { PageShell } from '@/components/layout/PageShell';

export default function AccountProfilePage() {
  return (
    <PageShell size="sm">
      <Suspense fallback={null}>
        <RequireAuth>
          <AccountProfilePageContent />
        </RequireAuth>
      </Suspense>
    </PageShell>
  );
}
