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
    const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile
    const [isDesktopOpen, setIsDesktopOpen] = useState(true); // Desktop
    const { loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const handleMenuClick = (type: 'mobile' | 'desktop') => {
        if (type === 'mobile') {
            setSidebarOpen(!sidebarOpen);
        } else {
            setIsDesktopOpen(!isDesktopOpen);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <DashboardHeader onMenuClick={handleMenuClick} />

            <div className="flex">
                {/* Desktop Sidebar */}
                <aside
                    className={`hidden md:block border-r border-white/10 bg-slate-900/30 backdrop-blur-md transition-all duration-300 ${isDesktopOpen ? 'w-64' : 'w-0 overflow-hidden opacity-0'
                        }`}
                >
                    <div className="w-64">
                        <DashboardSidebar />
                    </div>
                </aside>

                {/* Mobile Sidebar with Slide-in Animation */}
                <div
                    className={`fixed inset-0 z-40 bg-black/80 backdrop-blur-sm md:hidden transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                        }`}
                    onClick={() => setSidebarOpen(false)}
                />
                <aside
                    className={`fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] w-64 border-r border-white/10 bg-slate-900/90 backdrop-blur-xl md:hidden transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                        }`}
                >
                    <DashboardSidebar onNavClick={() => setSidebarOpen(false)} />
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-4 md:p-8 overflow-x-hidden min-h-[calc(100vh-4rem)]">
                    {children}
                </main>
            </div>
        </div>
    );
}