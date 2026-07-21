'use client';

import type { Sport } from '@/lib/api/types';
import { cn } from '@/lib/utils';

interface SportFilterChipsProps {
  sports: Sport[];
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

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={cn(
          'rounded-full border px-4 py-2 text-sm font-medium transition-all',
          !selectedSportId
            ? 'chip-active'
            : 'border-border/70 bg-card text-muted-foreground hover:border-primary/30 hover:bg-accent',
        )}
      >
        Tất cả
      </button>
      {sports.map((sport) => (
        <button
          key={sport.id}
          type="button"
          onClick={() => onSelect(sport.id)}
          className={cn(
          'rounded-full border px-4 py-2 text-sm font-medium transition-all',
          selectedSportId === sport.id
            ? 'chip-active'
            : 'border-border/70 bg-card text-muted-foreground hover:border-primary/30 hover:bg-accent',
          )}
        >
          {sport.name}
        </button>
      ))}
    </div>
  );
}
