import { Suspense } from 'react';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { FavoritesPageContent } from '@/components/favorites/FavoritesPageContent';
import { PageShell } from '@/components/layout/PageShell';

export default function FavoritesPage() {
  return (
    <PageShell>
      <Suspense fallback={null}>
        <RequireAuth>
          <FavoritesPageContent />
        </RequireAuth>
      </Suspense>
    </PageShell>
  );
}
