import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { ApiError, normalizeApiErrorMessage } from '@/lib/api/errors';
import type { ApiErrorBody, ApiResponse, RefreshResponse } from '@/lib/api/types';
import { getAuthState, readTokensFromStorage } from '@/lib/stores/auth-store';

const baseURL = process.env.NEXT_PUBLIC_API_URL;

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let refreshPromise: Promise<RefreshResponse> | null = null;

function isAuthEndpoint(url?: string) {
  if (!url) return false;
  return (
    url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/refresh')
  );
}

function getAccessToken() {
  return getAuthState().accessToken ?? readTokensFromStorage().accessToken;
}

function getRefreshToken() {
  return getAuthState().refreshToken ?? readTokensFromStorage().refreshToken;
}

async function refreshAccessToken(): Promise<RefreshResponse> {
  const { setTokens } = getAuthState();
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    throw new ApiError(401, 'Phiên đăng nhập đã hết hạn');
  }

  const response = await axios.post<ApiResponse<RefreshResponse>>(
    `${baseURL}/auth/refresh`,
    { refreshToken },
    { headers: { 'Content-Type': 'application/json' } },
  );

  const tokens = response.data.data;
  setTokens(tokens.accessToken, tokens.refreshToken);
  return tokens;
}

function getRefreshPromise() {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

function redirectToLogin() {
  if (typeof window === 'undefined') return;

  const pathname = window.location.pathname;
  if (pathname === '/login' || pathname === '/register') return;

  const protectedPrefixes = ['/bookings', '/account', '/chat'];
  const isProtected = protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  if (!isProtected) return;

  const redirect = `${pathname}${window.location.search}`;
  const loginUrl = `/login?redirect=${encodeURIComponent(redirect)}`;
  window.location.href = loginUrl;
}

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const accessToken = getAccessToken();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response.data.data,
  async (error: AxiosError<ApiErrorBody>) => {
    const status = error.response?.status;
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // No HTTP response → server down / CORS / wrong NEXT_PUBLIC_API_URL
    if (!error.response) {
      const networkMessage = !baseURL
        ? 'Thiếu NEXT_PUBLIC_API_URL'
        : error.code === 'ECONNABORTED'
          ? 'Máy chủ API phản hồi quá chậm'
          : `Không kết nối được API (${baseURL}). Kiểm tra backend đang chạy.`;
      return Promise.reject(new ApiError(0, networkMessage));
    }

    const message = error.response.data?.message
      ? normalizeApiErrorMessage(error.response.data.message)
      : error.message || 'Đã xảy ra lỗi';

    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthEndpoint(originalRequest.url)
    ) {
      originalRequest._retry = true;

      try {
        const tokens = await getRefreshPromise();
        originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
        return apiClient(originalRequest);
      } catch {
        getAuthState().clearAuth();
        redirectToLogin();
        return Promise.reject(new ApiError(401, 'Phiên đăng nhập đã hết hạn'));
      }
    }

    return Promise.reject(new ApiError(status ?? 500, message));
  },
);

export default apiClient;
