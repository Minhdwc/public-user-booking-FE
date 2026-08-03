'use client';

import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export function FilterSelect({ label, className, id, children, ...props }: FilterSelectProps) {
  return (
    <div className="space-y-1">
      {label ? (
        <label htmlFor={id} className="text-xs font-medium text-muted-foreground">
          {label}
        </label>
      ) : null}
      <div className="relative">
        <select
          id={id}
          className={cn(
            'h-10 w-full appearance-none rounded-xl border border-border/60 bg-background px-3 pr-9 text-sm shadow-sm outline-none transition-colors',
            'focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/20',
            'disabled:cursor-not-allowed disabled:opacity-60',
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      </div>
    </div>
  );
}
