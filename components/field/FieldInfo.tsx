import Link from 'next/link';
import { MapPin } from 'lucide-react';
import type { FieldWithRelations } from '@/lib/api/types';
import { formatPrice } from '@/lib/utils/format';
import { ImageGallery } from '@/components/common/ImageGallery';

interface FieldInfoProps {
  field: FieldWithRelations;
}

export function FieldInfo({ field }: FieldInfoProps) {
  return (
    <div className="space-y-6">
      <ImageGallery images={field.images} alt={field.name} />

      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold sm:text-3xl">{field.name}</h1>
          <span className="rounded-full bg-secondary px-3 py-1 text-sm font-medium">
            {field.sport.name}
          </span>
        </div>

        <p className="text-2xl font-bold text-primary">
          {formatPrice(field.price)}
          <span className="text-base font-normal text-muted-foreground"> / giờ</span>
        </p>

        {field.description ? (
          <p className="text-muted-foreground">{field.description}</p>
        ) : (
          <p className="text-sm text-muted-foreground">Chưa có mô tả cho sân này.</p>
        )}

        <div className="rounded-xl border bg-muted/30 p-4">
          <p className="text-sm font-medium text-muted-foreground">Cụm sân</p>
          <Link
            href={`/venues/${field.venue.id}`}
            className="mt-1 inline-flex items-start gap-2 font-semibold hover:text-primary"
          >
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              {field.venue.name}
              <span className="mt-0.5 block text-sm font-normal text-muted-foreground">
                {field.venue.location}
              </span>
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
