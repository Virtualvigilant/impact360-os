'use client';

import { useState, useCallback, useEffect } from 'react';
import { supabaseClient } from '@/lib/supabase/client';
import { ProjectAssignment, Project } from '@/types/database.types';
import { toast } from 'sonner';

export type AssignmentWithProject = ProjectAssignment & {
    project: Project;
};

export function useProjects(userId?: string) {
    const [assignments, setAssignments] = useState<AssignmentWithProject[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAssignments = useCallback(async () => {
        if (!userId) {
            setLoading(false);
            return;
        }
        setLoading(true);
        const supabase = supabaseClient();

        try {
            const { data, error } = await supabase
                .from('project_assignments')
                .select(`
                    *,
                    project:projects(*)
                `)
                .eq('member_id', userId)
                .order('assigned_at', { ascending: false });

            if (error) throw error;

            if (data) {
                // Type assertion to handle potential join array wrapping
                const typedAssignments = data.map((item: any) => ({
                    ...item,
                    project: Array.isArray(item.project) ? item.project[0] : item.project
                })) as AssignmentWithProject[];
                setAssignments(typedAssignments);
            }
        } catch (error: any) {
            console.error('Error fetching assignments:', error);
            toast.error('Failed to fetch project assignments');
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchAssignments();
    }, [fetchAssignments]);

    return {
        assignments,
        loading,
        fetchAssignments
    };
}
