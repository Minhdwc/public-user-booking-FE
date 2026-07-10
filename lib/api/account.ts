import apiClient from './client';
import type { User } from './types';

export interface UpdateProfilePayload {
  name?: string;
  username?: string;
  phone?: string;
  avatarUrl?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface AccountMe extends User {
  permissions?: string[];
}

export async function getMe(): Promise<AccountMe> {
  return apiClient.get('/account/me');
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<AccountMe> {
  return apiClient.patch('/account/profile', payload);
}

export async function changePassword(payload: ChangePasswordPayload): Promise<{ success: boolean }> {
  return apiClient.patch('/account/change-password', payload);
}
