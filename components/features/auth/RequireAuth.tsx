'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';

interface RequireAuthProps {
  children: React.ReactNode;
}

export function RequireAuth({ children }: RequireAuthProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isAuthenticated, isHydrated, isSessionReady } = useAuthStore();

  useEffect(() => {
    if (isHydrated && isSessionReady && !isAuthenticated) {
      const search = searchParams.toString();
      const redirect = `${pathname}${search ? `?${search}` : ''}`;
      router.replace(`/login?redirect=${encodeURIComponent(redirect)}`);
    }
  }, [isAuthenticated, isHydrated, isSessionReady, pathname, router, searchParams]);

  if (!isHydrated || !isSessionReady || !isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
