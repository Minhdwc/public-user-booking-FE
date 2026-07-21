import { PageShell } from '@/components/layout/PageShell';
import { VenueDetailContent } from '@/components/venue/VenueDetailContent';

interface VenueDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function VenueDetailPage({ params }: VenueDetailPageProps) {
  const { id } = await params;

  return (
    <PageShell>
      <VenueDetailContent venueId={id} />
    </PageShell>
  );
}
