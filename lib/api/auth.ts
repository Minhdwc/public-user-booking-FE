import apiClient from './client';
import type { LoginResponse } from './types';

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
  return apiClient.post('/auth/login', payload);
}

export async function register(payload: RegisterPayload): Promise<LoginResponse> {
  return apiClient.post('/auth/register', payload);
}

export async function logout(): Promise<{ success: boolean }> {
  return apiClient.post('/auth/logout');
}
