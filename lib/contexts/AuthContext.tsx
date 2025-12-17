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
      const currentToken = tokenStorage.getToken();
      
      if (!refreshToken) {
        // No refresh token - check if we have a valid token
        if (currentToken && !tokenStorage.isTokenExpired()) {
          // Have valid token, stay authenticated
          setIsAuthenticated(true);
          return;
        } else if (tokenStorage.isTokenExpired() && !currentToken) {
          // Token expired and no token - logout
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
        // Silent failure (500 error) - check if we have a valid token to fall back to
        const token = tokenStorage.getToken();
        const tokenExpired = tokenStorage.isTokenExpired();
        
        if (token && !tokenExpired) {
          // Have valid token, continue with it
          setIsAuthenticated(true);
        } else if (tokenExpired && !token) {
          // Token expired and no token - need to logout
          handleLogout();
        } else {
          // Token might still be valid, continue with existing token
          setIsAuthenticated(!!token);
        }
      } else {
        // Other failure - check if we have a valid token to fall back to
        const token = tokenStorage.getToken();
        const tokenExpired = tokenStorage.isTokenExpired();
        
        if (token && !tokenExpired) {
          // Have valid token, continue with it
          setIsAuthenticated(true);
        } else if (tokenExpired && !token) {
          // Token expired and no token - logout
          handleLogout();
        } else {
          // Try to continue with existing token
          setIsAuthenticated(!!token);
        }
      }
    } catch (error) {
      // Check if we have a valid token to fall back to
      const token = tokenStorage.getToken();
      const tokenExpired = tokenStorage.isTokenExpired();
      
      if (token && !tokenExpired) {
        // Have valid token, continue with it
        setIsAuthenticated(true);
        console.warn('Token refresh failed but existing token is still valid:', error);
      } else if (tokenExpired && !token) {
        // Token expired and no token - logout
        console.warn('Token refresh failed and token is expired:', error);
        handleLogout();
      } else {
        // Token might still be valid, continue silently
        setIsAuthenticated(!!token);
        console.warn('Token refresh failed but token may still be valid:', error);
      }
    }
  }, [handleLogout]);

  const initializeAuth = useCallback(async () => {
    try {
      const currentUser = authService.getCurrentUser();
      const token = tokenStorage.getToken();
      const refreshToken = tokenStorage.getRefreshToken();
      
      // If we have tokens, even if expired, try to restore session
      if (token || refreshToken) {
        // Set user if available
        if (currentUser) {
          setUser(currentUser);
        }
        
        // Check if token is expired
        const tokenExpired = tokenStorage.isTokenExpired();
        
        if (tokenExpired && refreshToken) {
          // Token is expired but we have refresh token - try to refresh
          // Set authenticated to true optimistically while refreshing
          setIsAuthenticated(true);
          await refreshAuth();
        } else if (token && !tokenExpired) {
          // Token is valid
          setUser(currentUser);
          setIsAuthenticated(true);
        } else if (token && tokenExpired && !refreshToken) {
          // Token expired and no refresh token - not authenticated
          setUser(null);
          setIsAuthenticated(false);
        } else {
          // Have refresh token but no token - try to refresh
          if (refreshToken) {
            setIsAuthenticated(true);
            await refreshAuth();
          } else {
            setUser(null);
            setIsAuthenticated(false);
          }
        }
      } else {
        // No tokens at all
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      // On error, check if we still have tokens before logging out
      const token = tokenStorage.getToken();
      const refreshToken = tokenStorage.getRefreshToken();
      if (token || refreshToken) {
        // Still have tokens, might be a temporary error
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
        setIsAuthenticated(!!token && !tokenStorage.isTokenExpired());
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
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

