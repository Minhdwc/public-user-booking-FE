import { Suspense } from 'react';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { CheckoutPageContent } from '@/components/checkout/CheckoutPageContent';
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
