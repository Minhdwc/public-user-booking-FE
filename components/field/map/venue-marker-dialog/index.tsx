'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Clock3, LayoutGrid, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ImagePlaceholder } from '@/components/common/ImagePlaceholder';
import { Skeleton } from '@/components/ui/skeleton';
import type { Field, Sport } from '@/lib/api/types';
import { getVenueById } from '@/lib/api/venues';

export interface VenueMapPoint {
  venueId: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  fields: (Field & { sport: Sport })[];
}

interface VenueMapMarkerDialogProps {
  venue: VenueMapPoint | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatTime(value: string) {
  return value.slice(0, 5);
}

export function VenueMapMarkerDialog({ venue, open, onOpenChange }: VenueMapMarkerDialogProps) {
  const venueId = venue?.venueId;

  const venueQuery = useQuery({
    queryKey: ['venues', venueId, 'map-dialog'],
    queryFn: () => getVenueById(venueId!),
    enabled: open && Boolean(venueId),
  });

  const venueDetail = venueQuery.data;
  const fieldCount = venueDetail?.fields?.length ?? venue?.fields.length ?? 0;
  const coverImage = venueDetail?.images?.[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 overflow-hidden p-0">
        {venueQuery.isLoading ? (
          <div className="space-y-4 p-6">
            <Skeleton className="aspect-video w-full rounded-xl" />
            <Skeleton className="h-7 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ) : (
          <>
            <div className="relative aspect-video w-full overflow-hidden bg-muted">
              {coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={coverImage} alt={venueDetail?.name ?? venue?.name ?? ''} className="h-full w-full object-cover" />
              ) : (
                <ImagePlaceholder className="h-full w-full rounded-none border-0" />
              )}
            </div>

            <div className="space-y-4 p-6">
              <DialogHeader className="space-y-2 text-left">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">Chi tiết cơ sở</p>
                <DialogTitle className="pr-6 text-xl leading-tight">
                  {venueDetail?.name ?? venue?.name}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 rounded-xl border border-border/70 bg-muted/40 px-3 py-2.5">
                  <LayoutGrid className="size-4 shrink-0 text-primary" />
                  <span className="text-muted-foreground">
                    Số sân:{' '}
                    <span className="font-semibold text-foreground">{fieldCount}</span>
                  </span>
                </div>

                <p className="flex items-start gap-2 text-muted-foreground">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>{venueDetail?.location ?? venue?.location}</span>
                </p>

                {venueDetail?.openTime && venueDetail?.closeTime ? (
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <Clock3 className="size-4 shrink-0 text-primary" />
                    <span>
                      Mở cửa {formatTime(venueDetail.openTime)} – {formatTime(venueDetail.closeTime)}
                    </span>
                  </p>
                ) : null}

                {venueDetail?.description ? (
                  <p className="line-clamp-3 leading-relaxed text-muted-foreground">
                    {venueDetail.description}
                  </p>
                ) : null}
              </div>

              <Button asChild className="w-full">
                <Link href={`/venues/${venueId}`} onClick={() => onOpenChange(false)}>
                  Xem chi tiết cơ sở
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
