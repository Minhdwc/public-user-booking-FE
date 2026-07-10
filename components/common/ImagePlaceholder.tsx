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
        'flex flex-col items-center justify-center gap-2 bg-muted text-muted-foreground',
        className,
      )}
    >
      <ImageIcon className="h-8 w-8 opacity-50" />
      <span className="text-xs">{label}</span>
    </div>
  );
}
