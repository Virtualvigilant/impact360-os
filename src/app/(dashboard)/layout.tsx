'use client';

import { useState } from 'react';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { useAuth } from '@/lib/hooks/useAuth';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 border-r bg-muted/40">
          <DashboardSidebar />
        </aside>

        {/* Mobile Sidebar */}
        {sidebarOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <aside className="fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] w-64 border-r bg-background md:hidden">
              <DashboardSidebar />
            </aside>
          </>
        )}

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}