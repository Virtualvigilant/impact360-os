'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { DashboardHeader } from './dashboard-header';
import { DashboardSidebar } from './dashboard-sidebar';
import type { Notification } from '@/lib/hooks/use-notifications';

export function DashboardShell({
    children,
    notifications,
}: {
    children: ReactNode;
    notifications: Notification[];
}) {
    const [desktopOpen, setDesktopOpen] = useState(true);
    const pathname = usePathname();

    // The drawer remembers the route it was opened on. Navigating changes `pathname`,
    // which closes it during render — no effect, and no frame where the drawer covers
    // the page the person just asked for.
    const [openedAt, setOpenedAt] = useState<string | null>(null);
    const mobileOpen = openedAt === pathname;
    const setMobileOpen = (open: boolean) => setOpenedAt(open ? pathname : null);

    // Escape closes the drawer, matching every other overlay in the application.
    useEffect(() => {
        if (!mobileOpen) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setOpenedAt(null);
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [mobileOpen]);

    return (
        <div className="min-h-screen bg-background">
            <DashboardHeader
                onToggleMobile={() => setMobileOpen(!mobileOpen)}
                onToggleDesktop={() => setDesktopOpen((open) => !open)}
                mobileOpen={mobileOpen}
                notifications={notifications}
            />

            <div className="flex">
                <aside
                    className={`hidden shrink-0 border-r bg-card/60 backdrop-blur-md transition-[width] duration-300 md:block ${
                        desktopOpen ? 'w-64' : 'w-0 overflow-hidden'
                    }`}
                    aria-hidden={!desktopOpen}
                >
                    <div className="w-64">
                        <DashboardSidebar />
                    </div>
                </aside>

                <div
                    className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
                        mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
                    }`}
                    onClick={() => setMobileOpen(false)}
                    aria-hidden
                />
                <aside
                    id="mobile-navigation"
                    className={`fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] w-64 border-r bg-background/95 backdrop-blur-xl transition-transform duration-300 ease-in-out md:hidden ${
                        mobileOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
                    aria-hidden={!mobileOpen}
                >
                    <DashboardSidebar />
                </aside>

                <main id="main" className="min-h-[calc(100vh-4rem)] flex-1 overflow-x-hidden p-4 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
