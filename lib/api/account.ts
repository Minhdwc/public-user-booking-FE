import type { AccountMe } from '@/lib/api/types';
import { accountService } from '@/lib/service';

export type { AccountMe };

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

export async function getMe(): Promise<AccountMe> {
  return accountService.getMe();
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<AccountMe> {
  return accountService.updateProfile(payload);
}

export async function changePassword(
  payload: ChangePasswordPayload,
): Promise<{ success: boolean }> {
  return accountService.changePassword(payload);
}
