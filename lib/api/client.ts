import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { ApiError, normalizeApiErrorMessage } from '@/lib/api/errors';
import type { ApiErrorBody, ApiResponse, RefreshResponse } from '@/lib/api/types';
import { getAuthState, readTokensFromCookies } from '@/lib/stores/auth-store';

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
    url.includes('/auth/login') ||
    url.includes('/auth/register') ||
    url.includes('/auth/refresh')
  );
}

function getAccessToken() {
  return getAuthState().accessToken ?? readTokensFromCookies().accessToken;
}

function getRefreshToken() {
  return getAuthState().refreshToken ?? readTokensFromCookies().refreshToken;
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

  const redirect = `${window.location.pathname}${window.location.search}`;
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
    const message = error.response?.data?.message
      ? normalizeApiErrorMessage(error.response.data.message)
      : error.message || 'Đã xảy ra lỗi';

    if (status === 401 && originalRequest && !originalRequest._retry && !isAuthEndpoint(originalRequest.url)) {
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
