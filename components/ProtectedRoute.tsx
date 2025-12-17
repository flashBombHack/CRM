'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { tokenStorage } from '@/lib/api-client';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  useEffect(() => {
    // Give auth context time to initialize, especially on page refresh
    // Check if we have tokens in storage - if so, wait a bit longer
    const hasTokens = tokenStorage.getToken() || tokenStorage.getRefreshToken();
    
    if (hasTokens && isLoading) {
      // If we have tokens and still loading, wait a bit more for refresh to complete
      const timeout = setTimeout(() => {
        setHasCheckedAuth(true);
      }, 500); // Wait up to 500ms for auth to initialize
      
      return () => clearTimeout(timeout);
    } else {
      setHasCheckedAuth(true);
    }
  }, [isLoading]);

  useEffect(() => {
    // Only redirect if we've given auth time to initialize
    if (hasCheckedAuth && !isLoading && !isAuthenticated) {
      // Double-check we don't have tokens before redirecting
      const hasTokens = tokenStorage.getToken() || tokenStorage.getRefreshToken();
      if (!hasTokens) {
        router.push('/signin');
      }
    }
  }, [isAuthenticated, isLoading, router, hasCheckedAuth]);

  // Show loading while auth is initializing or we're waiting for token refresh
  if (isLoading || !hasCheckedAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Double-check tokens one more time before showing nothing
    const hasTokens = tokenStorage.getToken() || tokenStorage.getRefreshToken();
    if (!hasTokens) {
      return null;
    }
    // If we have tokens, show loading to give it more time
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}



