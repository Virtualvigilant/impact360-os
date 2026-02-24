'use client';

import { useState } from 'react';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { Notification } from '@/types/database.types';
import { formatRelativeTime } from '@/lib/utils/format';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Bell,
    CheckCheck,
    FolderKanban,
    Award,
    UserPlus,
    Info,
    Loader2,
    Trash2,
    X,
} from 'lucide-react';

const notificationIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    project_assignment: FolderKanban,
    evaluation: Award,
    stage_change: UserPlus,
    task_review: Award,
};

function NotificationItem({
    notification,
    onRead,
    onDelete,
}: {
    notification: Notification;
    onRead: (id: string) => void;
    onDelete: (id: string) => void;
}) {
    const Icon = notificationIcons[notification.type] || Info;

    return (
        <div
            className={`group relative flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors ${!notification.is_read ? 'bg-primary/5' : ''
                }`}
        >
            <button
                onClick={() => !notification.is_read && onRead(notification.id)}
                className="flex items-start gap-3 flex-1 text-left min-w-0"
            >
                <div
                    className={`mt-0.5 p-1.5 rounded-full shrink-0 ${!notification.is_read
                            ? 'bg-primary/10 text-primary'
                            : 'bg-muted text-muted-foreground'
                        }`}
                >
                    <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0 pr-5">
                    <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm leading-tight ${!notification.is_read ? 'font-semibold' : 'font-medium'}`}>
                            {notification.title}
                        </p>
                        {!notification.is_read && (
                            <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                        {formatRelativeTime(notification.created_at)}
                    </p>
                </div>
            </button>

            {/* Per-item delete button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete(notification.id);
                }}
                title="Dismiss"
                className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-muted text-muted-foreground hover:text-destructive"
            >
                <X className="h-3.5 w-3.5" />
            </button>
        </div>
    );
}

export function NotificationDropdown() {
    const { notifications, unreadCount, loading, markAsRead, markAllAsRead, deleteNotification, clearAllNotifications } =
        useNotifications();
    const [open, setOpen] = useState(false);
    const [clearing, setClearing] = useState(false);

    const handleClearAll = async (e: React.MouseEvent) => {
        e.preventDefault();
        setClearing(true);
        await clearAllNotifications();
        setClearing(false);
    };

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 h-4.5 w-4.5 min-w-[18px] rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center px-1">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3">
                    <DropdownMenuLabel className="p-0 text-base">
                        Notifications
                        {notifications.length > 0 && (
                            <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                                ({notifications.length})
                            </span>
                        )}
                    </DropdownMenuLabel>
                    <div className="flex items-center gap-1">
                        {unreadCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-auto py-1 px-2 text-xs text-muted-foreground hover:text-foreground"
                                onClick={(e) => {
                                    e.preventDefault();
                                    markAllAsRead();
                                }}
                            >
                                <CheckCheck className="h-3 w-3 mr-1" />
                                Mark all read
                            </Button>
                        )}
                        {notifications.length > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-auto py-1 px-2 text-xs text-muted-foreground hover:text-destructive"
                                onClick={handleClearAll}
                                disabled={clearing}
                                title="Clear all notifications"
                            >
                                {clearing ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                    <Trash2 className="h-3 w-3" />
                                )}
                                <span className="ml-1">Clear all</span>
                            </Button>
                        )}
                    </div>
                </div>
                <DropdownMenuSeparator className="m-0" />

                {/* Notifications list */}
                <div className="max-h-[400px] overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="py-8 text-center">
                            <Bell className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">
                                All caught up!
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.map((notification) => (
                                <NotificationItem
                                    key={notification.id}
                                    notification={notification}
                                    onRead={markAsRead}
                                    onDelete={deleteNotification}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
