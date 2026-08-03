'use client';

import { FormEvent } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  defaultValue?: string;
  placeholder?: string;
  submitLabel?: string;
  onSubmit: (query: string) => void;
  className?: string;
}

export function SearchBar({
  defaultValue = '',
  placeholder = 'Tìm kiếm...',
  submitLabel = 'Tìm kiếm',
  onSubmit,
  className,
}: SearchBarProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    onSubmit(String(formData.get('search') ?? '').trim());
  };

  return (
    <form
      key={defaultValue}
      onSubmit={handleSubmit}
      className={cn('flex flex-col gap-3 sm:flex-row', className)}
    >
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          name="search"
          defaultValue={defaultValue}
          placeholder={placeholder}
          className="h-11 rounded-lg border-border/70 bg-card pl-10 shadow-sm"
        />
      </div>
      <Button type="submit" className="h-11 rounded-lg px-6 shadow-sm">
        {submitLabel}
      </Button>
    </form>
  );
}
