'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { LogOut, Menu, Moon, Sun, UserRound } from 'lucide-react';
import { getBrowserClient } from '@/lib/supabase/browser';
import { ROLE_LABELS } from '@/lib/auth/roles';
import { getInitials } from '@/lib/utils/format';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BrandMark } from './brand-mark';
import { CommandPalette } from './command-palette';
import { NotificationBell } from './notification-bell';
import type { Notification } from '@/lib/hooks/use-notifications';
import { useSession } from './session-provider';

export function DashboardHeader({
    onToggleMobile,
    onToggleDesktop,
    mobileOpen,
    notifications,
}: {
    onToggleMobile: () => void;
    onToggleDesktop: () => void;
    mobileOpen: boolean;
    notifications: Notification[];
}) {
    const router = useRouter();
    const { session } = useSession();
    const { resolvedTheme, setTheme } = useTheme();
    const { profile } = session;

    async function signOut() {
        await getBrowserClient().auth.signOut();
        // `refresh()` re-runs the server layout, which redirects to sign-in. Pushing a
        // route directly would race the cookie clearing and sometimes bounce back.
        router.refresh();
    }

    return (
        <header className="sticky top-0 z-40 border-b border-border/50 bg-background/70 backdrop-blur-2xl backdrop-saturate-150 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
            <a
                href="#main"
                className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:shadow"
            >
                Skip to content
            </a>

            <div className="flex h-16 items-center gap-4 px-4 md:px-6">
                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={onToggleMobile}
                    aria-label="Toggle navigation"
                    aria-expanded={mobileOpen}
                    aria-controls="mobile-navigation"
                >
                    <Menu className="h-5 w-5" aria-hidden />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="hidden text-muted-foreground hover:text-foreground md:flex"
                    onClick={onToggleDesktop}
                    aria-label="Toggle sidebar"
                >
                    <Menu className="h-5 w-5" aria-hidden />
                </Button>

                <Link href="/" className="transition-opacity hover:opacity-80" aria-label="Impact 360 Internship OS, home">
                    <BrandMark />
                </Link>

                <div className="flex-1" />
                <CommandPalette />

                <div className="flex items-center gap-2 sm:gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                        aria-label="Toggle colour theme"
                    >
                        <Sun className="hidden h-4 w-4 dark:block" aria-hidden />
                        <Moon className="h-4 w-4 dark:hidden" aria-hidden />
                    </Button>

                    <NotificationBell initial={notifications} />

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-10 w-10 rounded-full" aria-label="Account menu">
                                <Avatar>
                                    <AvatarImage src={profile.avatar_url ?? undefined} alt="" />
                                    <AvatarFallback>{getInitials(profile.full_name)}</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-60" align="end">
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="truncate text-sm font-medium leading-none">{profile.full_name || 'Your account'}</p>
                                    <p className="truncate text-xs leading-none text-muted-foreground">{profile.email}</p>
                                    <Badge variant="secondary" className="mt-1.5 w-fit">
                                        {ROLE_LABELS[session.role]}
                                    </Badge>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="/dashboard/profile" className="w-full cursor-pointer">
                                    <UserRound className="mr-2 h-4 w-4" aria-hidden />
                                    Profile
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive">
                                <LogOut className="mr-2 h-4 w-4" aria-hidden />
                                Sign out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
