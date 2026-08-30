'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { getBrowserClient } from '@/lib/supabase/browser';
import { readableError } from '@/lib/errors';
import type { Tables } from '@/types/database';

export type Notification = Tables<'notifications'>;

const MAX_HELD = 20;

/**
 * The signed-in person's notifications, seeded on the server and kept live.
 *
 * The initial page comes from the server render, so there is no fetch-on-mount
 * waterfall and no spinner in the bell. The effect does one job — subscribe to inserts
 * — which is what effects are actually for.
 *
 * Optimistic updates roll back on failure rather than leaving the badge showing a count
 * the database disagrees with.
 */
export function useNotifications(userId: string, initial: Notification[]) {
    const [notifications, setNotifications] = useState<Notification[]>(initial);

    useEffect(() => {
        const supabase = getBrowserClient();
        const channel = supabase
            .channel(`notifications:${userId}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
                (payload) => {
                    const incoming = payload.new as Notification;
                    setNotifications((current) =>
                        current.some((item) => item.id === incoming.id)
                            ? current
                            : [incoming, ...current].slice(0, MAX_HELD),
                    );
                },
            )
            .subscribe();

        return () => {
            void supabase.removeChannel(channel);
        };
    }, [userId]);

    const markRead = useCallback(async (id: string) => {
        const readAt = new Date().toISOString();
        let previous: Notification[] = [];

        setNotifications((current) => {
            previous = current;
            return current.map((item) => (item.id === id ? { ...item, is_read: true, read_at: readAt } : item));
        });

        const { error } = await getBrowserClient()
            .from('notifications')
            .update({ is_read: true, read_at: readAt })
            .eq('id', id);

        if (error) {
            setNotifications(previous);
            toast.error(readableError(error));
        }
    }, []);

    const markAllRead = useCallback(async () => {
        const readAt = new Date().toISOString();
        let previous: Notification[] = [];
        let hadUnread = false;

        setNotifications((current) => {
            previous = current;
            hadUnread = current.some((item) => !item.is_read);
            return hadUnread ? current.map((item) => ({ ...item, is_read: true, read_at: item.read_at ?? readAt })) : current;
        });

        if (!hadUnread) return;

        const { error } = await getBrowserClient()
            .from('notifications')
            .update({ is_read: true, read_at: readAt })
            .eq('user_id', userId)
            .eq('is_read', false);

        if (error) {
            setNotifications(previous);
            toast.error(readableError(error));
        }
    }, [userId]);

    return {
        notifications,
        unreadCount: notifications.filter((item) => !item.is_read).length,
        markRead,
        markAllRead,
    };
}
