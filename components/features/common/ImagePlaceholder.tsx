import { ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImagePlaceholderProps {
  className?: string;
  label?: string;
}

export function ImagePlaceholder({ className, label = 'Chưa có ảnh' }: ImagePlaceholderProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2 border border-dashed border-border/70 bg-muted/60 text-muted-foreground',
        className,
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-background/80">
        <ImageIcon className="size-5 opacity-60" />
      </div>
      <span className="text-xs font-medium">{label}</span>
    </div>
  );
}
