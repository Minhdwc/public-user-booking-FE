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
      <ImageGallery images={field.images ?? []} alt={field.name} />

      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-heading sm:text-4xl">{field.name}</h1>
          {field.sport?.name ? (
            <span className="rounded-full bg-secondary px-3 py-1 text-sm font-semibold text-secondary-foreground">
              {field.sport.name}
            </span>
          ) : null}
        </div>

        <p className="text-3xl font-bold text-primary">
          {formatPrice(field.price)}
          <span className="text-base font-normal text-muted-foreground"> / giờ</span>
        </p>

        {field.description ? (
          <p className="leading-relaxed text-muted-foreground">{field.description}</p>
        ) : (
          <p className="text-sm text-muted-foreground">Chưa có mô tả cho sân này.</p>
        )}

        {field.venue ? (
          <div className="surface-card p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Cơ sở</p>
            <Link
              href={`/venues/${field.venue.id}`}
              className="mt-2 inline-flex items-start gap-2 font-semibold text-heading hover:text-primary"
            >
              <MapPin className="mt-0.5 size-4 shrink-0" />
              <span>
                {field.venue.name}
                <span className="mt-1 block text-sm font-normal text-muted-foreground">
                  {field.venue.location}
                </span>
              </span>
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
