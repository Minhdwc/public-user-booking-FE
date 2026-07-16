'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { MapPin } from 'lucide-react';
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
        <Skeleton className="aspect-video w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <ErrorState
        title="Không tìm thấy cụm sân"
        message={error instanceof Error ? error.message : 'Cụm sân không tồn tại hoặc đã bị ẩn'}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-10">
      <div className="space-y-4">
        <div>
          <Link href="/venues" className="text-sm text-primary hover:underline">
            ← Quay lại danh sách
          </Link>
          <h1 className="mt-2 text-2xl font-bold sm:text-3xl">{data.name}</h1>
          <p className="mt-2 flex items-start gap-2 text-muted-foreground">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
            {data.location}
          </p>
        </div>

        <VenueGallery images={data.images ?? []} venueName={data.name} />

        {data.description ? (
          <p className="text-muted-foreground">{data.description}</p>
        ) : (
          <p className="text-sm text-muted-foreground">Chưa có mô tả cho cụm sân này.</p>
        )}
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Danh sách sân</h2>
          <p className="text-sm text-muted-foreground">
            {data.fields?.length ?? 0} sân đang hoạt động
          </p>
        </div>

        {!data.fields?.length ? (
          <p className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
            Cụm sân này chưa có sân active nào.
          </p>
        ) : (
          <div className="space-y-4">
            {data.fields
              .filter((field) => field.sport)
              .map((field) => (
                <FieldCard key={field.id} field={field as typeof field & { sport: NonNullable<typeof field.sport> }} />
              ))}
          </div>
        )}
      </section>
    </div>
  );
}
