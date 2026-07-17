'use client';

import { useEffect, useState } from 'react';

function formatMmSs(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function useCountdown(expiresAt?: string | null) {
  const [remainingMs, setRemainingMs] = useState(() => {
    if (!expiresAt) return 0;
    return Math.max(0, new Date(expiresAt).getTime() - Date.now());
  });

  useEffect(() => {
    if (!expiresAt) {
      setRemainingMs(0);
      return;
    }

    const tick = () => {
      setRemainingMs(Math.max(0, new Date(expiresAt).getTime() - Date.now()));
    };

    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [expiresAt]);

  const remainingSeconds = Math.ceil(remainingMs / 1000);
  const isExpired = !expiresAt || remainingMs <= 0;

  return {
    remainingMs,
    remainingSeconds,
    formatted: formatMmSs(remainingSeconds),
    isExpired,
  };
}
