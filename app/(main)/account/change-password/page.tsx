import { Suspense } from 'react';

import { AccountChangePasswordPageContent } from '@/components/account/AccountChangePasswordPageContent';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { PageShell } from '@/components/layout/PageShell';

export default function AccountChangePasswordPage() {
  return (
    <PageShell size="sm">
      <Suspense fallback={null}>
        <RequireAuth>
          <AccountChangePasswordPageContent />
        </RequireAuth>
      </Suspense>
    </PageShell>
  );
}
