'use client';

import { useState } from 'react';
import { ImagePlaceholder } from '@/components/common/ImagePlaceholder';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface ImageGalleryProps {
  images: string[];
  alt: string;
  className?: string;
}

export function ImageGallery({ images, alt, className }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const hasImages = images.length > 0;

  if (!hasImages) {
    return <ImagePlaceholder className={cn('aspect-video w-full rounded-xl', className)} />;
  }

  return (
    <>
      <div className={cn('grid gap-3 sm:grid-cols-2 lg:grid-cols-3', className)}>
        {images.map((image, index) => (
          <button
            key={`${image}-${index}`}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={cn(
              'overflow-hidden rounded-xl border bg-muted',
              index === 0 && images.length > 1 ? 'sm:col-span-2 sm:row-span-2' : '',
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt={`${alt} ${index + 1}`}
              className="aspect-video h-full w-full object-cover transition-transform hover:scale-105"
            />
          </button>
        ))}
      </div>

      <Dialog open={activeIndex !== null} onOpenChange={() => setActiveIndex(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{alt}</DialogTitle>
          </DialogHeader>
          {activeIndex !== null ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={images[activeIndex]}
              alt={`${alt} ${activeIndex + 1}`}
              className="max-h-[70vh] w-full rounded-lg object-contain"
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
