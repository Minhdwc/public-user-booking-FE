import type { LoginResponse } from '@/lib/api/types';
import { authService } from '@/lib/service';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  username: string;
  email: string;
  phone: string;
  password: string;
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  return authService.login(payload);
}

export async function register(payload: RegisterPayload): Promise<LoginResponse> {
  return authService.register(payload);
}

export async function logout(): Promise<{ success: boolean }> {
  return authService.logout();
}
