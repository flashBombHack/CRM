import { tokenStorage } from '../api-client';
import type {
  LoginRequest,
  RefreshTokenRequest,
  LogoutRequest,
  AuthResponse,
  ApiResponse,
  User,
} from '@/types/auth';

class AuthService {
  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data: ApiResponse<AuthResponse> = await response.json();

      if (data.isSuccess && data.data) {
        const { token, refreshToken, email, userId, expiresIn, firstName, lastName } = data.data;
        
        // Store tokens and user data
        if (token) tokenStorage.setToken(token);
        if (refreshToken) tokenStorage.setRefreshToken(refreshToken);
        tokenStorage.setUser({ email, userId, firstName, lastName });
        tokenStorage.setTokenExpiry(expiresIn);
      }

      if (!response.ok) {
        throw new Error(data.message || data.errors?.[0] || 'Login failed');
      }

      return data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async refreshToken(refreshToken: string): Promise<ApiResponse<AuthResponse> | null> {
    try {
      const response = await fetch('/api/auth/refresh-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      // Handle 500 errors silently (endpoint might be under construction)
      if (response.status === 500) {
        console.warn('Token refresh endpoint returned 500 - endpoint may be under construction. Continuing with existing token.');
        return null; // Return null to indicate silent failure
      }

      const data: ApiResponse<AuthResponse> = await response.json().catch(() => ({
        isSuccess: false,
        message: 'Failed to parse response',
        data: null,
        errors: ['Failed to parse response'],
        responseCode: 0,
      }));

      if (data.isSuccess && data.data) {
        const { token, refreshToken: newRefreshToken, email, userId, expiresIn, firstName, lastName } = data.data;
        
        // Update tokens and user data
        if (token) tokenStorage.setToken(token);
        if (newRefreshToken) tokenStorage.setRefreshToken(newRefreshToken);
        tokenStorage.setUser({ email, userId, firstName, lastName });
        tokenStorage.setTokenExpiry(expiresIn);
      }

      // Only throw for non-500 errors (401, 403, etc.)
      if (!response.ok && response.status !== 500) {
        throw new Error(data.message || data.errors?.[0] || 'Token refresh failed');
      }

      return data;
    } catch (error: any) {
      // If it's a network error or other non-500 error, log but don't throw
      // This allows the user to continue with their existing token
      if (error.message && !error.message.includes('500')) {
        console.warn('Token refresh error (non-critical):', error.message);
      }
      return null; // Return null for silent failure
    }
  }

  async logout(refreshToken: string): Promise<ApiResponse<boolean> | null> {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      // Handle errors gracefully - clear tokens regardless
      const data: ApiResponse<boolean> = await response.json().catch(() => ({
        isSuccess: false,
        message: 'Logout request failed',
        data: false,
        errors: ['Logout request failed'],
        responseCode: 0,
      }));

      // Clear tokens regardless of response (401, 500, etc.)
      tokenStorage.clearAll();

      // Don't throw errors - just return the response or null
      // The caller will handle token clearing
      return data;
    } catch (error: any) {
      // Clear tokens even if logout fails completely
      tokenStorage.clearAll();
      // Return null instead of throwing - logout should always succeed locally
      console.warn('Logout API call failed, but tokens cleared locally:', error.message);
      return null;
    }
  }

  getCurrentUser(): User | null {
    return tokenStorage.getUser();
  }

  isAuthenticated(): boolean {
    const token = tokenStorage.getToken();
    const refreshToken = tokenStorage.getRefreshToken();
    return !!(token && refreshToken && !tokenStorage.isTokenExpired());
  }

  private handleError(error: any): Error {
    if (error.response) {
      // Server responded with error
      const message = error.response.data?.message || error.response.data?.errors?.[0] || 'An error occurred';
      return new Error(message);
    } else if (error.request) {
      // Request made but no response
      return new Error('Network error. Please check your connection.');
    } else {
      // Something else happened
      return new Error(error.message || 'An unexpected error occurred');
    }
  }
}

export const authService = new AuthService();

