'use client';

import { useEffect } from 'react';
import { accountService } from '@/lib/service';
import { useAuthStore } from '@/lib/stores/auth-store';

export function AuthHydrator() {
  const updateUser = useAuthStore((state) => state.updateUser);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  useEffect(() => {
    const { accessToken, refreshToken, user, isSessionReady } = useAuthStore.getState();
    if (isSessionReady) return;

    if (!accessToken || !refreshToken) {
      useAuthStore.setState({ isSessionReady: true });
      return;
    }

    if (user) {
      useAuthStore.setState({ isSessionReady: true });
      return;
    }

    accountService
      .getMe()
      .then((me) => {
        updateUser(me);
        useAuthStore.setState({ isSessionReady: true });
      })
      .catch(() => clearAuth());
  }, [clearAuth, updateUser]);

  return null;
}
