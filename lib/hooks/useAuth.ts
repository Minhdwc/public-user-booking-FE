'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import * as authApi from '@/lib/api/auth';
import { ApiError } from '@/lib/api/errors';
import { favoriteKeys } from '@/lib/queries/favorites.query';
import { useAuthStore } from '@/lib/stores/auth-store';
import { getSafeRedirectPath } from '@/lib/utils/redirect';

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const loginMutation = useMutation({ mutationFn: authApi.login });
  const registerMutation = useMutation({ mutationFn: authApi.register });
  const logoutMutation = useMutation({ mutationFn: authApi.logout });

  const login = async (payload: authApi.LoginPayload, redirectTo?: string) => {
    const data = await loginMutation.mutateAsync(payload);
    setAuth(data.user, data.accessToken, data.refreshToken);
    await queryClient.invalidateQueries({ queryKey: favoriteKeys.summary() });
    toast.success('Đăng nhập thành công');
    router.replace(getSafeRedirectPath(redirectTo));
    return data;
  };

  const register = async (payload: authApi.RegisterPayload, redirectTo?: string) => {
    const data = await registerMutation.mutateAsync(payload);
    setAuth(data.user, data.accessToken, data.refreshToken);
    await queryClient.invalidateQueries({ queryKey: favoriteKeys.summary() });
    toast.success('Đăng ký thành công');
    router.replace(getSafeRedirectPath(redirectTo));
    return data;
  };

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } finally {
      clearAuth();
      queryClient.removeQueries({ queryKey: favoriteKeys.all });
      toast.success('Đã đăng xuất');
      router.replace('/login');
    }
  };

  return {
    login,
    register,
    logout,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    getApiErrorMessage: (error: unknown) =>
      error instanceof ApiError ? error.message : 'Đã xảy ra lỗi',
  };
}
