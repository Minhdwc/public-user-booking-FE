'use client';

import { useMemo, useState } from 'react';
import { ImageIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface ImageGalleryProps {
  images: string[];
  alt: string;
  className?: string;
  subtitle?: string;
}

type GalleryFallbackProps = {
  alt: string;
  subtitle?: string;
  className?: string;
};

const GalleryFallback = ({ alt, subtitle, className }: GalleryFallbackProps) => (
  <div
    className={cn(
      'relative flex aspect-video w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-border/60 bg-linear-to-br from-primary/15 via-muted/80 to-emerald-50/50 dark:to-emerald-950/20',
      className,
    )}
  >
    <div
      className="pointer-events-none absolute inset-0 opacity-40"
      style={{
        backgroundImage:
          'radial-gradient(circle at 20% 20%, hsl(var(--primary) / 0.18), transparent 45%), radial-gradient(circle at 80% 80%, hsl(var(--primary) / 0.12), transparent 40%)',
      }}
    />
    <div className="relative flex flex-col items-center gap-3 px-6 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-background/90 shadow-sm ring-1 ring-border/60">
        <ImageIcon className="size-7 text-primary/70" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">{alt}</p>
        <p className="text-xs text-muted-foreground">
          {subtitle ?? 'Hình ảnh sân sẽ được cập nhật sớm'}
        </p>
      </div>
    </div>
  </div>
);

type GalleryImageProps = {
  src: string;
  alt: string;
  className?: string;
  onError: () => void;
};

const GalleryImage = ({ src, alt, className, onError }: GalleryImageProps) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img src={src} alt={alt} className={className} onError={onError} loading="lazy" />
);

export const ImageGallery = ({ images, alt, className, subtitle }: ImageGalleryProps) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [failedUrls, setFailedUrls] = useState<Set<string>>(() => new Set());

  const validImages = useMemo(
    () => images.filter((url) => url.trim().length > 0 && !failedUrls.has(url)),
    [images, failedUrls],
  );

  const markFailed = (url: string) => {
    setFailedUrls((current) => {
      if (current.has(url)) return current;
      const next = new Set(current);
      next.add(url);
      return next;
    });
  };

  if (validImages.length === 0) {
    return <GalleryFallback alt={alt} subtitle={subtitle} className={className} />;
  }

  const displayImages = validImages.slice(0, 5);

  return (
    <>
      <div className={cn('relative group', className)}>
        <div className="grid aspect-video w-full gap-2 overflow-hidden rounded-2xl md:aspect-16/7 md:grid-cols-4 md:grid-rows-2">
          {displayImages.map((image, index) => {
            const isFirst = index === 0;
            const isThird = index === 2;
            const isFifth = index === 4;

            return (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={cn(
                  'relative overflow-hidden bg-muted transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                  index > 0 ? 'hidden md:block' : 'col-span-1 row-span-1 h-full w-full',
                  isFirst && 'md:col-span-2 md:row-span-2',
                  isThird && 'md:rounded-tr-2xl',
                  isFifth && 'md:rounded-br-2xl',
                  displayImages.length === 1 && isFirst && 'md:col-span-4 md:row-span-2',
                )}
              >
                <GalleryImage
                  src={image}
                  alt={`${alt} ${index + 1}`}
                  className="h-full w-full object-cover"
                  onError={() => markFailed(image)}
                />
                {isFirst ? (
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-black/35 to-transparent" />
                ) : null}
              </button>
            );
          })}
        </div>

        {validImages.length > 5 ? (
          <button
            type="button"
            onClick={() => setActiveIndex(0)}
            className="absolute bottom-4 right-4 rounded-lg border border-white/30 bg-black/55 px-4 py-1.5 text-sm font-semibold text-white shadow-lg backdrop-blur-sm transition-colors hover:bg-black/70"
          >
            +{validImages.length - 5} ảnh
          </button>
        ) : null}
      </div>

      <Dialog open={activeIndex !== null} onOpenChange={() => setActiveIndex(null)}>
        <DialogContent className="max-w-4xl border-none bg-black p-1">
          <DialogHeader className="sr-only">
            <DialogTitle>{alt}</DialogTitle>
          </DialogHeader>
          {activeIndex !== null ? (
            <div className="relative flex min-h-64 max-h-dvh items-center justify-center">
              <GalleryImage
                src={validImages[activeIndex]}
                alt={`${alt} ${activeIndex + 1}`}
                className="max-h-full max-w-full object-contain"
                onError={() => markFailed(validImages[activeIndex])}
              />
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
};
