'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_SECTIONS, SECTION_LABELS, visibleRoutes } from '@/lib/auth/navigation';
import { useSession } from './session-provider';
import { cn } from '@/lib/utils';

export function DashboardSidebar() {
    const pathname = usePathname();
    const { session } = useSession();
    const routes = visibleRoutes(session.role);

    return (
        <nav className="h-[calc(100vh-4rem)] overflow-y-auto px-3 py-5" aria-label="Main navigation">
            {NAV_SECTIONS.map((section) => {
                const items = routes.filter((route) => route.section === section);
                if (items.length === 0) return null;

                return (
                    <div key={section} className="mb-5">
                        {section !== 'command' && (
                            <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/65">
                                {SECTION_LABELS[section]}
                            </p>
                        )}
                        <div className="space-y-0.5">
                            {items.map((route) => {
                                const Icon = route.icon;
                                const active =
                                    route.href === '/dashboard'
                                        ? pathname === route.href
                                        : pathname === route.href || pathname.startsWith(`${route.href}/`);

                                return (
                                    <Link
                                        key={route.href}
                                        href={route.href}
                                        aria-current={active ? 'page' : undefined}
                                        className={cn(
                                            'flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors',
                                            active
                                                ? 'bg-primary/10 text-primary'
                                                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                        )}
                                    >
                                        <Icon className="h-4 w-4 shrink-0" aria-hidden />
                                        <span className="truncate">{route.title}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </nav>
    );
}
