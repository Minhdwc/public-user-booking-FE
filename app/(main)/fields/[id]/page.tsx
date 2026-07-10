import { FieldDetailContent } from '@/components/field/FieldDetailContent';

interface FieldDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function FieldDetailPage({ params }: FieldDetailPageProps) {
  const { id } = await params;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <FieldDetailContent fieldId={id} />
    </div>
  );
}
