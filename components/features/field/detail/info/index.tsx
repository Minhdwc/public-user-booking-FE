import Link from 'next/link';
import { ArrowUpRight, Clock, MapPin, Star, Tag } from 'lucide-react';
import { ICourt } from '@/lib/api/types';
import { formatPrice, formatVenueAddress } from '@/lib/utils/format';

export const FieldInfo = ({ court }: { court: ICourt }) => {
  const ratingAverage = court.venue?.ratingAverage;
  const ratingCount = court.venue?.ratingCount ?? 0;
  const hasRating = ratingAverage != null && ratingCount > 0;
  const venueAddress = court.venue ? formatVenueAddress(court.venue) : null;

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {court.sport?.name ? (
            <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
              {court.sport.name}
            </span>
          ) : null}
          {hasRating ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
              <Star className="size-3.5 fill-amber-400 text-amber-400" />
              {ratingAverage.toFixed(1)}
              <span className="font-normal text-muted-foreground">({ratingCount})</span>
            </span>
          ) : null}
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {court.name}
          </h1>
          {court.venue ? (
            <p className="flex items-start gap-1.5 text-sm text-muted-foreground sm:text-base">
              <MapPin className="mt-0.5 size-4 shrink-0" />
              <span>
                {court.venue.name}
                {venueAddress ? ` · ${venueAddress}` : ''}
              </span>
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <Tag className="size-3.5 text-primary" />
            Giá thuê
          </div>
          <p className="mt-2 text-2xl font-bold text-primary">
            {formatPrice(court.basePriceVnd)}
            <span className="text-sm font-normal text-muted-foreground">/giờ</span>
          </p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <Clock className="size-3.5 text-primary" />
            Tối thiểu
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">
            {court.minDurationMinutes}
            <span className="text-sm font-normal text-muted-foreground"> phút</span>
          </p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <Clock className="size-3.5 text-primary" />
            Bước giờ
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">
            {court.durationStepMinutes}
            <span className="text-sm font-normal text-muted-foreground"> phút</span>
          </p>
        </div>
      </div>

      {court.description ? (
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm sm:p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-primary">Mô tả sân</h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">{court.description}</p>
        </div>
      ) : null}

      {court.venue ? (
        <Link
          href={`/venues/${court.venue.id}`}
          className="group inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          Xem cơ sở {court.venue.name}
          <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      ) : null}
    </div>
  );
};
