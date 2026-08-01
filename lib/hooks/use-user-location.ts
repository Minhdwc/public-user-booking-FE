'use client';

import { useCallback, useState } from 'react';
import type { GeoPoint } from '@/lib/utils/geo';

type LocationStatus = 'idle' | 'locating' | 'success' | 'error';

export function useUserLocation() {
  const [location, setLocation] = useState<GeoPoint | null>(null);
  const [status, setStatus] = useState<LocationStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const applyLocation = useCallback((coords: GeoPoint) => {
    setLocation(coords);
    setStatus('success');
    setError(null);
  }, []);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Trình duyệt không hỗ trợ định vị');
      setStatus('error');
      return;
    }

    setStatus('locating');
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        applyLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        setError('Không thể lấy vị trí. Hãy bật quyền truy cập vị trí.');
        setStatus('error');
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, [applyLocation]);

  const clearLocation = useCallback(() => {
    setLocation(null);
    setStatus('idle');
    setError(null);
  }, []);

  return {
    location,
    status,
    error,
    requestLocation,
    applyLocation,
    clearLocation,
  };
}
