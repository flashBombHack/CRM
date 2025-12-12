import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://democrm-rsqo.onrender.com';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token storage keys
const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user_data';
const TOKEN_EXPIRY_KEY = 'token_expiry';

// Token management utilities
export const tokenStorage = {
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },
  
  setToken: (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, token);
  },
  
  removeToken: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
  },
  
  getRefreshToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  
  setRefreshToken: (refreshToken: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },
  
  removeRefreshToken: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
  
  getUser: (): any | null => {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  },
  
  setUser: (user: any): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  
  removeUser: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(USER_KEY);
  },
  
  setTokenExpiry: (expiresIn: number): void => {
    if (typeof window === 'undefined') return;
    const expiryTime = Date.now() + expiresIn * 1000;
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
  },
  
  isTokenExpired: (): boolean => {
    if (typeof window === 'undefined') return true;
    const expiryTime = localStorage.getItem(TOKEN_EXPIRY_KEY);
    if (!expiryTime) return true;
    return Date.now() >= parseInt(expiryTime, 10);
  },
  
  clearAll: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
  },
};

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Request interceptor - Add token to requests
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If error is 401 and we haven't already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = tokenStorage.getRefreshToken();

      if (!refreshToken) {
        processQueue(error, null);
        isRefreshing = false;
        tokenStorage.clearAll();
        // Redirect to login if we're on client side
        if (typeof window !== 'undefined') {
          window.location.href = '/signin';
        }
        return Promise.reject(error);
      }

      try {
        const response = await fetch('/api/auth/refresh-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        });

        // Handle 500 errors silently - endpoint might be under construction
        if (response.status === 500) {
          console.warn('Token refresh endpoint returned 500 - continuing with existing token');
          processQueue(null, tokenStorage.getToken());
          isRefreshing = false;
          // Return the original request with existing token
          // The request might still work if the token hasn't actually expired
          return apiClient(originalRequest);
        }

        const data = await response.json().catch(() => ({
          isSuccess: false,
          message: 'Failed to parse response',
          data: null,
          errors: ['Failed to parse response'],
          responseCode: 0,
        }));

        if (response.ok && data.isSuccess && data.data) {
          const { token, refreshToken: newRefreshToken, expiresIn } = data.data;
          
          tokenStorage.setToken(token);
          tokenStorage.setRefreshToken(newRefreshToken);
          tokenStorage.setTokenExpiry(expiresIn);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }

          processQueue(null, token);
          isRefreshing = false;

          return apiClient(originalRequest);
        }

        // For non-500 errors, only logout if token is actually expired
        // Otherwise, try to continue with existing token
        if (tokenStorage.isTokenExpired()) {
          processQueue(error, null);
          isRefreshing = false;
          tokenStorage.clearAll();
          
          // Redirect to login if we're on client side
          if (typeof window !== 'undefined') {
            window.location.href = '/signin';
          }
          
          return Promise.reject(error);
        } else {
          // Token might still be valid, continue with existing token
          processQueue(null, tokenStorage.getToken());
          isRefreshing = false;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Only logout if token is actually expired
        if (tokenStorage.isTokenExpired()) {
          processQueue(refreshError as AxiosError, null);
          isRefreshing = false;
          tokenStorage.clearAll();
          
          // Redirect to login if we're on client side
          if (typeof window !== 'undefined') {
            window.location.href = '/signin';
          }
        } else {
          // Token might still be valid, continue with existing token
          processQueue(null, tokenStorage.getToken());
          isRefreshing = false;
          // Return original request with existing token
          return apiClient(originalRequest);
        }
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

