'use client';

import { Dumbbell, LayoutGrid } from 'lucide-react';
import type { ISport } from '@/lib/api/types';
import { cn } from '@/lib/utils';

interface SportFilterChipsProps {
  sports: ISport[];
  selectedSportId?: string | null;
  onSelect: (sportId: string | null) => void;
  isLoading?: boolean;
  className?: string;
}

export function SportFilterChips({
  sports,
  selectedSportId,
  onSelect,
  isLoading,
  className,
}: SportFilterChipsProps) {
  if (isLoading) {
    return (
      <div className={cn('flex flex-wrap gap-2', className)}>
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-9 w-24 animate-pulse rounded-full bg-muted" />
        ))}
      </div>
    );
  }

  if (sports.length === 0) return null;

  const items = [
    { id: null, name: 'Tất cả', icon: LayoutGrid },
    ...sports.map((sport) => ({ ...sport, icon: Dumbbell })),
  ];

  return (
    <div
      className={cn('flex flex-wrap gap-2', className)}
      role="group"
      aria-label="Lọc theo môn thể thao"
    >
      {items.map((item) => {
        const active = selectedSportId === item.id || (item.id === null && !selectedSportId);
        const Icon = item.icon;
        return (
          <button
            key={item.id ?? 'all'}
            type="button"
            onClick={() => onSelect(item.id)}
            className={cn(
              'inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs md:text-sm font-semibold transition-all duration-200 cursor-pointer',
              active
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 dark:bg-emerald-500 dark:text-emerald-950 font-bold scale-[1.02]'
                : 'border border-border/70 bg-card/90 text-muted-foreground hover:border-emerald-500/40 hover:bg-emerald-550/5 hover:text-foreground hover:shadow-xs',
            )}
          >
            <Icon
              className={cn(
                'size-4 shrink-0',
                active
                  ? 'text-white dark:text-emerald-950'
                  : 'text-emerald-600 dark:text-emerald-400',
              )}
            />
            {item.name}
          </button>
        );
      })}
    </div>
  );
}
