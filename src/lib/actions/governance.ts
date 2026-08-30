'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabase } from '@/lib/supabase/server';
import { assignRoleSchema, profileSchema } from '@/lib/validation/schemas';
import { action } from './helpers';

/**
 * Change someone's role.
 *
 * Delegates to the `public.assign_role` function rather than updating `profiles`
 * directly, so the elevation rules and the audit entry live in the database and hold
 * for every caller — the SQL editor and a future service included. The permission check
 * here only decides whether to offer the control.
 */
export async function assignRole(input: unknown) {
    return action({ permission: 'role:assign', schema: assignRoleSchema, input }, async (data, session) => {
        if (data.profile_id === session.userId) {
            throw new Error('You cannot change your own role.');
        }
        const supabase = await createServerSupabase();
        const { error } = await supabase.rpc('assign_role', {
            target_profile_id: data.profile_id,
            new_role: data.role,
            reason: data.reason,
        });
        if (error) throw error;
        revalidatePath('/dashboard/admin');
        return data.role;
    });
}

export async function updateOwnProfile(input: unknown) {
    return action({ schema: profileSchema, input }, async (data, session) => {
        const supabase = await createServerSupabase();
        // Note the absence of `role` and `is_active`: this action cannot reach them, and
        // the profiles trigger would reject them if it could.
        const { error } = await supabase
            .from('profiles')
            .update({
                full_name: data.full_name,
                phone: data.phone ?? null,
                timezone: data.timezone || 'Africa/Nairobi',
                locale: data.locale || 'en-KE',
                avatar_url: data.avatar_url ?? null,
            })
            .eq('id', session.userId);
        if (error) throw error;
        revalidatePath('/dashboard/profile');
        return true;
    });
}
