import 'server-only';

import { cache } from 'react';
import { redirect } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase/server';
import type { Tables } from '@/types/database';
import { can, hasRole, type AppRole, type Permission } from './roles';

export type Profile = Tables<'profiles'>;

export interface Session {
    userId: string;
    email: string;
    profile: Profile;
    role: AppRole;
}

/**
 * The authenticated session for this request, or null.
 *
 * `cache()` deduplicates within a render pass, so a page and its five server
 * components share one profile query instead of issuing five — the failure mode of the
 * old `useAuth()` hook, which refetched per consumer.
 *
 * Uses `getUser()`, which verifies the JWT with the auth server. `getSession()` only
 * decodes the cookie and will happily return a forged payload.
 */
export const getSession = cache(async (): Promise<Session | null> => {
    const supabase = await createServerSupabase();

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) return null;

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

    // No profile row means the `handle_new_user` trigger has not run (or the schema is
    // not deployed). Deliberately no client-side fallback insert: the account's role is
    // the database's decision, never the browser's.
    if (error || !profile) return null;
    if (!profile.is_active) return null;

    return {
        userId: user.id,
        email: user.email ?? profile.email,
        profile,
        role: profile.role,
    };
});

/** For pages: guarantees a session or sends the visitor to sign-in. */
export async function requireSession(returnTo?: string): Promise<Session> {
    const session = await getSession();
    if (!session) {
        const target = returnTo ? `/sign-in?next=${encodeURIComponent(returnTo)}` : '/sign-in';
        redirect(target);
    }
    return session;
}

/** For pages: guarantees a session holding one of `allowed`. */
export async function requireRole(allowed: readonly AppRole[], returnTo?: string): Promise<Session> {
    const session = await requireSession(returnTo);
    if (!hasRole(session.role, allowed)) redirect('/dashboard?denied=1');
    return session;
}

/** For pages: guarantees a session holding `permission`. */
export async function requirePermission(permission: Permission, returnTo?: string): Promise<Session> {
    const session = await requireSession(returnTo);
    if (!can(session.role, permission)) redirect('/dashboard?denied=1');
    return session;
}
