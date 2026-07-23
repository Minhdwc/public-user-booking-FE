'use client';

import { useState } from 'react';
import { LocateFixed, Minus, Plus } from 'lucide-react';
import { useMap } from 'react-leaflet';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface MapControlsProps {
  onLocationFound: (location: [number, number]) => void;
  className?: string;
}

export function MapControls({ onLocationFound, className }: MapControlsProps) {
  const map = useMap();
  const [locating, setLocating] = useState(false);

  const handleLocate = () => {
    if (!navigator.geolocation) {
      toast.error('Trình duyệt không hỗ trợ định vị');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: [number, number] = [
          position.coords.latitude,
          position.coords.longitude,
        ];
        map.setView(location, 14);
        onLocationFound(location);
        setLocating(false);
        toast.success('Đã tìm thấy vị trí của bạn');
      },
      () => {
        setLocating(false);
        toast.error('Không thể lấy vị trí. Hãy bật quyền truy cập vị trí.');
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <div className={cn('absolute right-4 top-4 z-[1000] flex flex-col gap-2', className)}>
      <button
        type="button"
        onClick={() => map.zoomIn()}
        className="inline-flex size-10 items-center justify-center rounded-lg border border-border/70 bg-card text-foreground shadow-md transition-colors hover:bg-accent"
        aria-label="Phóng to"
      >
        <Plus className="size-4" />
      </button>
      <button
        type="button"
        onClick={() => map.zoomOut()}
        className="inline-flex size-10 items-center justify-center rounded-lg border border-border/70 bg-card text-foreground shadow-md transition-colors hover:bg-accent"
        aria-label="Thu nhỏ"
      >
        <Minus className="size-4" />
      </button>
      <button
        type="button"
        onClick={handleLocate}
        disabled={locating}
        className="inline-flex size-10 items-center justify-center rounded-lg border border-border/70 bg-card text-foreground shadow-md transition-colors hover:bg-accent disabled:opacity-60"
        aria-label="Vị trí của tôi"
      >
        <LocateFixed className={cn('size-4', locating && 'animate-pulse text-primary')} />
      </button>
    </div>
  );
}
