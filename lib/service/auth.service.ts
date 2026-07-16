import apiClient from '@/lib/api/client';
import { AccountMe, AuthTokens, LoginResponse } from '@/lib/api/types';

export const authService = {
  login: (body: { email: string; password: string }) =>
    apiClient.post('/auth/login', body) as Promise<LoginResponse>,

  register: (body: {
    name: string;
    username: string;
    email: string;
    phone: string;
    password: string;
  }) => apiClient.post('/auth/register', body) as Promise<LoginResponse>,

  logout: () => apiClient.post('/auth/logout') as Promise<{ success: boolean }>,

  refresh: (body: { refreshToken: string }) =>
    apiClient.post('/auth/refresh', body) as Promise<AuthTokens>,
};

export const accountService = {
  getMe: () => apiClient.get('/account/me') as Promise<AccountMe>,

  updateProfile: (body: { name?: string; username?: string; phone?: string; avatarUrl?: string }) =>
    apiClient.patch('/account/profile', body) as Promise<AccountMe>,

  changePassword: (body: { currentPassword: string; newPassword: string }) =>
    apiClient.patch('/account/change-password', body) as Promise<{ success: boolean }>,
};
