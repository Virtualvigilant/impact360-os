import 'server-only';

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/types/database';
import { supabaseEnv } from './env';

/**
 * Request-scoped server client. Reads and refreshes the session from cookies.
 *
 * Cookie writes throw when called from a Server Component (Next only permits them in
 * Server Actions and Route Handlers); `proxy.ts` refreshes the session for those
 * requests, so swallowing the write here is correct rather than a workaround.
 */
export async function createServerSupabase() {
    const cookieStore = await cookies();

    return createServerClient<Database>(
        supabaseEnv.NEXT_PUBLIC_SUPABASE_URL,
        supabaseEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            cookies: {
                getAll: () => cookieStore.getAll(),
                setAll(cookiesToSet) {
                    try {
                        for (const { name, value, options } of cookiesToSet) {
                            cookieStore.set(name, value, options);
                        }
                    } catch {
                        // Server Component render — proxy.ts owns the refresh.
                    }
                },
            },
        },
    );
}
