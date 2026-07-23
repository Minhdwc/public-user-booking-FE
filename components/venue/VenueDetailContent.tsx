'use client';

import { useQuery } from '@tanstack/react-query';
import { MapPin } from 'lucide-react';
import { BackLink } from '@/components/common/BackLink';
import { ErrorState } from '@/components/common/ErrorState';
import { FieldCard } from '@/components/field/FieldCard';
import { VenueGallery } from '@/components/venue/VenueGallery';
import { Skeleton } from '@/components/ui/skeleton';
import { getVenueById } from '@/lib/api/venues';

interface VenueDetailContentProps {
  venueId: string;
}

export function VenueDetailContent({ venueId }: VenueDetailContentProps) {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['venues', venueId],
    queryFn: () => getVenueById(venueId),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="aspect-video w-full rounded-md" />
        <Skeleton className="h-40 w-full rounded-md" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <ErrorState
        title="Không tìm thấy cơ sở"
        message={error instanceof Error ? error.message : 'Cơ sở không tồn tại hoặc đã bị ẩn'}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-10">
      <div className="space-y-4">
        <BackLink href="/venues" label="Quay lại danh sách cơ sở" />
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Cơ sở</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{data.name}</h1>
          <p className="mt-3 flex items-start gap-2 text-muted-foreground">
            <MapPin className="mt-0.5 size-4 shrink-0" />
            {data.location}
          </p>
        </div>

        <VenueGallery images={data.images ?? []} venueName={data.name} />

        {data.description ? (
          <p className="max-w-3xl leading-relaxed text-muted-foreground">{data.description}</p>
        ) : (
          <p className="text-sm text-muted-foreground">Chưa có mô tả cho cơ sở này.</p>
        )}
      </div>

      <section className="space-y-5">
        <div>
          <h2 className="text-xl font-bold text-foreground">Danh sách sân</h2>
          <p className="text-sm text-muted-foreground">{data.fields?.length ?? 0} sân đang hoạt động</p>
        </div>

        {!data.fields?.length ? (
          <div className="surface-muted px-6 py-12 text-center text-muted-foreground">
            Cơ sở này chưa có sân active nào.
          </div>
        ) : (
          <div className="space-y-4">
            {data.fields
              .filter((field) => field.sport)
              .map((field) => (
                <FieldCard key={field.id} field={{ ...field, sport: field.sport! }} />
              ))}
          </div>
        )}
      </section>
    </div>
  );
}
