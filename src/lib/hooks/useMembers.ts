'use client';

import { useState, useCallback, useEffect } from 'react';
import { supabaseClient } from '@/lib/supabase/client';
import { MemberProfile, PipelineStage, Profile } from '@/types/database.types';
import { toast } from 'sonner';

export type MemberWithProfile = MemberProfile & {
    profile: Profile;
};

export function useMembers() {
    const [members, setMembers] = useState<MemberWithProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingStage, setUpdatingStage] = useState<string | null>(null);

    const fetchMembers = useCallback(async () => {
        setLoading(true);
        const supabase = supabaseClient();

        try {
            const { data, error } = await supabase
                .from('member_profiles')
                .select(`
                    *,
                    profile:profiles(*)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Cast data to expected type since Supabase types might be deep
            if (data) {
                // Ensure the joined profile is not an array (it shouldn't be with single foreign key)
                const typedMembers = data.map((item: any) => ({
                    ...item,
                    profile: Array.isArray(item.profile) ? item.profile[0] : item.profile
                })) as MemberWithProfile[];
                setMembers(typedMembers);
            }
        } catch (error: any) {
            console.error('Error fetching members:', error);
            toast.error('Failed to fetch members');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    const updateMemberStage = async (memberId: string, newStage: PipelineStage) => {
        setUpdatingStage(memberId);
        const supabase = supabaseClient();

        try {
            const updateData: any = { current_stage: newStage };
            if (newStage === 'deployed') {
                updateData.is_client_ready = true;
                updateData.client_ready_date = new Date().toISOString();
            }

            const { error } = await (supabase
                .from('member_profiles') as any)
                .update(updateData)
                .eq('id', memberId);

            if (error) throw error;

            // Send notification (legacy system check - ideally handled by triggers, but keeping manual for now)
            // Send notification (legacy system check - ideally handled by triggers, but keeping manual for now)
            await (supabase.from('notifications') as any).insert({
                user_id: memberId,
                title: 'Pipeline Stage Updated',
                message: `Your pipeline stage has been updated to ${newStage.replace('_', ' ')}.`,
                type: 'stage_change',
                is_read: false
            });

            // Optimistic update
            setMembers((prev) =>
                prev.map((m) =>
                    m.id === memberId ? { ...m, ...updateData } : m
                )
            );

            toast.success('Member stage updated successfully');
        } catch (error: any) {
            console.error('Error changing stage:', error);
            toast.error('Failed to update member stage');
        } finally {
            setUpdatingStage(null);
        }
    };

    return {
        members,
        loading,
        fetchMembers,
        updateMemberStage,
        updatingStage
    };
}
