import { Suspense } from 'react';
import { RequireAuth } from '@/components/features/auth/RequireAuth';
import { FavoritesPageContent } from '@/components/features/favorites/FavoritesPageContent';
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
