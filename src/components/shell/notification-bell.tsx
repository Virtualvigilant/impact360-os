'use client';

import Link from 'next/link';
import { Bell, CheckCheck } from 'lucide-react';
import { useNotifications, type Notification } from '@/lib/hooks/use-notifications';
import { formatRelativeTime } from '@/lib/utils/format';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSession } from './session-provider';
import { cn } from '@/lib/utils';

export function NotificationBell({ initial }: { initial: Notification[] }) {
    const { session } = useSession();
    const { notifications, unreadCount, markRead, markAllRead } = useNotifications(session.userId, initial);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                    aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
                >
                    <Bell className="h-4 w-4" aria-hidden />
                    {unreadCount > 0 && (
                        <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-80 p-0">
                <DropdownMenuLabel className="flex items-center justify-between px-4 py-3">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs" onClick={markAllRead}>
                            <CheckCheck className="h-3.5 w-3.5" aria-hidden />
                            Mark all read
                        </Button>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="m-0" />

                <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                        <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                            Nothing yet. Task reviews, check-in feedback and decisions will appear here.
                        </p>
                    ) : (
                        notifications.map((item) => {
                            const body = (
                                <>
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="text-sm font-medium leading-5">{item.title}</p>
                                        {!item.is_read && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
                                    </div>
                                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.message}</p>
                                    <p className="mt-1.5 text-[11px] text-muted-foreground/80">
                                        {formatRelativeTime(item.created_at)}
                                    </p>
                                </>
                            );

                            const className = cn(
                                'block w-full border-b px-4 py-3 text-left last:border-0 hover:bg-muted/50',
                                !item.is_read && 'bg-primary/5',
                            );

                            return item.action_url ? (
                                <Link key={item.id} href={item.action_url} className={className} onClick={() => markRead(item.id)}>
                                    {body}
                                </Link>
                            ) : (
                                <button key={item.id} type="button" className={className} onClick={() => markRead(item.id)}>
                                    {body}
                                </button>
                            );
                        })
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
