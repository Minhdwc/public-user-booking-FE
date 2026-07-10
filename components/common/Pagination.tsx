import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PaginationProps {
  page: number;
  hasNext: boolean;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ page, hasNext, onPageChange, className }: PaginationProps) {
  const hasPrev = page > 1;

  if (!hasPrev && !hasNext) return null;

  return (
    <div className={cn('flex items-center justify-center gap-3', className)}>
      <Button
        variant="outline"
        size="sm"
        disabled={!hasPrev}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft className="h-4 w-4" />
        Trước
      </Button>
      <span className="text-sm text-muted-foreground">Trang {page}</span>
      <Button
        variant="outline"
        size="sm"
        disabled={!hasNext}
        onClick={() => onPageChange(page + 1)}
      >
        Sau
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
