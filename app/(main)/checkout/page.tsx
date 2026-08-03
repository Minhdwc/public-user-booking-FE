import { Suspense } from 'react';
import { RequireAuth } from '@/components/features/auth/RequireAuth';
import { CheckoutPageContent } from '@/components/features/checkout/CheckoutPageContent';
import { PageShell } from '@/components/layout/PageShell';

export default function CheckoutPage() {
  return (
    <PageShell size="md">
      <Suspense fallback={null}>
        <RequireAuth>
          <CheckoutPageContent />
        </RequireAuth>
      </Suspense>
    </PageShell>
  );
}
