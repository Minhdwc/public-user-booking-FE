import { Suspense } from 'react';
import { RequireAuth } from '@/components/features/auth/RequireAuth';
import { PageShell } from '@/components/layout/PageShell';
import { ChatPageContent } from '@/components/features/chat/ChatPageContent';
import { Skeleton } from '@/components/ui/skeleton';

export default function MessagesPage() {
  return (
    <PageShell>
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-lg" />}>
        <RequireAuth>
          <ChatPageContent />
        </RequireAuth>
      </Suspense>
    </PageShell>
  );
}
