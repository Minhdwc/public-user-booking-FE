import { PageShell } from '@/components/layout/PageShell';
import { FieldDetailContent } from '@/components/field/detail';

interface FieldDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function FieldDetailPage({ params }: FieldDetailPageProps) {
  const { id } = await params;

  return (
    <PageShell>
      <FieldDetailContent fieldId={id} />
    </PageShell>
  );
}
