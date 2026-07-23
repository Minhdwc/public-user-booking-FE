import { Suspense } from 'react';
import { PageShell } from '@/components/layout/PageShell';
import { ChatPageContent } from '@/components/chat/ChatPageContent';
import { Skeleton } from '@/components/ui/skeleton';

export default function MessagesPage() {
  return (
    <PageShell>
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-lg" />}>
        <ChatPageContent />
      </Suspense>
    </PageShell>
  );
}
