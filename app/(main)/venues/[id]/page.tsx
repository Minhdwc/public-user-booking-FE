import { VenueDetailContent } from '@/components/venue/VenueDetailContent';

interface VenueDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function VenueDetailPage({ params }: VenueDetailPageProps) {
  const { id } = await params;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <VenueDetailContent venueId={id} />
    </div>
  );
}
