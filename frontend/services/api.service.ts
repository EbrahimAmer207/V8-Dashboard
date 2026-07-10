import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { readStoredAuth, useAuthStore } from '@/store';

const REMOTE_API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1').replace(/\/$/, '');

class ApiService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: REMOTE_API,
    });

    this.axiosInstance.interceptors.request.use(
      (config) => {
        if (typeof window !== 'undefined') {
          config.baseURL = REMOTE_API;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    this.axiosInstance.interceptors.request.use(
      (config) => {
        config.headers = config.headers || {};
        const state = useAuthStore.getState();
        const storedAuth = readStoredAuth();
        const accessToken = state.accessToken || storedAuth?.accessToken;
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // Add response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        const reqUrl = originalRequest.url ?? '';
        const isAuthRoute =
          reqUrl.includes('/auth/signin') ||
          reqUrl.includes('/auth/signup') ||
          reqUrl.includes('/auth/refresh') ||
          reqUrl.includes('/Auth/admin-login') ||
          reqUrl.includes('/Auth/login');

        if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
          originalRequest._retry = true;

          try {
            const { refreshToken } = useAuthStore.getState();
            console.debug('[apiService] 401 detected, attempting refresh', { url: reqUrl, hasRefresh: !!refreshToken });
            if (!refreshToken) {
              console.debug('[apiService] No refresh token available, logging out');
              useAuthStore.getState().logout();
              window.location.href = '/auth/login';
              return Promise.reject(error);
            }
            const response = await this.axiosInstance.post('/auth/refresh', {
              refreshToken,
            });

            // Accept multiple possible backend response shapes
            // e.g. { accessToken, refreshToken } OR { data: { accessToken, refreshToken } }
            const payload = response.data?.data ? response.data.data : response.data;
            const accessToken = payload?.accessToken;
            const newRefresh = payload?.refreshToken;

            if (!accessToken) throw new Error('Refresh did not return accessToken');

            const currentState = useAuthStore.getState();
            const currentUser = currentState.user || readStoredAuth()?.user;
            const refreshTokenToStore = newRefresh || currentState.refreshToken || refreshToken;

            if (currentUser) {
              const persistedAuth = {
                user: currentUser,
                accessToken,
                refreshToken: refreshTokenToStore,
              };
              localStorage.setItem('auth', JSON.stringify(persistedAuth));
              console.debug('[apiService] Persisted refreshed tokens to localStorage');
            }

            useAuthStore.setState({
              accessToken,
              refreshToken: refreshTokenToStore,
            });

            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            console.debug('[apiService] Retrying original request with new access token', { url: reqUrl });
            return this.axiosInstance(originalRequest);
          } catch (refreshError) {
            useAuthStore.getState().logout();
            window.location.href = '/auth/login';
            return Promise.reject(refreshError);
          }
        }

        if (error.response) {
          const data = error.response.data;
          const backendMessage =
            data?.message ||
            data?.error ||
            (typeof data === 'string' ? data : null);
          const messageParts = [error.message, backendMessage]
            .filter(Boolean)
            .map((piece) => (Array.isArray(piece) ? piece.join(', ') : piece));
          error.message = messageParts.join(' - ');
        }

        return Promise.reject(error);
      },
    );
  }

  get<T = any>(url: string, config?: AxiosRequestConfig) {
    return this.axiosInstance.get<T>(url, config);
  }

  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    const configWithHeaders = {
      ...config,
      headers: {
        ...(config?.headers || {}),
        'Content-Type': config?.headers?.['Content-Type'] || config?.headers?.['content-type'] || 'application/json',
      },
    };

    return this.axiosInstance.post<T>(url, data, configWithHeaders);
  }

  /** Multipart (e.g. file upload). Axios sets Content-Type including multipart boundary. */
  postMultipart<T = any>(url: string, formData: FormData, config?: AxiosRequestConfig) {
    const configWithHeaders = {
      ...config,
      headers: {
        ...(config?.headers || {}),
        'Content-Type': undefined as any,
      },
    };

    return this.axiosInstance.post<T>(url, formData, configWithHeaders);
  }

  putMultipart<T = any>(url: string, formData: FormData, config?: AxiosRequestConfig) {
    const configWithHeaders = {
      ...config,
      headers: {
        ...(config?.headers || {}),
        'Content-Type': undefined as any,
      },
    };

    return this.axiosInstance.put<T>(url, formData, configWithHeaders);
  }

  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.axiosInstance.put<T>(url, data, config);
  }

  delete<T = any>(url: string, config?: AxiosRequestConfig) {
    return this.axiosInstance.delete<T>(url, config);
  }

  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.axiosInstance.patch<T>(url, data, config);
  }
}

export const apiService = new ApiService();
