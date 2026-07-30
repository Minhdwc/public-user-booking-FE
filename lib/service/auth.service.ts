import apiClient from '@/lib/api/client';
import type { IUser, RefreshResponse } from '@/lib/api/types';

export interface AuthSession {
  user: IUser;
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  login: (body: { email: string; password: string }) =>
    apiClient.post('/auth/login', body) as Promise<AuthSession>,

  register: (body: {
    name: string;
    username: string;
    email: string;
    phone: string;
    password: string;
  }) => apiClient.post('/auth/register', body) as Promise<AuthSession>,

  logout: () => apiClient.post('/auth/logout') as Promise<{ success: boolean }>,

  refresh: (body: { refreshToken: string }) =>
    apiClient.post('/auth/refresh', body) as Promise<RefreshResponse>,

  verifyEmail: (body: { token: string }) =>
    apiClient.post('/auth/verify-email', body) as Promise<{ success: boolean }>,

  resendVerifyEmail: () => apiClient.post('/auth/resend-verify') as Promise<{ success: boolean }>,
};

export const accountService = {
  getMe: () => apiClient.get('/account/me') as Promise<IUser>,

  updateProfile: (body: { name?: string; username?: string; phone?: string; avatarUrl?: string }) =>
    apiClient.patch('/account/profile', body) as Promise<IUser>,

  changePassword: (body: { currentPassword: string; newPassword: string }) =>
    apiClient.patch('/account/change-password', body) as Promise<{ success: boolean }>,
};
