'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabaseClient } from '@/lib/supabase/client';
import { Notification } from '@/types/database.types';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export function useNotifications() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    const unreadCount = notifications.filter((n) => !n.is_read).length;

    const fetchNotifications = useCallback(async () => {
        if (!user?.id) return;

        const supabase = supabaseClient();

        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(20);

            if (error) throw error;
            if (data) setNotifications(data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    // Mark a single notification as read
    const markAsRead = useCallback(
        async (notificationId: string) => {
            const supabase = supabaseClient();

            try {
                const { error } = await (supabase
                    .from('notifications') as any)
                    .update({ is_read: true } as any)
                    .eq('id', notificationId);

                if (error) throw error;

                setNotifications((prev) =>
                    prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
                );
            } catch (error) {
                console.error('Error marking notification as read:', error);
            }
        },
        []
    );

    // Mark all notifications as read
    const markAllAsRead = useCallback(async () => {
        if (!user?.id) return;

        const supabase = supabaseClient();

        try {
            const { error } = await (supabase
                .from('notifications') as any)
                .update({ is_read: true } as any)
                .eq('user_id', user.id)
                .eq('is_read', false);

            if (error) throw error;

            setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    }, [user?.id]);

    // Fetch on mount
    useEffect(() => {
        if (user?.id) {
            fetchNotifications();
        }
    }, [user?.id, fetchNotifications]);

    // Real-time subscription
    useEffect(() => {
        if (!user?.id) return;

        const supabase = supabaseClient();

        const channel = supabase
            .channel(`notifications:${user.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${user.id}`,
                },
                (payload) => {
                    const newNotification = payload.new as Notification;
                    setNotifications((prev) => [newNotification, ...prev]);
                    toast.info(newNotification.title, {
                        description: newNotification.message,
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user?.id]);

    return {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        refetch: fetchNotifications,
    };
}
