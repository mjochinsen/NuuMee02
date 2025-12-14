'use client';

import { useState, useEffect, useCallback } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminBreadcrumbs } from '@/components/admin/AdminBreadcrumbs';
import { PasswordPrompt } from '@/components/admin/PasswordPrompt';
import { getStoredPassword, getDashboardStats } from '@/lib/admin-api';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [failedJobsCount, setFailedJobsCount] = useState(0);

  // Check if user has stored password
  useEffect(() => {
    const password = getStoredPassword();
    setIsAuthenticated(!!password);
  }, []);

  // Fetch failed jobs count for sidebar badge
  const fetchFailedJobsCount = useCallback(async () => {
    try {
      const stats = await getDashboardStats();
      setFailedJobsCount(stats.jobs.failed);
    } catch (error) {
      // Silently fail - the badge just won't show
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchFailedJobsCount();
      // Refresh every 30 seconds
      const interval = setInterval(fetchFailedJobsCount, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, fetchFailedJobsCount]);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  // Show loading state while checking auth
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0F172A] to-[#1E293B] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00F0D9] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Show password prompt if not authenticated
  if (!isAuthenticated) {
    return <PasswordPrompt onSuccess={handleLoginSuccess} />;
  }

  // Show admin panel
  return (
    <div className="flex min-h-screen bg-[#1E293B]">
      <AdminSidebar failedJobsCount={failedJobsCount} onLogout={handleLogout} />

      <main className="flex-1 p-8">
        <AdminBreadcrumbs />
        {children}
      </main>

      <Toaster position="top-right" richColors />
    </div>
  );
}
