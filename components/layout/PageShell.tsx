import { cn } from '@/lib/utils';

type PageShellSize = 'sm' | 'md' | 'lg';

const sizeClass: Record<PageShellSize, string> = {
  sm: 'max-w-3xl',
  md: 'max-w-4xl',
  lg: 'max-w-6xl',
};

interface PageShellProps {
  children: React.ReactNode;
  size?: PageShellSize;
  className?: string;
}

export function PageShell({ children, size = 'lg', className }: PageShellProps) {
  return (
    <div className={cn('mx-auto w-full px-4 py-8 sm:px-6 sm:py-10', sizeClass[size], className)}>
      {children}
    </div>
  );
}
