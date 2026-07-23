'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';

interface GuestOnlyProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function GuestOnly({ children, redirectTo = '/' }: GuestOnlyProps) {
  const router = useRouter();
  const { isAuthenticated, isHydrated, isSessionReady } = useAuthStore();

  useEffect(() => {
    if (isHydrated && isSessionReady && isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [isAuthenticated, isHydrated, isSessionReady, redirectTo, router]);

  if (!isHydrated || !isSessionReady || isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
