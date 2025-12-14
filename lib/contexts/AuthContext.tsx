'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../services/auth.service';
import { tokenStorage } from '../api-client';
import type { User, LoginRequest, ApiResponse, AuthResponse } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<ApiResponse<AuthResponse>>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const handleLogout = useCallback(async () => {
    try {
      const refreshToken = tokenStorage.getRefreshToken();
      if (refreshToken) {
        // Try to logout on server, but don't wait for it or throw errors
        await authService.logout(refreshToken).catch(() => {
          // Ignore logout API errors - we'll clear tokens locally anyway
        });
      }
    } catch (error) {
      // Ignore all logout errors - we're clearing tokens locally
    } finally {
      // Always clear state regardless of API call success
      setUser(null);
      setIsAuthenticated(false);
      tokenStorage.clearAll();
      router.push('/signin');
    }
  }, [router]);

  const refreshAuth = useCallback(async () => {
    try {
      const refreshToken = tokenStorage.getRefreshToken();
      if (!refreshToken) {
        // No refresh token - only logout if token is actually expired
        if (tokenStorage.isTokenExpired()) {
          handleLogout();
        }
        return;
      }

      const response = await authService.refreshToken(refreshToken);
      
      // If refresh succeeded, update user data
      if (response && response.isSuccess && response.data) {
        const { email, userId, firstName, lastName } = response.data;
        const userData = { email, userId, firstName, lastName };
        
        setUser(userData);
        setIsAuthenticated(true);
      } else if (response === null) {
        // Silent failure (500 error) - don't logout, user can continue
        // Only logout if token is actually expired
        if (tokenStorage.isTokenExpired()) {
          // Token is expired and refresh failed - need to logout
          handleLogout();
        }
        // Otherwise, continue with existing token (might still be valid)
      } else {
        // Other failure - only logout if token is expired
        if (tokenStorage.isTokenExpired()) {
          handleLogout();
        }
      }
    } catch (error) {
      // Only logout if token is actually expired
      // Silent failures (500 errors) shouldn't cause logout
      if (tokenStorage.isTokenExpired()) {
        console.warn('Token refresh failed and token is expired:', error);
        handleLogout();
      } else {
        // Token might still be valid, continue silently
        console.warn('Token refresh failed but token may still be valid:', error);
      }
    }
  }, [handleLogout]);

  const initializeAuth = useCallback(async () => {
    try {
      const currentUser = authService.getCurrentUser();
      const authenticated = authService.isAuthenticated();

      if (authenticated && currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
        
        // If token is expired but refresh token exists, try to refresh
        if (tokenStorage.isTokenExpired()) {
          const refreshToken = tokenStorage.getRefreshToken();
          if (refreshToken) {
            await refreshAuth();
          }
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, [refreshAuth]);

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Check token expiry periodically
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkTokenExpiry = () => {
      // Only check if token is actually expired
      if (tokenStorage.isTokenExpired()) {
        const refreshToken = tokenStorage.getRefreshToken();
        if (refreshToken) {
          // Try to refresh, but don't logout on failure (handled in refreshAuth)
          refreshAuth().catch(() => {
            // Error already handled in refreshAuth - only logs out if token is expired
          });
        } else {
          // No refresh token and token is expired - must logout
          handleLogout();
        }
      }
    };

    // Check every 5 minutes (less aggressive)
    const interval = setInterval(checkTokenExpiry, 300000);
    checkTokenExpiry(); // Check immediately

    return () => clearInterval(interval);
  }, [isAuthenticated, refreshAuth, handleLogout]);


  const login = async (credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    try {
      setIsLoading(true);
      const response = await authService.login(credentials);

      if (response.isSuccess && response.data) {
        const { email, userId, firstName, lastName } = response.data;
        const userData = { email, userId, firstName, lastName };
        
        setUser(userData);
        setIsAuthenticated(true);
        
        // Redirect to dashboard
        router.push('/dashboard');
      }

      return response;
    } catch (error: any) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };


  const logout = async () => {
    await handleLogout();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

