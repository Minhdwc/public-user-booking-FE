import Link from 'next/link';
import { ArrowUpRight, Clock, MapPin, Tag } from 'lucide-react';
import type { FieldWithRelations } from '@/lib/api/types';
import { formatPrice } from '@/lib/utils/format';
import { ImageGallery } from '@/components/common/ImageGallery';

interface FieldInfoProps {
  field: FieldWithRelations;
}

export function FieldInfo({ field }: FieldInfoProps) {
  return (
    <div className="space-y-8">
      <ImageGallery images={field.images ?? []} alt={field.name} />

      <div className="space-y-6">
        <div className="space-y-3">
          {field.sport?.name ? (
            <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
              {field.sport.name}
            </span>
          ) : null}
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{field.name}</h1>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <Tag className="size-3.5 text-primary" />
              Giá thuê
            </div>
            <p className="mt-2 text-2xl font-bold text-primary">
              {formatPrice(field.price)}
              <span className="text-sm font-normal text-muted-foreground">/giờ</span>
            </p>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <Clock className="size-3.5 text-primary" />
              Thời lượng tối thiểu
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">
              {field.minDurationMinutes}
              <span className="text-sm font-normal text-muted-foreground"> phút</span>
            </p>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <Clock className="size-3.5 text-primary" />
              Bước thời gian
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">
              {field.durationStepMinutes}
              <span className="text-sm font-normal text-muted-foreground"> phút</span>
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-muted/30 p-5 sm:p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-primary">Mô tả sân</h2>
          {field.description ? (
            <p className="mt-3 leading-relaxed text-muted-foreground">{field.description}</p>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">Chưa có mô tả cho sân này.</p>
          )}
        </div>

        {field.venue ? (
          <Link
            href={`/venues/${field.venue.id}`}
            className="group flex items-center justify-between gap-4 rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
          >
            <div className="min-w-0 space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">Thuộc cơ sở</p>
              <p className="truncate text-lg font-semibold text-foreground group-hover:text-primary">
                {field.venue.name}
              </p>
              <p className="flex items-start gap-1.5 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 size-4 shrink-0" />
                <span className="line-clamp-2">{field.venue.location}</span>
              </p>
            </div>
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <ArrowUpRight className="size-5" />
            </span>
          </Link>
        ) : null}
      </div>
    </div>
  );
}
