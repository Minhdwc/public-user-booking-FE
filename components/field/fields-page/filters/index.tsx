'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, Heart, Search, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Sport, Venue } from '@/lib/api/types';
import type {
  FieldFilterActions,
  FieldFilterOptions,
  FieldFilterValues,
} from '@/components/field/fields-page/useFieldFilters';
import { cn } from '@/lib/utils';

interface FieldFiltersProps {
  values: FieldFilterValues;
  options: FieldFilterOptions;
  actions: FieldFilterActions;
  total: number;
}

interface ActiveFilter {
  key: string;
  label: string;
  onRemove: () => void;
}

const selectClassName =
  'h-10 w-full rounded-xl border border-border/60 bg-background px-3 text-sm shadow-sm outline-none transition-colors focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/20 disabled:opacity-60';

export function FieldFilters({ values, options, actions, total }: FieldFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { search, sportId, venueId, minPrice, maxPrice, favoritesOnly } = values;
  const { sports, venues, isLoadingSports, isLoadingVenues } = options;
  const { updateParams, clearFilters, onSearchSubmit } = actions;

  const selectedSport = useMemo(
    () => sports.find((sport: Sport) => sport.id === sportId),
    [sports, sportId],
  );
  const selectedVenue = useMemo(
    () => venues.find((venue: Venue) => venue.id === venueId),
    [venues, venueId],
  );

  const activeFilters: ActiveFilter[] = useMemo(() => {
    const filters: ActiveFilter[] = [];
    if (search) {
      filters.push({
        key: 'search',
        label: search,
        onRemove: () => updateParams({ search: null, page: null }),
      });
    }
    if (selectedSport) {
      filters.push({
        key: 'sport',
        label: selectedSport.name,
        onRemove: () => updateParams({ sport: null, page: null }),
      });
    }
    if (selectedVenue) {
      filters.push({
        key: 'venue',
        label: selectedVenue.name,
        onRemove: () => updateParams({ venue: null, page: null }),
      });
    }
    if (minPrice || maxPrice) {
      const label =
        minPrice && maxPrice
          ? `${Number(minPrice).toLocaleString('vi-VN')} – ${Number(maxPrice).toLocaleString('vi-VN')} đ`
          : minPrice
            ? `Từ ${Number(minPrice).toLocaleString('vi-VN')} đ`
            : `Đến ${Number(maxPrice).toLocaleString('vi-VN')} đ`;
      filters.push({
        key: 'price',
        label,
        onRemove: () => updateParams({ minPrice: null, maxPrice: null, page: null }),
      });
    }
    if (favoritesOnly) {
      filters.push({
        key: 'favorites',
        label: 'Yêu thích',
        onRemove: () => updateParams({ favorites: null, page: null }),
      });
    }
    return filters;
  }, [search, selectedSport, selectedVenue, minPrice, maxPrice, favoritesOnly, updateParams]);

  const hasFilters = activeFilters.length > 0;

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    onSearchSubmit(String(formData.get('search') ?? '').trim());
  };

  const handlePriceSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    updateParams({
      minPrice: String(formData.get('minPrice') ?? '').trim() || null,
      maxPrice: String(formData.get('maxPrice') ?? '').trim() || null,
      page: null,
    });
  };

  return (
    <div className="sticky top-0 z-10 border-b border-border/60 bg-card/95 backdrop-blur-md">
      <div className="flex items-end justify-between gap-3 px-4 pt-5 pb-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Khám phá</p>
          <h2 className="text-xl font-bold tracking-tight text-foreground">Danh sách sân</h2>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          {total} sân
        </span>
      </div>

      <div className="space-y-3 px-4 pb-4">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="search"
            key={search}
            defaultValue={search}
            placeholder="Tìm tên sân, khu vực..."
            className="h-11 rounded-xl border-border/60 bg-background pl-10 pr-4 shadow-sm"
          />
        </form>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label htmlFor="sport-filter" className="text-xs font-medium text-muted-foreground">
              Môn thể thao
            </label>
            <select
              id="sport-filter"
              value={sportId ?? ''}
              onChange={(event) => updateParams({ sport: event.target.value || null, page: null })}
              disabled={isLoadingSports}
              className={selectClassName}
            >
              <option value="">Tất cả</option>
              {sports.map((sport: Sport) => (
                <option key={sport.id} value={sport.id}>
                  {sport.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label htmlFor="venue-filter" className="text-xs font-medium text-muted-foreground">
              Cơ sở
            </label>
            <select
              id="venue-filter"
              value={venueId ?? ''}
              onChange={(event) => updateParams({ venue: event.target.value || null, page: null })}
              disabled={isLoadingVenues}
              className={selectClassName}
            >
              <option value="">Tất cả</option>
              {venues.map((venue: Venue) => (
                <option key={venue.id} value={venue.id}>
                  {venue.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAdvanced((prev) => !prev)}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-border/60 bg-background px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <SlidersHorizontal className="size-4" />
            Lọc thêm
            <ChevronDown className={cn('size-4 transition-transform', showAdvanced && 'rotate-180')} />
          </button>

          <button
            type="button"
            onClick={() => updateParams({ favorites: favoritesOnly ? null : '1', page: null })}
            aria-label="Lọc yêu thích"
            className={cn(
              'inline-flex size-10 shrink-0 items-center justify-center rounded-xl border transition-colors',
              favoritesOnly
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border/60 bg-background text-muted-foreground hover:bg-accent',
            )}
          >
            <Heart className={cn('size-4', favoritesOnly && 'fill-current')} />
          </button>
        </div>

        {showAdvanced ? (
          <form
            key={`${minPrice}-${maxPrice}`}
            onSubmit={handlePriceSubmit}
            className="flex items-end gap-2 rounded-xl border border-border/60 bg-muted/30 p-3"
          >
            <div className="min-w-0 flex-1 space-y-1">
              <label htmlFor="min-price" className="text-xs font-medium text-muted-foreground">
                Giá từ
              </label>
              <Input
                id="min-price"
                name="minPrice"
                type="number"
                min={0}
                defaultValue={minPrice}
                placeholder="0"
                className="h-10 rounded-lg bg-background"
              />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <label htmlFor="max-price" className="text-xs font-medium text-muted-foreground">
                Giá đến
              </label>
              <Input
                id="max-price"
                name="maxPrice"
                type="number"
                min={0}
                defaultValue={maxPrice}
                placeholder="∞"
                className="h-10 rounded-lg bg-background"
              />
            </div>
            <Button type="submit" className="h-10 shrink-0 rounded-lg px-4">
              Áp dụng
            </Button>
          </form>
        ) : null}

        {hasFilters ? (
          <div className="flex flex-wrap items-center gap-1.5">
            {activeFilters.map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={filter.onRemove}
                className="inline-flex max-w-36 items-center gap-1 rounded-full bg-primary/10 py-1 pl-2.5 pr-1 text-xs font-medium text-primary transition-colors hover:bg-primary/15"
              >
                <span className="truncate">{filter.label}</span>
                <X className="size-3 shrink-0" />
              </button>
            ))}
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
            >
              Xóa tất cả
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
