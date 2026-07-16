'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { unwrapList } from '@/lib/api/response';
import { ListParams } from '@/lib/api/types';
import { accountService, authService, sportService, uploadService } from '@/lib/service';

export const sportKeys = {
  all: ['sports'] as const,
  lists: () => [...sportKeys.all, 'list'] as const,
  list: (params: ListParams = {}) => [...sportKeys.lists(), params] as const,
  details: () => [...sportKeys.all, 'detail'] as const,
  detail: (id: string) => [...sportKeys.details(), id] as const,
};

export const accountKeys = {
  all: ['account'] as const,
  me: () => [...accountKeys.all, 'me'] as const,
};

export const useSports = (params?: ListParams) =>
  useQuery({
    queryKey: sportKeys.list(params ?? {}),
    queryFn: async () => unwrapList(await sportService.getSports({ limit: 100, ...params })),
  });

export const useSport = (id: string) =>
  useQuery({
    queryKey: sportKeys.detail(id),
    queryFn: () => sportService.getSport(id),
    enabled: Boolean(id),
  });

export const useMe = (enabled = true) =>
  useQuery({
    queryKey: accountKeys.me(),
    queryFn: () => accountService.getMe(),
    enabled,
  });

export const useLogin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authService.login,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountKeys.all });
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authService.register,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountKeys.all });
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      queryClient.clear();
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: accountService.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountKeys.me() });
    },
  });
};

export const useChangePassword = () =>
  useMutation({
    mutationFn: accountService.changePassword,
  });

export const useUploadFile = () =>
  useMutation({
    mutationFn: ({
      file,
      folder,
    }: {
      file: File;
      folder?: Parameters<typeof uploadService.upload>[1];
    }) => uploadService.upload(file, folder),
  });
