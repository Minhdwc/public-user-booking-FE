import { PageShell } from '@/components/layout/PageShell';
import { FieldDetailContent } from '@/components/features/field/detail';

interface CourtDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CourtDetailPage({ params }: CourtDetailPageProps) {
  const { id } = await params;

  return (
    <PageShell>
      <FieldDetailContent courtId={id} />
    </PageShell>
  );
}
