import { Suspense } from 'react';

import { AccountProfilePageContent } from '@/components/features/account/AccountProfilePageContent';
import { RequireAuth } from '@/components/features/auth/RequireAuth';
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
