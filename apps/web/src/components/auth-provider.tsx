'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '../store/auth-store';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((state) => state.initialize);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Handle protected routes
  useEffect(() => {
    if (!isLoading) {
      const isPublicRoute = pathname === '/' || pathname === '/login' || pathname === '/register';
      
      if (!isAuthenticated && !isPublicRoute) {
        // Redirect to login if trying to access a protected route while unauthenticated
        router.push('/login');
      } else if (isAuthenticated && (pathname === '/login' || pathname === '/register')) {
        // Redirect to dashboard if logged in and trying to access auth pages
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  // During initial load, just render nothing to prevent hydrations mismatch/flash
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-white">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-indigo-400 font-medium">Securing connection...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
