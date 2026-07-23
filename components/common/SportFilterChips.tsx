'use client';

import { Dumbbell, LayoutGrid } from 'lucide-react';
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
      <div className={cn('flex gap-3 overflow-x-auto pb-2', className)}>
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-11 w-28 animate-pulse rounded-md bg-muted" />
        ))}
      </div>
    );
  }

  if (sports.length === 0) return null;

  const items = [{ id: null, name: 'Tất cả', icon: LayoutGrid }, ...sports.map((s) => ({ ...s, icon: Dumbbell }))];

  return (
    <div className={cn('flex gap-3 overflow-x-auto pb-2', className)}>
      {items.map((item) => {
        const active = selectedSportId === item.id || (item.id === null && !selectedSportId);
        const Icon = item.icon;
        return (
          <button
            key={item.id ?? 'all'}
            type="button"
            onClick={() => onSelect(item.id)}
            className={cn(
              'flex shrink-0 items-center gap-2 px-5 py-2.5 text-sm font-semibold transition-colors rounded-md',
              active
                ? 'bg-primary text-primary-foreground'
                : 'border border-border/70 bg-card text-muted-foreground hover:border-primary/30 hover:bg-accent',
            )}
          >
            <Icon className="size-4" />
            {item.name}
          </button>
        );
      })}
    </div>
  );
}
