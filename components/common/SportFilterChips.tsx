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
    <div className={cn('flex flex-wrap gap-2', className)} role="group" aria-label="Lọc theo môn thể thao">
      {items.map((item) => {
        const active = selectedSportId === item.id || (item.id === null && !selectedSportId);
        const Icon = item.icon;
        return (
          <button
            key={item.id ?? 'all'}
            type="button"
            onClick={() => onSelect(item.id)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-all',
              active
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'border border-border/70 bg-card text-muted-foreground hover:border-primary/30 hover:bg-accent hover:text-foreground',
            )}
          >
            <Icon className="size-3.5 shrink-0" />
            {item.name}
          </button>
        );
      })}
    </div>
  );
}
