
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

export const login = (payload: LoginPayload) => {
  return authService.login(payload);
}

export const register = (payload: RegisterPayload) => {
  return authService.register(payload);
}

export const logout = () => {
  return authService.logout();
}

export const verifyEmail = (token: string) => {
  return authService.verifyEmail({ token });
}

export const resendVerifyEmail = () => {
  return authService.resendVerifyEmail();
}
