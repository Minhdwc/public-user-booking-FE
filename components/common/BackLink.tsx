import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BackLinkProps {
  href: string;
  label: string;
  className?: string;
}

export function BackLink({ href, label, className }: BackLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80',
        className,
      )}
    >
      <ChevronLeft className="size-4" />
      {label}
    </Link>
  );
}
